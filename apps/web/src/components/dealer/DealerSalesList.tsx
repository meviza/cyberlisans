'use client';

import * as React from 'react';
import Link from 'next/link';
import { Download, Filter } from 'lucide-react';
import { Card, CardContent, Button, Badge, Input } from '@cyberlisans/ui/atoms';
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

interface SalesListResponse {
  items?: DealerSale[];
  data?: DealerSale[];
  total?: number;
  page?: number;
  limit?: number;
}

interface DealerSalesListProps {
  profile: DealerProfile;
  initialSales: DealerSale[];
  links: Array<{ id: string; code: string }>;
}

export function DealerSalesList({ profile, initialSales, links }: DealerSalesListProps) {
  const [sales, setSales] = React.useState<DealerSale[]>(initialSales);
  const [status, setStatus] = React.useState('all');
  const [linkId, setLinkId] = React.useState('all');
  const [from, setFrom] = React.useState('');
  const [to, setTo] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const linkOpts = [
    { value: 'all', label: 'Tüm Linkler' },
    ...links.map((l) => ({ value: l.id, label: l.code })),
  ];

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ limit: '200' });
      if (status !== 'all') params.set('status', status);
      if (linkId !== 'all') params.set('linkId', linkId);
      if (from) params.set('from', new Date(from).toISOString());
      if (to) params.set('to', new Date(to).toISOString());
      const res = await apiFetch<SalesListResponse>(`/dealer/sales?${params.toString()}`);
      setSales(res.items ?? res.data ?? []);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Satışlar yüklenemedi');
    } finally {
      setLoading(false);
    }
  }, [status, linkId, from, to]);

  React.useEffect(() => {
    load();
  }, [load]);

  const exportCsv = async () => {
    try {
      const params = new URLSearchParams({ format: 'csv', limit: '1000' });
      if (status !== 'all') params.set('status', status);
      if (linkId !== 'all') params.set('linkId', linkId);
      if (from) params.set('from', new Date(from).toISOString());
      if (to) params.set('to', new Date(to).toISOString());
      const res = await fetch(`/api/dealer/sales?${params.toString()}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('cl_access') ?? ''}` },
      });
      if (!res.ok) throw new Error('CSV alınamadı');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dealer-sales-${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'CSV indirilemedi');
    }
  };

  return (
    <DealerAccessGuard status={profile.status}>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h1 className="font-orbitron text-2xl font-black text-white">Satışlar</h1>
            <p className="text-sm text-white/60">Tüm bayi satışlarını görüntüle ve dışa aktar.</p>
          </div>
          <Button onClick={exportCsv} variant="outline">
            <Download className="h-4 w-4" />
            CSV İndir
          </Button>
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
              <div>
                <label className="mb-1 block text-xs text-white/50">Durum</label>
                <Select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  options={STATUS_OPTS}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-white/50">Link</label>
                <Select
                  value={linkId}
                  onChange={(e) => setLinkId(e.target.value)}
                  options={linkOpts}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-white/50">Başlangıç</label>
                <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
              </div>
              <div>
                <label className="mb-1 block text-xs text-white/50">Bitiş</label>
                <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-white/50">
              <span>
                <Filter className="mr-1 inline h-3 w-3" /> Filtreler değiştiğinde liste güncellenir.
              </span>
              {loading && <span>Yükleniyor...</span>}
            </div>
          </CardContent>
        </Card>

        {error && <p className="text-sm text-cyber-magenta">{error}</p>}

        <Card>
          <CardContent className="p-0">
            {sales.length === 0 ? (
              <div className="p-10 text-center text-sm text-white/60">Kayıt bulunamadı.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-cyber-cyan/20 text-left text-xs uppercase tracking-wider text-white/60">
                      <th className="px-4 py-3">Tarih</th>
                      <th className="px-4 py-3">Sipariş</th>
                      <th className="px-4 py-3">Link</th>
                      <th className="px-4 py-3">Ürün</th>
                      <th className="px-4 py-3 text-right">Brüt</th>
                      <th className="px-4 py-3 text-right">İndirim</th>
                      <th className="px-4 py-3 text-right">Komisyon</th>
                      <th className="px-4 py-3 text-right">Net</th>
                      <th className="px-4 py-3">Durum</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sales.map((s) => {
                      const sb = STATUS_BADGE[s.status];
                      return (
                        <tr
                          key={s.id}
                          className="border-b border-cyber-cyan/10 transition-colors hover:bg-cyber-cyan/5"
                        >
                          <td className="px-4 py-3 text-white/70">
                            {new Date(s.createdAt).toLocaleString('tr-TR')}
                          </td>
                          <td className="px-4 py-3 font-mono text-xs text-cyber-cyan">
                            {s.orderId.slice(0, 8)}
                          </td>
                          <td className="px-4 py-3 font-mono text-xs text-white/70">
                            {s.linkCode ?? <span className="text-white/30">—</span>}
                          </td>
                          <td className="px-4 py-3 max-w-[200px] truncate text-white">
                            {s.productName ?? '—'}
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-white">
                            {fmtTRY(s.grossAmount)}
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-cyber-magenta">
                            {s.discountAmount > 0 ? `-${fmtTRY(s.discountAmount)}` : '—'}
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-cyber-cyan">
                            {fmtTRY(s.commissionAmount)}
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-cyber-lime">
                            {fmtTRY(s.netAmount)}
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
