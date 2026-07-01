import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { DealerSalesList } from '@/components/dealer/DealerSalesList';
import type { DealerLink, DealerProfile, DealerSale } from '@/lib/dealer-types';

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

export default async function DealerSalesPage() {
  const hdrs = await headers();
  const auth = hdrs.get('authorization');
  if (!auth) redirect('/login?next=/dealer/sales');

  const profile = await fetchJson<DealerProfile>('/dealer/me', auth);
  if (!profile) redirect('/dealer/register');

  const [salesRes, linksRes] = await Promise.all([
    fetchJson<{ items?: DealerSale[]; data?: DealerSale[] } | DealerSale[]>(
      '/dealer/sales?limit=200',
      auth,
    ),
    fetchJson<{ items?: DealerLink[]; data?: DealerLink[] } | DealerLink[]>(
      '/dealer/links?limit=100',
      auth,
    ),
  ]);

  const sales = Array.isArray(salesRes) ? salesRes : (salesRes?.items ?? salesRes?.data ?? []);
  const links = Array.isArray(linksRes) ? linksRes : (linksRes?.items ?? linksRes?.data ?? []);

  return (
    <DealerSalesList
      profile={profile}
      initialSales={sales}
      links={links.map((l) => ({ id: l.id, code: l.code }))}
    />
  );
}
