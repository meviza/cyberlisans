import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  fetchProducts,
  fetchProductBySlug,
  fetchFeaturedProducts,
  type ProductSummary,
} from '@/lib/products-fetcher';

const MOCK: ProductSummary = {
  id: 'p1',
  slug: 'test-product',
  title: 'Test Product',
  brand: 'TestBrand',
  brandSlug: 'testbrand',
  category: 'oyun',
  categorySlug: 'oyun',
  price: 99.9,
  compareAtPrice: 149.9,
  currency: 'TRY',
  image: 'https://cdn.example.com/p1.png',
  stock: 10,
  featured: true,
  sold: 0,
  delivery: 'AUTO',
  createdAt: '2026-01-01T00:00:00Z',
};

beforeEach(() => {
  vi.restoreAllMocks();
  process.env['NEXT_PUBLIC_API_URL'] = 'http://localhost:3001';
});

describe('fetchProducts', () => {
  it('returns parsed list response', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        items: [MOCK, { ...MOCK, id: 'p2', slug: 'second' }],
        total: 2,
        page: 1,
        limit: 24,
        totalPages: 1,
      }),
    }) as unknown as typeof fetch;

    const result = await fetchProducts({ search: 'security' });

    expect(result.total).toBe(2);
    expect(result.items).toHaveLength(2);
    expect(result.items[0]!.slug).toBe('test-product');
  });

  it('encodes params into the query string', async () => {
    const spy = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ items: [], total: 0, page: 1, limit: 24, totalPages: 0 }),
    });
    global.fetch = spy as unknown as typeof fetch;

    await fetchProducts({ category: 'oyun', minPrice: 10, sort: 'price_asc' });

    const url = spy.mock.calls[0]![0] as string;
    expect(url).toContain('category=oyun');
    expect(url).toContain('minPrice=10');
    expect(url).toContain('sort=price_asc');
  });

  it('throws on non-ok response', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 500 }) as unknown as typeof fetch;
    await expect(fetchProducts({})).rejects.toThrow(/500/);
  });
});

describe('fetchProductBySlug', () => {
  it('returns the product when found', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => MOCK,
    }) as unknown as typeof fetch;

    const product = await fetchProductBySlug('test-product');
    expect(product?.slug).toBe('test-product');
  });

  it('returns null when the server returns 404', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
    }) as unknown as typeof fetch;
    expect(await fetchProductBySlug('nope')).toBeNull();
  });
});

describe('fetchFeaturedProducts', () => {
  it('returns whatever the server returned (server filters by featured flag)', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ items: [MOCK, { ...MOCK, id: 'p2' }], total: 2 }),
    }) as unknown as typeof fetch;

    const result = await fetchFeaturedProducts(4);
    expect(result).toHaveLength(2);
  });
});
