import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { DealerLinksTable } from '@/components/dealer/DealerLinksTable';
import type { DealerLink, DealerProfile } from '@/lib/dealer-types';

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

export default async function DealerLinksPage() {
  const profile = await fetchJson<DealerProfile>('/dealer/me');
  if (!profile) redirect('/dealer/register');

  const linksRes = await fetchJson<{ items?: DealerLink[]; data?: DealerLink[] } | DealerLink[]>(
    '/dealer/links?limit=100',
  );
  const initialLinks = Array.isArray(linksRes)
    ? linksRes
    : (linksRes?.items ?? linksRes?.data ?? []);

  return <DealerLinksTable initialLinks={initialLinks} profile={profile} />;
}
