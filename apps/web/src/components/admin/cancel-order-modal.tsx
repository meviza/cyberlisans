'use client';

import * as React from 'react';
import { XCircle, Loader2, AlertCircle } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { Button, Input, Label, Checkbox } from '@cyberlisans/ui/atoms';
import { apiFetch, ApiError } from '@/lib/api-client';
import { cn } from '@cyberlisans/ui/cn';

export interface CancelOrderModalProps {
  orderId: string;
  orderNumber: string;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CancelOrderModal({
  orderId,
  orderNumber,
  open,
  onClose,
  onSuccess,
}: CancelOrderModalProps) {
  const [reason, setReason] = React.useState('');
  const [restoreKeys, setRestoreKeys] = React.useState(true);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const valid = reason.trim().length >= 5;

  const reset = () => {
    setReason('');
    setRestoreKeys(true);
    setError(null);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid || busy) return;
    setError(null);
    setBusy(true);
    try {
      await apiFetch(`/api/admin/orders/${orderId}/cancel`, {
        method: 'POST',
        body: JSON.stringify({ reason: reason.trim(), restoreKeys }),
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
            'rounded-lg border border-cyber-magenta/30 bg-cyber-darker p-6 shadow-2xl focus:outline-none',
          )}
        >
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-md border border-cyber-magenta/30 bg-cyber-magenta/10 p-2 text-cyber-magenta">
              <XCircle className="h-5 w-5" />
            </div>
            <div>
              <Dialog.Title className="font-orbitron text-lg font-bold text-white">
                Siparişi İptal Et
              </Dialog.Title>
              <Dialog.Description className="text-xs text-white/60">
                {orderNumber} numaralı sipariş
              </Dialog.Description>
            </div>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <Label htmlFor="cancel-reason">Sebep</Label>
              <Input
                id="cancel-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="En az 5 karakter"
                required
                minLength={5}
                maxLength={500}
              />
              <p className="mt-1 text-xs text-white/40">{reason.length} / 500</p>
            </div>
            <Checkbox
              checked={restoreKeys}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setRestoreKeys(e.currentTarget.checked)
              }
            />
            <span className="ml-2 text-sm text-white/80">Anahtarları stoğa geri al</span>

            {error && (
              <div className="flex items-start gap-2 rounded-md border border-cyber-magenta/30 bg-cyber-magenta/5 p-3 text-sm text-cyber-magenta">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Dialog.Close asChild>
                <Button type="button" variant="ghost" disabled={busy}>
                  Vazgeç
                </Button>
              </Dialog.Close>
              <Button
                type="submit"
                variant="primary"
                className="bg-cyber-magenta hover:bg-cyber-magenta/80"
                disabled={!valid || busy}
              >
                {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                İptal Et
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
