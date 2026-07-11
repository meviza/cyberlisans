import { categoryRepository } from '../../../infrastructure/repositories/category.repository';
import { auditRepository } from '../../../infrastructure/repositories/audit.repository';
import { CategoryNotFoundError, CategorySlugTakenError } from '../../../domain/errors/product';
import type { CategoryEntity } from '../../../domain/entities/product';

export interface UpdateCategoryUseCaseInput {
  id: string;
  adminId: string;
  data: Partial<CategoryEntity>;
  ipAddress?: string;
  userAgent?: string;
}

export async function updateCategory(input: UpdateCategoryUseCaseInput) {
  const existing = await categoryRepository.findById(input.id);
  if (!existing) throw new CategoryNotFoundError();
  if (input.data.slug && input.data.slug !== existing.slug) {
    const taken = await categoryRepository.findBySlug(input.data.slug);
    if (taken) throw new CategorySlugTakenError();
  }
  const updated = await categoryRepository.update(input.id, input.data);
  await auditRepository.log({
    actorId: input.adminId,
    action: 'UPDATE',
    targetType: 'category',
    targetId: updated.id,
    payload: { changes: input.data },
    ipAddress: input.ipAddress,
    userAgent: input.userAgent,
  });
  return updated;
}
