-- Run this in the Supabase SQL editor.
create extension if not exists pgcrypto;

-- Personal data lives apart from bids. Nobody but your server (service role) can read it.
create table bidders (
  id uuid primary key default gen_random_uuid(),
  name text not null, phone text not null, email text not null, address text not null, tax_id text not null,
  created_at timestamptz not null default now()
);

create table bids (
  id uuid primary key default gen_random_uuid(),
  spot_id text not null,
  bidder_id uuid not null references bidders(id),
  display_name text not null,                      -- shown on the public board
  amount integer not null check (amount > 0),      -- whole currency units per period
  currency text not null default 'usd',
  payment_mode text not null check (payment_mode in ('full','deposit')),
  deposit integer not null default 0,
  status text not null default 'awaiting_payment'
    check (status in ('awaiting_payment','pending_offer','invoiced','paid','cancelled')),
  upload_path text not null,                       -- private bucket 'logo-uploads'
  logo_path text,                                  -- public bucket 'logos' (set only when paid)
  stripe_session_id text,
  stripe_invoice_id text,
  created_at timestamptz not null default now(),
  paid_at timestamptz
);
create index bids_spot_status_amount on bids (spot_id, status, amount desc);

-- RLS on with NO policies = the public/anon key can read nothing. Only the server (service role) can.
alter table bidders enable row level security;
alter table bids enable row level security;

-- Logos: uploads are private; once a bid is paid the server copies the logo to the public bucket.
insert into storage.buckets (id, name, public) values
  ('logo-uploads', 'logo-uploads', false),
  ('logos', 'logos', true)
on conflict (id) do nothing;
