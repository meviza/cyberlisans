'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User as UserIcon, Eye, EyeOff } from 'lucide-react';
import { Button, Input, Label, Spinner } from '@cyberlisans/ui/atoms';
import { Checkbox } from '@/components/ui/checkbox';
import { Select } from '@/components/ui/select';
import { useAuth } from '@/lib/auth-context';
import { ApiError } from '@/lib/api-client';
import { AuthForm } from '@/components/auth/auth-form';
import { registerSchema, type RegisterInput } from '@cyberlisans/validators';

const LOCALE_OPTS = [
  { value: 'TR', label: 'Türkçe' },
  { value: 'EN', label: 'English' },
  { value: 'DE', label: 'Deutsch' },
  { value: 'AR', label: 'العربية' },
  { value: 'RU', label: 'Русский' },
];

const CURRENCY_OPTS = [
  { value: 'TRY', label: '₺ TRY' },
  { value: 'USD', label: '$ USD' },
  { value: 'EUR', label: '€ EUR' },
  { value: 'USDT', label: '₮ USDT' },
];

/** Form allows false while editing; schema enforces true on submit. */
type RegisterFormState = Omit<RegisterInput, 'isAdult' | 'consentKvkk' | 'consentTerms'> & {
  isAdult: boolean;
  consentKvkk: boolean;
  consentTerms: boolean;
};

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [form, setForm] = React.useState<RegisterFormState>({
    email: '',
    password: '',
    username: '',
    displayName: undefined,
    locale: 'TR',
    currency: 'TRY',
    referralCode: undefined,
    isAdult: true,
    consentKvkk: true,
    consentTerms: true,
  });
  const [confirmPwd, setConfirmPwd] = React.useState('');
  const [showPwd, setShowPwd] = React.useState(false);
  const [marketing, setMarketing] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [serverError, setServerError] = React.useState<string | null>(null);

  const update = <K extends keyof RegisterFormState>(key: K, value: RegisterFormState[K]) => {
    setForm((p) => ({ ...p, [key]: value }));
    setErrors((prev) => {
      if (!prev[key as string]) return prev;
      const next = { ...prev };
      delete next[key as string];
      return next;
    });
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setServerError(null);

    if (form.password !== confirmPwd) {
      setErrors({ confirmPwd: 'Şifreler eşleşmiyor' });
      return;
    }

    const parsed = registerSchema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const k = issue.path[0]?.toString();
        if (k && !fieldErrors[k]) fieldErrors[k] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    try {
      await register({ ...parsed.data, marketingOptIn: marketing });
      // auth-context auto-logs-in when emailVerified; otherwise go to verify
      router.push('/dashboard');
    } catch (err) {
      if (err instanceof ApiError) setServerError(err.message);
      else setServerError('Bir hata oluştu');
      setLoading(false);
    }
  };

  const errMsg = (k: string) => errors[k];

  return (
    <AuthForm
      title="Kayıt Ol"
      subtitle="Hesabını oluştur, lisans dünyasına katıl"
      footer={
        <>
          Zaten hesabın var mı?{' '}
          <Link
            href="/login"
            className="font-medium text-brand-accent hover:text-brand-text-secondary"
          >
            Giriş yap
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
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              placeholder="ornek@cyberlisans.com"
              className="pl-10"
            />
          </div>
          {errMsg('email') && (
            <p className="mt-1 text-sm text-brand-text-secondary">{errMsg('email')}</p>
          )}
        </div>

        <div>
          <Label htmlFor="username" className="mb-2 block">
            Kullanıcı adı <span className="text-brand-text-secondary">*</span>
          </Label>
          <div className="relative">
            <UserIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
            <Input
              id="username"
              type="text"
              required
              value={form.username}
              onChange={(e) => update('username', e.target.value)}
              placeholder="cyber_user"
              className="pl-10"
            />
          </div>
          {errMsg('username') && (
            <p className="mt-1 text-sm text-brand-text-secondary">{errMsg('username')}</p>
          )}
        </div>

        <div>
          <Label htmlFor="displayName" className="mb-2 block">
            Görünür ad <span className="text-white/40 text-xs">(opsiyonel)</span>
          </Label>
          <Input
            id="displayName"
            type="text"
            value={form.displayName ?? ''}
            onChange={(e) => update('displayName', e.target.value || undefined)}
            placeholder="Cyber User"
          />
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
              value={form.password}
              onChange={(e) => update('password', e.target.value)}
              placeholder="En az 12 karakter, Aa1!"
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
          <p className="mt-1 text-xs text-white/40">
            Min. 12 karakter · büyük/küçük harf · rakam · özel karakter
          </p>
          {errMsg('password') && (
            <p className="mt-1 text-sm text-brand-danger">{errMsg('password')}</p>
          )}
        </div>

        <div>
          <Label htmlFor="confirmPwd" className="mb-2 block">
            Şifre tekrar <span className="text-brand-text-secondary">*</span>
          </Label>
          <Input
            id="confirmPwd"
            type={showPwd ? 'text' : 'password'}
            required
            value={confirmPwd}
            onChange={(e) => setConfirmPwd(e.target.value)}
            placeholder="••••••••"
          />
          {errMsg('confirmPwd') && (
            <p className="mt-1 text-sm text-brand-text-secondary">{errMsg('confirmPwd')}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="locale" className="mb-2 block">
              Dil
            </Label>
            <Select
              id="locale"
              value={form.locale}
              onChange={(e) => update('locale', e.target.value as RegisterInput['locale'])}
              options={LOCALE_OPTS}
            />
          </div>
          <div>
            <Label htmlFor="currency" className="mb-2 block">
              Para birimi
            </Label>
            <Select
              id="currency"
              value={form.currency}
              onChange={(e) => update('currency', e.target.value as RegisterInput['currency'])}
              options={CURRENCY_OPTS}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="referralCode" className="mb-2 block">
            Referans kodu <span className="text-white/40 text-xs">(opsiyonel)</span>
          </Label>
          <Input
            id="referralCode"
            type="text"
            value={form.referralCode ?? ''}
            onChange={(e) => update('referralCode', e.target.value || undefined)}
            placeholder="CL-XXXXXX"
          />
        </div>

        <div className="space-y-3 rounded-lg border border-white/10 bg-white/[0.03] p-3 pt-3">
          <p className="text-xs font-medium uppercase tracking-wide text-white/45">
            Zorunlu onaylar
          </p>
          <Checkbox
            checked={form.isAdult}
            onChange={(e) => update('isAdult', e.target.checked)}
            label={
              <>
                18 yaş üstüyüm <span className="text-brand-text-secondary">*</span>
              </>
            }
          />
          {errMsg('isAdult') && <p className="text-sm text-brand-danger">{errMsg('isAdult')}</p>}
          <Checkbox
            checked={form.consentKvkk}
            onChange={(e) => update('consentKvkk', e.target.checked)}
            label={
              <>
                <Link
                  href="/legal/kvkk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-accent hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  KVKK aydınlatma metnini
                </Link>{' '}
                okudum <span className="text-brand-text-secondary">*</span>
              </>
            }
          />
          {errMsg('consentKvkk') && (
            <p className="text-sm text-brand-danger">{errMsg('consentKvkk')}</p>
          )}
          <Checkbox
            checked={form.consentTerms}
            onChange={(e) => update('consentTerms', e.target.checked)}
            label={
              <>
                <Link
                  href="/legal/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-accent hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  Kullanım koşullarını
                </Link>{' '}
                kabul ediyorum <span className="text-brand-text-secondary">*</span>
              </>
            }
          />
          {errMsg('consentTerms') && (
            <p className="text-sm text-brand-danger">{errMsg('consentTerms')}</p>
          )}
          <Checkbox
            checked={marketing}
            onChange={(e) => setMarketing(e.target.checked)}
            label="Pazarlama e-postaları almak istiyorum"
          />
        </div>

        {Object.keys(errors).length > 0 && !serverError && (
          <p className="text-sm text-brand-danger">
            Lütfen formdaki hataları düzeltin (zorunlu onaylar ve alanlar).
          </p>
        )}
        {serverError && <p className="text-sm text-brand-danger">{serverError}</p>}

        <Button type="submit" variant="primary" className="w-full" disabled={loading}>
          {loading ? <Spinner size="sm" /> : null}
          {loading ? 'Hesap oluşturuluyor...' : 'Kayıt Ol'}
        </Button>
      </form>
    </AuthForm>
  );
}
