'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Save, ArrowLeft, Loader2 } from 'lucide-react';
import { Card, CardContent, Button, Input, Label, Spinner } from '@cyberlisans/ui/atoms';
import { Select } from '@/components/ui/select';
import { apiFetch, ApiError } from '@/lib/api-client';
import type { DealerProfile } from '@/lib/dealer-types';

interface ProductOption {
  id: string;
  name: string;
}

interface DealerCreateLinkFormProps {
  profile: DealerProfile;
  products: ProductOption[];
}

export function DealerCreateLinkForm({ profile, products }: DealerCreateLinkFormProps) {
  const router = useRouter();
  const [productId, setProductId] = React.useState<string>('');
  const [discountPercent, setDiscountPercent] = React.useState<number>(10);
  const [maxUses, setMaxUses] = React.useState<string>('');
  const [expiresAt, setExpiresAt] = React.useState<string>('');
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const productOptions = React.useMemo(
    () => [
      { value: '', label: 'Tüm ürünler' },
      ...products.map((p) => ({ value: p.id, label: p.name })),
    ],
    [products],
  );

  if (profile.status !== 'APPROVED') {
    return (
      <div className="space-y-4">
        <h1 className="font-orbitron text-2xl font-black text-white">Yeni Link Oluştur</h1>
        <Card>
          <CardContent className="p-6 text-sm text-white/70">
            Link oluşturabilmek için bayi başvurunuzun onaylanmış olması gerekir.
          </CardContent>
        </Card>
      </div>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        productId: productId || null,
        discountPercent,
        maxUses: maxUses ? Number(maxUses) : null,
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
      };
      const created = await apiFetch<{ id: string }>('/dealer/links', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      router.push(`/dealer/links/${created.id}/qr`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Link oluşturulamadı');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <button
          type="button"
          onClick={() => router.push('/dealer/links')}
          className="mb-2 inline-flex items-center gap-1 text-sm text-white/60 hover:text-cyber-cyan"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Linklere Dön
        </button>
        <h1 className="font-orbitron text-2xl font-black text-white">Yeni Bayi Linki</h1>
        <p className="text-sm text-white/60">Paylaşılabilir bir link oluştur.</p>
      </div>

      <Card>
        <CardContent className="p-6">
          {products.length === 0 ? (
            <p className="text-sm text-white/60">Ürünler yüklenemedi.</p>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <div>
                <Label htmlFor="productId" className="mb-2 block">
                  Ürün
                </Label>
                <Select
                  id="productId"
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                  options={productOptions}
                />
                <p className="mt-1 text-xs text-white/50">
                  Boş bırakırsanız tüm ürünler için geçerli olur.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="discountPercent" className="mb-2 block">
                    İndirim (%)
                  </Label>
                  <Input
                    id="discountPercent"
                    type="number"
                    min={0}
                    max={100}
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(Number(e.target.value))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="maxUses" className="mb-2 block">
                    Maks. Kullanım
                  </Label>
                  <Input
                    id="maxUses"
                    type="number"
                    min={1}
                    value={maxUses}
                    onChange={(e) => setMaxUses(e.target.value)}
                    placeholder="Sınırsız"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="expiresAt" className="mb-2 block">
                  Son Geçerlilik Tarihi
                </Label>
                <Input
                  id="expiresAt"
                  type="datetime-local"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                />
              </div>
              {error && <p className="text-sm text-cyber-magenta">{error}</p>}
              <div className="flex justify-end gap-2 border-t border-cyber-cyan/20 pt-4">
                <Button type="button" variant="ghost" onClick={() => router.push('/dealer/links')}>
                  İptal
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {submitting ? 'Oluşturuluyor...' : 'Link Oluştur'}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
