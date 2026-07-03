'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Spinner } from '@cyberlisans/ui/atoms';
import { DealerCreateLinkForm } from '@/components/dealer/DealerCreateLinkForm';
import { apiFetch } from '@/lib/api-client';
import type { DealerProfile, ProductListItem } from '@/lib/dealer-types';

export default function DealerNewLinkPage() {
  const router = useRouter();
  const [profile, setProfile] = React.useState<DealerProfile | null>(null);
  const [products, setProducts] = React.useState<ProductListItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;
    Promise.all([
      apiFetch<DealerProfile>('/dealer/me'),
      apiFetch<{ items?: ProductListItem[]; data?: ProductListItem[] } | ProductListItem[]>(
        '/products?limit=200',
      ),
    ])
      .then(([profileRes, productsRes]) => {
        if (cancelled) return;
        setProfile(profileRes);
        setProducts(
          Array.isArray(productsRes) ? productsRes : (productsRes.items ?? productsRes.data ?? []),
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

  return <DealerCreateLinkForm profile={profile} products={products} />;
}
