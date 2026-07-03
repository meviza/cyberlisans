'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Spinner } from '@cyberlisans/ui/atoms';
import { DealerLinksTable } from '@/components/dealer/DealerLinksTable';
import { apiFetch } from '@/lib/api-client';
import type { DealerLink, DealerProfile } from '@/lib/dealer-types';

export default function DealerLinksPage() {
  const router = useRouter();
  const [profile, setProfile] = React.useState<DealerProfile | null>(null);
  const [links, setLinks] = React.useState<DealerLink[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;
    Promise.all([
      apiFetch<DealerProfile>('/dealer/me'),
      apiFetch<{ items?: DealerLink[]; data?: DealerLink[] } | DealerLink[]>(
        '/dealer/links?limit=100',
      ),
    ])
      .then(([profileRes, linksRes]) => {
        if (cancelled) return;
        setProfile(profileRes);
        setLinks(Array.isArray(linksRes) ? linksRes : (linksRes.items ?? linksRes.data ?? []));
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
  return <DealerLinksTable initialLinks={links} profile={profile} />;
}
