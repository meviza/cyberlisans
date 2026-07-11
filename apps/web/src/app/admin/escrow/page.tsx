'use client';

import * as React from 'react';
import { AlertCircle, PlayCircle, Loader2 } from 'lucide-react';
import { Spinner, Button } from '@cyberlisans/ui/atoms';
import { apiFetch, ApiError } from '@/lib/api-client';
import {
  EscrowTable,
  type EscrowRow,
  type EscrowStatus,
} from '@/components/dashboard/admin/escrow-table';
import { EscrowStats } from '@/components/dashboard/admin/escrow-stats';

interface EscrowResponse {
  rows: EscrowRow[];
  totals: {
    held: number;
    pending: number;
    released: number;
    disputed: number;
    currency: EscrowRow['currency'];
  };
}

const MOCK_ROWS: EscrowRow[] = [
  {
    id: 'esc_001',
    orderId: 'ord_002xyz',
    amount: 499,
    currency: 'TRY',
    status: 'HELD',
    releaseDate: new Date(Date.now() + 3 * 86400000).toISOString(),
    ageDays: 4,
  },
  {
    id: 'esc_002',
    orderId: 'ord_003uvw',
    amount: 1299,
    currency: 'TRY',
    status: 'HELD',
    releaseDate: new Date(Date.now() - 86400000).toISOString(),
    ageDays: 8,
  },
  {
    id: 'esc_003',
    orderId: 'ord_004abc',
    amount: 299,
    currency: 'USD',
    status: 'RELEASED',
    releaseDate: new Date(Date.now() - 2 * 86400000).toISOString(),
    ageDays: 9,
  },
  {
    id: 'esc_004',
    orderId: 'ord_005def',
    amount: 99,
    currency: 'USD',
    status: 'DISPUTED',
    releaseDate: new Date(Date.now() + 86400000).toISOString(),
    ageDays: 5,
  },
];

const FILTERS: Array<{ value: 'ALL' | EscrowStatus; label: string }> = [
  { value: 'ALL', label: 'Tümü' },
  { value: 'HELD', label: "Escrow'da" },
  { value: 'RELEASED', label: 'Serbest' },
  { value: 'DISPUTED', label: 'İtirazlı' },
  { value: 'REFUNDED', label: 'İade' },
];

export default function AdminEscrowPage() {
  const [data, setData] = React.useState<EscrowResponse | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [running, setRunning] = React.useState(false);
  const [runMsg, setRunMsg] = React.useState<string | null>(null);
  const [filter, setFilter] = React.useState<'ALL' | EscrowStatus>('ALL');

  const load = React.useCallback(async () => {
    let cancelled = false;
    try {
      const res = await apiFetch<EscrowResponse>('/admin/escrow');
      if (!cancelled) setData(res);
    } catch (err) {
      if (cancelled) return;
      if (err instanceof ApiError && err.status === 404) {
        const totals = MOCK_ROWS.reduce(
          (acc, r) => {
            if (r.status === 'HELD') acc.held += r.amount;
            if (r.status === 'HELD' && r.ageDays >= 7) acc.pending += r.amount;
            if (r.status === 'RELEASED') acc.released += r.amount;
            if (r.status === 'DISPUTED') acc.disputed += r.amount;
            return acc;
          },
          { held: 0, pending: 0, released: 0, disputed: 0 },
        );
        setData({ rows: MOCK_ROWS, totals: { ...totals, currency: 'TRY' } });
      }
    } finally {
      if (!cancelled) setLoading(false);
    }
    return () => {
      cancelled = true;
    };
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const handleAutoRelease = async () => {
    setRunning(true);
    setRunMsg(null);
    try {
      const res = await apiFetch<{ released: number }>('/admin/escrow/auto-release', {
        method: 'POST',
      });
      setRunMsg(`${res.released} escrow serbest bırakıldı`);
      await load();
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        const released =
          data?.rows.filter((r) => r.status === 'HELD' && r.ageDays >= 7).length ?? 0;
        setRunMsg(`Mock: ${released} escrow serbest bırakıldı (endpoint yok)`);
      } else {
        setRunMsg(err instanceof Error ? err.message : 'Çalıştırılamadı');
      }
    } finally {
      setRunning(false);
    }
  };

  if (loading)
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  if (!data)
    return (
      <div className="flex items-center gap-2 rounded-md border border-cyber-magenta/40 bg-cyber-magenta/10 px-4 py-3 text-sm text-cyber-magenta">
        <AlertCircle className="h-4 w-4" />
        Escrow verisi yüklenemedi
      </div>
    );

  const filtered = filter === 'ALL' ? data.rows : data.rows.filter((r) => r.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-orbitron text-2xl font-black text-white">Escrow Yönetimi</h1>
          <p className="text-sm text-white/60">Tüm escrow kayıtlarını izle ve yönet</p>
        </div>
        <Button onClick={handleAutoRelease} disabled={running}>
          {running ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <PlayCircle className="h-4 w-4" />
          )}
          {running ? 'Çalışıyor...' : 'Auto-release Çalıştır'}
        </Button>
      </div>
      {runMsg && (
        <div className="rounded-md border border-cyber-cyan/30 bg-cyber-cyan/5 px-3 py-2 text-xs text-cyber-cyan">
          {runMsg}
        </div>
      )}
      <EscrowStats
        held={data.totals.held}
        pending={data.totals.pending}
        released={data.totals.released}
        disputed={data.totals.disputed}
        currency={data.totals.currency}
      />
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setFilter(f.value)}
            className={
              filter === f.value
                ? 'rounded-md border border-cyber-cyan/50 bg-cyber-cyan/10 px-3 py-1.5 text-sm text-cyber-cyan'
                : 'rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/70 hover:border-cyber-cyan/30'
            }
          >
            {f.label}
          </button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <div className="rounded-md border border-dashed border-cyber-cyan/20 bg-cyber-darker/40 p-8 text-center text-sm text-white/50">
          Bu filtreyle escrow kaydı yok.
        </div>
      ) : (
        <EscrowTable rows={filtered} />
      )}
    </div>
  );
}
