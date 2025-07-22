-- Create the 'reports' table to store audit trail of generated reports
CREATE TABLE public.reports (
    -- Unique identifier for the report
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Timestamp of when the report was created
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,

    -- Type of the report (e.g., 'SHIFT_SUMMARY', 'TENANT_DETAIL', 'ALL_TENANTS')
    report_type TEXT NOT NULL,

    -- Foreign key to the cashiers table to track who generated the report.
    -- Nullable in case a system process generates a report.
    generated_by_cashier_id UUID REFERENCES public.cashiers(id) ON DELETE SET NULL,

    -- Foreign key to the tenants table for tenant-specific reports.
    -- Nullable for general reports (e.g., shift summary).
    tenant_id INT REFERENCES public.tenants(tenant_id) ON DELETE SET NULL,

    -- A JSONB snapshot of the raw data used to generate the report.
    -- This preserves the historical data for auditing.
    report_data_json JSONB NOT NULL,

    -- The path to the generated PDF file in Supabase Storage.
    -- This is more efficient than storing the file directly in the database.
    storage_path TEXT
);

-- Add comments to the table and columns for clarity
COMMENT ON TABLE public.reports IS 'Stores an audit trail of all generated PDF reports.';
COMMENT ON COLUMN public.reports.report_type IS 'The category of the report, e.g., SHIFT_SUMMARY, TENANT_DETAIL.';
COMMENT ON COLUMN public.reports.report_data_json IS 'A snapshot of the data used for the report at the time of generation.';
COMMENT ON COLUMN public.reports.storage_path IS 'The file path for the report PDF stored in Supabase Storage.';
