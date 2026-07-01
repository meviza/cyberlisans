import { orderRepository } from '../../../infrastructure/repositories/order.repository';
import { auditRepository } from '../../../infrastructure/repositories/audit.repository';
import { OrderNotFoundError } from '../../errors/wallet';

export interface AdminResendOrderConfirmationInput {
  orderId: string;
  adminId: string;
  ipAddress?: string;
  userAgent?: string;
}

export async function adminResendOrderConfirmation(input: AdminResendOrderConfirmationInput) {
  const order = await orderRepository.findById(input.orderId, true);
  if (!order) throw new OrderNotFoundError();

  await auditRepository.log({
    actorId: input.adminId,
    targetUserId: order.userId,
    action: 'SETTINGS_CHANGE',
    targetType: 'order',
    targetId: order.id,
    payload: { operation: 'resend_confirmation' },
    ipAddress: input.ipAddress,
    userAgent: input.userAgent,
  });
  return { sent: true, orderNumber: order.orderNumber };
}
