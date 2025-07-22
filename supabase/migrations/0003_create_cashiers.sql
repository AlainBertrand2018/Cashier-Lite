create table
  public.cashiers (
    id uuid not null default gen_random_uuid (),
    created_at timestamp with time zone not null default now(),
    name text not null,
    pin text null,
    constraint cashiers_pkey primary key (id)
  ) tablespace pg_default;

-- Seed a default cashier for development
insert into public.cashiers (name) values ('Default Cashier');
