import { ProductNotFoundError, ProductReviewStatusError } from '../../../domain/errors/product';
import type { RequestMeta } from '../../ports/auth';
import type { ISellerProductRepository, IAuditRepository } from '../../ports/repositories';

export interface ApproveProductDeps {
  products: ISellerProductRepository;
  audit: IAuditRepository;
}

export interface ApproveProductInput {
  productId: string;
  adminId: string;
}

export interface ApproveProductOutput {
  ok: boolean;
  id: string;
  status: 'ACTIVE';
  slug: string;
  title: string;
}

export class ApproveProductUseCase {
  constructor(private readonly deps: ApproveProductDeps) {}

  async execute(input: ApproveProductInput, meta: RequestMeta): Promise<ApproveProductOutput> {
    const product = await this.deps.products.findSellerProductById(input.productId);
    if (!product) throw new ProductNotFoundError();
    if (product.status === 'ACTIVE') {
      throw new ProductReviewStatusError('Ürün zaten aktif');
    }
    const updated = await this.deps.products.approveSellerProduct(input.productId, input.adminId);
    await this.deps.audit.log({
      actorId: input.adminId,
      action: 'STATUS_CHANGE',
      targetType: 'product',
      targetId: updated.id,
      payload: { from: product.status, to: 'ACTIVE' },
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    });
    return { ok: true, id: updated.id, status: 'ACTIVE', slug: updated.slug, title: updated.name };
  }
}
