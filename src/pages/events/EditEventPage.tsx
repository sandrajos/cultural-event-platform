import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import EventFormPage from './EventFormPage';
import { AppLayout } from '@/components/layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getEvent } from '@/services/api';
import type { Event } from '@/types/types';
import { ArrowLeft } from 'lucide-react';

export default function EditEventPage() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getEvent(id).then(setEvent).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <AppLayout>
        <div className="p-8 max-w-4xl mx-auto space-y-4">
          <Skeleton className="h-8 w-32 bg-muted" />
          <Skeleton className="h-64 bg-muted" />
        </div>
      </AppLayout>
    );
  }
  if (!event) {
    return (
      <AppLayout>
        <div className="p-8 text-center">
          <h2 className="text-xl font-black mb-2">Event Not Found</h2>
          <Button asChild variant="outline"><Link to="/events"><ArrowLeft size={14} className="mr-2" />Back</Link></Button>
        </div>
      </AppLayout>
    );
  }
  return <EventFormPage mode="edit" initialEvent={event} />;
}
