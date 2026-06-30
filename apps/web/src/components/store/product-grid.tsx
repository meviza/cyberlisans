import { ProductCard } from './product-card';
import type { Product } from '@/lib/products';

export interface ProductGridProps {
  products: Product[];
  soldCounts?: Record<string, number>;
}

export function ProductGrid({ products, soldCounts }: ProductGridProps) {
  if (products.length === 0) return null;
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} soldCount={soldCounts?.[p.id] ?? 0} />
      ))}
    </div>
  );
}
