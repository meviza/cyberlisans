import { orderRepository } from '../../../infrastructure/repositories/order.repository';
import { OrderNotFoundError, OrderNotOwnedError } from '../../../domain/errors/wallet';

export async function getOrderForUser(orderId: string, userId: string, isAdmin: boolean) {
  const order = isAdmin
    ? await orderRepository.findById(orderId, true)
    : await orderRepository.findByIdForUser(orderId, userId, true);
  if (!order) {
    if (!isAdmin) {
      const exists = await orderRepository.findById(orderId);
      if (exists) throw new OrderNotOwnedError();
    }
    throw new OrderNotFoundError();
  }
  return order;
}
