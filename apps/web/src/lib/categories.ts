/**
 * Server-safe categories & brands metadata.
 *
 * The hardcoded `categories` array used to live in `@/lib/products.ts`. That
 * file is now type-only; this module is the single source of truth for the
 * category taxonomy that UI components render.
 */

export interface CategoryDisplay {
  slug: string;
  name: string;
  icon: 'gamepad' | 'package' | 'sparkles';
  count?: number;
}

export interface BrandDisplay {
  slug: string;
  name: string;
  count?: number;
}

export const CATEGORIES: CategoryDisplay[] = [
  { slug: 'oyun', name: 'Oyun', icon: 'gamepad' },
  { slug: 'yazilim', name: 'Yazılım', icon: 'package' },
  { slug: 'ai-api', name: 'AI API', icon: 'sparkles' },
];
