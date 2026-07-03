'use client';

import * as React from 'react';
import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Spinner } from '@cyberlisans/ui/atoms';
import { DealerLinkDetail } from '@/components/dealer/DealerLinkDetail';
import { apiFetch } from '@/lib/api-client';
import type { DealerLink, ProductListItem } from '@/lib/dealer-types';

export default function DealerLinkDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [link, setLink] = useState<DealerLink | null>(null);
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      apiFetch<DealerLink>(`/dealer/links/${id}`),
      apiFetch<{ items?: ProductListItem[]; data?: ProductListItem[] } | ProductListItem[]>(
        '/products?limit=200',
      ),
    ])
      .then(([linkRes, productsRes]) => {
        if (cancelled) return;
        setLink(linkRes);
        setProducts(
          Array.isArray(productsRes) ? productsRes : (productsRes.items ?? productsRes.data ?? []),
        );
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
  return <DealerLinkDetail initialLink={link} products={products} />;
}
