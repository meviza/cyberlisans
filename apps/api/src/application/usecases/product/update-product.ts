import {
  ProductNotFoundError,
  ProductOwnershipError,
  ProductReviewStatusError,
  CategoryNotFoundError,
  BrandNotFoundError,
} from '../../../domain/errors/product';
import { SellerNotFoundError, SellerNotApprovedError } from '../../../domain/errors/seller';
import type { RequestMeta } from '../../ports/auth';
import type {
  ISellerProductRepository,
  ICategoryRepository,
  IBrandRepository,
  IAuditRepository,
  UpdateSellerProductInput,
} from '../../ports/repositories';
import type { SellerRepositoryPort } from '../../ports/seller';

export interface UpdateProductDeps {
  sellers: SellerRepositoryPort;
  products: ISellerProductRepository;
  categories: ICategoryRepository;
  brands: IBrandRepository;
  audit: IAuditRepository;
}

export interface UpdateProductInput {
  productId: string;
  userId: string;
  updates: UpdateSellerProductInput;
}

export interface UpdateProductOutput {
  id: string;
  title: string;
  slug: string;
  status: string;
  priceTry?: number;
  priceUsd?: number;
  priceEur?: number;
  priceUsdt?: number;
  stock: number;
  categoryId: string;
  brandId?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  images?: string[];
  updated: true;
}

export class UpdateProductUseCase {
  constructor(private readonly deps: UpdateProductDeps) {}

  async execute(input: UpdateProductInput, meta: RequestMeta): Promise<UpdateProductOutput> {
    const seller = await this.deps.sellers.findByUserId(input.userId);
    if (!seller) throw new SellerNotFoundError();
    if (seller.status !== 'APPROVED' || seller.kycStatus !== 'VERIFIED') {
      throw new SellerNotApprovedError();
    }

    const product = await this.deps.products.findSellerProductById(input.productId);
    if (!product) throw new ProductNotFoundError();
    if (product.sellerId !== seller.id) throw new ProductOwnershipError();
    if (product.status !== 'PENDING_REVIEW' && product.status !== 'ACTIVE') {
      throw new ProductReviewStatusError(
        'Yalnızca inceleme bekleyen veya aktif ürünler güncellenebilir',
      );
    }

    if (input.updates.categoryId) {
      const c = await this.deps.categories.findById(input.updates.categoryId);
      if (!c) throw new CategoryNotFoundError();
    }
    if (input.updates.brandId) {
      const b = await this.deps.brands.findById(input.updates.brandId);
      if (!b) throw new BrandNotFoundError();
    }

    const updated = await this.deps.products.updateSellerProduct(input.productId, input.updates);

    await this.deps.audit.log({
      actorId: input.userId,
      action: 'UPDATE',
      targetType: 'product',
      targetId: updated.id,
      payload: { changes: input.updates },
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    });

    return {
      id: updated.id,
      title: updated.name,
      slug: updated.slug,
      status: updated.status,
      priceTry: updated.currency === 'TRY' ? updated.price : undefined,
      priceUsd: updated.currency === 'USD' ? updated.price : undefined,
      priceEur: updated.currency === 'EUR' ? updated.price : undefined,
      priceUsdt: updated.currency === 'USDT' ? updated.price : undefined,
      stock: updated.stock,
      categoryId: updated.categoryId,
      brandId: updated.brandId,
      description: updated.description,
      imageUrl: updated.images[0] ?? null,
      images: updated.images,
      updated: true,
    };
  }
}
