'use client';

import * as React from 'react';
import { useCacheVersion, invalidateProductsCache } from './use-cache-version';
import { getSellerProduct, type SellerProduct } from '@/lib/api/seller-products';

export function useSellerProduct(id: string) {
  const [data, setData] = React.useState<SellerProduct | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const v = useCacheVersion();
  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await getSellerProduct(id);
        if (!cancelled) setData(res);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Ürün yüklenemedi');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, v]);
  return { data, loading, error };
}

export { invalidateProductsCache };
