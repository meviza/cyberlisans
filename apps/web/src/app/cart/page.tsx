'use client';

import * as React from 'react';
import Link from 'next/link';
import { Trash2, Plus, Minus, ShoppingCart, ArrowRight, Tag } from 'lucide-react';
import { Button, Input, Card, CardContent } from '@cyberlisans/ui/atoms';
import { EmptyState } from '@/components/dashboard/empty-state';

interface CartLine {
  id: string;
  title: string;
  brand: string;
  image: string;
  unitPrice: number;
  qty: number;
}

const MOCK_CART: CartLine[] = [
  { id: '1', title: 'Steam Cüzdan 50 TL', brand: 'Steam', image: 'linear-gradient(135deg,#00F0FF,#FF00C8)', unitPrice: 50, qty: 1 },
  { id: '2', title: 'Windows 11 Pro Key', brand: 'Microsoft', image: 'linear-gradient(135deg,#00A4EF,#0078D4)', unitPrice: 1200, qty: 1 },
];

export default function CartPage() {
  const [items, setItems] = React.useState<CartLine[]>(MOCK_CART);
  const [coupon, setCoupon] = React.useState('');

  const setQty = (id: string, delta: number) => {
    setItems((arr) =>
      arr.map((it) => (it.id === id ? { ...it, qty: Math.max(1, Math.min(20, it.qty + delta)) } : it))
    );
  };
  const remove = (id: string) => setItems((arr) => arr.filter((it) => it.id !== id));

  const subtotal = items.reduce((s, i) => s + i.unitPrice * i.qty, 0);
  const discount = 0;
  const total = subtotal - discount;

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <EmptyState
          icon={ShoppingCart}
          title="Sepetin boş"
          description="Henüz sepetine bir ürün eklemedin."
          ctaLabel="Alışverişe Başla"
          ctaHref="/products"
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="mb-8 font-orbitron text-3xl font-black text-white">Sepetim</h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-3">
          {items.map((it) => (
            <Card key={it.id}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div
                    className="h-20 w-20 shrink-0 rounded-md border border-cyber-cyan/20"
                    style={{ background: it.image }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs uppercase tracking-wider text-cyber-magenta">{it.brand}</div>
                    <h3 className="truncate font-medium text-white">{it.title}</h3>
                    <p className="mt-1 font-orbitron text-lg font-bold text-cyber-cyan text-glow-cyan">
                      {it.unitPrice.toLocaleString()} ₺
                    </p>
                  </div>
                  <div className="flex items-center rounded-md border border-cyber-cyan/30 bg-cyber-darker">
                    <button onClick={() => setQty(it.id, -1)} className="flex h-9 w-9 items-center justify-center text-white/70 hover:text-cyber-cyan">
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-10 text-center text-sm text-white">{it.qty}</span>
                    <button onClick={() => setQty(it.id, 1)} className="flex h-9 w-9 items-center justify-center text-white/70 hover:text-cyber-cyan">
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <button
                    onClick={() => remove(it.id)}
                    className="rounded p-2 text-white/50 transition-colors hover:bg-cyber-magenta/10 hover:text-cyber-magenta"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardContent className="p-6">
            <h2 className="mb-4 font-orbitron text-lg font-bold text-white">Sipariş Özeti</h2>
            <div className="space-y-2 border-b border-cyber-cyan/20 pb-4 text-sm">
              <div className="flex justify-between text-white/70">
                <span>Ara toplam</span>
                <span>{subtotal.toLocaleString()} ₺</span>
              </div>
              <div className="flex justify-between text-white/70">
                <span>İndirim</span>
                <span className="text-cyber-lime">-{discount.toLocaleString()} ₺</span>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <Tag className="h-4 w-4 text-cyber-cyan" />
              <Input
                placeholder="Kupon kodu"
                value={coupon}
                onChange={(e) => setCoupon(e.target.value)}
              />
            </div>
            <div className="mt-4 flex justify-between border-t border-cyber-cyan/20 pt-4">
              <span className="font-medium text-white">Toplam</span>
              <span className="font-orbitron text-2xl font-black text-cyber-cyan text-glow-cyan">
                {total.toLocaleString()} ₺
              </span>
            </div>
            <Link href="/checkout" className="mt-6 block">
              <Button className="w-full" size="lg">
                Ödemeye Geç
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}