'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight, Package } from 'lucide-react';
import { Button, Skeleton } from '../atoms';
import { ProductCard, type Product } from '../molecules/product-card';
import { cn } from '../utils/cn';

export interface ProductGridProps {
  products: Product[];
  loading?: boolean;
  emptyMessage?: string;
  columns?: 1 | 2 | 3 | 4;
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  onAddToCart?: (id: string) => void;
  className?: string;
}

const colsMap = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
};

function ProductGridSkeleton({ count, colsClass }: { count: number; colsClass: string }) {
  return (
    <div className={cn('grid gap-4', colsClass)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="space-y-3 rounded-lg border border-cyber-cyan/20 p-3">
          <Skeleton className="aspect-square w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-6 w-1/2" />
        </div>
      ))}
    </div>
  );
}

function ProductGrid({
  products,
  loading = false,
  emptyMessage = 'Henüz ürün bulunamadı.',
  columns = 4,
  page = 1,
  totalPages = 1,
  onPageChange,
  onAddToCart,
  className,
}: ProductGridProps) {
  const colsClass = colsMap[columns];

  if (loading) {
    return <ProductGridSkeleton count={columns * 2} colsClass={colsClass} />;
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-cyber-cyan/30 bg-cyber-bg-elevated/30 p-12 text-center">
        <Package className="h-12 w-12 text-cyber-text-dim" />
        <p className="text-cyber-text-dim">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      <div className={cn('grid gap-4', colsClass)}>
        {products.map((p) => (
          <ProductCard key={p.id} product={p} onAddToCart={onAddToCart} />
        ))}
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            size="icon"
            variant="outline"
            disabled={page <= 1}
            onClick={() => onPageChange?.(page - 1)}
            aria-label="Önceki sayfa"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="font-orbitron text-sm text-cyber-text">
            {page} / {totalPages}
          </span>
          <Button
            size="icon"
            variant="outline"
            disabled={page >= totalPages}
            onClick={() => onPageChange?.(page + 1)}
            aria-label="Sonraki sayfa"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

export { ProductGrid };
