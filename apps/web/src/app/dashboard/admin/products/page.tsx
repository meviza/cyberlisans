'use client';

import * as React from 'react';
import { AlertCircle, Package } from 'lucide-react';
import { Spinner } from '@cyberlisans/ui/atoms';
import { usePendingProducts } from '@/lib/hooks/use-admin-products';
import { PendingStats } from '@/components/dashboard/admin/products/pending-stats';
import {
  PendingFilters,
  type ProductFilter,
} from '@/components/dashboard/admin/products/pending-filters';
import { PendingTable } from '@/components/dashboard/admin/products/pending-table';

export default function AdminProductsPage() {
  const [filter, setFilter] = React.useState<ProductFilter>('PENDING');
  const { data, loading, error, refresh } = usePendingProducts({
    status: filter === 'ALL' ? undefined : filter,
  });

  if (loading)
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );

  if (error || !data) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-orbitron text-2xl font-black text-white">Ürün Onayları</h1>
          <p className="text-sm text-white/60">Bekleyen ürünleri incele ve onayla</p>
        </div>
        <div className="flex items-center gap-2 rounded-md border border-cyber-magenta/40 bg-cyber-magenta/10 px-4 py-3 text-sm text-cyber-magenta">
          <AlertCircle className="h-4 w-4" />
          {error ?? 'Ürünler yüklenemedi'}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-orbitron text-2xl font-black text-white">Ürün Onayları</h1>
          <p className="text-sm text-white/60">Satıcılardan gelen ürünleri incele ve yayına al</p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-md border border-cyber-cyan/30 bg-cyber-cyan/5 px-3 py-1.5 text-xs text-cyber-cyan">
          <Package className="h-4 w-4" />
          {data.items.length} kayıt
        </div>
      </div>
      <PendingStats
        pending={data.totals.pending}
        approvedToday={data.totals.approvedToday}
        rejectedToday={data.totals.rejectedToday}
      />
      <PendingFilters value={filter} onChange={setFilter} />
      <PendingTable rows={data.items} onChanged={refresh} />
    </div>
  );
}
