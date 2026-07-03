'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { DealerDashboardClient } from '@/components/dealer/DealerDashboardClient';
import { DealerDashboardLoading } from '@/components/dealer/DealerDashboardClient';
import { apiFetch } from '@/lib/api-client';
import type { DealerProfile, DealerStats } from '@/lib/dealer-types';

const FALLBACK_STATS: DealerStats = {
  totalSales: 0,
  totalGross: 0,
  totalCommission: 0,
  balance: 0,
  pendingCommission: 0,
  settledCommission: 0,
  salesTrend: [],
  commissionTrend: [],
  topProducts: [],
  recentSales: [],
  activeLinks: [],
};

export default function DealerDashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = React.useState<DealerProfile | null>(null);
  const [stats, setStats] = React.useState<DealerStats>(FALLBACK_STATS);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;
    Promise.all([apiFetch<DealerProfile>('/dealer/me'), apiFetch<DealerStats>('/dealer/stats')])
      .then(([profileRes, statsRes]) => {
        if (cancelled) return;
        setProfile(profileRes);
        setStats(statsRes ?? FALLBACK_STATS);
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

  if (loading || !profile) return <DealerDashboardLoading />;
  return <DealerDashboardClient initialProfile={profile} initialStats={stats} />;
}
