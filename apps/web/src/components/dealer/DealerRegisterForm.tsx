'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Save, ArrowLeft, Check, Loader2 } from 'lucide-react';
import { Card, CardContent, Button, Input, Label, Spinner } from '@cyberlisans/ui/atoms';
import { useAuth } from '@/lib/auth-context';
import { apiFetch, ApiError } from '@/lib/api-client';

interface RegisterFormProps {
  prefill?: { companyName?: string | null; email?: string | null };
}

export function DealerRegisterForm({ prefill }: RegisterFormProps) {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [companyName, setCompanyName] = React.useState(prefill?.companyName ?? '');
  const [taxId, setTaxId] = React.useState('');
  const [taxOffice, setTaxOffice] = React.useState('');
  const [address, setAddress] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [websiteUrl, setWebsiteUrl] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const [done, setDone] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login?next=/dealer/register');
    }
  }, [authLoading, router, user]);

  if (authLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await apiFetch('/dealer/register', {
        method: 'POST',
        body: JSON.stringify({
          companyName,
          taxId,
          taxOffice: taxOffice || null,
          address: address || null,
          phone: phone || null,
          websiteUrl: websiteUrl || null,
        }),
      });
      setDone(true);
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError('Başvuru gönderilemedi');
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-4 p-10 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-cyber-lime bg-cyber-lime/10 text-cyber-lime shadow-[0_0_20px_rgba(190,242,100,0.4)]">
            <Check className="h-8 w-8" strokeWidth={3} />
          </div>
          <h2 className="font-orbitron text-2xl font-black text-white">Başvurunuz Alındı</h2>
          <p className="max-w-md text-sm text-white/70">
            Bayi başvurunuz başarıyla iletildi. Ekibimiz başvurunuzu inceleyip en kısa sürede
            tarafınıza dönüş yapacaktır.
          </p>
          <div className="flex gap-2">
            <Link href="/dashboard">
              <Button variant="outline">Müşteri Paneline Dön</Button>
            </Link>
            <Link href="/dealer/profile">
              <Button>Profil Sayfası</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/dashboard"
          className="mb-2 inline-flex items-center gap-1 text-sm text-white/60 hover:text-cyber-cyan"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Müşteri Paneline Dön
        </Link>
        <h1 className="font-orbitron text-2xl font-black text-white">Bayi Başvurusu</h1>
        <p className="text-sm text-white/60">
          Şirket bilgilerinizi girerek bayi programımıza başvurun.
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={submit} className="space-y-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="companyName" className="mb-2 block">
                  Şirket Adı <span className="text-cyber-magenta">*</span>
                </Label>
                <Input
                  id="companyName"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Cyber Yazılım A.Ş."
                  required
                />
              </div>
              <div>
                <Label htmlFor="taxId" className="mb-2 block">
                  Vergi Kimlik No / VKN <span className="text-cyber-magenta">*</span>
                </Label>
                <Input
                  id="taxId"
                  value={taxId}
                  onChange={(e) => setTaxId(e.target.value.replace(/\D/g, '').slice(0, 11))}
                  placeholder="1234567890"
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
                  placeholder="Kadıköy VD"
                />
              </div>
              <div>
                <Label htmlFor="phone" className="mb-2 block">
                  Telefon
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+90 555 000 00 00"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="address" className="mb-2 block">
                Adres
              </Label>
              <Input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="İstanbul, Türkiye"
              />
            </div>
            <div>
              <Label htmlFor="websiteUrl" className="mb-2 block">
                Web Sitesi (opsiyonel)
              </Label>
              <Input
                id="websiteUrl"
                type="url"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="https://example.com"
              />
            </div>

            {error && <p className="text-sm text-cyber-magenta">{error}</p>}

            <div className="flex items-center justify-between border-t border-cyber-cyan/20 pt-4">
              <p className="text-xs text-white/50">
                Bilgileriniz yalnızca bayi başvuru değerlendirmesi için kullanılacaktır.
              </p>
              <Button type="submit" disabled={submitting || !companyName || !taxId}>
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {submitting ? 'Gönderiliyor...' : 'Başvuruyu Gönder'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
