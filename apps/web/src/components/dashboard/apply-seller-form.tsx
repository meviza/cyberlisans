'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Star, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';
import { Button, Input, Label, Spinner } from '@cyberlisans/ui/atoms';
import { AuthForm } from '@/components/auth/auth-form';
import { apiFetch, ApiError } from '@/lib/api-client';
import type { ApplySellerPayload, ApplySellerResult } from '@/lib/api-client';

const SLUG_RE = /^[a-z0-9-]{3,40}$/;

function generateSlug(companyName: string): string {
  return companyName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40);
}

export function ApplySellerForm() {
  const router = useRouter();
  const [companyName, setCompanyName] = React.useState('');
  const [taxId, setTaxId] = React.useState('');
  const [taxOffice, setTaxOffice] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [websiteUrl, setWebsiteUrl] = React.useState('');
  const [address, setAddress] = React.useState('');
  const [bio, setBio] = React.useState('');
  const [slug, setSlug] = React.useState('');
  const [slugSuggestion, setSlugSuggestion] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  React.useEffect(() => {
    const base = generateSlug(companyName);
    setSlugSuggestion(base);
    setSlug(base);
  }, [companyName]);

  const onSlugConflict = React.useCallback(() => {
    setSlugSuggestion((prev) => {
      const match = prev.match(/^(.*?)(\d*)$/);
      const stem = match && match[1] ? match[1].replace(/-$/, '') : prev;
      const num = match && match[2] ? parseInt(match[2], 10) : 1;
      const next = `${stem}-${num + 1}`;
      setSlug(next);
      return next;
    });
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!companyName.trim()) return setError('Şirket adı zorunlu');
    if (!taxId.trim()) return setError('Vergi/TC kimlik numarası zorunlu');
    if (!slug.trim()) return setError('Slug üretilemedi');
    if (!SLUG_RE.test(slug))
      return setError('Slug 3-40 karakter, sadece a-z, 0-9 ve tire içermeli');
    if (bio.length > 500) return setError('Bio en fazla 500 karakter olabilir');
    if (websiteUrl && !/^https?:\/\/.+/.test(websiteUrl))
      return setError('Web sitesi geçerli bir URL olmalı (http(s):// ile başlamalı)');

    const payload: ApplySellerPayload = {
      companyName: companyName.trim(),
      taxId: taxId.trim(),
      slug,
    };
    if (taxOffice.trim()) payload.taxOffice = taxOffice.trim();
    if (phone.trim()) payload.phone = phone.trim();
    if (websiteUrl.trim()) payload.websiteUrl = websiteUrl.trim();
    if (address.trim()) payload.address = address.trim();
    if (bio.trim()) payload.bio = bio.trim();

    setSubmitting(true);
    try {
      const res = await apiFetch<ApplySellerResult>('/sellers/apply', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      setSuccess(res.message || 'Başvurunuz alındı!');
      setTimeout(() => router.push('/dashboard/seller'), 1200);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.code === 'SLUG_TAKEN' || /slug/i.test(err.message)) onSlugConflict();
        setError(err.message);
      } else {
        setError('Başvuru gönderilemedi. Lütfen tekrar deneyin.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthForm title="Satıcı Başvurusu" subtitle="Mağazanızı oluşturmak için bilgilerinizi girin">
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="companyName">Şirket Adı *</Label>
          <Input
            id="companyName"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="Cyber Teknoloji A.Ş."
            disabled={submitting}
            required
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="taxId">Vergi No / TC *</Label>
            <Input
              id="taxId"
              value={taxId}
              onChange={(e) => setTaxId(e.target.value)}
              placeholder="1234567890"
              disabled={submitting}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="taxOffice">Vergi Dairesi</Label>
            <Input
              id="taxOffice"
              value={taxOffice}
              onChange={(e) => setTaxOffice(e.target.value)}
              placeholder="Beşiktaş"
              disabled={submitting}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="phone">Telefon</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+90 555 555 5555"
              disabled={submitting}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="websiteUrl">Web Sitesi</Label>
            <Input
              id="websiteUrl"
              type="url"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              placeholder="https://ornek.com"
              disabled={submitting}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="address">Adres</Label>
          <Input
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="İstanbul, Türkiye"
            disabled={submitting}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="bio">
            Hakkımda <span className="text-xs text-white/50">({bio.length}/500)</span>
          </Label>
          <textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value.slice(0, 500))}
            placeholder="Mağazanız hakkında kısa bilgi"
            disabled={submitting}
            rows={3}
            className="flex w-full rounded-md border border-cyber-cyan/30 bg-cyber-bg/50 px-3 py-2 text-sm text-cyber-text placeholder:text-cyber-text-dim transition-all focus-visible:border-cyber-cyan focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyber-cyan/50 disabled:opacity-50"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="slug">Mağaza URL</Label>
          <div className="flex items-center gap-2 rounded-md border border-cyber-cyan/30 bg-cyber-bg/50 px-3 py-2 text-sm">
            <span className="text-white/50">/s/</span>
            <input
              id="slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
              disabled={submitting}
              className="flex-1 bg-transparent text-cyber-text outline-none"
              maxLength={40}
            />
          </div>
          {slugSuggestion && slugSuggestion !== slug && (
            <button
              type="button"
              onClick={() => setSlug(slugSuggestion)}
              className="text-xs text-cyber-cyan hover:underline"
            >
              Öneri: {slugSuggestion}
            </button>
          )}
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-md border border-cyber-magenta/40 bg-cyber-magenta/10 px-3 py-2 text-sm text-cyber-magenta">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-start gap-2 rounded-md border border-cyber-lime/40 bg-cyber-lime/10 px-3 py-2 text-sm text-cyber-lime">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <Button type="submit" disabled={submitting} className="w-full">
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Gönderiliyor...
            </>
          ) : (
            <>
              <Star className="h-4 w-4" /> Başvuruyu Gönder
            </>
          )}
        </Button>

        <p className="text-center text-xs text-white/50">
          Başvurunuz incelendikten sonra mağazanız aktif olacaktır.
        </p>
      </form>
    </AuthForm>
  );
}
