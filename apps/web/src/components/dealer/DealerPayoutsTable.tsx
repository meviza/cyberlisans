'use client';

import * as React from 'react';
import { Card, CardContent, Badge, Spinner } from '@cyberlisans/ui/atoms';
import { Select } from '@/components/ui/select';
import { apiFetch, ApiError } from '@/lib/api-client';
import type { DealerPayout, DealerPayoutStatus } from '@/lib/dealer-types';

const STATUS_OPTS = [
  { value: 'all', label: 'Tüm Durumlar' },
  { value: 'PENDING', label: 'Bekliyor' },
  { value: 'PROCESSING', label: 'İşleniyor' },
  { value: 'COMPLETED', label: 'Tamamlandı' },
  { value: 'REJECTED', label: 'Reddedildi' },
];

const STATUS_BADGE: Record<
  DealerPayoutStatus,
  { label: string; variant: 'success' | 'warning' | 'danger' | 'default' }
> = {
  PENDING: { label: 'Bekliyor', variant: 'warning' },
  PROCESSING: { label: 'İşleniyor', variant: 'default' },
  COMPLETED: { label: 'Tamamlandı', variant: 'success' },
  REJECTED: { label: 'Reddedildi', variant: 'danger' },
};

const fmt = (n: number, c: string) =>
  new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: c,
    maximumFractionDigits: 2,
  }).format(n);

export function DealerPayoutsTable({ initial }: { initial: DealerPayout[] }) {
  const [items, setItems] = React.useState<DealerPayout[]>(initial);
  const [status, setStatus] = React.useState('all');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ limit: '100' });
      if (status !== 'all') params.set('status', status);
      const res = await apiFetch<
        { items?: DealerPayout[]; data?: DealerPayout[] } | DealerPayout[]
      >(`/dealer/payouts?${params.toString()}`);
      setItems(Array.isArray(res) ? res : (res.items ?? res.data ?? []));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Ödemeler yüklenemedi');
    } finally {
      setLoading(false);
    }
  }, [status]);

  React.useEffect(() => {
    load();
  }, [load]);

  return (
    <Card>
      <CardContent className="p-4">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-orbitron text-lg font-bold text-white">Ödeme Geçmişi</h2>
          <div className="w-full sm:w-56">
            <Select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              options={STATUS_OPTS}
            />
          </div>
        </div>
        {error && <p className="mb-3 text-sm text-cyber-magenta">{error}</p>}
        {loading ? (
          <div className="flex items-center justify-center p-10">
            <Spinner size="md" />
          </div>
        ) : items.length === 0 ? (
          <div className="p-8 text-center text-sm text-white/60">Henüz ödeme talebi yok.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-cyber-cyan/20 text-left text-xs uppercase tracking-wider text-white/60">
                  <th className="px-3 py-3">Tarih</th>
                  <th className="px-3 py-3 text-right">Tutar</th>
                  <th className="px-3 py-3">Yöntem</th>
                  <th className="px-3 py-3">Hesap</th>
                  <th className="px-3 py-3">Durum</th>
                  <th className="px-3 py-3">İşlem Tarihi</th>
                </tr>
              </thead>
              <tbody>
                {items.map((p) => {
                  const sb = STATUS_BADGE[p.status];
                  return (
                    <tr
                      key={p.id}
                      className="border-b border-cyber-cyan/10 transition-colors hover:bg-cyber-cyan/5"
                    >
                      <td className="px-3 py-3 text-white/70">
                        {new Date(p.createdAt).toLocaleDateString('tr-TR')}
                      </td>
                      <td className="px-3 py-3 text-right font-mono text-cyber-cyan">
                        {fmt(p.amount, p.currency)}
                      </td>
                      <td className="px-3 py-3 text-white/80">{p.method}</td>
                      <td className="px-3 py-3 max-w-[200px] truncate font-mono text-xs text-white/70">
                        {p.destination}
                      </td>
                      <td className="px-3 py-3">
                        <Badge variant={sb.variant} size="sm">
                          {sb.label}
                        </Badge>
                      </td>
                      <td className="px-3 py-3 text-white/70">
                        {p.processedAt ? new Date(p.processedAt).toLocaleDateString('tr-TR') : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
