'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowRight, Shield, Tag } from 'lucide-react';
import { Button, Input, Card, CardContent } from '@cyberlisans/ui/atoms';
import { useCurrency } from '@/lib/currency-context';

export interface CartSummaryProps {
  subtotal: number;
  itemCount: number;
}

export function CartSummary({ subtotal, itemCount }: CartSummaryProps) {
  const { format, currency } = useCurrency();
  const [coupon, setCoupon] = React.useState('');
  const [applied, setApplied] = React.useState(false);

  const discount = applied ? Math.round(subtotal * 0.05 * 100) / 100 : 0;
  const total = Math.max(0, subtotal - discount);

  return (
    <Card className="sticky top-20 self-start">
      <CardContent className="p-6">
        <h2 className="mb-4 text-lg font-semibold text-white">Sipariş özeti</h2>
        <div className="space-y-2 border-b border-white/[0.08] pb-4 text-sm">
          <div className="flex justify-between text-brand-text-secondary">
            <span>Ara toplam ({itemCount} ürün)</span>
            <span>{format(subtotal)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-brand-success">
              <span>İndirim</span>
              <span>-{format(discount)}</span>
            </div>
          )}
        </div>

        <div className="mt-4 flex items-center gap-2">
          <Tag className="h-4 w-4 shrink-0 text-brand-accent" />
          <Input
            placeholder="Kupon kodu"
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
            {applied ? '✓' : 'Uygula'}
          </Button>
        </div>
        <p className="mt-1 text-[10px] text-brand-muted">Para birimi: {currency}</p>

        <div className="mt-4 flex items-center justify-between border-t border-white/[0.08] pt-4">
          <span className="font-medium text-white">Toplam</span>
          <span className="text-2xl font-semibold tracking-tight text-white">{format(total)}</span>
        </div>

        <Link href="/checkout" className="mt-6 block">
          <Button className="w-full" size="lg" disabled={itemCount === 0}>
            Ödemeye geç
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>

        <div className="mt-4 flex items-center gap-2 rounded-xl border border-white/[0.08] bg-brand-accent/5 p-3 text-xs text-brand-text-secondary">
          <Shield className="h-4 w-4 shrink-0 text-brand-accent" />
          <span>256-bit SSL şifreleme ile güvenli ödeme</span>
        </div>
      </CardContent>
    </Card>
  );
}
