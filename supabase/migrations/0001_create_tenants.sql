create table tenants (
  tenant_id bigint primary key generated always as identity,
  created_at timestamptz not null default now(),
  name text not null,
  "responsibleParty" text not null,
  brn text,
  vat text,
  mobile text not null,
  address text
);
