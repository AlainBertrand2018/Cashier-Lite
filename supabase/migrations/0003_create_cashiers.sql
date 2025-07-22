-- supabase/migrations/0003_create_cashiers.sql

create table cashiers (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now() not null,
  name text not null,
  pin text
);

alter table cashiers enable row level security;