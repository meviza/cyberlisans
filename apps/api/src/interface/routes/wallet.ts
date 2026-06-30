import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z, ZodError } from 'zod';
import { authMiddleware, requireAdmin } from '../../infrastructure/auth';
import { transferSchema, adminBalanceAdjustmentSchema } from '@cyberlisans/validators/wallet';
import { currencySchema } from '@cyberlisans/validators/auth';
import { getWallet } from '../../domain/usecases/wallet/get-wallet';
import { listTransactions } from '../../domain/usecases/wallet/list-transactions';
import { transfer } from '../../domain/usecases/wallet/transfer';
import { requestWithdrawal } from '../../domain/usecases/wallet/withdraw';
import { payWithWallet } from '../../domain/usecases/wallet/pay-with-wallet';
import { adminAdjustBalance } from '../../domain/usecases/wallet/admin-adjust-balance';
import { getRequestMeta } from '../middleware/request-meta';
import { PaymentError } from '@cyberlisans/payments/errors';

export const walletRoutes = new Hono();

const withdrawalRequestSchema = z
  .object({
    amount: z.number().positive().max(1_000_000),
    currency: currencySchema,
    method: z.enum(['IBAN', 'PAPARA']),
    iban: z
      .string()
      .regex(/^TR\d{24}$/)
      .optional(),
    paparaNumber: z
      .string()
      .regex(/^\d{10,12}$/)
      .optional(),
  })
  .refine(
    (data) =>
      (data.method === 'IBAN' && !!data.iban && !data.paparaNumber) ||
      (data.method === 'PAPARA' && !!data.paparaNumber && !data.iban),
    { message: 'IBAN veya Papara numarası, methoda uygun olmalı' },
  );

walletRoutes.use('*', authMiddleware);

walletRoutes.use('*', async (c, next) => {
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
    console.error('[WALLET ERROR]', err);
    return c.json({ error: 'Internal error' }, 500);
  }
});

walletRoutes.get('/', async (c) => {
  const user = c.get('user');
  return c.json(await getWallet(user.sub));
});

walletRoutes.get('/transactions', async (c) => {
  const user = c.get('user');
  const type = c.req.query('type') as any;
  const cursor = c.req.query('cursor');
  const limit = Number(c.req.query('limit') ?? 20);
  return c.json(
    await listTransactions({
      userId: user.sub,
      type,
      cursor,
      limit: Math.min(Number.isFinite(limit) ? limit : 20, 100),
    }),
  );
});

walletRoutes.post('/transfer', zValidator('json', transferSchema), async (c) => {
  const user = c.get('user');
  const body = c.req.valid('json');
  return c.json(await transfer({ fromUserId: user.sub, ...body }));
});

walletRoutes.post('/withdraw', zValidator('json', withdrawalRequestSchema), async (c) => {
  const user = c.get('user');
  const body = c.req.valid('json');
  const destination =
    body.method === 'IBAN' ? (body.iban as string) : (body.paparaNumber as string);
  return c.json(
    await requestWithdrawal({
      userId: user.sub,
      amount: body.amount,
      currency: body.currency,
      method: body.method,
      destination,
    }),
  );
});

walletRoutes.post('/pay/:orderId', async (c) => {
  const user = c.get('user');
  const orderId = c.req.param('orderId');
  const meta = getRequestMeta(c);
  return c.json(await payWithWallet({ userId: user.sub, orderId, ...meta }));
});

walletRoutes.post(
  '/admin/adjust',
  requireAdmin(),
  zValidator('json', adminBalanceAdjustmentSchema),
  async (c) => {
    const admin = c.get('user');
    const body = c.req.valid('json');
    const meta = getRequestMeta(c);
    return c.json(await adminAdjustBalance({ adminId: admin.sub, ...body, ...meta }));
  },
);
