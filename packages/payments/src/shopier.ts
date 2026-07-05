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
  CurrencyNotSupportedError,
  InvalidAmountError,
  ProviderConfigError,
  WebhookSignatureError,
  WebhookPayloadError,
  RefundFailedError,
} from './errors';
import { constantTimeEqual } from './webhook-security';

export interface ShopierConfig {
  apiKey: string;
  apiSecret: string;
  merchantId: string;
  callbackUrl?: string;
  sandbox?: boolean;
}

const STATUS_MAP: Record<string, WebhookPayload['status']> = {
  success: 'SUCCEEDED',
  completed: 'SUCCEEDED',
  failed: 'FAILED',
  cancelled: 'FAILED',
  expired: 'EXPIRED',
};

function sortAndStringify(payload: Record<string, unknown>): string {
  const sorted = Object.keys(payload)
    .sort()
    .reduce<Record<string, unknown>>((acc, key) => {
      acc[key] = payload[key];
      return acc;
    }, {});
  return JSON.stringify(sorted);
}

export class ShopierProvider implements IPaymentProvider {
  readonly name = 'SHOPIER' as const;
  private readonly config: ShopierConfig;
  private readonly baseUrl = 'https://www.shopier.com';

  constructor(config: Partial<ShopierConfig> = {}) {
    const apiKey = config.apiKey ?? process.env['SHOPIER_API_KEY'];
    const apiSecret = config.apiSecret ?? process.env['SHOPIER_API_SECRET'];
    const merchantId = config.merchantId ?? process.env['SHOPIER_MERCHANT_ID'];
    if (!apiKey || !apiSecret || !merchantId) {
      throw new ProviderConfigError('SHOPIER', 'api_key/api_secret/merchant_id');
    }
    this.config = {
      apiKey,
      apiSecret,
      merchantId,
      callbackUrl:
        config.callbackUrl ??
        `${process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3001'}/payments/webhook/SHOPIER`,
      sandbox: config.sandbox ?? process.env['NODE_ENV'] !== 'production',
    };
  }

  async init(input: PaymentInitInput): Promise<PaymentInitResult> {
    if (input.currency !== 'TRY') throw new CurrencyNotSupportedError(input.currency, 'SHOPIER');
    if (input.amount <= 0) throw new InvalidAmountError(input.amount);

    const payload: Record<string, unknown> = {
      API_KEY: this.config.apiKey,
      merchant_id: this.config.merchantId,
      product_name: input.metadata?.['productName'] ?? 'Digital Product',
      product_type: 'digital',
      buyer_email: input.customerEmail ?? '',
      buyer_name: input.customerName ?? '',
      buyer_phone: input.metadata?.['buyerPhone'] ?? '',
      billing_address: input.metadata?.['billingAddress'] ?? '',
      billing_city: input.metadata?.['billingCity'] ?? '',
      billing_country: input.metadata?.['billingCountry'] ?? 'TR',
      billing_postcode: input.metadata?.['billingPostcode'] ?? '',
      currency: 'TRY',
      total_order_value: input.amount.toFixed(2),
      platform_order_id: input.orderId ?? `CL${Date.now()}`,
      callback_url: this.config.callbackUrl,
      redirect_url: input.returnUrl ?? this.config.callbackUrl,
      cancel_url: input.cancelUrl ?? this.config.callbackUrl,
    };

    const body = sortAndStringify(payload);
    const signature = createHmac('sha256', this.config.apiSecret).update(body).digest('hex');

    const res = await fetch(`${this.baseUrl}/api/createPayment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.config.apiKey}`,
        'X-Shopier-Signature': signature,
      },
      body,
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Shopier init failed: ${res.status} ${text}`);
    }
    const data = (await res.json()) as {
      paymentId: string;
      redirectUrl: string;
      expiresAt?: string;
    };
    return {
      paymentId: data.paymentId,
      provider: 'SHOPIER',
      providerRef: data.paymentId,
      status: 'PENDING',
      redirectUrl: data.redirectUrl,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : new Date(Date.now() + 30 * 60 * 1000),
      raw: data,
    };
  }

  verifyWebhook(headers: Record<string, string>, body: string): WebhookPayload {
    const signature =
      headers['x-shopier-signature'] ??
      headers['X-Shopier-Signature'] ??
      headers['X-SHOPIER-SIGNATURE'];
    if (!signature) throw new WebhookSignatureError('SHOPIER');

    const expected = createHmac('sha256', this.config.apiSecret).update(body).digest('hex');
    if (!constantTimeEqual(expected, signature)) throw new WebhookSignatureError('SHOPIER');

    let params: URLSearchParams;
    try {
      params = new URLSearchParams(body);
    } catch {
      throw new WebhookPayloadError('SHOPIER', 'invalid form-urlencoded body');
    }

    const rawStatus = (params.get('status') ?? '').toLowerCase();
    const status = STATUS_MAP[rawStatus] ?? 'PENDING';
    const amountStr = params.get('total_order_value') ?? params.get('amount') ?? '0';

    return {
      provider: 'SHOPIER',
      providerRef: params.get('payment_id') ?? params.get('order_id') ?? '',
      status,
      amount: Number.parseFloat(amountStr),
      currency: 'TRY',
      raw: Object.fromEntries(params.entries()),
      signature,
      receivedAt: new Date(),
    };
  }

  async verifyWebhookAsync(headers: Record<string, string>, body: string): Promise<WebhookPayload> {
    return this.verifyWebhook(headers, body);
  }

  async refund(input: RefundInput): Promise<RefundResult> {
    const payload: Record<string, unknown> = {
      API_KEY: this.config.apiKey,
      payment_id: input.paymentId,
      amount: input.amount?.toFixed(2),
      reason: input.reason ?? 'customer_request',
    };
    const body = sortAndStringify(payload);
    const signature = createHmac('sha256', this.config.apiSecret).update(body).digest('hex');

    const res = await fetch(`${this.baseUrl}/api/refund`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.config.apiKey}`,
        'X-Shopier-Signature': signature,
      },
      body,
    });
    if (!res.ok) {
      const text = await res.text();
      throw new RefundFailedError('SHOPIER', `HTTP ${res.status} ${text}`);
    }
    const data = (await res.json()) as { refundId: string; status: string };
    return {
      refundId: data.refundId,
      status:
        data.status === 'success' ? 'succeeded' : data.status === 'pending' ? 'pending' : 'failed',
      amount: input.amount ?? 0,
      raw: data,
    };
  }
}

export type { ShopierConfig as ShopierConfigType };
