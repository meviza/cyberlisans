import { brandRepository } from '../../../infrastructure/repositories/brand.repository';
import { auditRepository } from '../../../infrastructure/repositories/audit.repository';
import { BrandSlugTakenError } from '../../errors/product';

export interface CreateBrandUseCaseInput {
  adminId: string;
  slug: string;
  name: string;
  logoUrl?: string | null;
  websiteUrl?: string | null;
  isActive?: boolean;
  ipAddress?: string;
  userAgent?: string;
}

export async function createBrand(input: CreateBrandUseCaseInput) {
  const existing = await brandRepository.findBySlug(input.slug);
  if (existing) throw new BrandSlugTakenError();
  const brand = await brandRepository.create({
    slug: input.slug,
    name: input.name,
    logoUrl: input.logoUrl ?? null,
    websiteUrl: input.websiteUrl ?? null,
    isActive: input.isActive ?? true,
  });
  await auditRepository.log({
    actorId: input.adminId,
    action: 'CREATE',
    targetType: 'brand',
    targetId: brand.id,
    payload: { slug: brand.slug },
    ipAddress: input.ipAddress,
    userAgent: input.userAgent,
  });
  return brand;
}
