import { productKeyRepository } from '../../../infrastructure/repositories/product-key.repository';
import { productRepository } from '../../../infrastructure/repositories/product.repository';
import { ProductNotFoundError } from '../../../domain/errors/product';

export interface ListKeysInput {
  productId: string;
  availableOnly?: boolean;
  page?: number;
  limit?: number;
}

export async function listProductKeys(input: ListKeysInput) {
  const product = await productRepository.findById(input.productId);
  if (!product) throw new ProductNotFoundError();
  const page = Math.max(1, input.page ?? 1);
  const limit = Math.min(200, Math.max(1, input.limit ?? 50));
  const result = await productKeyRepository.listByProduct(input.productId, {
    availableOnly: input.availableOnly,
    page,
    limit,
  });
  return {
    productId: input.productId,
    items: result.items,
    total: result.total,
    available: await productKeyRepository.countAvailable(input.productId),
    page,
    limit,
  };
}
