import { prisma } from '../../../infrastructure/db';
import { OrderNotFoundError } from '../../errors/wallet';

export interface AdminOrderDetail {
  id: string;
  orderNumber: string;
  user: {
    id: string;
    email: string;
    username: string;
    displayName: string | null;
    role: string;
  };
  totalAmount: number;
  currency: string;
  status: string;
  paymentMethod: string | null;
  paymentStatus: string | null;
  paymentRef: string | null;
  notes: string | null;
  items: Array<{
    id: string;
    productId: string;
    productTitle: string;
    productSlug: string;
    productKeyId: string | null;
    productKeyPreview: string | null;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  payments: Array<{
    id: string;
    provider: string;
    providerRef: string | null;
    amount: number;
    currency: string;
    status: string;
    paidAt: Date | null;
    refundedAt: Date | null;
    createdAt: Date;
  }>;
  timeline: Array<{
    label: string;
    date: Date | null;
  }>;
  createdAt: Date;
  updatedAt: Date;
  paidAt: Date | null;
  fulfilledAt: Date | null;
  cancelledAt: Date | null;
  refundedAt: Date | null;
}

export async function getAdminOrder(orderId: string): Promise<AdminOrderDetail> {
  const o = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: { select: { id: true, email: true, username: true, displayName: true, role: true } },
      items: { include: { product: { select: { title: true, slug: true } }, productKey: true } },
      payments: { orderBy: { createdAt: 'desc' } },
    },
  });
  if (!o) throw new OrderNotFoundError();

  return {
    id: o.id,
    orderNumber: o.orderNumber,
    user: o.user,
    totalAmount: Number(o.totalAmount),
    currency: o.currency,
    status: o.status,
    paymentMethod: o.paymentMethod,
    paymentStatus: o.payments[0]?.status ?? null,
    paymentRef: o.payments[0]?.providerRef ?? null,
    notes: o.notes,
    items: o.items.map((it: (typeof o.items)[number]) => ({
      id: it.id,
      productId: it.productId,
      productTitle: it.product.title,
      productSlug: it.product.slug,
      productKeyId: it.productKeyId,
      productKeyPreview: it.productKey?.code
        ? `${it.productKey.code.slice(0, 4)}•••${it.productKey.code.slice(-4)}`
        : null,
      quantity: it.quantity,
      unitPrice: Number(it.unitPrice),
      totalPrice: Number(it.totalPrice),
    })),
    payments: o.payments.map((p: (typeof o.payments)[number]) => ({
      id: p.id,
      provider: p.provider,
      providerRef: p.providerRef,
      amount: Number(p.amount),
      currency: p.currency,
      status: p.status,
      paidAt: p.paidAt,
      refundedAt: p.refundedAt,
      createdAt: p.createdAt,
    })),
    timeline: [
      { label: 'Oluşturuldu', date: o.createdAt },
      { label: 'Ödendi', date: o.paidAt },
      { label: 'Teslim Edildi', date: o.fulfilledAt },
      { label: 'İptal', date: o.cancelledAt },
      { label: 'İade', date: o.refundedAt },
    ],
    createdAt: o.createdAt,
    updatedAt: o.updatedAt,
    paidAt: o.paidAt,
    fulfilledAt: o.fulfilledAt,
    cancelledAt: o.cancelledAt,
    refundedAt: o.refundedAt,
  };
}
