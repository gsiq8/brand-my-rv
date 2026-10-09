-- Run in the Supabase SQL editor (after 001_init.sql). Visitor counter for the page.
create table if not exists site_stats (key text primary key, value bigint not null default 0);
insert into site_stats (key, value) values ('visits', 0) on conflict (key) do nothing;
alter table site_stats enable row level security;   -- no policies: only your server can touch it

create or replace function increment_visits() returns bigint
language sql as $$
  update site_stats set value = value + 1 where key = 'visits' returning value;
$$;

-- optional: start from a number you already have
-- update site_stats set value = 1000 where key = 'visits';
