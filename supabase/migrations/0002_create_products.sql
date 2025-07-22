create table
  public.products (
    id uuid not null default gen_random_uuid (),
    name character varying not null,
    price double precision not null,
    tenant_id bigint not null,
    created_at timestamp with time zone not null default now(),
    constraint products_pkey primary key (id),
    constraint products_tenant_id_fkey foreign key (tenant_id) references tenants (tenant_id) on update cascade on delete cascade
  ) tablespace pg_default;
