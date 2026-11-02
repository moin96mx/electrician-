ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'bookings_location_coordinates_valid'
      AND conrelid = 'public.bookings'::regclass
  ) THEN
    ALTER TABLE public.bookings
      ADD CONSTRAINT bookings_location_coordinates_valid CHECK (
        (latitude IS NULL AND longitude IS NULL) OR
        (
          latitude IS NOT NULL AND longitude IS NOT NULL AND
          latitude BETWEEN -90 AND 90 AND longitude BETWEEN -180 AND 180
        )
      );
  END IF;
END
$$;
