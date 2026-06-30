import { z } from 'zod';

export const productCreateSchema = z.object({
  categoryId: z.string().uuid(),
  brandId: z.string().uuid().optional(),
  slug: z.string().min(3).max(100).regex(/^[a-z0-9-]+$/),
  title: z.string().min(3).max(200),
  description: z.string().max(2000).optional(),
  imageUrl: z.string().url().optional(),
  modelUrl: z.string().url().optional(),
  priceTry: z.number().nonnegative(),
  priceUsd: z.number().nonnegative(),
  priceEur: z.number().nonnegative(),
  priceUsdt: z.number().nonnegative(),
  deliveryType: z.enum(['KEY', 'DOWNLOAD', 'API_CREDITS', 'MANUAL']),
  isFeatured: z.boolean().default(false),
  tags: z.array(z.string().max(30)).max(20).optional(),
  sortOrder: z.number().int().default(0),
});

export const productUpdateSchema = productCreateSchema.partial();

export const productKeyBulkSchema = z.object({
  productId: z.string().uuid(),
  codes: z.array(z.string().min(1).max(500)).min(1).max(500),
});

export const productQuerySchema = z.object({
  category: z.string().optional(),
  brand: z.string().optional(),
  search: z.string().max(100).optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  sort: z.enum(['newest', 'price_asc', 'price_desc', 'popular', 'featured']).default('newest'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(24),
});

export const categoryCreateSchema = z.object({
  slug: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/),
  name: z.string().min(2).max(100),
  nameEn: z.string().min(2).max(100).optional(),
  nameDe: z.string().min(2).max(100).optional(),
  nameAr: z.string().min(2).max(100).optional(),
  nameRu: z.string().min(2).max(100).optional(),
  icon: z.string().max(50).optional(),
  description: z.string().max(500).optional(),
  sortOrder: z.number().int().default(0),
});

export const brandCreateSchema = z.object({
  slug: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/),
  name: z.string().min(2).max(100),
  logoUrl: z.string().url().optional(),
  websiteUrl: z.string().url().optional(),
});

export type ProductCreateInput = z.infer<typeof productCreateSchema>;
export type ProductUpdateInput = z.infer<typeof productUpdateSchema>;
export type ProductKeyBulkInput = z.infer<typeof productKeyBulkSchema>;
export type ProductQueryInput = z.infer<typeof productQuerySchema>;
export type CategoryCreateInput = z.infer<typeof categoryCreateSchema>;
export type BrandCreateInput = z.infer<typeof brandCreateSchema>;