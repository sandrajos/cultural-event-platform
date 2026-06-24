import { supabase } from '@/db/supabase';
import type {
  Event, EventFilters, Venue, Artist, Category,
  Ticket, Reservation, Profile, AuditLog, DashboardStats
} from '@/types/types';

// ── Events ─────────────────────────────────────────────────────────────────

export async function getEvents(filters: EventFilters = {}, page = 0, pageSize = 12) {
  let q = supabase
    .from('events')
    .select(`
      *,
      category:categories(*),
      venue:venues(id,name,city,address),
      organizer:profiles!events_organizer_id_fkey(id,username,full_name,avatar_url)
    `, { count: 'exact' })
    .order('start_date', { ascending: true })
    .range(page * pageSize, (page + 1) * pageSize - 1);

  if (filters.search) q = q.ilike('title', `%${filters.search}%`);
  if (filters.city) q = q.ilike('city', `%${filters.city}%`);
  if (filters.category_id) q = q.eq('category_id', filters.category_id);
  if (filters.organizer_id) q = q.eq('organizer_id', filters.organizer_id);
  if (filters.status) q = q.eq('status', filters.status);
  if (filters.start_date) q = q.gte('start_date', filters.start_date);
  if (filters.end_date) q = q.lte('end_date', filters.end_date);

  const { data, error, count } = await q;
  if (error) throw error;
  return { events: (Array.isArray(data) ? data : []) as Event[], total: count ?? 0 };
}

export async function getEvent(id: string) {
  const { data, error } = await supabase
    .from('events')
    .select(`
      *,
      category:categories(*),
      venue:venues(*),
      organizer:profiles!events_organizer_id_fkey(id,username,full_name,avatar_url),
      event_artists(artist_id, artists(*))
    `)
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;

  // Flatten artists
  const artists = (data.event_artists as Array<{ artists: Artist }>)?.map(ea => ea.artists) ?? [];
  return { ...data, artists } as Event;
}

export async function createEvent(payload: Partial<Event>, artistIds: string[]) {
  const { data, error } = await supabase
    .from('events')
    .insert(payload)
    .select('id')
    .maybeSingle();
  if (error) throw error;
  if (data && artistIds.length > 0) {
    await supabase.from('event_artists').insert(
      artistIds.map(aid => ({ event_id: data.id, artist_id: aid }))
    );
  }
  return data as { id: string };
}

export async function updateEvent(id: string, payload: Partial<Event>, artistIds?: string[]) {
  const { error } = await supabase.from('events').update(payload).eq('id', id);
  if (error) throw error;
  if (artistIds !== undefined) {
    await supabase.from('event_artists').delete().eq('event_id', id);
    if (artistIds.length > 0) {
      await supabase.from('event_artists').insert(
        artistIds.map(aid => ({ event_id: id, artist_id: aid }))
      );
    }
  }
}

export async function deleteEvent(id: string) {
  const { error } = await supabase.from('events').delete().eq('id', id);
  if (error) throw error;
}

// ── Venues ──────────────────────────────────────────────────────────────────

export async function getVenues(search = '', page = 0, pageSize = 20) {
  let q = supabase
    .from('venues')
    .select('*, creator:profiles!venues_created_by_fkey(id,username,full_name)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(page * pageSize, (page + 1) * pageSize - 1);

  if (search) q = q.or(`name.ilike.%${search}%,city.ilike.%${search}%`);

  const { data, error, count } = await q;
  if (error) throw error;
  return { venues: (Array.isArray(data) ? data : []) as Venue[], total: count ?? 0 };
}

export async function getVenue(id: string) {
  const { data, error } = await supabase
    .from('venues')
    .select('*, creator:profiles!venues_created_by_fkey(id,username,full_name)')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data as Venue | null;
}

export async function createVenue(payload: Partial<Venue>) {
  const { error } = await supabase.from('venues').insert(payload);
  if (error) throw error;
}

export async function updateVenue(id: string, payload: Partial<Venue>) {
  const { error } = await supabase.from('venues').update(payload).eq('id', id);
  if (error) throw error;
}

export async function deleteVenue(id: string) {
  const { error } = await supabase.from('venues').delete().eq('id', id);
  if (error) throw error;
}

// ── Artists ──────────────────────────────────────────────────────────────────

export async function getArtists(search = '', page = 0, pageSize = 20) {
  let q = supabase
    .from('artists')
    .select('*, creator:profiles!artists_created_by_fkey(id,username)', { count: 'exact' })
    .order('name', { ascending: true })
    .range(page * pageSize, (page + 1) * pageSize - 1);

  if (search) q = q.or(`name.ilike.%${search}%`);

  const { data, error, count } = await q;
  if (error) throw error;
  return { artists: (Array.isArray(data) ? data : []) as Artist[], total: count ?? 0 };
}

export async function getArtist(id: string) {
  const { data, error } = await supabase
    .from('artists')
    .select('*, creator:profiles!artists_created_by_fkey(id,username)')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data as Artist | null;
}

export async function createArtist(payload: Partial<Artist>) {
  const { error } = await supabase.from('artists').insert(payload);
  if (error) throw error;
}

export async function updateArtist(id: string, payload: Partial<Artist>) {
  const { error } = await supabase.from('artists').update(payload).eq('id', id);
  if (error) throw error;
}

export async function deleteArtist(id: string) {
  const { error } = await supabase.from('artists').delete().eq('id', id);
  if (error) throw error;
}

export async function getArtistUpcomingEvents(artistId: string) {
  const { data, error } = await supabase
    .from('event_artists')
    .select('events(*, venue:venues(name,city), category:categories(name,color))')
    .eq('artist_id', artistId)
    .limit(10);
  if (error) throw error;
  return (data ?? []).map((d: { events: unknown }) => d.events as Event).filter(Boolean) as Event[];
}

// ── Categories ───────────────────────────────────────────────────────────────

export async function getCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name');
  if (error) throw error;
  return (Array.isArray(data) ? data : []) as Category[];
}

// ── Tickets ──────────────────────────────────────────────────────────────────

export async function getTicketsForEvent(eventId: string) {
  const { data, error } = await supabase
    .from('tickets')
    .select('*')
    .eq('event_id', eventId)
    .order('price');
  if (error) throw error;
  return (Array.isArray(data) ? data : []) as Ticket[];
}

export async function getTickets(page = 0, pageSize = 20) {
  const { data, error, count } = await supabase
    .from('tickets')
    .select('*, event:events(id,title,start_date,status,image_url)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(page * pageSize, (page + 1) * pageSize - 1);
  if (error) throw error;
  return { tickets: (Array.isArray(data) ? data : []) as Ticket[], total: count ?? 0 };
}

export async function createTicket(payload: Partial<Ticket>) {
  const { error } = await supabase.from('tickets').insert(payload);
  if (error) throw error;
}

export async function updateTicket(id: string, payload: Partial<Ticket>) {
  const { error } = await supabase.from('tickets').update(payload).eq('id', id);
  if (error) throw error;
}

export async function deleteTicket(id: string) {
  const { error } = await supabase.from('tickets').delete().eq('id', id);
  if (error) throw error;
}

// ── Reservations ─────────────────────────────────────────────────────────────

export async function getMyReservations(userId: string, page = 0, pageSize = 20) {
  const { data, error, count } = await supabase
    .from('reservations')
    .select(`
      *,
      event:events(id,title,start_date,image_url,city,status),
      ticket:tickets(ticket_type,price)
    `, { count: 'exact' })
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(page * pageSize, (page + 1) * pageSize - 1);
  if (error) throw error;
  return { reservations: (Array.isArray(data) ? data : []) as Reservation[], total: count ?? 0 };
}

export async function getAllReservations(page = 0, pageSize = 20) {
  const { data, error, count } = await supabase
    .from('reservations')
    .select(`
      *,
      event:events(id,title,start_date),
      ticket:tickets(ticket_type,price),
      user:profiles!reservations_user_id_fkey(id,username,full_name)
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(page * pageSize, (page + 1) * pageSize - 1);
  if (error) throw error;
  return { reservations: (Array.isArray(data) ? data : []) as Reservation[], total: count ?? 0 };
}

export async function createReservation(payload: Partial<Reservation>) {
  const { data, error } = await supabase
    .from('reservations')
    .insert(payload)
    .select('id, reservation_code')
    .maybeSingle();
  if (error) throw error;
  return data as { id: string; reservation_code: string } | null;
}

export async function updateReservation(id: string, payload: Partial<Reservation>) {
  const { error } = await supabase.from('reservations').update(payload).eq('id', id);
  if (error) throw error;
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

export async function getDashboardStats(organizerId?: string): Promise<DashboardStats> {
  let eventsQ = supabase.from('events').select('id,status,sold_tickets,price_min,price_max,start_date,title,image_url,city', { count: 'exact' });
  if (organizerId) eventsQ = eventsQ.eq('organizer_id', organizerId);

  const { data: events } = await eventsQ.order('sold_tickets', { ascending: false }).limit(200);
  const eventsArr = (Array.isArray(events) ? events : []) as Partial<Event>[];

  const total_events = eventsArr.length;
  const published_events = eventsArr.filter(e => e.status === 'published').length;
  const total_tickets_sold = eventsArr.reduce((s, e) => s + (e.sold_tickets ?? 0), 0);
  const total_revenue = eventsArr.reduce((s, e) => s + (e.sold_tickets ?? 0) * (e.price_min ?? 0), 0);

  const popularEvents = [...eventsArr]
    .sort((a, b) => (b.sold_tickets ?? 0) - (a.sold_tickets ?? 0))
    .slice(0, 5) as Event[];

  // Monthly aggregation from event start_dates
  const monthMap: Record<string, { tickets_sold: number; revenue: number; events: number }> = {};
  eventsArr.forEach(e => {
    if (!e.start_date) return;
    const m = e.start_date.slice(0, 7);
    if (!monthMap[m]) monthMap[m] = { tickets_sold: 0, revenue: 0, events: 0 };
    monthMap[m].tickets_sold += e.sold_tickets ?? 0;
    monthMap[m].revenue += (e.sold_tickets ?? 0) * (e.price_min ?? 0);
    monthMap[m].events += 1;
  });
  const monthly_data = Object.entries(monthMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-12)
    .map(([month, d]) => ({ month, ...d }));

  const { count: total_artists } = await supabase.from('artists').select('id', { count: 'exact', head: true });
  const { count: total_venues } = await supabase.from('venues').select('id', { count: 'exact', head: true });

  return {
    total_events,
    published_events,
    total_tickets_sold,
    total_revenue,
    total_artists: total_artists ?? 0,
    total_venues: total_venues ?? 0,
    monthly_data,
    popular_events: popularEvents,
  };
}

// ── Users (admin) ─────────────────────────────────────────────────────────────

export async function getUsers(page = 0, pageSize = 20) {
  const { data, error, count } = await supabase
    .from('profiles')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(page * pageSize, (page + 1) * pageSize - 1);
  if (error) throw error;
  return { users: (Array.isArray(data) ? data : []) as Profile[], total: count ?? 0 };
}

export async function updateUserRole(id: string, role: string) {
  const { error } = await supabase.from('profiles').update({ role }).eq('id', id);
  if (error) throw error;
}

// ── Audit logs ────────────────────────────────────────────────────────────────

export async function getAuditLogs(page = 0, pageSize = 30) {
  const { data, error, count } = await supabase
    .from('audit_logs')
    .select('*, user:profiles!audit_logs_user_id_fkey(id,username)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(page * pageSize, (page + 1) * pageSize - 1);
  if (error) throw error;
  return { logs: (Array.isArray(data) ? data : []) as AuditLog[], total: count ?? 0 };
}

export async function insertAuditLog(entry: Partial<AuditLog>) {
  await supabase.from('audit_logs').insert(entry);
}

// ── Storage ───────────────────────────────────────────────────────────────────

export async function uploadImage(bucket: string, userId: string, file: File): Promise<string> {
  const ext = file.name.split('.').pop() ?? 'jpg';
  const path = `${userId}/${Date.now()}.${ext}`;
  const { data, error } = await supabase.storage.from(bucket).upload(path, file, { contentType: file.type });
  if (error) throw error;
  const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path);
  return urlData.publicUrl;
}
