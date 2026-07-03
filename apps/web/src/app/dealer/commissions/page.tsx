'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Spinner } from '@cyberlisans/ui/atoms';
import { DealerCommissionsList } from '@/components/dealer/DealerCommissionsList';
import { apiFetch } from '@/lib/api-client';
import type { DealerProfile, DealerSale } from '@/lib/dealer-types';

interface CommissionsResponse {
  items?: DealerSale[];
  data?: DealerSale[];
  totalEarned?: number;
  pendingSettlement?: number;
  settled?: number;
}

export default function DealerCommissionsPage() {
  const router = useRouter();
  const [profile, setProfile] = React.useState<DealerProfile | null>(null);
  const [items, setItems] = React.useState<DealerSale[]>([]);
  const [totals, setTotals] = React.useState({ totalEarned: 0, pendingSettlement: 0, settled: 0 });
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;
    Promise.all([
      apiFetch<DealerProfile>('/dealer/me'),
      apiFetch<CommissionsResponse>('/dealer/commissions?limit=200'),
    ])
      .then(([profileRes, res]) => {
        if (cancelled) return;
        const list = res.items ?? res.data ?? [];
        setProfile(profileRes);
        setItems(list);
        setTotals({
          totalEarned: res.totalEarned ?? list.reduce((s, it) => s + it.commissionAmount, 0),
          pendingSettlement:
            res.pendingSettlement ??
            list
              .filter((it) => it.status === 'PENDING')
              .reduce((s, it) => s + it.commissionAmount, 0),
          settled:
            res.settled ??
            list
              .filter((it) => it.status === 'SETTLED')
              .reduce((s, it) => s + it.commissionAmount, 0),
        });
      })
      .catch(() => {
        if (!cancelled) router.replace('/dealer/register');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (loading || !profile) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <DealerCommissionsList profile={profile} initialCommissions={items} initialTotals={totals} />
  );
}
