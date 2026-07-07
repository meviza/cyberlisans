'use client';

import * as React from 'react';
import { ShoppingBag, Store, AlertCircle } from 'lucide-react';
import { Card, CardContent, Badge } from '@cyberlisans/ui/atoms';
import { useCurrency } from '@/lib/currency-context';

export interface OrderEscrowCardProps {
  productTitle: string;
  productImage?: string;
  sellerName: string;
  sellerRating?: number;
  price: number;
  currency: string;
  status: 'PENDING' | 'PAID' | 'ESCROW_HELD' | 'RELEASED' | 'DISPUTED' | 'REFUNDED' | 'CANCELLED';
}

export function OrderEscrowCard({
  productTitle,
  productImage,
  sellerName,
  sellerRating,
  price,
  currency,
  status,
}: OrderEscrowCardProps) {
  const { convert } = useCurrency();
  const amount = convert(price);
  const symbol = currency === 'TRY' ? '₺' : currency === 'USD' ? '$' : '€';

  const statusBadge = {
    PENDING: { label: 'Bekliyor', variant: 'warning' as const },
    PAID: { label: 'Ödendi', variant: 'success' as const },
    ESCROW_HELD: { label: "Escrow'da", variant: 'magenta' as const },
    RELEASED: { label: 'Satıcıya Aktarıldı', variant: 'success' as const },
    DISPUTED: { label: 'İtiraz Açık', variant: 'danger' as const },
    REFUNDED: { label: 'İade Edildi', variant: 'default' as const },
    CANCELLED: { label: 'İptal', variant: 'default' as const },
  }[status];

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div
            className="h-16 w-16 shrink-0 rounded-md border border-cyber-cyan/20 bg-cyber-darker"
            style={
              productImage
                ? { backgroundImage: `url(${productImage})`, backgroundSize: 'cover' }
                : undefined
            }
          >
            {!productImage && <ShoppingBag className="m-auto mt-3.5 h-6 w-6 text-cyber-cyan" />}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-white">{productTitle}</p>
            <div className="mt-1 flex items-center gap-2 text-xs text-white/60">
              <Store className="h-3.5 w-3.5" />
              <span>{sellerName}</span>
              {typeof sellerRating === 'number' && (
                <span className="text-cyber-cyan">★ {sellerRating.toFixed(1)}</span>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="font-orbitron text-xl font-black text-cyber-cyan">
              {symbol}
              {amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
            </p>
            <Badge variant={statusBadge.variant} size="sm" className="mt-1">
              {statusBadge.label}
            </Badge>
          </div>
        </div>

        {status === 'ESCROW_HELD' && (
          <div className="mt-4 flex items-start gap-2 rounded-md border border-cyber-magenta/30 bg-cyber-magenta/5 p-3 text-xs text-white/70">
            <AlertCircle className="h-4 w-4 shrink-0 text-cyber-magenta" />
            <span>
              Tutar escrow&apos;da. 7 gün içinde otomatik olarak satıcıya aktarılır. Sorun yaşarsan
              itiraz açabilirsin.
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
