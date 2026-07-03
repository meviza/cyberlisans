'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Save,
  Trash2,
  Copy,
  QrCode,
  Loader2,
  Eye,
  MousePointerClick,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import {
  Card,
  CardContent,
  Button,
  Input,
  Label,
  Badge,
  Spinner,
  Separator,
} from '@cyberlisans/ui/atoms';
import { Select } from '@/components/ui/select';
import { apiFetch, ApiError } from '@/lib/api-client';
import type { DealerLink } from '@/lib/dealer-types';

interface ProductOption {
  id: string;
  name?: string;
  title?: string;
}

interface DealerLinkDetailProps {
  initialLink: DealerLink;
  products: ProductOption[];
}

export function DealerLinkDetail({ initialLink, products }: DealerLinkDetailProps) {
  const router = useRouter();
  const [link, setLink] = React.useState<DealerLink>(initialLink);
  const [discountPercent, setDiscountPercent] = React.useState(initialLink.discountPercent);
  const [maxUses, setMaxUses] = React.useState<string>(
    initialLink.maxUses != null ? String(initialLink.maxUses) : '',
  );
  const [expiresAt, setExpiresAt] = React.useState<string>(
    initialLink.expiresAt ? new Date(initialLink.expiresAt).toISOString().slice(0, 16) : '',
  );
  const [isActive, setIsActive] = React.useState(initialLink.isActive);
  const [productId, setProductId] = React.useState<string>(initialLink.productId ?? '');
  const [saving, setSaving] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);

  const productOptions = React.useMemo(
    () => [
      { value: '', label: 'Tüm ürünler' },
      ...products.map((p) => ({ value: p.id, label: p.name ?? p.title ?? p.id })),
    ],
    [products],
  );

  const url =
    typeof window !== 'undefined'
      ? `${window.location.origin}/?ref=${link.code}`
      : `/?ref=${link.code}`;

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const updated = await apiFetch<DealerLink>(`/dealer/links/${link.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          discountPercent,
          maxUses: maxUses ? Number(maxUses) : null,
          expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
          isActive,
          productId: productId || null,
        }),
      });
      setLink(updated);
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Güncellenemedi');
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!confirm('Bu linki silmek istediğine emin misin?')) return;
    setDeleting(true);
    try {
      await apiFetch(`/dealer/links/${link.id}`, { method: 'DELETE' });
      router.push('/dealer/links');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Silinemedi');
      setDeleting(false);
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {}
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
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h1 className="font-orbitron text-2xl font-black text-white">
              <span className="text-cyber-cyan">{link.code}</span>
            </h1>
            <p className="text-sm text-white/60">Link detaylarını düzenle ve istatistikleri gör.</p>
          </div>
          <div className="flex gap-2">
            <Link href={`/dealer/links/${link.id}/qr`}>
              <Button variant="outline">
                <QrCode className="h-4 w-4" />
                QR Kod
              </Button>
            </Link>
            <Button variant="secondary" onClick={remove} disabled={deleting}>
              {deleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Sil
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <p className="text-xs uppercase tracking-wider text-white/50">Kullanım</p>
            <p className="mt-1 font-orbitron text-2xl text-white">
              {link.currentUses}
              {link.maxUses != null && (
                <span className="text-base text-white/50"> / {link.maxUses}</span>
              )}
            </p>
            <p className="mt-1 flex items-center gap-1 text-xs text-white/50">
              <Eye className="h-3 w-3" /> Kullanım sayısı
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs uppercase tracking-wider text-white/50">Tıklama</p>
            <p className="mt-1 font-orbitron text-2xl text-white">{link.clicks}</p>
            <p className="mt-1 flex items-center gap-1 text-xs text-white/50">
              <MousePointerClick className="h-3 w-3" /> Toplam tıklama
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs uppercase tracking-wider text-white/50">Son Geçerlilik</p>
            <p className="mt-1 font-orbitron text-base text-white">
              {link.expiresAt ? new Date(link.expiresAt).toLocaleDateString('tr-TR') : 'Sınırsız'}
            </p>
            <p className="mt-1 flex items-center gap-1 text-xs text-white/50">
              <Calendar className="h-3 w-3" /> Bitiş tarihi
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="space-y-3 p-6">
          <h2 className="font-orbitron text-lg font-bold text-white">Paylaşım Linki</h2>
          <div className="flex items-center gap-2 rounded-md border border-cyber-cyan/30 bg-cyber-darker/60 p-3 font-mono text-sm">
            <span className="min-w-0 flex-1 truncate text-cyber-cyan">{url}</span>
            <Button type="button" variant="outline" size="sm" onClick={copy}>
              {copied ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-cyber-lime" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
              {copied ? 'Kopyalandı' : 'Kopyala'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <h2 className="mb-4 font-orbitron text-lg font-bold text-white">Ayarlar</h2>
          <form onSubmit={save} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
              </div>
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
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
              <div>
                <Label htmlFor="expiresAt" className="mb-2 block">
                  Son Geçerlilik
                </Label>
                <Input
                  id="expiresAt"
                  type="datetime-local"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                id="isActive"
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-4 w-4 rounded border-cyber-cyan/40 bg-cyber-darker"
              />
              <Label htmlFor="isActive">Aktif</Label>
            </div>
            {error && <p className="text-sm text-cyber-magenta">{error}</p>}
            <div className="flex justify-end">
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {saving ? 'Kaydediliyor...' : 'Kaydet'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3 p-6">
          <h2 className="font-orbitron text-lg font-bold text-white">Meta</h2>
          <Separator />
          <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
            <div>
              <p className="text-xs text-white/50">Oluşturulma</p>
              <p className="text-white">{new Date(link.createdAt).toLocaleString('tr-TR')}</p>
            </div>
            <div>
              <p className="text-xs text-white/50">Link ID</p>
              <p className="font-mono text-white/70">{link.id}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function DealerLinkLoading() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <Spinner size="lg" />
    </div>
  );
}
