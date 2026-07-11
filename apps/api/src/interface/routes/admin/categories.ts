import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { createAdminStack, errorHandler } from '../../middleware/admin-stack';
import { listCategories } from '../../../application/usecases/category/list-categories';
import { createCategory } from '../../../application/usecases/category/create-category';
import { updateCategory } from '../../../application/usecases/category/update-category';
import { deleteCategory } from '../../../application/usecases/category/delete-category';
import { getRequestMeta } from '../../middleware/request-meta';
import { createCategorySchema, updateCategorySchema } from '../products.schema';

export const adminCategoriesRoutes = new Hono();

adminCategoriesRoutes.use('*', ...createAdminStack());

adminCategoriesRoutes.use('*', async (c, next) => {
  try {
    await next();
  } catch (err) {
    return errorHandler(err, c);
  }
});

adminCategoriesRoutes.get('/', async (c) => {
  return c.json({ items: await listCategories({ isActive: false }) });
});

adminCategoriesRoutes.post('/', zValidator('json', createCategorySchema), async (c) => {
  const admin = c.get('user');
  const body = c.req.valid('json');
  const meta = getRequestMeta(c);
  return c.json(await createCategory({ adminId: admin.sub, ...body, ...meta }), 201);
});

adminCategoriesRoutes.patch('/:id', zValidator('json', updateCategorySchema), async (c) => {
  const admin = c.get('user');
  const id = c.req.param('id');
  const body = c.req.valid('json');
  const meta = getRequestMeta(c);
  return c.json(await updateCategory({ id, adminId: admin.sub, data: body, ...meta }));
});

adminCategoriesRoutes.delete('/:id', async (c) => {
  const admin = c.get('user');
  const id = c.req.param('id');
  const meta = getRequestMeta(c);
  return c.json(await deleteCategory({ id, adminId: admin.sub, ...meta }));
});
