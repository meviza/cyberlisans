'use client';

import * as React from 'react';
import {
  createProduct,
  deleteProduct,
  updateProduct,
  type CreateSellerProductInput,
  type SellerProduct,
  type UpdateSellerProductInput,
} from '@/lib/api/seller-products';
import { invalidateProductsCache } from './use-cache-version';

export function useCreateProduct() {
  return useMutation<CreateSellerProductInput, SellerProduct>(createProduct, 'Ürün oluşturulamadı');
}

export function useUpdateProduct(id: string) {
  return useMutation<UpdateSellerProductInput, SellerProduct>(
    (input) => updateProduct(id, input),
    'Ürün güncellenemedi',
  );
}

export function useDeleteProduct() {
  return useMutation<string, { ok: true }>(deleteProduct, 'Ürün silinemedi');
}

function useMutation<TIn, TOut>(fn: (i: TIn) => Promise<TOut>, errorMsg: string) {
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const run = React.useCallback(
    async (input: TIn) => {
      setSubmitting(true);
      setError(null);
      try {
        const out = await fn(input);
        invalidateProductsCache();
        return out;
      } catch (err) {
        setError(err instanceof Error ? err.message : errorMsg);
        throw err;
      } finally {
        setSubmitting(false);
      }
    },
    [fn, errorMsg],
  );
  return { run, submitting, error };
}
