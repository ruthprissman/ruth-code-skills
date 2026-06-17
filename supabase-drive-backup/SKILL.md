---
name: supabase-drive-backup
description: מגדיר גיבוי יומי אוטומטי של DB מ-Supabase ל-Google Drive — קובץ Excel (גיליון לכל טבלה) + pg_dump דחוס, עם מחיקת גיבויים ישנים. הפעל בכל פרויקט לקוח כשרוצים להגן מפני אובדן נתונים (חשוב במיוחד ב-free tier שאין לו גיבויים מובנים).
version: 1.0.0
user-invocable: true
---

# Supabase → Google Drive — גיבוי יומי

שני קבצים לכל ריצה, מועלים לתיקיית Drive:

- `<prefix>_<date>.xlsx` — גיליון אחד לכל טבלה בסכמת public (קריא לאדם)
- `<prefix>_<date>.sql.gz` — pg_dump מלא לסכמת public (ניתן לשחזור)

גיבויים ישנים מעבר ל-`RETENTION_DAYS` (ברירת מחדל: 14) נמחקים בכל ריצה.

---

## קבצים בסקיל (assets/)

| קובץ | לאן להעתיק בריפו |
|------|-----------------|
| `backup.mjs` | `scripts/backup/backup.mjs` |
| `package.json` | `scripts/backup/package.json` |
| `get-refresh-token.mjs` | `scripts/backup/get-refresh-token.mjs` |
| `backup.workflow.yml` | `.github/workflows/backup.yml` |

העתק את הקבצים ואז עקוב אחר השלבים. הסקריפט קורא הכל מ-env / GitHub Secrets.

---

## ⚠ קרא את האזהרות האלה לפני הכל — כל אחת עלתה שעות

1. **רול read-only עם RLS מחזיר 0 שורות ונקרס.**
   רול מוגבל (`backup_reader`) כפוף ל-RLS ולכן מחזיר 0 שורות מכל טבלה, ואז נקרס עם שגיאת `42501`.
   **פתרון:** `ALTER ROLE backup_reader BYPASSRLS;` (נשאר read-only) — אם זה נכשל, השתמש ב-`postgres` (owner ו-bypass RLS נטיבי). תמיד ודא שה-log מציג **row counts אמיתיים, לא `0 rows`**.

2. **השתמש ב-Session pooler, לא ב-Direct connection.**
   GitHub runners הם IPv4-only. Direct connection של Supabase ב-free tier הוא IPv6 בלבד.
   השתמש ב-**Connect → Session pooler** (פורט **5432** — תומך ב-pg_dump; פורט 6543 לא תומך).
   **העתק את ה-host בדיוק מה-dashboard** — אל תנחש את האזור.

3. **Google refresh tokens פגים אחרי 7 ימים כשה-OAuth app ב-"Testing".**
   ב-Google Cloud → OAuth consent screen, שנה את ה-publishing status ל-**"In production"**.
   הסקופ `drive.file` אינו sensitive ולא דורש verification של גוגל.

4. **גרסת pg_dump חייבת להיות ≥ גרסת השרת.**
   ה-workflow מתקין `postgresql-client-17`. אם Supabase על גרסה חדשה יותר — עדכן.

5. **Secrets דורש Admin בריפו; cron רץ רק מ-default branch.**
   Actions Secrets נגיש רק ל-Admin. `schedule:` cron רץ רק מ-`main` — ה-workflow חייב להיות ממוזג ל-main.

6. **Drive account ≠ account של ה-agent.**
   התיקייה חייבת להיות ב-Google account של הלקוח, ו-refresh token חייב להיות של אותו account.

7. **ריפו מועתק (mirrored) מריץ את ה-cron פעמיים — הגרסה ללא secrets נכשלת.**
   אם הפרויקט מועלה ליותר מ-remote אחד ב-GitHub (למשל Lovable), ה-workflow קיים בשני הריפוים.
   **פתרון:** הוסף `if: github.repository == 'OWNER/REPO'` ל-job (ודא קודם *באיזה ריפו* הריצה הנכשלת רצה).

---

## שלב 1 — הוסף קבצים לריפו

העתק את 4 הקבצים לנתיבים בטבלה למעלה. ערוך `BACKUP_PREFIX` ב-workflow לשם הפרויקט.
Commit ו-merge ל-**default branch (main)** של ריפו שיש לך בו **Admin**.

## שלב 2 — Supabase: רול read-only לגיבוי

ב-Supabase → SQL Editor (בחר סיסמה חזקה, alphanumeric):

```sql
create role backup_reader with login password 'STRONG_ALNUM_PASSWORD';
grant usage on schema public to backup_reader;
grant select on all tables in schema public to backup_reader;
alter default privileges in schema public grant select on tables to backup_reader;
alter role backup_reader bypassrls;   -- חובה, אחרת הגיבויים ריקים (אזהרה #1)
```

אם `bypassrls` נכשל — השתמש ב-`postgres` user במקום `backup_reader`.

בנה `SUPABASE_DB_URL` מ-**Connect → Session pooler**:

```
postgresql://backup_reader.<project-ref>:<password>@<exact-pooler-host>:5432/postgres
```

## שלב 3 — תיקיית Google Drive

ב-Google Drive של **account היעד**, צור תיקייה. העתק את ה-id מה-URL (`/folders/<GDRIVE_FOLDER_ID>`).

## שלב 4 — Google OAuth (Desktop client + refresh token)

1. Google Cloud Console → פרויקט → **Enable Google Drive API**.
2. **OAuth consent screen** → External → הוסף את account היעד כ-**Test user** → **Publish app / In production** (אזהרה #3).
3. **Credentials → Create OAuth client ID → Desktop app** → שמור Client ID + Client Secret.

**קבלת refresh token — flow ידני (כשאין אפשרות להריץ שרת מקומי):**

1. בקש מהמשתמש לפתוח את ה-URL הזה (מחובר ל-Google account היעד):
   ```
   https://accounts.google.com/o/oauth2/v2/auth?client_id=<CLIENT_ID>&redirect_uri=http%3A%2F%2Flocalhost%3A53682&response_type=code&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fdrive.file&access_type=offline&prompt=consent
   ```
2. לאחר אישור, הדפדפן יציג **`ERR_CONNECTION_REFUSED`** — זה צפוי. ה-code נמצא בשורת ה-URL (`?...&code=4/0A...`). בקש מהמשתמש להדביק את **כל** שורת ה-URL.
3. המר את ה-code ל-refresh token:
   ```bash
   curl -s -X POST https://oauth2.googleapis.com/token \
     --data-urlencode "code=<CODE>" \
     --data-urlencode "client_id=<CLIENT_ID>" \
     --data-urlencode "client_secret=<CLIENT_SECRET>" \
     --data-urlencode "redirect_uri=http://localhost:53682" \
     --data-urlencode "grant_type=authorization_code"
   ```
   `refresh_token` מה-JSON הוא `GOOGLE_REFRESH_TOKEN`.
   אם קיבלת `invalid_grant` — ה-code כבר נוצל או פג תוקף. בצע את ה-flow מחדש.

לחלופין: אם יש אפשרות להריץ node מקומית, השתמש ב-`get-refresh-token.mjs` (מריץ שרת localhost, לוכד את ה-code אוטומטית).

## שלב 5 — GitHub Secrets

Settings → Secrets and variables → Actions → הוסף בדיוק:
`SUPABASE_DB_URL`, `GDRIVE_FOLDER_ID`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN`

שמות case-sensitive, ללא רווחים מסביב.

## שלב 6 — אימות end-to-end

לפני שסומכים, ודא את pipeline ה-OAuth + Drive:

```bash
AT=$(curl -s -X POST https://oauth2.googleapis.com/token \
  --data-urlencode "client_id=$CID" --data-urlencode "client_secret=$CSEC" \
  --data-urlencode "refresh_token=$RT" --data-urlencode "grant_type=refresh_token" \
  | python3 -c "import sys,json;print(json.load(sys.stdin)['access_token'])")
```

לאחר מכן הרץ את ה-workflow ידנית: **Actions → backup workflow → Run workflow**.
ודא: ריצה ירוקה, **row counts אמיתיים (לא `0 rows`)**, שני קבצים בתיקיית Drive.

---

## שחזור

- **`.xlsx`** = חיפוש נתונים; **`.sql.gz`** = השחזור האמיתי.
- **כמה שורות חסרות:** מצא ב-Excel ו-INSERT ידנית.
- **שחזור מלא:**
  ```bash
  # הורד את הקובץ החדש ביותר, פרוס, ואז:
  psql "postgresql://postgres.<ref>:<pwd>@<pooler-host>:5432/postgres" -f backup_DATE.sql
  ```
  לתוך DB **ריק**. מכסה את כל `public` (data + functions + triggers + RLS). **לא** מכסה את `auth` (חשבונות משתמשים).

---

## ניקוי אבטחה

כל secret שעבר דרך הצ'אט (סיסמת DB, client secret, refresh token) — כדאי לרוטט אחרי ההגדרה:
- אפס סיסמת DB/role
- צור מחדש OAuth client secret
- מנה מחדש refresh token

הרדיוס נמוך (רול read-only / סקופ `drive.file`) אבל הרוטציה סוגרת את הלופ.
