import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Upload, Loader2, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AppLayout } from '@/components/layouts/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { getVenue, createVenue, updateVenue, uploadImage } from '@/services/api';
import type { Venue } from '@/types/types';
import { toast } from 'sonner';

export default function VenueFormPage({ mode = 'create' }: { mode?: 'create' | 'edit' }) {
  const { id } = useParams<{ id: string }>();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', address: '', city: '', country: 'USA', capacity: '0', lat: '', lng: '', description: '', image_url: '' });
  const [loading, setLoading] = useState(mode === 'edit');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (mode === 'edit' && id) {
      getVenue(id).then(v => {
        if (v) setForm({ name: v.name, address: v.address, city: v.city, country: v.country, capacity: String(v.capacity), lat: String(v.lat ?? ''), lng: String(v.lng ?? ''), description: v.description ?? '', image_url: v.image_url ?? '' });
      }).finally(() => setLoading(false));
    }
  }, [mode, id]);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return; }
    setUploading(true);
    try { const url = await uploadImage('venue-images', profile.id, file); setForm(f => ({ ...f, image_url: url })); toast.success('Image uploaded'); }
    catch { toast.error('Upload failed'); }
    finally { setUploading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    try {
      const payload: Partial<Venue> = {
        name: form.name, address: form.address, city: form.city, country: form.country,
        capacity: parseInt(form.capacity) || 0,
        lat: form.lat ? parseFloat(form.lat) : undefined,
        lng: form.lng ? parseFloat(form.lng) : undefined,
        description: form.description || undefined,
        image_url: form.image_url || undefined,
        created_by: profile.id,
      };
      if (mode === 'edit' && id) { await updateVenue(id, payload); toast.success('Venue updated'); navigate(`/venues/${id}`); }
      else { await createVenue(payload); toast.success('Venue created'); navigate('/venues'); }
    } catch { toast.error('Failed to save venue'); }
    finally { setSaving(false); }
  };

  if (loading) return <AppLayout><div className="p-8 max-w-2xl mx-auto space-y-4"><Skeleton className="h-8 w-32 bg-muted" /><Skeleton className="h-64 bg-muted" /></div></AppLayout>;

  return (
    <AppLayout>
      <div className="p-4 md:p-8 max-w-2xl mx-auto">
        <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2 text-muted-foreground">
          <Link to="/venues"><ArrowLeft size={14} className="mr-1" />Back</Link>
        </Button>
        <h1 className="text-2xl md:text-3xl font-black tracking-tight mb-8">{mode === 'edit' ? 'Edit Venue' : 'Add New Venue'}</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="brutalist-card">
            <CardHeader><CardTitle className="text-sm font-black uppercase tracking-widest">Venue Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div><Label className="text-sm font-medium">Name *</Label><Input value={form.name} onChange={set('name')} placeholder="Grand Theater" className="h-11 mt-1.5" required /></div>
              <div><Label className="text-sm font-medium">Address *</Label><Input value={form.address} onChange={set('address')} placeholder="123 Main St" className="h-11 mt-1.5" required /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label className="text-sm font-medium">City *</Label><Input value={form.city} onChange={set('city')} placeholder="New York" className="h-11 mt-1.5" required /></div>
                <div><Label className="text-sm font-medium">Country</Label><Input value={form.country} onChange={set('country')} placeholder="USA" className="h-11 mt-1.5" /></div>
              </div>
              <div><Label className="text-sm font-medium">Capacity</Label><Input type="number" min="0" value={form.capacity} onChange={set('capacity')} className="h-11 mt-1.5" /></div>
              <div><Label className="text-sm font-medium">Description</Label><Textarea value={form.description} onChange={set('description')} placeholder="Venue description..." rows={3} className="resize-none mt-1.5" /></div>
            </CardContent>
          </Card>

          <Card className="brutalist-card">
            <CardHeader><CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2"><MapPin size={14} />Map Coordinates</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div><Label className="text-sm font-medium">Latitude</Label><Input type="number" step="any" value={form.lat} onChange={set('lat')} placeholder="40.7128" className="h-11 mt-1.5" /></div>
              <div><Label className="text-sm font-medium">Longitude</Label><Input type="number" step="any" value={form.lng} onChange={set('lng')} placeholder="-74.0060" className="h-11 mt-1.5" /></div>
              {form.lat && form.lng && (
                <div className="col-span-2">
                  <iframe
                    width="100%" height="200" style={{ border: 0 }} referrerPolicy="no-referrer-when-downgrade"
                    src={`https://www.google.com/maps/embed/v1/view?key=AIzaSyB_LJOYJL-84SMuxNB7LtRGhxEQLjswvy0&center=${form.lat},${form.lng}&zoom=15&language=en&region=cn`}
                    allowFullScreen title="Venue map" className="border border-border"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="brutalist-card">
            <CardHeader><CardTitle className="text-sm font-black uppercase tracking-widest">Venue Image</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {form.image_url && <div className="aspect-[16/9] overflow-hidden border border-border"><img src={form.image_url} alt="Venue" className="w-full h-full object-cover" /></div>}
              <label className="flex items-center gap-3 p-3 border border-dashed border-border cursor-pointer hover:border-primary transition-colors">
                {uploading ? <Loader2 size={16} className="animate-spin text-muted-foreground" /> : <Upload size={16} className="text-muted-foreground" />}
                <span className="text-sm text-muted-foreground">{uploading ? 'Uploading...' : 'Upload image'}</span>
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
              </label>
              <Input value={form.image_url} onChange={set('image_url')} placeholder="Or paste image URL" className="h-9 text-xs" />
            </CardContent>
          </Card>

          <Button type="submit" disabled={saving} className="w-full h-11 bg-accent hover:bg-accent/90 text-white font-semibold">
            {saving ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white border-t-transparent animate-spin" />Saving...</span> : mode === 'edit' ? 'Update Venue' : 'Create Venue'}
          </Button>
        </form>
      </div>
    </AppLayout>
  );
}
