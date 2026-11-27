-- PingCue Migration 003: Default new user profiles to USD (while keeping USD, EUR, GBP, INR supported)
-- Safe to run on existing databases; existing profiles and invoices keep their stored currencies.

alter table public.profiles
  alter column default_currency set default 'USD';
