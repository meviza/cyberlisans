import { supabaseAdmin, dbError } from '../db';
import type {
  IProductRepository,
  ISellerProductRepository,
  ProductListOptions,
  CreateProductInput,
  UpdateProductInput,
  SellerProductEntity,
  CreateSellerProductInput,
  UpdateSellerProductInput,
  ListSellerProductsFilter,
  ListPendingProductsFilter,
  ProductReviewStatus,
} from '../../application/ports/repositories';
import type { ProductEntity } from '../../domain/entities/product';
import type { Currency } from '../../domain/entities/wallet';

const COLS =
  'id,categoryId,brandId,slug,title,description,imageUrl,modelUrl,priceTry,priceUsd,priceEur,priceUsdt,stock,deliveryType,isActive,isFeatured,tags,metadata,sortOrder,createdAt,updatedAt';

type Row = {
  id: string;
  categoryId: string;
  brandId: string | null;
  slug: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  modelUrl: string | null;
  priceTry: string | number;
  priceUsd: string | number;
  priceEur: string | number;
  priceUsdt: string | number;
  stock: number;
  deliveryType: string;
  isActive: boolean;
  isFeatured: boolean;
  tags: string[] | null;
  metadata: Record<string, unknown> | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

function toEntity(p: Row): ProductEntity {
  return {
    id: p.id,
    categoryId: p.categoryId,
    brandId: p.brandId ?? null,
    slug: p.slug,
    title: p.title,
    description: p.description ?? null,
    imageUrl: p.imageUrl ?? null,
    modelUrl: p.modelUrl ?? null,
    priceTry: Number(p.priceTry),
    priceUsd: Number(p.priceUsd),
    priceEur: Number(p.priceEur),
    priceUsdt: Number(p.priceUsdt),
    stock: p.stock,
    deliveryType: p.deliveryType as ProductEntity['deliveryType'],
    isActive: p.isActive,
    isFeatured: p.isFeatured,
    tags: p.tags ?? [],
    metadata: p.metadata ?? null,
    sortOrder: p.sortOrder,
    createdAt: new Date(p.createdAt),
    updatedAt: new Date(p.updatedAt),
  };
}

const CURRENCY_PRICE_FIELD: Record<Currency, string> = {
  TRY: 'priceTry',
  USD: 'priceUsd',
  EUR: 'priceEur',
  USDT: 'priceUsdt',
};

export class ProductRepository implements IProductRepository {
  async list(opts: ProductListOptions): Promise<{ items: ProductEntity[]; total: number }> {
    const { filter, sort, page, limit } = opts;
    let q = supabaseAdmin().from('products').select(COLS, { count: 'exact' });
    if (filter.isActive !== undefined) q = q.eq('isActive', filter.isActive);
    if (filter.isFeatured !== undefined) q = q.eq('isFeatured', filter.isFeatured);
    if (filter.categoryId) q = q.eq('categoryId', filter.categoryId);
    if (filter.brandId) q = q.eq('brandId', filter.brandId);
    if (filter.tags && filter.tags.length > 0) q = q.contains('tags', filter.tags);
    if (filter.search) {
      const term = `%${filter.search.trim()}%`;
      q = q.or(`title.ilike.${term},description.ilike.${term}`);
    }
    if (filter.minPrice !== undefined || filter.maxPrice !== undefined) {
      const field = CURRENCY_PRICE_FIELD[filter.currency ?? 'TRY'];
      if (filter.minPrice !== undefined) q = q.gte(field, filter.minPrice);
      if (filter.maxPrice !== undefined) q = q.lte(field, filter.maxPrice);
    }
    const sortKey = (() => {
      switch (sort) {
        case 'oldest':
          return { col: 'createdAt', asc: true } as const;
        case 'price_asc':
          return { col: 'priceTry', asc: true } as const;
        case 'price_desc':
          return { col: 'priceTry', asc: false } as const;
        case 'featured':
          return { col: 'isFeatured', asc: false } as const;
        case 'popular':
        case 'newest':
        default:
          return { col: 'createdAt', asc: false } as const;
      }
    })();
    q = q.order(sortKey.col, { ascending: sortKey.asc });
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    q = q.range(from, to);
    const { data, error, count } = await q;
    if (error) throw dbError(error);
    return { items: (data ?? []).map((r) => toEntity(r as Row)), total: count ?? 0 };
  }

  async findById(id: string): Promise<ProductEntity | null> {
    const { data, error } = await supabaseAdmin()
      .from('products')
      .select(COLS)
      .eq('id', id)
      .maybeSingle();
    if (error) throw dbError(error);
    return data ? toEntity(data as Row) : null;
  }

  async findBySlug(slug: string): Promise<ProductEntity | null> {
    const { data, error } = await supabaseAdmin()
      .from('products')
      .select(COLS)
      .eq('slug', slug)
      .maybeSingle();
    if (error) throw dbError(error);
    return data ? toEntity(data as Row) : null;
  }

  async findByIdWithRelations(id: string): Promise<ProductEntity | null> {
    return this.findById(id);
  }

  async findBySlugWithRelations(slug: string): Promise<ProductEntity | null> {
    return this.findBySlug(slug);
  }

  async create(data: CreateProductInput): Promise<ProductEntity> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const insert = {
      id,
      categoryId: data.categoryId,
      brandId: data.brandId ?? null,
      slug: data.slug,
      title: data.title,
      description: data.description ?? null,
      imageUrl: data.imageUrl ?? null,
      modelUrl: data.modelUrl ?? null,
      priceTry: data.priceTry,
      priceUsd: data.priceUsd,
      priceEur: data.priceEur,
      priceUsdt: data.priceUsdt,
      stock: data.stock,
      deliveryType: data.deliveryType,
      isActive: data.isActive ?? true,
      isFeatured: data.isFeatured ?? false,
      tags: data.tags ?? [],
      metadata: data.metadata ?? null,
      sortOrder: data.sortOrder ?? 0,
      createdAt: now,
      updatedAt: now,
    };
    const { data: p, error } = await supabaseAdmin()
      .from('products')
      .insert(insert)
      .select(COLS)
      .single();
    if (error || !p) throw dbError(error);
    return toEntity(p as Row);
  }

  async update(id: string, data: UpdateProductInput): Promise<ProductEntity> {
    const patch: Record<string, unknown> = { updatedAt: new Date().toISOString() };
    for (const [k, v] of Object.entries(data)) {
      if (v !== undefined) patch[k] = v;
    }
    const { data: p, error } = await supabaseAdmin()
      .from('products')
      .update(patch)
      .eq('id', id)
      .select(COLS)
      .single();
    if (error || !p) throw dbError(error);
    return toEntity(p as Row);
  }

  async softDelete(id: string): Promise<ProductEntity> {
    const { data: p, error } = await supabaseAdmin()
      .from('products')
      .update({ isActive: false, updatedAt: new Date().toISOString() })
      .eq('id', id)
      .select(COLS)
      .single();
    if (error || !p) throw dbError(error);
    return toEntity(p as Row);
  }

  async countActive(): Promise<number> {
    const { count, error } = await supabaseAdmin()
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('isActive', true);
    if (error) throw dbError(error);
    return count ?? 0;
  }

  async getFeatured(limit: number): Promise<ProductEntity[]> {
    const { data, error } = await supabaseAdmin()
      .from('products')
      .select(COLS)
      .eq('isActive', true)
      .eq('isFeatured', true)
      .order('sortOrder', { ascending: true })
      .order('createdAt', { ascending: false })
      .limit(limit);
    if (error) throw dbError(error);
    return (data ?? []).map((r) => toEntity(r as Row));
  }

  async decrementStock(productId: string, qty: number): Promise<void> {
    const { data: p, error: e1 } = await supabaseAdmin()
      .from('products')
      .select('id,stock')
      .eq('id', productId)
      .maybeSingle();
    if (e1) throw dbError(e1);
    if (!p) throw new Error('PRODUCT_NOT_FOUND');
    const next = (p as { stock: number }).stock - qty;
    const { error } = await supabaseAdmin()
      .from('products')
      .update({ stock: next, updatedAt: new Date().toISOString() })
      .eq('id', productId);
    if (error) throw dbError(error);
  }

  async incrementStock(productId: string, qty: number): Promise<void> {
    const { data: p, error: e1 } = await supabaseAdmin()
      .from('products')
      .select('stock')
      .eq('id', productId)
      .maybeSingle();
    if (e1) throw dbError(e1);
    if (!p) throw new Error('PRODUCT_NOT_FOUND');
    const next = (p as { stock: number }).stock + qty;
    const { error } = await supabaseAdmin()
      .from('products')
      .update({ stock: next, updatedAt: new Date().toISOString() })
      .eq('id', productId);
    if (error) throw dbError(error);
  }
}

export const productRepository = new ProductRepository();

const SELLER_COLS =
  'id,sellerId,categoryId,brandId,slug,title,description,imageUrl,priceTry,priceUsd,priceEur,priceUsdt,stock,listingType,status,approvedById,approvedAt,rejectedById,rejectedAt,rejectedReason,deletedAt,createdAt,updatedAt';

type SellerRow = {
  id: string;
  sellerId: string | null;
  categoryId: string;
  brandId: string | null;
  slug: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  priceTry: string | number;
  priceUsd: string | number;
  priceEur: string | number;
  priceUsdt: string | number;
  stock: number;
  listingType: string | null;
  status: string | null;
  approvedById: string | null;
  approvedAt: string | null;
  rejectedById: string | null;
  rejectedAt: string | null;
  rejectedReason: string | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

function priceField(c: 'TRY' | 'USD' | 'EUR' | 'USDT'): keyof SellerRow {
  return c === 'USD'
    ? 'priceUsd'
    : c === 'EUR'
      ? 'priceEur'
      : c === 'USDT'
        ? 'priceUsdt'
        : 'priceTry';
}

function toSellerEntity(
  r: SellerRow,
  currency: 'TRY' | 'USD' | 'EUR' | 'USDT',
): SellerProductEntity {
  return {
    id: r.id,
    sellerId: r.sellerId ?? '',
    categoryId: r.categoryId,
    brandId: r.brandId ?? null,
    slug: r.slug,
    name: r.title,
    description: r.description ?? null,
    images: r.imageUrl ? [r.imageUrl] : [],
    price: Number(r[priceField(currency)] as string | number),
    currency,
    stock: r.stock,
    listingType: (r.listingType as 'PLATFORM' | 'SELLER') ?? 'SELLER',
    status: (r.status as ProductReviewStatus) ?? 'PENDING_REVIEW',
    approvedById: r.approvedById ?? null,
    approvedAt: r.approvedAt ? new Date(r.approvedAt) : null,
    rejectedById: r.rejectedById ?? null,
    rejectedAt: r.rejectedAt ? new Date(r.rejectedAt) : null,
    rejectedReason: r.rejectedReason ?? null,
    deletedAt: r.deletedAt ? new Date(r.deletedAt) : null,
    createdAt: new Date(r.createdAt),
    updatedAt: new Date(r.updatedAt),
  };
}

// Geriye dönük uyumluluk: yeni input shape'ini (title, priceTry/Usd/Eur/Usdt)
// eski (name, price+currency) alanlarına map eder. Use-case'ler yeni shape'i
// kullanır, bu fonksiyon repository içindeki tek dönüşüm noktasıdır.
function mapCreateToLegacy(input: CreateSellerProductInput): {
  name: string;
  price: number;
  currency: 'TRY' | 'USD' | 'EUR' | 'USDT';
  images: string[];
} {
  const fallback: 'TRY' | 'USD' | 'EUR' | 'USDT' =
    input.priceUsd && input.priceUsd > 0
      ? 'USD'
      : input.priceEur && input.priceEur > 0
        ? 'EUR'
        : input.priceUsdt && input.priceUsdt > 0
          ? 'USDT'
          : 'TRY';
  const price =
    fallback === 'USD'
      ? (input.priceUsd as number)
      : fallback === 'EUR'
        ? (input.priceEur as number)
        : fallback === 'USDT'
          ? (input.priceUsdt as number)
          : ((input.priceTry as number) ?? 0);
  return {
    name: input.title,
    price,
    currency: fallback,
    images: input.images ?? (input.imageUrl ? [input.imageUrl] : []),
  };
}

function mapUpdateToLegacy(input: UpdateSellerProductInput): {
  name?: string;
  description?: string | null;
  images?: string[];
  price?: number;
  currency?: 'TRY' | 'USD' | 'EUR' | 'USDT';
  stock?: number;
  categoryId?: string;
  brandId?: string | null;
} {
  const legacy: {
    name?: string;
    description?: string | null;
    images?: string[];
    price?: number;
    currency?: 'TRY' | 'USD' | 'EUR' | 'USDT';
    stock?: number;
    categoryId?: string;
    brandId?: string | null;
  } = {};
  if (input.title !== undefined) legacy.name = input.title;
  if (input.description !== undefined) legacy.description = input.description;
  if (input.images !== undefined) legacy.images = input.images;
  else if (input.imageUrl !== undefined) legacy.images = input.imageUrl ? [input.imageUrl] : [];
  if (input.stock !== undefined) legacy.stock = input.stock;
  if (input.categoryId !== undefined) legacy.categoryId = input.categoryId;
  if (input.brandId !== undefined) legacy.brandId = input.brandId;
  if (input.priceUsd !== undefined) {
    legacy.currency = 'USD';
    legacy.price = input.priceUsd;
  } else if (input.priceEur !== undefined) {
    legacy.currency = 'EUR';
    legacy.price = input.priceEur;
  } else if (input.priceUsdt !== undefined) {
    legacy.currency = 'USDT';
    legacy.price = input.priceUsdt;
  } else if (input.priceTry !== undefined) {
    legacy.currency = 'TRY';
    legacy.price = input.priceTry;
  }
  return legacy;
}

export class SellerProductRepository implements ISellerProductRepository {
  async findSellerProductById(id: string): Promise<SellerProductEntity | null> {
    const { data, error } = await supabaseAdmin()
      .from('products')
      .select(SELLER_COLS)
      .eq('id', id)
      .maybeSingle();
    if (error) throw dbError(error);
    if (!data) return null;
    const row = data as SellerRow;
    return toSellerEntity(row, inferCurrency(row));
  }

  async listForSeller(
    filter: ListSellerProductsFilter,
  ): Promise<{ items: SellerProductEntity[]; total: number }> {
    const currency = 'TRY';
    let q = supabaseAdmin()
      .from('products')
      .select(SELLER_COLS, { count: 'exact' })
      .eq('sellerId', filter.sellerId)
      .neq('status', 'DELETED');
    if (filter.status) q = q.eq('status', filter.status);
    q = q.order('createdAt', { ascending: false });
    const from = (filter.page - 1) * filter.limit;
    q = q.range(from, from + filter.limit - 1);
    const { data, error, count } = await q;
    if (error) throw dbError(error);
    return {
      items: (data ?? []).map((r) => toSellerEntity(r as SellerRow, currency)),
      total: count ?? 0,
    };
  }

  async createSellerProduct(data: CreateSellerProductInput): Promise<SellerProductEntity> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const legacy = mapCreateToLegacy(data);
    const insert: Record<string, unknown> = {
      id,
      sellerId: data.sellerId,
      categoryId: data.categoryId,
      brandId: data.brandId ?? null,
      slug: data.slug,
      title: legacy.name,
      description: data.description ?? null,
      imageUrl: legacy.images[0] ?? null,
      images: legacy.images,
      stock: data.stock,
      deliveryType: data.deliveryType ?? 'KEY',
      autoDelivery: data.autoDelivery ?? false,
      minDeliverySeconds: data.minDeliverySeconds ?? 0,
      maxDeliverySeconds: data.maxDeliverySeconds ?? 0,
      digitalContent: data.digitalContent ?? null,
      isActive: false,
      listingType: 'SELLER',
      status: 'PENDING_REVIEW',
      createdAt: now,
      updatedAt: now,
      priceTry: data.priceTry ?? (legacy.currency === 'TRY' ? legacy.price : 0),
      priceUsd: data.priceUsd ?? (legacy.currency === 'USD' ? legacy.price : 0),
      priceEur: data.priceEur ?? (legacy.currency === 'EUR' ? legacy.price : 0),
      priceUsdt: data.priceUsdt ?? (legacy.currency === 'USDT' ? legacy.price : 0),
    };
    const { data: row, error } = await supabaseAdmin()
      .from('products')
      .insert(insert)
      .select(SELLER_COLS)
      .single();
    if (error) throw dbError(error);
    if (!row) throw new Error('PRODUCT_INSERT_FAILED');
    return toSellerEntity(row as SellerRow, legacy.currency);
  }

  async updateSellerProduct(
    id: string,
    data: UpdateSellerProductInput,
  ): Promise<SellerProductEntity> {
    const patch: Record<string, unknown> = { updatedAt: new Date().toISOString() };
    const legacy = mapUpdateToLegacy(data);
    if (legacy.name !== undefined) patch['title'] = legacy.name;
    if (legacy.description !== undefined) patch['description'] = legacy.description;
    if (legacy.images !== undefined) {
      patch['imageUrl'] = legacy.images[0] ?? null;
      patch['images'] = legacy.images;
    }
    if (legacy.price !== undefined && legacy.currency) {
      patch[priceField(legacy.currency)] = legacy.price;
    }
    if (legacy.stock !== undefined) patch['stock'] = legacy.stock;
    if (legacy.categoryId !== undefined) patch['categoryId'] = legacy.categoryId;
    if (legacy.brandId !== undefined) patch['brandId'] = legacy.brandId;
    const existing = await this.findSellerProductById(id);
    if (!existing) throw new Error('PRODUCT_NOT_FOUND');
    const { data: row, error } = await supabaseAdmin()
      .from('products')
      .update(patch)
      .eq('id', id)
      .select(SELLER_COLS)
      .single();
    if (error) throw dbError(error);
    if (!row) throw new Error('PRODUCT_UPDATE_FAILED');
    return toSellerEntity(row as SellerRow, legacy.currency ?? existing.currency);
  }

  async softDeleteSellerProduct(id: string): Promise<SellerProductEntity> {
    const now = new Date().toISOString();
    const { data: row, error } = await supabaseAdmin()
      .from('products')
      .update({ status: 'DELETED', deletedAt: now, isActive: false, updatedAt: now })
      .eq('id', id)
      .select(SELLER_COLS)
      .single();
    if (error) throw dbError(error);
    if (!row) throw new Error('PRODUCT_NOT_FOUND');
    return toSellerEntity(row as SellerRow, 'TRY');
  }

  async approveSellerProduct(id: string, adminId: string): Promise<SellerProductEntity> {
    const now = new Date().toISOString();
    const { data: row, error } = await supabaseAdmin()
      .from('products')
      .update({
        status: 'ACTIVE',
        isActive: true,
        approvedById: adminId,
        approvedAt: now,
        rejectedReason: null,
        rejectedById: null,
        rejectedAt: null,
        updatedAt: now,
      })
      .eq('id', id)
      .select(SELLER_COLS)
      .single();
    if (error) throw dbError(error);
    if (!row) throw new Error('PRODUCT_NOT_FOUND');
    return toSellerEntity(row as SellerRow, 'TRY');
  }

  async rejectSellerProduct(
    id: string,
    adminId: string,
    reason: string,
  ): Promise<SellerProductEntity> {
    const now = new Date().toISOString();
    const { data: row, error } = await supabaseAdmin()
      .from('products')
      .update({
        status: 'REJECTED',
        isActive: false,
        rejectedById: adminId,
        rejectedAt: now,
        rejectedReason: reason,
        updatedAt: now,
      })
      .eq('id', id)
      .select(SELLER_COLS)
      .single();
    if (error) throw dbError(error);
    if (!row) throw new Error('PRODUCT_NOT_FOUND');
    return toSellerEntity(row as SellerRow, 'TRY');
  }

  async listPendingProducts(
    filter: ListPendingProductsFilter,
  ): Promise<{ items: SellerProductEntity[]; total: number }> {
    let q = supabaseAdmin()
      .from('products')
      .select(SELLER_COLS, { count: 'exact' })
      .eq('status', 'PENDING_REVIEW')
      .eq('listingType', 'SELLER')
      .order('createdAt', { ascending: true });
    const from = (filter.page - 1) * filter.limit;
    q = q.range(from, from + filter.limit - 1);
    const { data, error, count } = await q;
    if (error) throw dbError(error);
    return {
      items: (data ?? []).map((r) => toSellerEntity(r as SellerRow, 'TRY')),
      total: count ?? 0,
    };
  }

  async hasActiveEscrowForProduct(productId: string): Promise<boolean> {
    const { data, error } = await supabaseAdmin()
      .from('order_items')
      .select('id,orderId,orders!inner(status)')
      .eq('productId', productId)
      .in('orders.status', ['PENDING', 'PAID']);
    if (error) return false;
    return (data ?? []).length > 0;
  }

  async attachKeysToProduct(productId: string, keyIds: string[]): Promise<number> {
    if (keyIds.length === 0) return 0;
    const { data, error } = await supabaseAdmin()
      .from('product_keys')
      .update({ productId })
      .in('id', keyIds)
      .select('id');
    if (error) throw dbError(error);
    return (data ?? []).length;
  }
}

function inferCurrency(r: SellerRow): 'TRY' | 'USD' | 'EUR' | 'USDT' {
  if (Number(r.priceUsd) > 0) return 'USD';
  if (Number(r.priceEur) > 0) return 'EUR';
  if (Number(r.priceUsdt) > 0) return 'USDT';
  return 'TRY';
}

export const sellerProductRepository = new SellerProductRepository();
