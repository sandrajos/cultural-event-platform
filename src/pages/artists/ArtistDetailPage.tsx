import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Calendar, Globe, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AppLayout } from '@/components/layouts/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { getArtist, deleteArtist, getArtistUpcomingEvents } from '@/services/api';
import type { Artist, Event } from '@/types/types';
import { toast } from 'sonner';
import { format } from 'date-fns';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from '@/components/ui/alert-dialog';

export default function ArtistDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { role, profile } = useAuth();
  const navigate = useNavigate();
  const [artist, setArtist] = useState<Artist | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([getArtist(id), getArtistUpcomingEvents(id)]).then(([a, evs]) => { setArtist(a); setEvents(evs); }).finally(() => setLoading(false));
  }, [id]);

  const canEdit = artist && (role === 'admin' || (role === 'organizer' && artist.created_by === profile?.id));

  const handleDelete = async () => {
    if (!artist) return;
    try { await deleteArtist(artist.id); toast.success('Artist deleted'); navigate('/artists'); }
    catch { toast.error('Cannot delete — artist has upcoming events'); }
  };

  if (loading) return <AppLayout><div className="p-8 max-w-4xl mx-auto space-y-4"><Skeleton className="h-8 w-32 bg-muted" /><Skeleton className="h-64 bg-muted" /></div></AppLayout>;
  if (!artist) return <AppLayout><div className="p-8 text-center"><h2 className="font-black text-lg mb-2">Artist Not Found</h2><Button asChild variant="outline"><Link to="/artists"><ArrowLeft size={14} className="mr-2" />Back</Link></Button></div></AppLayout>;

  return (
    <AppLayout>
      <div className="p-4 md:p-8 max-w-4xl mx-auto">
        <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2 text-muted-foreground">
          <Link to="/artists"><ArrowLeft size={14} className="mr-1" />Back to Artists</Link>
        </Button>

        <div className="flex flex-col md:flex-row gap-6 mb-8">
          <div className="w-full md:w-48 aspect-[3/4] md:aspect-auto md:h-64 overflow-hidden bg-muted border border-border shrink-0">
            {artist.image_url
              ? <img src={artist.image_url} alt={artist.name} className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center"><Music size={40} className="text-muted-foreground/30" /></div>
            }
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-3">{artist.name}</h1>
            <div className="flex flex-wrap gap-2 mb-4">
              {artist.genres.map(g => (
                <span key={g} className="text-xs border border-border px-2.5 py-1 font-medium">{g}</span>
              ))}
            </div>
            {artist.website && (
              <a href={artist.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-accent hover:underline mb-3">
                <Globe size={14} />{artist.website}
              </a>
            )}
            {canEdit && (
              <div className="flex gap-2 mt-4">
                <Button asChild variant="outline" size="sm"><Link to={`/artists/${artist.id}/edit`}><Edit size={14} className="mr-1" />Edit</Link></Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" className="border-destructive text-destructive hover:bg-destructive/10"><Trash2 size={14} className="mr-1" />Delete</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg">
                    <AlertDialogHeader><AlertDialogTitle>Delete Artist</AlertDialogTitle><AlertDialogDescription>This cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                    <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction></AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {artist.biography && (
              <Card className="brutalist-card">
                <CardHeader><CardTitle className="text-sm font-black uppercase tracking-widest">Biography</CardTitle></CardHeader>
                <CardContent><p className="text-sm leading-relaxed whitespace-pre-wrap">{artist.biography}</p></CardContent>
              </Card>
            )}
          </div>
          <div>
            {events.length > 0 && (
              <Card className="brutalist-card">
                <CardHeader><CardTitle className="text-sm font-black uppercase tracking-widest">Upcoming Events</CardTitle></CardHeader>
                <CardContent className="divide-y divide-border p-0">
                  {events.map(ev => (
                    <Link key={ev.id} to={`/events/${ev.id}`} className="flex items-start gap-3 p-4 hover:bg-muted/30 transition-colors">
                      <Calendar size={14} className="text-accent mt-0.5 shrink-0" />
                      <div className="min-w-0">
                        <p className="font-semibold text-sm truncate">{ev.title}</p>
                        <p className="text-xs text-muted-foreground">{format(new Date(ev.start_date), 'MMM d, yyyy')}</p>
                        {ev.venue && <p className="text-xs text-muted-foreground truncate">{ev.venue.name}</p>}
                      </div>
                    </Link>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
