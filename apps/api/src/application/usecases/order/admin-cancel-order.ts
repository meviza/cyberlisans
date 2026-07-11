import { prisma } from '../../../infrastructure/db';
import { orderRepository } from '../../../infrastructure/repositories/order.repository';
import { auditRepository } from '../../../infrastructure/repositories/audit.repository';
import { OrderNotFoundError } from '../../../domain/errors/wallet';

export interface AdminCancelOrderInput {
  orderId: string;
  adminId: string;
  reason: string;
  restoreKeys: boolean;
  ipAddress?: string;
  userAgent?: string;
}

export async function adminCancelOrder(input: AdminCancelOrderInput) {
  const order = await orderRepository.findById(input.orderId, true);
  if (!order) throw new OrderNotFoundError();
  if (order.status === 'CANCELLED') {
    return { order, idempotent: true };
  }
  if (order.status !== 'PENDING') {
    return { ok: false as const, reason: 'NOT_CANCELLABLE' as const, order };
  }

  await prisma.$transaction(async (tx: typeof prisma) => {
    if (input.restoreKeys && order.items) {
      for (const item of order.items) {
        if (item.productKeyId) {
          await tx.productKey.update({
            where: { id: item.productKeyId },
            data: { reservedAt: null, reservedFor: null },
          });
        }
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }
    }
    await tx.order.update({
      where: { id: order.id },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
        notes: order.notes
          ? `${order.notes}\n[ADMIN CANCEL] ${input.reason}`
          : `[ADMIN CANCEL] ${input.reason}`,
      },
    });
  });

  const updated = await orderRepository.findById(order.id);
  await auditRepository.log({
    actorId: input.adminId,
    targetUserId: order.userId,
    action: 'STATUS_CHANGE',
    targetType: 'order',
    targetId: order.id,
    payload: {
      from: order.status,
      to: 'CANCELLED',
      reason: input.reason,
      restoreKeys: input.restoreKeys,
    },
    ipAddress: input.ipAddress,
    userAgent: input.userAgent,
  });
  return { ok: true as const, order: updated };
}
