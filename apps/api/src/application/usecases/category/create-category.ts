import { categoryRepository } from '../../../infrastructure/repositories/category.repository';
import { auditRepository } from '../../../infrastructure/repositories/audit.repository';
import { CategorySlugTakenError } from '../../../domain/errors/product';

export interface CreateCategoryUseCaseInput {
  adminId: string;
  slug: string;
  name: string;
  nameEn?: string | null;
  nameDe?: string | null;
  nameAr?: string | null;
  nameRu?: string | null;
  icon?: string | null;
  description?: string | null;
  sortOrder?: number;
  isActive?: boolean;
  ipAddress?: string;
  userAgent?: string;
}

export async function createCategory(input: CreateCategoryUseCaseInput) {
  const existing = await categoryRepository.findBySlug(input.slug);
  if (existing) throw new CategorySlugTakenError();
  const category = await categoryRepository.create({
    slug: input.slug,
    name: input.name,
    nameEn: input.nameEn ?? null,
    nameDe: input.nameDe ?? null,
    nameAr: input.nameAr ?? null,
    nameRu: input.nameRu ?? null,
    icon: input.icon ?? null,
    description: input.description ?? null,
    sortOrder: input.sortOrder ?? 0,
    isActive: input.isActive ?? true,
  });
  await auditRepository.log({
    actorId: input.adminId,
    action: 'CREATE',
    targetType: 'category',
    targetId: category.id,
    payload: { slug: category.slug },
    ipAddress: input.ipAddress,
    userAgent: input.userAgent,
  });
  return category;
}
