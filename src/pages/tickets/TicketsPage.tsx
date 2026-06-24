import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Ticket, ShoppingCart, BarChart2, Calendar, Download, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { AppLayout } from '@/components/layouts/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { getMyReservations, getAllReservations, getTickets } from '@/services/api';
import type { Reservation, Ticket as TicketType } from '@/types/types';
import { format } from 'date-fns';
import { toast } from 'sonner';
import jsPDF from 'jspdf';

const statusIcon = { confirmed: CheckCircle, pending: Clock, cancelled: XCircle, refunded: XCircle };
const statusColor = { confirmed: 'text-green-600', pending: 'text-yellow-600', cancelled: 'text-muted-foreground', refunded: 'text-muted-foreground' };
const payStatusColor = { completed: 'text-green-600', pending: 'text-yellow-600', failed: 'text-destructive', refunded: 'text-muted-foreground' };

function generatePDF(res: Reservation) {
  const doc = new jsPDF();
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('CULTURAL EVENTS PLATFORM', 20, 30);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text('TICKET / RESERVATION CONFIRMATION', 20, 45);
  doc.setFontSize(12);
  doc.line(20, 52, 190, 52);
  doc.text(`Reservation Code: ${res.reservation_code}`, 20, 65);
  doc.text(`Event: ${res.event?.title ?? 'N/A'}`, 20, 78);
  doc.text(`Date: ${res.event?.start_date ? format(new Date(res.event.start_date), 'EEEE, MMMM d, yyyy • h:mm a') : 'N/A'}`, 20, 91);
  doc.text(`Ticket Type: ${res.ticket?.ticket_type ?? 'General'}`, 20, 104);
  doc.text(`Quantity: ${res.quantity}`, 20, 117);
  doc.text(`Total: $${res.total_price.toFixed(2)}`, 20, 130);
  doc.text(`Status: ${res.status.toUpperCase()}`, 20, 143);
  doc.text(`Payment: ${res.payment_status.toUpperCase()}`, 20, 156);
  doc.line(20, 165, 190, 165);
  doc.setFontSize(10);
  doc.text('Please present this ticket at the venue entrance.', 20, 178);
  doc.text(`Generated: ${format(new Date(), 'MMM d, yyyy h:mm a')}`, 20, 190);
  doc.save(`ticket-${res.reservation_code}.pdf`);
  toast.success('PDF ticket downloaded');
}

function ReservationRow({ res }: { res: Reservation }) {
  const StatusIcon = statusIcon[res.status] ?? Clock;
  return (
    <tr className="border-b border-border hover:bg-muted/30 transition-colors">
      <td className="px-4 py-3 whitespace-nowrap">
        <Link to={`/events/${res.event_id}`} className="font-semibold text-sm hover:text-accent transition-colors">
          {res.event?.title ?? '—'}
        </Link>
        {res.event?.start_date && <p className="text-xs text-muted-foreground">{format(new Date(res.event.start_date), 'MMM d, yyyy')}</p>}
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-sm font-mono font-bold">{res.reservation_code}</td>
      <td className="px-4 py-3 whitespace-nowrap text-sm capitalize">{res.ticket?.ticket_type ?? '—'}</td>
      <td className="px-4 py-3 whitespace-nowrap text-sm">{res.quantity}</td>
      <td className="px-4 py-3 whitespace-nowrap text-sm font-black">${res.total_price.toFixed(2)}</td>
      <td className="px-4 py-3 whitespace-nowrap">
        <span className={`flex items-center gap-1 text-xs font-semibold ${statusColor[res.status] ?? ''}`}>
          <StatusIcon size={12} />{res.status}
        </span>
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        <span className={`text-xs font-semibold ${payStatusColor[res.payment_status] ?? ''}`}>{res.payment_status}</span>
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        {res.status === 'confirmed' && (
          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => generatePDF(res)}>
            <Download size={11} className="mr-1" />PDF
          </Button>
        )}
      </td>
    </tr>
  );
}

export default function TicketsPage() {
  const { role, profile } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [allReservations, setAllReservations] = useState<Reservation[]>([]);
  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [loading, setLoading] = useState(true);
  const [resTotal, setResTotal] = useState(0);
  const [allResTotal, setAllResTotal] = useState(0);

  const load = useCallback(async () => {
    if (!profile) return;
    setLoading(true);
    try {
      const [myRes, tix] = await Promise.all([
        getMyReservations(profile.id, 0, 50),
        getTickets(0, 50),
      ]);
      setReservations(myRes.reservations);
      setResTotal(myRes.total);
      setTickets(tix.tickets);

      if (role === 'admin' || role === 'organizer') {
        const allRes = await getAllReservations(0, 100);
        setAllReservations(allRes.reservations);
        setAllResTotal(allRes.total);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [profile, role]);

  useEffect(() => { load(); }, [load]);

  const totalRevenue = allReservations.filter(r => r.payment_status === 'completed').reduce((s, r) => s + r.total_price, 0);
  const confirmedCount = allReservations.filter(r => r.status === 'confirmed').length;

  return (
    <AppLayout>
      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-black tracking-tight mb-2">Tickets</h1>
        <p className="text-muted-foreground text-sm mb-6">Manage tickets and reservations</p>

        <Tabs defaultValue="my-reservations">
          <TabsList className="mb-6 border border-border bg-transparent h-auto p-0 gap-0">
            <TabsTrigger value="my-reservations" className="border-r border-border px-4 py-2 text-sm font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-none">
              <Ticket size={14} className="mr-2" />My Reservations
            </TabsTrigger>
            {(role === 'admin' || role === 'organizer') && (
              <>
                <TabsTrigger value="all-reservations" className="border-r border-border px-4 py-2 text-sm font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-none">
                  <ShoppingCart size={14} className="mr-2" />All Reservations
                </TabsTrigger>
                <TabsTrigger value="statistics" className="px-4 py-2 text-sm font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-none">
                  <BarChart2 size={14} className="mr-2" />Statistics
                </TabsTrigger>
              </>
            )}
          </TabsList>

          {/* My Reservations */}
          <TabsContent value="my-reservations">
            {loading ? <Skeleton className="h-48 bg-muted" /> : (
              <Card className="brutalist-card">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-black uppercase tracking-widest">Your Reservations ({resTotal})</CardTitle>
                  <Button asChild variant="outline" size="sm"><Link to="/events">Browse Events</Link></Button>
                </CardHeader>
                <CardContent className="p-0">
                  {reservations.length === 0 ? (
                    <div className="p-12 text-center">
                      <Ticket size={40} className="text-muted-foreground/30 mx-auto mb-3" />
                      <p className="text-sm font-semibold mb-1">No reservations yet</p>
                      <p className="text-xs text-muted-foreground mb-4">Browse events and reserve your tickets.</p>
                      <Button asChild className="bg-accent hover:bg-accent/90 text-white"><Link to="/events">Browse Events</Link></Button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead><tr className="border-b border-border">
                          {['Event', 'Code', 'Type', 'Qty', 'Total', 'Status', 'Payment', ''].map(h => (
                            <th key={h} className="text-left text-xs font-semibold uppercase tracking-widest text-muted-foreground px-4 py-3 whitespace-nowrap">{h}</th>
                          ))}
                        </tr></thead>
                        <tbody>{reservations.map(r => <ReservationRow key={r.id} res={r} />)}</tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* All Reservations */}
          {(role === 'admin' || role === 'organizer') && (
            <TabsContent value="all-reservations">
              {loading ? <Skeleton className="h-48 bg-muted" /> : (
                <Card className="brutalist-card">
                  <CardHeader><CardTitle className="text-sm font-black uppercase tracking-widest">All Reservations ({allResTotal})</CardTitle></CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead><tr className="border-b border-border">
                          {['Event', 'Code', 'Type', 'Qty', 'Total', 'Status', 'Payment', ''].map(h => (
                            <th key={h} className="text-left text-xs font-semibold uppercase tracking-widest text-muted-foreground px-4 py-3 whitespace-nowrap">{h}</th>
                          ))}
                        </tr></thead>
                        <tbody>{allReservations.map(r => <ReservationRow key={r.id} res={r} />)}</tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          )}

          {/* Statistics */}
          {(role === 'admin' || role === 'organizer') && (
            <TabsContent value="statistics">
              {loading ? <div className="grid grid-cols-2 md:grid-cols-4 gap-4"><Skeleton className="h-32 bg-muted" /><Skeleton className="h-32 bg-muted" /><Skeleton className="h-32 bg-muted" /><Skeleton className="h-32 bg-muted" /></div> : (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: 'Total Reservations', value: allResTotal, icon: Ticket },
                      { label: 'Confirmed', value: confirmedCount, icon: CheckCircle },
                      { label: 'Total Revenue', value: `$${totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, icon: BarChart2 },
                      { label: 'Ticket Types', value: tickets.length, icon: Calendar },
                    ].map(stat => (
                      <Card key={stat.label} className="brutalist-card">
                        <CardContent className="p-4">
                          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">{stat.label}</p>
                          <p className="text-2xl font-black">{stat.value}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <Card className="brutalist-card">
                    <CardHeader><CardTitle className="text-sm font-black uppercase tracking-widest">Tickets by Event</CardTitle></CardHeader>
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead><tr className="border-b border-border">
                            {['Event', 'Ticket Type', 'Available', 'Total', 'Price', 'Status'].map(h => (
                              <th key={h} className="text-left text-xs font-semibold uppercase tracking-widest text-muted-foreground px-4 py-3 whitespace-nowrap">{h}</th>
                            ))}
                          </tr></thead>
                          <tbody>
                            {tickets.map(t => (
                              <tr key={t.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <Link to={`/events/${t.event_id}`} className="text-sm font-semibold hover:text-accent transition-colors">
                                    {t.event?.title ?? '—'}
                                  </Link>
                                </td>
                                <td className="px-4 py-3 text-sm capitalize whitespace-nowrap">{t.ticket_type}</td>
                                <td className="px-4 py-3 text-sm whitespace-nowrap">{t.available_quantity}</td>
                                <td className="px-4 py-3 text-sm whitespace-nowrap">{t.total_quantity}</td>
                                <td className="px-4 py-3 text-sm font-black whitespace-nowrap">{t.price === 0 ? 'Free' : `$${t.price}`}</td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <span className={`text-xs font-semibold uppercase ${t.status === 'available' ? 'text-green-600' : 'text-muted-foreground'}`}>{t.status}</span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>
          )}
        </Tabs>
      </div>
    </AppLayout>
  );
}
