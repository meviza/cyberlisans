import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { createAdminStack, errorHandler } from '../../middleware/admin-stack';
import { listBrands } from '../../../application/usecases/brand/list-brands';
import { createBrand } from '../../../application/usecases/brand/create-brand';
import { updateBrand } from '../../../application/usecases/brand/update-brand';
import { deleteBrand } from '../../../application/usecases/brand/delete-brand';
import { getRequestMeta } from '../../middleware/request-meta';
import { createBrandSchema, updateBrandSchema } from '../products.schema';

export const adminBrandsRoutes = new Hono();

adminBrandsRoutes.use('*', ...createAdminStack());

adminBrandsRoutes.use('*', async (c, next) => {
  try {
    await next();
  } catch (err) {
    return errorHandler(err, c);
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
