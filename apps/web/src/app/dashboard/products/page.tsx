'use client';

import * as React from 'react';
import { Key, Copy, Eye, EyeOff, Check, Package } from 'lucide-react';
import { Card, CardContent, Badge, Button } from '@cyberlisans/ui/atoms';
import { EmptyState } from '@/components/dashboard/empty-state';
import { apiFetch } from '@/lib/api-client';

interface ProductKey {
  id: string;
  productTitle: string;
  brand: string;
  key: string;
  deliveredAt: string;
  status: 'active' | 'expired' | 'revoked';
}

const MOCK_KEYS: ProductKey[] = [
  {
    id: '1',
    productTitle: 'Steam Cüzdan 50 TL',
    brand: 'Steam',
    key: 'STM-7K3F-92HD-JX4P-9K2L',
    deliveredAt: '28 Haz 2026',
    status: 'active',
  },
  {
    id: '2',
    productTitle: 'OpenAI API $10 Kredi',
    brand: 'OpenAI',
    key: 'sk-proj-3kF2jH4lM5nP6qR7sT8uV9wX0yZ',
    deliveredAt: '27 Haz 2026',
    status: 'active',
  },
  {
    id: '3',
    productTitle: 'Windows 11 Pro Key',
    brand: 'Microsoft',
    key: 'VK7JG-NPHTM-C97JM-9MPGT-3V66T',
    deliveredAt: '24 Haz 2026',
    status: 'active',
  },
  {
    id: '4',
    productTitle: 'Netflix Premium 1 Ay',
    brand: 'Netflix',
    key: 'NFX-22A1B-33C4D-55E6F-77G8H',
    deliveredAt: '19 Haz 2026',
    status: 'expired',
  },
];

const STATUS_MAP: Record<ProductKey['status'], { label: string; variant: 'success' | 'warning' | 'danger' }> = {
  active: { label: 'Aktif', variant: 'success' },
  expired: { label: 'Süresi Doldu', variant: 'warning' },
  revoked: { label: 'İptal', variant: 'danger' },
};

export default function DashboardProductsPage() {
  const [keys, setKeys] = React.useState<ProductKey[]>(MOCK_KEYS);
  const [revealed, setRevealed] = React.useState<Record<string, boolean>>({});
  const [copied, setCopied] = React.useState<string | null>(null);

  React.useEffect(() => {
    apiFetch<ProductKey[]>('/profile/me/products')
      .then(setKeys)
      .catch(() => {});
  }, []);

  const copy = async (k: string, id: string) => {
    try {
      await navigator.clipboard.writeText(k);
      setCopied(id);
      setTimeout(() => setCopied(null), 2000);
    } catch {}
  };

  const toggle = (id: string) => setRevealed((p) => ({ ...p, [id]: !p[id] }));

  const mask = (k: string) => k.slice(0, 4) + '••••••••' + k.slice(-4);

  if (keys.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="font-orbitron text-2xl font-black text-white">Ürünlerim</h1>
        <EmptyState
          icon={Package}
          title="Henüz ürünün yok"
          description="Satın aldığın dijital lisanslar ve keyler burada görünecek."
          ctaLabel="Ürünlere Göz At"
          ctaHref="/products"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-orbitron text-2xl font-black text-white">Ürünlerim</h1>
        <p className="text-sm text-white/60">Satın aldığın lisansları görüntüle ve keylerini kopyala</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {keys.map((k) => {
          const s = STATUS_MAP[k.status];
          const isRevealed = revealed[k.id];
          return (
            <Card key={k.id}>
              <CardContent className="p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-cyber-cyan/30 bg-cyber-cyan/10 text-cyber-cyan">
                      <Key className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-white">{k.productTitle}</h3>
                        <Badge variant={s.variant} size="sm">{s.label}</Badge>
                      </div>
                      <p className="mt-0.5 text-xs text-white/60">
                        {k.brand} · {k.deliveredAt} tarihinde teslim edildi
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-1 items-center gap-2 lg:max-w-md">
                    <code className="flex-1 truncate rounded border border-cyber-cyan/30 bg-cyber-darker px-3 py-2 font-mono text-sm text-cyber-cyan">
                      {isRevealed ? k.key : mask(k.key)}
                    </code>
                    <Button variant="ghost" size="icon" onClick={() => toggle(k.id)}>
                      {isRevealed ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button variant="outline" size="md" onClick={() => copy(k.key, k.id)}>
                      {copied === k.id ? (
                        <>
                          <Check className="h-4 w-4 text-cyber-lime" />
                          Kopyalandı
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          Kopyala
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}