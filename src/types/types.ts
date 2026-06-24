export type UserRole = 'visitor' | 'organizer' | 'admin';
export type EventStatus = 'draft' | 'published' | 'cancelled' | 'completed' | 'upcoming' | 'ongoing';
export type TicketStatus = 'available' | 'reserved' | 'sold' | 'cancelled';
export type ReservationStatus = 'pending' | 'confirmed' | 'cancelled' | 'refunded';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export interface Profile {
  id: string;
  username: string;
  email?: string;
  full_name?: string;
  avatar_url?: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color: string;
  icon?: string;
  created_at: string;
}

export interface Venue {
  id: string;
  name: string;
  address: string;
  city: string;
  country: string;
  capacity: number;
  lat?: number;
  lng?: number;
  image_url?: string;
  description?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  creator?: Profile;
}

export interface Artist {
  id: string;
  name: string;
  biography?: string;
  genres: string[];
  image_url?: string;
  website?: string;
  social_links?: Record<string, string>;
  created_by: string;
  created_at: string;
  updated_at: string;
  creator?: Profile;
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  short_description?: string;
  image_url?: string;
  images: string[];
  status: EventStatus;
  category_id?: string;
  venue_id?: string;
  organizer_id: string;
  start_date: string;
  end_date: string;
  city: string;
  tags: string[];
  price_min: number;
  price_max: number;
  total_tickets: number;
  sold_tickets: number;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  category?: Category;
  venue?: Venue;
  organizer?: Profile;
  artists?: Artist[];
}

export interface Ticket {
  id: string;
  event_id: string;
  ticket_type: string;
  price: number;
  total_quantity: number;
  available_quantity: number;
  status: TicketStatus;
  description?: string;
  created_at: string;
  updated_at: string;
  event?: Event;
}

export interface Reservation {
  id: string;
  ticket_id: string;
  user_id: string;
  event_id: string;
  quantity: number;
  total_price: number;
  status: ReservationStatus;
  payment_status: PaymentStatus;
  payment_intent_id?: string;
  pdf_url?: string;
  reservation_code: string;
  created_at: string;
  updated_at: string;
  ticket?: Ticket;
  event?: Event;
  user?: Profile;
}

export interface AuditLog {
  id: string;
  user_id?: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  old_data?: Record<string, unknown>;
  new_data?: Record<string, unknown>;
  ip_address?: string;
  created_at: string;
  user?: Profile;
}

export interface DashboardStats {
  total_events: number;
  published_events: number;
  total_tickets_sold: number;
  total_revenue: number;
  total_artists: number;
  total_venues: number;
  monthly_data: MonthlyData[];
  popular_events: Event[];
}

export interface MonthlyData {
  month: string;
  tickets_sold: number;
  revenue: number;
  events: number;
}

export interface EventFilters {
  search?: string;
  city?: string;
  category_id?: string;
  organizer_id?: string;
  status?: EventStatus;
  start_date?: string;
  end_date?: string;
}
