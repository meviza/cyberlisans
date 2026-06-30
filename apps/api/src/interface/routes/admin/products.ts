import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { ZodError } from 'zod';
import { authMiddleware, requireAdmin } from '../../../infrastructure/auth';
import { createProduct } from '../../../domain/usecases/product/create-product';
import { updateProduct } from '../../../domain/usecases/product/update-product';
import { deleteProduct } from '../../../domain/usecases/product/delete-product';
import { listProductKeys } from '../../../domain/usecases/product/list-keys';
import { bulkAddKeys } from '../../../domain/usecases/product/bulk-add-keys';
import { deleteProductKey } from '../../../domain/usecases/product/delete-key';
import { getProduct } from '../../../domain/usecases/product/get-product';
import { getRequestMeta } from '../../middleware/request-meta';
import { PaymentError } from '@cyberlisans/payments/errors';
import {
  bulkAddKeysSchema,
  createProductSchema,
  listKeysQuerySchema,
  updateProductSchema,
} from '../products.schema';

export const adminProductsRoutes = new Hono();

adminProductsRoutes.use('*', authMiddleware, requireAdmin());

adminProductsRoutes.use('*', async (c, next) => {
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
    console.error('[ADMIN PRODUCTS ERROR]', err);
    return c.json({ error: 'Internal error' }, 500);
  }
});

adminProductsRoutes.post('/', zValidator('json', createProductSchema), async (c) => {
  const admin = c.get('user');
  const body = c.req.valid('json');
  const meta = getRequestMeta(c);
  const product = await createProduct({
    adminId: admin.sub,
    ...body,
    ...meta,
  });
  return c.json(product, 201);
});

adminProductsRoutes.patch('/:id', zValidator('json', updateProductSchema), async (c) => {
  const admin = c.get('user');
  const id = c.req.param('id');
  const body = c.req.valid('json');
  const meta = getRequestMeta(c);
  return c.json(await updateProduct({ id, adminId: admin.sub, data: body, ...meta }));
});

adminProductsRoutes.delete('/:id', async (c) => {
  const admin = c.get('user');
  const id = c.req.param('id');
  const meta = getRequestMeta(c);
  return c.json(await deleteProduct({ id, adminId: admin.sub, ...meta }));
});

adminProductsRoutes.get('/:id', async (c) => {
  const id = c.req.param('id');
  return c.json(await getProduct(id));
});

adminProductsRoutes.get('/:id/keys', zValidator('query', listKeysQuerySchema), async (c) => {
  const id = c.req.param('id');
  const q = c.req.valid('query');
  return c.json(
    await listProductKeys({
      productId: id,
      availableOnly: q.availableOnly,
      page: q.page,
      limit: q.limit,
    }),
  );
});

adminProductsRoutes.post('/:id/keys', zValidator('json', bulkAddKeysSchema), async (c) => {
  const admin = c.get('user');
  const id = c.req.param('id');
  const body = c.req.valid('json');
  const meta = getRequestMeta(c);
  return c.json(
    await bulkAddKeys({
      productId: id,
      codes: body.codes,
      adminId: admin.sub,
      ...meta,
    }),
    201,
  );
});

adminProductsRoutes.delete('/keys/:keyId', async (c) => {
  const admin = c.get('user');
  const keyId = c.req.param('keyId');
  const meta = getRequestMeta(c);
  return c.json(await deleteProductKey({ keyId, adminId: admin.sub, ...meta }));
});
