import { orderRepository } from '../../../infrastructure/repositories/order.repository';
import { productRepository } from '../../../infrastructure/repositories/product.repository';
import { productKeyRepository } from '../../../infrastructure/repositories/product-key.repository';
import { auditRepository } from '../../../infrastructure/repositories/audit.repository';
import { supabaseAdmin, dbError } from '../../../infrastructure/db';
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
    return { order, idempotent: true as const };
  }
  if (order.status !== 'PENDING') {
    return { ok: false as const, reason: 'NOT_CANCELLABLE' as const, order };
  }

  if (input.restoreKeys && order.items) {
    for (const item of order.items) {
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
  }

  const notes = order.notes
    ? `${order.notes}\n[ADMIN CANCEL] ${input.reason}`
    : `[ADMIN CANCEL] ${input.reason}`;

  await orderRepository.updateStatus(order.id, 'CANCELLED', {
    cancelledAt: new Date(),
  });

  const { error: nErr } = await supabaseAdmin()
    .from('orders')
    .update({ notes, updatedAt: new Date().toISOString() })
    .eq('id', order.id);
  if (nErr) throw dbError(nErr);

  const updated = await orderRepository.findById(order.id, true);
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
