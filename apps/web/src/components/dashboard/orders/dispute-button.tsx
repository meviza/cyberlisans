'use client';

import * as React from 'react';
import { Gavel, Eye, Loader2 } from 'lucide-react';
import { Card, CardContent, Button, Input, Label } from '@cyberlisans/ui/atoms';
import { apiFetch, ApiError } from '@/lib/api-client';

export interface DisputeButtonProps {
  orderId: string;
  canView: boolean;
  escrowKeyId?: string | null;
}

export function DisputeButton({ orderId, canView, escrowKeyId }: DisputeButtonProps) {
  const [open, setOpen] = React.useState(false);
  const [reason, setReason] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('Lütfen itiraz sebebini yaz');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await apiFetch('/disputes', { method: 'POST', body: JSON.stringify({ orderId, reason }) });
      setOpen(false);
      setReason('');
    } catch (err) {
      if (err instanceof ApiError && err.status === 404)
        setError('İtiraz servisi henüz aktif değil (M3 sonrası).');
      else setError(err instanceof Error ? err.message : 'İtiraz oluşturulamadı');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-3">
      {canView && (
        <Card>
          <CardContent className="space-y-3 p-5">
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-cyber-cyan" />
              <h3 className="font-medium text-white">Lisans Anahtarın</h3>
            </div>
            <div className="rounded-md border border-cyber-cyan/30 bg-cyber-darker p-3 font-mono text-sm text-cyber-cyan">
              {escrowKeyId ?? 'XXXX-XXXX-XXXX-XXXX'}
            </div>
            <p className="text-xs text-white/50">
              Anahtarı kopyala ve ürünü etkinleştir. Sorun yaşarsan 7 gün içinde itiraz aç.
            </p>
          </CardContent>
        </Card>
      )}
      {!open ? (
        <Button
          variant="outline"
          onClick={() => setOpen(true)}
          className="w-full border-cyber-magenta/50 text-cyber-magenta hover:bg-cyber-magenta/10"
        >
          <Gavel className="h-4 w-4" /> İtiraz Aç
        </Button>
      ) : (
        <Card className="border-cyber-magenta/40">
          <CardContent className="space-y-3 p-5">
            <h3 className="font-medium text-white">İtiraz Aç</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="reason">Sebep</Label>
                <Input
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Lisans çalışmıyor..."
                  required
                  disabled={submitting}
                />
              </div>
              {error && <p className="text-xs text-cyber-magenta">{error}</p>}
              <div className="flex gap-2">
                <Button type="submit" disabled={submitting} className="flex-1">
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Gavel className="h-4 w-4" />
                  )}{' '}
                  Gönder
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setOpen(false);
                    setError(null);
                  }}
                  disabled={submitting}
                >
                  Vazgeç
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
