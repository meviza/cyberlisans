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

/** API may return DB snake/camel rows (priceTry, isFeatured) or storefront DTO. */
function normalizeProduct(raw: Record<string, unknown>): ProductSummary {
  const priceRaw =
    raw['price'] ?? raw['priceTry'] ?? raw['price_try'] ?? raw['priceUsd'] ?? raw['price_usd'] ?? 0;
  const price = typeof priceRaw === 'number' ? priceRaw : Number(priceRaw) || 0;
  const stockRaw = raw['stock'] ?? raw['stockCount'] ?? 0;
  const stock = typeof stockRaw === 'number' ? stockRaw : Number(stockRaw) || 0;
  const featured = Boolean(raw['featured'] ?? raw['isFeatured'] ?? raw['is_featured']);
  const image =
    (raw['image'] as string | null | undefined) ??
    (raw['imageUrl'] as string | null | undefined) ??
    (raw['image_url'] as string | null | undefined) ??
    null;
  const brand =
    (raw['brand'] as string | undefined) ??
    (raw['brandName'] as string | undefined) ??
    (raw['brand'] as { name?: string } | undefined)?.name ??
    '';
  const brandSlug =
    (raw['brandSlug'] as string | undefined) ??
    (raw['brand_slug'] as string | undefined) ??
    undefined;
  const categorySlug =
    (raw['categorySlug'] as string | undefined) ??
    (raw['category_slug'] as string | undefined) ??
    (raw['category'] as string | undefined) ??
    'oyun';
  const category =
    (raw['categoryName'] as string | undefined) ??
    (typeof raw['category'] === 'string' && raw['category'] !== categorySlug
      ? (raw['category'] as string)
      : categorySlug);
  const deliveryRaw = String(
    raw['delivery'] ?? raw['deliveryType'] ?? raw['delivery_type'] ?? 'KEY',
  );
  const delivery = (['AUTO', 'MANUAL', 'KEY'].includes(deliveryRaw) ? deliveryRaw : 'KEY') as
    | 'AUTO'
    | 'MANUAL'
    | 'KEY';
  const currencyRaw = String(raw['currency'] ?? 'TRY').toUpperCase();
  const currency = (['TRY', 'USD', 'EUR', 'USDT'].includes(currencyRaw) ? currencyRaw : 'TRY') as
    | 'TRY'
    | 'USD'
    | 'EUR'
    | 'USDT';

  return {
    id: String(raw['id'] ?? ''),
    slug: String(raw['slug'] ?? ''),
    title: String(raw['title'] ?? raw['name'] ?? ''),
    brand: brand || '—',
    brandSlug,
    category: String(category || 'Oyun'),
    categorySlug: String(categorySlug || 'oyun'),
    price,
    compareAtPrice: (raw['compareAtPrice'] as number | null | undefined) ?? null,
    currency,
    image,
    images: Array.isArray(raw['images']) ? (raw['images'] as ProductImage[]) : undefined,
    stock,
    featured,
    sold: Number(raw['sold'] ?? raw['soldCount'] ?? 0) || 0,
    delivery,
    rating: typeof raw['rating'] === 'number' ? raw['rating'] : undefined,
    reviewCount: typeof raw['reviewCount'] === 'number' ? raw['reviewCount'] : undefined,
    createdAt: String(raw['createdAt'] ?? raw['created_at'] ?? new Date().toISOString()),
  };
}

function normalizeListPayload(data: unknown, limit: number): ProductListResponse {
  if (!data || typeof data !== 'object') return emptyList(limit);
  const obj = data as Record<string, unknown>;
  const itemsRaw = (obj['items'] ?? obj['data'] ?? []) as unknown[];
  const items = Array.isArray(itemsRaw)
    ? itemsRaw.map((row) => normalizeProduct((row ?? {}) as Record<string, unknown>))
    : [];
  const total = Number(obj['total'] ?? items.length) || items.length;
  const page = Number(obj['page'] ?? 1) || 1;
  const lim = Number(obj['limit'] ?? limit) || limit;
  const totalPages = Number(obj['totalPages'] ?? Math.ceil(total / Math.max(lim, 1))) || 0;
  return { items, total, page, limit: lim, totalPages };
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
    const data = await fetchJson<unknown>(`/products?${params.toString()}`, {
      revalidate: 60,
      tags: ['products'],
    });
    return normalizeListPayload(data, input.limit ?? 24);
  } catch {
    return emptyList(input.limit ?? 24);
  }
}

export async function fetchFeaturedProducts(limit = 8): Promise<ProductSummary[]> {
  try {
    const data = await fetchJson<unknown>(`/products/featured?limit=${limit}`, {
      revalidate: 60,
      tags: ['products', 'products:featured'],
    });
    return normalizeListPayload(data, limit).items;
  } catch {
    return [];
  }
}

export async function fetchProductBySlug(slug: string): Promise<ProductDetail | null> {
  try {
    const data = await fetchJson<Record<string, unknown>>(`/products/${encodeURIComponent(slug)}`, {
      revalidate: 60,
      tags: ['products', `products:slug:${slug}`],
    });
    const base = normalizeProduct(data);
    return {
      ...base,
      description: String(data['description'] ?? ''),
      longDescription: (data['longDescription'] as string | null | undefined) ?? null,
      tags: Array.isArray(data['tags']) ? (data['tags'] as string[]) : undefined,
      variants: Array.isArray(data['variants'])
        ? (data['variants'] as ProductDetail['variants'])
        : undefined,
      faq: Array.isArray(data['faq']) ? (data['faq'] as ProductDetail['faq']) : undefined,
    };
  } catch {
    return null;
  }
}

export async function fetchCategories(): Promise<CategoryRow[]> {
  try {
    const data = await fetchJson<{ items?: CategoryRow[] }>(`/products/categories`, {
      revalidate: 300,
      tags: ['categories'],
    });
    return (data.items ?? []).map((c) => ({
      id: c.id,
      slug: c.slug,
      name: c.name,
      iconUrl: c.iconUrl ?? null,
    }));
  } catch {
    return [];
  }
}

export async function fetchBrands(): Promise<BrandRow[]> {
  try {
    const data = await fetchJson<{ items?: Array<Record<string, unknown>> }>(`/products/brands`, {
      revalidate: 300,
      tags: ['brands'],
    });
    return (data.items ?? []).map((b) => ({
      id: String(b['id'] ?? ''),
      slug: String(b['slug'] ?? ''),
      name: String(b['name'] ?? ''),
      logoUrl: (b['logoUrl'] as string | null | undefined) ?? null,
    }));
  } catch {
    return [];
  }
}
