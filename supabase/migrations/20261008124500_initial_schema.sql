CREATE TABLE IF NOT EXISTS public.bookings (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  service TEXT NOT NULL,
  visit_date DATE NOT NULL,
  notes TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'new'
    CHECK (status IN ('new', 'contacted', 'in-progress', 'done', 'cancelled')),
  file_name TEXT,
  file_type TEXT,
  file_size INTEGER,
  file_path TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.contacts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL DEFAULT 'Guest',
  contact TEXT NOT NULL,
  message TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS bookings_created_at_idx ON public.bookings (created_at DESC);
CREATE INDEX IF NOT EXISTS contacts_created_at_idx ON public.contacts (created_at DESC);

ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS file_name TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS file_type TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS file_size INTEGER;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS file_path TEXT;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('booking-files', 'booking-files', FALSE, 10485760)
ON CONFLICT (id) DO UPDATE
SET public = FALSE, file_size_limit = 10485760;

REVOKE ALL ON public.bookings FROM anon, authenticated;
REVOKE ALL ON public.contacts FROM anon, authenticated;
