/**
 * Server-side product fetching.
 *
 * Bu modul Server Component'lerden cagrilir; Hono API'ina SSR sirasinda
 * baglanir. Browser'a fetch kodu gondermez.
 *
 * Build/prerender and cold paths must not crash: any upstream failure returns
 * empty data for list endpoints. Detail fetch returns null.
 *
 * On Netlify/Vercel the Hono app is mounted under Next `/api/*`. Standalone
 * local API (`:3001`) stays without the prefix.
 */

function resolveApiBase(): string {
  const raw = (
    process.env['API_INTERNAL_URL'] ??
    process.env['NEXT_PUBLIC_API_URL'] ??
    'http://localhost:3001'
  ).replace(/\/$/, '');
  if (raw.endsWith('/api')) return raw;
  // Standalone Hono (local or separate service)
  if (/:(3001)\b/.test(raw) || raw.includes('localhost:3001')) return raw;
  // Same-origin Next deployment → routes live under /api
  return `${raw}/api`;
}

const API_URL = resolveApiBase();
export interface ProductImage {
  url: string;
  alt?: string;
}
export interface ProductSummary {
  id: string;
  slug: string;
  title: string;
  brand: string;
  brandSlug?: string;
  category: string;
  categorySlug: string;
  price: number;
  compareAtPrice?: number | null;
  currency: 'TRY' | 'USD' | 'EUR' | 'USDT';
  image?: string | null;
  images?: ProductImage[];
  stock: number;
  featured: boolean;
  sold: number;
  delivery: 'AUTO' | 'MANUAL' | 'KEY';
  rating?: number;
  reviewCount?: number;
  createdAt: string;
}
export interface ProductListResponse {
  items: ProductSummary[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
export interface ProductDetail extends ProductSummary {
  description: string;
  longDescription?: string | null;
  tags?: string[];
  variants?: Array<{ id: string; label: string; priceDelta?: number }>;
  faq?: Array<{ question: string; answer: string }>;
}
export interface CategoryRow {
  id: string;
  slug: string;
  name: string;
  iconUrl?: string | null;
}
export interface BrandRow {
  id: string;
  slug: string;
  name: string;
  logoUrl?: string | null;
}
interface FetchOptions {
  revalidate?: number;
  tags?: string[];
}

function emptyList(limit = 24): ProductListResponse {
  return { items: [], total: 0, page: 1, limit, totalPages: 0 };
}

async function fetchJson<T>(path: string, init: FetchOptions = {}): Promise<T> {
  const url = `${API_URL}${path}`;
  const next =
    init.revalidate !== undefined || init.tags
      ? { revalidate: init.revalidate, tags: init.tags }
      : undefined;
  let res: Response;
  try {
    res = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      next,
    });
  } catch (err) {
    throw new Error(
      `Network error for ${path}: ${err instanceof Error ? err.message : 'fetch failed'}`,
    );
  }
  if (!res.ok) {
    throw new Error(`Upstream ${res.status} for ${path}`);
  }
  return (await res.json()) as T;
}

export async function fetchProducts(input: {
  category?: string;
  brand?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: 'newest' | 'price_asc' | 'price_desc' | 'popular';
  page?: number;
  limit?: number;
}): Promise<ProductListResponse> {
  const params = new URLSearchParams();
  if (input.category) params.set('category', input.category);
  if (input.brand) params.set('brand', input.brand);
  if (input.search) params.set('search', input.search);
  if (input.minPrice !== undefined) params.set('minPrice', String(input.minPrice));
  if (input.maxPrice !== undefined) params.set('maxPrice', String(input.maxPrice));
  if (input.sort) params.set('sort', input.sort);
  params.set('page', String(input.page ?? 1));
  params.set('limit', String(input.limit ?? 24));
  try {
    return await fetchJson<ProductListResponse>(`/products?${params.toString()}`, {
      revalidate: 60,
      tags: ['products'],
    });
  } catch {
    return emptyList(input.limit ?? 24);
  }
}

export async function fetchFeaturedProducts(limit = 8): Promise<ProductSummary[]> {
  try {
    const data = await fetchJson<{ items: ProductSummary[] }>(`/products/featured?limit=${limit}`, {
      revalidate: 60,
      tags: ['products', 'products:featured'],
    });
    return data.items ?? [];
  } catch {
    return [];
  }
}

export async function fetchProductBySlug(slug: string): Promise<ProductDetail | null> {
  try {
    return await fetchJson<ProductDetail>(`/products/${encodeURIComponent(slug)}`, {
      revalidate: 60,
      tags: ['products', `products:slug:${slug}`],
    });
  } catch {
    return null;
  }
}

export async function fetchCategories(): Promise<CategoryRow[]> {
  try {
    const data = await fetchJson<{ items: CategoryRow[] }>(`/products/categories`, {
      revalidate: 300,
      tags: ['categories'],
    });
    return data.items ?? [];
  } catch {
    return [];
  }
}

export async function fetchBrands(): Promise<BrandRow[]> {
  try {
    const data = await fetchJson<{ items: BrandRow[] }>(`/products/brands`, {
      revalidate: 300,
      tags: ['brands'],
    });
    return data.items ?? [];
  } catch {
    return [];
  }
}
