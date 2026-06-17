---
name: project-about-page
description: יוצר דף /about ציבורי לאתרים שסגורים לחלוטין אחרי Login — מכיל לוגו, שם המוצר ותיאור. נגיש ללא התחברות, לא מופיע בתפריט. משמש לזיהוי Google (SEO + OAuth Consent Screen).
version: 1.0.0
user-invocable: true
---

# דף About ציבורי

## למה הדף הזה קיים

אתרים שכולם סגורים אחרי Login נבלעים לגוגל — אין להם תוכן זחיל. הדף הזה פותר שתי בעיות:

1. **Google OAuth Consent Screen** — גוגל דורשת דף ציבורי עם שם האפליקציה כדי לאשר OAuth. ללא דף כזה — ה-login עם גוגל לא מאושר.
2. **Google Search / Discoverability** — דף ציבורי עם structured data מאפשר לגוגל להבין מהו המוצר.

הדף **לא מופיע בתפריט**. גישה ישירה ב-URL בלבד (`/about`).

---

## שלב 1 — אסוף מידע

| שדה | דוגמה |
|-----|-------|
| שם החברה | "מסלולית בע״מ" |
| שם המוצר | "מסלולית — מערכת ניהול שיעורים" |
| תיאור קצר (1-2 משפטים) | "מערכת ניהול מקצועית לעסקי תנועה ורקוד. ניהול תלמידים, שיעורים ותשלומים במקום אחד." |
| נתיב ללוגו | `/logo.png` או נתיב אחר |
| כתובת אתר | `https://app.example.co.il` |
| אימייל ליצירת קשר | `info@example.co.il` |
| כתובת פיזית (אופציונלי) | |

---

## שלב 2 — צור prompt ל-Claude Code

```
Build a public /about page for this project.

## Read first
- CLAUDE.md
- src/App.tsx (or main router file)
- public/ directory (for logo path)
- index.html (for existing meta tags)

## Constraints
- Page must be accessible WITHOUT login — add route before any auth guard
- Do NOT add to navigation menu
- RTL Hebrew
- Clean, minimal layout — not a marketing page. Just identity.
- No animations, no complex UI.

## Part 1: AboutPage component

File: src/pages/AboutPage.tsx (or equivalent)

Content:
- Company/product logo (img tag with alt text)
- Product name as h1
- 1-2 sentence description
- Contact email (as mailto link)
- Small "© [year] [company name]" footer line

Style: centered content, max-width 600px, plenty of whitespace. Match the site's base font and color.

## Part 2: Add /about route

In the router, BEFORE any auth guard:
<Route path="/about" element={<AboutPage />} />

## Part 3: SEO meta tags

In the /about page (or update index.html if using a single <head>):

```html
<title>[Product name]</title>
<meta name="description" content="[2-sentence description]" />
<meta property="og:title" content="[Product name]" />
<meta property="og:description" content="[description]" />
<meta property="og:type" content="website" />
<meta property="og:url" content="[site URL]/about" />
<meta property="og:image" content="[site URL]/logo.png" />
```

If the project uses react-helmet or a similar library, use it. Otherwise add to the HTML head directly.

## Part 4: JSON-LD structured data

Add to the /about page:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "[Company name]",
  "url": "[site URL]",
  "logo": "[site URL]/logo.png",
  "description": "[description]",
  "contactPoint": {
    "@type": "ContactPoint",
    "email": "[contact email]",
    "contactType": "customer service"
  }
}
</script>
```

## Verification
1. `npm run typecheck` zero errors
2. `npm run build` completes
3. Manual:
   a. /about loads WITHOUT being logged in — no redirect to login
   b. Logo displays correctly
   c. Page title in browser tab shows product name
   d. View source: JSON-LD script block is present
   e. /about does NOT appear in the main navigation menu

Branch: feature/about-page
```

---

## קשר ל-Google OAuth Consent Screen

כשמגדירים Google OAuth לפרויקט, הדף `/about` הוא ה-**Homepage** שגוגל דורשת.
ראי גם: תהליך ה-OAuth Verification המפורט ב-CLAUDE.md של הפרויקט (לאחר הגדרה).

תנאים לאישור OAuth:
- ✅ דף ציבורי עם שם האפליקציה בכותרת (`<h1>`)
- ✅ Privacy Policy בדומיין שלך → `/privacy`
- ✅ Terms of Service בדומיין שלך → `/terms`
- ✅ הדומיין מאומת ב-Google Search Console

---

## עדכון CHANGELOG

תחת `[Unreleased] → ### נוסף`:
- "דף about ציבורי לזיהוי Google (/about)"
