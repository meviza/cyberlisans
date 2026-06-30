import { productRepository } from '../../../infrastructure/repositories/product.repository';
import { categoryRepository } from '../../../infrastructure/repositories/category.repository';
import { brandRepository } from '../../../infrastructure/repositories/brand.repository';
import { auditRepository } from '../../../infrastructure/repositories/audit.repository';
import {
  ProductSlugTakenError,
  CategoryNotFoundError,
  BrandNotFoundError,
} from '../../errors/product';
import type { CreateProductInput } from '../../../application/ports/repositories';

export interface CreateProductUseCaseInput extends CreateProductInput {
  adminId: string;
  ipAddress?: string;
  userAgent?: string;
}

export async function createProduct(input: CreateProductUseCaseInput) {
  const existing = await productRepository.findBySlug(input.slug);
  if (existing) throw new ProductSlugTakenError();
  const category = await categoryRepository.findById(input.categoryId);
  if (!category) throw new CategoryNotFoundError();
  if (input.brandId) {
    const brand = await brandRepository.findById(input.brandId);
    if (!brand) throw new BrandNotFoundError();
  }
  const product = await productRepository.create({
    categoryId: input.categoryId,
    brandId: input.brandId ?? null,
    slug: input.slug,
    title: input.title,
    description: input.description ?? null,
    imageUrl: input.imageUrl ?? null,
    modelUrl: input.modelUrl ?? null,
    priceTry: input.priceTry,
    priceUsd: input.priceUsd,
    priceEur: input.priceEur,
    priceUsdt: input.priceUsdt,
    stock: input.stock,
    deliveryType: input.deliveryType,
    isActive: input.isActive ?? true,
    isFeatured: input.isFeatured ?? false,
    tags: input.tags ?? [],
    metadata: input.metadata ?? null,
    sortOrder: input.sortOrder ?? 0,
  });
  await auditRepository.log({
    actorId: input.adminId,
    action: 'CREATE',
    targetType: 'product',
    targetId: product.id,
    payload: { slug: product.slug, title: product.title },
    ipAddress: input.ipAddress,
    userAgent: input.userAgent,
  });
  return product;
}
