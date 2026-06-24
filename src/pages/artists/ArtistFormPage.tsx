import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Upload, Loader2, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AppLayout } from '@/components/layouts/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { getArtist, createArtist, updateArtist, uploadImage } from '@/services/api';
import type { Artist } from '@/types/types';
import { toast } from 'sonner';

export default function ArtistFormPage({ mode = 'create' }: { mode?: 'create' | 'edit' }) {
  const { id } = useParams<{ id: string }>();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', biography: '', website: '', image_url: '' });
  const [genres, setGenres] = useState<string[]>([]);
  const [genreInput, setGenreInput] = useState('');
  const [loading, setLoading] = useState(mode === 'edit');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (mode === 'edit' && id) {
      getArtist(id).then(a => {
        if (a) { setForm({ name: a.name, biography: a.biography ?? '', website: a.website ?? '', image_url: a.image_url ?? '' }); setGenres(a.genres); }
      }).finally(() => setLoading(false));
    }
  }, [mode, id]);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm(f => ({ ...f, [k]: e.target.value }));

  const addGenre = () => {
    const g = genreInput.trim();
    if (g && !genres.includes(g)) { setGenres(prev => [...prev, g]); setGenreInput(''); }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return; }
    setUploading(true);
    try { const url = await uploadImage('artist-images', profile.id, file); setForm(f => ({ ...f, image_url: url })); toast.success('Image uploaded'); }
    catch { toast.error('Upload failed'); }
    finally { setUploading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !form.name.trim()) return;
    setSaving(true);
    try {
      const payload: Partial<Artist> = { name: form.name, biography: form.biography || undefined, website: form.website || undefined, image_url: form.image_url || undefined, genres, created_by: profile.id };
      if (mode === 'edit' && id) { await updateArtist(id, payload); toast.success('Artist updated'); navigate(`/artists/${id}`); }
      else { await createArtist(payload); toast.success('Artist created'); navigate('/artists'); }
    } catch { toast.error('Failed to save artist'); }
    finally { setSaving(false); }
  };

  if (loading) return <AppLayout><div className="p-8 max-w-2xl mx-auto"><Skeleton className="h-64 bg-muted" /></div></AppLayout>;

  return (
    <AppLayout>
      <div className="p-4 md:p-8 max-w-2xl mx-auto">
        <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2 text-muted-foreground">
          <Link to="/artists"><ArrowLeft size={14} className="mr-1" />Back</Link>
        </Button>
        <h1 className="text-2xl md:text-3xl font-black tracking-tight mb-8">{mode === 'edit' ? 'Edit Artist' : 'Add New Artist'}</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="brutalist-card">
            <CardHeader><CardTitle className="text-sm font-black uppercase tracking-widest">Artist Info</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div><Label className="text-sm font-medium">Name *</Label><Input value={form.name} onChange={set('name')} placeholder="Artist name" className="h-11 mt-1.5" required /></div>
              <div><Label className="text-sm font-medium">Biography</Label><Textarea value={form.biography} onChange={set('biography')} placeholder="Artist biography..." rows={5} className="resize-none mt-1.5" /></div>
              <div><Label className="text-sm font-medium">Website</Label><Input value={form.website} onChange={set('website')} placeholder="https://..." className="h-11 mt-1.5" /></div>
            </CardContent>
          </Card>

          <Card className="brutalist-card">
            <CardHeader><CardTitle className="text-sm font-black uppercase tracking-widest">Genres</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input value={genreInput} onChange={e => setGenreInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addGenre(); } }} placeholder="e.g. Jazz, Classical, Electronic" className="h-9 flex-1" />
                <Button type="button" onClick={addGenre} variant="outline" size="sm" className="h-9"><Plus size={14} /></Button>
              </div>
              {genres.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {genres.map(g => (
                    <span key={g} className="flex items-center gap-1 text-xs border border-border px-2 py-1">
                      {g}<button type="button" onClick={() => setGenres(prev => prev.filter(x => x !== g))}><X size={10} /></button>
                    </span>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="brutalist-card">
            <CardHeader><CardTitle className="text-sm font-black uppercase tracking-widest">Photo</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {form.image_url && (
                <div className="w-32 aspect-[3/4] overflow-hidden border border-border">
                  <img src={form.image_url} alt="Artist" className="w-full h-full object-cover" />
                </div>
              )}
              <label className="flex items-center gap-3 p-3 border border-dashed border-border cursor-pointer hover:border-primary transition-colors">
                {uploading ? <Loader2 size={16} className="animate-spin text-muted-foreground" /> : <Upload size={16} className="text-muted-foreground" />}
                <span className="text-sm text-muted-foreground">{uploading ? 'Uploading...' : 'Upload photo'}</span>
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
              </label>
              <Input value={form.image_url} onChange={set('image_url')} placeholder="Or paste image URL" className="h-9 text-xs" />
            </CardContent>
          </Card>

          <Button type="submit" disabled={saving} className="w-full h-11 bg-accent hover:bg-accent/90 text-white font-semibold">
            {saving ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white border-t-transparent animate-spin" />Saving...</span> : mode === 'edit' ? 'Update Artist' : 'Create Artist'}
          </Button>
        </form>
      </div>
    </AppLayout>
  );
}
