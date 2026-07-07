/**
 * Server-safe filter types and parsers for the products page.
 *
 * This module is intentionally framework-neutral (no React, no "use client").
 * Both Server Components (page.tsx) and Client Components (product-filters.tsx)
 * import from here. Keep this file free of UI imports.
 */
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
  const safeSort: SortKey =
    sort === 'price_asc' || sort === 'price_desc' || sort === 'popular' ? sort : 'newest';
  return {
    search: params.get('q') ?? '',
    category: params.get('category') ?? 'all',
    brand: params.get('brand') ?? 'all',
    minPrice: params.get('min') ?? '',
    maxPrice: params.get('max') ?? '',
    sort: safeSort,
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
