---
name: supabase-logging
description: מוסיף מערכת לוגים לפרויקט Supabase — טבלת system_logs + פונקציית log_event() לשימוש מקוד ו-Edge Functions + דף /admin/logs באזור הניהול עם סינון ו-pagination. הפעל בכל פרויקט לקוח חדש.
version: 1.0.0
user-invocable: true
---

# מערכת לוגים — Supabase + Admin Page

## מה הסקיל יוצר

1. מיגרציה SQL: טבלת `system_logs` עם RLS (אדמין בלבד)
2. פונקציית `log_event()` — לשימוש מקל מכל מקום בקוד
3. דף `/admin/logs` — טבלה, סינון לפי סוג/תאריך/משתמש, pagination

---

## שלב 1 — מיגרציה

קרא את `assets/migration.sql` והתאם את מספר המיגרציה לרצף הפרויקט.
צור את קובץ המיגרציה ב-`supabase/migrations/NN_system_logs.sql`.

**הנחות מוקדמות:**
- פונקציית `is_admin()` קיימת בפרויקט. אם לא — הוסף אותה לפני המיגרציה:
  ```sql
  create or replace function public.is_admin()
  returns boolean language sql security definer set search_path = public stable
  as $$
    select exists (
      select 1 from public.user_profiles
      where user_id = auth.uid() and role = 'admin'
    );
  $$;
  ```
  (התאם לפי מבנה הטבלה בפרויקט הספציפי)

---

## שלב 2 — שימוש בקוד

### מ-React (client-side)
```typescript
import { supabase } from '@/lib/supabase'

// רישום אירוע פשוט
await supabase.rpc('log_event', {
  p_event_type: 'user_login',
  p_metadata: { method: 'email' }
})

// אירועי לוג מומלצים לתיעוד:
// 'user_login' | 'user_logout' | 'record_created' | 'record_updated'
// 'record_deleted' | 'email_sent' | 'export_generated' | 'error'
// 'admin_action' | 'permission_denied'
```

### מ-Edge Function (server-side)
```typescript
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

await supabase.rpc('log_event', {
  p_event_type: 'email_sent',
  p_metadata: { recipient: email, template: 'welcome' }
})
```

---

## שלב 3 — דף ניהול לוגים

צור prompt ל-Claude Code לבנות את דף הלוגים:

```
Build an admin logs page at /admin/logs.

## Read first
- supabase/migrations/NN_system_logs.sql
- src/lib/supabase.ts (or wherever the supabase client is)
- src/pages/admin/ (existing admin pages for layout reference)
- CLAUDE.md

## Constraints
- Admin only — redirect non-admins to /
- RTL Hebrew throughout
- Use shadcn/ui: Table, Select, Input, Button, Badge, Pagination
- Tailwind for styling, match existing admin page style

## The page should include

### Filter bar (top)
- Event type dropdown — "כל הסוגים" + list of distinct values from system_logs
- Date range: from/to date pickers (or simple "last 7 / 30 / 90 days" buttons)
- User search: free text (searches user_id or metadata->>'email' if present)
- "נקה סינון" button

### Log table
Columns:
- תאריך ושעה — formatted in Hebrew locale (dd/MM/yyyy HH:mm:ss)
- סוג אירוע — colored Badge per event category:
    errors → red, login/logout → blue, created/updated/deleted → green/yellow/orange,
    email → purple, other → gray
- משתמש — user email if available in metadata, otherwise user_id (truncated)
- פרטים — first 80 chars of metadata JSON; click row to expand full metadata in a modal or collapsible

### Pagination
- 25 rows per page
- Show total count: "מציג 1-25 מתוך 142 רשומות"
- Previous / Next buttons, page number display

## Verification
1. `npm run typecheck` zero errors
2. `npm run build` completes
3. Manual:
   a. Non-admin user → redirected to /
   b. Admin user → sees log table
   c. Filter by event type → only matching rows shown
   d. Filter by date → correct range
   e. Pagination works, total count updates with filters
   f. Click row → full metadata visible

Branch: feature/admin-logs
```

---

## סוגי אירועים מומלצים

| event_type | מתי לרשום |
|-----------|----------|
| `user_login` | בהתחברות מוצלחת |
| `user_logout` | בהתנתקות |
| `record_created` | יצירת רשומה חשובה |
| `record_updated` | עדכון רשומה |
| `record_deleted` | מחיקת רשומה |
| `email_sent` | שליחת מייל דרך Brevo/Edge Function |
| `export_generated` | ייצוא נתונים |
| `admin_action` | פעולות אדמין |
| `permission_denied` | ניסיון גישה לא מורשה |
| `error` | שגיאה שצריך לחקור |

---

## עדכון CHANGELOG

תחת `[Unreleased] → ### נוסף`:
- "מערכת לוגים — תיעוד פעולות משתמשים ואירועי מערכת"
- "דף לוגים באזור הניהול עם סינון ו-pagination"
