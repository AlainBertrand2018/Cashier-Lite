-- Create the products table
create table products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price numeric not null,
  tenant_id bigint not null,
  created_at timestamptz not null default now(),
  constraint fk_tenant
    foreign key(tenant_id) 
    references tenants(tenant_id)
    on delete cascade
);

alter table products enable row level security;
