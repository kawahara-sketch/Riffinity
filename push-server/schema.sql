-- Run in your own Supabase SQL editor. Service role only; no client access.
create table if not exists public.push_subscriptions (
 endpoint text primary key,
 subscription jsonb not null,
 token_hash text not null,
 hour smallint not null default 21 check (hour between 0 and 23),
 enabled boolean not null default true,
 completed_day date,
 last_sent_day date,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
alter table public.push_subscriptions enable row level security;
-- Do not create public anon/authenticated policies. Only backend service role can access.
