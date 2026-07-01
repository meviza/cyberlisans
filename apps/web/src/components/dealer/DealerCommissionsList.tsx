'use client';

import * as React from 'react';
import { Card, CardContent, Badge, Spinner } from '@cyberlisans/ui/atoms';
import { Select } from '@/components/ui/select';
import { apiFetch, ApiError } from '@/lib/api-client';
import { DealerAccessGuard } from '@/components/dealer/DealerStatusBanner';
import type { DealerProfile, DealerSale, DealerSaleStatus } from '@/lib/dealer-types';

const STATUS_OPTS = [
  { value: 'all', label: 'Tüm Durumlar' },
  { value: 'PENDING', label: 'Bekliyor' },
  { value: 'SETTLED', label: 'Ödendi' },
  { value: 'REFUNDED', label: 'İade' },
];

const STATUS_BADGE: Record<
  DealerSaleStatus,
  { label: string; variant: 'success' | 'warning' | 'danger' | 'default' }
> = {
  PENDING: { label: 'Bekliyor', variant: 'warning' },
  SETTLED: { label: 'Ödendi', variant: 'success' },
  REFUNDED: { label: 'İade', variant: 'danger' },
};

const fmtTRY = (n: number) =>
  new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 2,
  }).format(n);

interface CommissionsListResponse {
  items?: DealerSale[];
  data?: DealerSale[];
  totalEarned?: number;
  pendingSettlement?: number;
  settled?: number;
  total?: number;
}

interface DealerCommissionsListProps {
  profile: DealerProfile;
  initialCommissions: DealerSale[];
  initialTotals: { totalEarned: number; pendingSettlement: number; settled: number };
}

export function DealerCommissionsList({
  profile,
  initialCommissions,
  initialTotals,
}: DealerCommissionsListProps) {
  const [items, setItems] = React.useState<DealerSale[]>(initialCommissions);
  const [status, setStatus] = React.useState('all');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [totals, setTotals] = React.useState(initialTotals);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ limit: '200' });
      if (status !== 'all') params.set('status', status);
      const res = await apiFetch<CommissionsListResponse>(
        `/dealer/commissions?${params.toString()}`,
      );
      setItems(res.items ?? res.data ?? []);
      if (res.totalEarned !== undefined) {
        setTotals({
          totalEarned: res.totalEarned,
          pendingSettlement: res.pendingSettlement ?? 0,
          settled: res.settled ?? 0,
        });
      } else {
        const list = res.items ?? res.data ?? [];
        setTotals({
          totalEarned: list.reduce((s, it) => s + it.commissionAmount, 0),
          pendingSettlement: list
            .filter((it) => it.status === 'PENDING')
            .reduce((s, it) => s + it.commissionAmount, 0),
          settled: list
            .filter((it) => it.status === 'SETTLED')
            .reduce((s, it) => s + it.commissionAmount, 0),
        });
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Komisyonlar yüklenemedi');
    } finally {
      setLoading(false);
    }
  }, [status]);

  React.useEffect(() => {
    load();
  }, [load]);

  return (
    <DealerAccessGuard status={profile.status}>
      <div className="space-y-6">
        <div>
          <h1 className="font-orbitron text-2xl font-black text-white">Komisyonlar</h1>
          <p className="text-sm text-white/60">Kazandığın komisyonları takip et.</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="p-5">
              <p className="text-xs uppercase tracking-wider text-white/50">Toplam Kazanılan</p>
              <p className="mt-1 font-orbitron text-2xl text-white">{fmtTRY(totals.totalEarned)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <p className="text-xs uppercase tracking-wider text-white/50">
                Bekleyen (Henüz Ödenmemiş)
              </p>
              <p className="mt-1 font-orbitron text-2xl text-cyber-magenta">
                {fmtTRY(totals.pendingSettlement)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <p className="text-xs uppercase tracking-wider text-white/50">Ödenmiş</p>
              <p className="mt-1 font-orbitron text-2xl text-cyber-lime">
                {fmtTRY(totals.settled)}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs text-white/50">Durum</label>
                <Select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  options={STATUS_OPTS}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {error && <p className="text-sm text-cyber-magenta">{error}</p>}

        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center p-10">
                <Spinner size="lg" />
              </div>
            ) : items.length === 0 ? (
              <div className="p-10 text-center text-sm text-white/60">Kayıt yok.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-cyber-cyan/20 text-left text-xs uppercase tracking-wider text-white/60">
                      <th className="px-4 py-3">Tarih</th>
                      <th className="px-4 py-3">Sipariş</th>
                      <th className="px-4 py-3">Brüt</th>
                      <th className="px-4 py-3 text-right">Komisyon</th>
                      <th className="px-4 py-3">Ödeme Tarihi</th>
                      <th className="px-4 py-3">Durum</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((c) => {
                      const sb = STATUS_BADGE[c.status];
                      return (
                        <tr
                          key={c.id}
                          className="border-b border-cyber-cyan/10 transition-colors hover:bg-cyber-cyan/5"
                        >
                          <td className="px-4 py-3 text-white/70">
                            {new Date(c.createdAt).toLocaleDateString('tr-TR')}
                          </td>
                          <td className="px-4 py-3 font-mono text-xs text-cyber-cyan">
                            {c.orderId.slice(0, 8)}
                          </td>
                          <td className="px-4 py-3 text-white">{fmtTRY(c.grossAmount)}</td>
                          <td className="px-4 py-3 text-right font-mono text-cyber-cyan">
                            {fmtTRY(c.commissionAmount)}
                          </td>
                          <td className="px-4 py-3 text-white/70">
                            {c.settledAt ? new Date(c.settledAt).toLocaleDateString('tr-TR') : '—'}
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant={sb.variant} size="sm">
                              {sb.label}
                            </Badge>
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
      </div>
    </DealerAccessGuard>
  );
}
