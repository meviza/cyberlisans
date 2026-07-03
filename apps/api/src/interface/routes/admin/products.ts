import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { createProduct } from '../../../domain/usecases/product/create-product';
import { updateProduct } from '../../../domain/usecases/product/update-product';
import { deleteProduct } from '../../../domain/usecases/product/delete-product';
import { listProductKeys } from '../../../domain/usecases/product/list-keys';
import { bulkAddKeys } from '../../../domain/usecases/product/bulk-add-keys';
import { deleteProductKey } from '../../../domain/usecases/product/delete-key';
import { getProduct } from '../../../domain/usecases/product/get-product';
import { getRequestMeta } from '../../middleware/request-meta';
import { createAdminStack, errorHandler } from '../../middleware/admin-stack';
import { prisma } from '../../../infrastructure/db';
import {
  bulkAddKeysSchema,
  createProductSchema,
  listKeysQuerySchema,
  updateProductSchema,
} from '../products.schema';
import { z } from 'zod';

export const adminProductsRoutes = new Hono();

const adminStack = createAdminStack();
adminProductsRoutes.use('*', ...adminStack);

adminProductsRoutes.use('*', async (c, next) => {
  try {
    await next();
  } catch (err) {
    return errorHandler(err, c);
  }
});

const adminListProductsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().trim().max(100).optional(),
  categoryId: z.string().uuid().optional(),
  brandId: z.string().uuid().optional(),
  isActive: z
    .union([z.literal('true'), z.literal('false')])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === 'true')),
  maxStock: z.coerce.number().int().nonnegative().optional(),
});

adminProductsRoutes.get('/', zValidator('query', adminListProductsQuerySchema), async (c) => {
  const q = c.req.valid('query');
  const where: Record<string, unknown> = {};
  if (q.isActive !== undefined) where['isActive'] = q.isActive;
  if (q.categoryId) where['categoryId'] = q.categoryId;
  if (q.brandId) where['brandId'] = q.brandId;
  if (q.maxStock !== undefined) where['stock'] = { lte: q.maxStock };
  if (q.search) {
    where['OR'] = [
      { title: { contains: q.search, mode: 'insensitive' } },
      { slug: { contains: q.search, mode: 'insensitive' } },
      { category: { name: { contains: q.search, mode: 'insensitive' } } },
      { brand: { name: { contains: q.search, mode: 'insensitive' } } },
    ];
  }

  const [items, total] = await prisma.$transaction([
    prisma.product.findMany({
      where,
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      skip: (q.page - 1) * q.limit,
      take: q.limit,
      include: {
        category: { select: { id: true, name: true, slug: true } },
        brand: { select: { id: true, name: true, slug: true } },
        _count: { select: { productKeys: { where: { isUsed: false } } } },
      },
    }),
    prisma.product.count({ where }),
  ]);

  return c.json({
    items: items.map((p: any) => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      categoryId: p.categoryId,
      category: p.category.name,
      categorySlug: p.category.slug,
      brandId: p.brandId,
      brand: p.brand?.name ?? null,
      brandSlug: p.brand?.slug ?? null,
      stock: p.stock,
      availableKeys: p._count.productKeys,
      priceTry: Number(p.priceTry),
      priceUsd: Number(p.priceUsd),
      priceEur: Number(p.priceEur),
      priceUsdt: Number(p.priceUsdt),
      deliveryType: p.deliveryType,
      isActive: p.isActive,
      isFeatured: p.isFeatured,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    })),
    total,
    page: q.page,
    limit: q.limit,
    totalPages: Math.ceil(total / q.limit) || 1,
  });
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
