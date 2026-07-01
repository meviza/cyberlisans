import { prisma } from '../../../infrastructure/db';
import { roundCurrency } from '@cyberlisans/payments/currency';
import { dealerRepository } from '../../../infrastructure/repositories/dealer.repository';
import { dealerLinkRepository } from '../../../infrastructure/repositories/dealer-link.repository';
import { dealerSaleRepository } from '../../../infrastructure/repositories/dealer-sale.repository';
import { orderRepository } from '../../../infrastructure/repositories/order.repository';
import { auditRepository } from '../../../infrastructure/repositories/audit.repository';
import { DealerNotFoundError, DealerSaleExistsError } from '../../errors/dealer';

export interface RecordDealerSaleInput {
  orderId: string;
  refCode?: string | null;
}

const MAX_RETRIES = 5;

export async function recordDealerSale(input: RecordDealerSaleInput) {
  const order = await orderRepository.findById(input.orderId, true);
  if (!order) return null;
  if (order.status !== 'PAID' && order.status !== 'FULFILLED') return null;
  const existing = await dealerSaleRepository.listByOrder(order.id);
  if (existing) return existing;

  const refCode = input.refCode ?? order.refCode ?? null;
  let dealerId: string | null = null;
  let linkId: string | null = null;
  let discountAmount = 0;
  let discountPercent = 0;

  if (refCode) {
    const link = await dealerLinkRepository.findByCode(refCode);
    if (
      link &&
      link.isActive &&
      (!link.expiresAt || link.expiresAt.getTime() >= Date.now()) &&
      (link.maxUses === null || link.currentUses < link.maxUses) &&
      (link.productId === null || order.items?.some((it) => it.productId === link.productId))
    ) {
      const profile = await dealerRepository.findById(link.dealerId);
      if (profile && profile.status === 'APPROVED') {
        dealerId = profile.id;
        linkId = link.id;
        discountPercent = link.discountPercent;
        for (const it of order.items ?? []) {
          if (link.productId === null || link.productId === it.productId) {
            discountAmount += roundCurrency(
              (it.totalPrice * link.discountPercent) / 100,
              order.currency,
            );
          }
        }
      }
    }
  }
  if (!dealerId) return null;

  const profile = await dealerRepository.findById(dealerId);
  if (!profile) throw new DealerNotFoundError();

  const grossAmount = Number(order.totalAmount);
  const netAmount = roundCurrency(grossAmount - discountAmount, order.currency);
  const commissionAmount = roundCurrency(
    (netAmount * Number(profile.commissionRate)) / 100,
    order.currency,
  );

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const result = await prisma.$transaction(
        async (tx: typeof prisma) => {
          const dup = await tx.dealerSale.findUnique({ where: { orderId: order.id } });
          if (dup) return { sale: dup, created: false };
          const sale = await tx.dealerSale.create({
            data: {
              dealerId,
              orderId: order.id,
              linkId,
              grossAmount,
              discountAmount,
              commissionAmount,
              netAmount,
            },
          });
          await tx.dealerProfile.update({
            where: { id: dealerId! },
            data: { balance: { increment: commissionAmount } },
          });
          if (linkId) {
            await tx.dealerLink.update({
              where: { id: linkId },
              data: { currentUses: { increment: 1 } },
            });
          }
          return { sale, created: true };
        },
        { isolationLevel: 'Serializable' },
      );
      if (!result.created) {
        const existingSale = await dealerSaleRepository.listByOrder(order.id);
        return existingSale;
      }
      await auditRepository.log({
        actorId: null,
        action: 'CREATE',
        targetType: 'dealer_sale',
        targetId: result.sale.id,
        payload: {
          dealerId,
          orderId: order.id,
          commissionAmount,
          grossAmount,
          discountAmount,
        },
      });
      const sale = await dealerSaleRepository.listByOrder(order.id);
      return sale;
    } catch (err: any) {
      if (err instanceof DealerNotFoundError) throw err;
      if (err?.code === 'P2002') {
        const ex = await dealerSaleRepository.listByOrder(order.id);
        if (ex) return ex;
        throw new DealerSaleExistsError();
      }
      if (err?.code === 'P2034' && attempt < MAX_RETRIES - 1) continue;
      throw err;
    }
  }
  throw new Error('DEALER_SALE_RECORD_FAILED');
}
