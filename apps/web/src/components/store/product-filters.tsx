'use client';

import * as React from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Input, Button } from '@cyberlisans/ui/atoms';
import type { CategoryDisplay } from '@/lib/categories';

export type SortKey = 'newest' | 'price_asc' | 'price_desc' | 'popular';

export interface ProductFiltersState {
  search: string;
  category: string;
  brand: string;
  minPrice: string;
  maxPrice: string;
  sort: SortKey;
}

export const DEFAULT_FILTERS: ProductFiltersState = {
  search: '',
  category: 'all',
  brand: 'all',
  minPrice: '',
  maxPrice: '',
  sort: 'newest',
};

export function parseFilters(params: URLSearchParams): ProductFiltersState {
  const sort = params.get('sort');
  return {
    search: params.get('q') ?? '',
    category: params.get('category') ?? 'all',
    brand: params.get('brand') ?? 'all',
    minPrice: params.get('min') ?? '',
    maxPrice: params.get('max') ?? '',
    sort: sort === 'price_asc' || sort === 'price_desc' || sort === 'popular' ? sort : 'newest',
  };
}

export function filtersToParams(state: ProductFiltersState): URLSearchParams {
  const p = new URLSearchParams();
  if (state.search) p.set('q', state.search);
  if (state.category !== 'all') p.set('category', state.category);
  if (state.brand !== 'all') p.set('brand', state.brand);
  if (state.minPrice) p.set('min', state.minPrice);
  if (state.maxPrice) p.set('max', state.maxPrice);
  if (state.sort !== 'newest') p.set('sort', state.sort);
  return p;
}

export interface ProductFiltersProps {
  brands: string[];
  categories: CategoryDisplay[];
}

export function ProductFilters({ brands, categories }: ProductFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const state = React.useMemo(
    () => parseFilters(new URLSearchParams(searchParams.toString())),
    [searchParams],
  );
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [searchInput, setSearchInput] = React.useState(state.search);

  React.useEffect(() => {
    setSearchInput(state.search);
  }, [state.search]);

  const apply = React.useCallback(
    (next: Partial<ProductFiltersState>) => {
      const merged = { ...state, ...next };
      const params = filtersToParams(merged);
      const qs = params.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [state, router, pathname],
  );

  const clear = () => {
    setSearchInput('');
    router.push(pathname, { scroll: false });
  };

  React.useEffect(() => {
    const t = window.setTimeout(() => {
      if (searchInput !== state.search) apply({ search: searchInput });
    }, 300);
    return () => window.clearTimeout(t);
  }, [searchInput, state.search, apply]);

  const content = (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
        <Input
          type="search"
          placeholder="Ürün ara..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="pl-9"
        />
      </div>

      <div>
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-white/80">
          Kategoriler
        </h3>
        <div className="space-y-1">
          <FilterButton
            active={state.category === 'all'}
            onClick={() => apply({ category: 'all' })}
          >
            Tümü
          </FilterButton>
          {categories.map((c) => (
            <FilterButton
              key={c.slug}
              active={state.category === c.slug}
              onClick={() => apply({ category: c.slug })}
            >
              {c.name}
            </FilterButton>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-white/80">Markalar</h3>
        <div className="space-y-1">
          <FilterButton active={state.brand === 'all'} onClick={() => apply({ brand: 'all' })}>
            Tümü
          </FilterButton>
          {brands.map((b) => (
            <FilterButton key={b} active={state.brand === b} onClick={() => apply({ brand: b })}>
              {b}
            </FilterButton>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-white/80">Fiyat (₺)</h3>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            inputMode="numeric"
            placeholder="Min"
            value={state.minPrice}
            onChange={(e) => apply({ minPrice: e.target.value })}
            className="w-full"
            min="0"
          />
          <span className="text-white/40">—</span>
          <Input
            type="number"
            inputMode="numeric"
            placeholder="Max"
            value={state.maxPrice}
            onChange={(e) => apply({ maxPrice: e.target.value })}
            className="w-full"
            min="0"
          />
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-white/80">Sıralama</h3>
        <div className="space-y-1">
          {(
            [
              { value: 'newest', label: 'En Yeni' },
              { value: 'price_asc', label: 'Fiyat: Düşükten Yükseğe' },
              { value: 'price_desc', label: 'Fiyat: Yüksekten Düşüğe' },
              { value: 'popular', label: 'En Popüler' },
            ] as Array<{ value: SortKey; label: string }>
          ).map((s) => (
            <FilterButton
              key={s.value}
              active={state.sort === s.value}
              onClick={() => apply({ sort: s.value })}
            >
              {s.label}
            </FilterButton>
          ))}
        </div>
      </div>

      <Button variant="outline" onClick={clear} className="w-full">
        <X className="h-4 w-4" />
        Filtreleri Temizle
      </Button>
    </div>
  );

  return (
    <>
      <div className="lg:hidden">
        <Button variant="outline" className="w-full" onClick={() => setDrawerOpen(true)}>
          <SlidersHorizontal className="h-4 w-4" />
          Filtreler
        </Button>
      </div>

      <aside className="hidden lg:block">{content}</aside>

      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Kapat"
            onClick={() => setDrawerOpen(false)}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />
          <div className="absolute inset-y-0 right-0 flex w-full max-w-sm flex-col border-l border-white/[0.08] bg-brand-bg p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Filtreler</h2>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="rounded-md p-1 text-white/60 hover:text-white"
                aria-label="Kapat"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">{content}</div>
            <Button onClick={() => setDrawerOpen(false)} className="mt-4 w-full">
              Sonuçları Göster
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? 'block w-full rounded-xl border border-brand-accent/40 bg-brand-accent/10 px-3 py-2 text-left text-sm text-white'
          : 'block w-full rounded-xl border border-transparent px-3 py-2 text-left text-sm text-brand-text-secondary transition-colors hover:bg-white/[0.04] hover:text-white'
      }
    >
      {children}
    </button>
  );
}
