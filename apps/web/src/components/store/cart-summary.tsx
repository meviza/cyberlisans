'use client';

import * as React from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ArrowRight, Shield, Tag } from 'lucide-react';
import { Button, Input, Card, CardContent } from '@cyberlisans/ui/atoms';
import { useCurrency } from '@/lib/currency-context';

export interface CartSummaryProps {
  subtotal: number;
  itemCount: number;
}

export function CartSummary({ subtotal, itemCount }: CartSummaryProps) {
  const { format, currency } = useCurrency();
  const t = useTranslations('cart');
  const [coupon, setCoupon] = React.useState('');
  const [applied, setApplied] = React.useState(false);

  const discount = applied ? Math.round(subtotal * 0.05 * 100) / 100 : 0;
  const total = Math.max(0, subtotal - discount);

  return (
    <Card className="sticky top-20 self-start">
      <CardContent className="p-6">
        <h2 className="mb-4 font-orbitron text-lg font-bold text-white">{t('summary')}</h2>
        <div className="space-y-2 border-b border-cyber-cyan/20 pb-4 text-sm">
          <div className="flex justify-between text-white/70">
            <span>{t('subtotal', { count: itemCount })}</span>
            <span>{format(subtotal)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-cyber-lime">
              <span>{t('discount')}</span>
              <span>-{format(discount)}</span>
            </div>
          )}
        </div>

        <div className="mt-4 flex items-center gap-2">
          <Tag className="h-4 w-4 shrink-0 text-cyber-cyan" />
          <Input
            placeholder={t('coupon')}
            value={coupon}
            onChange={(e) => setCoupon(e.target.value.toUpperCase())}
            disabled={applied}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (coupon.trim()) setApplied(true);
            }}
            disabled={!coupon.trim() || applied}
          >
            {applied ? '✓' : t('apply')}
          </Button>
        </div>
        <p className="mt-1 text-[10px] text-white/40">
          {t('currency')}: {currency}
        </p>

        <div className="mt-4 flex items-center justify-between border-t border-cyber-cyan/20 pt-4">
          <span className="font-medium text-white">{t('total')}</span>
          <span className="font-orbitron text-2xl font-black text-cyber-cyan text-glow-cyan">
            {format(total)}
          </span>
        </div>

        <Link href="/checkout" className="mt-6 block">
          <Button className="w-full" size="lg" disabled={itemCount === 0}>
            {t('goCheckout')}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>

        <div className="mt-4 flex items-center gap-2 rounded-md border border-cyber-cyan/20 bg-cyber-cyan/5 p-3 text-xs text-white/70">
          <Shield className="h-4 w-4 shrink-0 text-cyber-cyan" />
          <span>{t('secureSsl')}</span>
        </div>
      </CardContent>
    </Card>
  );
}
