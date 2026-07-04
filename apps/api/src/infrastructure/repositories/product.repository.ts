import { supabaseAdmin, dbError } from '../db';
import type {
  IProductRepository,
  ProductListOptions,
  CreateProductInput,
  UpdateProductInput,
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
