'use client';

import * as React from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { Card, CardContent, Button, Input, Label, Select } from '@cyberlisans/ui/atoms';
import { apiFetch, ApiError } from '@/lib/api-client';

export type ResolveAction = 'REFUND' | 'RELEASE' | 'PARTIAL_REFUND';

export interface DisputeResolveFormProps {
  disputeId: string;
  defaultAction?: ResolveAction;
}

export function DisputeResolveForm({
  disputeId,
  defaultAction = 'REFUND',
}: DisputeResolveFormProps) {
  const [action, setAction] = React.useState<ResolveAction>(defaultAction);
  const [amount, setAmount] = React.useState('');
  const [note, setNote] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [done, setDone] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await apiFetch(`/admin/disputes/${disputeId}/resolve`, {
        method: 'POST',
        body: JSON.stringify({
          action,
          amount: action === 'PARTIAL_REFUND' ? Number(amount) : undefined,
          note,
        }),
      });
      setDone(true);
    } catch (err) {
      if (err instanceof ApiError && err.status === 404)
        setError('Çözüm servisi henüz aktif değil (M3 sonrası).');
      else setError(err instanceof Error ? err.message : 'Çözüm kaydedilemedi');
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <Card>
        <CardContent className="flex items-center gap-3 p-6">
          <CheckCircle2 className="h-6 w-6 text-cyber-lime" />
          <div>
            <h3 className="font-medium text-white">İtiraz Çözüldü</h3>
            <p className="text-xs text-white/60">Karar uygulandı. Sayfayı yenileyebilirsin.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="space-y-4 p-6">
        <h3 className="font-orbitron text-base font-bold text-white">Çöz</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="action">Karar</Label>
            <Select
              id="action"
              value={action}
              onChange={(e) => setAction(e.target.value as ResolveAction)}
              disabled={submitting}
              options={[
                { value: 'REFUND', label: 'Tam İade (Müşteriye)' },
                { value: 'RELEASE', label: 'Satıcıya Aktar' },
                { value: 'PARTIAL_REFUND', label: 'Kısmi İade' },
              ]}
            />
          </div>
          {action === 'PARTIAL_REFUND' && (
            <div className="space-y-1">
              <Label htmlFor="amount">Tutar</Label>
              <Input
                id="amount"
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                disabled={submitting}
              />
            </div>
          )}
          <div className="space-y-1">
            <Label htmlFor="note">Not</Label>
            <Input
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Karar gerekçesi (opsiyonel)"
              disabled={submitting}
            />
          </div>
          {error && <p className="text-xs text-cyber-magenta">{error}</p>}
          <Button type="submit" disabled={submitting} className="w-full">
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
            {submitting ? 'Uygulanıyor...' : 'Çözümü Uygula'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
