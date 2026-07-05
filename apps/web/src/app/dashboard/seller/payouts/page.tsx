'use client';

import * as React from 'react';
import { AlertCircle } from 'lucide-react';
import { Spinner } from '@cyberlisans/ui/atoms';
import { apiFetch, ApiError } from '@/lib/api-client';
import {
  PayoutStats,
  type PayoutStatsProps,
} from '@/components/dashboard/seller/payouts/payout-stats';
import { PayoutTable, type PayoutRow } from '@/components/dashboard/seller/payouts/payout-table';
import { PayoutRequestModal } from '@/components/dashboard/seller/payouts/payout-request-modal';

interface PayoutsResponse extends PayoutStatsProps {
  rows: PayoutRow[];
}

export default function SellerPayoutsPage() {
  const [data, setData] = React.useState<PayoutsResponse | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [refreshKey, setRefreshKey] = React.useState(0);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await apiFetch<PayoutsResponse>('/payouts/me');
        if (!cancelled) setData(res);
      } catch (err) {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 404) {
          setData({
            availableBalance: 0,
            pendingPayouts: 0,
            lifetimeWithdrawn: 0,
            currency: 'TRY',
            rows: [],
          });
        } else {
          setError('Payout bilgileri yüklenemedi');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  if (loading)
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );

  if (error || !data) {
    return (
      <div className="flex items-center gap-2 rounded-md border border-cyber-magenta/40 bg-cyber-magenta/10 px-4 py-3 text-sm text-cyber-magenta">
        <AlertCircle className="h-4 w-4" /> {error ?? 'Payout bilgisi yok'}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-orbitron text-2xl font-black text-white">Payoutlar</h1>
          <p className="text-sm text-white/60">Kazançlarını çek</p>
        </div>
        <PayoutRequestModal
          availableBalance={data.availableBalance}
          currency={data.currency}
          onCreated={() => setRefreshKey((k) => k + 1)}
        />
      </div>
      <PayoutStats
        availableBalance={data.availableBalance}
        pendingPayouts={data.pendingPayouts}
        lifetimeWithdrawn={data.lifetimeWithdrawn}
        currency={data.currency}
      />
      <div>
        <h2 className="mb-3 font-orbitron text-base font-bold text-white">Son Talepler</h2>
        <PayoutTable rows={data.rows} />
      </div>
    </div>
  );
}
