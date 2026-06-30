import { prisma } from '../db';
import type {
  IProductRepository,
  ProductListOptions,
  CreateProductInput,
  UpdateProductInput,
} from '../../application/ports/repositories';
import type { ProductEntity } from '../../domain/entities/product';
import type { Currency } from '../../domain/entities/wallet';

function toEntity(p: any): ProductEntity {
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
    deliveryType: p.deliveryType,
    isActive: p.isActive,
    isFeatured: p.isFeatured,
    tags: p.tags ?? [],
    metadata: p.metadata ?? null,
    sortOrder: p.sortOrder,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  };
}

const CURRENCY_PRICE_FIELD: Record<Currency, 'priceTry' | 'priceUsd' | 'priceEur' | 'priceUsdt'> = {
  TRY: 'priceTry',
  USD: 'priceUsd',
  EUR: 'priceEur',
  USDT: 'priceUsdt',
};

const SORT_MAP = {
  newest: { createdAt: 'desc' as const },
  oldest: { createdAt: 'asc' as const },
  price_asc: { priceTry: 'asc' as const },
  price_desc: { priceTry: 'desc' as const },
  popular: { createdAt: 'desc' as const },
  featured: [{ isFeatured: 'desc' as const }, { createdAt: 'desc' as const }],
} as const;

export class ProductRepository implements IProductRepository {
  async list(opts: ProductListOptions): Promise<{ items: ProductEntity[]; total: number }> {
    const { filter, sort, page, limit } = opts;
    const where: any = {};
    if (filter.isActive !== undefined) where.isActive = filter.isActive;
    if (filter.isFeatured !== undefined) where.isFeatured = filter.isFeatured;
    if (filter.categoryId) where.categoryId = filter.categoryId;
    if (filter.brandId) where.brandId = filter.brandId;
    if (filter.tags && filter.tags.length > 0) {
      where.tags = { hasEvery: filter.tags };
    }
    if (filter.categorySlug || filter.brandSlug) {
      const slugs: any[] = [];
      if (filter.categorySlug) slugs.push({ category: { slug: filter.categorySlug } });
      if (filter.brandSlug) slugs.push({ brand: { slug: filter.brandSlug } });
      where.AND = slugs;
    }
    if (filter.search) {
      const term = filter.search.trim();
      if (term.length > 0) {
        where.OR = [
          { title: { contains: term, mode: 'insensitive' } },
          { description: { contains: term, mode: 'insensitive' } },
        ];
      }
    }
    if (filter.minPrice !== undefined || filter.maxPrice !== undefined) {
      const field = CURRENCY_PRICE_FIELD[filter.currency ?? 'TRY'];
      where[field] = {
        ...(filter.minPrice !== undefined ? { gte: filter.minPrice } : {}),
        ...(filter.maxPrice !== undefined ? { lte: filter.maxPrice } : {}),
      };
    }

    const orderBy = SORT_MAP[sort];
    const [items, total] = await prisma.$transaction([
      prisma.product.findMany({
        where,
        orderBy: orderBy as any,
        skip: (page - 1) * limit,
        take: limit,
        include: { category: true, brand: true },
      }),
      prisma.product.count({ where }),
    ]);
    return { items: items.map(toEntity), total };
  }

  async findById(id: string): Promise<ProductEntity | null> {
    const p = await prisma.product.findUnique({ where: { id } });
    return p ? toEntity(p) : null;
  }

  async findBySlug(slug: string): Promise<ProductEntity | null> {
    const p = await prisma.product.findUnique({ where: { slug } });
    return p ? toEntity(p) : null;
  }

  async findByIdWithRelations(id: string): Promise<ProductEntity | null> {
    const p = await prisma.product.findUnique({
      where: { id },
      include: { category: true, brand: true },
    });
    return p ? toEntity(p) : null;
  }

  async findBySlugWithRelations(slug: string): Promise<ProductEntity | null> {
    const p = await prisma.product.findUnique({
      where: { slug },
      include: { category: true, brand: true },
    });
    return p ? toEntity(p) : null;
  }

  async create(data: CreateProductInput): Promise<ProductEntity> {
    const p = await prisma.product.create({
      data: {
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
        metadata: (data.metadata as any) ?? undefined,
        sortOrder: data.sortOrder ?? 0,
      },
    });
    return toEntity(p);
  }

  async update(id: string, data: UpdateProductInput): Promise<ProductEntity> {
    const p = await prisma.product.update({
      where: { id },
      data: {
        ...(data.categoryId !== undefined ? { categoryId: data.categoryId } : {}),
        ...(data.brandId !== undefined ? { brandId: data.brandId } : {}),
        ...(data.slug !== undefined ? { slug: data.slug } : {}),
        ...(data.title !== undefined ? { title: data.title } : {}),
        ...(data.description !== undefined ? { description: data.description } : {}),
        ...(data.imageUrl !== undefined ? { imageUrl: data.imageUrl } : {}),
        ...(data.modelUrl !== undefined ? { modelUrl: data.modelUrl } : {}),
        ...(data.priceTry !== undefined ? { priceTry: data.priceTry } : {}),
        ...(data.priceUsd !== undefined ? { priceUsd: data.priceUsd } : {}),
        ...(data.priceEur !== undefined ? { priceEur: data.priceEur } : {}),
        ...(data.priceUsdt !== undefined ? { priceUsdt: data.priceUsdt } : {}),
        ...(data.stock !== undefined ? { stock: data.stock } : {}),
        ...(data.deliveryType !== undefined ? { deliveryType: data.deliveryType } : {}),
        ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
        ...(data.isFeatured !== undefined ? { isFeatured: data.isFeatured } : {}),
        ...(data.tags !== undefined ? { tags: data.tags } : {}),
        ...(data.metadata !== undefined ? { metadata: data.metadata as any } : {}),
        ...(data.sortOrder !== undefined ? { sortOrder: data.sortOrder } : {}),
      },
    });
    return toEntity(p);
  }

  async softDelete(id: string): Promise<ProductEntity> {
    const p = await prisma.product.update({
      where: { id },
      data: { isActive: false },
    });
    return toEntity(p);
  }

  async countActive(): Promise<number> {
    return prisma.product.count({ where: { isActive: true } });
  }

  async getFeatured(limit: number): Promise<ProductEntity[]> {
    const items = await prisma.product.findMany({
      where: { isActive: true, isFeatured: true },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      take: limit,
      include: { category: true, brand: true },
    });
    return items.map(toEntity);
  }

  async decrementStock(productId: string, qty: number): Promise<void> {
    const p = await prisma.product.findUnique({ where: { id: productId } });
    if (!p) throw new Error('PRODUCT_NOT_FOUND');
    await prisma.product.update({
      where: { id: productId },
      data: { stock: { decrement: qty } },
    });
  }

  async incrementStock(productId: string, qty: number): Promise<void> {
    await prisma.product.update({
      where: { id: productId },
      data: { stock: { increment: qty } },
    });
  }
}

export const productRepository = new ProductRepository();
