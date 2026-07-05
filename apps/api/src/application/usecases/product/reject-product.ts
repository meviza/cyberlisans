import { ProductNotFoundError, ProductReviewStatusError } from '../../../domain/errors/product';
import type { RequestMeta } from '../../ports/auth';
import type { ISellerProductRepository, IAuditRepository } from '../../ports/repositories';

export interface RejectProductDeps {
  products: ISellerProductRepository;
  audit: IAuditRepository;
}

export interface RejectProductInput {
  productId: string;
  adminId: string;
  reason: string;
}

export interface RejectProductOutput {
  ok: boolean;
  id: string;
  status: 'REJECTED';
  slug: string;
  title: string;
  reason: string;
}

export class RejectProductUseCase {
  constructor(private readonly deps: RejectProductDeps) {}

  async execute(input: RejectProductInput, meta: RequestMeta): Promise<RejectProductOutput> {
    const product = await this.deps.products.findSellerProductById(input.productId);
    if (!product) throw new ProductNotFoundError();
    if (product.status === 'REJECTED') {
      throw new ProductReviewStatusError('Ürün zaten reddedilmiş');
    }
    const updated = await this.deps.products.rejectSellerProduct(
      input.productId,
      input.adminId,
      input.reason,
    );
    await this.deps.audit.log({
      actorId: input.adminId,
      action: 'STATUS_CHANGE',
      targetType: 'product',
      targetId: updated.id,
      payload: { from: product.status, to: 'REJECTED', reason: input.reason },
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    });
    return {
      ok: true,
      id: updated.id,
      status: 'REJECTED',
      slug: updated.slug,
      title: updated.name,
      reason: input.reason,
    };
  }
}
