'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ShoppingCart,
  Loader2,
  AlertCircle,
  CreditCard,
  Bitcoin,
  Wallet,
  Info,
} from 'lucide-react';
import { Button, Card, CardContent, Spinner } from '@cyberlisans/ui/atoms';
import { useCart } from '@/lib/cart-store';
import { useCurrency } from '@/lib/currency-context';
import { useAuth } from '@/lib/auth-context';
import { apiFetch, ApiError } from '@/lib/api-client';
import { StorefrontHeader } from '@/components/store/storefront-header';
import { EmptyState } from '@/components/store/empty-state';

type PayMethod = 'STRIPE' | 'NOWPAYMENTS' | 'WALLET';

interface WalletBalance {
  balanceTry?: number;
  balanceUsd?: number;
  balanceEur?: number;
  balanceUsdt?: number;
  TRY?: number;
  USD?: number;
  EUR?: number;
  USDT?: number;
}

const METHODS: Array<{
  value: PayMethod;
  label: string;
  desc: string;
  Icon: React.ComponentType<{ className?: string }>;
}> = [
  {
    value: 'STRIPE',
    label: 'Kart / Stripe Link',
    desc: 'Kredi kartı veya Stripe Link ile güvenli ödeme',
    Icon: CreditCard,
  },
  {
    value: 'NOWPAYMENTS',
    label: 'Kripto',
    desc: 'USDT ve diğer kripto paralar (NOWPayments)',
    Icon: Bitcoin,
  },
  {
    value: 'WALLET',
    label: 'Platform cüzdanı',
    desc: 'CyberLisans bakiyenizden düşülür',
    Icon: Wallet,
  },
];

export default function CheckoutPage() {
  const router = useRouter();
  const params = useSearchParams();
  const { user, isLoading: authLoading } = useAuth();
  const { items, getTotal, clearCart, hydrated } = useCart();
  const { format, currency } = useCurrency();
  const [method, setMethod] = React.useState<PayMethod>('STRIPE');
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [wallet, setWallet] = React.useState<WalletBalance | null>(null);
  const cancelled = params?.get('cancelled');
  const total = getTotal();
  const cur = (currency || 'TRY') as 'TRY' | 'USD' | 'EUR' | 'USDT';

  React.useEffect(() => {
    if (!authLoading && !user) router.replace('/login?next=/checkout');
  }, [user, authLoading, router]);

  React.useEffect(() => {
    if (!user) return;
    let dead = false;
    (async () => {
      try {
        const w = await apiFetch<WalletBalance>('/wallet');
        if (!dead) setWallet(w);
      } catch {
        if (!dead) setWallet(null);
      }
    })();
    return () => {
      dead = true;
    };
  }, [user]);

  const balance = React.useMemo(() => {
    if (!wallet) return 0;
    if (cur === 'TRY') return Number(wallet.balanceTry ?? wallet.TRY ?? 0);
    if (cur === 'USD') return Number(wallet.balanceUsd ?? wallet.USD ?? 0);
    if (cur === 'EUR') return Number(wallet.balanceEur ?? wallet.EUR ?? 0);
    return Number(wallet.balanceUsdt ?? wallet.USDT ?? 0);
  }, [wallet, cur]);

  if (authLoading || !hydrated)
    return (
      <main className="flex min-h-[60vh] items-center justify-center">
        <Spinner size="lg" />
      </main>
    );
  if (!user) return null;
  if (items.length === 0) {
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

  const handlePay = async () => {
    setError(null);
    setSubmitting(true);
    try {
      // 1) Create PENDING order (server prices + key reserve)
      const order = await apiFetch<{ id: string; totalAmount: number; currency: string }>(
        '/orders',
        {
          method: 'POST',
          body: JSON.stringify({
            items: items.map((it) => ({ productId: it.id, quantity: it.qty })),
            currency: cur,
            paymentMethod:
              method === 'STRIPE' ? 'STRIPE' : method === 'NOWPAYMENTS' ? 'NOWPAYMENTS' : 'WALLET',
          }),
        },
      );

      if (method === 'WALLET') {
        await apiFetch(`/wallet/pay/${order.id}`, { method: 'POST' });
        clearCart();
        router.push(`/checkout/success?orderId=${order.id}`);
        return;
      }

      // 2) External provider (Stripe / crypto)
      const pay = await apiFetch<{
        redirectUrl?: string;
        paymentId: string;
        providerRef: string;
      }>('/payments/initiate', {
        method: 'POST',
        body: JSON.stringify({
          orderId: order.id,
          amount: order.totalAmount,
          currency: order.currency || cur,
          provider: method,
        }),
      });

      if (pay.redirectUrl) {
        clearCart();
        window.location.href = pay.redirectUrl;
        return;
      }

      // No redirect (unlikely) — treat as pending
      clearCart();
      router.push(`/dashboard/orders/${order.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Ödeme başlatılamadı');
    } finally {
      setSubmitting(false);
    }
  };

  const walletInsufficient = method === 'WALLET' && balance < total;

  return (
    <>
      <StorefrontHeader />
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="mb-2 text-3xl font-semibold tracking-tight text-white">Ödeme</h1>
        <p className="mb-6 text-sm text-brand-text-secondary">
          Stripe Link, kripto veya platform cüzdanı ile öde.
        </p>

        {cancelled && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-brand-warning/30 bg-brand-warning/10 px-4 py-3 text-sm text-brand-warning">
            <AlertCircle className="h-4 w-4" />
            Ödeme iptal edildi. Tekrar deneyebilirsin.
          </div>
        )}

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

              <h2 className="text-lg font-bold text-white">Ödeme yöntemi</h2>
              <div className="space-y-2">
                {METHODS.map((m) => (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => setMethod(m.value)}
                    className={
                      method === m.value
                        ? 'flex w-full items-center gap-3 rounded-xl border border-brand-accent/60 bg-brand-accent/10 p-3 text-left'
                        : 'flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3 text-left hover:border-brand-accent/40'
                    }
                  >
                    <m.Icon className="h-5 w-5 text-brand-accent" />
                    <div className="flex-1">
                      <p className="font-medium text-white">{m.label}</p>
                      <p className="text-xs text-white/60">{m.desc}</p>
                      {m.value === 'WALLET' && (
                        <p className="mt-1 text-xs text-brand-accent">
                          Bakiye: {format(balance)}
                          {walletInsufficient ? ' — yetersiz' : ''}
                        </p>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {method === 'STRIPE' && (
                <div className="flex items-start gap-2 rounded-lg border border-white/10 bg-white/[0.03] p-3 text-xs text-white/60">
                  <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-accent" />
                  Stripe Checkout’a yönlendirileceksin (kart + Link). Minimum tutar ~₺50 / $0.50
                  (Stripe kuralı). Test kartı: 4242 4242 4242 4242.
                </div>
              )}
              {method === 'NOWPAYMENTS' && (
                <div className="flex items-start gap-2 rounded-lg border border-white/10 bg-white/[0.03] p-3 text-xs text-white/60">
                  <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-accent" />
                  Kripto için NOWPayments API anahtarı gerekir. Yapılandırılmadıysa hata alırsın —
                  anahtarları Netlify env’e ekle.
                </div>
              )}

              {error && (
                <p className="flex items-center gap-2 text-sm text-brand-danger">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </p>
              )}

              <Button
                onClick={handlePay}
                disabled={submitting || walletInsufficient}
                className="w-full"
                size="lg"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CreditCard className="h-4 w-4" />
                )}
                {submitting
                  ? 'İşleniyor...'
                  : method === 'WALLET'
                    ? 'Cüzdan ile öde'
                    : method === 'STRIPE'
                      ? 'Stripe ile öde'
                      : 'Kripto ile öde'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-bold text-white">Özet</h2>
              <div className="mt-4 flex items-center justify-between border-t border-brand-accent/20 pt-4">
                <span className="font-medium text-white">Toplam</span>
                <span className="text-2xl font-semibold text-brand-accent">{format(total)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
