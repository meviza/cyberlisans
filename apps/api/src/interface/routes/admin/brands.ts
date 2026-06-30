import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { ZodError } from 'zod';
import { authMiddleware, requireAdmin } from '../../../infrastructure/auth';
import { listBrands } from '../../../domain/usecases/brand/list-brands';
import { createBrand } from '../../../domain/usecases/brand/create-brand';
import { updateBrand } from '../../../domain/usecases/brand/update-brand';
import { deleteBrand } from '../../../domain/usecases/brand/delete-brand';
import { getRequestMeta } from '../../middleware/request-meta';
import { PaymentError } from '@cyberlisans/payments/errors';
import { createBrandSchema, updateBrandSchema } from '../products.schema';

export const adminBrandsRoutes = new Hono();

adminBrandsRoutes.use('*', authMiddleware, requireAdmin());

adminBrandsRoutes.use('*', async (c, next) => {
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
    console.error('[ADMIN BRANDS ERROR]', err);
    return c.json({ error: 'Internal error' }, 500);
  }
});

adminBrandsRoutes.get('/', async (c) => {
  return c.json({ items: await listBrands({ isActive: false }) });
});

adminBrandsRoutes.post('/', zValidator('json', createBrandSchema), async (c) => {
  const admin = c.get('user');
  const body = c.req.valid('json');
  const meta = getRequestMeta(c);
  return c.json(await createBrand({ adminId: admin.sub, ...body, ...meta }), 201);
});

adminBrandsRoutes.patch('/:id', zValidator('json', updateBrandSchema), async (c) => {
  const admin = c.get('user');
  const id = c.req.param('id');
  const body = c.req.valid('json');
  const meta = getRequestMeta(c);
  return c.json(await updateBrand({ id, adminId: admin.sub, data: body, ...meta }));
});

adminBrandsRoutes.delete('/:id', async (c) => {
  const admin = c.get('user');
  const id = c.req.param('id');
  const meta = getRequestMeta(c);
  return c.json(await deleteBrand({ id, adminId: admin.sub, ...meta }));
});
