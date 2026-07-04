import { supabaseAdmin, dbError } from '../db';
import type {
  IOrderRepository,
  IOrderRepositoryForWallet,
  CreateOrderInput,
  CreateOrderItemInput,
} from '../../application/ports/repositories';
import type { OrderEntity, OrderItemEntity, OrderStatus } from '../../domain/entities/product';
import type { Currency } from '../../domain/entities/wallet';

type OrderRow = {
  id: string;
  orderNumber: string;
  userId: string;
  totalAmount: string | number;
  currency: string;
  status: string;
  paymentMethod: string | null;
  refCode: string | null;
  notes: string | null;
  paidAt: string | null;
  fulfilledAt: string | null;
  cancelledAt: string | null;
  refundedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

type ItemRow = {
  id: string;
  orderId: string;
  productId: string;
  productKeyId: string | null;
  quantity: number;
  unitPrice: string | number;
  totalPrice: string | number;
  productKey?: { code: string } | { code: string }[] | null;
};

function toItemEntity(i: ItemRow): OrderItemEntity {
  const keyCode = Array.isArray(i.productKey)
    ? (i.productKey[0]?.code ?? null)
    : (i.productKey?.code ?? null);
  return {
    id: i.id,
    orderId: i.orderId,
    productId: i.productId,
    productKeyId: i.productKeyId ?? null,
    quantity: i.quantity,
    qty: i.quantity,
    unitPrice: Number(i.unitPrice),
    totalPrice: Number(i.totalPrice),
    productKeyCode: keyCode,
  };
}

function toEntity(o: OrderRow, items?: ItemRow[]): OrderEntity {
  return {
    id: o.id,
    orderNumber: o.orderNumber,
    userId: o.userId,
    totalAmount: Number(o.totalAmount),
    currency: o.currency as Currency,
    status: o.status as OrderStatus,
    paymentMethod: (o.paymentMethod ?? null) as OrderEntity['paymentMethod'],
    refCode: o.refCode ?? null,
    notes: o.notes ?? null,
    paidAt: o.paidAt ? new Date(o.paidAt) : null,
    fulfilledAt: o.fulfilledAt ? new Date(o.fulfilledAt) : null,
    cancelledAt: o.cancelledAt ? new Date(o.cancelledAt) : null,
    refundedAt: o.refundedAt ? new Date(o.refundedAt) : null,
    createdAt: new Date(o.createdAt),
    updatedAt: new Date(o.updatedAt),
    items: items ? items.map(toItemEntity) : undefined,
  };
}

export class OrderRepository implements IOrderRepository, IOrderRepositoryForWallet {
  async findById(orderId: string, withItems = false): Promise<OrderEntity | null> {
    if (!withItems) {
      const { data, error } = await supabaseAdmin()
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .maybeSingle();
      if (error) throw dbError(error);
      return data ? toEntity(data as OrderRow) : null;
    }
    const { data: order, error } = await supabaseAdmin()
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .maybeSingle();
    if (error) throw dbError(error);
    if (!order) return null;
    const { data: items } = await supabaseAdmin()
      .from('order_items')
      .select('*,productKey:product_keys(code)')
      .eq('orderId', orderId);
    return toEntity(order as OrderRow, (items ?? []) as ItemRow[]);
  }

  async findByIdForUser(
    orderId: string,
    userId: string,
    withItems = false,
  ): Promise<OrderEntity | null> {
    if (!withItems) {
      const { data, error } = await supabaseAdmin()
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .eq('userId', userId)
        .maybeSingle();
      if (error) throw dbError(error);
      return data ? toEntity(data as OrderRow) : null;
    }
    const { data: order, error } = await supabaseAdmin()
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .eq('userId', userId)
      .maybeSingle();
    if (error) throw dbError(error);
    if (!order) return null;
    const { data: items } = await supabaseAdmin()
      .from('order_items')
      .select('*,productKey:product_keys(code)')
      .eq('orderId', orderId);
    return toEntity(order as OrderRow, (items ?? []) as ItemRow[]);
  }

  async findByUserId(
    userId: string,
    options: { status?: OrderStatus; page: number; limit: number },
  ): Promise<{ items: OrderEntity[]; total: number }> {
    let q = supabaseAdmin().from('orders').select('*', { count: 'exact' }).eq('userId', userId);
    if (options.status) q = q.eq('status', options.status);
    q = q.order('createdAt', { ascending: false });
    const from = (options.page - 1) * options.limit;
    q = q.range(from, from + options.limit - 1);
    const { data, error, count } = await q;
    if (error) throw dbError(error);
    return { items: (data ?? []).map((r) => toEntity(r as OrderRow)), total: count ?? 0 };
  }

  async findByUserIdWithItems(
    userId: string,
    page: number,
    limit: number,
  ): Promise<{ items: OrderEntity[]; total: number }> {
    const from = (page - 1) * limit;
    const {
      data: orders,
      error,
      count,
    } = await supabaseAdmin()
      .from('orders')
      .select('*', { count: 'exact' })
      .eq('userId', userId)
      .order('createdAt', { ascending: false })
      .range(from, from + limit - 1);
    if (error) throw dbError(error);
    const items: OrderEntity[] = [];
    for (const o of orders ?? []) {
      const { data: its } = await supabaseAdmin()
        .from('order_items')
        .select('*,productKey:product_keys(code)')
        .eq('orderId', (o as OrderRow).id);
      items.push(toEntity(o as OrderRow, (its ?? []) as ItemRow[]));
    }
    return { items, total: count ?? 0 };
  }

  async listAll(options: {
    status?: OrderStatus;
    page: number;
    limit: number;
  }): Promise<{ items: OrderEntity[]; total: number }> {
    let q = supabaseAdmin().from('orders').select('*', { count: 'exact' });
    if (options.status) q = q.eq('status', options.status);
    q = q.order('createdAt', { ascending: false });
    const from = (options.page - 1) * options.limit;
    q = q.range(from, from + options.limit - 1);
    const { data, error, count } = await q;
    if (error) throw dbError(error);
    return { items: (data ?? []).map((r) => toEntity(r as OrderRow)), total: count ?? 0 };
  }

  async createWithItems(data: CreateOrderInput): Promise<OrderEntity> {
    const orderId = crypto.randomUUID();
    const now = new Date().toISOString();
    const orderNum = `CYB-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    const { error: oErr } = await supabaseAdmin()
      .from('orders')
      .insert({
        id: orderId,
        orderNumber: orderNum,
        userId: data.userId,
        totalAmount: data.totalAmount,
        currency: data.currency,
        status: 'PENDING',
        paymentMethod: data.paymentMethod,
        notes: data.notes ?? null,
        createdAt: now,
        updatedAt: now,
      });
    if (oErr) throw dbError(oErr);
    if (data.items.length > 0) {
      const itemRows = data.items.map((it: CreateOrderItemInput) => ({
        id: crypto.randomUUID(),
        orderId,
        productId: it.productId,
        productKeyId: it.productKeyId ?? null,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        totalPrice: it.totalPrice,
      }));
      const { error: iErr } = await supabaseAdmin().from('order_items').insert(itemRows);
      if (iErr) throw dbError(iErr);
    }
    const { data: o, error } = await supabaseAdmin()
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .maybeSingle();
    if (error || !o) throw dbError(error);
    const { data: items } = await supabaseAdmin()
      .from('order_items')
      .select('*,productKey:product_keys(code)')
      .eq('orderId', orderId);
    return toEntity(o as OrderRow, (items ?? []) as ItemRow[]);
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
    const patch: Record<string, unknown> = {
      status,
      updatedAt: new Date().toISOString(),
    };
    if (extras?.paidAt) patch['paidAt'] = extras.paidAt.toISOString();
    if (extras?.fulfilledAt) patch['fulfilledAt'] = extras.fulfilledAt.toISOString();
    if (extras?.cancelledAt) patch['cancelledAt'] = extras.cancelledAt.toISOString();
    if (extras?.refundedAt) patch['refundedAt'] = extras.refundedAt.toISOString();
    const { data: o, error } = await supabaseAdmin()
      .from('orders')
      .update(patch)
      .eq('id', orderId)
      .select('*')
      .single();
    if (error || !o) throw dbError(error);
    return toEntity(o as OrderRow);
  }

  async markPaid(orderId: string, _paymentId: string): Promise<void> {
    const { error } = await supabaseAdmin()
      .from('orders')
      .update({
        status: 'PAID',
        paidAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .eq('id', orderId);
    if (error) throw dbError(error);
  }

  async markFulfilled(orderId: string): Promise<void> {
    const { error } = await supabaseAdmin()
      .from('orders')
      .update({
        status: 'FULFILLED',
        fulfilledAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .eq('id', orderId);
    if (error) throw dbError(error);
  }
}

export const orderRepository = new OrderRepository();
