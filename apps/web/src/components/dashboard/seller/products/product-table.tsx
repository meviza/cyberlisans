'use client';

import * as React from 'react';
import Link from 'next/link';
import { Edit2, Trash2, ImageIcon } from 'lucide-react';
import { Button } from '@cyberlisans/ui/atoms';
import type { SellerProduct } from '@/lib/api/seller-products';
import { formatCurrency } from '@/lib/format';
import { ProductStatusBadge } from './product-status-badge';

export interface ProductTableProps {
  rows: SellerProduct[];
  onDelete: (p: SellerProduct) => void;
}

export function ProductTable({ rows, onDelete }: ProductTableProps) {
  if (rows.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-cyber-cyan/20 bg-cyber-darker/40 p-8 text-center text-sm text-white/50">
        Henüz ürün yok. Sağ üstteki “Yeni Ürün” ile başla.
      </div>
    );
  }
  return (
    <div className="overflow-hidden rounded-lg border border-cyber-cyan/20">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-cyber-cyan/20 bg-cyber-darker/60 text-left text-xs uppercase tracking-wider text-white/60">
              <th className="px-4 py-3">Görsel</th>
              <th className="px-4 py-3">Ürün</th>
              <th className="px-4 py-3 text-right">Fiyat</th>
              <th className="px-4 py-3 text-right">Stok</th>
              <th className="px-4 py-3">Durum</th>
              <th className="px-4 py-3 text-right">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => {
              const cover = p.images?.[0];
              return (
                <tr key={p.id} className="border-b border-cyber-cyan/10 hover:bg-cyber-cyan/5">
                  <td className="px-4 py-3">
                    <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-md border border-cyber-cyan/20 bg-cyber-darker/60">
                      {cover?.startsWith('http') ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={cover} alt={p.title} className="h-full w-full object-cover" />
                      ) : (
                        <ImageIcon className="h-4 w-4 text-white/30" />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-white">{p.title}</div>
                    <div className="text-xs text-white/50">
                      {p.brand} · {p.category}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-cyber-cyan">
                    {formatCurrency(p.price, p.currency)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-white/80">{p.stock}</td>
                  <td className="px-4 py-3">
                    <ProductStatusBadge status={p.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/dashboard/seller/products/${p.id}`}
                        className="inline-flex h-8 items-center gap-1 rounded-md border border-cyber-cyan/30 bg-cyber-cyan/10 px-2 text-xs text-cyber-cyan hover:border-cyber-cyan"
                      >
                        <Edit2 className="h-3.5 w-3.5" /> Düzenle
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDelete(p)}
                        className="border-cyber-magenta/40 bg-cyber-magenta/10 text-cyber-magenta hover:border-cyber-magenta"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Sil
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
