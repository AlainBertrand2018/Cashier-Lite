-- Add the starting_float column to the cashing_stations table
ALTER TABLE public.cashing_stations
ADD COLUMN starting_float NUMERIC(10, 2) NOT NULL DEFAULT 0.00;

-- Add a comment to the new column for clarity
COMMENT ON COLUMN public.cashing_stations.starting_float IS 'The initial cash float amount at the start of a shift.';
