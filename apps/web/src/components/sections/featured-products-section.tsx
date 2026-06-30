'use client';

import Link from 'next/link';
import { featuredProducts, type Product } from '@/lib/products';

function ProductCardInline({ product }: { product: Product }) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group relative overflow-hidden rounded-xl border border-cyber-cyan/20 bg-cyber-darker/60 backdrop-blur-sm transition-all hover:scale-105 hover:border-cyber-cyan/60 hover:shadow-glow-cyan"
    >
      <div className="aspect-square w-full" style={{ background: product.image }} />
      <div className="p-4">
        <div className="mb-1 text-xs uppercase tracking-wider text-cyber-magenta">{product.brand}</div>
        <h3 className="mb-2 font-display text-base font-bold text-white">{product.title}</h3>
        <div className="flex items-center justify-between">
          <span className="font-display text-lg font-black text-cyber-cyan text-glow-cyan">{product.price} ₺</span>
          <span className="text-xs text-cyber-cyan/60">{product.stock} stok</span>
        </div>
      </div>
    </Link>
  );
}

export function FeaturedProductsSection() {
  return (
    <section className="relative bg-cyber-dark py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h2 className="mb-3 font-display text-3xl font-black text-white sm:text-4xl">
              Öne Çıkan <span className="text-cyber-magenta text-glow-magenta">Ürünler</span>
            </h2>
            <p className="text-white/60">En popüler dijital lisanslar</p>
          </div>
          <Link
            href="/products"
            className="font-mono text-sm uppercase tracking-widest text-cyber-cyan transition-colors hover:text-cyber-magenta"
          >
            Tümünü Gör →
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {featuredProducts.map((p) => (
            <ProductCardInline key={p.id} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
}