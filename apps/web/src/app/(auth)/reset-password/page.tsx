'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { Button, Input, Label, Spinner } from '@cyberlisans/ui/atoms';
import { apiFetch, ApiError } from '@/lib/api-client';
import { AuthForm } from '@/components/auth/auth-form';
import { resetPasswordSchema } from '@cyberlisans/validators';

export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get('token');
  const [password, setPassword] = React.useState('');
  const [confirmPwd, setConfirmPwd] = React.useState('');
  const [showPwd, setShowPwd] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError('Token eksik');
      return;
    }
    if (password !== confirmPwd) {
      setError('Şifreler eşleşmiyor');
      return;
    }
    const parsed = resetPasswordSchema.safeParse({ token, password });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Geçersiz şifre');
      return;
    }

    setLoading(true);
    try {
      await apiFetch('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify(parsed.data),
      });
      setSuccess(true);
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError('Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <AuthForm title="Şifre Sıfırlandı" subtitle="Yeni şifrenle giriş yapabilirsin">
        <div className="flex flex-col items-center gap-4 py-4">
          <CheckCircle2 className="h-16 w-16 text-cyber-lime" />
          <Button onClick={() => router.push('/login')} className="w-full">
            Giriş Yap
          </Button>
        </div>
      </AuthForm>
    );
  }

  return (
    <AuthForm
      title="Yeni Şifre Belirle"
      subtitle="Hesabın için yeni bir şifre oluştur"
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <Label htmlFor="password" className="mb-2 block">
            Yeni şifre <span className="text-cyber-magenta">*</span>
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
            <Input
              id="password"
              type={showPwd ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="En az 8 karakter"
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

        <div>
          <Label htmlFor="confirmPwd" className="mb-2 block">
            Şifre tekrar <span className="text-cyber-magenta">*</span>
          </Label>
          <Input
            id="confirmPwd"
            type={showPwd ? 'text' : 'password'}
            required
            value={confirmPwd}
            onChange={(e) => setConfirmPwd(e.target.value)}
            placeholder="••••••••"
          />
        </div>

        {error && <p className="text-sm text-cyber-magenta">{error}</p>}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? <Spinner size="sm" /> : null}
          {loading ? 'Sıfırlanıyor...' : 'Şifreyi Sıfırla'}
        </Button>

        <Link href="/login" className="block text-center text-sm text-cyber-cyan hover:text-cyber-magenta">
          Giriş sayfasına dön
        </Link>
      </form>
    </AuthForm>
  );
}
