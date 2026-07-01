import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { DealerProfileForm } from '@/components/dealer/DealerProfileForm';
import type { DealerProfile } from '@/lib/dealer-types';

const API_URL =
  process.env['NEXT_PUBLIC_API_URL'] ?? process.env['API_INTERNAL_URL'] ?? 'http://localhost:3001';

export const dynamic = 'force-dynamic';

export default async function DealerProfilePage() {
  const hdrs = await headers();
  const auth = hdrs.get('authorization');
  if (!auth) redirect('/login?next=/dealer/profile');

  let profile: DealerProfile | null = null;
  try {
    const res = await fetch(`${API_URL}/dealer/me`, {
      headers: { Authorization: auth, 'Content-Type': 'application/json' },
      cache: 'no-store',
    });
    if (res.ok) profile = (await res.json()) as DealerProfile;
  } catch {}
  if (!profile) redirect('/dealer/register');

  return <DealerProfileForm initialProfile={profile} />;
}
