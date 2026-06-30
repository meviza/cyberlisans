import type { Currency, PaymentProvider } from './types';

export class PaymentError extends Error {
  code: string;
  provider?: PaymentProvider;
  statusCode: number;
  constructor(message: string, code: string, statusCode = 400, provider?: PaymentProvider) {
    super(message);
    this.name = 'PaymentError';
    this.code = code;
    this.statusCode = statusCode;
    this.provider = provider;
  }
}

export class InvalidAmountError extends PaymentError {
  constructor(amount: number) {
    super(`Geçersiz tutar: ${amount}`, 'INVALID_AMOUNT', 400);
  }
}

export class CurrencyNotSupportedError extends PaymentError {
  constructor(currency: Currency, provider: PaymentProvider) {
    super(`${provider} ${currency} desteklemiyor`, 'CURRENCY_NOT_SUPPORTED', 400, provider);
  }
}

export class ProviderConfigError extends PaymentError {
  constructor(provider: PaymentProvider, missing: string) {
    super(`${provider} yapılandırması eksik: ${missing}`, 'PROVIDER_CONFIG_MISSING', 500, provider);
  }
}

export class WebhookSignatureError extends PaymentError {
  constructor(provider: PaymentProvider) {
    super(`${provider} webhook imzası geçersiz`, 'WEBHOOK_SIGNATURE_INVALID', 401, provider);
  }
}

export class WebhookPayloadError extends PaymentError {
  constructor(provider: PaymentProvider, detail: string) {
    super(
      `${provider} webhook payload hatası: ${detail}`,
      'WEBHOOK_PAYLOAD_INVALID',
      400,
      provider,
    );
  }
}

export class IdempotencyConflictError extends PaymentError {
  constructor(key: string) {
    super(`Bu ödeme zaten işlenmiş: ${key}`, 'IDEMPOTENCY_CONFLICT', 409);
  }
}

export class RefundFailedError extends PaymentError {
  constructor(provider: PaymentProvider, detail: string) {
    super(`${provider} iade başarısız: ${detail}`, 'REFUND_FAILED', 500, provider);
  }
}
