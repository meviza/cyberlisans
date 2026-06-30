'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Wallet, CreditCard, Bitcoin, Building2, ArrowLeft, Shield, Loader2 } from 'lucide-react';
import { Button, Card, CardContent, Badge } from '@cyberlisans/ui/atoms';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/lib/auth-context';

type PaymentMethod = 'WALLET' | 'PAPARA' | 'PAYTR' | 'NOWPAYMENTS' | 'BANK_TRANSFER';

const METHODS: Array<{ value: PaymentMethod; label: string; desc: string; icon: React.ComponentType<{ className?: string }> }> = [
  { value: 'WALLET', label: 'Cüzdan', desc: 'Anında ödeme, bakiyenden düşer', icon: Wallet },
  { value: 'PAPARA', label: 'Papara', desc: 'Papara hesabınla hızlı ödeme', icon: CreditCard },
  { value: 'PAYTR', label: 'PayTR', desc: 'Kredi kartı / banka kartı', icon: CreditCard },
  { value: 'NOWPAYMENTS', label: 'Kripto', desc: 'Bitcoin, Ethereum, USDT', icon: Bitcoin },
  { value: 'BANK_TRANSFER', label: 'Havale / EFT', desc: 'Manuel onay gerekir', icon: Building2 },
];

const ORDER_LINES = [
  { title: 'Steam Cüzdan 50 TL', qty: 1, price: 50 },
  { title: 'Windows 11 Pro Key', qty: 1, price: 1200 },
];
const SUBTOTAL = ORDER_LINES.reduce((s, l) => s + l.price * l.qty, 0);

export default function CheckoutPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [method, setMethod] = React.useState<PaymentMethod>('WALLET');
  const [consent, setConsent] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (!authLoading && !user) router.replace('/login');
  }, [user, authLoading, router]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consent) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    router.push('/dashboard/orders');
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <Link
        href="/cart"
        className="mb-6 inline-flex items-center gap-2 text-sm text-cyber-cyan hover:text-cyber-magenta"
      >
        <ArrowLeft className="h-4 w-4" />
        Sepete dön
      </Link>
      <h1 className="mb-8 font-orbitron text-3xl font-black text-white">Ödeme</h1>

      <form onSubmit={onSubmit} className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h2 className="mb-4 font-orbitron text-lg font-bold text-white">Ödeme Yöntemi</h2>
              <div className="space-y-2">
                {METHODS.map((m) => {
                  const Icon = m.icon;
                  const active = method === m.value;
                  return (
                    <button
                      key={m.value}
                      type="button"
                      onClick={() => setMethod(m.value)}
                      className={
                        active
                          ? 'flex w-full items-center gap-3 rounded-md border border-cyber-cyan/50 bg-cyber-cyan/10 p-4 text-left'
                          : 'flex w-full items-center gap-3 rounded-md border border-white/10 bg-white/5 p-4 text-left transition-colors hover:border-cyber-cyan/30'
                      }
                    >
                      <div
                        className={
                          active
                            ? 'flex h-10 w-10 items-center justify-center rounded-md border border-cyber-cyan/50 bg-cyber-cyan/20 text-cyber-cyan'
                            : 'flex h-10 w-10 items-center justify-center rounded-md border border-white/20 bg-cyber-darker text-white/70'
                        }
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-white">{m.label}</p>
                        <p className="text-xs text-white/60">{m.desc}</p>
                      </div>
                      <div
                        className={
                          active
                            ? 'h-4 w-4 rounded-full border-2 border-cyber-cyan bg-cyber-cyan shadow-[0_0_8px_rgba(0,240,255,0.8)]'
                            : 'h-4 w-4 rounded-full border-2 border-white/30'
                        }
                      />
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <Checkbox
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                label={
                  <>
                    <Link href="/legal/kvkk" className="text-cyber-cyan hover:underline">
                      KVKK aydınlatma metnini
                    </Link>{' '}
                    ve{' '}
                    <Link href="/legal/terms" className="text-cyber-cyan hover:underline">
                      kullanım koşullarını
                    </Link>{' '}
                    okudum, kabul ediyorum.
                  </>
                }
              />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="p-6">
            <h2 className="mb-4 font-orbitron text-lg font-bold text-white">Sipariş Özeti</h2>
            <div className="space-y-2 border-b border-cyber-cyan/20 pb-4 text-sm">
              {ORDER_LINES.map((l) => (
                <div key={l.title} className="flex justify-between text-white/70">
                  <span className="truncate pr-2">
                    {l.qty}x {l.title}
                  </span>
                  <span>{l.price.toLocaleString()} ₺</span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-between">
              <span className="font-medium text-white">Toplam</span>
              <span className="font-orbitron text-2xl font-black text-cyber-cyan text-glow-cyan">
                {SUBTOTAL.toLocaleString()} ₺
              </span>
            </div>
            <div className="mt-4 flex items-center gap-2 rounded-md border border-cyber-cyan/20 bg-cyber-cyan/5 p-3 text-xs text-white/70">
              <Shield className="h-4 w-4 shrink-0 text-cyber-cyan" />
              <span>256-bit SSL şifreleme ile güvenli ödeme</span>
            </div>
            {method === 'WALLET' && user && (
              <div className="mt-4 rounded-md border border-cyber-cyan/20 bg-cyber-darker p-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-white/70">Cüzdan bakiyesi</span>
                  <span className="font-orbitron text-cyber-cyan">
                    ₺{user.wallet.balanceTry.toLocaleString()}
                  </span>
                </div>
                {user.wallet.balanceTry < SUBTOTAL && (
                  <Badge variant="warning" className="mt-2">Yetersiz bakiye</Badge>
                )}
              </div>
            )}
            <Button
              type="submit"
              size="lg"
              className="mt-6 w-full"
              disabled={loading || !consent || (method === 'WALLET' && (user?.wallet.balanceTry ?? 0) < SUBTOTAL)}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {loading ? 'İşleniyor...' : 'Siparişi Tamamla'}
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}