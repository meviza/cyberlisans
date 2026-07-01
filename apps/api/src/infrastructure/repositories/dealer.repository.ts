import { prisma } from '../db';
import { roundCurrency } from '@cyberlisans/payments/currency';
import type {
  IDealerRepository,
  CreateDealerInput,
  DealerListFilter,
  DealerStats,
} from '../../application/ports/repositories';
import type { DealerProfileEntity, DealerStatus } from '../../domain/entities/dealer';

function toEntity(d: any): DealerProfileEntity {
  return {
    id: d.id,
    userId: d.userId,
    companyName: d.companyName,
    taxId: d.taxId,
    taxOffice: d.taxOffice ?? null,
    address: d.address ?? null,
    phone: d.phone ?? null,
    websiteUrl: d.websiteUrl ?? null,
    logoUrl: d.logoUrl ?? null,
    commissionRate: Number(d.commissionRate),
    balance: Number(d.balance),
    status: d.status as DealerStatus,
    approvedById: d.approvedById ?? null,
    approvedAt: d.approvedAt ?? null,
    rejectionReason: d.rejectionReason ?? null,
    notes: d.notes ?? null,
    createdAt: d.createdAt,
    updatedAt: d.updatedAt,
  };
}

export class DealerRepository implements IDealerRepository {
  async findByUserId(userId: string): Promise<DealerProfileEntity | null> {
    const d = await prisma.dealerProfile.findUnique({ where: { userId } });
    return d ? toEntity(d) : null;
  }

  async findById(id: string): Promise<DealerProfileEntity | null> {
    const d = await prisma.dealerProfile.findUnique({ where: { id } });
    return d ? toEntity(d) : null;
  }

  async list(filter: DealerListFilter): Promise<{ items: DealerProfileEntity[]; total: number }> {
    const where: any = {};
    if (filter.status) where.status = filter.status;
    if (filter.search) {
      where.OR = [
        { companyName: { contains: filter.search, mode: 'insensitive' } },
        { taxId: { contains: filter.search } },
        { user: { email: { contains: filter.search, mode: 'insensitive' } } },
        { user: { username: { contains: filter.search, mode: 'insensitive' } } },
      ];
    }
    const [items, total] = await prisma.$transaction([
      prisma.dealerProfile.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (filter.page - 1) * filter.limit,
        take: filter.limit,
        include: { user: { select: { id: true, email: true, username: true, displayName: true } } },
      }),
      prisma.dealerProfile.count({ where }),
    ]);
    return { items: items.map((i: any) => toEntity(i)), total };
  }

  async create(data: CreateDealerInput): Promise<DealerProfileEntity> {
    const d = await prisma.dealerProfile.create({
      data: {
        userId: data.userId,
        companyName: data.companyName,
        taxId: data.taxId,
        taxOffice: data.taxOffice ?? null,
        address: data.address ?? null,
        phone: data.phone ?? null,
        websiteUrl: data.websiteUrl ?? null,
        logoUrl: data.logoUrl ?? null,
        commissionRate: data.commissionRate ?? 10.0,
        status: 'PENDING',
      },
    });
    return toEntity(d);
  }

  async update(
    id: string,
    data: Partial<{
      companyName: string;
      taxOffice: string | null;
      address: string | null;
      phone: string | null;
      websiteUrl: string | null;
      logoUrl: string | null;
      notes: string | null;
      commissionRate: number;
    }>,
  ): Promise<DealerProfileEntity> {
    const d = await prisma.dealerProfile.update({ where: { id }, data });
    return toEntity(d);
  }

  async setStatus(
    id: string,
    status: DealerStatus,
    extras?: { approvedById?: string; rejectionReason?: string },
  ): Promise<DealerProfileEntity> {
    const data: any = { status };
    if (status === 'APPROVED') {
      data.approvedById = extras?.approvedById ?? null;
      data.approvedAt = new Date();
      data.rejectionReason = null;
    }
    if (status === 'REJECTED') {
      data.rejectionReason = extras?.rejectionReason ?? null;
    }
    const d = await prisma.dealerProfile.update({ where: { id }, data });
    return toEntity(d);
  }

  async delete(id: string): Promise<void> {
    await prisma.dealerProfile.delete({ where: { id } });
  }

  async getStats(dealerId: string): Promise<DealerStats> {
    const profile = await prisma.dealerProfile.findUnique({ where: { id: dealerId } });
    if (!profile) {
      return {
        totalSales: 0,
        totalGross: 0,
        totalDiscount: 0,
        totalCommission: 0,
        totalNet: 0,
        pendingSettlement: 0,
        balance: 0,
        linksCount: 0,
      };
    }
    const [salesAgg, linksCount] = await Promise.all([
      prisma.dealerSale.aggregate({
        where: { dealerId },
        _count: { _all: true },
        _sum: {
          grossAmount: true,
          discountAmount: true,
          commissionAmount: true,
          netAmount: true,
        },
      }),
      prisma.dealerLink.count({ where: { dealerId } }),
    ]);
    const pending = await prisma.dealerSale.aggregate({
      where: { dealerId, status: 'PENDING' },
      _sum: { commissionAmount: true },
    });
    return {
      totalSales: salesAgg._count._all,
      totalGross: roundCurrency(Number(salesAgg._sum.grossAmount ?? 0), 'TRY'),
      totalDiscount: roundCurrency(Number(salesAgg._sum.discountAmount ?? 0), 'TRY'),
      totalCommission: roundCurrency(Number(salesAgg._sum.commissionAmount ?? 0), 'TRY'),
      totalNet: roundCurrency(Number(salesAgg._sum.netAmount ?? 0), 'TRY'),
      pendingSettlement: roundCurrency(Number(pending._sum.commissionAmount ?? 0), 'TRY'),
      balance: roundCurrency(Number(profile.balance), 'TRY'),
      linksCount,
    };
  }

  async incrementBalance(dealerId: string, amount: number): Promise<void> {
    const rounded = roundCurrency(amount, 'TRY');
    await prisma.dealerProfile.update({
      where: { id: dealerId },
      data: { balance: { increment: rounded } },
    });
  }

  async decrementBalance(dealerId: string, amount: number): Promise<void> {
    const rounded = roundCurrency(amount, 'TRY');
    const current = await prisma.dealerProfile.findUnique({ where: { id: dealerId } });
    if (!current) throw new Error('DEALER_NOT_FOUND');
    if (Number(current.balance) < rounded) throw new Error('DEALER_INSUFFICIENT_BALANCE');
    await prisma.dealerProfile.update({
      where: { id: dealerId },
      data: { balance: { decrement: rounded } },
    });
  }
}

export const dealerRepository = new DealerRepository();
