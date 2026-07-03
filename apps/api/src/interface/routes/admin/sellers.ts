import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { createAdminStack, errorHandler } from '../../middleware/admin-stack';
import { getRequestMeta } from '../../middleware/request-meta';
import { ApproveSellerUseCase } from '../../../application/usecases/admin/approve-seller';
import { RejectSellerUseCase } from '../../../application/usecases/admin/reject-seller';
import { SuspendSellerUseCase } from '../../../application/usecases/admin/suspend-seller';
import { ReactivateSellerUseCase } from '../../../application/usecases/admin/reactivate-seller';
import {
  ListAllSellersUseCase,
  ListPendingSellersUseCase,
  GetAdminSellerUseCase,
} from '../../../application/usecases/admin/list-sellers';
import type { SellerRepositoryPort } from '../../../application/ports/seller';
import type { IAuditRepository } from '../../../application/ports/repositories';

export const adminSellersRoutes = new Hono();

adminSellersRoutes.use('*', ...createAdminStack());

const listSchema = z.object({
  status: z.enum(['PENDING', 'APPROVED', 'SUSPENDED', 'REJECTED']).optional(),
  search: z.string().trim().max(200).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

const rejectSchema = z.object({ reason: z.string().min(5).max(500) });
const suspendSchema = z.object({ reason: z.string().min(5).max(500) });
const approveSchema = z.object({ notes: z.string().max(1000).optional() });

adminSellersRoutes.onError((err, c) => errorHandler(err, c));

adminSellersRoutes.get('/pending', async (c) => {
  const page = Number(c.req.query('page') ?? 1);
  const limit = Math.min(Number(c.req.query('limit') ?? 20), 100);
  const { sellers, audit } = await importWire();
  const uc = new ListPendingSellersUseCase({ sellers, audit });
  return c.json(await uc.execute(page, limit));
});

adminSellersRoutes.get('/', zValidator('query', listSchema), async (c) => {
  const q = c.req.valid('query');
  const { sellers, audit } = await importWire();
  const uc = new ListAllSellersUseCase({ sellers, audit });
  return c.json(
    await uc.execute({
      status: q.status,
      search: q.search,
      page: q.page,
      limit: q.limit,
    }),
  );
});

adminSellersRoutes.get('/:id', async (c) => {
  const id = c.req.param('id');
  const { sellers, audit } = await importWire();
  const uc = new GetAdminSellerUseCase({ sellers, audit });
  return c.json(await uc.execute(id));
});

adminSellersRoutes.post('/:id/approve', zValidator('json', approveSchema), async (c) => {
  const admin = c.get('user');
  const id = c.req.param('id');
  const body = c.req.valid('json');
  const { sellers, audit } = await importWire();
  const uc = new ApproveSellerUseCase({ sellers, audit });
  return c.json(
    await uc.execute({
      sellerId: id,
      adminId: admin.sub,
      notes: body.notes,
      meta: getRequestMeta(c),
    }),
  );
});

adminSellersRoutes.post('/:id/reject', zValidator('json', rejectSchema), async (c) => {
  const admin = c.get('user');
  const id = c.req.param('id');
  const body = c.req.valid('json');
  const { sellers, audit } = await importWire();
  const uc = new RejectSellerUseCase({ sellers, audit });
  return c.json(
    await uc.execute({
      sellerId: id,
      adminId: admin.sub,
      reason: body.reason,
      meta: getRequestMeta(c),
    }),
  );
});

adminSellersRoutes.post('/:id/suspend', zValidator('json', suspendSchema), async (c) => {
  const admin = c.get('user');
  const id = c.req.param('id');
  const body = c.req.valid('json');
  const { sellers, audit } = await importWire();
  const uc = new SuspendSellerUseCase({ sellers, audit });
  return c.json(
    await uc.execute({
      sellerId: id,
      adminId: admin.sub,
      reason: body.reason,
      meta: getRequestMeta(c),
    }),
  );
});

adminSellersRoutes.post('/:id/reactivate', async (c) => {
  const admin = c.get('user');
  const id = c.req.param('id');
  const { sellers, audit } = await importWire();
  const uc = new ReactivateSellerUseCase({ sellers, audit });
  return c.json(await uc.execute({ sellerId: id, adminId: admin.sub, meta: getRequestMeta(c) }));
});

async function importWire(): Promise<{ sellers: SellerRepositoryPort; audit: IAuditRepository }> {
  const sellerMod = await import('../../../infrastructure/repositories/seller.repository');
  const auditMod = await import('../../../infrastructure/repositories/audit.repository');
  return { sellers: sellerMod.sellerRepository, audit: auditMod.auditRepository };
}
