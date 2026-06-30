import { prisma } from '../db';
import type { IOrderRepositoryForWallet } from '../../application/ports/repositories';
import type { Currency } from '../../domain/entities/wallet';

export class OrderRepository implements IOrderRepositoryForWallet {
  async findById(orderId: string) {
    const o = await prisma.order.findUnique({ where: { id: orderId } });
    if (!o) return null;
    return {
      id: o.id,
      userId: o.userId,
      totalAmount: Number(o.totalAmount),
      currency: o.currency as Currency,
      status: o.status,
    };
  }

  async markPaid(orderId: string, paymentId: string): Promise<void> {
    await prisma.order.update({
      where: { id: orderId },
      data: { status: 'PAID', paidAt: new Date() },
    });
  }
}

export const orderRepository = new OrderRepository();
