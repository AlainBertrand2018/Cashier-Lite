
create table tenants (
  id bigint primary key generated always as identity,
  "createdAt" timestamp with time zone not null default now(),
  name text not null,
  "responsibleParty" text not null,
  brn text,
  vat text,
  mobile text not null,
  address text
);
