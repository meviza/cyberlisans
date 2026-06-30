import { prisma } from '../db';
import type {
  IOrderRepository,
  IOrderRepositoryForWallet,
  CreateOrderInput,
  CreateOrderItemInput,
} from '../../application/ports/repositories';
import type { OrderEntity, OrderItemEntity, OrderStatus } from '../../domain/entities/product';
import type { Currency } from '../../domain/entities/wallet';

function toItemEntity(i: any): OrderItemEntity {
  return {
    id: i.id,
    orderId: i.orderId,
    productId: i.productId,
    productKeyId: i.productKeyId ?? null,
    quantity: i.quantity,
    unitPrice: Number(i.unitPrice),
    totalPrice: Number(i.totalPrice),
  };
}

function toEntity(o: any): OrderEntity {
  return {
    id: o.id,
    orderNumber: o.orderNumber,
    userId: o.userId,
    totalAmount: Number(o.totalAmount),
    currency: o.currency as Currency,
    status: o.status as OrderStatus,
    paymentMethod: (o.paymentMethod ?? null) as OrderEntity['paymentMethod'],
    notes: o.notes ?? null,
    paidAt: o.paidAt ?? null,
    fulfilledAt: o.fulfilledAt ?? null,
    cancelledAt: o.cancelledAt ?? null,
    refundedAt: o.refundedAt ?? null,
    createdAt: o.createdAt,
    updatedAt: o.updatedAt,
    items: o.items ? o.items.map(toItemEntity) : undefined,
  };
}

export class OrderRepository implements IOrderRepository, IOrderRepositoryForWallet {
  async findById(orderId: string, withItems = false): Promise<OrderEntity | null> {
    const o = await prisma.order.findUnique({
      where: { id: orderId },
      include: withItems ? { items: { include: { product: true, productKey: true } } } : undefined,
    });
    return o ? toEntity(o) : null;
  }

  async findByIdForUser(
    orderId: string,
    userId: string,
    withItems = false,
  ): Promise<OrderEntity | null> {
    const o = await prisma.order.findFirst({
      where: { id: orderId, userId },
      include: withItems ? { items: { include: { product: true, productKey: true } } } : undefined,
    });
    return o ? toEntity(o) : null;
  }

  async findByUserId(
    userId: string,
    options: { status?: OrderStatus; page: number; limit: number },
  ): Promise<{ items: OrderEntity[]; total: number }> {
    const where: any = { userId };
    if (options.status) where.status = options.status;
    const [items, total] = await prisma.$transaction([
      prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (options.page - 1) * options.limit,
        take: options.limit,
      }),
      prisma.order.count({ where }),
    ]);
    return { items: items.map(toEntity), total };
  }

  async findByUserIdWithItems(
    userId: string,
    page: number,
    limit: number,
  ): Promise<{ items: OrderEntity[]; total: number }> {
    const [items, total] = await prisma.$transaction([
      prisma.order.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: { items: { include: { product: true, productKey: true } } },
      }),
      prisma.order.count({ where: { userId } }),
    ]);
    return { items: items.map(toEntity), total };
  }

  async listAll(options: {
    status?: OrderStatus;
    page: number;
    limit: number;
  }): Promise<{ items: OrderEntity[]; total: number }> {
    const where: any = {};
    if (options.status) where.status = options.status;
    const [items, total] = await prisma.$transaction([
      prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (options.page - 1) * options.limit,
        take: options.limit,
        include: { items: { include: { product: true } } },
      }),
      prisma.order.count({ where }),
    ]);
    return { items: items.map(toEntity), total };
  }

  async createWithItems(data: CreateOrderInput): Promise<OrderEntity> {
    const o = await prisma.order.create({
      data: {
        userId: data.userId,
        totalAmount: data.totalAmount,
        currency: data.currency,
        status: 'PENDING',
        paymentMethod: data.paymentMethod,
        notes: data.notes ?? null,
        items: {
          create: data.items.map((it: CreateOrderItemInput) => ({
            productId: it.productId,
            productKeyId: it.productKeyId ?? null,
            quantity: it.quantity,
            unitPrice: it.unitPrice,
            totalPrice: it.totalPrice,
          })),
        },
      },
      include: { items: { include: { product: true, productKey: true } } },
    });
    return toEntity(o);
  }

  async updateStatus(
    orderId: string,
    status: OrderStatus,
    extras?: {
      paidAt?: Date;
      fulfilledAt?: Date;
      cancelledAt?: Date;
      refundedAt?: Date;
    },
  ): Promise<OrderEntity> {
    const data: any = { status };
    if (extras?.paidAt) data.paidAt = extras.paidAt;
    if (extras?.fulfilledAt) data.fulfilledAt = extras.fulfilledAt;
    if (extras?.cancelledAt) data.cancelledAt = extras.cancelledAt;
    if (extras?.refundedAt) data.refundedAt = extras.refundedAt;
    const o = await prisma.order.update({
      where: { id: orderId },
      data,
      include: { items: { include: { product: true, productKey: true } } },
    });
    return toEntity(o);
  }

  async markPaid(orderId: string, _paymentId: string): Promise<void> {
    await prisma.order.update({
      where: { id: orderId },
      data: { status: 'PAID', paidAt: new Date() },
    });
  }

  async markFulfilled(orderId: string): Promise<void> {
    await prisma.order.update({
      where: { id: orderId },
      data: { status: 'FULFILLED', fulfilledAt: new Date() },
    });
  }
}

export const orderRepository = new OrderRepository();
