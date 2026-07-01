'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Wallet,
  CreditCard,
  Bitcoin,
  Building2,
  ArrowLeft,
  Shield,
  Loader2,
  AlertCircle,
  Check,
} from 'lucide-react';
import { Button, Card, CardContent, Spinner } from '@cyberlisans/ui/atoms';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/lib/auth-context';
import { useCart } from '@/lib/cart-store';
import { useCurrency } from '@/lib/currency-context';
import { StorefrontHeader } from '@/components/store/storefront-header';
import { PaymentMethodCard } from '@/components/store/payment-method-card';
import { EmptyState } from '@/components/store/empty-state';
import { ShoppingCart } from 'lucide-react';
import { apiFetch, ApiError } from '@/lib/api-client';

type PaymentMethod = 'WALLET' | 'STRIPE' | 'BANK_TRANSFER' | 'PAYTR' | 'PAPARA' | 'CRYPTO';

const METHODS: Array<{
  value: PaymentMethod;
  label: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}> = [
  {
    value: 'WALLET',
    label: 'Cüzdan',
    desc: 'Anında ödeme, bakiyenden düşer',
    icon: Wallet,
    badge: 'Hızlı',
  },
  {
    value: 'STRIPE',
    label: 'Kredi Kartı',
    desc: 'Stripe ile güvenli kart ödemesi',
    icon: CreditCard,
  },
  { value: 'PAYTR', label: 'PayTR', desc: 'Kredi kartı / banka kartı', icon: CreditCard },
  { value: 'PAPARA', label: 'Papara', desc: 'Papara hesabınla hızlı ödeme', icon: CreditCard },
  {
    value: 'CRYPTO',
    label: 'Kripto',
    desc: 'USDT, Bitcoin, Ethereum ile öde',
    icon: Bitcoin,
    badge: 'Global',
  },
  { value: 'BANK_TRANSFER', label: 'Havale / EFT', desc: 'Manuel onay gerekir', icon: Building2 },
];

type Step = 1 | 2 | 3 | 4;

interface CreatedOrder {
  orderId: string;
  redirectUrl?: string;
  method: PaymentMethod;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { items, getTotal, clearCart, hydrated, refCode } = useCart();
  const { format, convert, currency } = useCurrency();

  const [step, setStep] = React.useState<Step>(1);
  const [method, setMethod] = React.useState<PaymentMethod>('WALLET');
  const [consent, setConsent] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [order, setOrder] = React.useState<CreatedOrder | null>(null);

  React.useEffect(() => {
    if (!authLoading && !user) {
      const next =
        typeof window !== 'undefined'
          ? window.location.pathname + window.location.search
          : '/checkout';
      router.replace(`/login?next=${encodeURIComponent(next)}`);
    }
  }, [user, authLoading, router]);

  const total = getTotal();

  if (authLoading) {
    return (
      <>
        <StorefrontHeader />
        <main className="flex min-h-[60vh] items-center justify-center">
          <Spinner size="lg" />
        </main>
      </>
    );
  }
  if (!user) return null;

  if (hydrated && items.length === 0 && !order) {
    return (
      <>
        <StorefrontHeader />
        <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <EmptyState
            icon={ShoppingCart}
            title="Sepetin boş"
            description="Ödeme yapabilmek için önce sepete ürün eklemelisin."
            ctaLabel="Ürünlere göz at"
            ctaHref="/products"
          />
        </main>
      </>
    );
  }

  const walletBalance =
    currency === 'TRY'
      ? user.wallet.balanceTry
      : currency === 'USD'
        ? user.wallet.balanceUsd
        : user.wallet.balanceEur;
  const totalInCurrency = convert(total);
  const insufficientWallet = method === 'WALLET' && walletBalance < totalInCurrency;

  const handleSelectMethod = (m: PaymentMethod) => {
    setMethod(m);
    setError(null);
    setStep(2);
  };

  const createOrder = async (): Promise<CreatedOrder | null> => {
    setError(null);
    setLoading(true);
    try {
      const refCode =
        typeof document !== 'undefined'
          ? (document.cookie
              .split('; ')
              .find((c) => c.startsWith('cl_ref='))
              ?.split('=')[1] ??
            new URLSearchParams(window.location.search).get('ref') ??
            null)
          : null;
      const res = await apiFetch<{ orderId: string; redirectUrl?: string }>('/orders', {
        method: 'POST',
        body: JSON.stringify({
          items: items.map((it) => ({ productId: it.id, qty: it.qty })),
          paymentMethod: method,
          currency,
          refCode: refCode ?? undefined,
        }),
      });
      const created: CreatedOrder = { orderId: res.orderId, redirectUrl: res.redirectUrl, method };
      setOrder(created);
      if (res.redirectUrl) {
        window.location.href = res.redirectUrl;
      }
      return created;
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError('Sipariş oluşturulurken bir hata oluştu');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmMethod = async () => {
    if (!consent) {
      setError('Devam etmek için KVKK ve kullanım koşullarını onaylamalısın.');
      return;
    }
    if (method === 'WALLET') {
      setStep(3);
      return;
    }
    await createOrder();
    if (!error) setStep(4);
  };

  const handlePayWithWallet = async () => {
    setError(null);
    setLoading(true);
    try {
      const created = await createOrder();
      if (!created) return;
      await apiFetch('/payments/initiate', {
        method: 'POST',
        body: JSON.stringify({
          provider: 'WALLET',
          orderId: created.orderId,
          amount: total,
          currency: 'TRY',
        }),
      });
      setStep(4);
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError('Cüzdandan ödeme alınamadı');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (step === 4 && order && !order.redirectUrl) {
      const t = window.setTimeout(() => {
        router.push(`/checkout/success?orderId=${order.orderId}`);
        clearCart();
      }, 1500);
      return () => window.clearTimeout(t);
    }
    return undefined;
  }, [step, order, router, clearCart]);

  return (
    <>
      <StorefrontHeader />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href="/cart"
          className="mb-6 inline-flex items-center gap-2 text-sm text-cyber-cyan hover:text-cyber-magenta"
        >
          <ArrowLeft className="h-4 w-4" />
          Sepete dön
        </Link>
        <h1 className="mb-2 font-orbitron text-3xl font-black text-white">Ödeme</h1>
        <Stepper step={step} />

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            {step >= 1 && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="mb-4 font-orbitron text-lg font-bold text-white">
                    1. Sipariş Özeti
                  </h2>
                  <ul className="space-y-2 text-sm">
                    {items.map((it) => (
                      <li
                        key={it.id}
                        className="flex items-center justify-between gap-2 text-white/70"
                      >
                        <span className="truncate">
                          {it.qty}x {it.title}
                        </span>
                        <span className="font-mono text-white">
                          {format(it.unitPrice * it.qty)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {step >= 2 && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="mb-4 font-orbitron text-lg font-bold text-white">
                    2. Ödeme Yöntemi
                  </h2>
                  <div className="space-y-2">
                    {METHODS.map((m) => {
                      const Icon = m.icon;
                      return (
                        <PaymentMethodCard
                          key={m.value}
                          value={m.value}
                          selected={method === m.value}
                          onSelect={(v) => handleSelectMethod(v as PaymentMethod)}
                          icon={Icon}
                          label={m.label}
                          description={m.desc}
                          badge={m.badge}
                        />
                      );
                    })}
                  </div>

                  <div className="mt-6 border-t border-cyber-cyan/20 pt-5">
                    <Checkbox
                      checked={consent}
                      onChange={(e) => setConsent(e.target.checked)}
                      label={
                        <span>
                          <Link href="/legal/kvkk" className="text-cyber-cyan hover:underline">
                            KVKK aydınlatma metnini
                          </Link>{' '}
                          ve{' '}
                          <Link href="/legal/terms" className="text-cyber-cyan hover:underline">
                            kullanım koşullarını
                          </Link>{' '}
                          okudum, kabul ediyorum.
                        </span>
                      }
                    />
                  </div>

                  {error && (
                    <p className="mt-3 flex items-center gap-2 text-sm text-cyber-magenta">
                      <AlertCircle className="h-4 w-4" />
                      {error}
                    </p>
                  )}

                  {step === 2 && (
                    <Button
                      onClick={handleConfirmMethod}
                      disabled={!consent || loading || insufficientWallet}
                      className="mt-5 w-full"
                      size="lg"
                    >
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                      {loading ? 'İşleniyor...' : insufficientWallet ? 'Yetersiz bakiye' : 'Devam'}
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            {step === 3 && method === 'WALLET' && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="mb-4 font-orbitron text-lg font-bold text-white">
                    3. Cüzdandan Öde
                  </h2>
                  <div className="space-y-3 rounded-md border border-cyber-cyan/20 bg-cyber-darker p-4 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-white/70">Mevcut bakiye</span>
                      <span className="font-orbitron text-lg text-white">
                        {currency === 'TRY'
                          ? `₺${user.wallet.balanceTry.toLocaleString()}`
                          : currency === 'USD'
                            ? `$${user.wallet.balanceUsd.toLocaleString()}`
                            : `€${user.wallet.balanceEur.toLocaleString()}`}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/70">Sepet toplamı</span>
                      <span className="font-orbitron text-lg text-cyber-cyan">{format(total)}</span>
                    </div>
                    <div className="flex items-center justify-between border-t border-cyber-cyan/20 pt-3">
                      <span className="text-white/70">Kalan bakiye</span>
                      <span
                        className={`font-orbitron text-lg ${insufficientWallet ? 'text-cyber-magenta' : 'text-cyber-lime'}`}
                      >
                        {currency === 'TRY'
                          ? `₺${Math.max(0, user.wallet.balanceTry - total).toLocaleString()}`
                          : currency === 'USD'
                            ? `$${Math.max(0, user.wallet.balanceUsd - totalInCurrency).toLocaleString()}`
                            : `€${Math.max(0, user.wallet.balanceEur - totalInCurrency).toLocaleString()}`}
                      </span>
                    </div>
                  </div>
                  {insufficientWallet && (
                    <p className="mt-3 flex items-center gap-2 text-sm text-cyber-magenta">
                      <AlertCircle className="h-4 w-4" />
                      Yetersiz bakiye. Lütfen başka bir ödeme yöntemi seç veya cüzdanına yükle.
                    </p>
                  )}
                  <Button
                    onClick={handlePayWithWallet}
                    disabled={insufficientWallet || loading}
                    className="mt-5 w-full"
                    size="lg"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Wallet className="h-5 w-5" />
                    )}
                    {loading ? 'Ödeniyor...' : 'Cüzdandan Öde'}
                  </Button>
                </CardContent>
              </Card>
            )}

            {step === 4 && order && (
              <Card>
                <CardContent className="p-10 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 animate-pulse items-center justify-center rounded-full border-2 border-cyber-lime bg-cyber-lime/10 text-cyber-lime shadow-[0_0_20px_rgba(190,242,100,0.4)]">
                    <Check className="h-8 w-8" strokeWidth={3} />
                  </div>
                  <h2 className="mb-2 font-orbitron text-2xl font-black text-white">
                    Siparişin Alındı!
                  </h2>
                  <p className="text-white/60">
                    Sipariş No: <span className="font-mono text-cyber-cyan">{order.orderId}</span>
                  </p>
                  <p className="mt-4 text-sm text-white/50">Onay sayfasına yönlendiriliyorsun…</p>
                </CardContent>
              </Card>
            )}
          </div>

          <Card className="sticky top-20 self-start">
            <CardContent className="p-6">
              <h2 className="mb-4 font-orbitron text-lg font-bold text-white">Sipariş Özeti</h2>
              <div className="space-y-2 border-b border-cyber-cyan/20 pb-4 text-sm">
                <div className="flex justify-between text-white/70">
                  <span>Ara toplam ({items.length} ürün)</span>
                  <span>{format(total)}</span>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-cyber-cyan/20 pt-4">
                <span className="font-medium text-white">Toplam</span>
                <span className="font-orbitron text-2xl font-black text-cyber-cyan text-glow-cyan">
                  {format(total)}
                </span>
              </div>
              <div className="mt-4 flex items-center gap-2 rounded-md border border-cyber-cyan/20 bg-cyber-cyan/5 p-3 text-xs text-white/70">
                <Shield className="h-4 w-4 shrink-0 text-cyber-cyan" />
                <span>256-bit SSL şifreleme ile güvenli ödeme</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}

function Stepper({ step }: { step: Step }) {
  const steps = [
    { n: 1, label: 'Sepet' },
    { n: 2, label: 'Ödeme' },
    { n: 3, label: 'Onay' },
    { n: 4, label: 'Tamam' },
  ];
  return (
    <div className="mt-4 flex items-center gap-2 text-xs">
      {steps.map((s, i) => (
        <React.Fragment key={s.n}>
          <div
            className={
              step >= s.n
                ? 'flex items-center gap-2 rounded-full border border-cyber-cyan/50 bg-cyber-cyan/10 px-3 py-1 font-mono uppercase tracking-wider text-cyber-cyan'
                : 'flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 font-mono uppercase tracking-wider text-white/40'
            }
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-cyber-cyan/20 text-[10px]">
              {s.n}
            </span>
            {s.label}
          </div>
          {i < steps.length - 1 && <div className="h-px flex-1 bg-cyber-cyan/20" />}
        </React.Fragment>
      ))}
    </div>
  );
}
