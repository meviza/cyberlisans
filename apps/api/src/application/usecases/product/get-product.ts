import { productRepository } from '../../../infrastructure/repositories/product.repository';
import { ProductNotFoundError } from '../../../domain/errors/product';

export async function getProduct(identifier: string) {
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);
  const product = isUuid
    ? await productRepository.findByIdWithRelations(identifier)
    : await productRepository.findBySlugWithRelations(identifier);
  if (!product) throw new ProductNotFoundError();
  return product;
}
