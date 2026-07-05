'use client';

import * as React from 'react';
import {
  approveProduct,
  getProductForReview,
  listPendingProducts,
  rejectProduct,
  type PendingProductsResponse,
  type ProductDetail,
  type ProductFilters,
} from '@/lib/api/admin-products';

interface ProductsState {
  data: PendingProductsResponse | null;
  loading: boolean;
  error: string | null;
}

export function usePendingProducts(filters: ProductFilters) {
  const [state, setState] = React.useState<ProductsState>({
    data: null,
    loading: true,
    error: null,
  });
  const [reloadKey, setReloadKey] = React.useState(0);

  React.useEffect(() => {
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: null }));
    listPendingProducts(filters)
      .then((data) => {
        if (!cancelled) setState({ data, loading: false, error: null });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setState({
          data: null,
          loading: false,
          error: err instanceof Error ? err.message : 'Ürünler yüklenemedi',
        });
      });
    return () => {
      cancelled = true;
    };
  }, [filters.status, reloadKey]);

  return {
    ...state,
    refresh: () => setReloadKey((k) => k + 1),
  };
}

interface UseMutationState {
  loading: boolean;
  error: string | null;
}

export function useApproveProduct(id: string) {
  const [state, setState] = React.useState<UseMutationState>({ loading: false, error: null });
  const approve = React.useCallback(async () => {
    setState({ loading: true, error: null });
    try {
      await approveProduct(id);
      setState({ loading: false, error: null });
      return true;
    } catch (err) {
      setState({
        loading: false,
        error: err instanceof Error ? err.message : 'Onaylama başarısız',
      });
      return false;
    }
  }, [id]);
  return { ...state, approve };
}

export function useRejectProduct(id: string) {
  const [state, setState] = React.useState<UseMutationState>({ loading: false, error: null });
  const reject = React.useCallback(
    async (reason: string) => {
      setState({ loading: true, error: null });
      try {
        await rejectProduct(id, reason);
        setState({ loading: false, error: null });
        return true;
      } catch (err) {
        setState({
          loading: false,
          error: err instanceof Error ? err.message : 'Reddetme başarısız',
        });
        return false;
      }
    },
    [id],
  );
  return { ...state, reject };
}

interface DetailState {
  data: ProductDetail | null;
  loading: boolean;
  error: string | null;
}

export function useProductDetail(id: string | undefined) {
  const [state, setState] = React.useState<DetailState>({ data: null, loading: true, error: null });
  const [reloadKey, setReloadKey] = React.useState(0);

  React.useEffect(() => {
    if (!id) {
      setState({ data: null, loading: false, error: 'Geçersiz ürün' });
      return;
    }
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: null }));
    getProductForReview(id)
      .then((data) => {
        if (!cancelled) setState({ data, loading: false, error: null });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setState({
          data: null,
          loading: false,
          error: err instanceof Error ? err.message : 'Ürün yüklenemedi',
        });
      });
    return () => {
      cancelled = true;
    };
  }, [id, reloadKey]);

  return {
    ...state,
    refresh: () => setReloadKey((k) => k + 1),
  };
}
