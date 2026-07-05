import { providerSupportsCurrency, type PaymentProvider, type Currency } from './types';

export interface SelectorContext {
  currency: Currency;
  amount: number;
  customerCountry?: string;
  preferredProvider?: PaymentProvider;
  customerKycVerified?: boolean;
}

export interface ProviderOption {
  provider: PaymentProvider;
  priority: number;
  reason: string;
}

const WALLET_PRIORITY = 10;

export function selectAvailableProviders(ctx: SelectorContext): ProviderOption[] {
  const options: ProviderOption[] = [];

  if (ctx.currency === 'TRY') {
    options.push({
      provider: 'PAYTR',
      priority: 90,
      reason: 'Türkiye yerel — kredi kartı, BKM, papara',
    });
    options.push({
      provider: 'SHOPIER',
      priority: 85,
      reason: 'Shopier — kart + yerel cüzdanlar',
    });
    options.push({
      provider: 'PAPARA',
      priority: 80,
      reason: 'Papara cüzdan ile hızlı ödeme',
    });
    options.push({
      provider: 'BANK_TRANSFER',
      priority: 50,
      reason: 'Manuel banka havalesi',
    });
  }

  if (ctx.currency === 'USD' || ctx.currency === 'EUR') {
    options.push({
      provider: 'STRIPE',
      priority: 90,
      reason: 'Stripe — uluslararası kart desteği',
    });
    options.push({
      provider: 'NOWPAYMENTS',
      priority: 60,
      reason: 'NOWPayments — kripto ile anonim ödeme',
    });
  }

  if ((ctx.currency === 'USDT' || ctx.currency === 'USD') && ctx.amount >= 10) {
    options.push({
      provider: 'NOWPAYMENTS',
      priority: 70,
      reason: 'Bitcoin, Ethereum, USDT',
    });
  }

  options.push({
    provider: 'WALLET',
    priority: WALLET_PRIORITY,
    reason: 'Cüzdan bakiyesi ile öde',
  });

  if (ctx.preferredProvider) {
    const preferred = ctx.preferredProvider;
    for (const o of options) {
      if (o.provider === preferred) o.priority += 1000;
    }
  }

  return options
    .filter(
      (o) => o.provider === 'WALLET' || providerSupportsCurrency[o.provider].includes(ctx.currency),
    )
    .sort((a, b) => b.priority - a.priority);
}

export function selectDefaultProvider(ctx: SelectorContext): PaymentProvider {
  const options = selectAvailableProviders(ctx);
  return options[0]?.provider ?? 'BANK_TRANSFER';
}
