import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { authMiddleware, requireAdmin } from '../../infrastructure/auth';
import { errorHandler } from '../middleware/error-handler';
import { getRequestMeta } from '../middleware/request-meta';
import { CreateDisputeUseCase } from '../../application/usecases/dispute/create-dispute';
import { disputeRepository } from '../../infrastructure/repositories/dispute.repository';
import { escrowRepository } from '../../infrastructure/repositories/escrow.repository';
import { auditRepository } from '../../infrastructure/repositories/audit.repository';
import { DisputeNotFoundError } from '../../domain/errors/escrow';
import { PaymentError } from '@cyberlisans/payments/errors';

class DisputeForbiddenError extends PaymentError {
  constructor() {
    super('Bu itiraz üzerinde işlem yetkiniz yok', 'DISPUTE_FORBIDDEN', 403);
  }
}

export const disputesRoutes = new Hono();

disputesRoutes.use('*', authMiddleware);
disputesRoutes.onError((err, c) => errorHandler(err, c));

const createSchema = z.object({
  escrowId: z.string().uuid(),
  reason: z.string().min(5).max(200),
  description: z.string().max(2000).optional(),
});

disputesRoutes.post('/', zValidator('json', createSchema), async (c) => {
  const user = c.get('user');
  const body = c.req.valid('json');
  const meta = getRequestMeta(c);
  const uc = new CreateDisputeUseCase({
    escrow: escrowRepository,
    disputes: disputeRepository,
    audit: auditRepository,
  });
  return c.json(
    await uc.execute({
      escrowId: body.escrowId,
      openedBy: user.sub,
      reason: body.reason,
      description: body.description,
      meta,
    }),
    201,
  );
});

disputesRoutes.get('/me', async (c) => {
  const user = c.get('user');
  const page = Number(c.req.query('page') ?? 1);
  const limit = Math.min(Number(c.req.query('limit') ?? 20), 100);
  return c.json(
    await disputeRepository.list({
      customerId: user.sub,
      page,
      limit,
    }),
  );
});

const messageSchema = z.object({
  message: z.string().min(1).max(4000),
  attachmentUrl: z.string().url().max(500).optional(),
});

disputesRoutes.post('/:id/messages', zValidator('json', messageSchema), async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');
  const body = c.req.valid('json');
  const dispute = await disputeRepository.findById(id);
  if (!dispute) throw new DisputeNotFoundError();
  const role = user.role === 'CUSTOMER' ? 'CUSTOMER' : 'ADMIN';
  if (role === 'CUSTOMER' && dispute.openedById !== user.sub) {
    throw new DisputeForbiddenError();
  }
  const msg = await disputeRepository.addMessage({
    disputeId: dispute.id,
    senderId: user.sub,
    senderRole: role,
    message: body.message,
    attachmentUrl: body.attachmentUrl ?? null,
  });
  return c.json(msg, 201);
});

disputesRoutes.get('/:id/messages', async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');
  const dispute = await disputeRepository.findById(id);
  if (!dispute) throw new DisputeNotFoundError();
  if (user.role === 'CUSTOMER' && dispute.openedById !== user.sub) {
    throw new DisputeForbiddenError();
  }
  return c.json({ items: await disputeRepository.listMessages(dispute.id) });
});

void requireAdmin;
