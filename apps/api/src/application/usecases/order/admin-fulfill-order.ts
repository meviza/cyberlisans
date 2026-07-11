import { fulfillOrder } from './fulfill-order';
import { orderRepository } from '../../../infrastructure/repositories/order.repository';
import { OrderNotFoundError } from '../../../domain/errors/wallet';

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
    return { order, idempotent: true as const, ok: true as const };
  }
  if (order.status !== 'PAID') {
    return { ok: false as const, reason: 'NOT_PAID' as const, order };
  }

  const result = await fulfillOrder({
    orderId: input.orderId,
    userId: input.adminId,
    ipAddress: input.ipAddress,
    userAgent: input.userAgent,
  });

  return {
    ok: true as const,
    order: result.order,
    idempotent: result.idempotent,
  };
}
