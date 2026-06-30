import { prisma } from '../db';
import type { ICategoryRepository } from '../../application/ports/repositories';
import type { CategoryEntity } from '../../domain/entities/product';

function toEntity(c: any): CategoryEntity {
  return {
    id: c.id,
    slug: c.slug,
    name: c.name,
    nameEn: c.nameEn ?? null,
    nameDe: c.nameDe ?? null,
    nameAr: c.nameAr ?? null,
    nameRu: c.nameRu ?? null,
    icon: c.icon ?? null,
    description: c.description ?? null,
    sortOrder: c.sortOrder,
    isActive: c.isActive,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  };
}

export class CategoryRepository implements ICategoryRepository {
  async list(filter: { isActive?: boolean }): Promise<CategoryEntity[]> {
    const items = await prisma.category.findMany({
      where: { isActive: filter.isActive },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });
    return items.map(toEntity);
  }

  async findById(id: string): Promise<CategoryEntity | null> {
    const c = await prisma.category.findUnique({ where: { id } });
    return c ? toEntity(c) : null;
  }

  async findBySlug(slug: string): Promise<CategoryEntity | null> {
    const c = await prisma.category.findUnique({ where: { slug } });
    return c ? toEntity(c) : null;
  }

  async create(data: {
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
  }): Promise<CategoryEntity> {
    const c = await prisma.category.create({
      data: {
        slug: data.slug,
        name: data.name,
        nameEn: data.nameEn ?? null,
        nameDe: data.nameDe ?? null,
        nameAr: data.nameAr ?? null,
        nameRu: data.nameRu ?? null,
        icon: data.icon ?? null,
        description: data.description ?? null,
        sortOrder: data.sortOrder ?? 0,
        isActive: data.isActive ?? true,
      },
    });
    return toEntity(c);
  }

  async update(id: string, data: Partial<CategoryEntity>): Promise<CategoryEntity> {
    const c = await prisma.category.update({ where: { id }, data });
    return toEntity(c);
  }

  async delete(id: string): Promise<void> {
    await prisma.category.delete({ where: { id } });
  }
}

export const categoryRepository = new CategoryRepository();
