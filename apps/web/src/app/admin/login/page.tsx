'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, Mail, Lock, Eye, EyeOff, Loader2, UserCheck } from 'lucide-react';
import { Button, Input, Label } from '@cyberlisans/ui/atoms';
import { useAuth } from '@/lib/auth-context';
import { ApiError } from '@/lib/api-client';

/**
 * Distinct admin/operator login — amber “command center” theme so it is
 * visually different from the customer storefront login.
 */
export default function AdminLoginPage() {
  const router = useRouter();
  const { login, user, isLoading } = useAuth();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPwd, setShowPwd] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!isLoading && user && (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN')) {
      router.replace('/admin');
    }
  }, [user, isLoading, router]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await login(email, password);
      if (res.requires2FA) {
        setError('Bu hesapta 2FA açık. /login üzerinden 2FA ile giriş yapın.');
        setLoading(false);
        return;
      }
      const role = res.user?.role;
      if (role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
        setError(
          'Bu e-posta admin değil (müşteri/satıcı hesabı). Super Admin hesabı ile giriş yapın.',
        );
        setLoading(false);
        return;
      }
      router.push('/admin/sellers');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Giriş başarısız');
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#07060a] text-white">
      {/* Amber command-center atmosphere */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 20% -10%, rgba(245,158,11,0.22), transparent 55%), radial-gradient(ellipse 60% 40% at 90% 100%, rgba(120,53,15,0.35), transparent 50%), linear-gradient(180deg, #0c0a09 0%, #07060a 100%)',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(251,191,36,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(251,191,36,0.4) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      <div className="relative mx-auto flex min-h-screen max-w-lg flex-col justify-center px-4 py-12">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-400/40 bg-amber-500/15 text-amber-300 shadow-[0_0_40px_rgba(245,158,11,0.25)]">
            <Shield className="h-7 w-7" />
          </div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-amber-400/90">
            Super Admin · Command Center
          </p>
          <h1 className="mt-2 font-orbitron text-2xl font-black tracking-tight text-white sm:text-3xl">
            Operatör girişi
          </h1>
          <p className="mt-2 text-sm text-amber-100/60">
            Satıcı başvurularını onaylayan, KYC ve marketplace yöneten hesap. Müşteri mağazasından
            ayrı panodur.
          </p>
        </div>

        <div className="rounded-2xl border border-amber-400/25 bg-black/50 p-6 shadow-[0_0_0_1px_rgba(245,158,11,0.08),0_24px_80px_rgba(0,0,0,0.55)] backdrop-blur-xl sm:p-8">
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-amber-400/20 bg-amber-500/10 px-3 py-3 text-xs leading-relaxed text-amber-50/90">
            <UserCheck className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
            <div>
              <p className="font-semibold text-amber-200">Bu panel ne işe yarar?</p>
              <p className="mt-1 text-amber-100/70">
                Bekleyen satıcı başvurularını inceler, onaylar veya reddeder; ürün onayları, sipariş
                ve ödeme operasyonuna erişir.
              </p>
            </div>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <Label htmlFor="admin-email" className="mb-2 block text-amber-100/80">
                Admin e-posta
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-amber-400/50" />
                <Input
                  id="admin-email"
                  type="email"
                  required
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@cyberlisans.com"
                  className="border-amber-400/20 bg-black/40 pl-10 focus:border-amber-400/50 focus:ring-amber-400/30"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="admin-password" className="mb-2 block text-amber-100/80">
                Şifre
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-amber-400/50" />
                <Input
                  id="admin-password"
                  type={showPwd ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="border-amber-400/20 bg-black/40 pl-10 pr-10 focus:border-amber-400/50 focus:ring-amber-400/30"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-400/50 hover:text-amber-200"
                >
                  {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                {error}
              </p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full border border-amber-300/40 bg-amber-500 font-semibold text-black hover:bg-amber-400"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Shield className="h-4 w-4" />
              )}
              {loading ? 'Doğrulanıyor…' : 'Super Admin paneline gir'}
            </Button>
          </form>

          <p className="mt-5 text-center text-[11px] leading-relaxed text-amber-100/40">
            Test seed hesabı:{' '}
            <span className="font-mono text-amber-200/70">admin@cyberlisans.com</span>
            <br />
            Müşteri kaydı bu panele erişemez.
          </p>
        </div>

        <p className="mt-6 text-center text-sm text-white/40">
          <Link href="/login" className="text-white/60 hover:text-white">
            ← Müşteri girişi
          </Link>
          {' · '}
          <Link href="/" className="text-white/60 hover:text-white">
            Ana sayfa
          </Link>
        </p>
      </div>
    </div>
  );
}
