import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { Calendar, Ticket, DollarSign, Users, MapPin, TrendingUp, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AppLayout } from '@/components/layouts/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { getDashboardStats } from '@/services/api';
import type { DashboardStats } from '@/types/types';
import { formatDistanceToNow } from 'date-fns';

const statusColors: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground',
  published: 'bg-primary text-primary-foreground',
  upcoming: 'bg-info text-white',
  ongoing: 'bg-success text-white',
  completed: 'bg-muted text-muted-foreground',
  cancelled: 'bg-destructive text-destructive-foreground',
};

function StatCard({ icon: Icon, label, value, sub, color = 'text-accent' }: {
  icon: React.ElementType; label: string; value: string | number; sub?: string; color?: string;
}) {
  return (
    <Card className="brutalist-card h-full">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">{label}</p>
            <p className="text-3xl font-black tracking-tight">{value}</p>
            {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
          </div>
          <div className={`${color} opacity-80`}>
            <Icon size={28} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { role, profile } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const data = await getDashboardStats(
        role === 'organizer' ? profile?.id : undefined
      );
      setStats(data);
    } catch (e) {
      console.error('Dashboard load error:', e);
    } finally {
      setLoading(false);
    }
  }, [role, profile?.id]);

  useEffect(() => { load(); }, [load]);

  return (
    <AppLayout>
      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground text-sm mt-1">
              {role === 'organizer' ? 'Your events overview' : 'Platform overview'}
            </p>
          </div>
          {(role === 'organizer' || role === 'admin') && (
            <Button asChild className="bg-accent hover:bg-accent/90 text-white">
              <Link to="/events/create">
                <Plus size={16} className="mr-2" />
                New Event
              </Link>
            </Button>
          )}
        </div>

        {/* Stats grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-32 bg-muted" />
            ))}
          </div>
        ) : stats ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            <StatCard icon={Calendar} label="Total Events" value={stats.total_events} color="text-accent" />
            <StatCard icon={TrendingUp} label="Published" value={stats.published_events} color="text-info" />
            <StatCard icon={Ticket} label="Tickets Sold" value={stats.total_tickets_sold.toLocaleString()} color="text-success" />
            <StatCard
              icon={DollarSign}
              label="Revenue"
              value={`$${stats.total_revenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
              color="text-warning"
            />
            <StatCard icon={Users} label="Artists" value={stats.total_artists} color="text-chart-5" />
            <StatCard icon={MapPin} label="Venues" value={stats.total_venues} color="text-chart-2" />
          </div>
        ) : null}

        {/* Charts + Popular Events */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Monthly Revenue Chart */}
          <Card className="brutalist-card lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-black uppercase tracking-widest">Monthly Revenue & Tickets</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-64 bg-muted" />
              ) : (
                <div className="w-full min-w-0 overflow-hidden">
                  <ResponsiveContainer width="100%" height={260}>
                    <LineChart data={stats?.monthly_data ?? []} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                      <Tooltip
                        contentStyle={{
                          background: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: 0,
                        }}
                      />
                      <Legend layout="horizontal" wrapperStyle={{ paddingTop: 8 }} />
                      <Line type="monotone" dataKey="revenue" stroke="hsl(var(--accent))" strokeWidth={2} dot={false} name="Revenue ($)" />
                      <Line type="monotone" dataKey="tickets_sold" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={false} name="Tickets Sold" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Events per month bar */}
          <Card className="brutalist-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-black uppercase tracking-widest">Events / Month</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-64 bg-muted" />
              ) : (
                <div className="w-full min-w-0 overflow-hidden">
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={stats?.monthly_data ?? []} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                      <Tooltip
                        contentStyle={{
                          background: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: 0,
                        }}
                      />
                      <Bar dataKey="events" fill="hsl(var(--accent))" radius={0} name="Events" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Popular Events */}
        <Card className="brutalist-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-black uppercase tracking-widest">Most Popular Events</CardTitle>
            <Button asChild variant="ghost" size="sm" className="text-accent hover:text-accent/80">
              <Link to="/events">View All</Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-6 space-y-4">
                {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 bg-muted" />)}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left text-xs font-semibold uppercase tracking-widest text-muted-foreground px-6 py-3 whitespace-nowrap">#</th>
                      <th className="text-left text-xs font-semibold uppercase tracking-widest text-muted-foreground px-6 py-3 whitespace-nowrap">Event</th>
                      <th className="text-left text-xs font-semibold uppercase tracking-widest text-muted-foreground px-6 py-3 whitespace-nowrap">Status</th>
                      <th className="text-right text-xs font-semibold uppercase tracking-widest text-muted-foreground px-6 py-3 whitespace-nowrap">Tickets Sold</th>
                      <th className="text-right text-xs font-semibold uppercase tracking-widest text-muted-foreground px-6 py-3 whitespace-nowrap">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(stats?.popular_events ?? []).map((event, i) => (
                      <tr key={event.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-3 text-sm font-black text-muted-foreground whitespace-nowrap">{i + 1}</td>
                        <td className="px-6 py-3 whitespace-nowrap">
                          <Link to={`/events/${event.id}`} className="text-sm font-semibold hover:text-accent transition-colors">
                            {event.title}
                          </Link>
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap">
                          <span className={`inline-block px-2 py-0.5 text-xs font-semibold uppercase ${statusColors[event.status] || 'bg-muted'}`}>
                            {event.status}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-right text-sm font-black whitespace-nowrap">{event.sold_tickets}</td>
                        <td className="px-6 py-3 text-right text-xs text-muted-foreground whitespace-nowrap">
                          {formatDistanceToNow(new Date(event.start_date), { addSuffix: true })}
                        </td>
                      </tr>
                    ))}
                    {(!stats?.popular_events || stats.popular_events.length === 0) && (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground text-sm">
                          No events yet. <Link to="/events/create" className="text-accent hover:underline">Create your first event</Link>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
