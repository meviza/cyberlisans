'use client';

import * as React from 'react';
import Link from 'next/link';
import { Search, Filter } from 'lucide-react';
import { Input } from '@cyberlisans/ui/atoms';
import { products, categories, type Product } from '@/lib/products';

export default function ProductsPage() {
  const [query, setQuery] = React.useState('');
  const [activeCat, setActiveCat] = React.useState<string>('all');
  const [activeBrand, setActiveBrand] = React.useState<string>('all');
  const [page, setPage] = React.useState(1);
  const perPage = 12;

  const brands = Array.from(new Set(products.map((p) => p.brand)));

  const filtered = products.filter((p) => {
    if (activeCat !== 'all' && p.category !== activeCat) return false;
    if (activeBrand !== 'all' && p.brand !== activeBrand) return false;
    if (query && !p.title.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="font-orbitron text-3xl font-black text-white sm:text-4xl">
          Tüm <span className="text-cyber-cyan text-glow-cyan">Ürünler</span>
        </h1>
        <p className="mt-2 text-white/60">İhtiyacın olan lisansı bul</p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr]">
        <aside className="space-y-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
            <Input
              type="search"
              placeholder="Ürün ara..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              className="pl-9"
            />
          </div>

          <div>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-white/80">
              <Filter className="h-4 w-4 text-cyber-cyan" />
              Kategoriler
            </h3>
            <div className="space-y-1">
              <FilterButton active={activeCat === 'all'} onClick={() => { setActiveCat('all'); setPage(1); }}>
                Tümü ({products.length})
              </FilterButton>
              {categories.map((c) => (
                <FilterButton
                  key={c.slug}
                  active={activeCat === c.name}
                  onClick={() => {
                    setActiveCat(c.name);
                    setPage(1);
                  }}
                >
                  {c.name} ({products.filter((p) => p.category === c.name).length})
                </FilterButton>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-white/80">
              <Filter className="h-4 w-4 text-cyber-cyan" />
              Markalar
            </h3>
            <div className="space-y-1">
              <FilterButton active={activeBrand === 'all'} onClick={() => { setActiveBrand('all'); setPage(1); }}>
                Tümü
              </FilterButton>
              {brands.map((b) => (
                <FilterButton
                  key={b}
                  active={activeBrand === b}
                  onClick={() => {
                    setActiveBrand(b);
                    setPage(1);
                  }}
                >
                  {b}
                </FilterButton>
              ))}
            </div>
          </div>
        </aside>

        <div>
          <p className="mb-4 text-sm text-white/60">
            {filtered.length} ürün bulundu
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {paged.map((p) => (
              <ProductGridCard key={p.id} product={p} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="rounded border border-cyber-cyan/30 px-3 py-1.5 text-sm text-white/70 transition-colors hover:border-cyber-cyan hover:text-white disabled:opacity-40"
              >
                Önceki
              </button>
              <span className="px-3 text-sm text-white/60">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="rounded border border-cyber-cyan/30 px-3 py-1.5 text-sm text-white/70 transition-colors hover:border-cyber-cyan hover:text-white disabled:opacity-40"
              >
                Sonraki
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={
        active
          ? 'block w-full rounded-md border border-cyber-cyan/50 bg-cyber-cyan/10 px-3 py-2 text-left text-sm text-cyber-cyan'
          : 'block w-full rounded-md border border-transparent px-3 py-2 text-left text-sm text-white/70 transition-colors hover:bg-white/5 hover:text-white'
      }
    >
      {children}
    </button>
  );
}

function ProductGridCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group relative overflow-hidden rounded-xl border border-cyber-cyan/20 bg-cyber-darker/60 backdrop-blur-sm transition-all hover:scale-[1.02] hover:border-cyber-cyan/60 hover:shadow-glow-cyan"
    >
      <div className="aspect-square w-full" style={{ background: product.image }} />
      <div className="p-4">
        <div className="mb-1 text-xs uppercase tracking-wider text-cyber-magenta">{product.brand}</div>
        <h3 className="mb-2 font-display text-base font-bold text-white">{product.title}</h3>
        <div className="flex items-center justify-between">
          <span className="font-display text-lg font-black text-cyber-cyan text-glow-cyan">
            {product.price} ₺
          </span>
          <span className="text-xs text-cyber-cyan/60">{product.stock} stok</span>
        </div>
      </div>
    </Link>
  );
}