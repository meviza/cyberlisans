import { categoryRepository } from '../../../infrastructure/repositories/category.repository';

export interface ListCategoriesInput {
  isActive?: boolean;
}

export async function listCategories(input: ListCategoriesInput = {}) {
  return categoryRepository.list({ isActive: input.isActive ?? true });
}
