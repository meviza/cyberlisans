'use client';

import * as React from 'react';
import {
  listSellerProducts,
  type SellerProductFilters,
  type SellerProductsResponse,
} from '@/lib/api/seller-products';
import { useCacheVersion } from './use-cache-version';

const CACHE_TTL_MS = 30_000;
const cache = new Map<string, { value: SellerProductsResponse; ts: number }>();

export function useSellerProducts(filters: SellerProductFilters) {
  const v = useCacheVersion();
  const [data, setData] = React.useState<SellerProductsResponse | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const status = filters.status ?? 'ALL';
  const key = `list:${status}`;

  React.useEffect(() => {
    let cancelled = false;
    const cached = cache.get(key);
    if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
      setData(cached.value);
      setLoading(false);
      return;
    }
    setLoading(true);
    (async () => {
      try {
        const res = await listSellerProducts(filters);
        if (cancelled) return;
        cache.set(key, { value: res, ts: Date.now() });
        setData(res);
        setError(null);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Ürünler yüklenemedi');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [key, status, v, filters]);

  return { data, loading, error };
}
