import { supabaseAdmin, dbError } from '../../../infrastructure/db';
import { orderRepository } from '../../../infrastructure/repositories/order.repository';
import { OrderNotFoundError } from '../../../domain/errors/wallet';

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

function previewKey(code: string | null | undefined): string | null {
  if (!code || code.length < 8) return code ?? null;
  return `${code.slice(0, 4)}•••${code.slice(-4)}`;
}

export async function getAdminOrder(orderId: string): Promise<AdminOrderDetail> {
  const order = await orderRepository.findById(orderId, true);
  if (!order) throw new OrderNotFoundError();

  const { data: user, error: uErr } = await supabaseAdmin()
    .from('users')
    .select('id,email,username,displayName,role')
    .eq('id', order.userId)
    .maybeSingle();
  if (uErr) throw dbError(uErr);

  const productIds = [...new Set((order.items ?? []).map((i) => i.productId))];
  const productMap = new Map<string, { title: string; slug: string }>();
  if (productIds.length > 0) {
    const { data: products, error: pErr } = await supabaseAdmin()
      .from('products')
      .select('id,title,slug')
      .in('id', productIds);
    if (pErr) throw dbError(pErr);
    for (const p of products ?? []) {
      productMap.set((p as { id: string }).id, {
        title: (p as { title: string }).title,
        slug: (p as { slug: string }).slug,
      });
    }
  }

  // Payments table may be empty while payment infra is skipped
  let payments: AdminOrderDetail['payments'] = [];
  try {
    const { data: pays } = await supabaseAdmin()
      .from('payments')
      .select('*')
      .eq('orderId', orderId)
      .order('createdAt', { ascending: false });
    payments = (pays ?? []).map((p) => {
      const row = p as Record<string, unknown>;
      return {
        id: String(row['id'] ?? ''),
        provider: String(row['provider'] ?? ''),
        providerRef: (row['providerRef'] as string | null) ?? null,
        amount: Number(row['amount'] ?? 0),
        currency: String(row['currency'] ?? order.currency),
        status: String(row['status'] ?? ''),
        paidAt: row['paidAt'] ? new Date(String(row['paidAt'])) : null,
        refundedAt: row['refundedAt'] ? new Date(String(row['refundedAt'])) : null,
        createdAt: new Date(String(row['createdAt'] ?? order.createdAt)),
      };
    });
  } catch {
    payments = [];
  }

  const userRow = (user ?? {}) as {
    id?: string;
    email?: string;
    username?: string;
    displayName?: string | null;
    role?: string;
  };

  return {
    id: order.id,
    orderNumber: order.orderNumber,
    user: {
      id: userRow.id ?? order.userId,
      email: userRow.email ?? '',
      username: userRow.username ?? '',
      displayName: userRow.displayName ?? null,
      role: userRow.role ?? 'CUSTOMER',
    },
    totalAmount: order.totalAmount,
    currency: order.currency,
    status: order.status,
    paymentMethod: order.paymentMethod,
    paymentStatus: payments[0]?.status ?? null,
    paymentRef: payments[0]?.providerRef ?? null,
    notes: order.notes,
    items: (order.items ?? []).map((it) => {
      const prod = productMap.get(it.productId);
      return {
        id: it.id,
        productId: it.productId,
        productTitle: prod?.title ?? 'Ürün',
        productSlug: prod?.slug ?? '',
        productKeyId: it.productKeyId ?? null,
        productKeyPreview: previewKey(it.productKeyCode),
        quantity: it.quantity || it.qty || 1,
        unitPrice: it.unitPrice,
        totalPrice: it.totalPrice,
      };
    }),
    payments,
    timeline: [
      { label: 'Oluşturuldu', date: order.createdAt },
      { label: 'Ödendi', date: order.paidAt },
      { label: 'Teslim Edildi', date: order.fulfilledAt },
      { label: 'İptal', date: order.cancelledAt },
      { label: 'İade', date: order.refundedAt },
    ],
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    paidAt: order.paidAt,
    fulfilledAt: order.fulfilledAt,
    cancelledAt: order.cancelledAt,
    refundedAt: order.refundedAt,
  };
}
