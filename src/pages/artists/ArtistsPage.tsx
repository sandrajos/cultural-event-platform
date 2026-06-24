import React, { useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Users, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AppLayout } from '@/components/layouts/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { getArtists, deleteArtist } from '@/services/api';
import type { Artist } from '@/types/types';
import { toast } from 'sonner';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from '@/components/ui/alert-dialog';

export default function ArtistsPage() {
  const { role, profile } = useAuth();
  const [artists, setArtists] = useState<Artist[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const PAGE_SIZE = 20;

  const load = useCallback(async (pageNum: number, replace: boolean) => {
    if (replace) setLoading(true); else setLoadingMore(true);
    try {
      const { artists: data, total: t } = await getArtists(search, pageNum, PAGE_SIZE);
      setTotal(t);
      if (replace) setArtists(data); else setArtists(prev => [...prev, ...data]);
    } catch (e) { console.error(e); }
    finally { setLoading(false); setLoadingMore(false); }
  }, [search]);

  useEffect(() => { setPage(0); load(0, true); }, [load]);

  const handleDelete = async (id: string) => {
    try { await deleteArtist(id); setArtists(a => a.filter(x => x.id !== id)); toast.success('Artist deleted'); }
    catch { toast.error('Cannot delete artist — may have scheduled events'); }
  };

  const canEdit = (a: Artist) => role === 'admin' || (role === 'organizer' && a.created_by === profile?.id);

  return (
    <AppLayout>
      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">Artists</h1>
            <p className="text-muted-foreground text-sm mt-1">{total} artists</p>
          </div>
          {(role === 'organizer' || role === 'admin') && (
            <Button asChild className="bg-accent hover:bg-accent/90 text-white shrink-0">
              <Link to="/artists/create"><Plus size={14} className="mr-2" />Add Artist</Link>
            </Button>
          )}
        </div>

        <div className="relative mb-6">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search artists by name..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-11" />
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => <Skeleton key={i} className="h-56 bg-muted" />)}
          </div>
        ) : artists.length === 0 ? (
          <div className="brutalist-card p-16 text-center">
            <Users size={48} className="text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="font-black text-lg mb-2">No Artists Found</h3>
            <p className="text-muted-foreground text-sm mb-6">Add artists to feature them in events.</p>
            {(role === 'organizer' || role === 'admin') && (
              <Button asChild className="bg-accent hover:bg-accent/90 text-white">
                <Link to="/artists/create"><Plus size={14} className="mr-2" />Add Artist</Link>
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {artists.map(artist => (
                <Card key={artist.id} className="brutalist-card h-full flex flex-col">
                  <Link to={`/artists/${artist.id}`} className="block flex-1">
                    <div className="aspect-[3/4] overflow-hidden bg-muted">
                      {artist.image_url
                        ? <img src={artist.image_url} alt={artist.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                        : <div className="w-full h-full flex items-center justify-center"><Users size={32} className="text-muted-foreground/30" /></div>
                      }
                    </div>
                    <div className="p-3">
                      <h3 className="font-black text-sm mb-1 hover:text-accent transition-colors line-clamp-1">{artist.name}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-1">{artist.genres.slice(0, 3).join(' · ')}</p>
                    </div>
                  </Link>
                  {canEdit(artist) && (
                    <div className="flex gap-1.5 p-3 pt-0">
                      <Button asChild variant="outline" size="sm" className="flex-1 h-7 text-xs">
                        <Link to={`/artists/${artist.id}/edit`}><Edit size={10} className="mr-1" />Edit</Link>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" className="h-7 w-7 p-0 border-destructive text-destructive hover:bg-destructive/10">
                            <Trash2 size={10} />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg">
                          <AlertDialogHeader><AlertDialogTitle>Delete Artist</AlertDialogTitle><AlertDialogDescription>Delete "{artist.name}"?</AlertDialogDescription></AlertDialogHeader>
                          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete(artist.id)} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction></AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  )}
                </Card>
              ))}
            </div>
            {artists.length < total && (
              <div className="flex justify-center mt-8">
                <Button variant="outline" onClick={() => { const next = page + 1; setPage(next); load(next, false); }} disabled={loadingMore} className="min-w-40">
                  {loadingMore ? 'Loading...' : `Load More (${total - artists.length} remaining)`}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}
