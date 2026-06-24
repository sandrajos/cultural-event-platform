
-- Venues (a=hex valid)
INSERT INTO venues (id, name, address, city, country, capacity, lat, lng, image_url, description, created_by)
VALUES
  ('a1000000-0000-0000-0000-000000000001', 'Grand Symphony Hall', '100 Orchestra Lane', 'New York', 'USA', 2800, 40.7128, -74.0060,
   'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_d3cf3145-059d-467d-8e3f-c1d5ab935628.jpg',
   'A world-class concert hall in the heart of New York City, home to the city symphony and renowned international performances.',
   '0d276a96-dba6-4c1c-bbeb-fccdb62ed159'),
  ('a2000000-0000-0000-0000-000000000002', 'The Velvet Theatre', '45 Broadway Ave', 'Chicago', 'USA', 900, 41.8781, -87.6298,
   'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_d9e2d039-40d0-4ece-876a-3064fb02eea4.jpg',
   'An intimate historic theater with stunning baroque architecture, perfect for opera and classical performances.',
   '0d276a96-dba6-4c1c-bbeb-fccdb62ed159'),
  ('a3000000-0000-0000-0000-000000000003', 'Riverside Amphitheater', '200 Riverside Drive', 'Los Angeles', 'USA', 5000, 34.0522, -118.2437,
   'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_4ad84ae8-e5b7-4b7a-b918-bef2674e3903.jpg',
   'An open-air amphitheater nestled among the hills, offering breathtaking views and a superb outdoor concert experience.',
   '0d276a96-dba6-4c1c-bbeb-fccdb62ed159'),
  ('a4000000-0000-0000-0000-000000000004', 'Blue Note Jazz Club', '131 W 3rd St', 'New York', 'USA', 240, 40.7300, -74.0000,
   'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_74b6881f-425b-443e-9ef9-84ac2e2ba02d.jpg',
   'A legendary jazz club hosting the world''s finest musicians since 1981. Intimate setting with world-class acoustics.',
   '0d276a96-dba6-4c1c-bbeb-fccdb62ed159')
ON CONFLICT (id) DO NOTHING;

-- Artists (b=hex valid)
INSERT INTO artists (id, name, biography, genres, image_url, website, created_by)
VALUES
  ('b1000000-0000-0000-0000-000000000001', 'Marcus Cole',
   'Marcus Cole is a Grammy-nominated jazz trumpet virtuoso whose career spans three decades. Known for blending traditional bebop with modern fusion, he has performed at Carnegie Hall, the Montreux Jazz Festival, and venues across six continents.',
   ARRAY['Jazz','Bebop','Fusion'],
   'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_35211343-b4b5-442d-9976-7e3c2a00d361.jpg',
   'https://marcuscole.music', '0d276a96-dba6-4c1c-bbeb-fccdb62ed159'),
  ('b2000000-0000-0000-0000-000000000002', 'Elena Vasquez',
   'Elena Vasquez is a classically trained pianist who studied at the Royal Conservatory of Music in Madrid. Her interpretations of Chopin and Debussy have earned her critical acclaim across Europe and North America.',
   ARRAY['Classical','Piano','Chamber Music'],
   'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_ca4e8a60-14b8-4dc7-872c-1febcca94612.jpg',
   'https://elenavasquez.com', '0d276a96-dba6-4c1c-bbeb-fccdb62ed159'),
  ('b3000000-0000-0000-0000-000000000003', 'DJ Neon Pulse',
   'DJ Neon Pulse is one of the most sought-after electronic music producers in the world, known for high-energy sets that blend techno, house, and ambient soundscapes. Resident DJ at Ibiza''s top clubs.',
   ARRAY['Electronic','Techno','House','Ambient'],
   'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_c7e8950b-8e92-4616-ba1f-845e7d430cce.jpg',
   'https://djneonpulse.com', '0d276a96-dba6-4c1c-bbeb-fccdb62ed159'),
  ('b4000000-0000-0000-0000-000000000004', 'Aria Dance Company',
   'The Aria Dance Company is an internationally acclaimed contemporary dance troupe that has redefined modern movement. Their performances fuse ballet, hip-hop, and world dance traditions into visually stunning spectacles.',
   ARRAY['Contemporary Dance','Ballet','Performance Art'],
   'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_ff0df358-9b38-4eaf-b80a-b46d9d392080.jpg',
   'https://ariadance.com', '0d276a96-dba6-4c1c-bbeb-fccdb62ed159'),
  ('b5000000-0000-0000-0000-000000000005', 'Sofia Moretti',
   'Sofia Moretti is a celebrated soprano whose powerful voice has graced the stages of La Scala, the Metropolitan Opera, and the Royal Opera House. Winner of three international vocal competitions.',
   ARRAY['Opera','Classical','Soprano'],
   'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_5224ef5e-56f2-4594-ad3a-6d361a07f21c.jpg',
   'https://sofiamoretti.opera', '0d276a96-dba6-4c1c-bbeb-fccdb62ed159'),
  ('b6000000-0000-0000-0000-000000000006', 'The Steel Wolves',
   'The Steel Wolves are a hard-driving rock quartet from Austin, Texas. Their raw, electrifying performances and hook-laden riffs have earned them a dedicated global fanbase and sold-out arena tours.',
   ARRAY['Rock','Alternative','Blues Rock'],
   'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_3d8da7ab-c13e-40ad-b1cd-b2d8d9bb0020.jpg',
   'https://thesteelwolves.com', '0d276a96-dba6-4c1c-bbeb-fccdb62ed159')
ON CONFLICT (id) DO NOTHING;

-- Events (e=hex valid)
INSERT INTO events (id, title, description, short_description, image_url, images, status,
  category_id, venue_id, organizer_id, start_date, end_date, city, tags,
  price_min, price_max, total_tickets, sold_tickets, is_featured)
VALUES
  ('e1000000-0000-0000-0000-000000000001',
   'Marcus Cole Quartet: Live at Blue Note',
   'Join us for an extraordinary evening with the Marcus Cole Quartet, one of the most electrifying jazz ensembles performing today. Marcus Cole brings his signature blend of bebop virtuosity and modern fusion to New York''s most legendary jazz venue.',
   'An extraordinary evening of bebop and modern fusion at New York''s legendary Blue Note Jazz Club.',
   'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_dc7f5b16-3cc7-412c-a491-97cc72de885b.jpg',
   ARRAY['https://miaoda-site-img.s3cdn.medo.dev/images/KLing_dc7f5b16-3cc7-412c-a491-97cc72de885b.jpg'],
   'published', 'b01cfbde-7fe1-41c0-bbbf-e15735edbdcc', 'a4000000-0000-0000-0000-000000000004',
   '0d276a96-dba6-4c1c-bbeb-fccdb62ed159',
   NOW()+INTERVAL '15 days', NOW()+INTERVAL '15 days 3 hours',
   'New York', ARRAY['jazz','live music','quartet','bebop','fusion'], 25, 75, 240, 180, true),

  ('e2000000-0000-0000-0000-000000000002',
   'Elena Vasquez: Chopin & Debussy Evening',
   'World-renowned pianist Elena Vasquez returns to Grand Symphony Hall for a breathtaking recital dedicated to the masterworks of Chopin and Debussy. Vasquez will perform Chopin''s Ballade No.1, Debussy''s Préludes Book II, and Chopin''s Sonata No.3 in B minor.',
   'World-renowned pianist Elena Vasquez performs Chopin & Debussy at Grand Symphony Hall.',
   'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_c77c6b9a-daaf-4026-a353-cbe06802920a.jpg',
   ARRAY['https://miaoda-site-img.s3cdn.medo.dev/images/KLing_c77c6b9a-daaf-4026-a353-cbe06802920a.jpg'],
   'upcoming', 'b01cfbde-7fe1-41c0-bbbf-e15735edbdcc', 'a1000000-0000-0000-0000-000000000001',
   '0d276a96-dba6-4c1c-bbeb-fccdb62ed159',
   NOW()+INTERVAL '30 days', NOW()+INTERVAL '30 days 150 minutes',
   'New York', ARRAY['classical','piano','chopin','debussy','recital'], 45, 150, 2800, 1200, true),

  ('e3000000-0000-0000-0000-000000000003',
   'Neon Pulse: Metamorphosis World Tour',
   'DJ Neon Pulse brings his record-breaking Metamorphosis World Tour to the Riverside Amphitheater for one unforgettable night under the stars. State-of-the-art light show, laser installations spanning 200 feet, and a sound system engineered for perfect outdoor acoustics.',
   'DJ Neon Pulse at LA''s Riverside Amphitheater — a spectacular outdoor electronic music experience.',
   'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_c24f28b1-dd0a-42e5-a087-4dad9b71b281.jpg',
   ARRAY['https://miaoda-site-img.s3cdn.medo.dev/images/KLing_c24f28b1-dd0a-42e5-a087-4dad9b71b281.jpg'],
   'published', '5a31966d-673e-4989-b2b3-ebd62f72c0bf', 'a3000000-0000-0000-0000-000000000003',
   '0d276a96-dba6-4c1c-bbeb-fccdb62ed159',
   NOW()+INTERVAL '20 days', NOW()+INTERVAL '20 days 6 hours',
   'Los Angeles', ARRAY['electronic','techno','house','festival','outdoor'], 35, 120, 5000, 3800, true),

  ('e4000000-0000-0000-0000-000000000004',
   'Aria Dance Company: Fractures',
   'The internationally acclaimed Aria Dance Company presents "Fractures" — a groundbreaking work exploring fragmentation and reconstruction of identity. Blends contemporary dance, martial arts-inspired movement, and cutting-edge projection art.',
   'Aria Dance Company presents "Fractures" at The Velvet Theatre — nominated for three choreography awards.',
   'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_96869af7-8a74-4528-bc4b-7876a14f8b72.jpg',
   ARRAY['https://miaoda-site-img.s3cdn.medo.dev/images/KLing_96869af7-8a74-4528-bc4b-7876a14f8b72.jpg'],
   'upcoming', 'bec687df-3a16-4b71-af7d-af0b2755843a', 'a2000000-0000-0000-0000-000000000002',
   '0d276a96-dba6-4c1c-bbeb-fccdb62ed159',
   NOW()+INTERVAL '45 days', NOW()+INTERVAL '45 days 2 hours',
   'Chicago', ARRAY['dance','contemporary','theater','performance art'], 30, 90, 900, 620, true),

  ('e5000000-0000-0000-0000-000000000005',
   'Sofia Moretti: La Traviata Gala',
   'Soprano Sofia Moretti headlines this spectacular gala of Verdi''s La Traviata at Grand Symphony Hall. Joined by baritone Ricardo Alves and an 80-piece orchestra with lavish period costumes and full three-act score.',
   'Soprano Sofia Moretti headlines a gala of Verdi''s La Traviata with full orchestra and period costumes.',
   'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_5224ef5e-56f2-4594-ad3a-6d361a07f21c.jpg',
   ARRAY['https://miaoda-site-img.s3cdn.medo.dev/images/KLing_5224ef5e-56f2-4594-ad3a-6d361a07f21c.jpg'],
   'published', 'bec687df-3a16-4b71-af7d-af0b2755843a', 'a1000000-0000-0000-0000-000000000001',
   '0d276a96-dba6-4c1c-bbeb-fccdb62ed159',
   NOW()+INTERVAL '60 days', NOW()+INTERVAL '60 days 210 minutes',
   'New York', ARRAY['opera','verdi','la traviata','classical','gala'], 60, 250, 2800, 1950, false),

  ('e6000000-0000-0000-0000-000000000006',
   'Steel Wolves: Thunder & Lightning Tour',
   'The Steel Wolves roared into Los Angeles on their record-breaking Thunder & Lightning Tour. Three platinum albums, 2.5 hours of anthemic riffs and scorching solos. Completely sold out.',
   'Austin rock legends The Steel Wolves — Thunder & Lightning Tour at Riverside Amphitheater.',
   'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_3d8da7ab-c13e-40ad-b1cd-b2d8d9bb0020.jpg',
   ARRAY['https://miaoda-site-img.s3cdn.medo.dev/images/KLing_3d8da7ab-c13e-40ad-b1cd-b2d8d9bb0020.jpg'],
   'completed', 'b01cfbde-7fe1-41c0-bbbf-e15735edbdcc', 'a3000000-0000-0000-0000-000000000003',
   '0d276a96-dba6-4c1c-bbeb-fccdb62ed159',
   NOW()-INTERVAL '10 days', NOW()-INTERVAL '10 days'+INTERVAL '3 hours',
   'Los Angeles', ARRAY['rock','alternative','live','tour'], 40, 110, 5000, 4800, false),

  ('e7000000-0000-0000-0000-000000000007',
   'Modern Art After Dark: Gallery Gala',
   'An exclusive evening at the city''s most prestigious contemporary art gallery. Live ambient performances, immersive light installations, guided tours of new acquisitions, and a champagne reception.',
   'Exclusive nighttime gallery gala with ambient music, light installations, and champagne reception.',
   'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_33a525d8-355d-4132-97aa-25bae01cf56f.jpg',
   ARRAY['https://miaoda-site-img.s3cdn.medo.dev/images/KLing_33a525d8-355d-4132-97aa-25bae01cf56f.jpg'],
   'draft', '0a4c4148-bc87-49cc-9de8-498395142d4e', 'a2000000-0000-0000-0000-000000000002',
   '0d276a96-dba6-4c1c-bbeb-fccdb62ed159',
   NOW()+INTERVAL '90 days', NOW()+INTERVAL '90 days 4 hours',
   'Chicago', ARRAY['art','gallery','modern art','immersive'], 80, 200, 300, 0, false)
ON CONFLICT (id) DO NOTHING;

-- Event Artists
INSERT INTO event_artists (event_id, artist_id) VALUES
  ('e1000000-0000-0000-0000-000000000001','b1000000-0000-0000-0000-000000000001'),
  ('e2000000-0000-0000-0000-000000000002','b2000000-0000-0000-0000-000000000002'),
  ('e3000000-0000-0000-0000-000000000003','b3000000-0000-0000-0000-000000000003'),
  ('e4000000-0000-0000-0000-000000000004','b4000000-0000-0000-0000-000000000004'),
  ('e5000000-0000-0000-0000-000000000005','b5000000-0000-0000-0000-000000000005'),
  ('e6000000-0000-0000-0000-000000000006','b6000000-0000-0000-0000-000000000006'),
  ('e7000000-0000-0000-0000-000000000007','b3000000-0000-0000-0000-000000000003')
ON CONFLICT DO NOTHING;

-- Tickets (d=hex valid)
INSERT INTO tickets (id, event_id, ticket_type, price, total_quantity, available_quantity, status, description) VALUES
  ('d1000000-0000-0000-0000-000000000001','e1000000-0000-0000-0000-000000000001','general',25,160,45,'available','Standard seating with full view of the stage'),
  ('d2000000-0000-0000-0000-000000000002','e1000000-0000-0000-0000-000000000001','vip',75,60,15,'available','Front-row seating, complimentary drink, and meet & greet'),
  ('d3000000-0000-0000-0000-000000000003','e1000000-0000-0000-0000-000000000001','early_bird',18,20,0,'sold','Early bird discount — sold out'),
  ('d4000000-0000-0000-0000-000000000004','e2000000-0000-0000-0000-000000000002','general',45,2000,1400,'available','Orchestra and balcony level seating'),
  ('d5000000-0000-0000-0000-000000000005','e2000000-0000-0000-0000-000000000002','vip',150,500,200,'available','Premium orchestra seating, programme book, and post-show reception'),
  ('d6000000-0000-0000-0000-000000000006','e2000000-0000-0000-0000-000000000002','early_bird',35,300,0,'sold','Early bird special — sold out'),
  ('d7000000-0000-0000-0000-000000000007','e3000000-0000-0000-0000-000000000003','general',35,4000,800,'available','General admission — standing area'),
  ('d8000000-0000-0000-0000-000000000008','e3000000-0000-0000-0000-000000000003','vip',120,700,400,'available','VIP enclosure with dedicated bar and elevated viewing platform'),
  ('d9000000-0000-0000-0000-000000000009','e3000000-0000-0000-0000-000000000003','early_bird',25,300,0,'sold','Early bird first release — sold out'),
  ('da000000-0000-0000-0000-000000000010','e4000000-0000-0000-0000-000000000004','general',30,600,200,'available','Standard theater seating'),
  ('db000000-0000-0000-0000-000000000011','e4000000-0000-0000-0000-000000000004','vip',90,200,80,'available','Front section seating with programme and pre-show drinks'),
  ('dc000000-0000-0000-0000-000000000012','e4000000-0000-0000-0000-000000000004','early_bird',22,100,0,'sold','Early bird limited offer — sold out'),
  ('dd000000-0000-0000-0000-000000000013','e5000000-0000-0000-0000-000000000005','general',60,1800,600,'available','Orchestra and dress circle seating'),
  ('de000000-0000-0000-0000-000000000014','e5000000-0000-0000-0000-000000000005','vip',250,600,250,'available','Box seats, champagne reception, and signed libretto'),
  ('df000000-0000-0000-0000-000000000015','e5000000-0000-0000-0000-000000000005','early_bird',50,400,0,'sold','Early booking discount — sold out'),
  ('d0100000-0000-0000-0000-000000000016','e6000000-0000-0000-0000-000000000006','general',40,4000,0,'sold','General admission — SOLD OUT'),
  ('d0200000-0000-0000-0000-000000000017','e6000000-0000-0000-0000-000000000006','vip',110,800,0,'sold','VIP package — SOLD OUT'),
  ('d0300000-0000-0000-0000-000000000018','e6000000-0000-0000-0000-000000000006','early_bird',30,200,0,'sold','Early bird — SOLD OUT')
ON CONFLICT (id) DO NOTHING;

-- Reservations (f=hex valid)
INSERT INTO reservations (id, ticket_id, user_id, event_id, quantity, total_price, status, payment_status, reservation_code) VALUES
  ('f1000000-0000-0000-0000-000000000001','d2000000-0000-0000-0000-000000000002','0d276a96-dba6-4c1c-bbeb-fccdb62ed159','e1000000-0000-0000-0000-000000000001',2,150.00,'confirmed','completed','CE-2026-001A'),
  ('f2000000-0000-0000-0000-000000000002','d5000000-0000-0000-0000-000000000005','0d276a96-dba6-4c1c-bbeb-fccdb62ed159','e2000000-0000-0000-0000-000000000002',1,150.00,'confirmed','completed','CE-2026-002B'),
  ('f3000000-0000-0000-0000-000000000003','d8000000-0000-0000-0000-000000000008','0d276a96-dba6-4c1c-bbeb-fccdb62ed159','e3000000-0000-0000-0000-000000000003',3,360.00,'confirmed','completed','CE-2026-003C'),
  ('f4000000-0000-0000-0000-000000000004','d0100000-0000-0000-0000-000000000016','0d276a96-dba6-4c1c-bbeb-fccdb62ed159','e6000000-0000-0000-0000-000000000006',2,80.00,'confirmed','completed','CE-2026-004D'),
  ('f5000000-0000-0000-0000-000000000005','db000000-0000-0000-0000-000000000011','0d276a96-dba6-4c1c-bbeb-fccdb62ed159','e4000000-0000-0000-0000-000000000004',2,180.00,'pending','pending','CE-2026-005E')
ON CONFLICT (id) DO NOTHING;
