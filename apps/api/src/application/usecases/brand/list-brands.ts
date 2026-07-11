import { brandRepository } from '../../../infrastructure/repositories/brand.repository';

export interface ListBrandsInput {
  isActive?: boolean;
}

export async function listBrands(input: ListBrandsInput = {}) {
  return brandRepository.list({ isActive: input.isActive ?? true });
}
