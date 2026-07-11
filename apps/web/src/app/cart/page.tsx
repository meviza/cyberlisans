'use client';

import * as React from 'react';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/lib/cart-store';
import { CartLineItem } from '@/components/store/cart-line-item';
import { CartSummary } from '@/components/store/cart-summary';
import { EmptyState } from '@/components/store/empty-state';
import { StorefrontHeader } from '@/components/store/storefront-header';

export default function CartPage() {
  const { items, hydrated, updateQty, removeItem, getTotal, getItemCount } = useCart();

  if (!hydrated) {
    return (
      <>
        <StorefrontHeader />
        <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-4">
            <div className="h-10 w-48 rounded bg-brand-accent/10" />
            <div className="h-32 rounded-xl bg-brand-bg/40" />
          </div>
        </main>
      </>
    );
  }

  if (items.length === 0) {
    return (
      <>
        <StorefrontHeader />
        <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <EmptyState
            icon={ShoppingCart}
            title="Sepetin boş"
            description="Henüz sepetine bir ürün eklemedin. Mağazadan ilham alabilirsin."
            ctaLabel="Ürünlere Göz At"
            ctaHref="/products"
          />
        </main>
      </>
    );
  }

  const subtotal = getTotal();
  const count = getItemCount();

  return (
    <>
      <StorefrontHeader />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-white">Sepetim</h1>
          <p className="mt-2 text-white/60">{count} ürün sepetinde</p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
          <div className="space-y-3">
            {items.map((it) => (
              <CartLineItem key={it.id} item={it} onQtyChange={updateQty} onRemove={removeItem} />
            ))}
            <div className="pt-2">
              <Link
                href="/products"
                className="text-sm text-brand-accent transition-colors hover:text-brand-text-secondary"
              >
                ← Alışverişe devam et
              </Link>
            </div>
          </div>
          <CartSummary subtotal={subtotal} itemCount={count} />
        </div>
      </main>
    </>
  );
}
