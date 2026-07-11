'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, Shield } from 'lucide-react';
import { Button, Input, Label, Spinner } from '@cyberlisans/ui/atoms';
import { useAuth } from '@/lib/auth-context';
import { ApiError } from '@/lib/api-client';
import { AuthForm } from '@/components/auth/auth-form';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPwd, setShowPwd] = React.useState(false);
  const [twoFactor, setTwoFactor] = React.useState('');
  const [show2FA, setShow2FA] = React.useState(false);
  const [remember, setRemember] = React.useState(true);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

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
      router.push('/dashboard');
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError('Bir hata oluştu');
      setLoading(false);
    }
  };

  return (
    <AuthForm
      title="Giriş Yap"
      subtitle="Hesabına giriş yaparak lisanslarına ve cüzdanına ulaş"
      footer={
        <>
          Hesabın yok mu?{' '}
          <Link
            href="/register"
            className="font-medium text-brand-accent hover:text-brand-text-secondary"
          >
            Kayıt ol
          </Link>
        </>
      }
    >
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
              placeholder="ornek@cyberlisans.com"
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

        {error && <p className="text-sm text-brand-text-secondary">{error}</p>}

        <Button type="submit" variant="primary" className="w-full" disabled={loading}>
          {loading ? <Spinner size="sm" /> : null}
          {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
        </Button>
      </form>
    </AuthForm>
  );
}
