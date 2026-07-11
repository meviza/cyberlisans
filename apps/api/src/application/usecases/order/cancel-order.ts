import { orderRepository } from '../../../infrastructure/repositories/order.repository';
import { productRepository } from '../../../infrastructure/repositories/product.repository';
import { productKeyRepository } from '../../../infrastructure/repositories/product-key.repository';
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

  for (const item of order.items ?? []) {
    if (item.id) {
      try {
        await productKeyRepository.returnKeysForOrderItem(item.id);
      } catch {
        /* best-effort */
      }
    }
    try {
      await productRepository.incrementStock(item.productId, item.quantity || item.qty || 1);
    } catch {
      /* best-effort */
    }
  }

  await orderRepository.updateStatus(order.id, 'CANCELLED', {
    cancelledAt: new Date(),
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

  return { id: order.id, status: 'CANCELLED' as const };
}
