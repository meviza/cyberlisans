import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { DealerPayoutForm } from '@/components/dealer/DealerPayoutForm';
import { DealerPayoutsTable } from '@/components/dealer/DealerPayoutsTable';
import type { DealerProfile, DealerPayout } from '@/lib/dealer-types';

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

export default async function DealerPayoutsPage() {
  const hdrs = await headers();
  const auth = hdrs.get('authorization');
  if (!auth) redirect('/login?next=/dealer/payouts');

  const profile = await fetchJson<DealerProfile>('/dealer/me', auth);
  if (!profile) redirect('/dealer/register');

  const payoutsRes = await fetchJson<
    { items?: DealerPayout[]; data?: DealerPayout[] } | DealerPayout[]
  >('/dealer/payouts?limit=50', auth);
  const initial = Array.isArray(payoutsRes)
    ? payoutsRes
    : (payoutsRes?.items ?? payoutsRes?.data ?? []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-orbitron text-2xl font-black text-white">Ödemeler</h1>
        <p className="text-sm text-white/60">Bakiyeni talep et ve ödeme geçmişini gör.</p>
      </div>
      <DealerPayoutForm profile={profile} />
      <DealerPayoutsTable initial={initial} />
    </div>
  );
}
