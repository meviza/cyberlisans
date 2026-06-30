import { prisma } from '../../../infrastructure/db';
import { orderRepository } from '../../../infrastructure/repositories/order.repository';
import { auditRepository } from '../../../infrastructure/repositories/audit.repository';
import { OrderNotFoundError, OrderNotPendingError } from '../../errors/wallet';

export interface FulfillOrderInput {
  orderId: string;
  userId: string;
  ipAddress?: string;
  userAgent?: string;
}

export async function fulfillOrder(input: FulfillOrderInput) {
  const order = await orderRepository.findById(input.orderId, true);
  if (!order) throw new OrderNotFoundError();
  if (order.status === 'FULFILLED') {
    return { order, idempotent: true };
  }
  if (order.status !== 'PAID') {
    throw new OrderNotPendingError();
  }

  await prisma.$transaction(async (tx: typeof prisma) => {
    for (const item of order.items ?? []) {
      if (item.productKeyId) {
        await tx.productKey.update({
          where: { id: item.productKeyId },
          data: {
            isUsed: true,
            usedById: input.userId,
            usedAt: new Date(),
            reservedAt: null,
            reservedFor: null,
          },
        });
      }
    }
  });

  const updated = await orderRepository.markFulfilled(order.id);
  await auditRepository.log({
    actorId: input.userId,
    action: 'UPDATE',
    targetType: 'order',
    targetId: order.id,
    payload: { status: 'FULFILLED' },
    ipAddress: input.ipAddress,
    userAgent: input.userAgent,
  });
  return { order: updated, idempotent: false };
}
