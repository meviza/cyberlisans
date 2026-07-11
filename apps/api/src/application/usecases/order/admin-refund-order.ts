import { orderRepository } from '../../../infrastructure/repositories/order.repository';
import { productKeyRepository } from '../../../infrastructure/repositories/product-key.repository';
import { productRepository } from '../../../infrastructure/repositories/product.repository';
import { auditRepository } from '../../../infrastructure/repositories/audit.repository';
import { OrderNotFoundError } from '../../../domain/errors/wallet';

export interface AdminRefundOrderInput {
  orderId: string;
  adminId: string;
  amount: number;
  reason: string;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Payment infrastructure is deferred. This marks the order REFUNDED and
 * releases reserved/used keys + restores stock. No wallet credit / PSP call.
 */
export async function adminRefundOrder(input: AdminRefundOrderInput) {
  const order = await orderRepository.findById(input.orderId, true);
  if (!order) throw new OrderNotFoundError();
  if (order.status === 'REFUNDED') {
    return { order, idempotent: true as const };
  }
  if (order.status !== 'PAID' && order.status !== 'FULFILLED' && order.status !== 'PENDING') {
    return { ok: false as const, reason: 'NOT_REFUNDABLE' as const, order };
  }
  if (input.amount <= 0 || input.amount > order.totalAmount + 0.01) {
    return { ok: false as const, reason: 'INVALID_AMOUNT' as const, order };
  }

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

  const updated = await orderRepository.updateStatus(order.id, 'REFUNDED', {
    refundedAt: new Date(),
  });

  await auditRepository.log({
    actorId: input.adminId,
    targetUserId: order.userId,
    action: 'STATUS_CHANGE',
    targetType: 'order',
    targetId: order.id,
    payload: {
      operation: 'refund_status_only',
      amount: input.amount,
      currency: order.currency,
      reason: input.reason,
      note: 'Payment refund deferred — status + inventory only',
    },
    ipAddress: input.ipAddress,
    userAgent: input.userAgent,
  });

  return { ok: true as const, order: updated };
}
