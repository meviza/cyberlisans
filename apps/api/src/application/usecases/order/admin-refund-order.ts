import { prisma } from '../../../infrastructure/db';
import { orderRepository } from '../../../infrastructure/repositories/order.repository';
import { auditRepository } from '../../../infrastructure/repositories/audit.repository';
import { OrderNotFoundError } from '../../../domain/errors/wallet';
import type { Currency } from '../../../domain/entities/wallet';

export interface AdminRefundOrderInput {
  orderId: string;
  adminId: string;
  amount: number;
  reason: string;
  ipAddress?: string;
  userAgent?: string;
}

export async function adminRefundOrder(input: AdminRefundOrderInput) {
  const order = await orderRepository.findById(input.orderId, true);
  if (!order) throw new OrderNotFoundError();
  if (order.status === 'REFUNDED') {
    return { order, idempotent: true };
  }
  if (order.status !== 'PAID' && order.status !== 'FULFILLED') {
    return { ok: false as const, reason: 'NOT_REFUNDABLE' as const, order };
  }
  if (input.amount <= 0 || input.amount > order.totalAmount + 0.01) {
    return { ok: false as const, reason: 'INVALID_AMOUNT' as const, order };
  }

  const updated = await orderRepository.updateStatus(order.id, 'REFUNDED', {
    refundedAt: new Date(),
  });

  try {
    const wallet = await prisma.wallet.findUnique({ where: { userId: order.userId } });
    if (wallet) {
      await prisma.walletTransaction.create({
        data: {
          userId: order.userId,
          type: 'REFUND',
          currency: order.currency as Currency,
          amount: input.amount,
          balanceAfter:
            (Number(
              (
                {
                  TRY: wallet.balanceTry,
                  USD: wallet.balanceUsd,
                  EUR: wallet.balanceEur,
                  USDT: wallet.balanceUsdt,
                } as Record<Currency, unknown>
              )[order.currency as Currency] ?? 0,
            ) ?? 0) + input.amount,
          referenceType: 'order',
          referenceId: order.id,
          description: input.reason,
        },
      });
      const field = (
        {
          TRY: 'balanceTry',
          USD: 'balanceUsd',
          EUR: 'balanceEur',
          USDT: 'balanceUsdt',
        } as const
      )[order.currency as Currency];
      await prisma.wallet.update({
        where: { id: wallet.id },
        data: { [field]: { increment: input.amount } },
      });
    }
  } catch (err) {
    console.error('[ADMIN REFUND WALLET ERROR]', err);
  }

  await auditRepository.log({
    actorId: input.adminId,
    targetUserId: order.userId,
    action: 'BALANCE_CHANGE',
    targetType: 'order',
    targetId: order.id,
    payload: {
      operation: 'refund',
      amount: input.amount,
      currency: order.currency,
      reason: input.reason,
    },
    ipAddress: input.ipAddress,
    userAgent: input.userAgent,
  });

  return { ok: true as const, order: updated };
}
