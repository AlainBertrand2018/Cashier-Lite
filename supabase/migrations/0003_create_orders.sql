
create table if not exists public.orders (
    id text not null,
    created_at timestamp with time zone not null default now(),
    tenant_id bigint not null,
    total numeric not null,
    vat numeric not null,
    subtotal numeric not null,
    cashier_id text null,
    constraint orders_pkey primary key (id),
    constraint orders_tenant_id_fkey foreign key (tenant_id) references tenants (tenant_id) on update cascade on delete cascade
) tablespace pg_default;

    