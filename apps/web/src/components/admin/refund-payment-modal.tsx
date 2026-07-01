'use client';

import * as React from 'react';
import { Undo2, Loader2, AlertCircle } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { Button, Input, Label } from '@cyberlisans/ui/atoms';
import { apiFetch, ApiError } from '@/lib/api-client';
import { cn } from '@cyberlisans/ui/cn';

export interface RefundPaymentModalProps {
  paymentId: string;
  mode: 'full' | 'partial';
  maxAmount: number;
  currency: 'TRY' | 'USD' | 'EUR' | 'USDT';
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function RefundPaymentModal({
  paymentId,
  mode,
  maxAmount,
  currency,
  open,
  onClose,
  onSuccess,
}: RefundPaymentModalProps) {
  const [amount, setAmount] = React.useState(mode === 'full' ? String(maxAmount) : '');
  const [reason, setReason] = React.useState('');
  const [creditWallet, setCreditWallet] = React.useState(true);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setAmount(mode === 'full' ? String(maxAmount) : '');
    setReason('');
    setError(null);
  }, [mode, maxAmount, open]);

  const amtNum = Number(amount);
  const valid =
    Number.isFinite(amtNum) && amtNum > 0 && reason.trim().length >= 5 && amtNum <= maxAmount;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid || busy) return;
    setError(null);
    setBusy(true);
    try {
      await apiFetch(`/api/admin/payments/${paymentId}/refund`, {
        method: 'POST',
        body: JSON.stringify({
          amount: amtNum,
          reason: reason.trim(),
          creditWallet,
        }),
      });
      setAmount(mode === 'full' ? String(maxAmount) : '');
      setReason('');
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
        if (!o) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" />
        <Dialog.Content
          className={cn(
            'fixed left-1/2 top-1/2 z-50 w-[min(540px,calc(100%-2rem))] -translate-x-1/2 -translate-y-1/2',
            'rounded-lg border border-cyber-magenta/30 bg-cyber-darker p-6 shadow-2xl focus:outline-none',
          )}
        >
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-md border border-cyber-magenta/30 bg-cyber-magenta/10 p-2 text-cyber-magenta">
              <Undo2 className="h-5 w-5" />
            </div>
            <div>
              <Dialog.Title className="font-orbitron text-lg font-bold text-white">
                {mode === 'full' ? 'Tam İade' : 'Kısmi İade'}
              </Dialog.Title>
              <Dialog.Description className="text-xs text-white/60">
                Sağlayıcı ve cüzdana işlenir
              </Dialog.Description>
            </div>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <Label htmlFor="refund-amount">
                Tutar (max: {maxAmount} {currency})
              </Label>
              <Input
                id="refund-amount"
                type="number"
                step="0.01"
                min="0.01"
                max={maxAmount}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="refund-reason">Sebep</Label>
              <Input
                id="refund-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="En az 5 karakter"
                required
                minLength={5}
                maxLength={500}
              />
              <p className="mt-1 text-xs text-white/40">{reason.length} / 500</p>
            </div>
            <label className="flex items-center gap-2 text-xs text-white/70">
              <input
                type="checkbox"
                checked={creditWallet}
                onChange={(e) => setCreditWallet(e.target.checked)}
                className="h-4 w-4 rounded border-cyber-cyan/40 bg-cyber-darker accent-cyber-cyan"
              />
              Kullanıcı cüzdanına da iade et
            </label>

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
              <Button
                type="submit"
                variant="primary"
                className="bg-cyber-magenta hover:bg-cyber-magenta/80"
                disabled={!valid || busy}
              >
                {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                İade Et
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
