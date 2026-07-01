import * as React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ChevronRight, Star } from 'lucide-react';

export const dynamic = 'force-dynamic';
import { ProductGallery } from '@/components/store/product-gallery';
import { ProductDetail } from '@/components/store/product-detail';
import { ProductCard } from '@/components/store/product-card';
import { StorefrontHeader } from '@/components/store/storefront-header';
import { ProductJsonLd, BreadcrumbJsonLd } from '@/components/seo/json-ld';
import { findProductBySlug, findRelated, products } from '@/lib/products';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = findProductBySlug(slug);
  if (!product) return { title: 'Ürün bulunamadı' };
  const description = `${product.brand} ${product.title}. ${product.description.split('.')[0]}.`;
  return {
    title: product.title,
    description,
    keywords: [product.brand, product.category, 'dijital lisans', product.slug],
    alternates: { canonical: `https://cyberlisans.com/products/${product.slug}` },
    openGraph: {
      title: product.title,
      description,
      type: 'website',
      url: `https://cyberlisans.com/products/${product.slug}`,
    },
  };
}

export async function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const product = findProductBySlug(slug);
  if (!product) notFound();

  const related = findRelated(product, 4);

  return (
    <>
      <StorefrontHeader />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <nav className="mb-6 flex items-center gap-1.5 text-sm text-white/60">
          <Link href="/" className="hover:text-cyber-cyan">
            Anasayfa
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href="/products" className="hover:text-cyber-cyan">
            Mağaza
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link
            href={`/products?category=${product.categorySlug}`}
            className="hover:text-cyber-cyan"
          >
            {product.category}
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="truncate text-white">{product.title}</span>
        </nav>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <ProductGallery images={product.images} alt={product.title} />
          <ProductDetail product={product} description={product.description} />
        </div>

        <section className="mt-16">
          <h2 className="mb-6 font-orbitron text-2xl font-black text-white">Yorumlar</h2>
          <div className="rounded-xl border border-cyber-cyan/20 bg-cyber-darker/60 p-8 text-center text-white/60">
            <Star className="mx-auto mb-3 h-8 w-8 text-cyber-cyan/40" />
            <p>Yorum sistemi yakında aktif olacak.</p>
          </div>
        </section>

        {related.length > 0 && (
          <section className="mt-16">
            <h2 className="mb-6 font-orbitron text-2xl font-black text-white">Benzer Ürünler</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} soldCount={p.sold} />
              ))}
            </div>
          </section>
        )}
      </main>

      <ProductJsonLd
        product={{
          name: product.title,
          description: product.description,
          price: product.price,
          currency: product.currency,
          availability: product.stock > 0 ? 'InStock' : 'OutOfStock',
          url: `https://cyberlisans.com/products/${product.slug}`,
          image: product.image,
        }}
      />
      <BreadcrumbJsonLd
        items={[
          { name: 'Anasayfa', url: 'https://cyberlisans.com' },
          { name: 'Mağaza', url: 'https://cyberlisans.com/products' },
          {
            name: product.category,
            url: `https://cyberlisans.com/products?category=${product.categorySlug}`,
          },
          { name: product.title, url: `https://cyberlisans.com/products/${product.slug}` },
        ]}
      />
    </>
  );
}
