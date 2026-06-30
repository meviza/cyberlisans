import { prisma } from '../db';
import type { IBrandRepository } from '../../application/ports/repositories';
import type { BrandEntity } from '../../domain/entities/product';

function toEntity(b: any): BrandEntity {
  return {
    id: b.id,
    slug: b.slug,
    name: b.name,
    logoUrl: b.logoUrl ?? null,
    websiteUrl: b.websiteUrl ?? null,
    isActive: b.isActive,
    createdAt: b.createdAt,
    updatedAt: b.updatedAt,
  };
}

export class BrandRepository implements IBrandRepository {
  async list(filter: { isActive?: boolean }): Promise<BrandEntity[]> {
    const items = await prisma.brand.findMany({
      where: { isActive: filter.isActive },
      orderBy: [{ name: 'asc' }],
    });
    return items.map(toEntity);
  }

  async findById(id: string): Promise<BrandEntity | null> {
    const b = await prisma.brand.findUnique({ where: { id } });
    return b ? toEntity(b) : null;
  }

  async findBySlug(slug: string): Promise<BrandEntity | null> {
    const b = await prisma.brand.findUnique({ where: { slug } });
    return b ? toEntity(b) : null;
  }

  async create(data: {
    slug: string;
    name: string;
    logoUrl?: string | null;
    websiteUrl?: string | null;
    isActive?: boolean;
  }): Promise<BrandEntity> {
    const b = await prisma.brand.create({
      data: {
        slug: data.slug,
        name: data.name,
        logoUrl: data.logoUrl ?? null,
        websiteUrl: data.websiteUrl ?? null,
        isActive: data.isActive ?? true,
      },
    });
    return toEntity(b);
  }

  async update(id: string, data: Partial<BrandEntity>): Promise<BrandEntity> {
    const b = await prisma.brand.update({ where: { id }, data });
    return toEntity(b);
  }

  async delete(id: string): Promise<void> {
    await prisma.brand.delete({ where: { id } });
  }
}

export const brandRepository = new BrandRepository();
