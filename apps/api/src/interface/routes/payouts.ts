import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { authMiddleware } from '../../infrastructure/auth';
import { errorHandler } from '../middleware/error-handler';
import { getRequestMeta } from '../middleware/request-meta';
import { RequestPayoutUseCase } from '../../application/usecases/payout/request-payout';
import { payoutRepository } from '../../infrastructure/repositories/payout.repository';
import { sellerRepository } from '../../infrastructure/repositories/seller.repository';
import { auditRepository } from '../../infrastructure/repositories/audit.repository';
import { SellerNotFoundError } from '../../domain/errors/seller';
import { PayoutNotFoundError, PayoutForbiddenError } from '../../domain/errors/escrow';

export const payoutsRoutes = new Hono();

payoutsRoutes.use('*', authMiddleware);
payoutsRoutes.onError((err, c) => errorHandler(err, c));

const requestSchema = z.object({
  amount: z.number().positive().max(1_000_000),
  method: z.enum(['BANK', 'PAYPAL', 'CRYPTO']),
  destination: z.string().min(3).max(500),
  currency: z.enum(['TRY', 'USD', 'EUR', 'USDT']).default('TRY'),
  notes: z.string().max(500).optional(),
});

payoutsRoutes.post('/', zValidator('json', requestSchema), async (c) => {
  const user = c.get('user');
  const body = c.req.valid('json');
  const meta = getRequestMeta(c);
  const seller = await sellerRepository.findByUserId(user.sub);
  if (!seller) throw new SellerNotFoundError();
  const uc = new RequestPayoutUseCase({
    payouts: payoutRepository,
    sellers: sellerRepository,
    audit: auditRepository,
  });
  return c.json(
    await uc.execute({
      sellerId: seller.id,
      userId: user.sub,
      amount: body.amount,
      method: body.method,
      destination: body.destination,
      currency: body.currency,
      notes: body.notes,
      meta,
    }),
    201,
  );
});

payoutsRoutes.get('/me', async (c) => {
  const user = c.get('user');
  const page = Number(c.req.query('page') ?? 1);
  const limit = Math.min(Number(c.req.query('limit') ?? 20), 100);
  const status = c.req.query('status');
  const seller = await sellerRepository.findByUserId(user.sub);
  if (!seller) throw new SellerNotFoundError();
  return c.json(
    await payoutRepository.listBySeller(seller.id, {
      status: status as
        | 'PENDING'
        | 'PROCESSING'
        | 'COMPLETED'
        | 'REJECTED'
        | 'CANCELLED'
        | undefined,
      page,
      limit,
    }),
  );
});

payoutsRoutes.get('/:id', async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');
  const payout = await payoutRepository.findById(id);
  if (!payout) throw new PayoutNotFoundError();
  if (payout.userId !== user.sub && user.role === 'CUSTOMER') {
    throw new PayoutForbiddenError();
  }
  return c.json(payout);
});
