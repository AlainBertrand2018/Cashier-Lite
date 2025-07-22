-- 0003_create_cashiers.sql

-- Create the cashiers table
create table if not exists cashiers (
    id uuid primary key default gen_random_uuid(),
    created_at timestamptz with time zone default now() not null,
    name text not null,
    pin text null -- For future use, e.g., cashier login
);

-- Add comments to the table and columns
comment on table cashiers is 'Stores information about each cashier operating the system.';
comment on column cashiers.id is 'Unique identifier for each cashier (UUID).';
comment on column cashiers.created_at is 'Timestamp of when the cashier was created.';
comment on column cashiers.name is 'The name of the cashier.';
comment on column cashiers.pin is 'A PIN for the cashier to log in (for future use).';
