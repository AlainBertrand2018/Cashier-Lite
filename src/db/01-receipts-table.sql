-- Create the 'receipts' table to store a record of every generated receipt for audit purposes.
CREATE TABLE
  public.receipts (
    id UUID NOT NULL DEFAULT gen_random_uuid (),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    order_id TEXT NOT NULL,
    generated_by_cashier_id UUID NULL,
    receipt_data_json JSONB NOT NULL,
    CONSTRAINT receipts_pkey PRIMARY KEY (id),
    CONSTRAINT receipts_order_id_fkey FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE,
    CONSTRAINT receipts_generated_by_cashier_id_fkey FOREIGN KEY (generated_by_cashier_id) REFERENCES cashiers (id) ON DELETE SET NULL
  );

-- Add comments to the table and columns for clarity.
COMMENT ON TABLE public.receipts IS 'Stores a record of every generated receipt for auditing purposes.';
COMMENT ON COLUMN public.receipts.id IS 'Unique identifier for the receipt record.';
COMMENT ON COLUMN public.receipts.order_id IS 'Foreign key to the order for which this receipt was generated.';
COMMENT ON COLUMN public.receipts.generated_by_cashier_id IS 'Foreign key to the cashier who generated the receipt.';
COMMENT ON COLUMN public.receipts.receipt_data_json IS 'A JSON snapshot of the receipt data at the time of generation for historical accuracy.';
