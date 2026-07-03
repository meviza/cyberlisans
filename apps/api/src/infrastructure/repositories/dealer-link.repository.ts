import { prisma } from '../db';
import type {
  IDealerLinkRepository,
  CreateDealerLinkInput,
} from '../../application/ports/repositories';
import type { DealerLinkEntity } from '../../domain/entities/dealer';

function toEntity(l: any): DealerLinkEntity {
  return {
    id: l.id,
    dealerId: l.dealerId,
    code: l.code,
    productId: l.productId ?? null,
    productName: l.product?.title ?? null,
    productSlug: l.product?.slug ?? null,
    discountPercent: l.discountPercent,
    maxUses: l.maxUses ?? null,
    currentUses: l.currentUses,
    clicks: l.clicks,
    isActive: l.isActive,
    expiresAt: l.expiresAt ?? null,
    createdAt: l.createdAt,
  };
}

export class DealerLinkRepository implements IDealerLinkRepository {
  async listByDealer(
    dealerId: string,
    options: { page: number; limit: number; isActive?: boolean },
  ): Promise<{ items: DealerLinkEntity[]; total: number }> {
    const where: Record<string, unknown> = { dealerId };
    if (options.isActive !== undefined) where['isActive'] = options.isActive;
    const [items, total] = await prisma.$transaction([
      prisma.dealerLink.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (options.page - 1) * options.limit,
        take: options.limit,
        include: { product: { select: { id: true, slug: true, title: true } } },
      }),
      prisma.dealerLink.count({ where }),
    ]);
    return { items: items.map((i: any) => toEntity(i)), total };
  }

  async findById(id: string): Promise<DealerLinkEntity | null> {
    const l = await prisma.dealerLink.findUnique({
      where: { id },
      include: { product: { select: { id: true, slug: true, title: true } } },
    });
    return l ? toEntity(l) : null;
  }

  async findByCode(code: string): Promise<DealerLinkEntity | null> {
    const l = await prisma.dealerLink.findUnique({
      where: { code },
      include: { product: { select: { id: true, slug: true, title: true } } },
    });
    return l ? toEntity(l) : null;
  }

  async create(data: CreateDealerLinkInput): Promise<DealerLinkEntity> {
    const l = await prisma.dealerLink.create({
      data: {
        dealerId: data.dealerId,
        code: data.code,
        productId: data.productId ?? null,
        discountPercent: data.discountPercent ?? 0,
        maxUses: data.maxUses ?? null,
        expiresAt: data.expiresAt ?? null,
      },
    });
    return toEntity(l);
  }

  async update(
    id: string,
    data: Partial<{
      discountPercent: number;
      maxUses: number | null;
      isActive: boolean;
      expiresAt: Date | null;
      productId: string | null;
    }>,
  ): Promise<DealerLinkEntity> {
    const l = await prisma.dealerLink.update({
      where: { id },
      data,
      include: { product: { select: { id: true, slug: true, title: true } } },
    });
    return toEntity(l);
  }

  async delete(id: string): Promise<void> {
    await prisma.dealerLink.delete({ where: { id } });
  }

  async incrementUses(id: string): Promise<void> {
    await prisma.dealerLink.update({
      where: { id },
      data: { currentUses: { increment: 1 } },
    });
  }

  async incrementClicks(id: string): Promise<void> {
    await prisma.dealerLink.update({
      where: { id },
      data: { clicks: { increment: 1 } },
    });
  }
}

export const dealerLinkRepository = new DealerLinkRepository();
