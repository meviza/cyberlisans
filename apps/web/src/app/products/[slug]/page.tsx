import * as React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ShoppingCart, Gift, Shield, Zap, RefreshCcw, Star, Plus, Minus } from 'lucide-react';
import { Button, Badge } from '@cyberlisans/ui/atoms';
import { Select } from '@/components/ui/select';
import { products } from '@/lib/products';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const product = products.find((p) => p.slug === slug);

  if (!product) notFound();

  const related = products
    .filter((p) => p.id !== product.id && (p.category === product.category || p.brand === product.brand))
    .slice(0, 4);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <nav className="mb-6 text-sm text-white/60">
        <Link href="/" className="hover:text-cyber-cyan">Anasayfa</Link>
        <span className="mx-2">/</span>
        <Link href="/products" className="hover:text-cyber-cyan">Ürünler</Link>
        <span className="mx-2">/</span>
        <span className="text-white">{product.title}</span>
      </nav>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="space-y-4">
          <div
            className="relative aspect-square overflow-hidden rounded-2xl border border-cyber-cyan/20"
            style={{ background: product.image }}
          >
            <div className="absolute right-4 top-4">
              <Badge variant="magenta" size="lg">{product.brand}</Badge>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[product.image, product.image, product.image].map((img, i) => (
              <div key={i} className="aspect-square overflow-hidden rounded-lg border border-cyber-cyan/20" style={{ background: img }} />
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Badge variant="default">{product.category}</Badge>
              <Badge variant={product.stock > 5 ? 'success' : 'warning'}>
                {product.stock > 5 ? 'Stokta' : `Son ${product.stock} adet`}
              </Badge>
            </div>
            <h1 className="font-orbitron text-3xl font-black text-white sm:text-4xl">{product.title}</h1>
            <p className="mt-3 text-white/70">
              {product.brand} için orijinal dijital lisans. Ödeme onayı sonrası 5 saniye içinde teslim.
            </p>
          </div>

          <div className="flex items-baseline gap-3 rounded-xl border border-cyber-cyan/20 bg-cyber-darker/60 p-5">
            <span className="font-orbitron text-4xl font-black text-cyber-cyan text-glow-cyan">
              {product.price} ₺
            </span>
            <span className="text-sm text-white/60">KDV dahil</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-2 block text-sm text-white/80">Para birimi</label>
              <Select
                options={[
                  { value: 'TRY', label: '₺ TRY' },
                  { value: 'USD', label: '$ USD' },
                  { value: 'EUR', label: '€ EUR' },
                ]}
                defaultValue="TRY"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm text-white/80">Adet</label>
              <div className="flex items-center rounded-md border border-cyber-cyan/30 bg-cyber-darker">
                <button className="flex h-10 w-10 items-center justify-center text-white/70 hover:text-cyber-cyan">
                  <Minus className="h-4 w-4" />
                </button>
                <input
                  type="number"
                  min="1"
                  defaultValue="1"
                  className="h-10 w-full bg-transparent text-center text-sm text-white focus:outline-none"
                />
                <button className="flex h-10 w-10 items-center justify-center text-white/70 hover:text-cyber-cyan">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button size="lg" className="flex-1">
              <ShoppingCart className="h-5 w-5" />
              Sepete Ekle
            </Button>
            <Button size="lg" variant="outline" className="flex-1">
              <Gift className="h-5 w-5" />
              Hediye Olarak Gönder
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2">
            <TrustBadge icon={Zap} label="Anında Teslim" />
            <TrustBadge icon={Shield} label="%100 Orijinal" />
            <TrustBadge icon={RefreshCcw} label="14 Gün İade" />
          </div>
        </div>
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
              <Link
                key={p.id}
                href={`/products/${p.slug}`}
                className="group overflow-hidden rounded-xl border border-cyber-cyan/20 bg-cyber-darker/60 transition-all hover:border-cyber-cyan/60"
              >
                <div className="aspect-square" style={{ background: p.image }} />
                <div className="p-3">
                  <div className="text-xs uppercase tracking-wider text-cyber-magenta">{p.brand}</div>
                  <h3 className="mt-1 text-sm font-bold text-white">{p.title}</h3>
                  <div className="mt-2 font-orbitron text-base font-black text-cyber-cyan">{p.price} ₺</div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function TrustBadge({ icon: Icon, label }: { icon: React.ComponentType<{ className?: string }>; label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-cyber-cyan/20 bg-cyber-darker/60 px-3 py-2">
      <Icon className="h-4 w-4 text-cyber-cyan" />
      <span className="text-xs text-white/80">{label}</span>
    </div>
  );
}