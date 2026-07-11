import { productRepository } from '../../../infrastructure/repositories/product.repository';
import { auditRepository } from '../../../infrastructure/repositories/audit.repository';
import { ProductNotFoundError } from '../../../domain/errors/product';

export interface DeleteProductUseCaseInput {
  id: string;
  adminId: string;
  ipAddress?: string;
  userAgent?: string;
}

export async function deleteProduct(input: DeleteProductUseCaseInput) {
  const existing = await productRepository.findById(input.id);
  if (!existing) throw new ProductNotFoundError();
  const updated = await productRepository.softDelete(input.id);
  await auditRepository.log({
    actorId: input.adminId,
    action: 'DELETE',
    targetType: 'product',
    targetId: input.id,
    payload: { slug: existing.slug, soft: true },
    ipAddress: input.ipAddress,
    userAgent: input.userAgent,
  });
  return { id: updated.id, slug: updated.slug, isActive: updated.isActive };
}
