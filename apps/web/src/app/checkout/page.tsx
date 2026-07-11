'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShoppingCart, Loader2, AlertCircle, PackageCheck, Info } from 'lucide-react';
import { Button, Card, CardContent, Spinner } from '@cyberlisans/ui/atoms';
import { useCart } from '@/lib/cart-store';
import { useCurrency } from '@/lib/currency-context';
import { useAuth } from '@/lib/auth-context';
import { apiFetch, ApiError } from '@/lib/api-client';
import { StorefrontHeader } from '@/components/store/storefront-header';
import { EmptyState } from '@/components/store/empty-state';

export default function CheckoutPage() {
  const router = useRouter();
  const params = useSearchParams();
  const { user, isLoading: authLoading } = useAuth();
  const { items, getTotal, clearCart, hydrated } = useCart();
  const { format, currency } = useCurrency();
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
            description="Sipariş için önce ürün eklemelisin."
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
      const order = await apiFetch<{ id: string; orderNumber?: string }>('/orders', {
        method: 'POST',
        body: JSON.stringify({
          items: items.map((it) => ({ productId: it.id, quantity: it.qty })),
          currency: currency || 'TRY',
          paymentMethod: 'BANK_TRANSFER',
          notes: 'Ödeme entegrasyonu bekleniyor — sipariş PENDING oluşturuldu',
        }),
      });
      clearCart();
      router.push(`/dashboard/orders/${order.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Sipariş oluşturulamadı');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <StorefrontHeader />
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="mb-2 text-3xl font-semibold tracking-tight text-white">Sipariş oluştur</h1>
        <p className="mb-6 text-sm text-brand-text-secondary">
          Online ödeme entegrasyonu yakında. Şimdilik siparişin PENDING olarak kaydedilir; stok ve
          key rezerve edilir.
        </p>
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

              <div className="flex items-start gap-3 rounded-xl border border-brand-accent/25 bg-brand-accent/10 p-4 text-sm text-brand-text-secondary">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand-accent" />
                <div>
                  <p className="font-medium text-white">Ödeme altyapısı henüz aktif değil</p>
                  <p className="mt-1">
                    Sipariş DB’ye yazılır, anahtarlar rezerve edilir. Admin panelinden manuel
                    “ödendi” + “teslim et” ile akış tamamlanabilir.
                  </p>
                </div>
              </div>

              {error && (
                <p className="flex items-center gap-2 text-sm text-brand-danger">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </p>
              )}
              <Button onClick={handleComplete} disabled={submitting} className="w-full" size="lg">
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <PackageCheck className="h-4 w-4" />
                )}
                {submitting ? 'Oluşturuluyor...' : 'Siparişi oluştur (PENDING)'}
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
