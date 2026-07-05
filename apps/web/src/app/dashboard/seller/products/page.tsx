'use client';

import * as React from 'react';
import Link from 'next/link';
import { Plus, AlertCircle } from 'lucide-react';
import { Spinner, Button } from '@cyberlisans/ui/atoms';
import { useSellerProducts } from '@/lib/hooks/use-seller-products-list';
import { ProductStats } from '@/components/dashboard/seller/products/product-stats';
import {
  ProductFilters,
  type ProductFilterValue,
} from '@/components/dashboard/seller/products/product-filters';
import { ProductTable } from '@/components/dashboard/seller/products/product-table';
import { ProductDeleteDialog } from '@/components/dashboard/seller/products/product-delete-dialog';
import type { SellerProduct } from '@/lib/api/seller-products';

export default function SellerProductsPage() {
  const [filter, setFilter] = React.useState<ProductFilterValue>('ALL');
  const { data, loading, error } = useSellerProducts({ status: filter });
  const [target, setTarget] = React.useState<SellerProduct | null>(null);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center gap-2 rounded-md border border-cyber-magenta/40 bg-cyber-magenta/10 px-4 py-3 text-sm text-cyber-magenta">
        <AlertCircle className="h-4 w-4" />
        {error ?? 'Ürünler yüklenemedi'}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-orbitron text-2xl font-black text-white">Ürünlerim</h1>
          <p className="text-sm text-white/60">Mağazanızdaki tüm ürünleri yönetin</p>
        </div>
        <Link href="/dashboard/seller/products/new">
          <Button>
            <Plus className="h-4 w-4" /> Yeni Ürün
          </Button>
        </Link>
      </div>
      <ProductStats
        total={data.totals.total}
        active={data.totals.active}
        pending={data.totals.pending}
        rejected={data.totals.rejected}
      />
      <ProductFilters value={filter} onChange={setFilter} />
      <ProductTable rows={data.items} onDelete={(p) => setTarget(p)} />
      <ProductDeleteDialog product={target} onClose={() => setTarget(null)} />
    </div>
  );
}
