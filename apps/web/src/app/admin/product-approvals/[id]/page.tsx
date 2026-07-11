'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { Spinner } from '@cyberlisans/ui/atoms';
import { useProductDetail } from '@/lib/hooks/use-admin-products';
import { ProductDetailCard } from '@/components/dashboard/admin/products/product-detail-card';
import { ProductSellerInfo } from '@/components/dashboard/admin/products/product-seller-info';
import { ProductApprovalPanel } from '@/components/dashboard/admin/products/product-approval-panel';

export default function AdminProductDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const { data, loading, error } = useProductDetail(id);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-6">
        <Link
          href="/admin/product-approvals"
          className="inline-flex items-center gap-2 text-sm text-cyber-cyan hover:text-cyber-magenta"
        >
          <ArrowLeft className="h-4 w-4" />
          Listeye dön
        </Link>
        <div className="flex items-center gap-2 rounded-md border border-cyber-magenta/40 bg-cyber-magenta/10 px-4 py-3 text-sm text-cyber-magenta">
          <AlertCircle className="h-4 w-4" />
          {error ?? 'Ürün bulunamadı'}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        href="/admin/product-approvals"
        className="inline-flex items-center gap-2 text-sm text-cyber-cyan hover:text-cyber-magenta"
      >
        <ArrowLeft className="h-4 w-4" />
        Ürün onaylarına dön
      </Link>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <ProductDetailCard product={data} />
          <ProductSellerInfo seller={data.seller} />
        </div>
        <div>
          <ProductApprovalPanel productId={data.id} status={data.status} />
        </div>
      </div>
    </div>
  );
}
