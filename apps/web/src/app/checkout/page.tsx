'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ShoppingCart,
  CreditCard,
  Bitcoin,
  Building2,
  Loader2,
  AlertCircle,
  KeyRound,
} from 'lucide-react';
import { Button, Card, CardContent, Spinner } from '@cyberlisans/ui/atoms';
import { useCart } from '@/lib/cart-store';
import { useCurrency } from '@/lib/currency-context';
import { useAuth } from '@/lib/auth-context';
import { apiFetch, ApiError } from '@/lib/api-client';
import { StorefrontHeader } from '@/components/store/storefront-header';
import { EmptyState } from '@/components/store/empty-state';

type Method = 'STRIPE' | 'PAPARA' | 'CRYPTO';
const METHODS: Array<{
  value: Method;
  label: string;
  desc: string;
  Icon: React.ComponentType<{ className?: string }>;
}> = [
  { value: 'STRIPE', label: 'Kredi Kartı', desc: 'Stripe ile güvenli ödeme', Icon: CreditCard },
  { value: 'PAPARA', label: 'Papara', desc: 'Papara hesabınla hızlı öde', Icon: Building2 },
  { value: 'CRYPTO', label: 'Kripto', desc: 'USDT/BTC/ETH ile öde', Icon: Bitcoin },
];

export default function CheckoutPage() {
  const router = useRouter();
  const params = useSearchParams();
  const { user, isLoading: authLoading } = useAuth();
  const { items, getTotal, clearCart, hydrated } = useCart();
  const { format } = useCurrency();
  const [method, setMethod] = React.useState<Method>('STRIPE');
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const buyNow = params?.get('product');
  const total = getTotal();

  React.useEffect(() => {
    if (!authLoading && !user) router.replace('/login?next=/checkout');
  }, [user, authLoading, router]);
  if (authLoading || !hydrated)
    return (
      <main className="flex min-h-[60vh] items-center justify-center">
        <Spinner size="lg" />
      </main>
    );
  if (!user) return null;
  if (!buyNow && items.length === 0) {
    return (
      <>
        <StorefrontHeader />
        <main className="mx-auto max-w-3xl px-4 py-16">
          <EmptyState
            icon={ShoppingCart}
            title="Sepetin boş"
            description="Ödeme için önce ürün eklemelisin."
            ctaLabel="Ürünlere göz at"
            ctaHref="/products"
          />
        </main>
      </>
    );
  }

  const handleComplete = async () => {
    setError(null);
    setSubmitting(true);
    try {
      const res = await apiFetch<{ orderId: string }>('/orders', {
        method: 'POST',
        body: JSON.stringify({
          items: items.map((it) => ({ productId: it.id, qty: it.qty })),
          paymentMethod: method,
          productSlug: buyNow ?? undefined,
        }),
      });
      clearCart();
      router.push(`/dashboard/orders/${res.orderId}`);
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        clearCart();
        router.push(`/dashboard/orders/mock-${Date.now()}`);
        return;
      }
      setError(err instanceof Error ? err.message : 'Sipariş oluşturulamadı');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <StorefrontHeader />
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="mb-6 text-3xl font-black text-white">Sipariş Tamamla</h1>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
          <Card>
            <CardContent className="space-y-4 p-6">
              <h2 className="text-lg font-bold text-white">Ürünler</h2>
              <ul className="divide-y divide-white/[0.06] text-sm">
                {items.map((it) => (
                  <li key={it.id} className="flex items-center justify-between py-3">
                    <span className="text-white">
                      {it.qty}x {it.title}
                    </span>
                    <span className="font-mono text-brand-accent">
                      {format(it.unitPrice * it.qty)}
                    </span>
                  </li>
                ))}
              </ul>
              <h2 className="text-lg font-bold text-white">Ödeme Yöntemi</h2>
              <div className="space-y-2">
                {METHODS.map((m) => (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => setMethod(m.value)}
                    className={
                      method === m.value
                        ? 'flex w-full items-center gap-3 rounded-md border border-brand-accent/60 bg-brand-accent/10 p-3 text-left'
                        : 'flex w-full items-center gap-3 rounded-md border border-white/10 bg-white/5 p-3 text-left hover:border-brand-accent/40'
                    }
                  >
                    <m.Icon className="h-5 w-5 text-brand-accent" />
                    <div>
                      <p className="font-medium text-white">{m.label}</p>
                      <p className="text-xs text-white/60">{m.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
              {error && (
                <p className="flex items-center gap-2 text-sm text-brand-text-secondary">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </p>
              )}
              <Button onClick={handleComplete} disabled={submitting} className="w-full" size="lg">
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <KeyRound className="h-4 w-4" />
                )}
                {submitting ? 'İşleniyor...' : 'Siparişi Tamamla'}
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-bold text-white">Özet</h2>
              <div className="mt-4 flex items-center justify-between border-t border-brand-accent/20 pt-4">
                <span className="font-medium text-white">Toplam</span>
                <span className="text-2xl font-black text-brand-accent">{format(total)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
