-- PingCue V1 Database Schema (Supabase Postgres)
-- Paste this once into Supabase Dashboard -> SQL Editor -> Run.

-- 1. Profiles (1:1 with auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  plan text not null default 'free' check (plan in ('free', 'founding_pass')),
  founding_pass_unlocked_at timestamptz,
  created_at timestamptz not null default now()
);

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
  values (new.id, coalesce(new.email, ''))
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
  due_date date not null,
  payment_link text,
  reminder_offsets integer[] not null default '{-3,0,3,7,14,30}',
  paused_until date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists invoices_user_due_idx
  on public.invoices (user_id, due_date);

alter table public.invoices enable row level security;

drop policy if exists "Users can manage own invoices" on public.invoices;
create policy "Users can manage own invoices"
  on public.invoices
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Auto-update updated_at on invoice edits
create or replace function public.set_updated_at()
returns trigger
language plpgsql
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

-- 3. Reminder Logs (prevents duplicate cron emails; allows unlimited test sends)
create table if not exists public.reminder_logs (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  offset_days integer not null,
  channel text not null default 'email' check (channel in ('email', 'test_email')),
  recipient_email text not null,
  resend_id text,
  sent_at timestamptz not null default now()
);

create unique index if not exists reminder_logs_unique_scheduled_send
  on public.reminder_logs (invoice_id, offset_days)
  where channel = 'email';

create index if not exists reminder_logs_invoice_idx
  on public.reminder_logs (invoice_id, sent_at desc);

alter table public.reminder_logs enable row level security;

drop policy if exists "Users can view own reminder logs" on public.reminder_logs;
create policy "Users can view own reminder logs"
  on public.reminder_logs
  for select
  to authenticated
  using (auth.uid() = user_id);

-- 4. Processed Webhooks (Dodo Payments idempotency — service role only)
create table if not exists public.processed_webhooks (
  webhook_id text primary key,
  event_type text not null,
  processed_at timestamptz not null default now()
);

alter table public.processed_webhooks enable row level security;
-- Intentionally no authenticated policies: only service_role reads/writes webhooks.
