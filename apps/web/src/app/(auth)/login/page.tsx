'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, Shield } from 'lucide-react';
import { Button, Input, Label, Spinner } from '@cyberlisans/ui/atoms';
import { useAuth, homePathForRole } from '@/lib/auth-context';
import { ApiError } from '@/lib/api-client';
import { AuthForm } from '@/components/auth/auth-form';

function safeNext(raw: string | null): string | null {
  if (!raw) return null;
  if (!raw.startsWith('/') || raw.startsWith('//')) return null;
  return raw;
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPwd, setShowPwd] = React.useState(false);
  const [twoFactor, setTwoFactor] = React.useState('');
  const [show2FA, setShow2FA] = React.useState(false);
  const [remember, setRemember] = React.useState(true);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const wantsAdmin =
    searchParams.get('next')?.startsWith('/admin') || searchParams.get('panel') === 'admin';
  const forbidden = searchParams.get('error') === 'forbidden';

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await login(email, password, twoFactor || undefined);
      if (res.requires2FA) {
        setShow2FA(true);
        setLoading(false);
        return;
      }
      const next = safeNext(searchParams.get('next'));
      const roleHome = homePathForRole(res.user?.role);
      // Admin only pages: if customer landed with next=/admin, send them to their home
      if (
        next?.startsWith('/admin') &&
        res.user &&
        !['ADMIN', 'SUPER_ADMIN'].includes(res.user.role)
      ) {
        setError('Bu hesap admin değil. Super Admin ile giriş yapın.');
        setLoading(false);
        return;
      }
      router.push(next ?? roleHome);
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError('Bir hata oluştu');
      setLoading(false);
    }
  };

  return (
    <AuthForm
      title={wantsAdmin ? 'Admin Girişi' : 'Giriş Yap'}
      subtitle={
        wantsAdmin
          ? 'Super Admin paneli — ürün, sipariş ve ödeme operasyonu'
          : 'Hesabına giriş yaparak lisanslarına ve cüzdanına ulaş'
      }
      footer={
        wantsAdmin ? (
          <>
            Müşteri misin?{' '}
            <Link href="/login" className="font-medium text-brand-accent hover:underline">
              Normal giriş
            </Link>
          </>
        ) : (
          <>
            Hesabın yok mu?{' '}
            <Link
              href="/register"
              className="font-medium text-brand-accent hover:text-brand-text-secondary"
            >
              Kayıt ol
            </Link>
            {' · '}
            <Link
              href="/admin/login"
              className="font-medium text-amber-300/90 hover:text-amber-200"
            >
              Admin paneli
            </Link>
          </>
        )
      }
    >
      {wantsAdmin && (
        <div className="mb-4 rounded-lg border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-xs leading-relaxed text-amber-100">
          Bu giriş <strong>super admin / admin</strong> içindir. Operasyon hesabı buraya
          yönlendirilir; müşteri paneliyle karışmaz.
        </div>
      )}
      {forbidden && (
        <p className="mb-4 rounded-lg border border-brand-danger/30 bg-brand-danger/10 px-3 py-2 text-sm text-brand-danger">
          Bu sayfa için admin yetkisi gerekir.
        </p>
      )}
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <Label htmlFor="email" className="mb-2 block">
            E-posta <span className="text-brand-text-secondary">*</span>
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
            <Input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={wantsAdmin ? 'admin@cyberlisans.com' : 'ornek@cyberlisans.com'}
              className="pl-10"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="password" className="mb-2 block">
            Şifre <span className="text-brand-text-secondary">*</span>
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
            <Input
              id="password"
              type={showPwd ? 'text' : 'password'}
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="pl-10 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPwd((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
            >
              {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {show2FA && (
          <div>
            <Label htmlFor="2fa" className="mb-2 block">
              2FA Kodu
            </Label>
            <div className="relative">
              <Shield className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
              <Input
                id="2fa"
                type="text"
                inputMode="numeric"
                pattern="\d{6}"
                maxLength={6}
                value={twoFactor}
                onChange={(e) => setTwoFactor(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                className="pl-10 tracking-widest"
              />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-white/70">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="h-4 w-4 rounded border-brand-accent/40 bg-brand-bg text-brand-accent focus:ring-brand-accent/50"
            />
            Beni hatırla
          </label>
          <Link
            href="/forgot-password"
            className="text-sm text-brand-accent hover:text-brand-text-secondary"
          >
            Şifremi unuttum
          </Link>
        </div>

        {error && (
          <p className="rounded-lg border border-brand-danger/30 bg-brand-danger/10 px-3 py-2 text-sm text-brand-danger">
            {error}
            {error.includes('doğrulama') && (
              <span className="mt-1 block text-xs text-white/60">
                E-posta gelmediyse destek ile iletişime geç veya yeniden kayıt olmayı dene.
              </span>
            )}
          </p>
        )}

        <Button
          type="submit"
          variant="primary"
          className={
            wantsAdmin
              ? 'w-full border-amber-400/40 bg-amber-500 text-black hover:bg-amber-400'
              : 'w-full'
          }
          disabled={loading}
        >
          {loading ? <Spinner size="sm" /> : null}
          {loading ? 'Giriş yapılıyor...' : wantsAdmin ? 'Admin paneline gir' : 'Giriş Yap'}
        </Button>
      </form>
    </AuthForm>
  );
}
