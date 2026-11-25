-- PingCue Migration 001: Dodo billing metadata + lowercase auth email normalization
-- Safe to run idempotently in Supabase Dashboard -> SQL Editor.

alter table public.profiles
  add column if not exists dodo_payment_id text,
  add column if not exists dodo_customer_id text,
  add column if not exists refunded_at timestamptz;

create index if not exists profiles_dodo_payment_id_idx
  on public.profiles (dodo_payment_id)
  where dodo_payment_id is not null;

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
