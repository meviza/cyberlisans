import { brandRepository } from '../../../infrastructure/repositories/brand.repository';
import { auditRepository } from '../../../infrastructure/repositories/audit.repository';
import { BrandNotFoundError, BrandSlugTakenError } from '../../errors/product';
import type { BrandEntity } from '../../../domain/entities/product';

export interface UpdateBrandUseCaseInput {
  id: string;
  adminId: string;
  data: Partial<BrandEntity>;
  ipAddress?: string;
  userAgent?: string;
}

export async function updateBrand(input: UpdateBrandUseCaseInput) {
  const existing = await brandRepository.findById(input.id);
  if (!existing) throw new BrandNotFoundError();
  if (input.data.slug && input.data.slug !== existing.slug) {
    const taken = await brandRepository.findBySlug(input.data.slug);
    if (taken) throw new BrandSlugTakenError();
  }
  const updated = await brandRepository.update(input.id, input.data);
  await auditRepository.log({
    actorId: input.adminId,
    action: 'UPDATE',
    targetType: 'brand',
    targetId: updated.id,
    payload: { changes: input.data },
    ipAddress: input.ipAddress,
    userAgent: input.userAgent,
  });
  return updated;
}
