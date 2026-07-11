import { prisma } from '../../../infrastructure/db';
import { orderRepository } from '../../../infrastructure/repositories/order.repository';
import { auditRepository } from '../../../infrastructure/repositories/audit.repository';
import { OrderNotFoundError } from '../../../domain/errors/wallet';
import { OrderNotCancellableError } from '../../../domain/errors/product';

export interface CancelOrderInput {
  orderId: string;
  userId: string;
  isAdmin: boolean;
  ipAddress?: string;
  userAgent?: string;
}

export async function cancelOrder(input: CancelOrderInput) {
  const order = input.isAdmin
    ? await orderRepository.findById(input.orderId, true)
    : await orderRepository.findByIdForUser(input.orderId, input.userId, true);
  if (!order) throw new OrderNotFoundError();
  if (order.status !== 'PENDING') throw new OrderNotCancellableError();

  await prisma.$transaction(async (tx: typeof prisma) => {
    for (const item of order.items ?? []) {
      if (item.productKeyId) {
        const k = await tx.productKey.findUnique({ where: { id: item.productKeyId } });
        if (k && !k.isUsed) {
          await tx.productKey.update({
            where: { id: k.id },
            data: { reservedAt: null, reservedFor: null },
          });
        }
      }
    }
    for (const item of order.items ?? []) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { increment: item.quantity } },
      });
    }
    await tx.order.update({
      where: { id: order.id },
      data: { status: 'CANCELLED', cancelledAt: new Date() },
    });
  });

  await auditRepository.log({
    actorId: input.userId,
    action: 'UPDATE',
    targetType: 'order',
    targetId: order.id,
    payload: { status: 'CANCELLED', actor: input.isAdmin ? 'admin' : 'user' },
    ipAddress: input.ipAddress,
    userAgent: input.userAgent,
  });

  return { id: order.id, status: 'CANCELLED' };
}
