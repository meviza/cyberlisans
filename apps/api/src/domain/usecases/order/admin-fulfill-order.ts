import { orderRepository } from '../../../infrastructure/repositories/order.repository';
import { auditRepository } from '../../../infrastructure/repositories/audit.repository';
import { OrderNotFoundError } from '../../errors/wallet';

export interface AdminFulfillOrderInput {
  orderId: string;
  adminId: string;
  ipAddress?: string;
  userAgent?: string;
}

export async function adminFulfillOrder(input: AdminFulfillOrderInput) {
  const order = await orderRepository.findById(input.orderId, true);
  if (!order) throw new OrderNotFoundError();
  if (order.status === 'FULFILLED') {
    return { order, idempotent: true };
  }
  if (order.status !== 'PAID') {
    return { ok: false as const, reason: 'NOT_PAID' as const, order };
  }

  const updated = await orderRepository.updateStatus(order.id, 'FULFILLED', {
    fulfilledAt: new Date(),
  });
  await auditRepository.log({
    actorId: input.adminId,
    action: 'STATUS_CHANGE',
    targetType: 'order',
    targetId: order.id,
    payload: { from: order.status, to: 'FULFILLED' },
    ipAddress: input.ipAddress,
    userAgent: input.userAgent,
  });
  return { order: updated, idempotent: false };
}
