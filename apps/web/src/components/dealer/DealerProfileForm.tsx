'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Save, AlertCircle, Building2, Phone, Globe, MapPin, FileText } from 'lucide-react';
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
import { apiFetch, ApiError } from '@/lib/api-client';
import type { DealerProfile } from '@/lib/dealer-types';
import { dealerStatusLabel, dealerStatusVariant } from '@/lib/dealer-utils';

const fmtTRY = (n: number) =>
  new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 2,
  }).format(n);

export function DealerProfileForm({ initialProfile }: { initialProfile: DealerProfile }) {
  const router = useRouter();
  const [companyName, setCompanyName] = React.useState(initialProfile.companyName);
  const [taxId, setTaxId] = React.useState(initialProfile.taxId);
  const [taxOffice, setTaxOffice] = React.useState(initialProfile.taxOffice ?? '');
  const [address, setAddress] = React.useState(initialProfile.address ?? '');
  const [phone, setPhone] = React.useState(initialProfile.phone ?? '');
  const [websiteUrl, setWebsiteUrl] = React.useState(initialProfile.websiteUrl ?? '');
  const [saving, setSaving] = React.useState(false);
  const [msg, setMsg] = React.useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    setSaving(true);
    try {
      await apiFetch('/dealer/me', {
        method: 'PATCH',
        body: JSON.stringify({
          companyName,
          taxId,
          taxOffice: taxOffice || null,
          address: address || null,
          phone: phone || null,
          websiteUrl: websiteUrl || null,
        }),
      });
      setMsg({ type: 'ok', text: 'Profil güncellendi' });
      router.refresh();
    } catch (err) {
      setMsg({
        type: 'err',
        text: err instanceof ApiError ? err.message : 'Profil güncellenemedi',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h1 className="font-orbitron text-2xl font-black text-white">Bayi Profili</h1>
          <p className="text-sm text-white/60">Şirket bilgilerini düzenle ve durumunu görüntüle.</p>
        </div>
        <Badge variant={dealerStatusVariant(initialProfile.status)} size="lg">
          {dealerStatusLabel(initialProfile.status)}
        </Badge>
      </div>

      {initialProfile.status === 'REJECTED' && (
        <Card className="border-cyber-pink/40 bg-cyber-pink/5">
          <CardContent className="flex items-start gap-3 p-4">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-cyber-pink" />
            <div>
              <p className="text-sm font-semibold text-white">Başvurunuz Reddedildi</p>
              {initialProfile.rejectionReason ? (
                <p className="mt-1 text-xs text-white/70">
                  <span className="text-white/50">Sebep:</span> {initialProfile.rejectionReason}
                </p>
              ) : (
                <p className="mt-1 text-xs text-white/70">
                  Detaylı bilgi için destek ekibimizle iletişime geçin.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-6">
          <h2 className="mb-4 font-orbitron text-lg font-bold text-white">Şirket Bilgileri</h2>
          <form onSubmit={save} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="companyName" className="mb-2 block">
                  <span className="inline-flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5" /> Şirket Adı
                  </span>
                </Label>
                <Input
                  id="companyName"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="taxId" className="mb-2 block">
                  <span className="inline-flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5" /> Vergi Kimlik No
                  </span>
                </Label>
                <Input
                  id="taxId"
                  value={taxId}
                  onChange={(e) => setTaxId(e.target.value.replace(/\D/g, '').slice(0, 11))}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="taxOffice" className="mb-2 block">
                  Vergi Dairesi
                </Label>
                <Input
                  id="taxOffice"
                  value={taxOffice}
                  onChange={(e) => setTaxOffice(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="phone" className="mb-2 block">
                  <span className="inline-flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5" /> Telefon
                  </span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="address" className="mb-2 block">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" /> Adres
                </span>
              </Label>
              <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="websiteUrl" className="mb-2 block">
                <span className="inline-flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5" /> Web Sitesi
                </span>
              </Label>
              <Input
                id="websiteUrl"
                type="url"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>
            {msg && (
              <p
                className={
                  msg.type === 'ok' ? 'text-sm text-cyber-lime' : 'text-sm text-cyber-magenta'
                }
              >
                {msg.text}
              </p>
            )}
            <Button type="submit" disabled={saving}>
              {saving ? <Spinner size="sm" /> : <Save className="h-4 w-4" />}
              {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 p-6">
          <h2 className="font-orbitron text-lg font-bold text-white">Hesap Detayları</h2>
          <Separator />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-wider text-white/50">Komisyon Oranı</p>
              <p className="font-orbitron text-2xl text-cyber-cyan">
                %{initialProfile.commissionRate}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-white/50">Bakiye</p>
              <p className="font-orbitron text-2xl text-white">{fmtTRY(initialProfile.balance)}</p>
              <p className="mt-1 text-xs text-white/50">
                Çekim için{' '}
                <Link className="text-cyber-cyan hover:underline" href="/dealer/payouts">
                  ödeme talebi
                </Link>{' '}
                oluştur.
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-white/50">Durum</p>
              <p className="mt-1">
                <Badge variant={dealerStatusVariant(initialProfile.status)} size="md">
                  {dealerStatusLabel(initialProfile.status)}
                </Badge>
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-white/50">Onay Tarihi</p>
              <p className="text-sm text-white">
                {initialProfile.approvedAt
                  ? new Date(initialProfile.approvedAt).toLocaleString('tr-TR')
                  : 'Henüz onaylanmadı'}
              </p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-xs uppercase tracking-wider text-white/50">Kayıt Tarihi</p>
              <p className="text-sm text-white">
                {new Date(initialProfile.createdAt).toLocaleString('tr-TR')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
