'use client';

import * as React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { CheckCircle2, XCircle, Pause, Loader2 } from 'lucide-react';
import { Button, Input, Label } from '@cyberlisans/ui/atoms';
import { cn } from '@cyberlisans/ui/cn';

export type SellerActionKind = 'approve' | 'reject' | 'suspend';

export interface SellerActionModalProps {
  open: boolean;
  kind: SellerActionKind;
  companyName: string;
  busy?: boolean;
  onClose: () => void;
  onConfirm: (payload: { notes?: string; reason?: string }) => void | Promise<void>;
}

const META: Record<
  SellerActionKind,
  {
    title: string;
    description: string;
    confirm: string;
    icon: typeof CheckCircle2;
    tone: string;
    iconWrap: string;
  }
> = {
  approve: {
    title: 'Satıcıyı onayla',
    description:
      'Onay sonrası satıcı ürün listeleyebilir ve mağaza sayfası aktif olur. KYC durumu doğrulanmış sayılır.',
    confirm: 'Onayla',
    icon: CheckCircle2,
    tone: 'border-brand-success/30',
    iconWrap: 'border-brand-success/30 bg-brand-success/10 text-brand-success',
  },
  reject: {
    title: 'Başvuruyu reddet',
    description: 'Red sebebi satıcıya gösterilir. En az 5 karakter yazın.',
    confirm: 'Reddet',
    icon: XCircle,
    tone: 'border-brand-danger/30',
    iconWrap: 'border-brand-danger/30 bg-brand-danger/10 text-brand-danger',
  },
  suspend: {
    title: 'Satıcıyı askıya al',
    description: 'Askıdaki satıcı yeni ürün satamaz. Sebebi kayda geçer.',
    confirm: 'Askıya al',
    icon: Pause,
    tone: 'border-amber-400/30',
    iconWrap: 'border-amber-400/30 bg-amber-400/10 text-amber-300',
  },
};

export function SellerActionModal({
  open,
  kind,
  companyName,
  busy,
  onClose,
  onConfirm,
}: SellerActionModalProps) {
  const [text, setText] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const meta = META[kind];
  const Icon = meta.icon;
  const needsReason = kind === 'reject' || kind === 'suspend';
  const valid = !needsReason || text.trim().length >= 5;

  React.useEffect(() => {
    if (!open) {
      setText('');
      setError(null);
    }
  }, [open]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid || busy) return;
    setError(null);
    try {
      if (kind === 'approve') await onConfirm({ notes: text.trim() || undefined });
      else await onConfirm({ reason: text.trim() });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'İşlem başarısız');
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
            'rounded-xl border bg-[#0B1220] p-6 shadow-2xl focus:outline-none',
            meta.tone,
          )}
        >
          <div className="mb-4 flex items-start gap-3">
            <div className={cn('rounded-lg border p-2', meta.iconWrap)}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <Dialog.Title className="text-lg font-semibold text-white">{meta.title}</Dialog.Title>
              <Dialog.Description className="mt-1 text-sm text-white/60">
                <span className="font-medium text-white/80">{companyName}</span> —{' '}
                {meta.description}
              </Dialog.Description>
            </div>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <Label htmlFor="seller-action-text" className="mb-2 block">
                {kind === 'approve' ? 'Not (opsiyonel)' : 'Sebep *'}
              </Label>
              {needsReason ? (
                <textarea
                  id="seller-action-text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={4}
                  placeholder={
                    kind === 'reject'
                      ? 'Örn: Vergi bilgileri eksik / belgeler yetersiz'
                      : 'Örn: Şikayet incelemesi / politika ihlali'
                  }
                  className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white outline-none ring-brand-accent/40 placeholder:text-white/30 focus:ring-2"
                />
              ) : (
                <Input
                  id="seller-action-text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="İç not — satıcıya görünmez olabilir"
                />
              )}
              {needsReason && (
                <p className="mt-1 text-xs text-white/40">{text.trim().length}/5 minimum</p>
              )}
            </div>

            {error && (
              <p className="rounded-lg border border-brand-danger/30 bg-brand-danger/10 px-3 py-2 text-sm text-brand-danger">
                {error}
              </p>
            )}

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose} disabled={!!busy}>
                Vazgeç
              </Button>
              <Button type="submit" disabled={!valid || !!busy}>
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Icon className="h-4 w-4" />}
                {meta.confirm}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
