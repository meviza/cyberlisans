import { describe, it, expect } from 'vitest';
import {
  parseFilters,
  filtersToParams,
  DEFAULT_FILTERS,
  type ProductFiltersState,
} from '@/lib/product-filters';

describe('parseFilters', () => {
  it('returns DEFAULT_FILTERS for empty params', () => {
    const params = new URLSearchParams();
    expect(parseFilters(params)).toEqual(DEFAULT_FILTERS);
  });

  it('parses ?q=cyber into search', () => {
    const params = new URLSearchParams('q=cyber');
    expect(parseFilters(params).search).toBe('cyber');
  });

  it('parses ?category=oyun', () => {
    const params = new URLSearchParams('category=oyun');
    expect(parseFilters(params).category).toBe('oyun');
  });

  it('parses ?brand=apple', () => {
    const params = new URLSearchParams('brand=apple');
    expect(parseFilters(params).brand).toBe('apple');
  });

  it('parses price range from ?min and ?max', () => {
    const params = new URLSearchParams('min=10&max=99');
    const result = parseFilters(params);
    expect(result.minPrice).toBe('10');
    expect(result.maxPrice).toBe('99');
  });

  it('accepts only known sort keys', () => {
    expect(parseFilters(new URLSearchParams('sort=price_asc')).sort).toBe('price_asc');
    expect(parseFilters(new URLSearchParams('sort=price_desc')).sort).toBe('price_desc');
    expect(parseFilters(new URLSearchParams('sort=popular')).sort).toBe('popular');
    expect(parseFilters(new URLSearchParams('sort=newest')).sort).toBe('newest');
    // Unknown keys fall back to default
    expect(parseFilters(new URLSearchParams('sort=lol')).sort).toBe(DEFAULT_FILTERS.sort);
  });
});

describe('filtersToParams', () => {
  it('round-trips through filtersToParams -> parseFilters', () => {
    const original: ProductFiltersState = {
      search: 'security',
      category: 'oyun',
      brand: 'apple',
      minPrice: '25',
      maxPrice: '250',
      sort: 'price_asc',
    };

    const params = filtersToParams(original);
    const parsed = parseFilters(params);

    expect(parsed).toEqual(original);
  });

  it('omits empty filters (no empty values in URL)', () => {
    const params = filtersToParams({ ...DEFAULT_FILTERS, search: 'test' });
    expect(params.get('q')).toBe('test');
    expect(params.has('category')).toBe(false);
    expect(params.has('brand')).toBe(false);
    expect(params.has('min')).toBe(false);
    expect(params.has('max')).toBe(false);
    expect(params.has('sort')).toBe(false);
  });
});
