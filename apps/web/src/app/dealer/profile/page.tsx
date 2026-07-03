'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Spinner } from '@cyberlisans/ui/atoms';
import { DealerProfileForm } from '@/components/dealer/DealerProfileForm';
import { apiFetch } from '@/lib/api-client';
import type { DealerProfile } from '@/lib/dealer-types';

export default function DealerProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = React.useState<DealerProfile | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;
    apiFetch<DealerProfile>('/dealer/me')
      .then((res) => {
        if (!cancelled) setProfile(res);
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
  return <DealerProfileForm initialProfile={profile} />;
}
