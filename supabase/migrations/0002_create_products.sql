-- Create the products table
CREATE TABLE products (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    tenant_id BIGINT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_tenant
        FOREIGN KEY(tenant_id) 
        REFERENCES tenants(tenant_id)
        ON DELETE CASCADE
);

-- RLS policies for products table (optional, for future use)
-- We are keeping it disabled for now as requested.
-- ALTER TABLE products ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow public read access" ON products FOR SELECT USING (true);
-- CREATE POLICY "Allow authenticated users to insert" ON products FOR INSERT WITH CHECK (auth.role() = 'authenticated');
-- CREATE POLICY "Allow users to update their own products" ON products FOR UPDATE USING (auth.uid() = user_id);
-- CREATE POLICY "Allow users to delete their own products" ON products FOR DELETE USING (auth.uid() = user_id);
