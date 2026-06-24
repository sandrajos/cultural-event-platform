import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Sparkles, Plus, X, Upload, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AppLayout } from '@/components/layouts/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { createEvent, updateEvent, getCategories, getVenues, getArtists, uploadImage } from '@/services/api';
import type { Category, Venue, Artist, EventStatus } from '@/types/types';
import { toast } from 'sonner';
import { supabase } from '@/db/supabase';

const STATUS_OPTIONS: { value: EventStatus; label: string }[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'ongoing', label: 'Ongoing' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'completed', label: 'Completed' },
];

export default function EventFormPage({ mode = 'create', initialEvent }: {
  mode?: 'create' | 'edit';
  initialEvent?: Partial<import('@/types/types').Event>;
}) {
  const { profile } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: initialEvent?.title ?? '',
    description: initialEvent?.description ?? '',
    short_description: initialEvent?.short_description ?? '',
    city: initialEvent?.city ?? '',
    status: (initialEvent?.status ?? 'draft') as EventStatus,
    category_id: initialEvent?.category_id ?? '',
    venue_id: initialEvent?.venue_id ?? '',
    start_date: initialEvent?.start_date?.slice(0, 16) ?? '',
    end_date: initialEvent?.end_date?.slice(0, 16) ?? '',
    price_min: String(initialEvent?.price_min ?? 0),
    price_max: String(initialEvent?.price_max ?? 0),
    total_tickets: String(initialEvent?.total_tickets ?? 100),
    image_url: initialEvent?.image_url ?? '',
    tags: (initialEvent?.tags ?? []).join(', '),
  });

  const [categories, setCategories] = React.useState<Category[]>([]);
  const [venues, setVenues] = React.useState<Venue[]>([]);
  const [artists, setArtists] = React.useState<Artist[]>([]);
  const [selectedArtists, setSelectedArtists] = React.useState<string[]>(
    initialEvent?.artists?.map(a => a.id) ?? []
  );
  const [aiLoading, setAiLoading] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
    Promise.all([getCategories(), getVenues(), getArtists()])
      .then(([cats, { venues: v }, { artists: a }]) => {
        setCategories(cats);
        setVenues(v);
        setArtists(a);
      }).catch(console.error);
  }, []);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;
    if (file.size > 1024 * 1024 * 5) { toast.error('Image must be under 5MB'); return; }
    setUploading(true);
    try {
      const url = await uploadImage('event-images', profile.id, file);
      setForm(f => ({ ...f, image_url: url }));
      toast.success('Image uploaded');
    } catch { toast.error('Upload failed'); }
    finally { setUploading(false); }
  };

  const callAI = async (action: string) => {
    setAiLoading(action);
    let prompt = '';
    if (action === 'description') prompt = `Write a compelling 3-paragraph event description for: "${form.title}" in the category of ${categories.find(c => c.id === form.category_id)?.name ?? 'culture'}. Location: ${form.city}.`;
    if (action === 'tags') prompt = `Suggest 8 relevant hashtags/tags for a cultural event titled "${form.title}". Return only a comma-separated list.`;
    if (action === 'summary') prompt = `Write a 1-sentence summary (under 150 chars) for this event description: "${form.description}"`;
    if (action === 'translate') prompt = `Translate this event description to French:\n\n${form.description}`;

    try {
      const { data: urlData } = await supabase.functions.invoke('ai-assistant', {
        body: { contents: [{ role: 'user', parts: [{ text: prompt }] }] },
      });
      if (!urlData) { toast.error('AI assistant unavailable'); return; }

      // For non-streaming fallback, collect SSE text
      let result = '';
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      const resp = await fetch(`${supabaseUrl}/functions/v1/ai-assistant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${anonKey}`, apikey: anonKey },
        body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: prompt }] }] }),
      });
      const reader = resp.body?.getReader();
      const dec = new TextDecoder();
      if (reader) {
        let buf = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += dec.decode(value, { stream: true });
          const lines = buf.split('\n');
          buf = lines.pop() ?? '';
          for (const line of lines) {
            if (!line.startsWith('data:')) continue;
            const d = line.slice(5).trim();
            if (!d || d === '[DONE]') continue;
            try { result += JSON.parse(d)?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''; } catch { /* skip */ }
          }
        }
      }

      if (action === 'description') setForm(f => ({ ...f, description: result.trim() }));
      if (action === 'tags') setForm(f => ({ ...f, tags: result.trim().replace(/^#/gm, '').replace(/#/g, '').trim() }));
      if (action === 'summary') setForm(f => ({ ...f, short_description: result.trim().slice(0, 200) }));
      if (action === 'translate') setForm(f => ({ ...f, description: result.trim() }));
      toast.success('AI content generated');
    } catch { toast.error('AI assistant temporarily unavailable'); }
    finally { setAiLoading(null); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) { toast.error('Please sign in'); return; }
    if (!form.title || !form.start_date || !form.end_date || !form.city) {
      toast.error('Please fill in all required fields'); return;
    }
    setSaving(true);
    try {
      const payload = {
        title: form.title,
        description: form.description || undefined,
        short_description: form.short_description || undefined,
        city: form.city,
        status: form.status,
        category_id: form.category_id || undefined,
        venue_id: form.venue_id || undefined,
        organizer_id: profile.id,
        start_date: new Date(form.start_date).toISOString(),
        end_date: new Date(form.end_date).toISOString(),
        price_min: parseFloat(form.price_min) || 0,
        price_max: parseFloat(form.price_max) || 0,
        total_tickets: parseInt(form.total_tickets) || 0,
        image_url: form.image_url || undefined,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      };

      if (mode === 'edit' && initialEvent?.id) {
        await updateEvent(initialEvent.id, payload, selectedArtists);
        toast.success('Event updated');
        navigate(`/events/${initialEvent.id}`);
      } else {
        const data = await createEvent(payload, selectedArtists);
        toast.success('Event created');
        navigate(`/events/${data?.id}`);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to save event');
    } finally { setSaving(false); }
  };

  const toggleArtist = (id: string) =>
    setSelectedArtists(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]);

  return (
    <AppLayout>
      <div className="p-4 md:p-8 max-w-4xl mx-auto">
        <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2 text-muted-foreground">
          <Link to="/events"><ArrowLeft size={14} className="mr-1" />Back</Link>
        </Button>

        <h1 className="text-2xl md:text-3xl font-black tracking-tight mb-8">
          {mode === 'edit' ? 'Edit Event' : 'Create New Event'}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main fields */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="brutalist-card">
                <CardHeader><CardTitle className="text-sm font-black uppercase tracking-widest">Basic Information</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Title *</Label>
                    <Input value={form.title} onChange={set('title')} placeholder="Event title" className="h-11 mt-1.5" required />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <Label className="text-sm font-medium">Description</Label>
                      <div className="flex gap-1">
                        {['description', 'translate', 'summary'].map(action => (
                          <Button key={action} type="button" variant="ghost" size="sm"
                            onClick={() => callAI(action)} disabled={!!aiLoading}
                            className="h-6 text-xs text-accent hover:text-accent/80 px-2">
                            {aiLoading === action ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} className="mr-1" />}
                            {aiLoading === action ? '...' : action}
                          </Button>
                        ))}
                      </div>
                    </div>
                    <Textarea value={form.description} onChange={set('description')}
                      placeholder="Describe your event..." rows={6} className="resize-none" />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <Label className="text-sm font-medium">Short Summary</Label>
                      <Button type="button" variant="ghost" size="sm" onClick={() => callAI('summary')}
                        disabled={!!aiLoading} className="h-6 text-xs text-accent hover:text-accent/80 px-2">
                        <Sparkles size={10} className="mr-1" />AI
                      </Button>
                    </div>
                    <Input value={form.short_description} onChange={set('short_description')}
                      placeholder="One-line summary..." className="h-11" />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <Label className="text-sm font-medium">Tags</Label>
                      <Button type="button" variant="ghost" size="sm" onClick={() => callAI('tags')}
                        disabled={!!aiLoading} className="h-6 text-xs text-accent hover:text-accent/80 px-2">
                        <Sparkles size={10} className="mr-1" />Suggest
                      </Button>
                    </div>
                    <Input value={form.tags} onChange={set('tags')} placeholder="music, festival, jazz (comma separated)" className="h-11" />
                  </div>
                </CardContent>
              </Card>

              <Card className="brutalist-card">
                <CardHeader><CardTitle className="text-sm font-black uppercase tracking-widest">Date, Venue & Location</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Start Date & Time *</Label>
                    <Input type="datetime-local" value={form.start_date} onChange={set('start_date')} className="h-11 mt-1.5" required />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">End Date & Time *</Label>
                    <Input type="datetime-local" value={form.end_date} onChange={set('end_date')} className="h-11 mt-1.5" required />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">City *</Label>
                    <Input value={form.city} onChange={set('city')} placeholder="New York" className="h-11 mt-1.5" required />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Venue</Label>
                    <Select value={form.venue_id} onValueChange={v => setForm(f => ({ ...f, venue_id: v }))}>
                      <SelectTrigger className="h-11 mt-1.5"><SelectValue placeholder="Select venue" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No specific venue</SelectItem>
                        {venues.map(v => <SelectItem key={v.id} value={v.id}>{v.name} — {v.city}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card className="brutalist-card">
                <CardHeader><CardTitle className="text-sm font-black uppercase tracking-widest">Artists</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                    {artists.map(artist => (
                      <button key={artist.id} type="button" onClick={() => toggleArtist(artist.id)}
                        className={`p-2 border text-left text-sm transition-colors ${
                          selectedArtists.includes(artist.id)
                            ? 'border-accent bg-accent/10 text-accent'
                            : 'border-border hover:border-primary'
                        }`}>
                        <p className="font-semibold truncate">{artist.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{artist.genres.slice(0, 2).join(', ')}</p>
                      </button>
                    ))}
                  </div>
                  {selectedArtists.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-2">{selectedArtists.length} artist(s) selected</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar settings */}
            <div className="space-y-4">
              <Card className="brutalist-card">
                <CardHeader><CardTitle className="text-sm font-black uppercase tracking-widest">Settings</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Status</Label>
                    <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v as EventStatus }))}>
                      <SelectTrigger className="h-11 mt-1.5"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Category</Label>
                    <Select value={form.category_id} onValueChange={v => setForm(f => ({ ...f, category_id: v }))}>
                      <SelectTrigger className="h-11 mt-1.5"><SelectValue placeholder="Select category" /></SelectTrigger>
                      <SelectContent>
                        {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card className="brutalist-card">
                <CardHeader><CardTitle className="text-sm font-black uppercase tracking-widest">Pricing & Tickets</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Min Price ($)</Label>
                    <Input type="number" min="0" step="0.01" value={form.price_min} onChange={set('price_min')} className="h-11 mt-1.5" />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Max Price ($)</Label>
                    <Input type="number" min="0" step="0.01" value={form.price_max} onChange={set('price_max')} className="h-11 mt-1.5" />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Total Tickets</Label>
                    <Input type="number" min="0" value={form.total_tickets} onChange={set('total_tickets')} className="h-11 mt-1.5" />
                  </div>
                </CardContent>
              </Card>

              <Card className="brutalist-card">
                <CardHeader><CardTitle className="text-sm font-black uppercase tracking-widest">Cover Image</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {form.image_url && (
                    <div className="relative aspect-video overflow-hidden border border-border">
                      <img src={form.image_url} alt="Cover" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => setForm(f => ({ ...f, image_url: '' }))}
                        className="absolute top-1 right-1 bg-destructive text-white p-1 hover:bg-destructive/90">
                        <X size={12} />
                      </button>
                    </div>
                  )}
                  <label className="flex flex-col items-center gap-2 p-4 border border-dashed border-border cursor-pointer hover:border-primary transition-colors">
                    {uploading ? <Loader2 size={20} className="animate-spin text-muted-foreground" /> : <Upload size={20} className="text-muted-foreground" />}
                    <span className="text-xs text-muted-foreground">{uploading ? 'Uploading...' : 'Upload image (max 5MB)'}</span>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
                  </label>
                  <div>
                    <Input value={form.image_url} onChange={set('image_url')} placeholder="Or paste image URL" className="h-9 text-xs" />
                  </div>
                </CardContent>
              </Card>

              <Button type="submit" disabled={saving} className="w-full h-11 bg-accent hover:bg-accent/90 text-white font-semibold">
                {saving ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white border-t-transparent animate-spin" />Saving...</span>
                  : mode === 'edit' ? 'Update Event' : 'Create Event'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
