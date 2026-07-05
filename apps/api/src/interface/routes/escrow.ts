import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { authMiddleware, requireAdmin } from '../../infrastructure/auth';
import { errorHandler } from '../middleware/error-handler';
import { getRequestMeta } from '../middleware/request-meta';
import { CreateEscrowUseCase } from '../../application/usecases/escrow/create-escrow';
import { ReleaseEscrowUseCase } from '../../application/usecases/escrow/release-escrow';
import { escrowRepository } from '../../infrastructure/repositories/escrow.repository';
import { sellerRepository } from '../../infrastructure/repositories/seller.repository';
import { auditRepository } from '../../infrastructure/repositories/audit.repository';
import { EscrowForbiddenError } from '../../domain/errors/escrow';
import { supabaseAdmin } from '../../infrastructure/supabase-db';

export const escrowRoutes = new Hono();

escrowRoutes.use('*', authMiddleware);
escrowRoutes.onError((err, c) => errorHandler(err, c));

const createSchema = z.object({
  orderId: z.string().uuid(),
  sellerId: z.string().uuid(),
  amount: z.number().positive().max(1_000_000),
  commissionRate: z.number().min(0).max(50),
  currency: z.enum(['TRY', 'USD', 'EUR', 'USDT']).default('TRY'),
});

escrowRoutes.post('/', zValidator('json', createSchema), async (c) => {
  const user = c.get('user');
  const body = c.req.valid('json');
  const meta = getRequestMeta(c);
  const uc = new CreateEscrowUseCase({
    escrow: escrowRepository,
    sellers: sellerRepository,
    audit: auditRepository,
  });
  return c.json(
    await uc.execute({
      orderId: body.orderId,
      sellerId: body.sellerId,
      customerId: user.sub,
      amount: body.amount,
      commissionRate: body.commissionRate,
      currency: body.currency,
      meta,
    }),
    201,
  );
});

const releaseSchema = z.object({ reason: z.string().min(5).max(500) });

escrowRoutes.post('/:id/release', zValidator('json', releaseSchema), async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');
  const body = c.req.valid('json');
  const meta = getRequestMeta(c);

  if (user.role === 'CUSTOMER') {
    const esc = await escrowRepository.findById(id);
    if (!esc || esc.customerId !== user.sub) throw new EscrowForbiddenError();
  }

  const uc = new ReleaseEscrowUseCase({ audit: auditRepository });
  return c.json(
    await uc.execute({ escrowId: id, releasedBy: user.sub, reason: body.reason, meta }),
  );
});

escrowRoutes.post('/:id/refund', requireAdmin(), zValidator('json', releaseSchema), async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');
  const body = c.req.valid('json');
  const { error } = await supabaseAdmin().rpc('refund_escrow', {
    p_escrow_id: id,
    p_refunded_by: user.sub,
    p_reason: body.reason,
  });
  if (error) throw new EscrowForbiddenError(error.message);
  await auditRepository.log({
    actorId: user.sub,
    action: 'STATUS_CHANGE',
    targetType: 'escrow',
    targetId: id,
    payload: { event: 'refund', reason: body.reason },
  });
  return c.json({ ok: true, escrowId: id, status: 'REFUNDED' });
});

escrowRoutes.get('/:id', async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');
  const esc = await escrowRepository.findById(id);
  if (!esc) throw new EscrowForbiddenError('Escrow bulunamadı');
  const allowed =
    esc.customerId === user.sub || esc.sellerId === user.sub || user.role !== 'CUSTOMER';
  if (!allowed) throw new EscrowForbiddenError();
  return c.json(esc);
});
