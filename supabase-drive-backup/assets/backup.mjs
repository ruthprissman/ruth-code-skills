// Daily Supabase → Google Drive backup.
//
// Produces two artifacts and uploads them to a Google Drive folder:
//   1. <prefix>_<date>.xlsx     — one worksheet per public table (human-readable)
//   2. <prefix>_<date>.sql.gz   — full pg_dump of schema public (the restorable file)
//
// Then deletes any backup it previously created in that folder older than
// RETENTION_DAYS (default 14).
//
// Auth: Google OAuth2 refresh token (scope drive.file) — files are owned by the
// user and count against their 15GB quota. See SKILL.md for one-time setup.
//
// Required env (set as GitHub Secrets, see .github/workflows/backup.yml):
//   SUPABASE_DB_URL        — Supabase **Session pooler** connection URI (port 5432)
//   GOOGLE_CLIENT_ID
//   GOOGLE_CLIENT_SECRET
//   GOOGLE_REFRESH_TOKEN
//   GDRIVE_FOLDER_ID       — id of the Drive folder to upload into
// Optional env:
//   RETENTION_DAYS         — default 14
//   BACKUP_PREFIX          — default "project-backup"

import { spawnSync } from "node:child_process";
import { createWriteStream } from "node:fs";
import { readFile, stat, unlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { createGzip } from "node:zlib";
import { pipeline } from "node:stream/promises";
import pg from "pg";
import Cursor from "pg-cursor";
import ExcelJS from "exceljs";

const {
  SUPABASE_DB_URL,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REFRESH_TOKEN,
  GDRIVE_FOLDER_ID,
  RETENTION_DAYS = "14",
  BACKUP_PREFIX = "project-backup",
} = process.env;

function requireEnv() {
  const missing = [
    "SUPABASE_DB_URL",
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET",
    "GOOGLE_REFRESH_TOKEN",
    "GDRIVE_FOLDER_ID",
  ].filter((k) => !process.env[k]);
  if (missing.length) {
    console.error(`Missing required env vars: ${missing.join(", ")}`);
    process.exit(1);
  }
}

const log = (...a) => console.log(new Date().toISOString(), ...a);

// Excel cell limit; leave headroom.
const MAX_CELL = 32000;

function dateStamp() {
  // YYYY-MM-DD in UTC, safe for filenames and sorting.
  return new Date().toISOString().slice(0, 10);
}

// ---- Excel: one sheet per public table -------------------------------------

function cellValue(v) {
  if (v === null || v === undefined) return null;
  if (v instanceof Date) return v;
  if (typeof v === "object") {
    let s;
    if (Buffer.isBuffer(v)) s = `\\x${v.toString("hex")}`;
    else s = JSON.stringify(v);
    return s.length > MAX_CELL ? s.slice(0, MAX_CELL) + "…(truncated)" : s;
  }
  if (typeof v === "string" && v.length > MAX_CELL) {
    return v.slice(0, MAX_CELL) + "…(truncated)";
  }
  return v;
}

function sanitizeSheetName(name, used) {
  // Excel: max 31 chars, none of []:*?/\ , can't be blank.
  let s = name.replace(/[[\]:*?/\\]/g, "_").slice(0, 31) || "sheet";
  let candidate = s;
  let i = 2;
  while (used.has(candidate.toLowerCase())) {
    const suffix = `_${i++}`;
    candidate = s.slice(0, 31 - suffix.length) + suffix;
  }
  used.add(candidate.toLowerCase());
  return candidate;
}

async function buildExcel(client, outPath) {
  const { rows: tables } = await client.query(
    `select table_name
       from information_schema.tables
      where table_schema = 'public' and table_type = 'BASE TABLE'
      order by table_name`,
  );
  log(`Found ${tables.length} tables in public schema`);

  const wb = new ExcelJS.stream.xlsx.WorkbookWriter({ filename: outPath });
  const usedNames = new Set();

  for (const { table_name } of tables) {
    const { rows: cols } = await client.query(
      `select column_name
         from information_schema.columns
        where table_schema = 'public' and table_name = $1
        order by ordinal_position`,
      [table_name],
    );
    const columnNames = cols.map((c) => c.column_name);

    const ws = wb.addWorksheet(sanitizeSheetName(table_name, usedNames));
    ws.addRow(columnNames).commit();

    const cursor = client.query(new Cursor(`select * from "${table_name}"`));
    let total = 0;
    for (;;) {
      const batch = await readCursor(cursor, 500);
      if (batch.length === 0) break;
      for (const row of batch) {
        ws.addRow(columnNames.map((c) => cellValue(row[c]))).commit();
      }
      total += batch.length;
    }
    await new Promise((res, rej) => cursor.close((e) => (e ? rej(e) : res())));
    ws.commit();
    log(`  • ${table_name}: ${total} rows`);
  }

  await wb.commit();
}

function readCursor(cursor, n) {
  return new Promise((resolve, reject) => {
    cursor.read(n, (err, rows) => (err ? reject(err) : resolve(rows)));
  });
}

// ---- pg_dump → gzip --------------------------------------------------------

async function buildSqlDump(dbUrl, outPath) {
  const u = new URL(dbUrl);
  const env = {
    ...process.env,
    PGHOST: u.hostname,
    PGPORT: u.port || "5432",
    PGUSER: decodeURIComponent(u.username),
    PGPASSWORD: decodeURIComponent(u.password),
    PGDATABASE: u.pathname.replace(/^\//, "") || "postgres",
  };
  const sslmode = u.searchParams.get("sslmode") || "require";
  env.PGSSLMODE = sslmode;

  log("Running pg_dump…");
  const dump = spawnSync(
    "pg_dump",
    ["--no-owner", "--no-privileges", "--no-acl", "--schema=public"],
    { env, maxBuffer: 1024 * 1024 * 1024 },
  );
  if (dump.status !== 0) {
    const err = dump.stderr ? dump.stderr.toString() : "(no stderr)";
    throw new Error(`pg_dump failed (exit ${dump.status}): ${err}`);
  }
  const gzip = createGzip({ level: 9 });
  const out = createWriteStream(outPath);
  gzip.end(dump.stdout);
  await pipeline(gzip, out);
  log(`pg_dump written: ${outPath}`);
}

// ---- Google Drive (REST, no SDK) ------------------------------------------

async function getAccessToken() {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      refresh_token: GOOGLE_REFRESH_TOKEN,
      grant_type: "refresh_token",
    }),
  });
  if (!res.ok) {
    throw new Error(`Token refresh failed: ${res.status} ${await res.text()}`);
  }
  return (await res.json()).access_token;
}

async function uploadFile(token, filePath, mimeType) {
  const name = path.basename(filePath);
  const data = await readFile(filePath);
  const metadata = { name, parents: [GDRIVE_FOLDER_ID] };

  const boundary = "===============boundary" + Date.now();
  const body = Buffer.concat([
    Buffer.from(
      `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n` +
        JSON.stringify(metadata) +
        `\r\n--${boundary}\r\nContent-Type: ${mimeType}\r\n\r\n`,
    ),
    data,
    Buffer.from(`\r\n--${boundary}--\r\n`),
  ]);

  const res = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,size",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": `multipart/related; boundary=${boundary}`,
      },
      body,
    },
  );
  if (!res.ok) {
    throw new Error(`Upload failed for ${name}: ${res.status} ${await res.text()}`);
  }
  const json = await res.json();
  log(`Uploaded ${json.name} (id ${json.id})`);
}

async function deleteOldBackups(token) {
  const days = parseInt(RETENTION_DAYS, 10);
  if (!Number.isFinite(days) || days <= 0) {
    log("RETENTION_DAYS not positive — skipping cleanup");
    return;
  }
  const cutoff = new Date(Date.now() - days * 86400_000).toISOString();
  const q = [
    `'${GDRIVE_FOLDER_ID}' in parents`,
    `createdTime < '${cutoff}'`,
    "trashed = false",
  ].join(" and ");
  const url =
    "https://www.googleapis.com/drive/v3/files?" +
    new URLSearchParams({
      q,
      fields: "files(id,name,createdTime)",
      pageSize: "1000",
    });
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) {
    throw new Error(`List for cleanup failed: ${res.status} ${await res.text()}`);
  }
  const { files = [] } = await res.json();
  log(`Cleanup: ${files.length} file(s) older than ${days} days`);
  for (const f of files) {
    const del = await fetch(
      `https://www.googleapis.com/drive/v3/files/${f.id}`,
      { method: "DELETE", headers: { Authorization: `Bearer ${token}` } },
    );
    if (del.ok || del.status === 204) log(`  deleted ${f.name} (${f.createdTime})`);
    else log(`  WARN failed to delete ${f.name}: ${del.status}`);
  }
}

// ---- main ------------------------------------------------------------------

async function main() {
  requireEnv();
  const stamp = dateStamp();
  const xlsxPath = path.join(tmpdir(), `${BACKUP_PREFIX}_${stamp}.xlsx`);
  const sqlPath = path.join(tmpdir(), `${BACKUP_PREFIX}_${stamp}.sql.gz`);

  const client = new pg.Client({
    connectionString: SUPABASE_DB_URL,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  log("Connected to database");

  try {
    await buildExcel(client, xlsxPath);
  } finally {
    await client.end();
  }

  await buildSqlDump(SUPABASE_DB_URL, sqlPath);

  const xlsxSize = (await stat(xlsxPath)).size;
  const sqlSize = (await stat(sqlPath)).size;
  log(`Artifacts: xlsx ${(xlsxSize / 1024).toFixed(0)}KB, sql.gz ${(sqlSize / 1024).toFixed(0)}KB`);

  const token = await getAccessToken();
  await uploadFile(
    token,
    xlsxPath,
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  );
  await uploadFile(token, sqlPath, "application/gzip");
  await deleteOldBackups(token);

  await Promise.allSettled([unlink(xlsxPath), unlink(sqlPath)]);
  log("Backup complete ✓");
}

main().catch((err) => {
  console.error("Backup FAILED:", err);
  process.exit(1);
});
