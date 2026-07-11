import { categoryRepository } from '../../../infrastructure/repositories/category.repository';
import { auditRepository } from '../../../infrastructure/repositories/audit.repository';
import { CategoryNotFoundError } from '../../../domain/errors/product';

export interface DeleteCategoryUseCaseInput {
  id: string;
  adminId: string;
  ipAddress?: string;
  userAgent?: string;
}

export async function deleteCategory(input: DeleteCategoryUseCaseInput) {
  const existing = await categoryRepository.findById(input.id);
  if (!existing) throw new CategoryNotFoundError();
  await categoryRepository.delete(input.id);
  await auditRepository.log({
    actorId: input.adminId,
    action: 'DELETE',
    targetType: 'category',
    targetId: input.id,
    payload: { slug: existing.slug },
    ipAddress: input.ipAddress,
    userAgent: input.userAgent,
  });
  return { id: input.id, deleted: true };
}
