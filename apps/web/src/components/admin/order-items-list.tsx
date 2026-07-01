import * as React from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@cyberlisans/ui/atoms';
import { KeyRound } from 'lucide-react';
import { formatCurrency } from '@/lib/format';

export interface OrderItemRow {
  id: string;
  productId: string;
  productTitle: string;
  productSlug: string;
  productKeyId: string | null;
  productKeyPreview: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export function OrderItemsList({ items, currency }: { items: OrderItemRow[]; currency: string }) {
  const ccy = currency as 'TRY' | 'USD' | 'EUR' | 'USDT';
  const subtotal = items.reduce((s, it) => s + it.totalPrice, 0);
  return (
    <Card>
      <CardContent className="p-5">
        <h3 className="mb-4 font-orbitron text-sm font-bold uppercase tracking-wider text-white">
          Ürünler
        </h3>
        {items.length === 0 ? (
          <p className="rounded border border-dashed border-cyber-cyan/20 p-6 text-center text-sm text-white/50">
            Ürün yok
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-cyber-cyan/20 text-left text-xs uppercase tracking-wider text-white/50">
                <tr>
                  <th className="py-2 pr-3">Ürün</th>
                  <th className="py-2 pr-3 text-right">Adet</th>
                  <th className="py-2 pr-3 text-right">Birim</th>
                  <th className="py-2 pr-3 text-right">Toplam</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it) => (
                  <tr key={it.id} className="border-b border-cyber-cyan/10">
                    <td className="py-3 pr-3">
                      <Link
                        href={`/products/${it.productSlug}`}
                        className="text-white hover:text-cyber-cyan"
                      >
                        {it.productTitle}
                      </Link>
                      {it.productKeyPreview && (
                        <div className="mt-1 flex items-center gap-1 text-[10px] font-mono text-cyber-lime">
                          <KeyRound className="h-3 w-3" />
                          {it.productKeyPreview}
                        </div>
                      )}
                    </td>
                    <td className="py-3 pr-3 text-right text-white/80">{it.quantity}</td>
                    <td className="py-3 pr-3 text-right text-white/80">
                      {formatCurrency(it.unitPrice, ccy)}
                    </td>
                    <td className="py-3 pr-3 text-right font-medium text-white">
                      {formatCurrency(it.totalPrice, ccy)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-cyber-cyan/20">
                  <td colSpan={3} className="py-3 pr-3 text-right text-xs uppercase text-white/60">
                    Toplam
                  </td>
                  <td className="py-3 pr-3 text-right font-orbitron text-base font-bold text-white">
                    {formatCurrency(subtotal, ccy)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
