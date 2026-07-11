import { orderRepository } from '../../../infrastructure/repositories/order.repository';
import type { OrderStatus } from '../../../domain/entities/product';

export interface ListUserOrdersInput {
  userId: string;
  status?: OrderStatus;
  page?: number;
  limit?: number;
}

export async function listUserOrders(input: ListUserOrdersInput) {
  const page = Math.max(1, input.page ?? 1);
  const limit = Math.min(50, Math.max(1, input.limit ?? 20));
  const result = await orderRepository.findByUserIdWithItems(input.userId, page, limit);
  const filtered = input.status
    ? result.items.filter((o) => o.status === input.status)
    : result.items;
  return {
    items: filtered,
    total: result.total,
    page,
    limit,
    totalPages: Math.ceil(result.total / limit) || 1,
  };
}
