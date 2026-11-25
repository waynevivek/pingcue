-- PingCue V1 Database Schema (Supabase Postgres)
-- Paste this once into Supabase Dashboard -> SQL Editor -> Run.

-- 1. Profiles (1:1 with auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  plan text not null default 'free' check (plan in ('free', 'founding_pass')),
  founding_pass_unlocked_at timestamptz,
  display_name text,
  default_currency text not null default 'INR' check (default_currency in ('INR', 'USD', 'EUR', 'GBP')),
  notify_on_send boolean not null default true,
  dodo_payment_id text,
  dodo_customer_id text,
  refunded_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists profiles_dodo_payment_id_idx
  on public.profiles (dodo_payment_id)
  where dodo_payment_id is not null;

alter table public.profiles enable row level security;

drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile"
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = id);

-- Automatically create a profile row whenever a new user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, lower(coalesce(new.email, '')))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 2. Invoices
create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  client_name text not null,
  client_email text not null,
  client_whatsapp text,
  currency text not null check (currency in ('INR', 'USD', 'EUR', 'GBP')),
  amount_minor integer not null check (amount_minor > 0),
  amount_received_minor integer not null default 0 check (amount_received_minor >= 0),
  is_active boolean generated always as (amount_received_minor < amount_minor) stored,
  due_date date not null,
  payment_link text,
  reminder_offsets integer[] not null default '{-3,0,3,7,14,30}',
  paused_until date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists invoices_user_due_idx
  on public.invoices (user_id, due_date);

create index if not exists invoices_active_due_idx
  on public.invoices (due_date, id)
  where is_active = true;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'invoices_reminder_offsets_len_chk'
      and conrelid = 'public.invoices'::regclass
  ) then
    alter table public.invoices
      add constraint invoices_reminder_offsets_len_chk
      check (cardinality(reminder_offsets) between 1 and 12);
  end if;
end
$$;

alter table public.invoices enable row level security;

drop policy if exists "Users can manage own invoices" on public.invoices;
create policy "Users can manage own invoices"
  on public.invoices
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Enforce Free-plan 1-active-invoice limit atomically at the DB boundary
create or replace function public.enforce_free_plan_invoice_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  user_plan text;
begin
  if new.amount_received_minor < new.amount_minor then
    perform pg_advisory_xact_lock(hashtext(new.user_id::text));

    select plan
    into user_plan
    from public.profiles
    where id = new.user_id;

    if coalesce(user_plan, 'free') = 'free' and exists (
      select 1
      from public.invoices
      where user_id = new.user_id
        and id is distinct from new.id
        and amount_received_minor < amount_minor
    ) then
      raise exception 'FREE_PLAN_LIMIT: Free plan allows 1 active invoice at a time.'
        using errcode = 'P0001';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists invoices_enforce_free_plan_limit on public.invoices;
create trigger invoices_enforce_free_plan_limit
  before insert or update on public.invoices
  for each row execute function public.enforce_free_plan_invoice_limit();

-- Auto-update updated_at on invoice edits
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists invoices_set_updated_at on public.invoices;
create trigger invoices_set_updated_at
  before update on public.invoices
  for each row execute function public.set_updated_at();

-- 3. Reminder Logs (prevents duplicate cron emails per due-date schedule; allows test & whatsapp logs)
create table if not exists public.reminder_logs (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  offset_days integer not null,
  channel text not null default 'email' check (channel in ('email', 'test_email', 'whatsapp')),
  recipient_email text not null,
  resend_id text,
  delivery_status text not null default 'sent' check (delivery_status in ('sent', 'delivered', 'bounced', 'complained')),
  scheduled_for date,
  sent_at timestamptz not null default now()
);

create unique index if not exists reminder_logs_unique_scheduled_send
  on public.reminder_logs (invoice_id, offset_days, coalesce(scheduled_for, date '1970-01-01'))
  where channel = 'email';

create index if not exists reminder_logs_invoice_idx
  on public.reminder_logs (invoice_id, sent_at desc);

create index if not exists reminder_logs_user_channel_sent_idx
  on public.reminder_logs (user_id, channel, sent_at desc);

create index if not exists reminder_logs_resend_id_idx
  on public.reminder_logs (resend_id)
  where resend_id is not null;

alter table public.reminder_logs enable row level security;

drop policy if exists "Users can view own reminder logs" on public.reminder_logs;
create policy "Users can view own reminder logs"
  on public.reminder_logs
  for select
  to authenticated
  using (auth.uid() = user_id);

-- 4. Processed Webhooks (Dodo & Resend webhook audit log — service role only)
create table if not exists public.processed_webhooks (
  webhook_id text primary key,
  event_type text not null,
  processed_at timestamptz not null default now()
);

alter table public.processed_webhooks enable row level security;
-- Intentionally no authenticated policies: only service_role reads/writes webhooks.

-- 5. Founding Pass Waitlist Leads (service role only)
create table if not exists public.founding_pass_leads (
  email text primary key,
  source text not null default 'unknown',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.founding_pass_leads enable row level security;
-- Intentionally no authenticated/anon policies: only service_role reads/writes leads.

-- 6. Email Suppression List (hard bounces & spam complaints — service role only)
create table if not exists public.suppressed_emails (
  email text primary key,
  reason text not null check (reason in ('bounced', 'complained', 'suppressed')),
  source_resend_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.suppressed_emails enable row level security;

-- 7. Durable Analytics Events (service role only)
create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  event text not null,
  source text not null default 'unknown',
  user_id uuid references auth.users(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists analytics_events_event_created_idx
  on public.analytics_events (event, created_at desc);

alter table public.analytics_events enable row level security;

-- 8. Confirmed-email user check for cron anti-abuse (service role only)
create or replace function public.get_confirmed_user_ids(p_user_ids uuid[])
returns uuid[]
language sql
security definer
set search_path = public, auth
as $$
  select coalesce(array_agg(id), '{}'::uuid[])
  from auth.users
  where id = any(p_user_ids)
    and email_confirmed_at is not null;
$$;

revoke all on function public.get_confirmed_user_ids(uuid[]) from public, anon, authenticated;
grant execute on function public.get_confirmed_user_ids(uuid[]) to service_role;

-- 9. Table Grants for PostgREST roles (required alongside RLS policies)
grant usage on schema public to anon, authenticated, service_role;

grant select on public.profiles to authenticated;
grant all on public.profiles to service_role;

grant select, insert, update, delete on public.invoices to authenticated;
grant all on public.invoices to service_role;

grant select on public.reminder_logs to authenticated;
grant all on public.reminder_logs to service_role;

grant all on public.processed_webhooks to service_role;
grant all on public.founding_pass_leads to service_role;
grant all on public.suppressed_emails to service_role;
grant all on public.analytics_events to service_role;
