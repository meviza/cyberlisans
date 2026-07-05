'use client';

import * as React from 'react';
import { X, Loader2 } from 'lucide-react';
import { Button } from '@cyberlisans/ui/atoms';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@cyberlisans/ui/atoms';

export interface RejectProductDialogProps {
  open: boolean;
  productName: string;
  submitting: boolean;
  error: string | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (reason: string) => void | Promise<void>;
}

export function RejectProductDialog({
  open,
  productName,
  submitting,
  error,
  onOpenChange,
  onSubmit,
}: RejectProductDialogProps) {
  const [reason, setReason] = React.useState('');

  React.useEffect(() => {
    if (!open) setReason('');
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (reason.trim().length < 5) return;
    await onSubmit(reason.trim());
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ürünü Reddet</DialogTitle>
          <DialogDescription>
            <span className="block">{productName}</span>
            <span className="mt-1 block">Satıcıya iletilecek red sebebini yazın.</span>
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
            minLength={5}
            required
            placeholder="Örn: Görsel kalitesi yetersiz, açıklama eksik..."
            className="w-full rounded-md border border-cyber-cyan/30 bg-cyber-darker/60 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-cyber-cyan focus:outline-none focus:ring-1 focus:ring-cyber-cyan"
          />
          {error && <p className="text-xs text-cyber-magenta">{error}</p>}
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              İptal
            </Button>
            <Button
              type="submit"
              disabled={submitting || reason.trim().length < 5}
              className="bg-cyber-magenta text-white hover:bg-cyber-magenta/90"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <X className="h-4 w-4" />
              )}
              Reddet
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
