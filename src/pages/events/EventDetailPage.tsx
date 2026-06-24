import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Calendar, MapPin, Users, Ticket as TicketIcon, Edit, Trash2, ArrowLeft, Tag, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AppLayout } from '@/components/layouts/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { getEvent, deleteEvent, getTicketsForEvent } from '@/services/api';
import type { Event, Ticket } from '@/types/types';
import { format } from 'date-fns';
import { toast } from 'sonner';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import ReserveModal from './ReserveModal';

const statusStyle: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground',
  published: 'bg-primary text-primary-foreground',
  upcoming: 'bg-blue-500 text-white',
  ongoing: 'bg-green-600 text-white',
  completed: 'bg-muted text-muted-foreground',
  cancelled: 'bg-destructive text-destructive-foreground',
};

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { role, profile } = useAuth();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  useEffect(() => {
    if (!id) return;
    Promise.all([getEvent(id), getTicketsForEvent(id)])
      .then(([ev, tix]) => {
        setEvent(ev);
        setTickets(tix);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const canEdit = event && (role === 'admin' || (role === 'organizer' && event.organizer_id === profile?.id));

  const handleDelete = async () => {
    if (!event) return;
    try {
      await deleteEvent(event.id);
      toast.success('Event deleted');
      navigate('/events');
    } catch {
      toast.error('Failed to delete event');
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-4">
          <Skeleton className="h-8 w-32 bg-muted" />
          <Skeleton className="h-64 bg-muted" />
          <div className="grid grid-cols-3 gap-4">
            <Skeleton className="h-32 bg-muted" />
            <Skeleton className="h-32 bg-muted" />
            <Skeleton className="h-32 bg-muted" />
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!event) {
    return (
      <AppLayout>
        <div className="p-8 text-center">
          <h2 className="text-xl font-black mb-2">Event Not Found</h2>
          <Button asChild variant="outline"><Link to="/events"><ArrowLeft size={14} className="mr-2" />Back to Events</Link></Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-4 md:p-8 max-w-5xl mx-auto">
        {/* Back */}
        <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2 text-muted-foreground">
          <Link to="/events"><ArrowLeft size={14} className="mr-1" />Back to Events</Link>
        </Button>

        {/* Hero image */}
        {event.image_url && (
          <div className="aspect-[16/6] w-full overflow-hidden bg-muted mb-6 border border-border">
            <img src={event.image_url} alt={event.title} className="w-full h-full object-cover" />
          </div>
        )}

        {/* Title + actions */}
        <div className="flex flex-col md:flex-row md:items-start gap-4 mb-6">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className={`text-xs font-bold uppercase px-2.5 py-1 ${statusStyle[event.status] || 'bg-muted'}`}>
                {event.status}
              </span>
              {event.category && (
                <span className="text-xs border border-border px-2.5 py-1 font-medium">{event.category.name}</span>
              )}
            </div>
            <h1 className="text-2xl md:text-4xl font-black tracking-tight mb-2">{event.title}</h1>
            <p className="text-muted-foreground text-sm">by {event.organizer?.full_name || event.organizer?.username}</p>
          </div>
          {canEdit && (
            <div className="flex items-center gap-2 shrink-0">
              <Button asChild variant="outline" size="sm">
                <Link to={`/events/${event.id}/edit`}><Edit size={14} className="mr-1" />Edit</Link>
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="border-destructive text-destructive hover:bg-destructive/10">
                    <Trash2 size={14} className="mr-1" />Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Event</AlertDialogTitle>
                    <AlertDialogDescription>This action cannot be undone. All tickets and reservations will also be deleted.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            {event.description && (
              <Card className="brutalist-card">
                <CardHeader><CardTitle className="text-sm font-black uppercase tracking-widest">About This Event</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{event.description}</p>
                </CardContent>
              </Card>
            )}

            {/* Artists */}
            {event.artists && event.artists.length > 0 && (
              <Card className="brutalist-card">
                <CardHeader><CardTitle className="text-sm font-black uppercase tracking-widest">Featuring</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {event.artists.map(artist => (
                    <Link key={artist.id} to={`/artists/${artist.id}`}
                      className="flex items-center gap-3 p-3 border border-border hover:border-primary hover:bg-muted/30 transition-colors">
                      {artist.image_url
                        ? <img src={artist.image_url} alt={artist.name} className="w-12 h-12 object-cover shrink-0" />
                        : <div className="w-12 h-12 bg-muted flex items-center justify-center shrink-0"><Users size={16} className="text-muted-foreground" /></div>
                      }
                      <div className="min-w-0">
                        <p className="font-semibold text-sm">{artist.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{artist.genres.join(', ')}</p>
                      </div>
                    </Link>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Tags */}
            {event.tags && event.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {event.tags.map(tag => (
                  <span key={tag} className="flex items-center gap-1 text-xs border border-border px-2 py-1">
                    <Tag size={10} />{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Event info */}
            <Card className="brutalist-card">
              <CardContent className="p-4 space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar size={16} className="text-accent mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-0.5">Date & Time</p>
                    <p className="text-sm font-semibold">{format(new Date(event.start_date), 'EEEE, MMM d, yyyy')}</p>
                    <p className="text-xs text-muted-foreground">{format(new Date(event.start_date), 'h:mm a')} – {format(new Date(event.end_date), 'h:mm a')}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin size={16} className="text-accent mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-0.5">Venue</p>
                    {event.venue ? (
                      <Link to={`/venues/${event.venue.id}`} className="text-sm font-semibold hover:text-accent flex items-center gap-1">
                        {event.venue.name} <ExternalLink size={10} />
                      </Link>
                    ) : <p className="text-sm">{event.city}</p>}
                    <p className="text-xs text-muted-foreground">{event.venue?.address || event.city}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tickets */}
            <Card className="brutalist-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-black uppercase tracking-widest">Tickets</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {tickets.length === 0 ? (
                  <p className="text-sm text-muted-foreground p-4">No tickets available</p>
                ) : (
                  <div className="divide-y divide-border">
                    {tickets.map(ticket => (
                      <div key={ticket.id} className="p-4 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold capitalize">{ticket.ticket_type}</p>
                          <p className="text-xs text-muted-foreground">{ticket.available_quantity} remaining</p>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-sm text-accent">{ticket.price === 0 ? 'Free' : `$${ticket.price}`}</p>
                          {role && ticket.available_quantity > 0 && event.status !== 'cancelled' && (
                            <Button
                              size="sm"
                              className="mt-1 bg-accent hover:bg-accent/90 text-white text-xs h-7"
                              onClick={() => setSelectedTicket(ticket)}
                            >
                              Reserve
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {selectedTicket && (
        <ReserveModal
          ticket={selectedTicket}
          event={event}
          open={!!selectedTicket}
          onClose={() => setSelectedTicket(null)}
        />
      )}
    </AppLayout>
  );
}
