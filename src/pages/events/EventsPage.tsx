import React, { useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Filter, X, Calendar, MapPin, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { AppLayout } from '@/components/layouts/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { getEvents, getCategories } from '@/services/api';
import type { Event, Category, EventFilters, EventStatus } from '@/types/types';
import { format } from 'date-fns';

const STATUS_OPTIONS: { value: EventStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All Statuses' },
  { value: 'published', label: 'Published' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'ongoing', label: 'Ongoing' },
  { value: 'completed', label: 'Completed' },
  { value: 'draft', label: 'Draft' },
  { value: 'cancelled', label: 'Cancelled' },
];

const statusStyle: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground',
  published: 'bg-primary text-primary-foreground',
  upcoming: 'bg-blue-500 text-white',
  ongoing: 'bg-green-600 text-white',
  completed: 'bg-muted text-muted-foreground',
  cancelled: 'bg-destructive text-destructive-foreground',
};

function EventCard({ event }: { event: Event }) {
  return (
    <Link to={`/events/${event.id}`} className="group brutalist-card hover:border-primary transition-all block h-full flex flex-col">
      <div className="aspect-[16/9] w-full overflow-hidden bg-muted">
        {event.image_url ? (
          <img src={event.image_url} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <Calendar size={32} className="text-muted-foreground/40" />
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-2">
          <span className={`text-xs font-semibold uppercase px-2 py-0.5 ${statusStyle[event.status] || 'bg-muted'}`}>
            {event.status}
          </span>
          {event.category && (
            <span className="text-xs text-muted-foreground border border-border px-2 py-0.5">{event.category.name}</span>
          )}
        </div>
        <h3 className="font-black text-sm md:text-base mb-2 line-clamp-2 group-hover:text-accent transition-colors">{event.title}</h3>
        <div className="mt-auto space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar size={11} className="shrink-0" />
            <span className="truncate">{format(new Date(event.start_date), 'MMM d, yyyy · h:mm a')}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin size={11} className="shrink-0" />
            <span className="truncate">{event.venue?.name ? `${event.venue.name}, ` : ''}{event.city}</span>
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-sm font-black text-accent">
              {event.price_min === 0 ? 'Free' : `$${event.price_min}`}
              {event.price_max > event.price_min ? ` – $${event.price_max}` : ''}
            </span>
            <span className="text-xs text-muted-foreground">{event.sold_tickets}/{event.total_tickets} sold</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function EventsPage() {
  const { role } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const PAGE_SIZE = 12;

  const [filters, setFilters] = useState<EventFilters>({});
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [cityFilter, setCityFilter] = useState('');
  const [catFilter, setCatFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    getCategories().then(setCategories).catch(() => {});
  }, []);

  const load = useCallback(async (pageNum: number, replace: boolean) => {
    if (replace) setLoading(true);
    else setLoadingMore(true);
    try {
      const activeFilters: EventFilters = {
        ...filters,
        search: search || undefined,
        city: cityFilter || undefined,
        category_id: catFilter !== 'all' ? catFilter : undefined,
        status: statusFilter !== 'all' ? (statusFilter as EventStatus) : undefined,
      };
      const { events: data, total: t } = await getEvents(activeFilters, pageNum, PAGE_SIZE);
      setTotal(t);
      if (replace) setEvents(data);
      else setEvents(prev => [...prev, ...data]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [filters, search, cityFilter, catFilter, statusFilter]);

  useEffect(() => {
    setPage(0);
    load(0, true);
  }, [load]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    load(nextPage, false);
  };

  const clearFilters = () => {
    setSearch('');
    setCityFilter('');
    setCatFilter('all');
    setStatusFilter('all');
  };

  const hasFilters = search || cityFilter || catFilter !== 'all' || statusFilter !== 'all';

  return (
    <AppLayout>
      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">Events</h1>
            <p className="text-muted-foreground text-sm mt-1">{total} events found</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(v => !v)}
              className={showFilters ? 'bg-primary text-primary-foreground' : ''}
            >
              <Filter size={14} className="mr-2" />
              Filters {hasFilters && <span className="ml-1 w-4 h-4 bg-accent text-white text-xs rounded-full flex items-center justify-center">!</span>}
            </Button>
            {(role === 'organizer' || role === 'admin') && (
              <Button asChild className="bg-accent hover:bg-accent/90 text-white">
                <Link to="/events/create">
                  <Plus size={14} className="mr-2" />
                  New Event
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* Search bar */}
        <div className="relative mb-4">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search events..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 h-11"
          />
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div className="brutalist-card p-4 mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1.5 block">City</label>
              <Input placeholder="e.g. New York" value={cityFilter} onChange={e => setCityFilter(e.target.value)} className="h-9" />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1.5 block">Category</label>
              <Select value={catFilter} onValueChange={setCatFilter}>
                <SelectTrigger className="h-9"><SelectValue placeholder="All Categories" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1.5 block">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-9"><SelectValue placeholder="All Statuses" /></SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {hasFilters && (
              <div className="md:col-span-3 flex justify-end">
                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
                  <X size={14} className="mr-1" /> Clear Filters
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Events grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-72 bg-muted" />)}
          </div>
        ) : events.length === 0 ? (
          <div className="brutalist-card p-16 text-center">
            <Calendar size={48} className="text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="font-black text-lg mb-2">No Events Found</h3>
            <p className="text-muted-foreground text-sm mb-6">Try adjusting your filters or create a new event.</p>
            {(role === 'organizer' || role === 'admin') && (
              <Button asChild className="bg-accent hover:bg-accent/90 text-white">
                <Link to="/events/create"><Plus size={14} className="mr-2" />Create Event</Link>
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {events.map(event => <EventCard key={event.id} event={event} />)}
            </div>
            {events.length < total && (
              <div className="flex justify-center mt-8">
                <Button
                  variant="outline"
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="min-w-40"
                >
                  {loadingMore ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-current border-t-transparent animate-spin" />
                      Loading...
                    </span>
                  ) : `Load More (${total - events.length} remaining)`}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}
