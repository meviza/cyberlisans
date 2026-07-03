'use client';

import * as React from 'react';
import { use } from 'react';
import { useRouter } from 'next/navigation';
import { Spinner } from '@cyberlisans/ui/atoms';
import { DealerLinkQRCode } from '@/components/dealer/DealerLinkQRCode';
import { apiFetch } from '@/lib/api-client';
import type { DealerLink } from '@/lib/dealer-types';

export default function DealerLinkQRPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [link, setLink] = React.useState<DealerLink | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;
    apiFetch<DealerLink>(`/dealer/links/${id}`)
      .then((res) => {
        if (!cancelled) setLink(res);
      })
      .catch(() => {
        if (!cancelled) router.replace('/dealer/links');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id, router]);

  if (loading || !link) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }
  return <DealerLinkQRCode link={link} />;
}
