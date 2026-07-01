'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
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
  const t = useTranslations('product');
  const [qty, setQty] = React.useState(1);
  const [added, setAdded] = React.useState(false);

  const stock = product.stock;
  const stockBadge =
    stock === 0
      ? { variant: 'danger' as const, label: t('stockOut') }
      : stock <= 5
        ? { variant: 'warning' as const, label: t('stockLow', { count: stock }) }
        : { variant: 'success' as const, label: t('stockIn') };

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
          <span className="text-sm text-white/60">{t('taxIncluded')}</span>
        </div>
      </div>

      <div className="prose prose-invert max-w-none rounded-xl border border-cyber-cyan/20 bg-cyber-darker/40 p-5 text-sm leading-relaxed text-white/80">
        <h2 className="mb-2 font-orbitron text-lg font-bold text-white">{t('description')}</h2>
        {description}
      </div>

      <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-end">
        <div>
          <label className="mb-2 block text-sm text-white/80">{t('quantity')}</label>
          <QuantitySelector value={qty} min={1} max={stock || 1} onChange={setQty} />
        </div>
        <div className="flex-1">
          <span className="mb-2 hidden text-sm text-white/80 sm:block">&nbsp;</span>
          <Button size="lg" disabled={stock === 0} onClick={onAdd} className="w-full">
            <ShoppingCart className="h-5 w-5" />
            {added ? t('addedToCart') : stock === 0 ? t('stockOut') : t('addToCart')}
          </Button>
        </div>
      </div>

      <Button size="lg" variant="outline" className="w-full" disabled={stock === 0}>
        <Gift className="h-5 w-5" />
        {t('sendAsGift')}
      </Button>

      <div className="grid grid-cols-3 gap-3 pt-2">
        <TrustBadge icon={Zap} label={t('trustInstant')} />
        <TrustBadge icon={Shield} label={t('trustOriginal')} />
        <TrustBadge icon={RefreshCcw} label={t('trustRefund')} />
      </div>
    </div>
  );
}
