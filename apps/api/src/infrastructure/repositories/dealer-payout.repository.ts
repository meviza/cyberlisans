import { prisma } from '../db';
import type {
  IDealerPayoutRepository,
  CreateDealerPayoutInput,
} from '../../application/ports/repositories';
import type { DealerPayoutEntity, DealerPayoutStatus } from '../../domain/entities/dealer';
import type { Currency } from '../../domain/entities/wallet';

function toEntity(p: any): DealerPayoutEntity {
  return {
    id: p.id,
    dealerId: p.dealerId,
    userId: p.userId,
    amount: Number(p.amount),
    currency: p.currency as Currency,
    method: p.method,
    destination: p.destination,
    status: p.status as DealerPayoutStatus,
    processedById: p.processedById ?? null,
    processedAt: p.processedAt ?? null,
    rejectionReason: p.rejectionReason ?? null,
    notes: p.notes ?? null,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  };
}

export class DealerPayoutRepository implements IDealerPayoutRepository {
  async create(data: CreateDealerPayoutInput): Promise<DealerPayoutEntity> {
    const p = await prisma.dealerPayout.create({
      data: {
        dealerId: data.dealerId,
        userId: data.userId,
        amount: data.amount,
        currency: data.currency,
        method: data.method,
        destination: data.destination,
        notes: data.notes ?? null,
        status: 'PENDING',
      },
    });
    return toEntity(p);
  }

  async findById(id: string): Promise<DealerPayoutEntity | null> {
    const p = await prisma.dealerPayout.findUnique({ where: { id } });
    return p ? toEntity(p) : null;
  }

  async listByDealer(
    dealerId: string,
    options: { status?: DealerPayoutStatus; page: number; limit: number },
  ): Promise<{ items: DealerPayoutEntity[]; total: number }> {
    const where: any = { dealerId };
    if (options.status) where.status = options.status;
    const [items, total] = await prisma.$transaction([
      prisma.dealerPayout.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (options.page - 1) * options.limit,
        take: options.limit,
      }),
      prisma.dealerPayout.count({ where }),
    ]);
    return { items: items.map((i: any) => toEntity(i)), total };
  }

  async listAll(options: {
    status?: DealerPayoutStatus;
    page: number;
    limit: number;
  }): Promise<{ items: DealerPayoutEntity[]; total: number }> {
    const where: any = {};
    if (options.status) where.status = options.status;
    const [items, total] = await prisma.$transaction([
      prisma.dealerPayout.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (options.page - 1) * options.limit,
        take: options.limit,
        include: { dealer: { select: { id: true, companyName: true } } },
      }),
      prisma.dealerPayout.count({ where }),
    ]);
    return { items: items.map((i: any) => toEntity(i)), total };
  }

  async updateStatus(
    id: string,
    status: DealerPayoutStatus,
    extras?: { processedById?: string; rejectionReason?: string },
  ): Promise<DealerPayoutEntity> {
    const data: any = { status };
    if (status === 'COMPLETED' || status === 'REJECTED' || status === 'PROCESSING') {
      data.processedById = extras?.processedById ?? null;
      data.processedAt = new Date();
    }
    if (status === 'REJECTED') {
      data.rejectionReason = extras?.rejectionReason ?? null;
    }
    const p = await prisma.dealerPayout.update({ where: { id }, data });
    return toEntity(p);
  }
}

export const dealerPayoutRepository = new DealerPayoutRepository();
