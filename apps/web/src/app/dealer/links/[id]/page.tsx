import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { DealerLinkDetail } from '@/components/dealer/DealerLinkDetail';
import type { DealerLink, ProductListItem } from '@/lib/dealer-types';

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

export default async function DealerLinkDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const hdrs = await headers();
  const auth = hdrs.get('authorization');
  if (!auth) redirect(`/login?next=/dealer/links/${id}`);

  const link = await fetchJson<DealerLink>(`/dealer/links/${id}`, auth);
  if (!link) redirect('/dealer/links');

  const productsRes = await fetchJson<
    { items?: ProductListItem[]; data?: ProductListItem[] } | ProductListItem[]
  >('/products?limit=200', auth);
  const products = Array.isArray(productsRes)
    ? productsRes
    : (productsRes?.items ?? productsRes?.data ?? []);

  return <DealerLinkDetail initialLink={link} products={products} />;
}
