'use client';

import Link from 'next/link';
import { Trash2 } from 'lucide-react';
import { Card, CardContent } from '@cyberlisans/ui/atoms';
import { QuantitySelector } from './quantity-selector';
import { useCurrency } from '@/lib/currency-context';
import type { CartItem } from '@/lib/cart-store';

export interface CartLineItemProps {
  item: CartItem;
  onQtyChange: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
}

export function CartLineItem({ item, onQtyChange, onRemove }: CartLineItemProps) {
  const { format } = useCurrency();
  const lineTotal = item.unitPrice * item.qty;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            href={`/products/${item.slug}`}
            className="h-20 w-20 shrink-0 overflow-hidden rounded-md border border-cyber-cyan/20"
            aria-label={item.title}
          >
            <div className="h-full w-full" style={{ background: item.image }} />
          </Link>
          <div className="min-w-0 flex-1">
            <div className="text-xs uppercase tracking-wider text-cyber-magenta">{item.brand}</div>
            <Link
              href={`/products/${item.slug}`}
              className="block truncate font-medium text-white hover:text-cyber-cyan"
            >
              {item.title}
            </Link>
            <p className="mt-1 font-orbitron text-base font-bold text-cyber-cyan text-glow-cyan">
              {format(item.unitPrice)}
            </p>
          </div>
          <div className="hidden sm:block">
            <QuantitySelector
              value={item.qty}
              min={1}
              max={item.maxQty}
              onChange={(q) => onQtyChange(item.id, q)}
              size="sm"
            />
          </div>
          <div className="hidden w-28 text-right sm:block">
            <span className="font-orbitron text-base font-bold text-white">
              {format(lineTotal)}
            </span>
          </div>
          <button
            type="button"
            onClick={() => onRemove(item.id)}
            aria-label="Sepetten çıkar"
            className="rounded p-2 text-white/50 transition-colors hover:bg-cyber-magenta/10 hover:text-cyber-magenta"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-3 flex items-center justify-between sm:hidden">
          <QuantitySelector
            value={item.qty}
            min={1}
            max={item.maxQty}
            onChange={(q) => onQtyChange(item.id, q)}
            size="sm"
          />
          <span className="font-orbitron text-base font-bold text-white">{format(lineTotal)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
