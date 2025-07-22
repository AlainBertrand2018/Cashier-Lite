-- 0002_create_products.sql

-- Enable Realtime for the products table
-- alter publication supabase_realtime add table products;

-- Create the products table
create table if not exists products (
    id uuid primary key default gen_random_uuid(),
    created_at timestamptz with time zone default now() not null,
    name text not null,
    price numeric not null check (price >= 0),
    tenant_id bigint not null,

    constraint fk_tenant
        foreign key(tenant_id) 
        references tenants(tenant_id)
        on delete cascade
);

-- Create an index on the tenant_id column for faster lookups
create index if not exists idx_products_tenant_id on products(tenant_id);

-- Add comments to the table and columns
comment on table products is 'Stores product information for each tenant.';
comment on column products.id is 'Unique identifier for each product (UUID).';
comment on column products.created_at is 'Timestamp of when the product was created.';
comment on column products.name is 'The name of the product.';
comment on column products.price is 'The price of the product.';
comment on column products.tenant_id is 'Foreign key linking to the tenants table.';
