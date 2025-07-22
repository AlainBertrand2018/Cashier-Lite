-- supabase/migrations/0002_create_products.sql

create table products (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  price numeric not null,
  tenant_id bigint not null references tenants(tenant_id) on delete cascade,
  created_at timestamptz default now() not null
);

alter table products enable row level security;