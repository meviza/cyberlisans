import { SellerNotFoundError, SellerNotApprovedError } from '../../../domain/errors/seller';
import {
  ProductSlugTakenError,
  CategoryNotFoundError,
  BrandNotFoundError,
} from '../../../domain/errors/product';
import { ValidationError } from '../../../domain/errors/validation';
import { supabaseAdmin } from '../../../infrastructure/supabase-db';
import type { RequestMeta } from '../../ports/auth';
import type {
  ISellerProductRepository,
  ICategoryRepository,
  IBrandRepository,
  IAuditRepository,
} from '../../ports/repositories';
import type { SellerRepositoryPort, SellerEntity } from '../../ports/seller';

export interface CreateProductDeps {
  sellers: SellerRepositoryPort;
  products: ISellerProductRepository;
  categories: ICategoryRepository;
  brands: IBrandRepository;
  audit: IAuditRepository;
}

export interface CreateProductInput {
  userId: string;
  title: string;
  slug?: string;
  description?: string | null;
  imageUrl?: string | null;
  images?: string[];
  priceTry?: number;
  priceUsd?: number;
  priceEur?: number;
  priceUsdt?: number;
  stock: number;
  categoryId: string;
  brandId?: string | null;
  deliveryType?: 'AUTO' | 'MANUAL' | 'KEY';
  digitalContent?: string | null;
  autoDelivery?: boolean;
  minDeliverySeconds?: number;
  maxDeliverySeconds?: number;
  productKeyIds?: string[];
}

export interface CreateProductOutput {
  id: string;
  slug: string;
  status: 'PENDING_REVIEW';
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 200);
}

export class CreateProductUseCase {
  constructor(private readonly deps: CreateProductDeps) {}

  async execute(input: CreateProductInput, meta: RequestMeta): Promise<CreateProductOutput> {
    const seller = await this.requireSeller(input.userId);
    if (!(await this.deps.categories.findById(input.categoryId))) {
      throw new CategoryNotFoundError();
    }
    if (input.brandId && !(await this.deps.brands.findById(input.brandId))) {
      throw new BrandNotFoundError();
    }
    const prices = {
      priceTry: input.priceTry,
      priceUsd: input.priceUsd,
      priceEur: input.priceEur,
      priceUsdt: input.priceUsdt,
    };
    if (!prices.priceTry && !prices.priceUsd && !prices.priceEur && !prices.priceUsdt) {
      throw new ValidationError('At least one price currency is required');
    }
    for (const [k, v] of Object.entries(prices)) {
      if (v !== undefined && v <= 0) throw new ValidationError(`${k} must be positive`);
    }
    const slug = input.slug ?? slugify(input.title);
    const { data: slugHit } = await supabaseAdmin()
      .from('products')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();
    if (slugHit) throw new ProductSlugTakenError();

    const stock = input.productKeyIds?.length ?? input.stock;
    const product = await this.deps.products.createSellerProduct({
      sellerId: seller.id,
      categoryId: input.categoryId,
      brandId: input.brandId ?? null,
      slug,
      title: input.title,
      description: input.description ?? null,
      imageUrl: input.imageUrl ?? null,
      images: input.images,
      priceTry: input.priceTry,
      priceUsd: input.priceUsd,
      priceEur: input.priceEur,
      priceUsdt: input.priceUsdt,
      stock,
      deliveryType: input.deliveryType ?? 'KEY',
      digitalContent: input.digitalContent ?? null,
      autoDelivery: input.autoDelivery ?? false,
      minDeliverySeconds: input.minDeliverySeconds ?? 0,
      maxDeliverySeconds: input.maxDeliverySeconds ?? 0,
    });
    if (input.productKeyIds?.length) {
      await this.deps.products.attachKeysToProduct(product.id, input.productKeyIds);
    }
    await this.deps.audit.log({
      actorId: input.userId,
      action: 'CREATE',
      targetType: 'product',
      targetId: product.id,
      payload: {
        slug: product.slug,
        sellerId: seller.id,
        priceTry: input.priceTry ?? null,
        priceUsd: input.priceUsd ?? null,
        priceEur: input.priceEur ?? null,
        priceUsdt: input.priceUsdt ?? null,
        stock,
      },
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    });
    return { id: product.id, slug: product.slug, status: 'PENDING_REVIEW' };
  }

  private async requireSeller(userId: string): Promise<SellerEntity> {
    const seller = await this.deps.sellers.findByUserId(userId);
    if (!seller) throw new SellerNotFoundError();
    if (seller.status !== 'APPROVED' || seller.kycStatus !== 'VERIFIED') {
      throw new SellerNotApprovedError();
    }
    return seller;
  }
}
