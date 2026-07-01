'use client';

import * as React from 'react';
import { Loader2, Send, AlertCircle } from 'lucide-react';
import { Card, CardContent, Button, Input, Label, Spinner } from '@cyberlisans/ui/atoms';
import { Select } from '@/components/ui/select';
import { apiFetch, ApiError } from '@/lib/api-client';
import { DealerAccessGuard } from '@/components/dealer/DealerStatusBanner';
import type { DealerProfile } from '@/lib/dealer-types';

const CURRENCY_OPTS = [
  { value: 'TRY', label: '₺ TRY' },
  { value: 'USD', label: '$ USD' },
  { value: 'EUR', label: '€ EUR' },
  { value: 'USDT', label: '₮ USDT' },
];

const fmtTRY = (n: number) =>
  new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 2,
  }).format(n);

export function DealerPayoutForm({ profile }: { profile: DealerProfile }) {
  const [amount, setAmount] = React.useState<string>('');
  const [iban, setIban] = React.useState('');
  const [currency, setCurrency] = React.useState('TRY');
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  const balance = profile.balance;
  const insufficient = Number(amount) > balance;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setSubmitting(true);
    try {
      await apiFetch('/dealer/payouts', {
        method: 'POST',
        body: JSON.stringify({
          amount: Number(amount),
          currency,
          method: 'BANK_TRANSFER',
          destination: iban,
        }),
      });
      setSuccess(true);
      setAmount('');
      setIban('');
      window.setTimeout(() => window.location.reload(), 1500);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Talep oluşturulamadı');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DealerAccessGuard status={profile.status}>
      <Card>
        <CardContent className="p-6">
          <h2 className="mb-1 font-orbitron text-lg font-bold text-white">Ödeme Talebi Oluştur</h2>
          <p className="mb-4 text-sm text-white/60">
            Mevcut bakiye: <span className="font-mono text-cyber-cyan">{fmtTRY(balance)}</span>
          </p>
          <form onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="amount" className="mb-2 block">
                  Tutar
                </Label>
                <Input
                  id="amount"
                  type="number"
                  min={1}
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  required
                />
                {insufficient && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-cyber-magenta">
                    <AlertCircle className="h-3 w-3" /> Yetersiz bakiye
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="currency" className="mb-2 block">
                  Para Birimi
                </Label>
                <Select
                  id="currency"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  options={CURRENCY_OPTS}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="iban" className="mb-2 block">
                IBAN
              </Label>
              <Input
                id="iban"
                value={iban}
                onChange={(e) => setIban(e.target.value.toUpperCase().replace(/\s/g, ''))}
                placeholder="TR00 0000 0000 0000 0000 0000 00"
                required
              />
            </div>
            {error && <p className="text-sm text-cyber-magenta">{error}</p>}
            {success && (
              <p className="text-sm text-cyber-lime">Talebin alındı. Sayfa yenileniyor...</p>
            )}
            <Button type="submit" disabled={submitting || insufficient || !amount || !iban}>
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              {submitting ? 'Gönderiliyor...' : 'Talep Oluştur'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </DealerAccessGuard>
  );
}

export function DealerPayoutFormLoading() {
  return (
    <Card>
      <CardContent className="flex items-center justify-center p-10">
        <Spinner size="lg" />
      </CardContent>
    </Card>
  );
}
