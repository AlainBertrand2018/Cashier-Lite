-- Create the tenants table
CREATE TABLE tenants (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "createdAt" timestamptz DEFAULT now() NOT NULL,
    name text NOT NULL,
    "responsibleParty" text NOT NULL,
    brn text,
    vat text,
    mobile text NOT NULL,
    address text
);

-- Note: Row Level Security (RLS) is disabled by default.
-- For production, you should enable RLS and define policies.
-- Example: ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
