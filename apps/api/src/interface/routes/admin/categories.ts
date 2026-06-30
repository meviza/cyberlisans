import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { ZodError } from 'zod';
import { authMiddleware, requireAdmin } from '../../../infrastructure/auth';
import { listCategories } from '../../../domain/usecases/category/list-categories';
import { createCategory } from '../../../domain/usecases/category/create-category';
import { updateCategory } from '../../../domain/usecases/category/update-category';
import { deleteCategory } from '../../../domain/usecases/category/delete-category';
import { getRequestMeta } from '../../middleware/request-meta';
import { PaymentError } from '@cyberlisans/payments/errors';
import { createCategorySchema, updateCategorySchema } from '../products.schema';

export const adminCategoriesRoutes = new Hono();

adminCategoriesRoutes.use('*', authMiddleware, requireAdmin());

adminCategoriesRoutes.use('*', async (c, next) => {
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
    console.error('[ADMIN CATEGORIES ERROR]', err);
    return c.json({ error: 'Internal error' }, 500);
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
