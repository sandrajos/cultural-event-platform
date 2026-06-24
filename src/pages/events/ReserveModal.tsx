import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { createReservation } from '@/services/api';
import type { Ticket, Event } from '@/types/types';
import { toast } from 'sonner';
import { CreditCard, Ticket as TicketIcon } from 'lucide-react';

interface Props {
  ticket: Ticket;
  event: Event;
  open: boolean;
  onClose: () => void;
}

export default function ReserveModal({ ticket, event, open, onClose }: Props) {
  const { profile } = useAuth();
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'details' | 'payment' | 'success'>('details');
  const [resCode, setResCode] = useState('');

  const total = qty * ticket.price;
  const maxQty = Math.min(ticket.available_quantity, 10);

  const handleReserve = async () => {
    if (!profile) { toast.error('Please sign in'); return; }
    setLoading(true);
    try {
      if (ticket.price > 0) {
        setStep('payment');
        setLoading(false);
        return;
      }
      // Free ticket — confirm immediately
      const res = await createReservation({
        ticket_id: ticket.id,
        user_id: profile.id,
        event_id: event.id,
        quantity: qty,
        total_price: total,
        status: 'confirmed',
        payment_status: 'completed',
      });
      if (res) {
        setResCode(res.reservation_code);
        setStep('success');
      }
    } catch {
      toast.error('Reservation failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!profile) return;
    setLoading(true);
    try {
      // Simulate payment processing
      await new Promise(r => setTimeout(r, 1500));
      const res = await createReservation({
        ticket_id: ticket.id,
        user_id: profile.id,
        event_id: event.id,
        quantity: qty,
        total_price: total,
        status: 'confirmed',
        payment_status: 'completed',
        payment_intent_id: `pi_simulated_${Date.now()}`,
      });
      if (res) {
        setResCode(res.reservation_code);
        setStep('success');
      }
    } catch {
      toast.error('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep('details');
    setQty(1);
    setResCode('');
    onClose();
    if (step === 'success') toast.success('Ticket reserved! Check your Reservations page.');
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg bg-card border-border" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle className="font-black text-lg">
            {step === 'details' && 'Reserve Tickets'}
            {step === 'payment' && 'Payment'}
            {step === 'success' && 'Reservation Confirmed!'}
          </DialogTitle>
        </DialogHeader>

        {step === 'details' && (
          <div className="space-y-4">
            <div className="p-3 border border-border bg-muted/30">
              <p className="font-semibold text-sm">{event.title}</p>
              <p className="text-xs text-muted-foreground capitalize">{ticket.ticket_type} — ${ticket.price} each</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Quantity</Label>
              <div className="flex items-center gap-3 mt-1.5">
                <Button type="button" variant="outline" size="icon" className="h-9 w-9"
                  onClick={() => setQty(q => Math.max(1, q - 1))} disabled={qty <= 1}>−</Button>
                <Input type="number" value={qty} min={1} max={maxQty}
                  onChange={e => setQty(Math.max(1, Math.min(maxQty, parseInt(e.target.value) || 1)))}
                  className="h-9 w-20 text-center" />
                <Button type="button" variant="outline" size="icon" className="h-9 w-9"
                  onClick={() => setQty(q => Math.min(maxQty, q + 1))} disabled={qty >= maxQty}>+</Button>
                <span className="text-xs text-muted-foreground">max {maxQty}</span>
              </div>
            </div>
            <div className="flex items-center justify-between py-3 border-t border-border">
              <span className="font-semibold">Total</span>
              <span className="text-xl font-black text-accent">{total === 0 ? 'Free' : `$${total.toFixed(2)}`}</span>
            </div>
            <Button onClick={handleReserve} disabled={loading} className="w-full h-11 bg-accent hover:bg-accent/90 text-white font-semibold">
              {loading ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white border-t-transparent animate-spin" />Processing...</span>
                : ticket.price === 0 ? 'Confirm Free Reservation' : 'Proceed to Payment'}
            </Button>
          </div>
        )}

        {step === 'payment' && (
          <div className="space-y-4">
            <div className="p-3 border border-border bg-muted/30 flex items-center justify-between">
              <span className="text-sm font-semibold">{qty}× {ticket.ticket_type}</span>
              <span className="font-black text-accent">${total.toFixed(2)}</span>
            </div>
            <div className="space-y-3">
              <div>
                <Label className="text-sm font-medium">Card Number</Label>
                <Input placeholder="4242 4242 4242 4242" className="h-11 mt-1.5 font-mono" defaultValue="4242 4242 4242 4242" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-sm font-medium">Expiry</Label>
                  <Input placeholder="MM/YY" className="h-11 mt-1.5" defaultValue="12/28" />
                </div>
                <div>
                  <Label className="text-sm font-medium">CVC</Label>
                  <Input placeholder="123" className="h-11 mt-1.5" defaultValue="123" />
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <CreditCard size={11} />Payments processed securely. Demo mode — no real charge.
            </p>
            <Button onClick={handlePayment} disabled={loading} className="w-full h-11 bg-accent hover:bg-accent/90 text-white font-semibold">
              {loading ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white border-t-transparent animate-spin" />Processing payment...</span>
                : `Pay $${total.toFixed(2)}`}
            </Button>
          </div>
        )}

        {step === 'success' && (
          <div className="text-center py-4 space-y-4">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto">
              <TicketIcon size={28} className="text-green-600" />
            </div>
            <div>
              <p className="font-black text-lg mb-1">You're going!</p>
              <p className="text-sm text-muted-foreground mb-3">Reservation code:</p>
              <p className="text-2xl font-black font-mono text-accent tracking-widest">{resCode}</p>
            </div>
            <p className="text-xs text-muted-foreground">View your tickets in the Reservations page.</p>
            <Button onClick={handleClose} className="w-full h-11 bg-primary text-primary-foreground font-semibold">Done</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
