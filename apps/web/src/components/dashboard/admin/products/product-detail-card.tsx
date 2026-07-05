'use client';

import * as React from 'react';
import { Tag, FileText } from 'lucide-react';
import { Card, CardContent, Badge } from '@cyberlisans/ui/atoms';
import type { ProductDetail, ProductReviewStatus } from '@/lib/api/admin-products';
import { ProductImageGallery } from './product-image-gallery';

export interface ProductDetailCardProps {
  product: ProductDetail;
}

const STATUS_MAP: Record<
  ProductReviewStatus,
  { label: string; variant: 'success' | 'warning' | 'danger' | 'default' }
> = {
  PENDING: { label: 'Bekliyor', variant: 'warning' },
  APPROVED: { label: 'Onaylı', variant: 'success' },
  REJECTED: { label: 'Reddedildi', variant: 'danger' },
};

export function ProductDetailCard({ product }: ProductDetailCardProps) {
  const images = product.images.length > 0 ? product.images : [product.imageUrl];
  const s = STATUS_MAP[product.status];

  return (
    <Card>
      <CardContent className="space-y-5 p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-white/50">
              <Tag className="h-3.5 w-3.5" />
              {product.category} · {product.brand}
            </div>
            <h1 className="mt-1 font-orbitron text-xl font-black text-white">{product.name}</h1>
            <p className="mt-1 font-mono text-xs text-white/40">{product.id}</p>
          </div>
          <Badge variant={s.variant} size="lg">
            {s.label}
          </Badge>
        </div>

        <ProductImageGallery images={images} />

        <div className="grid grid-cols-2 gap-4 border-t border-cyber-cyan/20 pt-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-white/50">Fiyat</p>
            <p className="mt-1 font-orbitron text-lg font-bold text-cyber-cyan">
              {product.price} {product.currency}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-white/50">Stok</p>
            <p className="mt-1 font-orbitron text-lg font-bold text-white">{product.stock} adet</p>
          </div>
        </div>

        <div>
          <p className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-white/50">
            <FileText className="h-3.5 w-3.5" />
            Açıklama
          </p>
          <p className="mt-2 whitespace-pre-line text-sm text-white/80">{product.description}</p>
        </div>

        {product.rejectionReason && (
          <div className="rounded-md border border-cyber-magenta/30 bg-cyber-magenta/5 p-3 text-sm text-cyber-magenta">
            <p className="text-xs font-semibold uppercase tracking-wider">Red Sebebi</p>
            <p className="mt-1">{product.rejectionReason}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
