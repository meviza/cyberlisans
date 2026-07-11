import { productKeyRepository } from '../../../infrastructure/repositories/product-key.repository';
import { auditRepository } from '../../../infrastructure/repositories/audit.repository';
import { ProductKeyNotFoundError, ProductKeyInUseError } from '../../../domain/errors/product';

export interface DeleteKeyInput {
  keyId: string;
  adminId: string;
  ipAddress?: string;
  userAgent?: string;
}

export async function deleteProductKey(input: DeleteKeyInput) {
  const key = await productKeyRepository.findById(input.keyId);
  if (!key) throw new ProductKeyNotFoundError();
  if (key.isUsed || key.reservedFor) throw new ProductKeyInUseError();
  await productKeyRepository.deleteById(input.keyId);
  await auditRepository.log({
    actorId: input.adminId,
    action: 'DELETE',
    targetType: 'product_key',
    targetId: input.keyId,
    payload: { productId: key.productId },
    ipAddress: input.ipAddress,
    userAgent: input.userAgent,
  });
  return { id: input.keyId, deleted: true };
}
