import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Users, Edit, Trash2, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AppLayout } from '@/components/layouts/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { getVenue, deleteVenue, getEvents } from '@/services/api';
import type { Venue, Event } from '@/types/types';
import { toast } from 'sonner';
import { format } from 'date-fns';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from '@/components/ui/alert-dialog';

export default function VenueDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { role, profile } = useAuth();
  const navigate = useNavigate();
  const [venue, setVenue] = useState<Venue | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([getVenue(id), getEvents({ status: 'published' }, 0, 5)]).then(([v, { events: evs }]) => {
      setVenue(v);
      setEvents(evs.filter(e => e.venue_id === id));
    }).finally(() => setLoading(false));
  }, [id]);

  const canEdit = venue && (role === 'admin' || (role === 'organizer' && venue.created_by === profile?.id));

  const handleDelete = async () => {
    if (!venue) return;
    try { await deleteVenue(venue.id); toast.success('Venue deleted'); navigate('/venues'); }
    catch { toast.error('Cannot delete — venue may have scheduled events'); }
  };

  if (loading) return <AppLayout><div className="p-8 max-w-4xl mx-auto space-y-4"><Skeleton className="h-8 w-32 bg-muted" /><Skeleton className="h-64 bg-muted" /></div></AppLayout>;
  if (!venue) return <AppLayout><div className="p-8 text-center"><h2 className="font-black text-lg mb-2">Venue Not Found</h2><Button asChild variant="outline"><Link to="/venues"><ArrowLeft size={14} className="mr-2" />Back</Link></Button></div></AppLayout>;

  return (
    <AppLayout>
      <div className="p-4 md:p-8 max-w-4xl mx-auto">
        <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2 text-muted-foreground">
          <Link to="/venues"><ArrowLeft size={14} className="mr-1" />Back to Venues</Link>
        </Button>

        {venue.image_url && (
          <div className="aspect-[16/6] overflow-hidden border border-border mb-6">
            <img src={venue.image_url} alt={venue.name} className="w-full h-full object-cover" />
          </div>
        )}

        <div className="flex flex-col md:flex-row md:items-start gap-4 mb-6">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl md:text-4xl font-black tracking-tight mb-2">{venue.name}</h1>
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <MapPin size={14} /><span>{venue.address}, {venue.city}, {venue.country}</span>
            </div>
          </div>
          {canEdit && (
            <div className="flex gap-2 shrink-0">
              <Button asChild variant="outline" size="sm"><Link to={`/venues/${venue.id}/edit`}><Edit size={14} className="mr-1" />Edit</Link></Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="border-destructive text-destructive hover:bg-destructive/10"><Trash2 size={14} className="mr-1" />Delete</Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg">
                  <AlertDialogHeader><AlertDialogTitle>Delete Venue</AlertDialogTitle><AlertDialogDescription>This cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                  <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction></AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {venue.description && (
              <Card className="brutalist-card"><CardHeader><CardTitle className="text-sm font-black uppercase tracking-widest">About</CardTitle></CardHeader>
                <CardContent><p className="text-sm leading-relaxed">{venue.description}</p></CardContent></Card>
            )}

            {venue.lat && venue.lng && (
              <Card className="brutalist-card"><CardHeader><CardTitle className="text-sm font-black uppercase tracking-widest">Location Map</CardTitle></CardHeader>
                <CardContent className="p-0">
                  <iframe width="100%" height="300" style={{ border: 0 }} referrerPolicy="no-referrer-when-downgrade"
                    src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyB_LJOYJL-84SMuxNB7LtRGhxEQLjswvy0&q=${venue.lat},${venue.lng}&language=en&region=cn`}
                    allowFullScreen title="Venue map" className="block" />
                </CardContent>
              </Card>
            )}

            {events.length > 0 && (
              <Card className="brutalist-card">
                <CardHeader><CardTitle className="text-sm font-black uppercase tracking-widest">Upcoming Events Here</CardTitle></CardHeader>
                <CardContent className="divide-y divide-border">
                  {events.map(ev => (
                    <Link key={ev.id} to={`/events/${ev.id}`} className="flex items-center gap-3 py-3 hover:text-accent transition-colors">
                      <Calendar size={14} className="text-accent shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{ev.title}</p>
                        <p className="text-xs text-muted-foreground">{format(new Date(ev.start_date), 'MMM d, yyyy')}</p>
                      </div>
                    </Link>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-4">
            <Card className="brutalist-card">
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center gap-3">
                  <Users size={16} className="text-accent shrink-0" />
                  <div><p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Capacity</p><p className="text-2xl font-black">{venue.capacity.toLocaleString()}</p></div>
                </div>
                {venue.lat && venue.lng && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">Coordinates</p>
                    <p className="text-xs font-mono">{venue.lat}, {venue.lng}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
