import { orderRepository } from '../../../infrastructure/repositories/order.repository';
import { auditRepository } from '../../../infrastructure/repositories/audit.repository';
import { OrderNotFoundError } from '../../../domain/errors/wallet';

export interface AdminMarkPaidInput {
  orderId: string;
  adminId: string;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Status-only mark paid (no PSP). Used while payment infrastructure is deferred
 * so admin can fulfill/test the order lifecycle.
 */
export async function adminMarkPaid(input: AdminMarkPaidInput) {
  const order = await orderRepository.findById(input.orderId, true);
  if (!order) throw new OrderNotFoundError();
  if (order.status === 'PAID' || order.status === 'FULFILLED') {
    return { order, idempotent: true as const };
  }
  if (order.status !== 'PENDING') {
    return { ok: false as const, reason: 'NOT_PENDING' as const, order };
  }

  const updated = await orderRepository.updateStatus(order.id, 'PAID', {
    paidAt: new Date(),
  });

  await auditRepository.log({
    actorId: input.adminId,
    targetUserId: order.userId,
    action: 'STATUS_CHANGE',
    targetType: 'order',
    targetId: order.id,
    payload: {
      from: 'PENDING',
      to: 'PAID',
      note: 'Manual mark-paid (payment integration pending)',
    },
    ipAddress: input.ipAddress,
    userAgent: input.userAgent,
  });

  return { ok: true as const, order: updated, idempotent: false as const };
}
