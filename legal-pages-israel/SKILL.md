---
name: legal-pages-israel
description: יוצר דפי מדיניות פרטיות ותנאי שימוש לאתרים ישראליים — מערכות פנימיות, שירותים ופורטלים (לא איקומרס). דפים בעברית, בהתאם לחוק הגנת הפרטיות הישראלי ו-GDPR. הפעל בכל פרויקט לקוח חדש.
version: 1.0.0
user-invocable: true
---

# דפים משפטיים — ישראל

## מה הסקיל יוצר

- `/privacy` — מדיניות פרטיות (Privacy Policy)
- `/terms` — תנאי שימוש (Terms of Service)

שניהם: דפים React, RTL, עברית, נגישים ללא התחברות, לא מופיעים בתפריט הראשי.

---

## שלב 1 — אסוף מידע לפני הבנייה

שאל את הלקוח (או מצא ב-CLAUDE.md):

| שדה | דוגמה |
|-----|-------|
| שם החברה / העסק | "מסלולית בע״מ" |
| שם המוצר / האתר | "מסלולית — מערכת ניהול" |
| כתובת אימייל ליצירת קשר | privacy@example.co.il |
| כתובת פיזית (אופציונלי) | "רחוב הרצל 1, תל אביב" |
| האם האתר אוסף עוגיות? | כן / לא |
| האם משתף נתונים עם צד שלישי? | Brevo לשליחת מיילים, Google Analytics וכד׳ |

---

## שלב 2 — צור prompt ל-Claude Code

```
Build legal pages: Privacy Policy and Terms of Service.

## Read first
- CLAUDE.md
- src/App.tsx (or main router file)
- src/pages/ (existing pages for layout reference)

## Constraints
- RTL Hebrew throughout
- Both pages accessible without login — add routes BEFORE any auth guard
- Do NOT add to the main navigation menu
- Use existing layout/typography — match the site's visual style
- Last updated date: [תאריך היום]

## Part 1: Privacy Policy at /privacy

Business name: [שם החברה]
Product name: [שם המוצר]
Contact email: [אימייל]

Content structure:
1. מי אנחנו — שם, תיאור, כתובת ליצירת קשר
2. איזה מידע אנחנו אוספים — נתוני הרשמה (שם, אימייל), נתוני שימוש, עוגיות
3. למה אנחנו משתמשים במידע — הפעלת השירות, שליחת עדכונים, שיפור המוצר
4. שיתוף עם צדדים שלישיים — [רשום שירותים: Brevo, Vercel, Supabase וכד׳]
5. אבטחת מידע — הצפנה, גישה מוגבלת
6. זכויות המשתמש — גישה, תיקון, מחיקה לפי חוק הגנת הפרטיות תשמ"א-1981
7. עוגיות — [אם רלוונטי]
8. שינויים במדיניות — הודעה בעדכון
9. יצירת קשר — [אימייל]

Legal basis: Israeli Privacy Protection Law 5741-1981 + GDPR (where applicable)

## Part 2: Terms of Service at /terms

Content structure:
1. קבלת התנאים — שימוש = הסכמה
2. תיאור השירות — מה המערכת עושה
3. חשבון משתמש — אחריות על סיסמה, דיוק המידע
4. הגבלות שימוש — אסור: פריצה, שימוש מסחרי לא מורשה, פגיעה בפרטיות אחרים
5. קניין רוחני — זכויות שמורות ל[שם החברה]
6. הגבלת אחריות — השירות ניתן "כמות שהוא", ללא אחריות לנזקים עקיפים
7. שינויים בשירות — זכות לשנות / להפסיק
8. דין חל — דין מדינת ישראל, סמכות שיפוט — בתי המשפט בישראל
9. יצירת קשר — [אימייל]

## Part 3: Add routes

In the router (App.tsx or equivalent), add BEFORE any auth guard:
<Route path="/privacy" element={<PrivacyPage />} />
<Route path="/terms" element={<TermsPage />} />

## Part 4: Footer links (optional)

If the project has a footer, add small links to /privacy and /terms.
If there is no footer, skip this step.

## Verification
1. `npm run typecheck` zero errors
2. `npm run build` completes
3. Manual:
   a. /privacy loads without login — no redirect
   b. /terms loads without login — no redirect
   c. Both pages are RTL and readable
   d. Contact email is correct
   e. Company name appears correctly throughout

Branch: feature/legal-pages
```

---

## עדכון CHANGELOG

תחת `[Unreleased] → ### נוסף`:
- "דף מדיניות פרטיות (/privacy)"
- "דף תנאי שימוש (/terms)"
