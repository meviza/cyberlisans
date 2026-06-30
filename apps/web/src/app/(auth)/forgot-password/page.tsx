'use client';

import * as React from 'react';
import Link from 'next/link';
import { Mail, CheckCircle2 } from 'lucide-react';
import { Button, Input, Label, Spinner } from '@cyberlisans/ui/atoms';
import { apiFetch, ApiError } from '@/lib/api-client';
import { AuthForm } from '@/components/auth/auth-form';
import { forgotPasswordSchema } from '@cyberlisans/validators';

export default function ForgotPasswordPage() {
  const [email, setEmail] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [sent, setSent] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const parsed = forgotPasswordSchema.safeParse({ email });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Geçersiz e-posta');
      return;
    }
    setLoading(true);
    try {
      await apiFetch('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify(parsed.data),
      });
      setSent(true);
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError('Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <AuthForm title="E-postanı Kontrol Et" subtitle="Sıfırlama bağlantısı gönderildi">
        <div className="flex flex-col items-center gap-4 py-4">
          <CheckCircle2 className="h-16 w-16 text-cyber-cyan" />
          <p className="text-center text-sm text-white/70">
            <strong className="text-white">{email}</strong> adresine bir sıfırlama bağlantısı gönderdik.
            Spam klasörünü de kontrol etmeyi unutma.
          </p>
          <Link href="/login" className="w-full">
            <Button variant="outline" className="w-full">
              Giriş Sayfasına Dön
            </Button>
          </Link>
        </div>
      </AuthForm>
    );
  }

  return (
    <AuthForm
      title="Şifremi Unuttum"
      subtitle="E-postanı gir, sıfırlama bağlantısı gönderelim"
      footer={
        <Link href="/login" className="text-cyber-cyan hover:text-cyber-magenta">
          ← Giriş sayfasına dön
        </Link>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <Label htmlFor="email" className="mb-2 block">
            E-posta <span className="text-cyber-magenta">*</span>
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ornek@cyberlisans.com"
              className="pl-10"
            />
          </div>
        </div>

        {error && <p className="text-sm text-cyber-magenta">{error}</p>}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? <Spinner size="sm" /> : null}
          {loading ? 'Gönderiliyor...' : 'Sıfırlama Bağlantısı Gönder'}
        </Button>
      </form>
    </AuthForm>
  );
}
