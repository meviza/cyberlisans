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
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - 29);
    const [salesAgg, linksCount, earnings, recentSales, activeLinks, trendSales, topRows] =
      await Promise.all([
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
        prisma.dealerSale.groupBy({
          by: ['status'],
          where: { dealerId },
          _sum: { commissionAmount: true },
        }),
        prisma.dealerSale.findMany({
          where: { dealerId },
          orderBy: { createdAt: 'desc' },
          take: 8,
          include: {
            link: { select: { code: true } },
            order: {
              select: {
                orderNumber: true,
                currency: true,
                items: { select: { product: { select: { title: true } } } },
              },
            },
          },
        }),
        prisma.dealerLink.findMany({
          where: { dealerId, isActive: true },
          orderBy: { createdAt: 'desc' },
          take: 5,
          include: { product: { select: { id: true, slug: true, title: true } } },
        }),
        prisma.dealerSale.findMany({
          where: { dealerId, createdAt: { gte: start } },
          select: { createdAt: true, grossAmount: true, commissionAmount: true },
        }),
        prisma.dealerSale.findMany({
          where: { dealerId },
          select: {
            grossAmount: true,
            order: {
              select: {
                items: { select: { productId: true, product: { select: { title: true } } } },
              },
            },
          },
        }),
      ]);
    const pending = await prisma.dealerSale.aggregate({
      where: { dealerId, status: 'PENDING' },
      _sum: { commissionAmount: true },
    });
    const pendingCommission = roundCurrency(
      Number(earnings.find((e: any) => e.status === 'PENDING')?._sum.commissionAmount ?? 0),
      'TRY',
    );
    const settledCommission = roundCurrency(
      Number(earnings.find((e: any) => e.status === 'SETTLED')?._sum.commissionAmount ?? 0),
      'TRY',
    );
    const dayMap = new Map<
      string,
      { date: string; amount: number; count: number; commission: number }
    >();
    for (let i = 0; i < 30; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      dayMap.set(key, { date: key, amount: 0, count: 0, commission: 0 });
    }
    for (const sale of trendSales as any[]) {
      const key = sale.createdAt.toISOString().slice(0, 10);
      const row = dayMap.get(key);
      if (row) {
        row.amount += Number(sale.grossAmount ?? 0);
        row.commission += Number(sale.commissionAmount ?? 0);
        row.count += 1;
      }
    }
    const productMap = new Map<
      string,
      { productId: string; productName: string; count: number; gross: number }
    >();
    for (const sale of topRows as any[]) {
      for (const item of sale.order?.items ?? []) {
        const key = item.productId;
        const current = productMap.get(key) ?? {
          productId: key,
          productName: item.product?.title ?? 'Bilinmeyen ürün',
          count: 0,
          gross: 0,
        };
        current.count += 1;
        current.gross += Number(sale.grossAmount ?? 0);
        productMap.set(key, current);
      }
    }
    return {
      totalSales: salesAgg._count._all,
      totalGross: roundCurrency(Number(salesAgg._sum.grossAmount ?? 0), 'TRY'),
      totalDiscount: roundCurrency(Number(salesAgg._sum.discountAmount ?? 0), 'TRY'),
      totalCommission: roundCurrency(Number(salesAgg._sum.commissionAmount ?? 0), 'TRY'),
      totalNet: roundCurrency(Number(salesAgg._sum.netAmount ?? 0), 'TRY'),
      pendingSettlement: roundCurrency(Number(pending._sum.commissionAmount ?? 0), 'TRY'),
      balance: roundCurrency(Number(profile.balance), 'TRY'),
      linksCount,
      pendingCommission,
      settledCommission,
      salesTrend: [...dayMap.values()].map((d) => ({
        date: d.date,
        amount: roundCurrency(d.amount, 'TRY'),
        count: d.count,
      })),
      commissionTrend: [...dayMap.values()].map((d) => ({
        date: d.date,
        amount: roundCurrency(d.commission, 'TRY'),
      })),
      topProducts: [...productMap.values()]
        .sort((a, b) => b.gross - a.gross)
        .slice(0, 5)
        .map((p) => ({ ...p, gross: roundCurrency(p.gross, 'TRY') })),
      recentSales: recentSales.map((s: any) => ({
        id: s.id,
        dealerId: s.dealerId,
        orderId: s.orderId,
        linkId: s.linkId ?? null,
        linkCode: s.link?.code ?? null,
        productName:
          s.order?.items
            ?.map((i: any) => i.product?.title)
            .filter(Boolean)
            .join(', ') ?? null,
        orderNumber: s.order?.orderNumber ?? null,
        currency: s.order?.currency ?? undefined,
        grossAmount: Number(s.grossAmount),
        discountAmount: Number(s.discountAmount ?? 0),
        commissionAmount: Number(s.commissionAmount),
        netAmount: Number(s.netAmount),
        status: s.status,
        settledAt: s.settledAt ?? null,
        createdAt: s.createdAt,
      })),
      activeLinks: activeLinks.map((l: any) => ({
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
      })),
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
