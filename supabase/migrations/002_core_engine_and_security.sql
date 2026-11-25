-- PingCue Migration 002: Core engine scalability, profile settings, reschedule-safe logs,
-- bounce suppression, durable analytics, and auth-confirmed RPC.
-- Safe to run idempotently in Supabase Dashboard -> SQL Editor.

-- 1. Profile settings columns (updates remain service_role only; never grant UPDATE to authenticated)
alter table public.profiles
  add column if not exists display_name text,
  add column if not exists default_currency text not null default 'INR',
  add column if not exists notify_on_send boolean not null default true;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_default_currency_chk'
      and conrelid = 'public.profiles'::regclass
  ) then
    alter table public.profiles
      add constraint profiles_default_currency_chk
      check (default_currency in ('INR', 'USD', 'EUR', 'GBP'));
  end if;
end
$$;

-- 2. Fix search_path warning on set_updated_at trigger helper
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

-- 3. Stored active flag + partial index on invoices to avoid PostgREST 1,000-row cron cliff
alter table public.invoices
  add column if not exists is_active boolean
  generated always as (amount_received_minor < amount_minor) stored;

create index if not exists invoices_active_due_idx
  on public.invoices (due_date, id)
  where is_active = true;

-- 4. Reminder logs: whatsapp channel, delivery tracking, and reschedule-safe scheduled_for
alter table public.reminder_logs
  drop constraint if exists reminder_logs_channel_check;

alter table public.reminder_logs
  add constraint reminder_logs_channel_check
  check (channel in ('email', 'test_email', 'whatsapp'));

alter table public.reminder_logs
  add column if not exists delivery_status text not null default 'sent',
  add column if not exists scheduled_for date;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'reminder_logs_delivery_status_check'
      and conrelid = 'public.reminder_logs'::regclass
  ) then
    alter table public.reminder_logs
      add constraint reminder_logs_delivery_status_check
      check (delivery_status in ('sent', 'delivered', 'bounced', 'complained'));
  end if;
end
$$;

update public.reminder_logs rl
set scheduled_for = (i.due_date + rl.offset_days)
from public.invoices i
where rl.invoice_id = i.id
  and rl.channel = 'email'
  and rl.scheduled_for is null;

drop index if exists public.reminder_logs_unique_scheduled_send;
create unique index if not exists reminder_logs_unique_scheduled_send
  on public.reminder_logs (invoice_id, offset_days, coalesce(scheduled_for, date '1970-01-01'))
  where channel = 'email';

create index if not exists reminder_logs_resend_id_idx
  on public.reminder_logs (resend_id)
  where resend_id is not null;

-- 5. Email Suppression List (service role only)
create table if not exists public.suppressed_emails (
  email text primary key,
  reason text not null check (reason in ('bounced', 'complained', 'suppressed')),
  source_resend_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.suppressed_emails enable row level security;

-- 6. Durable Funnel Analytics Events (service role only)
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

-- 7. Confirmed-email user check for cron anti-abuse (service_role only)
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

-- 8. Grants for new service-role-only tables
grant all on public.suppressed_emails to service_role;
grant all on public.analytics_events to service_role;
