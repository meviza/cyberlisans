import { prisma } from '../db';
import { roundCurrency } from '@cyberlisans/payments/currency';
import type {
  IDealerSaleRepository,
  CreateDealerSaleInput,
} from '../../application/ports/repositories';
import type { DealerSaleEntity, DealerSaleStatus } from '../../domain/entities/dealer';

function toEntity(s: any): DealerSaleEntity {
  return {
    id: s.id,
    dealerId: s.dealerId,
    orderId: s.orderId,
    linkId: s.linkId ?? null,
    grossAmount: Number(s.grossAmount),
    discountAmount: Number(s.discountAmount ?? 0),
    commissionAmount: Number(s.commissionAmount),
    netAmount: Number(s.netAmount),
    status: s.status as DealerSaleStatus,
    settledAt: s.settledAt ?? null,
    createdAt: s.createdAt,
  };
}

export class DealerSaleRepository implements IDealerSaleRepository {
  async listByDealer(
    dealerId: string,
    options: { status?: DealerSaleStatus; page: number; limit: number },
  ): Promise<{ items: DealerSaleEntity[]; total: number }> {
    const where: any = { dealerId };
    if (options.status) where.status = options.status;
    const [items, total] = await prisma.$transaction([
      prisma.dealerSale.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (options.page - 1) * options.limit,
        take: options.limit,
        include: {
          order: { select: { id: true, orderNumber: true, totalAmount: true, currency: true } },
        },
      }),
      prisma.dealerSale.count({ where }),
    ]);
    return { items: items.map((i: any) => toEntity(i)), total };
  }

  async listByOrder(orderId: string): Promise<DealerSaleEntity | null> {
    const s = await prisma.dealerSale.findUnique({ where: { orderId } });
    return s ? toEntity(s) : null;
  }

  async create(data: CreateDealerSaleInput): Promise<DealerSaleEntity> {
    const s = await prisma.dealerSale.create({
      data: {
        dealerId: data.dealerId,
        orderId: data.orderId,
        linkId: data.linkId,
        grossAmount: data.grossAmount,
        discountAmount: data.discountAmount,
        commissionAmount: data.commissionAmount,
        netAmount: data.netAmount,
      },
    });
    return toEntity(s);
  }

  async getTotalEarnings(
    dealerId: string,
  ): Promise<{ commission: number; pending: number; settled: number }> {
    const [pending, settled] = await prisma.$transaction([
      prisma.dealerSale.aggregate({
        where: { dealerId, status: 'PENDING' },
        _sum: { commissionAmount: true },
      }),
      prisma.dealerSale.aggregate({
        where: { dealerId, status: 'SETTLED' },
        _sum: { commissionAmount: true },
      }),
    ]);
    const p = roundCurrency(Number(pending._sum.commissionAmount ?? 0), 'TRY');
    const st = roundCurrency(Number(settled._sum.commissionAmount ?? 0), 'TRY');
    return { commission: p + st, pending: p, settled: st };
  }

  async getPendingSettlement(dealerId: string): Promise<number> {
    const agg = await prisma.dealerSale.aggregate({
      where: { dealerId, status: 'PENDING' },
      _sum: { commissionAmount: true },
    });
    return roundCurrency(Number(agg._sum.commissionAmount ?? 0), 'TRY');
  }

  async markSettled(saleId: string): Promise<void> {
    await prisma.dealerSale.update({
      where: { id: saleId },
      data: { status: 'SETTLED', settledAt: new Date() },
    });
  }

  async markRefunded(orderId: string): Promise<void> {
    await prisma.dealerSale.updateMany({
      where: { orderId },
      data: { status: 'REFUNDED' },
    });
  }
}

export const dealerSaleRepository = new DealerSaleRepository();
