import { z } from 'zod';

export const listProductsQuerySchema = z.object({
  category: z.string().max(100).optional(),
  brand: z.string().max(100).optional(),
  search: z.string().max(100).optional(),
  isFeatured: z
    .union([z.literal('true'), z.literal('false')])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === 'true')),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
  currency: z.enum(['TRY', 'USD', 'EUR', 'USDT']).optional(),
  sort: z
    .enum(['newest', 'oldest', 'price_asc', 'price_desc', 'popular', 'featured'])
    .default('newest'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(24),
  tags: z
    .union([z.string(), z.array(z.string())])
    .optional()
    .transform((v) => {
      if (!v) return undefined;
      if (Array.isArray(v)) return v;
      return v
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    }),
});

export const createProductSchema = z.object({
  categoryId: z.string().uuid(),
  brandId: z.string().uuid().optional(),
  slug: z
    .string()
    .min(3)
    .max(100)
    .regex(/^[a-z0-9-]+$/),
  title: z.string().min(3).max(200),
  description: z.string().max(2000).optional(),
  imageUrl: z.string().url().optional(),
  modelUrl: z.string().url().optional(),
  priceTry: z.number().nonnegative(),
  priceUsd: z.number().nonnegative(),
  priceEur: z.number().nonnegative(),
  priceUsdt: z.number().nonnegative(),
  stock: z.number().int().nonnegative(),
  deliveryType: z.enum(['KEY', 'DOWNLOAD', 'API_CREDITS', 'MANUAL']),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  tags: z.array(z.string().max(30)).max(20).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  sortOrder: z.number().int().default(0),
});

export const updateProductSchema = createProductSchema.partial();

export const bulkAddKeysSchema = z.object({
  codes: z.array(z.string().min(1).max(500)).min(1).max(500),
});

export const listKeysQuerySchema = z.object({
  availableOnly: z
    .union([z.literal('true'), z.literal('false')])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === 'true')),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(200).default(50),
});

export const createCategorySchema = z.object({
  slug: z
    .string()
    .min(2)
    .max(50)
    .regex(/^[a-z0-9-]+$/),
  name: z.string().min(2).max(100),
  nameEn: z.string().min(2).max(100).optional(),
  nameDe: z.string().min(2).max(100).optional(),
  nameAr: z.string().min(2).max(100).optional(),
  nameRu: z.string().min(2).max(100).optional(),
  icon: z.string().max(50).optional(),
  description: z.string().max(500).optional(),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

export const updateCategorySchema = createCategorySchema.partial();

export const createBrandSchema = z.object({
  slug: z
    .string()
    .min(2)
    .max(50)
    .regex(/^[a-z0-9-]+$/),
  name: z.string().min(2).max(100),
  logoUrl: z.string().url().optional(),
  websiteUrl: z.string().url().optional(),
  isActive: z.boolean().default(true),
});

export const updateBrandSchema = createBrandSchema.partial();

export type ListProductsQuery = z.infer<typeof listProductsQuerySchema>;
export type CreateProductBody = z.infer<typeof createProductSchema>;
export type UpdateProductBody = z.infer<typeof updateProductSchema>;
export type BulkAddKeysBody = z.infer<typeof bulkAddKeysSchema>;
export type ListKeysQuery = z.infer<typeof listKeysQuerySchema>;
export type CreateCategoryBody = z.infer<typeof createCategorySchema>;
export type UpdateCategoryBody = z.infer<typeof updateCategorySchema>;
export type CreateBrandBody = z.infer<typeof createBrandSchema>;
export type UpdateBrandBody = z.infer<typeof updateBrandSchema>;
