import { productKeyRepository } from '../../../infrastructure/repositories/product-key.repository';
import { productRepository } from '../../../infrastructure/repositories/product.repository';
import { auditRepository } from '../../../infrastructure/repositories/audit.repository';
import { ProductNotFoundError } from '../../../domain/errors/product';

export interface BulkAddKeysInput {
  productId: string;
  codes: string[];
  adminId: string;
  ipAddress?: string;
  userAgent?: string;
}

export async function bulkAddKeys(input: BulkAddKeysInput) {
  const product = await productRepository.findById(input.productId);
  if (!product) throw new ProductNotFoundError();
  const added = await productKeyRepository.bulkCreate(input.productId, input.codes);
  await productRepository.update(input.productId, {
    stock: product.stock + added,
  });
  await auditRepository.log({
    actorId: input.adminId,
    action: 'CREATE',
    targetType: 'product_keys',
    targetId: input.productId,
    payload: { added, total: input.codes.length },
    ipAddress: input.ipAddress,
    userAgent: input.userAgent,
  });
  return { productId: input.productId, added, requested: input.codes.length };
}
