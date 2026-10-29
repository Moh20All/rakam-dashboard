-- Sign-ups from the public "Register / pre-order" page (warshati website: /register).
-- Run once in Supabase > SQL Editor. Safe to run again.
--
-- The form saves through the website's server (service-role key, server only), so the public
-- key gets no access at all. Admins signed in on the phone app (public.admins, see
-- admin-app.sql) can read and update the sign-ups.

create table if not exists public.registrations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  shop_name text not null,
  owner_name text not null,
  phone text not null,
  email text,
  wilaya_code int not null,
  wilaya_name text not null,
  commune_name text not null,
  address text,
  pcs int not null default 1,
  current_tool text,          -- notebook | excel | software | nothing
  message text,
  lang text,                  -- fr | ar | en (language they used on the form)
  status text not null default 'new',  -- new | contacted | converted | declined
  admin_note text,
  customer_id uuid references public.customers (id) on delete set null,
  ip text
);
create index if not exists registrations_created_idx on public.registrations (created_at);
create index if not exists registrations_status_idx on public.registrations (status);
create index if not exists registrations_phone_idx on public.registrations (phone);
create index if not exists registrations_ip_time_idx on public.registrations (ip, created_at);

alter table public.registrations enable row level security;
revoke all on table public.registrations from anon, authenticated;

-- Phone app admins (same rule as admin-app.sql; created here too so the order of the files does not matter)
create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admins enable row level security;
revoke all on table public.admins from anon, authenticated;
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.admins where user_id = auth.uid()); $$;
revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

grant select, update, delete on table public.registrations to authenticated;
drop policy if exists "admins manage registrations" on public.registrations;
create policy "admins manage registrations" on public.registrations for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Check: one policy, for authenticated
select policyname, roles, cmd from pg_policies where schemaname = 'public' and tablename = 'registrations';
