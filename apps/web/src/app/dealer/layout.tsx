import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { DealerSidebar } from '@/components/dealer/DealerSidebar';
import { DealerTopbarClient } from '@/components/dealer/DealerTopbarClient';
import { DealerStatusBanner } from '@/components/dealer/DealerStatusBanner';
import type { DealerProfile } from '@/lib/dealer-types';

const API_URL =
  process.env['NEXT_PUBLIC_API_URL'] ?? process.env['API_INTERNAL_URL'] ?? 'http://localhost:3001';

async function fetchDealerProfile(auth: string): Promise<DealerProfile | null> {
  try {
    const res = await fetch(`${API_URL}/dealer/me`, {
      headers: { Authorization: auth, 'Content-Type': 'application/json' },
      cache: 'no-store',
    });
    if (res.status === 401 || res.status === 403) return null;
    if (res.status === 404) return null;
    if (!res.ok) return null;
    return (await res.json()) as DealerProfile;
  } catch {
    return null;
  }
}

export const metadata = {
  title: 'Bayi Paneli | CyberLisans',
  robots: { index: false, follow: false },
};

export default async function DealerLayout({ children }: { children: React.ReactNode }) {
  const hdrs = await headers();
  const auth = hdrs.get('authorization');
  if (!auth) {
    redirect('/login?next=/dealer');
  }

  const profile = await fetchDealerProfile(auth);
  if (!profile) {
    redirect('/dealer/register');
  }

  return (
    <div className="min-h-screen bg-cyber-darker">
      <DealerTopbarClient auth={auth} />
      <DealerStatusBanner status={profile.status} rejectionReason={profile.rejectionReason} />
      <div className="mx-auto flex max-w-7xl">
        <DealerSidebar />
        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
