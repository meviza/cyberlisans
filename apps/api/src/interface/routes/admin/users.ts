import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { createAdminStack, errorHandler } from '../../middleware/admin-stack';
import { listAdminUsers } from '../../../application/usecases/user/list-admin-users';
import { getAdminUser } from '../../../application/usecases/user/get-admin-user';
import { updateAdminUser } from '../../../application/usecases/user/update-admin-user';
import { adminAdjustBalance } from '../../../application/usecases/wallet/admin-adjust-balance';
import { sendPasswordResetToUser } from '../../../application/usecases/user/send-password-reset';
import { reset2FAForUser } from '../../../application/usecases/user/reset-2fa';
import { deleteAdminUser } from '../../../application/usecases/user/delete-admin-user';
import { getRequestMeta } from '../../middleware/request-meta';

export const adminUsersRoutes = new Hono();

adminUsersRoutes.use('*', ...createAdminStack());

adminUsersRoutes.use('*', async (c, next) => {
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
  role: z.enum(['CUSTOMER', 'ADMIN', 'SUPER_ADMIN']).optional(),
  status: z.enum(['ACTIVE', 'SUSPENDED', 'BANNED', 'PENDING_VERIFICATION']).optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
});

adminUsersRoutes.get('/', zValidator('query', listQuerySchema), async (c) => {
  const q = c.req.valid('query');
  return c.json(
    await listAdminUsers({
      search: q.search,
      role: q.role,
      status: q.status,
      createdFrom: q.from ? new Date(q.from) : undefined,
      createdTo: q.to ? new Date(q.to) : undefined,
      page: q.page,
      limit: q.limit,
    }),
  );
});

adminUsersRoutes.get('/:id', async (c) => {
  const id = c.req.param('id');
  return c.json(await getAdminUser(id));
});

const updateUserSchema = z.object({
  role: z.enum(['CUSTOMER', 'ADMIN', 'SUPER_ADMIN']).optional(),
  status: z.enum(['ACTIVE', 'SUSPENDED', 'BANNED', 'PENDING_VERIFICATION']).optional(),
  emailVerified: z.boolean().optional(),
});

adminUsersRoutes.patch('/:id', zValidator('json', updateUserSchema), async (c) => {
  const admin = c.get('user');
  const id = c.req.param('id');
  const body = c.req.valid('json');
  const meta = getRequestMeta(c);
  return c.json(
    await updateAdminUser({
      userId: id,
      adminId: admin.sub,
      data: body,
      ...meta,
    }),
  );
});

const walletAdjustSchema = z.object({
  amount: z.number(),
  currency: z.enum(['TRY', 'USD', 'EUR', 'USDT']),
  reason: z.string().min(5).max(500),
});

adminUsersRoutes.post('/:id/wallet-adjust', zValidator('json', walletAdjustSchema), async (c) => {
  const admin = c.get('user');
  const id = c.req.param('id');
  const body = c.req.valid('json');
  const meta = getRequestMeta(c);
  return c.json(
    await adminAdjustBalance({
      adminId: admin.sub,
      userId: id,
      amount: body.amount,
      currency: body.currency,
      reason: body.reason,
      ...meta,
    }),
  );
});

adminUsersRoutes.post('/:id/reset-2fa', async (c) => {
  const admin = c.get('user');
  const id = c.req.param('id');
  const meta = getRequestMeta(c);
  return c.json(await reset2FAForUser({ userId: id, adminId: admin.sub, ...meta }));
});

adminUsersRoutes.post('/:id/send-password-reset', async (c) => {
  const admin = c.get('user');
  const id = c.req.param('id');
  const meta = getRequestMeta(c);
  return c.json(await sendPasswordResetToUser({ userId: id, adminId: admin.sub, ...meta }));
});

adminUsersRoutes.delete('/:id', async (c) => {
  const admin = c.get('user');
  const id = c.req.param('id');
  const meta = getRequestMeta(c);
  const result = await deleteAdminUser({
    userId: id,
    adminId: admin.sub,
    ...meta,
  });
  if (!result.ok) {
    return c.json({ error: 'Bu hesap silinemez', code: result.reason }, 409);
  }
  return c.json({ deleted: true });
});
