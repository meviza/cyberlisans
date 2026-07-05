'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { Spinner, Button } from '@cyberlisans/ui/atoms';
import { useSellerProduct } from '@/lib/hooks/use-seller-product';
import { ProductEditForm } from '@/components/dashboard/seller/products/product-edit-form';

export default function SellerProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const { data, loading, error } = useSellerProduct(id);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-4">
        <Link href="/dashboard/seller/products">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4" /> Geri
          </Button>
        </Link>
        <div className="flex items-center gap-2 rounded-md border border-cyber-magenta/40 bg-cyber-magenta/10 px-4 py-3 text-sm text-cyber-magenta">
          <AlertCircle className="h-4 w-4" />
          {error ?? 'Ürün yüklenemedi'}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-orbitron text-2xl font-black text-white">Ürünü Düzenle</h1>
          <p className="text-sm text-white/60">{data.title}</p>
        </div>
        <Link href="/dashboard/seller/products">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4" /> Geri
          </Button>
        </Link>
      </div>
      <ProductEditForm product={data} />
    </div>
  );
}
