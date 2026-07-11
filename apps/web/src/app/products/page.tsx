import type { Metadata } from 'next';
import { ProductGrid } from '@/components/store/product-grid';
import { ProductFilters } from '@/components/store/product-filters';
import { parseFilters, type ProductFiltersState } from '@/lib/product-filters';
import { EmptyState } from '@/components/store/empty-state';
import { StorefrontHeader } from '@/components/store/storefront-header';
import { fetchProducts, fetchBrands, type ProductSummary } from '@/lib/products-fetcher';
import type { Product } from '@/lib/products';
import { CATEGORIES } from '@/lib/categories';
import { Package } from 'lucide-react';

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

function mapCategoryLabel(slug: string): 'Oyun' | 'Yazılım' | 'AI API' {
  if (slug === 'yazilim') return 'Yazılım';
  if (slug === 'ai-api') return 'AI API';
  return 'Oyun';
}

function toCardProduct(p: ProductSummary): Product {
  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    category: mapCategoryLabel(p.categorySlug),
    categorySlug:
      p.categorySlug === 'yazilim' || p.categorySlug === 'ai-api' ? p.categorySlug : 'oyun',
    brand: p.brand,
    image: p.image ?? '',
    images: (p.images ?? []).map((i) => i.url).filter(Boolean),
    price: p.price,
    currency: 'TRY' as const,
    stock: p.stock,
    featured: p.featured,
    sold: p.sold,
    createdAt: p.createdAt,
    description: '',
  };
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) {
    const single = toSingle(v);
    if (single) params.set(k, single);
  }
  const filters = parseFilters(params);
  const [brandsResult, listResult] = await Promise.all([
    fetchBrands(),
    fetchProducts({
      category: filters.category !== 'all' ? filters.category : undefined,
      brand: filters.brand !== 'all' ? filters.brand : undefined,
      search: filters.search || undefined,
      minPrice: filters.minPrice ? Number(filters.minPrice) : undefined,
      maxPrice: filters.maxPrice ? Number(filters.maxPrice) : undefined,
      sort: filters.sort,
      page: 1,
      limit: PAGE_SIZE * 4,
    }),
  ]);
  const brands = brandsResult.map((b) => b.name).sort();
  const shown = listResult.items.map(toCardProduct).slice(0, PAGE_SIZE);
  const total = listResult.total;

  return (
    <>
      <StorefrontHeader />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-brand-accent">Mağaza</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Tüm ürünler
            </h1>
            <p className="mt-2 text-brand-text-secondary">
              Oyun key, yazılım lisansı ve AI kredileri
            </p>
          </div>
          <p className="text-xs uppercase tracking-wider text-brand-muted">{total} sonuç</p>
        </div>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[280px_1fr]">
          <ProductFilters brands={brands} categories={CATEGORIES} />
          <div>
            {shown.length === 0 ? (
              <EmptyState
                icon={Package}
                title="Sonuç bulunamadı"
                description="Farklı filtre veya arama terimi deneyebilirsin."
              />
            ) : (
              <ProductGrid products={shown} />
            )}
          </div>
        </div>
      </main>
    </>
  );
}

export type { ProductFiltersState };
