
-- Enums
CREATE TYPE public.user_role AS ENUM ('visitor', 'organizer', 'admin');
CREATE TYPE public.event_status AS ENUM ('draft', 'published', 'cancelled', 'completed', 'upcoming', 'ongoing');
CREATE TYPE public.ticket_status AS ENUM ('available', 'reserved', 'sold', 'cancelled');
CREATE TYPE public.reservation_status AS ENUM ('pending', 'confirmed', 'cancelled', 'refunded');
CREATE TYPE public.payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');

-- Profiles
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  email text,
  full_name text,
  avatar_url text,
  role public.user_role NOT NULL DEFAULT 'visitor',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Helper function to get user role (SECURITY DEFINER to avoid RLS recursion)
CREATE OR REPLACE FUNCTION get_user_role(uid uuid)
RETURNS public.user_role
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM profiles WHERE id = uid;
$$;

-- Trigger to sync new auth users to profiles
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'visitor'::public.user_role)
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Categories
CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  color text NOT NULL DEFAULT '#E03C31',
  icon text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Venues
CREATE TABLE public.venues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text NOT NULL,
  city text NOT NULL,
  country text NOT NULL DEFAULT 'USA',
  capacity integer NOT NULL DEFAULT 0,
  lat numeric(10,7),
  lng numeric(10,7),
  image_url text,
  description text,
  created_by uuid NOT NULL REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Artists
CREATE TABLE public.artists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  biography text,
  genres text[] NOT NULL DEFAULT '{}',
  image_url text,
  website text,
  social_links jsonb DEFAULT '{}',
  created_by uuid NOT NULL REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Events
CREATE TABLE public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  short_description text,
  image_url text,
  images text[] DEFAULT '{}',
  status public.event_status NOT NULL DEFAULT 'draft',
  category_id uuid REFERENCES public.categories(id),
  venue_id uuid REFERENCES public.venues(id),
  organizer_id uuid NOT NULL REFERENCES public.profiles(id),
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  city text NOT NULL,
  tags text[] DEFAULT '{}',
  price_min numeric(10,2) NOT NULL DEFAULT 0,
  price_max numeric(10,2) NOT NULL DEFAULT 0,
  total_tickets integer NOT NULL DEFAULT 0,
  sold_tickets integer NOT NULL DEFAULT 0,
  is_featured boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Event Artists (junction)
CREATE TABLE public.event_artists (
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  artist_id uuid NOT NULL REFERENCES public.artists(id) ON DELETE CASCADE,
  PRIMARY KEY (event_id, artist_id)
);

-- Tickets
CREATE TABLE public.tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  ticket_type text NOT NULL DEFAULT 'general',
  price numeric(10,2) NOT NULL DEFAULT 0,
  total_quantity integer NOT NULL DEFAULT 0,
  available_quantity integer NOT NULL DEFAULT 0,
  status public.ticket_status NOT NULL DEFAULT 'available',
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Reservations
CREATE TABLE public.reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES public.tickets(id),
  user_id uuid NOT NULL REFERENCES public.profiles(id),
  event_id uuid NOT NULL REFERENCES public.events(id),
  quantity integer NOT NULL DEFAULT 1,
  total_price numeric(10,2) NOT NULL DEFAULT 0,
  status public.reservation_status NOT NULL DEFAULT 'pending',
  payment_status public.payment_status NOT NULL DEFAULT 'pending',
  payment_intent_id text,
  pdf_url text,
  reservation_code text UNIQUE NOT NULL DEFAULT upper(substring(gen_random_uuid()::text, 1, 8)),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Audit Logs
CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id),
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  old_data jsonb,
  new_data jsonb,
  ip_address text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Public profiles view
CREATE VIEW public.public_profiles AS
  SELECT id, username, full_name, avatar_url, role FROM profiles;

-- Auto-update timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_venues_updated_at BEFORE UPDATE ON venues FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_artists_updated_at BEFORE UPDATE ON artists FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_events_updated_at BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_tickets_updated_at BEFORE UPDATE ON tickets FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_reservations_updated_at BEFORE UPDATE ON reservations FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Indexes
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_start_date ON events(start_date);
CREATE INDEX idx_events_city ON events(city);
CREATE INDEX idx_events_category ON events(category_id);
CREATE INDEX idx_events_organizer ON events(organizer_id);
CREATE INDEX idx_reservations_user ON reservations(user_id);
CREATE INDEX idx_reservations_event ON reservations(event_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS: profiles
CREATE POLICY "Admins have full access to profiles" ON profiles
  FOR ALL TO authenticated USING (get_user_role(auth.uid()) = 'admin'::user_role);
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id)
  WITH CHECK (role IS NOT DISTINCT FROM get_user_role(auth.uid()));
CREATE POLICY "Anon can view public profiles" ON profiles
  FOR SELECT TO anon USING (true);

-- RLS: categories (public read, admin write)
CREATE POLICY "Anyone can view categories" ON categories
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage categories" ON categories
  FOR ALL TO authenticated USING (get_user_role(auth.uid()) = 'admin'::user_role);

-- RLS: venues
CREATE POLICY "Anyone can view venues" ON venues
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Organizers and admins can create venues" ON venues
  FOR INSERT TO authenticated WITH CHECK (
    get_user_role(auth.uid()) IN ('organizer'::user_role, 'admin'::user_role)
  );
CREATE POLICY "Creator and admins can update venues" ON venues
  FOR UPDATE TO authenticated USING (
    created_by = auth.uid() OR get_user_role(auth.uid()) = 'admin'::user_role
  );
CREATE POLICY "Creator and admins can delete venues" ON venues
  FOR DELETE TO authenticated USING (
    created_by = auth.uid() OR get_user_role(auth.uid()) = 'admin'::user_role
  );

-- RLS: artists
CREATE POLICY "Anyone can view artists" ON artists
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Organizers and admins can create artists" ON artists
  FOR INSERT TO authenticated WITH CHECK (
    get_user_role(auth.uid()) IN ('organizer'::user_role, 'admin'::user_role)
  );
CREATE POLICY "Creator and admins can update artists" ON artists
  FOR UPDATE TO authenticated USING (
    created_by = auth.uid() OR get_user_role(auth.uid()) = 'admin'::user_role
  );
CREATE POLICY "Creator and admins can delete artists" ON artists
  FOR DELETE TO authenticated USING (
    created_by = auth.uid() OR get_user_role(auth.uid()) = 'admin'::user_role
  );

-- RLS: events
CREATE POLICY "Anyone can view published events" ON events
  FOR SELECT TO anon USING (status IN ('published', 'upcoming', 'ongoing', 'completed'));
CREATE POLICY "Authenticated users see published and own events" ON events
  FOR SELECT TO authenticated USING (
    status IN ('published', 'upcoming', 'ongoing', 'completed')
    OR organizer_id = auth.uid()
    OR get_user_role(auth.uid()) IN ('admin'::user_role)
  );
CREATE POLICY "Organizers and admins can create events" ON events
  FOR INSERT TO authenticated WITH CHECK (
    get_user_role(auth.uid()) IN ('organizer'::user_role, 'admin'::user_role)
  );
CREATE POLICY "Organizer and admins can update own events" ON events
  FOR UPDATE TO authenticated USING (
    organizer_id = auth.uid() OR get_user_role(auth.uid()) = 'admin'::user_role
  );
CREATE POLICY "Organizer and admins can delete own events" ON events
  FOR DELETE TO authenticated USING (
    organizer_id = auth.uid() OR get_user_role(auth.uid()) = 'admin'::user_role
  );

-- RLS: event_artists
CREATE POLICY "Anyone can view event_artists" ON event_artists
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Organizers manage event_artists" ON event_artists
  FOR ALL TO authenticated USING (
    get_user_role(auth.uid()) IN ('organizer'::user_role, 'admin'::user_role)
  );

-- RLS: tickets
CREATE POLICY "Anyone can view available tickets" ON tickets
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Organizers and admins can manage tickets" ON tickets
  FOR ALL TO authenticated USING (
    get_user_role(auth.uid()) IN ('organizer'::user_role, 'admin'::user_role)
  );

-- RLS: reservations
CREATE POLICY "Users can view own reservations" ON reservations
  FOR SELECT TO authenticated USING (
    user_id = auth.uid() OR get_user_role(auth.uid()) IN ('admin'::user_role, 'organizer'::user_role)
  );
CREATE POLICY "Authenticated users can create reservations" ON reservations
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own reservations" ON reservations
  FOR UPDATE TO authenticated USING (
    user_id = auth.uid() OR get_user_role(auth.uid()) = 'admin'::user_role
  );
CREATE POLICY "Admins can delete reservations" ON reservations
  FOR DELETE TO authenticated USING (get_user_role(auth.uid()) = 'admin'::user_role);

-- RLS: audit_logs
CREATE POLICY "Admins can view audit logs" ON audit_logs
  FOR SELECT TO authenticated USING (get_user_role(auth.uid()) = 'admin'::user_role);
CREATE POLICY "System can insert audit logs" ON audit_logs
  FOR INSERT TO authenticated WITH CHECK (true);
