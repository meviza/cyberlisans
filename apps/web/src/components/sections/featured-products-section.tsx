import Link from 'next/link';
import type { Product } from '@/lib/products';
import { fetchFeaturedProducts } from '@/lib/products-fetcher';

function ProductCardInline({ product }: { product: Product }) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group surface-card overflow-hidden transition hover:border-brand-accent/30"
    >
      <div
        className="aspect-square w-full bg-brand-surface"
        style={product.image ? { background: product.image } : undefined}
      />
      <div className="p-4">
        <div className="mb-1 text-xs font-medium uppercase tracking-wider text-brand-muted">
          {product.brand}
        </div>
        <h3 className="mb-2 line-clamp-2 text-sm font-semibold text-white group-hover:text-brand-accent">
          {product.title}
        </h3>
        <div className="flex items-center justify-between">
          <span className="text-base font-semibold text-white">{product.price} ₺</span>
          <span className="text-xs text-brand-muted">{product.stock} stok</span>
        </div>
      </div>
    </Link>
  );
}

function toCardProduct(p: import('@/lib/products-fetcher').ProductSummary): Product {
  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    category:
      p.categorySlug === 'yazilim' ? 'Yazılım' : p.categorySlug === 'ai-api' ? 'AI API' : 'Oyun',
    categorySlug:
      p.categorySlug === 'yazilim' || p.categorySlug === 'ai-api' ? p.categorySlug : 'oyun',
    brand: p.brand,
    image: p.image ?? '',
    images: [],
    price: p.price,
    currency: 'TRY',
    stock: p.stock,
    featured: p.featured,
    sold: p.sold,
    createdAt: p.createdAt,
    description: '',
  };
}

export async function FeaturedProductsSection() {
  const featured = await fetchFeaturedProducts(8);
  const items = featured.map(toCardProduct);

  return (
    <section className="section-pad border-t border-white/[0.06] bg-brand-surface/30">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-medium text-brand-accent">Vitrin</p>
            <h2 className="section-title mt-2">Öne çıkan ürünler</h2>
            <p className="section-lead">En çok tercih edilen dijital lisanslar</p>
          </div>
          <Link href="/products" className="text-sm font-medium text-brand-accent hover:underline">
            Tümünü gör →
          </Link>
        </div>

        {items.length === 0 ? (
          <div className="mt-12 rounded-2xl border border-dashed border-white/10 px-6 py-16 text-center">
            <p className="text-sm text-brand-muted">Henüz öne çıkan ürün yok.</p>
            <Link href="/products" className="btn-secondary-outline mt-4 inline-flex">
              Mağazaya git
            </Link>
          </div>
        ) : (
          <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {items.map((p) => (
              <ProductCardInline key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
