import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { ZodError } from 'zod';
import { authMiddleware } from '../../infrastructure/auth';
import { createOrder } from '../../domain/usecases/order/create-order';
import { getOrderForUser } from '../../domain/usecases/order/get-order';
import { listUserOrders } from '../../domain/usecases/order/list-user-orders';
import { cancelOrder } from '../../domain/usecases/order/cancel-order';
import { getRequestMeta } from '../middleware/request-meta';
import { PaymentError } from '@cyberlisans/payments/errors';
import {
  OrderNotFoundError,
  OrderNotOwnedError,
  OrderNotPendingError,
} from '../../domain/errors/wallet';
import { OrderNotCancellableError } from '../../domain/errors/product';
import { createOrderSchema, listOrdersQuerySchema } from './orders.schema';

export const ordersRoutes = new Hono();

ordersRoutes.use('*', authMiddleware);

ordersRoutes.use('*', async (c, next) => {
  try {
    await next();
  } catch (err) {
    if (err instanceof ZodError) {
      return c.json({ error: 'Validation', issues: err.issues }, 400);
    }
    if (err instanceof PaymentError) {
      return c.json(
        { error: err.message, code: err.code },
        err.statusCode as 400 | 401 | 403 | 404 | 409,
      );
    }
    if (err instanceof OrderNotFoundError) {
      return c.json({ error: err.message, code: err.code }, 404);
    }
    if (err instanceof OrderNotOwnedError) {
      return c.json({ error: err.message, code: err.code }, 403);
    }
    if (err instanceof OrderNotPendingError || err instanceof OrderNotCancellableError) {
      return c.json({ error: err.message, code: err.code }, 409);
    }
    console.error('[ORDERS ERROR]', err);
    return c.json({ error: 'Internal error' }, 500);
  }
});

ordersRoutes.post('/', zValidator('json', createOrderSchema), async (c) => {
  const user = c.get('user');
  const body = c.req.valid('json');
  const meta = getRequestMeta(c);
  const order = await createOrder({
    userId: user.sub,
    items: body.items,
    currency: body.currency,
    paymentMethod: body.paymentMethod,
    notes: body.notes ?? null,
    ...meta,
  });
  return c.json(order, 201);
});

ordersRoutes.get('/', zValidator('query', listOrdersQuerySchema), async (c) => {
  const user = c.get('user');
  const q = c.req.valid('query');
  return c.json(
    await listUserOrders({
      userId: user.sub,
      status: q.status,
      page: q.page,
      limit: q.limit,
    }),
  );
});

ordersRoutes.get('/:id', async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');
  const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';
  return c.json(await getOrderForUser(id, user.sub, isAdmin));
});

ordersRoutes.post('/:id/cancel', async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');
  const meta = getRequestMeta(c);
  const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';
  return c.json(await cancelOrder({ orderId: id, userId: user.sub, isAdmin, ...meta }));
});
