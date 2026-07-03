'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Spinner } from '@cyberlisans/ui/atoms';
import { DealerPayoutForm } from '@/components/dealer/DealerPayoutForm';
import { DealerPayoutsTable } from '@/components/dealer/DealerPayoutsTable';
import { apiFetch } from '@/lib/api-client';
import type { DealerProfile, DealerPayout } from '@/lib/dealer-types';

export default function DealerPayoutsPage() {
  const router = useRouter();
  const [profile, setProfile] = React.useState<DealerProfile | null>(null);
  const [payouts, setPayouts] = React.useState<DealerPayout[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;
    Promise.all([
      apiFetch<DealerProfile>('/dealer/me'),
      apiFetch<{ items?: DealerPayout[]; data?: DealerPayout[] } | DealerPayout[]>(
        '/dealer/payouts?limit=50',
      ),
    ])
      .then(([profileRes, payoutsRes]) => {
        if (cancelled) return;
        setProfile(profileRes);
        setPayouts(
          Array.isArray(payoutsRes) ? payoutsRes : (payoutsRes.items ?? payoutsRes.data ?? []),
        );
      })
      .catch(() => {
        if (!cancelled) router.replace('/dealer/register');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (loading || !profile) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-orbitron text-2xl font-black text-white">Ödemeler</h1>
        <p className="text-sm text-white/60">Bakiyeni talep et ve ödeme geçmişini gör.</p>
      </div>
      <DealerPayoutForm profile={profile} />
      <DealerPayoutsTable initial={payouts} />
    </div>
  );
}
