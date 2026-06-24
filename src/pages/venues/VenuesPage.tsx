import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Plus, MapPin, Users, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AppLayout } from '@/components/layouts/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { getVenues, deleteVenue } from '@/services/api';
import type { Venue } from '@/types/types';
import { toast } from 'sonner';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from '@/components/ui/alert-dialog';

export default function VenuesPage() {
  const { role, profile } = useAuth();
  const [venues, setVenues] = useState<Venue[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const PAGE_SIZE = 20;

  const load = useCallback(async (pageNum: number, replace: boolean) => {
    if (replace) setLoading(true); else setLoadingMore(true);
    try {
      const { venues: data, total: t } = await getVenues(search, pageNum, PAGE_SIZE);
      setTotal(t);
      if (replace) setVenues(data); else setVenues(prev => [...prev, ...data]);
    } catch (e) { console.error(e); }
    finally { setLoading(false); setLoadingMore(false); }
  }, [search]);

  useEffect(() => { setPage(0); load(0, true); }, [load]);

  const handleDelete = async (id: string) => {
    try { await deleteVenue(id); setVenues(v => v.filter(x => x.id !== id)); toast.success('Venue deleted'); }
    catch { toast.error('Cannot delete venue — may have scheduled events'); }
  };

  const canEdit = (v: Venue) => role === 'admin' || (role === 'organizer' && v.created_by === profile?.id);

  return (
    <AppLayout>
      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">Venues</h1>
            <p className="text-muted-foreground text-sm mt-1">{total} venues</p>
          </div>
          {(role === 'organizer' || role === 'admin') && (
            <Button asChild className="bg-accent hover:bg-accent/90 text-white shrink-0">
              <Link to="/venues/create"><Plus size={14} className="mr-2" />Add Venue</Link>
            </Button>
          )}
        </div>

        <div className="relative mb-6">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search venues by name or city..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-11" />
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-48 bg-muted" />)}
          </div>
        ) : venues.length === 0 ? (
          <div className="brutalist-card p-16 text-center">
            <MapPin size={48} className="text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="font-black text-lg mb-2">No Venues Found</h3>
            <p className="text-muted-foreground text-sm mb-6">Add your first venue to get started.</p>
            {(role === 'organizer' || role === 'admin') && (
              <Button asChild className="bg-accent hover:bg-accent/90 text-white">
                <Link to="/venues/create"><Plus size={14} className="mr-2" />Add Venue</Link>
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {venues.map(venue => (
                <Card key={venue.id} className="brutalist-card h-full flex flex-col">
                  {venue.image_url && (
                    <div className="aspect-[16/9] overflow-hidden bg-muted">
                      <img src={venue.image_url} alt={venue.name} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <CardContent className="p-4 flex flex-col flex-1">
                    <Link to={`/venues/${venue.id}`} className="block flex-1">
                      <h3 className="font-black text-base mb-1 hover:text-accent transition-colors">{venue.name}</h3>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                        <MapPin size={11} className="shrink-0" />
                        <span className="truncate">{venue.address}, {venue.city}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
                        <Users size={11} className="shrink-0" />
                        <span>Capacity: {venue.capacity.toLocaleString()}</span>
                      </div>
                      {venue.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2">{venue.description}</p>
                      )}
                    </Link>
                    {canEdit(venue) && (
                      <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                        <Button asChild variant="outline" size="sm" className="flex-1 h-8">
                          <Link to={`/venues/${venue.id}/edit`}><Edit size={12} className="mr-1" />Edit</Link>
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" className="h-8 border-destructive text-destructive hover:bg-destructive/10">
                              <Trash2 size={12} />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg">
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Venue</AlertDialogTitle>
                              <AlertDialogDescription>Are you sure you want to delete "{venue.name}"?</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(venue.id)} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
            {venues.length < total && (
              <div className="flex justify-center mt-8">
                <Button variant="outline" onClick={() => { const next = page + 1; setPage(next); load(next, false); }} disabled={loadingMore} className="min-w-40">
                  {loadingMore ? 'Loading...' : `Load More (${total - venues.length} remaining)`}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}
