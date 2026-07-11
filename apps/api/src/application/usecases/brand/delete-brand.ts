import { brandRepository } from '../../../infrastructure/repositories/brand.repository';
import { auditRepository } from '../../../infrastructure/repositories/audit.repository';
import { BrandNotFoundError } from '../../../domain/errors/product';

export interface DeleteBrandUseCaseInput {
  id: string;
  adminId: string;
  ipAddress?: string;
  userAgent?: string;
}

export async function deleteBrand(input: DeleteBrandUseCaseInput) {
  const existing = await brandRepository.findById(input.id);
  if (!existing) throw new BrandNotFoundError();
  await brandRepository.delete(input.id);
  await auditRepository.log({
    actorId: input.adminId,
    action: 'DELETE',
    targetType: 'brand',
    targetId: input.id,
    payload: { slug: existing.slug },
    ipAddress: input.ipAddress,
    userAgent: input.userAgent,
  });
  return { id: input.id, deleted: true };
}
