import { productRepository } from '../../../infrastructure/repositories/product.repository';
import { categoryRepository } from '../../../infrastructure/repositories/category.repository';
import { brandRepository } from '../../../infrastructure/repositories/brand.repository';
import { auditRepository } from '../../../infrastructure/repositories/audit.repository';
import {
  ProductNotFoundError,
  ProductSlugTakenError,
  CategoryNotFoundError,
  BrandNotFoundError,
} from '../../../domain/errors/product';
import type { UpdateProductInput } from '../../../application/ports/repositories';

export interface UpdateProductUseCaseInput {
  id: string;
  adminId: string;
  data: UpdateProductInput;
  ipAddress?: string;
  userAgent?: string;
}

export async function updateProduct(input: UpdateProductUseCaseInput) {
  const existing = await productRepository.findById(input.id);
  if (!existing) throw new ProductNotFoundError();
  if (input.data.slug && input.data.slug !== existing.slug) {
    const taken = await productRepository.findBySlug(input.data.slug);
    if (taken) throw new ProductSlugTakenError();
  }
  if (input.data.categoryId && input.data.categoryId !== existing.categoryId) {
    const cat = await categoryRepository.findById(input.data.categoryId);
    if (!cat) throw new CategoryNotFoundError();
  }
  if (input.data.brandId !== undefined && input.data.brandId !== existing.brandId) {
    if (input.data.brandId) {
      const b = await brandRepository.findById(input.data.brandId);
      if (!b) throw new BrandNotFoundError();
    }
  }
  const updated = await productRepository.update(input.id, input.data);
  await auditRepository.log({
    actorId: input.adminId,
    action: 'UPDATE',
    targetType: 'product',
    targetId: updated.id,
    payload: { changes: input.data },
    ipAddress: input.ipAddress,
    userAgent: input.userAgent,
  });
  return updated;
}
