'use client';

import * as React from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Check, Receipt, ArrowRight, Package, Sparkles } from 'lucide-react';
import { Button, Card, CardContent, Spinner } from '@cyberlisans/ui/atoms';
import { useCurrency } from '@/lib/currency-context';
import { apiFetch } from '@/lib/api-client';
import { StorefrontHeader } from '@/components/store/storefront-header';

interface OrderResponse {
  id: string;
  totalAmount: number;
  currency: string;
  status: string;
  paymentMethod?: string;
  createdAt: string;
  items: Array<{ title: string; qty: number; price: number }>;
}

export default function CheckoutSuccessPage() {
  const sp = useSearchParams();
  const router = useRouter();
  const orderId = sp.get('orderId');
  const { format } = useCurrency();
  const [order, setOrder] = React.useState<OrderResponse | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!orderId) {
      router.replace('/');
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await apiFetch<OrderResponse>(`/orders/${orderId}`);
        if (!cancelled) setOrder(res);
      } catch {
        if (!cancelled) setOrder(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [orderId, router]);

  if (!orderId) return null;

  return (
    <>
      <StorefrontHeader />
      <main className="mx-auto flex max-w-3xl flex-col items-center px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="relative mb-6 flex h-24 w-24 items-center justify-center">
            <span className="absolute inset-0 animate-ping rounded-full bg-cyber-lime/20" />
            <span className="absolute inset-2 animate-pulse rounded-full bg-cyber-lime/10" />
            <div className="relative flex h-20 w-20 items-center justify-center rounded-full border-2 border-cyber-lime bg-cyber-lime/20 text-cyber-lime shadow-[0_0_30px_rgba(190,242,100,0.6)]">
              <Check className="h-12 w-12" strokeWidth={3} />
            </div>
          </div>
          <div className="mb-3 flex items-center gap-2 rounded-full border border-cyber-cyan/40 bg-cyber-cyan/10 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-cyber-cyan">
            <Sparkles className="h-3 w-3" />
            Sipariş onaylandı
          </div>
          <h1 className="mb-2 font-orbitron text-3xl font-black text-white sm:text-4xl">
            Teşekkürler!
          </h1>
          <p className="text-white/60">Siparişin başarıyla alındı. Anında teslim başladı.</p>
        </div>

        <Card className="w-full">
          <CardContent className="p-6 sm:p-8">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Spinner size="lg" />
              </div>
            ) : order ? (
              <>
                <div className="mb-6 grid grid-cols-2 gap-4 border-b border-cyber-cyan/20 pb-6">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-white/50">Sipariş No</p>
                    <p className="mt-1 font-mono text-cyber-cyan">{order.id}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-white/50">Tarih</p>
                    <p className="mt-1 text-white">
                      {new Date(order.createdAt).toLocaleString('tr-TR')}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-white/50">Ödeme</p>
                    <p className="mt-1 text-white">{order.paymentMethod ?? 'WALLET'}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-white/50">Durum</p>
                    <p className="mt-1 inline-flex items-center gap-1.5 rounded-full border border-cyber-lime/40 bg-cyber-lime/10 px-2.5 py-0.5 font-mono text-xs uppercase tracking-wider text-cyber-lime">
                      <span className="h-1.5 w-1.5 rounded-full bg-cyber-lime" />
                      {order.status}
                    </p>
                  </div>
                </div>

                <h2 className="mb-3 font-orbitron text-base font-bold text-white">Ürünler</h2>
                <ul className="space-y-2 text-sm">
                  {order.items.map((it, i) => (
                    <li key={i} className="flex items-center justify-between gap-2 text-white/70">
                      <span className="truncate">
                        {it.qty}x {it.title}
                      </span>
                      <span className="font-mono text-white">{format(it.price * it.qty)}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-6 flex items-center justify-between border-t border-cyber-cyan/20 pt-4">
                  <span className="font-medium text-white">Toplam</span>
                  <span className="font-orbitron text-2xl font-black text-cyber-cyan text-glow-cyan">
                    {format(order.totalAmount)}
                  </span>
                </div>
              </>
            ) : (
              <div className="py-8 text-center text-white/60">
                <Package className="mx-auto mb-3 h-10 w-10 text-cyber-cyan/40" />
                <p>Sipariş detayları yüklenemedi.</p>
                <p className="mt-1 font-mono text-xs text-white/40">{orderId}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-6 flex w-full flex-col gap-3 sm:flex-row">
          <Link href="/dashboard/orders" className="flex-1">
            <Button className="w-full" size="lg">
              <Receipt className="h-4 w-4" />
              Siparişlerim
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/products" className="flex-1">
            <Button variant="outline" className="w-full" size="lg">
              Alışverişe Devam
            </Button>
          </Link>
        </div>
      </main>
    </>
  );
}
