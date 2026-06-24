
-- Seed categories
INSERT INTO public.categories (name, slug, description, color, icon) VALUES
  ('Music', 'music', 'Live concerts, festivals, and music performances', '#E03C31', 'Music'),
  ('Theater', 'theater', 'Stage plays, musicals, and theatrical performances', '#7C3AED', 'Theater'),
  ('Dance', 'dance', 'Ballet, contemporary dance, and cultural dance shows', '#0891B2', 'Activity'),
  ('Film', 'film', 'Film screenings, premieres, and cinema events', '#D97706', 'Film'),
  ('Visual Arts', 'visual-arts', 'Exhibitions, galleries, and art installations', '#059669', 'Palette'),
  ('Literature', 'literature', 'Book launches, readings, and literary festivals', '#DC2626', 'BookOpen'),
  ('Comedy', 'comedy', 'Stand-up comedy and comedic performances', '#EA580C', 'Smile'),
  ('Heritage', 'heritage', 'Cultural heritage and historical events', '#78716C', 'Landmark'),
  ('Workshop', 'workshop', 'Creative workshops and educational sessions', '#2563EB', 'Wrench'),
  ('Festival', 'festival', 'Multi-day cultural festivals and celebrations', '#9333EA', 'Star');

-- Storage bucket for event images
INSERT INTO storage.buckets (id, name, public) VALUES ('event-images', 'event-images', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('artist-images', 'artist-images', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('venue-images', 'venue-images', true);

-- Storage policies
CREATE POLICY "Public read event-images" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'event-images');
CREATE POLICY "Auth upload event-images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'event-images');
CREATE POLICY "Auth update event-images" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'event-images');
CREATE POLICY "Auth delete event-images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'event-images');

CREATE POLICY "Public read artist-images" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'artist-images');
CREATE POLICY "Auth upload artist-images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'artist-images');

CREATE POLICY "Public read venue-images" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'venue-images');
CREATE POLICY "Auth upload venue-images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'venue-images');
