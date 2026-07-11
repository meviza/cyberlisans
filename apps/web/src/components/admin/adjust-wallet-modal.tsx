'use client';

import * as React from 'react';
import { Wallet, Loader2, AlertCircle } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { Button, Input, Label, Select } from '@cyberlisans/ui/atoms';
import { apiFetch, ApiError } from '@/lib/api-client';
import { cn } from '@cyberlisans/ui/cn';

type Currency = 'TRY' | 'USD' | 'EUR' | 'USDT';

interface FormState {
  amount: string;
  currency: Currency;
  reason: string;
}

const CURRENCIES: Array<{ value: Currency; label: string }> = [
  { value: 'TRY', label: '₺ Türk Lirası (TRY)' },
  { value: 'USD', label: '$ Amerikan Doları (USD)' },
  { value: 'EUR', label: '€ Euro (EUR)' },
  { value: 'USDT', label: '₮ Tether (USDT)' },
];

export interface AdjustWalletModalProps {
  user: { id: string; username: string };
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AdjustWalletModal({ user, open, onClose, onSuccess }: AdjustWalletModalProps) {
  const [form, setForm] = React.useState<FormState>({
    amount: '',
    currency: 'TRY',
    reason: '',
  });
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const update = (k: keyof FormState, v: string) => {
    setForm((s) => ({ ...s, [k]: v }));
  };

  const amountNum = Number(form.amount);
  const valid = Number.isFinite(amountNum) && amountNum !== 0 && form.reason.trim().length >= 5;

  const reset = () => {
    setForm({ amount: '', currency: 'TRY', reason: '' });
    setError(null);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid || busy) return;
    setError(null);
    setBusy(true);
    try {
      await apiFetch(`/admin/users/${user.id}/wallet-adjust`, {
        method: 'POST',
        body: JSON.stringify({
          amount: amountNum,
          currency: form.currency,
          reason: form.reason,
        }),
      });
      reset();
      onSuccess?.();
      onClose();
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError('İşlem başarısız');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(o) => {
        if (!o) {
          reset();
          onClose();
        }
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" />
        <Dialog.Content
          className={cn(
            'fixed left-1/2 top-1/2 z-50 w-[min(540px,calc(100%-2rem))] -translate-x-1/2 -translate-y-1/2',
            'rounded-lg border border-cyber-cyan/30 bg-cyber-darker p-6 shadow-2xl',
            'focus:outline-none',
          )}
        >
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-md border border-cyber-cyan/30 bg-cyber-cyan/10 p-2 text-cyber-cyan">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <Dialog.Title className="font-orbitron text-lg font-bold text-white">
                Cüzdan Düzelt
              </Dialog.Title>
              <Dialog.Description className="text-xs text-white/60">
                @{user.username} için bakiye ayarla
              </Dialog.Description>
            </div>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <Label htmlFor="amount">Tutar (negatif = düş)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={form.amount}
                onChange={(e) => update('amount', e.target.value)}
                placeholder="örn: 100.00 veya -50.00"
                required
              />
            </div>
            <div>
              <Label htmlFor="currency">Para Birimi</Label>
              <Select
                id="currency"
                value={form.currency}
                onChange={(e) => update('currency', e.target.value)}
                options={CURRENCIES}
              />
            </div>
            <div>
              <Label htmlFor="reason">Sebep</Label>
              <Input
                id="reason"
                value={form.reason}
                onChange={(e) => update('reason', e.target.value)}
                placeholder="En az 5 karakter, örn: Bonus ödülü"
                required
                minLength={5}
                maxLength={500}
              />
              <p className="mt-1 text-xs text-white/40">{form.reason.length} / 500</p>
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-md border border-cyber-magenta/30 bg-cyber-magenta/5 p-3 text-sm text-cyber-magenta">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Dialog.Close asChild>
                <Button type="button" variant="ghost" disabled={busy}>
                  İptal
                </Button>
              </Dialog.Close>
              <Button type="submit" variant="primary" disabled={!valid || busy}>
                {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                Uygula
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
