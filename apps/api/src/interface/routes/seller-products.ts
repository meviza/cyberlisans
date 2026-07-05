import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { authMiddleware } from '../../infrastructure/auth';
import { getRequestMeta } from '../middleware/request-meta';
import { errorHandler } from '../middleware/error-handler';
import { sellerProductRepository } from '../../infrastructure/repositories/product.repository';
import { sellerRepository } from '../../infrastructure/repositories/seller.repository';
import { auditRepository } from '../../infrastructure/repositories/audit.repository';
import { categoryRepository } from '../../infrastructure/repositories/category.repository';
import { brandRepository } from '../../infrastructure/repositories/brand.repository';
import { CreateProductUseCase } from '../../application/usecases/product/create-product';
import { UpdateProductUseCase } from '../../application/usecases/product/update-product';
import { DeleteProductUseCase } from '../../application/usecases/product/delete-product';
import { ListSellerProductsUseCase } from '../../application/usecases/product/list-seller-products';

export const sellerProductsRoutes = new Hono();

const createSchema = z
  .object({
    title: z.string().min(3).max(200),
    slug: z
      .string()
      .min(3)
      .max(100)
      .regex(/^[a-z0-9-]+$/)
      .optional(),
    description: z.string().max(2000).optional(),
    imageUrl: z.string().url().optional(),
    images: z.array(z.string().url()).max(10).optional(),
    priceTry: z.number().positive().optional(),
    priceUsd: z.number().positive().optional(),
    priceEur: z.number().positive().optional(),
    priceUsdt: z.number().positive().optional(),
    stock: z.number().int().nonnegative(),
    categoryId: z.string().uuid(),
    brandId: z.string().uuid().optional(),
    deliveryType: z.enum(['AUTO', 'MANUAL', 'KEY']).optional(),
    digitalContent: z.string().max(20000).optional(),
    autoDelivery: z.boolean().optional(),
    minDeliverySeconds: z.number().int().nonnegative().optional(),
    maxDeliverySeconds: z.number().int().nonnegative().optional(),
    productKeyIds: z.array(z.string().uuid()).optional(),
  })
  .refine((d) => d.priceTry || d.priceUsd || d.priceEur || d.priceUsdt, {
    message: 'At least one price currency required',
    path: ['priceTry'],
  });

const updateSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  description: z.string().max(2000).nullable().optional(),
  imageUrl: z.string().url().nullable().optional(),
  images: z.array(z.string().url()).max(10).optional(),
  priceTry: z.number().positive().optional(),
  priceUsd: z.number().positive().optional(),
  priceEur: z.number().positive().optional(),
  priceUsdt: z.number().positive().optional(),
  stock: z.number().int().nonnegative().optional(),
  categoryId: z.string().uuid().optional(),
  brandId: z.string().uuid().nullable().optional(),
});

const listQuerySchema = z.object({
  status: z.enum(['PENDING_REVIEW', 'ACTIVE', 'REJECTED', 'DELETED']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

sellerProductsRoutes.use('*', async (c, next) => {
  try {
    await next();
  } catch (err) {
    return errorHandler(err, c);
  }
});

sellerProductsRoutes.use('*', authMiddleware);

const listDeps = { sellers: sellerRepository, products: sellerProductRepository };

sellerProductsRoutes.get('/', zValidator('query', listQuerySchema), async (c) => {
  const user = c.get('user');
  const q = c.req.valid('query');
  const uc = new ListSellerProductsUseCase(listDeps);
  return c.json(
    await uc.execute({ userId: user.sub, status: q.status, page: q.page, limit: q.limit }),
  );
});

sellerProductsRoutes.post('/', zValidator('json', createSchema), async (c) => {
  const user = c.get('user');
  const body = c.req.valid('json');
  const meta = getRequestMeta(c);
  const uc = new CreateProductUseCase({
    sellers: sellerRepository,
    products: sellerProductRepository,
    categories: categoryRepository,
    brands: brandRepository,
    audit: auditRepository,
  });
  const out = await uc.execute(
    {
      userId: user.sub,
      title: body.title,
      slug: body.slug,
      description: body.description,
      imageUrl: body.imageUrl,
      images: body.images,
      priceTry: body.priceTry,
      priceUsd: body.priceUsd,
      priceEur: body.priceEur,
      priceUsdt: body.priceUsdt,
      stock: body.stock,
      categoryId: body.categoryId,
      brandId: body.brandId,
      deliveryType: body.deliveryType,
      digitalContent: body.digitalContent,
      autoDelivery: body.autoDelivery,
      minDeliverySeconds: body.minDeliverySeconds,
      maxDeliverySeconds: body.maxDeliverySeconds,
      productKeyIds: body.productKeyIds,
    },
    meta,
  );
  return c.json(out, 201);
});

sellerProductsRoutes.put('/:id', zValidator('json', updateSchema), async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');
  const body = c.req.valid('json');
  const meta = getRequestMeta(c);
  const uc = new UpdateProductUseCase({
    sellers: sellerRepository,
    products: sellerProductRepository,
    categories: categoryRepository,
    brands: brandRepository,
    audit: auditRepository,
  });
  return c.json(await uc.execute({ productId: id, userId: user.sub, updates: body }, meta));
});

sellerProductsRoutes.patch('/:id', zValidator('json', updateSchema), async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');
  const body = c.req.valid('json');
  const meta = getRequestMeta(c);
  const uc = new UpdateProductUseCase({
    sellers: sellerRepository,
    products: sellerProductRepository,
    categories: categoryRepository,
    brands: brandRepository,
    audit: auditRepository,
  });
  return c.json(await uc.execute({ productId: id, userId: user.sub, updates: body }, meta));
});

sellerProductsRoutes.delete('/:id', async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');
  const meta = getRequestMeta(c);
  const uc = new DeleteProductUseCase({
    sellers: sellerRepository,
    products: sellerProductRepository,
    audit: auditRepository,
  });
  return c.json(await uc.execute({ productId: id, userId: user.sub }, meta));
});

sellerProductsRoutes.get('/:id', async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');
  const product = await sellerProductRepository.findSellerProductById(id);
  if (!product) return c.json({ error: 'Ürün bulunamadı', code: 'PRODUCT_NOT_FOUND' }, 404);
  const seller = await sellerRepository.findByUserId(user.sub);
  if (!seller || product.sellerId !== seller.id) {
    return c.json({ error: 'Bu ürün size ait değil', code: 'FORBIDDEN' }, 403);
  }
  return c.json(product);
});
