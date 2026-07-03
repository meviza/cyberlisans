'use client';

import * as React from 'react';
import Link from 'next/link';
import { Copy, Edit3, Trash2, QrCode, Plus, Power, PowerOff } from 'lucide-react';
import { Card, CardContent, Button, Badge, Spinner, Input } from '@cyberlisans/ui/atoms';
import { Select } from '@/components/ui/select';
import { apiFetch, ApiError } from '@/lib/api-client';
import { DealerAccessGuard } from '@/components/dealer/DealerStatusBanner';
import type { DealerLink, DealerProfile } from '@/lib/dealer-types';

interface DealerLinksTableProps {
  initialLinks: DealerLink[];
  profile: DealerProfile;
}

export function DealerLinksTable({ initialLinks, profile }: DealerLinksTableProps) {
  const [links, setLinks] = React.useState<DealerLink[]>(initialLinks);
  const [search, setSearch] = React.useState('');
  const [activeFilter, setActiveFilter] = React.useState<string>('all');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [deleting, setDeleting] = React.useState<string | null>(null);

  const refresh = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ limit: '100' });
      if (activeFilter !== 'all') params.set('isActive', activeFilter);
      const res = await apiFetch<{ items?: DealerLink[]; data?: DealerLink[] } | DealerLink[]>(
        `/dealer/links?${params.toString()}`,
      );
      const arr = Array.isArray(res) ? res : (res.items ?? res.data ?? []);
      setLinks(arr);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Linkler yüklenemedi');
    } finally {
      setLoading(false);
    }
  }, [activeFilter]);

  React.useEffect(() => {
    refresh();
  }, [refresh]);

  const copyLink = (code: string) => {
    const url = `${window.location.origin}/?ref=${encodeURIComponent(code)}`;
    navigator.clipboard.writeText(url).catch(() => undefined);
  };

  const toggleActive = async (l: DealerLink) => {
    try {
      await apiFetch(`/dealer/links/${l.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive: !l.isActive }),
      });
      setLinks((prev) =>
        prev.map((it) => (it.id === l.id ? { ...it, isActive: !l.isActive } : it)),
      );
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Güncellenemedi');
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Bu linki silmek istediğine emin misin?')) return;
    setDeleting(id);
    try {
      await apiFetch(`/dealer/links/${id}`, { method: 'DELETE' });
      setLinks((prev) => prev.filter((it) => it.id !== id));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Silinemedi');
    } finally {
      setDeleting(null);
    }
  };

  const filtered = links.filter((l) => {
    if (search && !l.code.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <DealerAccessGuard status={profile.status}>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h1 className="font-orbitron text-2xl font-black text-white">Bayi Linkleri</h1>
            <p className="text-sm text-white/60">
              Paylaşılabilir linkler oluştur ve komisyon kazan.
            </p>
          </div>
          <Link href="/dealer/links/new">
            <Button>
              <Plus className="h-4 w-4" />
              Yeni Link
            </Button>
          </Link>
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex-1">
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Link kodu ara..."
                />
              </div>
              <div className="w-full sm:w-48">
                <Select
                  value={activeFilter}
                  onChange={(e) => setActiveFilter(e.target.value)}
                  options={[
                    { value: 'all', label: 'Tümü' },
                    { value: 'true', label: 'Aktif' },
                    { value: 'false', label: 'Pasif' },
                  ]}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {error && <p className="text-sm text-cyber-magenta">{error}</p>}

        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center p-10">
                <Spinner size="lg" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center gap-3 p-10 text-center">
                <p className="text-sm text-white/60">Henüz link yok.</p>
                <Link href="/dealer/links/new">
                  <Button>
                    <Plus className="h-4 w-4" />
                    İlk Linkini Oluştur
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-cyber-cyan/20 text-left text-xs uppercase tracking-wider text-white/60">
                      <th className="px-4 py-3">Kod</th>
                      <th className="px-4 py-3">Ürün</th>
                      <th className="px-4 py-3">İndirim</th>
                      <th className="px-4 py-3">Kullanım</th>
                      <th className="px-4 py-3">Tıklama</th>
                      <th className="px-4 py-3">Son Geçerlilik</th>
                      <th className="px-4 py-3">Durum</th>
                      <th className="px-4 py-3 text-right">İşlem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((l) => (
                      <tr
                        key={l.id}
                        className="border-b border-cyber-cyan/10 transition-colors hover:bg-cyber-cyan/5"
                      >
                        <td className="px-4 py-3 font-mono text-cyber-cyan">
                          <Link href={`/dealer/links/${l.id}`} className="hover:underline">
                            {l.code}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-white">
                          {l.productName ?? <span className="text-white/50">Tüm ürünler</span>}
                        </td>
                        <td className="px-4 py-3 text-cyber-magenta">%{l.discountPercent}</td>
                        <td className="px-4 py-3 text-white">
                          {l.currentUses}
                          {l.maxUses != null && (
                            <span className="text-white/50"> / {l.maxUses}</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-white">{l.clicks}</td>
                        <td className="px-4 py-3 text-white/70">
                          {l.expiresAt ? new Date(l.expiresAt).toLocaleDateString('tr-TR') : '—'}
                        </td>
                        <td className="px-4 py-3">
                          {l.isActive ? (
                            <Badge variant="success" size="sm">
                              Aktif
                            </Badge>
                          ) : (
                            <Badge variant="default" size="sm">
                              Pasif
                            </Badge>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => copyLink(l.code)}
                              className="rounded p-1.5 text-white/60 hover:bg-cyber-cyan/10 hover:text-cyber-cyan"
                              title="Linki kopyala"
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </button>
                            <Link
                              href={`/dealer/links/${l.id}/qr`}
                              className="rounded p-1.5 text-white/60 hover:bg-cyber-cyan/10 hover:text-cyber-cyan"
                              title="QR Kod"
                            >
                              <QrCode className="h-3.5 w-3.5" />
                            </Link>
                            <button
                              type="button"
                              onClick={() => toggleActive(l)}
                              className="rounded p-1.5 text-white/60 hover:bg-cyber-cyan/10 hover:text-cyber-cyan"
                              title={l.isActive ? 'Pasif yap' : 'Aktif yap'}
                            >
                              {l.isActive ? (
                                <PowerOff className="h-3.5 w-3.5" />
                              ) : (
                                <Power className="h-3.5 w-3.5" />
                              )}
                            </button>
                            <Link
                              href={`/dealer/links/${l.id}`}
                              className="rounded p-1.5 text-white/60 hover:bg-cyber-cyan/10 hover:text-cyber-cyan"
                              title="Düzenle"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                            </Link>
                            <button
                              type="button"
                              onClick={() => remove(l.id)}
                              disabled={deleting === l.id}
                              className="rounded p-1.5 text-white/60 hover:bg-cyber-magenta/10 hover:text-cyber-magenta disabled:opacity-50"
                              title="Sil"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DealerAccessGuard>
  );
}
