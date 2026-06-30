import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { ZodError } from 'zod';
import { listProducts } from '../../domain/usecases/product/list-products';
import { getProduct } from '../../domain/usecases/product/get-product';
import { listCategories } from '../../domain/usecases/category/list-categories';
import { listBrands } from '../../domain/usecases/brand/list-brands';
import { productRepository } from '../../infrastructure/repositories/product.repository';
import { PaymentError } from '@cyberlisans/payments/errors';
import { listProductsQuerySchema } from './products.schema';

export const productsRoutes = new Hono();

productsRoutes.use('*', async (c, next) => {
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
    console.error('[PRODUCTS ERROR]', err);
    return c.json({ error: 'Internal error' }, 500);
  }
});

productsRoutes.get('/featured', async (c) => {
  const limit = Math.min(Number(c.req.query('limit') ?? 12), 50);
  const items = await productRepository.getFeatured(Number.isFinite(limit) ? limit : 12);
  return c.json({ items });
});

productsRoutes.get('/categories', async (c) => {
  return c.json({ items: await listCategories({ isActive: true }) });
});

productsRoutes.get('/brands', async (c) => {
  return c.json({ items: await listBrands({ isActive: true }) });
});

productsRoutes.get('/', zValidator('query', listProductsQuerySchema), async (c) => {
  const q = c.req.valid('query');
  return c.json(await listProducts(q));
});

productsRoutes.get('/:slug', async (c) => {
  const slug = c.req.param('slug');
  return c.json(await getProduct(slug));
});
