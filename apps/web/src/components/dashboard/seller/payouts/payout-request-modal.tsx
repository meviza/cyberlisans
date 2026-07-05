'use client';

import * as React from 'react';
import { Plus, Loader2 } from 'lucide-react';
import {
  Button,
  Input,
  Label,
  Select,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@cyberlisans/ui/atoms';
import { apiFetch, ApiError } from '@/lib/api-client';

export type PayoutMethod = 'BANK' | 'PAYPAL' | 'CRYPTO';
export type PayoutCurrency = 'TRY' | 'USD' | 'EUR' | 'USDT';

export interface PayoutRequestModalProps {
  availableBalance: number;
  currency: PayoutCurrency;
  onCreated?: () => void;
}

export function PayoutRequestModal({
  availableBalance,
  currency,
  onCreated,
}: PayoutRequestModalProps) {
  const [open, setOpen] = React.useState(false);
  const [amount, setAmount] = React.useState('');
  const [method, setMethod] = React.useState<PayoutMethod>('BANK');
  const [destination, setDestination] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const reset = () => {
    setAmount('');
    setDestination('');
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = Number(amount);
    if (!value || value <= 0) {
      setError('Geçerli bir tutar gir');
      return;
    }
    if (value > availableBalance) {
      setError('Tutar çekilebilir bakiyeden büyük olamaz');
      return;
    }
    if (!destination.trim()) {
      setError('Hedef bilgisi gerekli');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await apiFetch('/payouts', {
        method: 'POST',
        body: JSON.stringify({ amount: value, method, destination, currency }),
      });
      setOpen(false);
      reset();
      onCreated?.();
    } catch (err) {
      if (err instanceof ApiError && err.status === 404)
        setError('Payout servisi henüz aktif değil (M3 sonrası).');
      else setError(err instanceof Error ? err.message : 'Talep oluşturulamadı');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" /> Yeni Payout Talebi
      </Button>
      <Dialog open={open} onOpenChange={(v) => (setOpen(v), v || reset())}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Yeni Payout Talebi</DialogTitle>
            <DialogDescription>
              Çekilebilir bakiye:{' '}
              <span className="font-mono text-cyber-cyan">
                {availableBalance.toLocaleString('tr-TR')}
              </span>{' '}
              {currency}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="amount">Tutar</Label>
              <Input
                id="amount"
                type="number"
                min="1"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                disabled={submitting}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="method">Yöntem</Label>
              <Select
                id="method"
                value={method}
                onChange={(e) => setMethod(e.target.value as PayoutMethod)}
                disabled={submitting}
                options={[
                  { value: 'BANK', label: 'Banka Havalesi' },
                  { value: 'PAYPAL', label: 'PayPal' },
                  { value: 'CRYPTO', label: 'Kripto (USDT)' },
                ]}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="destination">Hedef</Label>
              <Input
                id="destination"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder={
                  method === 'BANK' ? 'IBAN' : method === 'PAYPAL' ? 'email@example.com' : '0x...'
                }
                disabled={submitting}
              />
            </div>
            {error && <p className="text-xs text-cyber-magenta">{error}</p>}
            <DialogFooter>
              <Button type="submit" disabled={submitting} className="w-full">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {submitting ? 'Gönderiliyor...' : 'Talep Oluştur'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
