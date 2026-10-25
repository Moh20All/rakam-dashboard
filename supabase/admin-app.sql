-- Warshati Admin phone app. Run once in Supabase > SQL Editor, AFTER dashboard-upgrade.sql.
-- Safe to run again. (If you ever re-run dashboard-upgrade.sql, run this file again after it:
-- that file removes every policy on these tables.)
--
-- The phone app uses the public (anon) key + a Supabase Auth login. These rules let ONLY the
-- accounts listed in public.admins read and change licenses, customers, feedback and crashes.
-- The service-role key never goes on the phone. The desktop app and the website are unaffected.
--
-- After running it:
--   1. Supabase > Authentication > Users > Add user > Create new user
--      (your email + a strong password, tick "Auto Confirm User")
--   2. Run the last statement of this file with your email.
--   3. Recommended: Authentication > Sign In / Providers > turn OFF "Allow new users to sign up".

-- Who is an admin ------------------------------------------------------------------
create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admins enable row level security;
revoke all on table public.admins from anon, authenticated;

-- security definer: reads public.admins without giving the phone access to that table
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;
revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

-- Signed-in admins: full access to the four dashboard tables ------------------------
grant select, insert, update, delete on table public.licenses, public.customers, public.feedback, public.crash_reports to authenticated;
grant usage on all sequences in schema public to authenticated;

drop policy if exists "admins manage licenses" on public.licenses;
drop policy if exists "admins manage customers" on public.customers;
drop policy if exists "admins manage feedback" on public.feedback;
drop policy if exists "admins manage crash reports" on public.crash_reports;

create policy "admins manage licenses" on public.licenses for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admins manage customers" on public.customers for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admins manage feedback" on public.feedback for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admins manage crash reports" on public.crash_reports for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Check: the 2 app insert policies + the 4 admin policies
select tablename, policyname, roles, cmd from pg_policies
where schemaname = 'public' and tablename in ('licenses', 'customers', 'feedback', 'crash_reports')
order by tablename;

-- Step 2: make your account an admin (put your Supabase login email) -----------------
-- insert into public.admins (user_id) select id from auth.users where email = 'you@example.com' on conflict do nothing;
