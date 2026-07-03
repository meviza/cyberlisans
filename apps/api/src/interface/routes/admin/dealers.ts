import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { createAdminStack, errorHandler } from '../../middleware/admin-stack';
import { listDealers } from '../../../domain/usecases/dealer/list-dealers';
import {
  getDealerProfileById,
  assertDealerApproved,
} from '../../../domain/usecases/dealer/get-dealer-profile';
import { updateDealerProfile } from '../../../domain/usecases/dealer/update-dealer-profile';
import {
  approveDealer,
  suspendDealer,
  rejectDealer,
} from '../../../domain/usecases/dealer/approve-dealer';
import { listDealerSales, getDealerStats } from '../../../domain/usecases/dealer/list-dealer-sales';
import { processDealerPayout } from '../../../domain/usecases/dealer/request-dealer-payout';
import { getRequestMeta } from '../../middleware/request-meta';
import {
  adminDealerUpdateSchema,
  dealerRejectSchema,
  dealerSuspendSchema,
  dealerPayoutProcessSchema,
  listDealersQuerySchema,
  listDealerSalesQuerySchema,
} from '../dealer.schema';

export const adminDealersRoutes = new Hono();

adminDealersRoutes.use('*', ...createAdminStack());

adminDealersRoutes.use('*', async (c, next) => {
  try {
    await next();
  } catch (err) {
    return errorHandler(err, c);
  }
});

adminDealersRoutes.get('/', zValidator('query', listDealersQuerySchema), async (c) => {
  const q = c.req.valid('query');
  return c.json(
    await listDealers({
      status: q.status,
      search: q.search,
      page: q.page,
      limit: q.limit,
    }),
  );
});

adminDealersRoutes.get('/:id', async (c) => {
  const id = c.req.param('id');
  return c.json(await getDealerProfileById(id));
});

adminDealersRoutes.patch('/:id', zValidator('json', adminDealerUpdateSchema), async (c) => {
  const admin = c.get('user');
  const id = c.req.param('id');
  const body = c.req.valid('json');
  const meta = getRequestMeta(c);
  return c.json(
    await updateDealerProfile({
      dealerId: id,
      actorId: admin.sub,
      isAdmin: true,
      data: body,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    }),
  );
});

adminDealersRoutes.post('/:id/approve', async (c) => {
  const admin = c.get('user');
  const id = c.req.param('id');
  const meta = getRequestMeta(c);
  return c.json(
    await approveDealer({
      dealerId: id,
      adminId: admin.sub,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    }),
  );
});

adminDealersRoutes.post('/:id/suspend', zValidator('json', dealerSuspendSchema), async (c) => {
  const admin = c.get('user');
  const id = c.req.param('id');
  const body = c.req.valid('json');
  const meta = getRequestMeta(c);
  return c.json(
    await suspendDealer({
      dealerId: id,
      adminId: admin.sub,
      reason: body.reason,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    }),
  );
});

adminDealersRoutes.post('/:id/reject', zValidator('json', dealerRejectSchema), async (c) => {
  const admin = c.get('user');
  const id = c.req.param('id');
  const body = c.req.valid('json');
  const meta = getRequestMeta(c);
  return c.json(
    await rejectDealer({
      dealerId: id,
      adminId: admin.sub,
      reason: body.reason,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    }),
  );
});

adminDealersRoutes.get('/:id/sales', zValidator('query', listDealerSalesQuerySchema), async (c) => {
  const id = c.req.param('id');
  const q = c.req.valid('query');
  return c.json(
    await listDealerSales({
      dealerId: id,
      status: q.status,
      page: q.page,
      limit: q.limit,
    }),
  );
});

adminDealersRoutes.get('/:id/stats', async (c) => {
  const id = c.req.param('id');
  return c.json(await getDealerStats(id));
});

adminDealersRoutes.get('/:id/assert-approved', async (c) => {
  const id = c.req.param('id');
  const profile = await getDealerProfileById(id);
  assertDealerApproved(profile.status);
  return c.json({ ok: true, status: profile.status });
});

const listPayoutsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(['PENDING', 'PROCESSING', 'COMPLETED', 'REJECTED']).optional(),
});

adminDealersRoutes.get('/:id/payouts', zValidator('query', listPayoutsSchema), async (c) => {
  const id = c.req.param('id');
  const q = c.req.valid('query');
  const { dealerPayoutRepository } = await import(
    '../../../infrastructure/repositories/dealer-payout.repository'
  );
  return c.json(
    await dealerPayoutRepository.listByDealer(id, {
      page: q.page,
      limit: q.limit,
      status: q.status,
    }),
  );
});

adminDealersRoutes.post(
  '/:id/payouts/:payoutId/process',
  zValidator('json', dealerPayoutProcessSchema),
  async (c) => {
    const admin = c.get('user');
    const id = c.req.param('id');
    const payoutId = c.req.param('payoutId');
    const body = c.req.valid('json');
    const meta = getRequestMeta(c);
    return c.json(
      await processDealerPayout({
        dealerId: id,
        payoutId,
        adminId: admin.sub,
        action: body.action,
        rejectionReason: body.rejectionReason,
        ipAddress: meta.ipAddress,
        userAgent: meta.userAgent,
      }),
    );
  },
);
