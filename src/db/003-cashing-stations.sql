-- Sequence for generating the sequential part of the station name
CREATE SEQUENCE IF NOT EXISTS cashing_station_name_seq START 1;

-- Table to store cashing stations
CREATE TABLE IF NOT EXISTS public.cashing_stations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ(6) DEFAULT now() NOT NULL,
    
    -- Name will be like 'FIDS2025-001'. The default value uses the sequence.
    name TEXT NOT NULL UNIQUE DEFAULT 'FIDS2025-' || LPAD(nextval('cashing_station_name_seq')::TEXT, 3, '0'),
    
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    
    -- Foreign key to link to the currently logged-in cashier
    current_cashier_id UUID NULL,
    
    last_login_at TIMESTAMPTZ(6) NULL,

    CONSTRAINT fk_current_cashier
        FOREIGN KEY(current_cashier_id) 
        REFERENCES public.cashiers(id)
        ON DELETE SET NULL -- If a cashier is deleted, the station is not deleted, just logged out.
);

-- Add comments for clarity
COMMENT ON TABLE public.cashing_stations IS 'Represents physical or virtual points of sale.';
COMMENT ON COLUMN public.cashing_stations.name IS 'Unique, human-readable name for the station (e.g., FIDS2025-001).';
COMMENT ON COLUMN public.cashing_stations.current_cashier_id IS 'The cashier currently logged into this station.';
COMMENT ON COLUMN public.cashing_stations.last_login_at IS 'Timestamp of the last successful login to this station.';

-- Insert a few dummy stations for development purposes, letting the default name work.
-- Running this INSERT multiple times will create more stations with sequential names.
-- You can run this part separately in the Supabase SQL editor if needed.
-- DO $$
-- BEGIN
--   IF (SELECT COUNT(*) FROM public.cashing_stations) < 3 THEN
--     INSERT INTO public.cashing_stations (current_cashier_id) VALUES (NULL), (NULL), (NULL);
--   END IF;
-- END
-- $$;
