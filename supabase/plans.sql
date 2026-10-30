-- Warshati plans: 1 Lifetime (license + updates), 2 Cloud (cloud services + mobile app), 3 VIP (everything).
-- Run once in the Supabase SQL editor BEFORE deploying the new `license` function (it reads this column).
-- Existing keys become plan 1.
alter table public.licenses add column if not exists plan smallint not null default 1;
do $$ begin
  alter table public.licenses add constraint licenses_plan_check check (plan in (1, 2, 3));
exception when duplicate_object then null; end $$;
