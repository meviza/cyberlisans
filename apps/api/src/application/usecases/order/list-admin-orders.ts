import { supabaseAdmin, dbError } from '../../../infrastructure/db';
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
  const from = (page - 1) * limit;

  let q = supabaseAdmin()
    .from('orders')
    .select('*', { count: 'exact' })
    .order('createdAt', { ascending: false });

  if (input.status) q = q.eq('status', input.status);
  if (input.paymentMethod) q = q.eq('paymentMethod', input.paymentMethod);
  if (input.currency) q = q.eq('currency', input.currency);
  if (input.from) q = q.gte('createdAt', input.from.toISOString());
  if (input.to) q = q.lte('createdAt', input.to.toISOString());
  if (input.search && input.search.trim()) {
    const term = input.search.trim();
    // orderNumber or id match (user email search needs join — simple OR on order fields)
    q = q.or(`orderNumber.ilike.%${term}%,id.eq.${term}`);
  }

  q = q.range(from, from + limit - 1);
  const { data: orders, error, count } = await q;
  if (error) throw dbError(error);

  const rows = (orders ?? []) as Array<Record<string, unknown>>;
  const userIds = [...new Set(rows.map((o) => String(o['userId'])))];
  const userMap = new Map<
    string,
    { id: string; email: string; username: string; displayName: string | null }
  >();

  if (userIds.length > 0) {
    const { data: users, error: uErr } = await supabaseAdmin()
      .from('users')
      .select('id,email,username,displayName')
      .in('id', userIds);
    if (uErr) throw dbError(uErr);
    for (const u of users ?? []) {
      const row = u as {
        id: string;
        email: string;
        username: string;
        displayName: string | null;
      };
      userMap.set(row.id, {
        id: row.id,
        email: row.email,
        username: row.username,
        displayName: row.displayName ?? null,
      });
    }
  }

  // item counts
  const orderIds = rows.map((o) => String(o['id']));
  const countMap = new Map<string, number>();
  if (orderIds.length > 0) {
    const { data: items, error: iErr } = await supabaseAdmin()
      .from('order_items')
      .select('orderId')
      .in('orderId', orderIds);
    if (!iErr && items) {
      for (const it of items) {
        const oid = (it as { orderId: string }).orderId;
        countMap.set(oid, (countMap.get(oid) ?? 0) + 1);
      }
    }
  }

  const items: AdminOrderListItem[] = rows.map((o) => {
    const uid = String(o['userId']);
    const user = userMap.get(uid) ?? {
      id: uid,
      email: '',
      username: '',
      displayName: null,
    };
    return {
      id: String(o['id']),
      orderNumber: String(o['orderNumber'] ?? ''),
      user,
      totalAmount: Number(o['totalAmount'] ?? 0),
      currency: (o['currency'] as Currency) ?? 'TRY',
      status: o['status'] as OrderStatus,
      paymentMethod: (o['paymentMethod'] as PaymentMethod | null) ?? null,
      paymentStatus: null,
      itemsCount: countMap.get(String(o['id'])) ?? 0,
      createdAt: new Date(String(o['createdAt'])),
      paidAt: o['paidAt'] ? new Date(String(o['paidAt'])) : null,
      fulfilledAt: o['fulfilledAt'] ? new Date(String(o['fulfilledAt'])) : null,
    };
  });

  // Optional email search filter post-query (when search looks like email)
  let filtered = items;
  if (input.search && input.search.includes('@')) {
    const term = input.search.trim().toLowerCase();
    filtered = items.filter((i) => i.user.email.toLowerCase().includes(term));
  }

  const total = count ?? filtered.length;
  return {
    items: filtered,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit) || 1,
  };
}
