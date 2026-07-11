'use client';

import * as React from 'react';
import Link from 'next/link';
import { ShoppingCart, Star, Flame } from 'lucide-react';
import { Badge } from '@cyberlisans/ui/atoms';
import { useCart } from '@/lib/cart-store';
import { useCurrency } from '@/lib/currency-context';
import type { Product } from '@/lib/products';

export interface ProductCardProps {
  product: Product;
  showSold?: boolean;
  soldCount?: number;
}

export function ProductCard({ product, showSold = true, soldCount }: ProductCardProps) {
  const { addItem } = useCart();
  const { format } = useCurrency();
  const [added, setAdded] = React.useState(false);

  const stock = product.stock;
  const stockLabel = stock === 0 ? 'Tükendi' : stock <= 5 ? `Son ${stock} adet` : `${stock} stokta`;
  const stockVariant: 'danger' | 'warning' | 'success' =
    stock === 0 ? 'danger' : stock <= 5 ? 'warning' : 'success';

  const onAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (stock === 0) return;
    addItem({
      id: product.id,
      slug: product.slug,
      title: product.title,
      brand: product.brand,
      image: product.image,
      unitPrice: product.price,
      maxQty: stock,
      qty: 1,
    });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1500);
  };

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-brand-elevated/80 shadow-card backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-brand-accent/30"
    >
      <div
        className="relative aspect-square w-full overflow-hidden bg-brand-surface"
        style={product.image ? { background: product.image } : undefined}
      >
        {product.featured && (
          <div className="absolute left-3 top-3 z-10">
            <Badge variant="magenta" size="sm">
              <Flame className="mr-1 h-3 w-3" />
              Öne Çıkan
            </Badge>
          </div>
        )}
        <div className="absolute right-3 top-3 z-10">
          <Badge variant={stockVariant} size="sm">
            {stockLabel}
          </Badge>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="mb-1 text-xs font-medium uppercase tracking-wider text-brand-muted">
          {product.brand}
        </div>
        <h3 className="mb-2 line-clamp-2 text-base font-semibold text-white">{product.title}</h3>

        <div className="mb-3 flex items-center gap-2 text-xs text-brand-muted">
          <span className="rounded-md border border-white/10 bg-white/[0.04] px-1.5 py-0.5">
            {product.category}
          </span>
          {showSold && (soldCount ?? 0) > 0 && (
            <span className="inline-flex items-center gap-1">
              <Star className="h-3 w-3 text-brand-accent/70" />
              {soldCount} satıldı
            </span>
          )}
        </div>

        <div className="mt-auto flex items-center justify-between gap-2">
          <span className="text-lg font-semibold tracking-tight text-white">
            {format(product.price)}
          </span>
          <button
            type="button"
            onClick={onAdd}
            disabled={stock === 0}
            aria-label="Sepete ekle"
            className={
              added
                ? 'inline-flex items-center gap-1 rounded-lg bg-brand-success/15 px-2.5 py-1.5 text-xs font-semibold text-brand-success'
                : 'inline-flex items-center gap-1 rounded-lg border border-brand-accent/40 bg-brand-accent/10 px-2.5 py-1.5 text-xs font-semibold text-brand-accent transition-colors hover:bg-brand-accent/20 disabled:cursor-not-allowed disabled:opacity-40'
            }
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            {added ? 'Eklendi' : 'Ekle'}
          </button>
        </div>
      </div>
    </Link>
  );
}
