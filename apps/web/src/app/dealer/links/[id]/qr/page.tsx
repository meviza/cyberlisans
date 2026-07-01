import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { DealerLinkQRCode } from '@/components/dealer/DealerLinkQRCode';
import type { DealerLink } from '@/lib/dealer-types';

const API_URL =
  process.env['NEXT_PUBLIC_API_URL'] ?? process.env['API_INTERNAL_URL'] ?? 'http://localhost:3001';

export const dynamic = 'force-dynamic';

async function fetchLink(id: string, auth: string): Promise<DealerLink | null> {
  try {
    const res = await fetch(`${API_URL}/dealer/links/${id}`, {
      headers: { Authorization: auth, 'Content-Type': 'application/json' },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return (await res.json()) as DealerLink;
  } catch {
    return null;
  }
}

export default async function DealerLinkQRPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const hdrs = await headers();
  const auth = hdrs.get('authorization');
  if (!auth) redirect(`/login?next=/dealer/links/${id}/qr`);

  const link = await fetchLink(id, auth);
  if (!link) redirect('/dealer/links');

  return <DealerLinkQRCode link={link} />;
}
