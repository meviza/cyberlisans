import { productRepository } from '../../../infrastructure/repositories/product.repository';
import { categoryRepository } from '../../../infrastructure/repositories/category.repository';
import { brandRepository } from '../../../infrastructure/repositories/brand.repository';
import type { ProductListOptions, ProductSort } from '../../../application/ports/repositories';
import type { Currency } from '../../../domain/entities/wallet';

export interface ListProductsInput {
  category?: string;
  brand?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  currency?: Currency;
  sort?: ProductSort;
  page?: number;
  limit?: number;
  tags?: string[];
}

export async function listProducts(input: ListProductsInput = {}) {
  const page = Math.max(1, input.page ?? 1);
  const limit = Math.min(100, Math.max(1, input.limit ?? 24));
  const filter: ProductListOptions['filter'] = {
    isActive: input.isActive ?? true,
  };
  if (input.isFeatured !== undefined) filter.isFeatured = input.isFeatured;
  if (input.search) filter.search = input.search;
  if (input.minPrice !== undefined) filter.minPrice = input.minPrice;
  if (input.maxPrice !== undefined) filter.maxPrice = input.maxPrice;
  if (input.currency) filter.currency = input.currency;
  if (input.tags && input.tags.length > 0) filter.tags = input.tags;
  if (input.category) {
    const cat = await categoryRepository.findBySlug(input.category);
    if (cat) filter.categoryId = cat.id;
    else filter.categorySlug = input.category;
  }
  if (input.brand) {
    const b = await brandRepository.findBySlug(input.brand);
    if (b) filter.brandId = b.id;
    else filter.brandSlug = input.brand;
  }
  const result = await productRepository.list({
    filter,
    sort: input.sort ?? 'newest',
    page,
    limit,
  });
  return {
    items: result.items,
    total: result.total,
    page,
    limit,
    totalPages: Math.ceil(result.total / limit) || 1,
  };
}
