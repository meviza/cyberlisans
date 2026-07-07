/**
 * Product type re-exports.
 *
 * Once upon a time, this module contained a hardcoded array of products.
 * That array drifted out of sync with the database and caused real bugs
 * (categories showing the wrong count, related products pointing to dead slugs).
 *
 * Now: data lives in the database. This file exposes ONLY the Product type
 * that legacy UI components (ProductCard, ProductGrid, ProductDetail) consume.
 *
 * To get actual data, import from `@/lib/products-fetcher` (server) or
 * `@/lib/api-client` (client).
 */

export interface Product {
  id: string;
  slug: string;
  title: string;
  category: 'Oyun' | 'Yazılım' | 'AI API';
  categorySlug: 'oyun' | 'yazilim' | 'ai-api';
  brand: string;
  image: string;
  images: string[];
  price: number;
  currency: 'TRY';
  stock: number;
  featured: boolean;
  sold: number;
  createdAt: string;
  description: string;
}

export type {
  ProductSummary,
  ProductDetail,
  ProductListResponse,
  CategoryRow,
  BrandRow,
} from './products-fetcher';
