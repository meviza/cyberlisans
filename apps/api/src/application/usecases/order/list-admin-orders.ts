import { prisma } from '../../../infrastructure/db';
import type { OrderStatus, PaymentMethod } from '../../../domain/entities/product';
import type { Currency } from '../../../domain/entities/wallet';

export interface ListAdminOrdersInput {
  search?: string;
  status?: OrderStatus;
  paymentStatus?: 'PENDING' | 'PROCESSING' | 'SUCCEEDED' | 'FAILED' | 'REFUNDED' | 'EXPIRED';
  paymentMethod?: PaymentMethod;
  currency?: Currency;
  from?: Date;
  to?: Date;
  page?: number;
  limit?: number;
}

export interface AdminOrderListItem {
  id: string;
  orderNumber: string;
  user: {
    id: string;
    email: string;
    username: string;
    displayName: string | null;
  };
  totalAmount: number;
  currency: Currency;
  status: OrderStatus;
  paymentMethod: PaymentMethod | null;
  paymentStatus: string | null;
  itemsCount: number;
  createdAt: Date;
  paidAt: Date | null;
  fulfilledAt: Date | null;
}

export async function listAdminOrders(input: ListAdminOrdersInput = {}) {
  const page = Math.max(1, input.page ?? 1);
  const limit = Math.min(100, Math.max(1, input.limit ?? 20));

  const where: Record<string, unknown> = {};
  if (input.status) where['status'] = input.status;
  if (input.paymentMethod) where['paymentMethod'] = input.paymentMethod;
  if (input.currency) where['currency'] = input.currency;
  if (input.from || input.to) {
    where['createdAt'] = {
      ...(input.from ? { gte: input.from } : {}),
      ...(input.to ? { lte: input.to } : {}),
    };
  }
  if (input.paymentStatus) {
    where['payments'] = { some: { status: input.paymentStatus } };
  }
  if (input.search && input.search.trim().length > 0) {
    const term = input.search.trim();
    where['OR'] = [
      { orderNumber: { contains: term, mode: 'insensitive' } },
      { id: { equals: term } },
      { user: { email: { contains: term, mode: 'insensitive' } } },
      { user: { username: { contains: term, mode: 'insensitive' } } },
      { items: { some: { product: { title: { contains: term, mode: 'insensitive' } } } } },
    ];
  }

  const [orders, total] = await prisma.$transaction([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: { select: { id: true, email: true, username: true, displayName: true } },
        items: { select: { id: true } },
        payments: { orderBy: { createdAt: 'desc' }, take: 1, select: { status: true } },
      },
    }),
    prisma.order.count({ where }),
  ]);

  const items: AdminOrderListItem[] = orders.map((o: (typeof orders)[number]) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    user: o.user,
    totalAmount: Number(o.totalAmount),
    currency: o.currency as Currency,
    status: o.status as OrderStatus,
    paymentMethod: (o.paymentMethod as PaymentMethod | null) ?? null,
    paymentStatus: o.payments[0]?.status ?? null,
    itemsCount: o.items.length,
    createdAt: o.createdAt,
    paidAt: o.paidAt,
    fulfilledAt: o.fulfilledAt,
  }));

  return { items, total, page, limit, totalPages: Math.ceil(total / limit) || 1 };
}
