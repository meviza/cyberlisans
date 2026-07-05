import {
  ProductNotFoundError,
  ProductOwnershipError,
  ProductReviewStatusError,
  ProductDeleteConflictError,
} from '../../../domain/errors/product';
import { SellerNotFoundError } from '../../../domain/errors/seller';
import type { RequestMeta } from '../../ports/auth';
import type { ISellerProductRepository, IAuditRepository } from '../../ports/repositories';
import type { SellerRepositoryPort } from '../../ports/seller';

export interface DeleteProductDeps {
  sellers: SellerRepositoryPort;
  products: ISellerProductRepository;
  audit: IAuditRepository;
}

export interface DeleteProductInput {
  productId: string;
  userId: string;
}

export interface DeleteProductOutput {
  ok: boolean;
  deleted: boolean;
}

export class DeleteProductUseCase {
  constructor(private readonly deps: DeleteProductDeps) {}

  async execute(input: DeleteProductInput, meta: RequestMeta): Promise<DeleteProductOutput> {
    const seller = await this.deps.sellers.findByUserId(input.userId);
    if (!seller) throw new SellerNotFoundError();
    const product = await this.deps.products.findSellerProductById(input.productId);
    if (!product) throw new ProductNotFoundError();
    if (product.sellerId !== seller.id) throw new ProductOwnershipError();
    if (product.status === 'DELETED') throw new ProductReviewStatusError('Ürün zaten silinmiş');
    const active = await this.deps.products.hasActiveEscrowForProduct(product.id);
    if (active) throw new ProductDeleteConflictError();
    await this.deps.products.softDeleteSellerProduct(product.id);
    await this.deps.audit.log({
      actorId: input.userId,
      action: 'DELETE',
      targetType: 'product',
      targetId: product.id,
      payload: { slug: product.slug },
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    });
    return { ok: true, deleted: true };
  }
}
