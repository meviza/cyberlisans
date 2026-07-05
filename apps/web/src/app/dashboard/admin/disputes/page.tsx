'use client';

import * as React from 'react';
import { AlertCircle, Gavel } from 'lucide-react';
import { Spinner } from '@cyberlisans/ui/atoms';
import { EmptyState } from '@/components/store/empty-state';
import { apiFetch, ApiError } from '@/lib/api-client';
import { DisputeTable, type DisputeRow } from '@/components/dashboard/admin/dispute-table';
import { DisputeFilters } from '@/components/dashboard/admin/dispute-filters';

const MOCK: DisputeRow[] = [
  {
    id: 'dsp_001abc',
    orderId: 'ord_002xyz',
    customerName: 'Müşteri Demo',
    sellerName: 'Demo Seller',
    reason: 'Lisans anahtarı çalışmıyor',
    status: 'OPEN',
    openedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'dsp_002def',
    orderId: 'ord_003uvw',
    customerName: 'Ali Y.',
    sellerName: 'GameStore',
    reason: 'Yanlış ürün teslim edildi',
    status: 'OPEN',
    openedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
];

export default function AdminDisputesPage() {
  const [rows, setRows] = React.useState<DisputeRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [status, setStatus] = React.useState<'ALL' | DisputeRow['status']>('ALL');
  const [date, setDate] = React.useState<'ALL' | '7d' | '30d'>('ALL');

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await apiFetch<{ items: DisputeRow[] }>('/admin/disputes');
        if (!cancelled) setRows(res.items);
      } catch (err) {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 404) setRows(MOCK);
        else setRows([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = React.useMemo(() => {
    return rows.filter((r) => {
      if (status !== 'ALL' && r.status !== status) return false;
      if (date !== 'ALL') {
        const days = date === '7d' ? 7 : 30;
        const cutoff = Date.now() - days * 86400000;
        if (new Date(r.openedAt).getTime() < cutoff) return false;
      }
      return true;
    });
  }, [rows, status, date]);

  if (loading)
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-orbitron text-2xl font-black text-white">İtiraz Yönetimi</h1>
          <p className="text-sm text-white/60">Açık ve geçmiş itirazları yönet</p>
        </div>
        <div className="rounded-md border border-cyber-cyan/30 bg-cyber-cyan/5 px-3 py-1.5 text-xs text-cyber-cyan">
          {filtered.length} itiraz
        </div>
      </div>
      <DisputeFilters
        status={status}
        date={date}
        onStatusChange={setStatus}
        onDateChange={setDate}
      />
      {filtered.length === 0 ? (
        <EmptyState
          icon={Gavel}
          title="İtiraz bulunamadı"
          description="Bu filtreyle eşleşen itiraz yok."
        />
      ) : (
        <DisputeTable rows={filtered} />
      )}
      {rows === MOCK && (
        <div className="flex items-center gap-2 rounded-md border border-cyber-yellow/30 bg-cyber-yellow/5 px-3 py-2 text-xs text-cyber-yellow">
          <AlertCircle className="h-4 w-4" /> Mock veri gösteriliyor — /api/admin/disputes henüz
          yok.
        </div>
      )}
    </div>
  );
}
