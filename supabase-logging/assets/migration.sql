-- ============================================================================
-- Migration NN: Add system_logs table
-- ============================================================================
-- מוסיף טבלת לוגים כללית לתיעוד אירועים במערכת.
-- נגישה לאדמין בלבד דרך RLS.
-- פונקציית log_event() מאפשרת רישום אירועים מכל מקום בקוד.
-- ============================================================================

begin;


-- ============================================================================
-- 1. system_logs
-- ============================================================================
create table public.system_logs (
  id           uuid        primary key default gen_random_uuid(),
  event_type   text        not null,
  user_id      uuid        references auth.users(id) on delete set null,
  metadata     jsonb,
  created_at   timestamptz not null default now()
);

comment on table  public.system_logs                is 'לוג אירועים כללי של המערכת. מיועד לניטור ודיבאג.';
comment on column public.system_logs.event_type     is 'סוג האירוע — למשל: user_login, email_sent, record_created, error';
comment on column public.system_logs.user_id        is 'המשתמש שביצע את הפעולה. null = פעולה לא מאומתת / מ-Edge Function';
comment on column public.system_logs.metadata       is 'מידע נוסף כ-JSON — תוכן תלוי בסוג האירוע';


-- ============================================================================
-- 2. Indexes
-- ============================================================================
create index system_logs_event_type_idx  on public.system_logs (event_type);
create index system_logs_user_id_idx     on public.system_logs (user_id);
create index system_logs_created_at_idx  on public.system_logs (created_at desc);


-- ============================================================================
-- 3. RLS — אדמין בלבד
-- ============================================================================
alter table public.system_logs enable row level security;

create policy system_logs_admin_all on public.system_logs
  for all to authenticated
  using  (public.is_admin())
  with check (public.is_admin());


-- ============================================================================
-- 4. log_event() — פונקציית עזר לרישום אירועים
-- ============================================================================
create or replace function public.log_event(
  p_event_type text,
  p_metadata   jsonb default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.system_logs (event_type, user_id, metadata)
  values (p_event_type, auth.uid(), p_metadata);
end;
$$;

comment on function public.log_event(text, jsonb) is
  'רושם אירוע ל-system_logs. user_id נלקח אוטומטית מה-session הנוכחי (null ב-Edge Functions עם service role).';

-- נגיש לכולם — security definer מגבילה את הכתיבה לטבלה עצמה
grant execute on function public.log_event(text, jsonb) to authenticated, anon;


commit;


-- ============================================================================
-- אימות
-- ============================================================================
select 'system_logs exists' as check_type,
  exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'system_logs'
  ) as ok;

select 'log_event exists' as check_type,
  exists (
    select 1 from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname = 'log_event'
  ) as ok;

select policyname from pg_policies
  where schemaname = 'public' and tablename = 'system_logs';
