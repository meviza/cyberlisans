import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { createAdminStack, errorHandler } from '../../middleware/admin-stack';
import { listAdminOrders } from '../../../application/usecases/order/list-admin-orders';
import { getAdminOrder } from '../../../application/usecases/order/get-admin-order';
import { adminFulfillOrder } from '../../../application/usecases/order/admin-fulfill-order';
import { adminRefundOrder } from '../../../application/usecases/order/admin-refund-order';
import { adminCancelOrder } from '../../../application/usecases/order/admin-cancel-order';
import { adminMarkPaid } from '../../../application/usecases/order/admin-mark-paid';
import { adminResendOrderConfirmation } from '../../../application/usecases/order/admin-resend-confirmation';
import { getRequestMeta } from '../../middleware/request-meta';

export const adminOrdersRoutes = new Hono();

adminOrdersRoutes.use('*', ...createAdminStack());

adminOrdersRoutes.use('*', async (c, next) => {
  try {
    await next();
  } catch (err) {
    return errorHandler(err, c);
  }
});

const listQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().trim().max(200).optional(),
  status: z.enum(['PENDING', 'PAID', 'FULFILLED', 'CANCELLED', 'REFUNDED', 'FAILED']).optional(),
  paymentStatus: z
    .enum(['PENDING', 'PROCESSING', 'SUCCEEDED', 'FAILED', 'REFUNDED', 'EXPIRED'])
    .optional(),
  paymentMethod: z
    .enum(['PAYTR', 'PAPARA', 'NOWPAYMENTS', 'STRIPE', 'BANK_TRANSFER', 'WALLET'])
    .optional(),
  currency: z.enum(['TRY', 'USD', 'EUR', 'USDT']).optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
});

adminOrdersRoutes.get('/', zValidator('query', listQuerySchema), async (c) => {
  const q = c.req.valid('query');
  return c.json(
    await listAdminOrders({
      search: q.search,
      status: q.status,
      paymentStatus: q.paymentStatus,
      paymentMethod: q.paymentMethod,
      currency: q.currency,
      from: q.from ? new Date(q.from) : undefined,
      to: q.to ? new Date(q.to) : undefined,
      page: q.page,
      limit: q.limit,
    }),
  );
});

adminOrdersRoutes.get('/export', zValidator('query', listQuerySchema), async (c) => {
  const q = c.req.valid('query');
  const result = await listAdminOrders({
    search: q.search,
    status: q.status,
    paymentStatus: q.paymentStatus,
    paymentMethod: q.paymentMethod,
    currency: q.currency,
    from: q.from ? new Date(q.from) : undefined,
    to: q.to ? new Date(q.to) : undefined,
    page: 1,
    limit: 10000,
  });
  const headers = [
    'id',
    'orderNumber',
    'createdAt',
    'userEmail',
    'userName',
    'status',
    'paymentStatus',
    'paymentMethod',
    'currency',
    'totalAmount',
    'itemsCount',
  ];
  const escape = (v: unknown): string => {
    if (v === null || v === undefined) return '';
    const s = String(v);
    if (s.includes(',') || s.includes('"') || s.includes('\n')) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };
  const lines = [headers.join(',')];
  for (const o of result.items) {
    lines.push(
      [
        o.id,
        o.orderNumber,
        o.createdAt.toISOString(),
        o.user.email,
        o.user.username,
        o.status,
        o.paymentStatus ?? '',
        o.paymentMethod ?? '',
        o.currency,
        Number(o.totalAmount).toFixed(2),
        o.itemsCount,
      ]
        .map(escape)
        .join(','),
    );
  }
  const body = lines.join('\n');
  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="orders-${new Date().toISOString()}.csv"`,
      'Cache-Control': 'no-store',
    },
  });
});

adminOrdersRoutes.get('/:id', async (c) => {
  const id = c.req.param('id');
  return c.json(await getAdminOrder(id));
});

adminOrdersRoutes.post('/:id/mark-paid', async (c) => {
  const admin = c.get('user');
  const id = c.req.param('id');
  const meta = getRequestMeta(c);
  const result = await adminMarkPaid({ orderId: id, adminId: admin.sub, ...meta });
  if ('ok' in result && result.ok === false) {
    return c.json({ error: 'Sipariş PENDING değil', code: result.reason }, 409);
  }
  return c.json(result);
});

adminOrdersRoutes.post('/:id/fulfill', async (c) => {
  const admin = c.get('user');
  const id = c.req.param('id');
  const meta = getRequestMeta(c);
  const result = await adminFulfillOrder({ orderId: id, adminId: admin.sub, ...meta });
  if ('ok' in result && !result.ok) {
    return c.json({ error: 'Sipariş ödeme durumunda değil', code: result.reason }, 409);
  }
  return c.json(result);
});

const refundSchema = z.object({
  amount: z.number().positive().max(1_000_000),
  reason: z.string().min(5).max(500),
});

adminOrdersRoutes.post('/:id/refund', zValidator('json', refundSchema), async (c) => {
  const admin = c.get('user');
  const id = c.req.param('id');
  const body = c.req.valid('json');
  const meta = getRequestMeta(c);
  const result = await adminRefundOrder({
    orderId: id,
    adminId: admin.sub,
    amount: body.amount,
    reason: body.reason,
    ...meta,
  });
  if ('ok' in result && !result.ok) {
    return c.json({ error: 'İade yapılamadı', code: result.reason }, 409);
  }
  return c.json(result);
});

const cancelSchema = z.object({
  reason: z.string().min(5).max(500),
  restoreKeys: z.boolean().default(true),
});

adminOrdersRoutes.post('/:id/cancel', zValidator('json', cancelSchema), async (c) => {
  const admin = c.get('user');
  const id = c.req.param('id');
  const body = c.req.valid('json');
  const meta = getRequestMeta(c);
  const result = await adminCancelOrder({
    orderId: id,
    adminId: admin.sub,
    reason: body.reason,
    restoreKeys: body.restoreKeys,
    ...meta,
  });
  if ('ok' in result && !result.ok) {
    return c.json({ error: 'Sipariş iptal edilemez', code: result.reason }, 409);
  }
  return c.json(result);
});

adminOrdersRoutes.post('/:id/resend-confirmation', async (c) => {
  const admin = c.get('user');
  const id = c.req.param('id');
  const meta = getRequestMeta(c);
  return c.json(await adminResendOrderConfirmation({ orderId: id, adminId: admin.sub, ...meta }));
});
