'use client';

import * as React from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Input, Button } from '@cyberlisans/ui/atoms';
import { categories } from '@/lib/products';

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
}

export function ProductFilters({ brands }: ProductFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations('products');
  const tCommon = useTranslations('common');
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

  const sortLabels: Record<SortKey, string> = {
    newest: t('sortNewest'),
    price_asc: t('sortPriceAsc'),
    price_desc: t('sortPriceDesc'),
    popular: t('sortPopular'),
  };

  const content = (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
        <Input
          type="search"
          placeholder={t('searchPlaceholder')}
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="pl-9"
        />
      </div>

      <div>
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-white/80">
          {t('categories')}
        </h3>
        <div className="space-y-1">
          <FilterButton
            active={state.category === 'all'}
            onClick={() => apply({ category: 'all' })}
          >
            {t('allFilter')}
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
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-white/80">
          {t('brands')}
        </h3>
        <div className="space-y-1">
          <FilterButton active={state.brand === 'all'} onClick={() => apply({ brand: 'all' })}>
            {t('allFilter')}
          </FilterButton>
          {brands.map((b) => (
            <FilterButton key={b} active={state.brand === b} onClick={() => apply({ brand: b })}>
              {b}
            </FilterButton>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-white/80">
          {t('priceCurrency')}
        </h3>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            inputMode="numeric"
            placeholder={t('min')}
            value={state.minPrice}
            onChange={(e) => apply({ minPrice: e.target.value })}
            className="w-full"
            min="0"
          />
          <span className="text-white/40">—</span>
          <Input
            type="number"
            inputMode="numeric"
            placeholder={t('max')}
            value={state.maxPrice}
            onChange={(e) => apply({ maxPrice: e.target.value })}
            className="w-full"
            min="0"
          />
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-white/80">
          {t('sort')}
        </h3>
        <div className="space-y-1">
          {(Object.keys(sortLabels) as SortKey[]).map((s) => (
            <FilterButton key={s} active={state.sort === s} onClick={() => apply({ sort: s })}>
              {sortLabels[s]}
            </FilterButton>
          ))}
        </div>
      </div>

      <Button variant="outline" onClick={clear} className="w-full">
        <X className="h-4 w-4" />
        {t('clearFilters')}
      </Button>
    </div>
  );

  return (
    <>
      <div className="lg:hidden">
        <Button variant="outline" className="w-full" onClick={() => setDrawerOpen(true)}>
          <SlidersHorizontal className="h-4 w-4" />
          {t('openFilters')}
        </Button>
      </div>

      <aside className="hidden lg:block">{content}</aside>

      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label={tCommon('close')}
            onClick={() => setDrawerOpen(false)}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />
          <div className="absolute inset-y-0 right-0 flex w-full max-w-sm flex-col border-l border-cyber-cyan/30 bg-cyber-darker p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-orbitron text-lg font-bold text-white">{t('openFilters')}</h2>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="rounded-md p-1 text-white/60 hover:text-white"
                aria-label={tCommon('close')}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">{content}</div>
            <Button onClick={() => setDrawerOpen(false)} className="mt-4 w-full">
              {t('showResults')}
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
          ? 'block w-full rounded-md border border-cyber-cyan/50 bg-cyber-cyan/10 px-3 py-2 text-left text-sm text-cyber-cyan'
          : 'block w-full rounded-md border border-transparent px-3 py-2 text-left text-sm text-white/70 transition-colors hover:bg-white/5 hover:text-white'
      }
    >
      {children}
    </button>
  );
}
