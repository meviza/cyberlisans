import { orderRepository } from '../../../infrastructure/repositories/order.repository';
import { productKeyRepository } from '../../../infrastructure/repositories/product-key.repository';
import { auditRepository } from '../../../infrastructure/repositories/audit.repository';
import { OrderNotFoundError, OrderNotPendingError } from '../../../domain/errors/wallet';

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
    return { order, idempotent: true as const };
  }
  if (order.status !== 'PAID') {
    throw new OrderNotPendingError();
  }

  for (const item of order.items ?? []) {
    if (item.id) {
      await productKeyRepository.markUsedByOrderItem(item.id, order.userId);
    }
  }

  await orderRepository.markFulfilled(order.id);
  const updated = await orderRepository.findById(order.id, true);

  await auditRepository.log({
    actorId: input.userId,
    action: 'UPDATE',
    targetType: 'order',
    targetId: order.id,
    payload: { status: 'FULFILLED' },
    ipAddress: input.ipAddress,
    userAgent: input.userAgent,
  });

  return { order: updated, idempotent: false as const };
}
