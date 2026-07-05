'use client';

import { useEffect, useMemo, useState } from 'react';
import { CreditCard, Wallet, Bitcoin, Building2, ShieldCheck, Loader2 } from 'lucide-react';
import type { Currency, PaymentProvider } from '@cyberlisans/payments/types';

interface ProviderOption {
  provider: PaymentProvider;
  priority: number;
  reason: string;
}

interface ProvidersResponse {
  providers: ProviderOption[];
}

interface Props {
  currency: Currency;
  amount: number;
  customerCountry?: string;
  preferredProvider?: PaymentProvider;
  value: PaymentProvider;
  onChange: (provider: PaymentProvider) => void;
}

const ICON_MAP: Record<PaymentProvider, React.ComponentType<{ className?: string }>> = {
  PAYTR: CreditCard,
  PAPARA: Wallet,
  STRIPE: CreditCard,
  NOWPAYMENTS: Bitcoin,
  BANK_TRANSFER: Building2,
  SHOPIER: ShieldCheck,
  WALLET: Wallet,
};

const LABEL_MAP: Record<PaymentProvider, string> = {
  PAYTR: 'PayTR',
  PAPARA: 'Papara',
  STRIPE: 'Stripe',
  NOWPAYMENTS: 'NOWPayments',
  BANK_TRANSFER: 'Banka Havalesi',
  SHOPIER: 'Shopier',
  WALLET: 'Cüzdan Bakiyesi',
};

export function ProviderPicker({
  currency,
  amount,
  customerCountry,
  preferredProvider,
  value,
  onChange,
}: Props) {
  const [providers, setProviders] = useState<ProviderOption[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const requestBody = useMemo(
    () => ({ currency, amount, customerCountry, preferredProvider }),
    [currency, amount, customerCountry, preferredProvider],
  );

  useEffect(() => {
    let cancelled = false;
    setError(null);
    fetch('/api/payments/available-providers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = (await res.json()) as ProvidersResponse;
        if (!cancelled) setProviders(json.providers);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Yüklenemedi');
      });
    return () => {
      cancelled = true;
    };
  }, [requestBody]);

  if (error) {
    return <p className="text-sm text-cyber-magenta">Ödeme yöntemleri yüklenemedi: {error}</p>;
  }
  if (!providers) {
    return (
      <div className="flex items-center gap-2 text-sm text-white/60">
        <Loader2 className="h-4 w-4 animate-spin" />
        Ödeme yöntemleri yükleniyor...
      </div>
    );
  }
  if (providers.length === 0) {
    return (
      <p className="text-sm text-white/60">Bu para birimi için uygun ödeme yöntemi bulunamadı.</p>
    );
  }

  return (
    <div className="space-y-2" role="radiogroup" aria-label="Ödeme yöntemi seç">
      {providers.map((p) => {
        const Icon = ICON_MAP[p.provider] ?? CreditCard;
        const label = LABEL_MAP[p.provider] ?? p.provider;
        const selected = value === p.provider;
        return (
          <button
            key={p.provider}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(p.provider)}
            className={
              selected
                ? 'flex w-full items-center gap-3 rounded-md border border-cyber-cyan/60 bg-cyber-cyan/10 p-3 text-left'
                : 'flex w-full items-center gap-3 rounded-md border border-white/10 bg-white/5 p-3 text-left hover:border-cyber-cyan/40'
            }
          >
            <Icon className="h-5 w-5 text-cyber-cyan" />
            <div className="min-w-0 flex-1">
              <p className="font-medium text-white">{label}</p>
              <p className="text-xs text-white/60">{p.reason}</p>
            </div>
            <div
              className={
                selected
                  ? 'h-4 w-4 shrink-0 rounded-full border-2 border-cyber-cyan bg-cyber-cyan'
                  : 'h-4 w-4 shrink-0 rounded-full border-2 border-white/30'
              }
            />
          </button>
        );
      })}
    </div>
  );
}
