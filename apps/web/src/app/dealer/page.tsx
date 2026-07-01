import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { DealerDashboardClient } from '@/components/dealer/DealerDashboardClient';
import type { DealerProfile, DealerStats } from '@/lib/dealer-types';

const API_URL =
  process.env['NEXT_PUBLIC_API_URL'] ?? process.env['API_INTERNAL_URL'] ?? 'http://localhost:3001';

export const dynamic = 'force-dynamic';

async function fetchJson<T>(path: string): Promise<T | null> {
  const hdrs = await headers();
  const auth = hdrs.get('authorization');
  if (!auth) return null;
  try {
    const res = await fetch(`${API_URL}${path}`, {
      headers: { Authorization: auth, 'Content-Type': 'application/json' },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

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

export default async function DealerDashboardPage() {
  const profile = await fetchJson<DealerProfile>('/dealer/me');
  if (!profile) redirect('/dealer/register');

  const stats = await fetchJson<DealerStats>('/dealer/stats');

  return <DealerDashboardClient initialProfile={profile} initialStats={stats ?? FALLBACK_STATS} />;
}
