'use client';

import * as React from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle2, XCircle } from 'lucide-react';
import { Button, Spinner } from '@cyberlisans/ui/atoms';
import { apiFetch } from '@/lib/api-client';
import { AuthForm } from '@/components/auth/auth-form';

export default function VerifyEmailPage() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get('token');
  const [state, setState] = React.useState<'loading' | 'success' | 'error'>('loading');

  React.useEffect(() => {
    if (!token) {
      setState('error');
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        await apiFetch(`/auth/verify-email?token=${encodeURIComponent(token)}`, {
          method: 'POST',
        });
        if (!cancelled) setState('success');
      } catch {
        if (!cancelled) setState('error');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  if (state === 'loading') {
    return (
      <AuthForm title="E-posta Doğrulanıyor" subtitle="Lütfen bekleyin">
        <div className="flex justify-center py-8">
          <Spinner size="lg" />
        </div>
      </AuthForm>
    );
  }

  if (state === 'success') {
    return (
      <AuthForm title="E-posta Doğrulandı" subtitle="Hesabın artık aktif">
        <div className="flex flex-col items-center gap-4 py-4">
          <CheckCircle2 className="h-16 w-16 text-cyber-lime" />
          <p className="text-center text-sm text-white/70">
            E-postan başarıyla doğrulandı. Artık giriş yapabilirsin.
          </p>
          <Button onClick={() => router.push('/login')} className="w-full">
            Giriş Yap
          </Button>
        </div>
      </AuthForm>
    );
  }

  return (
    <AuthForm title="Doğrulama Başarısız" subtitle="Token geçersiz olabilir">
      <div className="flex flex-col items-center gap-4 py-4">
        <XCircle className="h-16 w-16 text-cyber-magenta" />
        <p className="text-center text-sm text-white/70">
          Token geçersiz veya süresi dolmuş. Yeni bir doğrulama bağlantısı talep edebilirsin.
        </p>
        <Button onClick={() => router.push('/login')} variant="outline" className="w-full">
          Giriş Sayfasına Dön
        </Button>
      </div>
    </AuthForm>
  );
}
