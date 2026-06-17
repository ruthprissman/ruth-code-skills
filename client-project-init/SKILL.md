---
name: client-project-init
description: צ'קליסט מלא לפתיחת פרויקט לקוח חדש — מאפיון ועד פריסה. מפעיל את כל הסקילים הנדרשים לפי הסדר. הפעל בתחילת כל פרויקט לקוח חדש.
version: 1.0.0
user-invocable: true
---

# Client Project Init — צ'קליסט פרויקט לקוח חדש

## לפני שמתחילים — אסוף מידע

שאל את רות (אם לא כתוב ב-CLAUDE.md):

| שדה | ערך |
|-----|-----|
| שם הפרויקט | |
| שם החברה / הלקוח | |
| שם המוצר (לדפים ציבוריים) | |
| אימייל ליצירת קשר | |
| האם יש Google Login? | כן / לא |
| האם מדובר ב-free tier Supabase? | כן / לא |
| שפת UI | עברית / אנגלית / דו-לשוני |
| Brevo לשליחת מיילים? | כן / לא |

---

## צ'קליסט מסודר

### שלב 1 — אפיון
- [ ] כתוב spec מלא: סקירה כללית, מודל נתונים, זרימות, חלוקה לפאזות, שאלות פתוחות
- [ ] אמת עם הלקוח לפני שמתחילים לבנות
- [ ] צור `CLAUDE.md` בשורש הפרויקט עם: stack, ארכיטקטורה, "Do Not Break", Gotchas

**תבנית CLAUDE.md ראשונית:**
```markdown
# [שם פרויקט] — CLAUDE.md

## Critical rules
- Update CHANGELOG.md in every PR to main
- RTL Hebrew throughout
- service-role key: server-side only, never NEXT_PUBLIC_ / VITE_

## Stack
- Framework: React + Vite (or Next.js — confirm from code)
- Styling: Tailwind + shadcn/ui
- DB: Supabase (project ref: XXX)
- Hosting: Vercel
- Email: Brevo

## Architecture
[להשלים]

## Do Not Break
[להשלים לפי מה שחי בפרודקשן]

## Gotchas
[להצטבר לאורך הפרויקט]
```

---

### שלב 2 — הגדרת הפרויקט
- [ ] צור ריפו ב-GitHub עם `.gitignore` שמחריג `.env*.local`, `node_modules`, בינאריים
- [ ] ודא שאין secrets ב-git לפני commit ראשון
- [ ] חבר Vercel → auto-deploy על main, preview deployments על branches
- [ ] הגדר env vars ב-Vercel (runtime secrets: בלי `NEXT_PUBLIC_` / `VITE_`)
  - ⚠️ ב-Vercel: סודות runtime — השתמש ב-`printf '%s' "$val" | vercel env add` ולא ב-PowerShell pipe (מוסיף newline ששובר JWT)
- [ ] הגדר `CHANGELOG.md` בשורש עם מבנה [Keep a Changelog]

---

### שלב 3 — DB ובסיס
- [ ] הגדר Supabase: טבלאות, RLS, types (`supabase gen types typescript`)
- [ ] מספור מיגרציות: רציף, NN_slug.sql
- [ ] ודא שיש `is_admin()` function אם האתר כולל אדמין

---

### שלב 4 — לוגים
- [ ] הפעל `/supabase-logging`
  - יוצר: טבלת `system_logs` + `log_event()` + דף `/admin/logs`

---

### שלב 5 — נגישות
- [ ] הפעל `/israeli-accessibility-compliance`
  - נגישות מלאה לפי IS 5568 + תוסף נגישות מותאם

---

### שלב 6 — דפים משפטיים
- [ ] הפעל `/legal-pages-israel`
  - יוצר: `/privacy` + `/terms`

---

### שלב 7 — דף About ציבורי
- [ ] הפעל `/project-about-page`
  - יוצר: `/about` — נגיש ללא login, לזיהוי Google
  - **חובה** אם יש Google OAuth (ראי שלב 10)

---

### שלב 8 — שמירת Supabase חי
- [ ] הפעל `/supabase-keep-alive`
  - רלוונטי רק אם Supabase ב-free tier

---

### שלב 9 — גיבוי DB
- [ ] הפעל `/supabase-drive-backup`
  - מגדיר גיבוי יומי ל-Google Drive (Excel + pg_dump)
  - ⚠️ קרא את הגוצ'ות לפני ההגדרה (RLS, pooler, OAuth publishing status)

---

### שלב 10 — Google OAuth (אם יש Google Login)
- [ ] Google Cloud Console → צור פרויקט → Enable Google Identity API
- [ ] OAuth consent screen → External → App name = שם המוצר (זהה ל-h1 ב-/about)
- [ ] Authorized domains: root domain בלבד (`example.co.il`, לא `app.example.co.il`)
- [ ] Homepage: `https://app.example.co.il/about`
- [ ] Privacy Policy: `https://app.example.co.il/privacy`
- [ ] Terms of Service: `https://app.example.co.il/terms`
- [ ] Publish: שנה status ל-"In production" (חובה — אחרת token פג ב-7 ימים)
- [ ] הגדר domain ב-Google Search Console ואמת ownership
- [ ] שלח לVerification — המתן 24-48 שעות

**מלכודות OAuth:**
- ❌ drive.google.com לא מתקבל כ-Authorized domain
- ❌ Subdomain לא תקין ב-Authorized domains — רק root domain
- ❌ Testing mode = מוגבל ל-100 משתמשים
- ❌ Internal mode = רק ל-Google Workspace organizations

---

### שלב 11 — גרסאות ודף Version
- [ ] ב-CHANGELOG.md: הוסף גרסה ראשונה `[1.0.0] — YYYY-MM-DD` עם רשימת פיצ'רים
- [ ] צור דף `/version` באפליקציה שמציג את CHANGELOG.md
  - לא מופיע בתפריט — גישה ישירה ב-URL
  - כולל: מספר גרסה, תאריך, רשימת שינויים מ-CHANGELOG
- [ ] **כל PR ל-main**: חייב לכלול עדכון ל-CHANGELOG תחת `[Unreleased]`

**תבנית CHANGELOG:**
```markdown
# יומן שינויים

## [Unreleased]

### נוסף
- (פריטים שטרם שוחררו)

## [1.0.0] — 2026-MM-DD

### תכונות
- [פיצ'ר 1]
- [פיצ'ר 2]
```

---

### שלב 12 — לפני הפריסה הראשונה
- [ ] `npm run typecheck` — אפס שגיאות
- [ ] `npm run build` — מסתיים
- [ ] `npx supabase db push --linked` — מיגרציות רצות בפרודקשן
- [ ] ודא שכל env vars קיימים ב-Vercel
- [ ] בדיקת smoke test על preview URL לפני merge ל-main
- [ ] ודא שדפי /privacy, /terms, /about נגישים ללא login

---

## זרימת Git/PR (תמצית)

| פעולה | מה עושים |
|-------|---------|
| feature חדש | branch: `feature/xxx` |
| תיקון | branch: `fix/xxx` |
| תחזוקה | branch: `chore/xxx` |
| לפני PR | typecheck + build + db push (אם יש migration) |
| כל PR | עדכון CHANGELOG תחת [Unreleased] |
| אחרי merge | Vercel deploy אוטומטי; Edge Functions = deploy ידני |

---

## עדכון עצמי של הסקיל

**בסוף כל פרויקט**, שאל את רות:
> "בפרויקט הזה נתקלנו במשהו שלא כוסה בצ'קליסט? הוספה / שינוי / מלכודת חדשה?"

אם כן — עדכן את הקובץ `~/.claude/skills/client-project-init/SKILL.md` בהתאם.
אם למדנו משהו שרלוונטי לסקיל אחר (גיבוי, לוגים, נגישות) — עדכן אותו גם.
