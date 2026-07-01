import type {
  IPaymentProvider,
  PaymentInitInput,
  PaymentInitResult,
  WebhookPayload,
  RefundInput,
  RefundResult,
} from './types';
import {
  InvalidAmountError,
  CurrencyNotSupportedError,
  ProviderConfigError,
  WebhookPayloadError,
  WebhookSignatureError,
  RefundFailedError,
} from './errors';
import { verifyTimestampInWindow } from './webhook-security';

interface PaparaConfig {
  apiKey: string;
  notificationUrl: string;
  redirectUrl: string;
  sandbox?: boolean;
}

const STATUS_MAP: Record<number, WebhookPayload['status']> = {
  0: 'PENDING',
  1: 'SUCCEEDED',
  2: 'FAILED',
  3: 'REFUNDED',
};

export class PaparaProvider implements IPaymentProvider {
  readonly name = 'PAPARA' as const;
  private config: PaparaConfig;
  private baseUrl = 'https://merchant-api.papara.com/v1';

  constructor(config: Partial<PaparaConfig> = {}) {
    const apiKey = config.apiKey ?? process.env['PAPARA_API_KEY'];
    if (!apiKey) throw new ProviderConfigError('PAPARA', 'api_key');
    this.config = {
      apiKey,
      notificationUrl:
        config.notificationUrl ??
        process.env['PAPARA_NOTIFICATION_URL'] ??
        `${process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3001'}/payments/webhook/PAPARA`,
      redirectUrl:
        config.redirectUrl ??
        `${process.env['NEXT_PUBLIC_APP_URL'] ?? 'http://localhost:3000'}/payment/success`,
      sandbox: config.sandbox ?? process.env['NODE_ENV'] !== 'production',
    };
  }

  async init(input: PaymentInitInput): Promise<PaymentInitResult> {
    if (input.currency !== 'TRY') throw new CurrencyNotSupportedError(input.currency, 'PAPARA');
    if (input.amount <= 0) throw new InvalidAmountError(input.amount);

    const referenceId = input.orderId ?? `CL${Date.now()}`;
    const res = await fetch(`${this.baseUrl}/payments`, {
      method: 'POST',
      headers: { ApiKey: this.config.apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: input.amount.toFixed(2),
        referenceId,
        orderDescription: `CyberLisans order ${referenceId}`,
        notificationUrl: this.config.notificationUrl,
        redirectUrl: this.config.redirectUrl,
        currency: 1,
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Papara init failed: ${res.status} ${text}`);
    }
    const data = (await res.json()) as {
      data: { id: string; status: number; paymentUrl: string; amount: number; referenceId: string };
    };
    return {
      paymentId: data.data.id,
      provider: 'PAPARA',
      providerRef: data.data.id,
      status: STATUS_MAP[data.data.status] ?? 'PENDING',
      redirectUrl: data.data.paymentUrl,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000),
      raw: data,
    };
  }

  verifyWebhook(headers: Record<string, string>, body: string): WebhookPayload {
    let parsed: any;
    try {
      parsed = JSON.parse(body);
    } catch {
      throw new WebhookPayloadError('PAPARA', 'invalid JSON');
    }
    const { id, status, amount, referenceId } = parsed;
    if (!id || status === undefined) throw new WebhookPayloadError('PAPARA', 'missing id/status');
    const tsCheck = verifyTimestampInWindow(parsed.timestamp ?? headers['x-papara-timestamp']);
    if (!tsCheck.valid) throw new WebhookSignatureError('PAPARA');
    return {
      provider: 'PAPARA',
      providerRef: id,
      status: STATUS_MAP[status as number] ?? 'PENDING',
      amount: Number(amount),
      currency: 'TRY',
      raw: parsed,
      receivedAt: new Date(),
    };
  }

  async verifyWebhookAsync(headers: Record<string, string>, body: string): Promise<WebhookPayload> {
    return this.verifyWebhook(headers, body);
  }

  async refund(input: RefundInput): Promise<RefundResult> {
    const res = await fetch(`${this.baseUrl}/refund`, {
      method: 'POST',
      headers: { ApiKey: this.config.apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: input.paymentId, amount: input.amount }),
    });
    if (!res.ok) throw new RefundFailedError('PAPARA', `HTTP ${res.status}`);
    const data = (await res.json()) as { data: { id: string; status: number } };
    return {
      refundId: data.data.id,
      status: data.data.status === 1 ? 'succeeded' : 'pending',
      amount: input.amount ?? 0,
    };
  }
}
