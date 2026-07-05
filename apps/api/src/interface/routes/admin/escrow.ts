import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { createAdminStack, errorHandler } from '../../middleware/admin-stack';
import { getRequestMeta } from '../../middleware/request-meta';
import { escrowRepository } from '../../../infrastructure/repositories/escrow.repository';
import { payoutRepository } from '../../../infrastructure/repositories/payout.repository';
import { disputeRepository } from '../../../infrastructure/repositories/dispute.repository';
import { auditRepository } from '../../../infrastructure/repositories/audit.repository';
import { ResolveDisputeUseCase } from '../../../application/usecases/dispute/resolve-dispute';
import { supabaseAdmin } from '../../../infrastructure/supabase-db';
import { PayoutNotFoundError, PayoutInvalidStatusError } from '../../../domain/errors/escrow';
import {
  escrowListSchema,
  payoutsListSchema,
  rejectPayoutSchema,
  resolveDisputeAdminSchema,
} from './escrow.schema';

export const adminEscrowRoutes = new Hono();

adminEscrowRoutes.use('*', ...createAdminStack());
adminEscrowRoutes.onError((err, c) => errorHandler(err, c));

adminEscrowRoutes.get('/escrow', zValidator('query', escrowListSchema), async (c) => {
  const q = c.req.valid('query');
  return c.json(
    await escrowRepository.list({
      status: q.status,
      from: q.from ? new Date(q.from) : undefined,
      to: q.to ? new Date(q.to) : undefined,
      page: q.page,
      limit: q.limit,
    }),
  );
});

adminEscrowRoutes.post('/escrow/auto-release', async (c) => {
  const { data, error } = await supabaseAdmin().rpc('auto_release_escrow');
  if (error) return c.json({ ok: false, error: error.message }, 500);
  await auditRepository.log({
    actorId: c.get('user').sub,
    action: 'STATUS_CHANGE',
    targetType: 'escrow',
    targetId: 'auto_release',
    payload: { released: data },
  });
  return c.json({ ok: true, released: data ?? 0 });
});

adminEscrowRoutes.get('/payouts', zValidator('query', payoutsListSchema), async (c) => {
  const q = c.req.valid('query');
  return c.json(await payoutRepository.list({ status: q.status, page: q.page, limit: q.limit }));
});

adminEscrowRoutes.post('/payouts/:id/approve', async (c) => {
  const admin = c.get('user');
  const id = c.req.param('id');
  const payout = await payoutRepository.findById(id);
  if (!payout) throw new PayoutNotFoundError();
  if (payout.status !== 'PENDING') throw new PayoutInvalidStatusError();
  const updated = await payoutRepository.updateStatus(id, 'PROCESSING', {
    processedById: admin.sub,
    processedAt: new Date(),
  });
  await auditRepository.log({
    actorId: admin.sub,
    action: 'STATUS_CHANGE',
    targetType: 'seller_payout',
    targetId: id,
    payload: { from: payout.status, to: 'PROCESSING' },
  });
  return c.json(updated);
});

adminEscrowRoutes.post('/payouts/:id/reject', zValidator('json', rejectPayoutSchema), async (c) => {
  const admin = c.get('user');
  const id = c.req.param('id');
  const body = c.req.valid('json');
  const payout = await payoutRepository.findById(id);
  if (!payout) throw new PayoutNotFoundError();
  if (payout.status === 'COMPLETED' || payout.status === 'REJECTED') {
    throw new PayoutInvalidStatusError();
  }
  const updated = await payoutRepository.updateStatus(id, 'REJECTED', {
    processedById: admin.sub,
    processedAt: new Date(),
    rejectionReason: body.rejectionReason,
  });
  await auditRepository.log({
    actorId: admin.sub,
    action: 'STATUS_CHANGE',
    targetType: 'seller_payout',
    targetId: id,
    payload: { from: payout.status, to: 'REJECTED', reason: body.rejectionReason },
  });
  return c.json(updated);
});

adminEscrowRoutes.post(
  '/disputes/:id/resolve',
  zValidator('json', resolveDisputeAdminSchema),
  async (c) => {
    const admin = c.get('user');
    const id = c.req.param('id');
    const body = c.req.valid('json');
    const meta = getRequestMeta(c);
    const uc = new ResolveDisputeUseCase({
      escrow: escrowRepository,
      disputes: disputeRepository,
      audit: auditRepository,
    });
    return c.json(
      await uc.execute({
        disputeId: id,
        resolvedBy: admin.sub,
        resolution: body.resolution,
        refundAmount: body.refundAmount,
        note: body.note,
        meta,
      }),
    );
  },
);
