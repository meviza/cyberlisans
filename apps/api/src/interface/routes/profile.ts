import { updateProfileSchema, changePasswordSchema } from '../../infrastructure/validators';
import { authMiddleware } from '../../infrastructure/auth';
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { ZodError } from 'zod';

import { rateLimit } from '../middleware/rate-limit';
import { getRequestMeta } from '../middleware/request-meta';
import { getMe } from '../../domain/usecases/auth/get-me';
import { updateProfile } from '../../domain/usecases/auth/update-profile';
import { changePassword } from '../../domain/usecases/auth/change-password';
import { deleteOwnAccount } from '../../domain/usecases/auth/delete-account';
import { prisma } from '../../infrastructure/db';
import { InvalidCredentialsError, UserNotFoundError } from '../../domain/errors';

export const profileRoutes = new Hono();

profileRoutes.use('*', authMiddleware);

profileRoutes.use('*', async (c, next) => {
  try {
    await next();
  } catch (err) {
    if (err instanceof ZodError) return c.json({ error: 'Validation', issues: err.issues }, 400);
    if (err instanceof InvalidCredentialsError)
      return c.json({ error: err.message, code: err.code }, 401);
    if (err instanceof UserNotFoundError)
      return c.json({ error: err.message, code: err.code }, 404);
    console.error('[PROFILE ERROR]', err);
    return c.json({ error: 'Internal error' }, 500);
  }
});

profileRoutes.get('/me', async (c) => {
  const user = c.get('user');
  const result = await getMe(user.sub);
  return c.json(result, 200);
});

profileRoutes.get('/me/products', async (c) => {
  const user = c.get('user');
  const rows = await prisma.orderItem.findMany({
    where: {
      order: { userId: user.sub, status: { in: ['PAID', 'FULFILLED'] } },
      productKeyId: { not: null },
    },
    orderBy: [
      { order: { fulfilledAt: 'desc' } },
      { order: { paidAt: 'desc' } },
      { order: { createdAt: 'desc' } },
    ],
    include: {
      order: true,
      product: { include: { brand: true } },
      productKey: true,
    },
  });

  return c.json(
    rows
      .filter((row: any) => row.productKey)
      .map((row: any) => ({
        id: row.id,
        orderId: row.orderId,
        productId: row.productId,
        productTitle: row.product.title,
        productSlug: row.product.slug,
        brand: row.product.brand?.name ?? 'CyberLisans',
        key: row.productKey?.code ?? '',
        deliveredAt: row.order.fulfilledAt ?? row.order.paidAt ?? row.order.createdAt,
        status:
          row.order.status === 'REFUNDED' || row.order.status === 'CANCELLED'
            ? 'revoked'
            : 'active',
      })),
    200,
  );
});

profileRoutes.patch(
  '/',
  rateLimit({ max: 20, windowMs: 60_000 }),
  zValidator('json', updateProfileSchema),
  async (c) => {
    const user = c.get('user');
    const body = c.req.valid('json');
    const meta = getRequestMeta(c);
    const result = await updateProfile(user.sub, body, meta);
    return c.json(result, 200);
  },
);

profileRoutes.post(
  '/change-password',
  rateLimit({ max: 5, windowMs: 60_000 }),
  zValidator('json', changePasswordSchema),
  async (c) => {
    const user = c.get('user');
    const body = c.req.valid('json');
    const meta = getRequestMeta(c);
    const result = await changePassword(user.sub, body, meta);
    return c.json(result, 200);
  },
);

profileRoutes.delete('/', async (c) => {
  const user = c.get('user');
  const meta = getRequestMeta(c);
  const result = await deleteOwnAccount(user.sub, meta);
  return c.json(result, 200);
});
