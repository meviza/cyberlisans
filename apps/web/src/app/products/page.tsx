import * as React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ProductGrid } from '@/components/store/product-grid';
import {
  ProductFilters,
  parseFilters,
  type ProductFiltersState,
} from '@/components/store/product-filters';
import { EmptyState } from '@/components/store/empty-state';
import { StorefrontHeader } from '@/components/store/storefront-header';
import { products, getSoldCounts, type Product } from '@/lib/products';
import { Package, Loader2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Mağaza',
  description: 'Tüm dijital lisans ürünlerimizi incele. Oyun, yazılım ve AI API kredileri.',
  alternates: { canonical: 'https://cyberlisans.com/products' },
};

const PAGE_SIZE = 12;

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function toSingle(v: string | string[] | undefined): string {
  if (Array.isArray(v)) return v[0] ?? '';
  return v ?? '';
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) {
    const single = toSingle(v);
    if (single) params.set(k, single);
  }
  const filters = parseFilters(params);

  const brands = Array.from(new Set(products.map((p) => p.brand))).sort();

  const filtered = applyFilters(products, filters);
  const total = filtered.length;
  const shown = filtered.slice(0, PAGE_SIZE);

  const soldCounts = getSoldCounts();

  return (
    <>
      <StorefrontHeader />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-orbitron text-3xl font-black text-white sm:text-4xl">
              Tüm <span className="text-cyber-cyan text-glow-cyan">Ürünler</span>
            </h1>
            <p className="mt-2 text-white/60">İhtiyacın olan dijital lisansı bul</p>
          </div>
          <p className="font-mono text-xs uppercase tracking-wider text-white/40">{total} sonuç</p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[280px_1fr]">
          <ProductFilters brands={brands} />

          <div>
            {shown.length === 0 ? (
              <EmptyState
                icon={Package}
                title="Sonuç bulunamadı"
                description="Farklı filtre veya arama terimi deneyebilirsin."
              />
            ) : (
              <>
                <ProductGrid products={shown} soldCounts={soldCounts} />
                {filtered.length > PAGE_SIZE && (
                  <div className="mt-8 flex flex-col items-center gap-2">
                    <LoadMoreButton total={filtered.length} shown={shown.length} />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </>
  );
}

function applyFilters(all: Product[], f: ProductFiltersState): Product[] {
  let list = all.slice();
  if (f.search) {
    const q = f.search.toLowerCase();
    list = list.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q),
    );
  }
  if (f.category !== 'all') list = list.filter((p) => p.categorySlug === f.category);
  if (f.brand !== 'all') list = list.filter((p) => p.brand === f.brand);
  const min = f.minPrice ? Number(f.minPrice) : null;
  const max = f.maxPrice ? Number(f.maxPrice) : null;
  if (min !== null && Number.isFinite(min)) list = list.filter((p) => p.price >= min);
  if (max !== null && Number.isFinite(max)) list = list.filter((p) => p.price <= max);

  switch (f.sort) {
    case 'price_asc':
      list.sort((a, b) => a.price - b.price);
      break;
    case 'price_desc':
      list.sort((a, b) => b.price - a.price);
      break;
    case 'popular':
      list.sort((a, b) => b.sold - a.sold);
      break;
    case 'newest':
    default:
      list.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }
  return list;
}

function LoadMoreButton({ total, shown }: { total: number; shown: number }) {
  return (
    <div className="text-center text-sm text-white/50">
      <Loader2 className="mx-auto mb-2 h-4 w-4 animate-spin text-cyber-cyan/60" />
      <p>
        {shown} / {total} ürün gösteriliyor · daha fazla için filtreleri daraltabilirsin
      </p>
    </div>
  );
}
