import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { DealerCommissionsList } from '@/components/dealer/DealerCommissionsList';
import type { DealerProfile, DealerSale } from '@/lib/dealer-types';

const API_URL =
  process.env['NEXT_PUBLIC_API_URL'] ?? process.env['API_INTERNAL_URL'] ?? 'http://localhost:3001';

export const dynamic = 'force-dynamic';

async function fetchJson<T>(path: string, auth: string): Promise<T | null> {
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

export default async function DealerCommissionsPage() {
  const hdrs = await headers();
  const auth = hdrs.get('authorization');
  if (!auth) redirect('/login?next=/dealer/commissions');

  const profile = await fetchJson<DealerProfile>('/dealer/me', auth);
  if (!profile) redirect('/dealer/register');

  const res = await fetchJson<{
    items?: DealerSale[];
    data?: DealerSale[];
    totalEarned?: number;
    pendingSettlement?: number;
    settled?: number;
  }>('/dealer/commissions?limit=200', auth);

  const items = Array.isArray(res) ? res : (res?.items ?? res?.data ?? []);

  const initialTotals = {
    totalEarned: res?.totalEarned ?? items.reduce((s, it) => s + it.commissionAmount, 0),
    pendingSettlement:
      res?.pendingSettlement ??
      items.filter((it) => it.status === 'PENDING').reduce((s, it) => s + it.commissionAmount, 0),
    settled:
      res?.settled ??
      items.filter((it) => it.status === 'SETTLED').reduce((s, it) => s + it.commissionAmount, 0),
  };

  return (
    <DealerCommissionsList
      profile={profile}
      initialCommissions={items}
      initialTotals={initialTotals}
    />
  );
}
