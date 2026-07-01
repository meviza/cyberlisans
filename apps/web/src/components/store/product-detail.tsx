'use client';

import * as React from 'react';
import { ShoppingCart, Shield, RefreshCcw, Zap, Gift } from 'lucide-react';
import { Button, Badge } from '@cyberlisans/ui/atoms';
import type { Product } from '@/lib/products';
import { useCurrency } from '@/lib/currency-context';
import { useCart } from '@/lib/cart-store';
import { QuantitySelector } from './quantity-selector';

export interface ProductDetailProps {
  product: Product;
  description: string;
}

function TrustBadge({
  icon: Icon,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-cyber-cyan/20 bg-cyber-darker/60 px-3 py-2">
      <Icon className="h-4 w-4 text-cyber-cyan" />
      <span className="text-xs text-white/80">{label}</span>
    </div>
  );
}

export function ProductDetail({ product, description }: ProductDetailProps) {
  const { format } = useCurrency();
  const { addItem } = useCart();
  const [qty, setQty] = React.useState(1);
  const [added, setAdded] = React.useState(false);

  const stock = product.stock;
  const stockBadge =
    stock === 0
      ? { variant: 'danger' as const, label: 'Stokta yok' }
      : stock <= 5
        ? { variant: 'warning' as const, label: `Son ${stock} adet` }
        : { variant: 'success' as const, label: 'Stokta' };

  const onAdd = () => {
    if (stock === 0) return;
    addItem({
      id: product.id,
      slug: product.slug,
      title: product.title,
      brand: product.brand,
      image: product.image,
      unitPrice: product.price,
      maxQty: stock,
      qty,
    });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Badge variant="default">{product.category}</Badge>
          <Badge variant="magenta">{product.brand}</Badge>
          <Badge variant={stockBadge.variant}>{stockBadge.label}</Badge>
        </div>
        <h1 className="font-orbitron text-3xl font-black text-white sm:text-4xl">
          {product.title}
        </h1>
      </div>

      <div className="rounded-xl border border-cyber-cyan/20 bg-cyber-darker/60 p-5">
        <div className="flex items-baseline gap-3">
          <span className="font-orbitron text-4xl font-black text-cyber-cyan text-glow-cyan">
            {format(product.price)}
          </span>
          <span className="text-sm text-white/60">KDV dahil</span>
        </div>
      </div>

      <div className="prose prose-invert max-w-none rounded-xl border border-cyber-cyan/20 bg-cyber-darker/40 p-5 text-sm leading-relaxed text-white/80">
        {description}
      </div>

      <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-end">
        <div>
          <label className="mb-2 block text-sm text-white/80">Adet</label>
          <QuantitySelector value={qty} min={1} max={stock || 1} onChange={setQty} />
        </div>
        <div className="flex-1">
          <span className="mb-2 hidden text-sm text-white/80 sm:block">&nbsp;</span>
          <Button size="lg" disabled={stock === 0} onClick={onAdd} className="w-full">
            <ShoppingCart className="h-5 w-5" />
            {added ? 'Sepete Eklendi ✓' : stock === 0 ? 'Stokta yok' : 'Sepete Ekle'}
          </Button>
        </div>
      </div>

      <Button size="lg" variant="outline" className="w-full" disabled={stock === 0}>
        <Gift className="h-5 w-5" />
        Hediye Olarak Gönder
      </Button>

      <div className="grid grid-cols-3 gap-3 pt-2">
        <TrustBadge icon={Zap} label="Anında Teslim" />
        <TrustBadge icon={Shield} label="%100 Orijinal" />
        <TrustBadge icon={RefreshCcw} label="14 Gün İade" />
      </div>
    </div>
  );
}
