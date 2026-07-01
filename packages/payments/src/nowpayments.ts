import { createHmac } from 'crypto';
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
  ProviderConfigError,
  WebhookSignatureError,
  WebhookPayloadError,
  RefundFailedError,
} from './errors';
import { constantTimeEqual } from './webhook-security';

interface NowPaymentsConfig {
  apiKey: string;
  ipnSecret: string;
  ipnCallbackUrl: string;
  successUrl: string;
  cancelUrl: string;
  sandbox?: boolean;
}

const STATUS_MAP: Record<string, WebhookPayload['status']> = {
  waiting: 'PENDING',
  confirming: 'PENDING',
  confirmed: 'PROCESSING',
  sending: 'PROCESSING',
  finished: 'SUCCEEDED',
  failed: 'FAILED',
  expired: 'EXPIRED',
  refunded: 'REFUNDED',
};

export class NowPaymentsProvider implements IPaymentProvider {
  readonly name = 'NOWPAYMENTS' as const;
  private config: NowPaymentsConfig;
  private baseUrl = 'https://api.nowpayments.io/v1';

  constructor(config: Partial<NowPaymentsConfig> = {}) {
    const apiKey = config.apiKey ?? process.env['NOWPAYMENTS_API_KEY'];
    const ipnSecret = config.ipnSecret ?? process.env['NOWPAYMENTS_IPN_SECRET'];
    const ipnCallbackUrl =
      config.ipnCallbackUrl ??
      process.env['NOWPAYMENTS_IPN_URL'] ??
      `${process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3001'}/payments/webhook/NOWPAYMENTS`;
    if (!apiKey) throw new ProviderConfigError('NOWPAYMENTS', 'api_key');
    this.config = {
      apiKey,
      ipnSecret: ipnSecret ?? apiKey,
      ipnCallbackUrl,
      successUrl:
        config.successUrl ??
        `${process.env['NEXT_PUBLIC_APP_URL'] ?? 'http://localhost:3000'}/payment/success`,
      cancelUrl:
        config.cancelUrl ??
        `${process.env['NEXT_PUBLIC_APP_URL'] ?? 'http://localhost:3000'}/payment/cancel`,
      sandbox: config.sandbox ?? false,
    };
  }

  async init(input: PaymentInitInput): Promise<PaymentInitResult> {
    if (input.amount <= 0) throw new InvalidAmountError(input.amount);

    const orderId = input.orderId ?? `CL${Date.now()}${Math.floor(Math.random() * 1000)}`;
    const body = {
      price_amount: input.amount,
      price_currency: input.currency === 'USDT' ? 'usd' : input.currency.toLowerCase(),
      pay_currency: 'usdttrc20',
      order_id: orderId,
      order_description: `CyberLisans order ${orderId}`,
      ipn_callback_url: this.config.ipnCallbackUrl,
      success_url: this.config.successUrl,
      cancel_url: this.config.cancelUrl,
    };

    const res = await fetch(`${this.baseUrl}/payment`, {
      method: 'POST',
      headers: { 'x-api-key': this.config.apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`NOWPayments init failed: ${res.status} ${text}`);
    }
    const data = (await res.json()) as {
      payment_id: number;
      payment_status: string;
      pay_address: string;
      pay_amount: number;
      pay_currency: string;
      price_amount: number;
      price_currency: string;
    };

    return {
      paymentId: String(data.payment_id),
      provider: 'NOWPAYMENTS',
      providerRef: String(data.payment_id),
      status: STATUS_MAP[data.payment_status] ?? 'PENDING',
      redirectUrl: data.pay_address,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      raw: data,
    };
  }

  verifyWebhook(headers: Record<string, string>, body: string): WebhookPayload {
    const signature = headers['x-nowpayments-signature'];
    if (!signature) throw new WebhookSignatureError('NOWPAYMENTS');
    let parsed: any;
    try {
      parsed = JSON.parse(body);
    } catch {
      throw new WebhookPayloadError('NOWPAYMENTS', 'invalid JSON');
    }
    const sortedKeys = Object.keys(parsed).sort();
    const sortedJson = JSON.stringify(
      sortedKeys.reduce((acc: any, k) => {
        acc[k] = parsed[k];
        return acc;
      }, {}),
    );
    const expectedSig = createHmac('sha512', this.config.ipnSecret)
      .update(sortedJson)
      .digest('hex');
    if (!constantTimeEqual(expectedSig, signature)) {
      throw new WebhookSignatureError('NOWPAYMENTS');
    }
    const status = STATUS_MAP[parsed.payment_status as string] ?? 'PENDING';
    return {
      provider: 'NOWPAYMENTS',
      providerRef: String(parsed.payment_id),
      status,
      amount: Number(parsed.price_amount),
      currency: String(parsed.price_currency).toUpperCase() as any,
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
      headers: { 'x-api-key': this.config.apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        payment_id: Number(input.paymentId),
        refund_address: '',
        refund_extra_id: '',
      }),
    });
    if (!res.ok) throw new RefundFailedError('NOWPAYMENTS', `HTTP ${res.status}`);
    const data = (await res.json()) as { id?: string; status?: string };
    return {
      refundId: String(data.id ?? Date.now()),
      status: (data.status as any) ?? 'pending',
      amount: input.amount ?? 0,
    };
  }
}
