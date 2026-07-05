import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { createAdminStack, errorHandler } from '../../middleware/admin-stack';
import { getRequestMeta } from '../../middleware/request-meta';
import { sellerProductRepository } from '../../../infrastructure/repositories/product.repository';
import { auditRepository } from '../../../infrastructure/repositories/audit.repository';
import { ApproveProductUseCase } from '../../../application/usecases/product/approve-product';
import { RejectProductUseCase } from '../../../application/usecases/product/reject-product';
import { ListPendingProductsUseCase } from '../../../application/usecases/product/list-pending-products';

export const adminSellerProductsRoutes = new Hono();

adminSellerProductsRoutes.use('*', ...createAdminStack());
adminSellerProductsRoutes.onError((err, c) => errorHandler(err, c));

adminSellerProductsRoutes.get('/pending', async (c) => {
  const page = Number(c.req.query('page') ?? 1);
  const limit = Math.min(Number(c.req.query('limit') ?? 20), 100);
  const uc = new ListPendingProductsUseCase({ products: sellerProductRepository });
  return c.json(await uc.execute({ page, limit }));
});

const rejectSchema = z.object({ reason: z.string().min(5).max(500) });

adminSellerProductsRoutes.post('/:id/approve', async (c) => {
  const admin = c.get('user');
  const id = c.req.param('id');
  const uc = new ApproveProductUseCase({
    products: sellerProductRepository,
    audit: auditRepository,
  });
  return c.json(await uc.execute({ productId: id, adminId: admin.sub }, getRequestMeta(c)));
});

adminSellerProductsRoutes.post('/:id/reject', zValidator('json', rejectSchema), async (c) => {
  const admin = c.get('user');
  const id = c.req.param('id');
  const body = c.req.valid('json');
  const uc = new RejectProductUseCase({
    products: sellerProductRepository,
    audit: auditRepository,
  });
  return c.json(
    await uc.execute({ productId: id, adminId: admin.sub, reason: body.reason }, getRequestMeta(c)),
  );
});
