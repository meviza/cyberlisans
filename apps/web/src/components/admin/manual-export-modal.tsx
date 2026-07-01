'use client';

import * as React from 'react';
import { Download, Loader2, AlertCircle } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { Button, Input, Label } from '@cyberlisans/ui/atoms';
import { getAccessToken, ApiError } from '@/lib/api-client';
import { cn } from '@cyberlisans/ui/cn';

export interface ManualExportModalProps {
  open: boolean;
  onClose: () => void;
  onDone?: () => void;
}

export function ManualExportModal({ open, onClose, onDone }: ManualExportModalProps) {
  const [userId, setUserId] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const valid = userId.trim().length >= 8;

  React.useEffect(() => {
    if (open) {
      setUserId('');
      setError(null);
    }
  }, [open]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid || busy) return;
    setBusy(true);
    setError(null);
    try {
      const token = getAccessToken();
      const res = await fetch(`/api/admin/privacy/export/${userId.trim()}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        cache: 'no-store',
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? 'İndirilemedi');
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `user-export-${userId.trim()}-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      onDone?.();
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'İndirilemedi';
      setError(msg);
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
            'fixed left-1/2 top-1/2 z-50 w-[min(520px,calc(100%-2rem))] -translate-x-1/2 -translate-y-1/2',
            'rounded-lg border border-cyber-cyan/30 bg-cyber-darker p-6 shadow-2xl focus:outline-none',
          )}
        >
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-md border border-cyber-cyan/30 bg-cyber-cyan/10 p-2 text-cyber-cyan">
              <Download className="h-5 w-5" />
            </div>
            <div>
              <Dialog.Title className="font-orbitron text-lg font-bold text-white">
                Manuel Veri Dışa Aktar
              </Dialog.Title>
              <Dialog.Description className="text-xs text-white/60">
                Kullanıcı verilerini JSON olarak indirir
              </Dialog.Description>
            </div>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <Label htmlFor="userId">Kullanıcı ID (UUID)</Label>
              <Input
                id="userId"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="örn: 3e0a2b3a-..."
                required
                minLength={8}
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
              <Button type="submit" variant="primary" disabled={!valid || busy}>
                {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                JSON İndir
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
