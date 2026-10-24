-- Warshati dashboard upgrade. Run once in Supabase > SQL Editor. Safe to run again.
--
-- 1. New columns the dashboard uses (last seen, prices, notes, feedback statuses)
-- 2. Login protection table (5 wrong passwords per 15 min per IP)
-- 3. Locks the tables so the public key inside the desktop app can only SEND feedback
--    and crash reports. Licenses and customers become invisible to it; the app checks
--    licenses through the `license` Edge Function, and the dashboard uses the
--    service-role key, which ignores these rules.

-- 1. Columns --------------------------------------------------------------------
alter table public.licenses
  add column if not exists last_seen_at timestamptz,
  add column if not exists last_version text,
  add column if not exists price numeric,
  add column if not exists note text,
  add column if not exists revoked_at timestamptz;

alter table public.customers
  add column if not exists created_at timestamptz not null default now();

alter table public.feedback
  add column if not exists status text not null default 'new',
  add column if not exists admin_note text;

alter table public.crash_reports
  add column if not exists admin_note text;

create index if not exists licenses_customer_id_idx on public.licenses (customer_id);
create index if not exists feedback_status_idx on public.feedback (status);
create index if not exists crash_reports_resolved_idx on public.crash_reports (resolved);

-- 2. Login attempts ---------------------------------------------------------------
create table if not exists public.login_attempts (
  id bigserial primary key,
  ip text not null,
  created_at timestamptz not null default now()
);
create index if not exists login_attempts_ip_time_idx on public.login_attempts (ip, created_at);

-- 3. Lock down the public (anon) key ----------------------------------------------
-- Drop every existing policy on these tables, then add back only what the app needs.
do $$
declare p record;
begin
  for p in select tablename, policyname from pg_policies
           where schemaname = 'public'
             and tablename in ('licenses', 'customers', 'feedback', 'crash_reports', 'login_attempts') loop
    execute format('drop policy %I on public.%I', p.policyname, p.tablename);
  end loop;
end $$;

alter table public.licenses       enable row level security;
alter table public.customers      enable row level security;
alter table public.feedback       enable row level security;
alter table public.crash_reports  enable row level security;
alter table public.login_attempts enable row level security;

revoke all on table public.licenses, public.customers, public.login_attempts from anon, authenticated;
revoke all on table public.feedback, public.crash_reports from anon, authenticated;

-- The app may only add feedback and crash reports (it cannot read, change or delete them)
grant insert on table public.feedback, public.crash_reports to anon;
grant usage on all sequences in schema public to anon;
create policy "app can send feedback" on public.feedback for insert to anon with check (true);
create policy "app can send crash reports" on public.crash_reports for insert to anon with check (true);

-- Check: should list exactly the two insert policies above
select tablename, policyname, roles, cmd from pg_policies
where schemaname = 'public' and tablename in ('licenses', 'customers', 'feedback', 'crash_reports', 'login_attempts');
