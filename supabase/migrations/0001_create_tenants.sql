
create table tenants (
  id uuid default gen_random_uuid() not null primary key,
  name text not null,
  "responsibleParty" text not null,
  brn text,
  vat text,
  mobile text not null,
  address text,
  "createdAt" timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table tenants enable row level security;

create policy "Allow public read-only access" on tenants
  for select using (true);

create policy "Allow authorized users to insert" on tenants
  for insert with check (true);

create policy "Allow authorized users to update" on tenants
  for update using (true);

create policy "Allow authorized users to delete" on tenants
  for delete using (true);
