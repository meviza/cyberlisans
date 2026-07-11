'use client';

import * as React from 'react';
import { ShieldOff, Loader2, AlertCircle } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { Button, Input, Label } from '@cyberlisans/ui/atoms';
import { apiFetch, ApiError } from '@/lib/api-client';
import { cn } from '@cyberlisans/ui/cn';

export interface Reset2FAButtonProps {
  userId: string;
  username: string;
  onDone?: () => void;
  variant?: 'button' | 'icon';
}

export function Reset2FAButton({
  userId,
  username,
  onDone,
  variant = 'icon',
}: Reset2FAButtonProps) {
  const [open, setOpen] = React.useState(false);
  const [confirm, setConfirm] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (confirm !== username || busy) return;
    setError(null);
    setBusy(true);
    try {
      await apiFetch(`/admin/users/${userId}/reset-2fa`, { method: 'POST' });
      setOpen(false);
      setConfirm('');
      onDone?.();
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
          setConfirm('');
          setError(null);
        }
        setOpen(o);
      }}
    >
      <Dialog.Trigger asChild>
        {variant === 'icon' ? (
          <button
            type="button"
            className="rounded p-1.5 text-white/60 transition-colors hover:bg-cyber-magenta/10 hover:text-cyber-magenta"
            title="2FA Sıfırla"
          >
            <ShieldOff className="h-4 w-4" />
          </button>
        ) : (
          <Button type="button" variant="outline" className="gap-2">
            <ShieldOff className="h-4 w-4" />
            2FA Sıfırla
          </Button>
        )}
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" />
        <Dialog.Content
          className={cn(
            'fixed left-1/2 top-1/2 z-50 w-[min(480px,calc(100%-2rem))] -translate-x-1/2 -translate-y-1/2',
            'rounded-lg border border-cyber-magenta/30 bg-cyber-darker p-6 shadow-2xl focus:outline-none',
          )}
        >
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-md border border-cyber-magenta/30 bg-cyber-magenta/10 p-2 text-cyber-magenta">
              <ShieldOff className="h-5 w-5" />
            </div>
            <div>
              <Dialog.Title className="font-orbitron text-lg font-bold text-white">
                2FA Sıfırla
              </Dialog.Title>
              <Dialog.Description className="text-xs text-white/60">
                @{username} kullanıcısının 2FA&apos;sı sıfırlanacak
              </Dialog.Description>
            </div>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <Label htmlFor="confirm">Onay için kullanıcı adını yaz</Label>
              <Input
                id="confirm"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder={username}
                required
              />
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
              <Button
                type="submit"
                variant="primary"
                className="bg-cyber-magenta hover:bg-cyber-magenta/80"
                disabled={confirm !== username || busy}
              >
                {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                Sıfırla
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
