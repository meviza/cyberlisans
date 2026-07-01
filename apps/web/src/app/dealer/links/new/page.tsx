import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { DealerCreateLinkForm } from '@/components/dealer/DealerCreateLinkForm';
import type { DealerProfile, ProductListItem } from '@/lib/dealer-types';

const API_URL =
  process.env['NEXT_PUBLIC_API_URL'] ?? process.env['API_INTERNAL_URL'] ?? 'http://localhost:3001';

export const dynamic = 'force-dynamic';

async function fetchJson<T>(path: string, auth?: string): Promise<T | null> {
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

export default async function DealerNewLinkPage() {
  const hdrs = await headers();
  const auth = hdrs.get('authorization');
  if (!auth) redirect('/login?next=/dealer/links/new');

  const profile = await fetchJson<DealerProfile>('/dealer/me', auth);
  if (!profile) redirect('/dealer/register');

  const productsRes = await fetchJson<
    { items?: ProductListItem[]; data?: ProductListItem[] } | ProductListItem[]
  >('/products?limit=200', auth);
  const products = Array.isArray(productsRes)
    ? productsRes
    : (productsRes?.items ?? productsRes?.data ?? []);

  return <DealerCreateLinkForm profile={profile} products={products} />;
}
