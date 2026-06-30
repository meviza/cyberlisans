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
  WebhookSignatureError,
  WebhookPayloadError,
  RefundFailedError,
} from './errors';
import type { Currency } from './types';

interface StripeConfig {
  secretKey: string;
  webhookSecret: string;
  successUrl: string;
  cancelUrl: string;
}

export class StripeProvider implements IPaymentProvider {
  readonly name = 'STRIPE' as const;
  private config: StripeConfig;

  constructor(config: Partial<StripeConfig> = {}) {
    const secretKey = config.secretKey ?? process.env['STRIPE_SECRET_KEY'];
    const webhookSecret = config.webhookSecret ?? process.env['STRIPE_WEBHOOK_SECRET'];
    if (!secretKey) throw new ProviderConfigError('STRIPE', 'secret_key');
    this.config = {
      secretKey,
      webhookSecret: webhookSecret ?? '',
      successUrl:
        config.successUrl ??
        `${process.env['NEXT_PUBLIC_APP_URL'] ?? 'http://localhost:3000'}/payment/success`,
      cancelUrl:
        config.cancelUrl ??
        `${process.env['NEXT_PUBLIC_APP_URL'] ?? 'http://localhost:3000'}/payment/cancel`,
    };
  }

  private getAmountForCurrency(amount: number, currency: string): number {
    const zeroDecimal = new Set(['JPY', 'KRW', 'VND', 'CLP']);
    const cur = currency.toUpperCase();
    return zeroDecimal.has(cur) ? Math.round(amount) : Math.round(amount * 100);
  }

  private getCurrencyForStripe(currency: Currency): string {
    return currency.toLowerCase();
  }

  async init(input: PaymentInitInput): Promise<PaymentInitResult> {
    if (input.amount <= 0) throw new InvalidAmountError(input.amount);
    if (!['TRY', 'USD', 'EUR'].includes(input.currency))
      throw new CurrencyNotSupportedError(input.currency, 'STRIPE');
    const currency = this.getCurrencyForStripe(input.currency);
    const amount = this.getAmountForCurrency(input.amount, currency);

    const params = new URLSearchParams();
    params.append('mode', 'payment');
    params.append('success_url', this.config.successUrl);
    params.append('cancel_url', this.config.cancelUrl);
    params.append('payment_method_types[]', 'card');
    params.append('line_items[0][price_data][currency]', currency);
    params.append(
      'line_items[0][price_data][product_data][name]',
      `CyberLisans ${input.orderId ?? 'order'}`,
    );
    params.append('line_items[0][price_data][unit_amount]', String(amount));
    params.append('line_items[0][quantity]', '1');
    params.append('metadata[userId]', input.userId);
    if (input.orderId) params.append('metadata[orderId]', input.orderId);
    params.append('metadata[provider]', 'STRIPE');

    const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.config.secretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Stripe init failed: ${res.status} ${text}`);
    }
    const session = (await res.json()) as {
      id: string;
      url: string;
      payment_status: string;
      amount_total: number;
      currency: string;
    };

    return {
      paymentId: session.id,
      provider: 'STRIPE',
      providerRef: session.id,
      status: session.payment_status === 'paid' ? 'SUCCEEDED' : 'PENDING',
      redirectUrl: session.url,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      raw: session,
    };
  }

  async verifyWebhookAsync(
    headers: Record<string, string>,
    rawBody: string,
  ): Promise<WebhookPayload> {
    const sig = headers['stripe-signature'];
    if (!sig || !this.config.webhookSecret) throw new WebhookSignatureError('STRIPE');
    const event = await this.constructEvent(rawBody, sig);
    let status: WebhookPayload['status'] = 'PENDING';
    let amount = 0;
    let currency: Currency = 'USD';
    let providerRef = '';
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as any;
      status = session.payment_status === 'paid' ? 'SUCCEEDED' : 'PENDING';
      amount = Number(session.amount_total) / 100;
      currency = String(session.currency).toUpperCase() as Currency;
      providerRef = session.id;
    } else if (event.type === 'checkout.session.expired') {
      status = 'EXPIRED';
    } else if (event.type === 'charge.refunded') {
      status = 'REFUNDED';
    } else {
      status = 'PROCESSING';
    }
    return {
      provider: 'STRIPE',
      providerRef: providerRef || event.id,
      status,
      amount,
      currency,
      raw: event,
      receivedAt: new Date(),
    };
  }

  verifyWebhook(headers: Record<string, string>, body: string): WebhookPayload {
    throw new WebhookPayloadError(
      'STRIPE',
      'Stripe requires async signature verification; use verifyWebhookAsync',
    );
  }

  private async constructEvent(payload: string, sigHeader: string): Promise<any> {
    const elements = sigHeader.split(',');
    let timestamp = 0;
    let v1Sig = '';
    for (const el of elements) {
      const [k, v] = el.split('=');
      if (k === 't') timestamp = Number(v);
      else if (k === 'v1') v1Sig = v ?? '';
    }
    if (!timestamp || !v1Sig) throw new WebhookSignatureError('STRIPE');
    const tolerance = 300;
    if (Math.abs(Date.now() / 1000 - timestamp) > tolerance)
      throw new WebhookSignatureError('STRIPE');
    const signedPayload = `${timestamp}.${payload}`;
    const crypto = await import('crypto');
    const expected = crypto
      .createHmac('sha256', this.config.webhookSecret)
      .update(signedPayload)
      .digest('hex');
    if (expected !== v1Sig) throw new WebhookSignatureError('STRIPE');
    return JSON.parse(payload);
  }

  async refund(input: RefundInput): Promise<RefundResult> {
    const params = new URLSearchParams();
    params.append('payment_intent', input.paymentId);
    if (input.amount) params.append('amount', String(Math.round(input.amount * 100)));
    const res = await fetch('https://api.stripe.com/v1/refunds', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.config.secretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });
    if (!res.ok) throw new RefundFailedError('STRIPE', `HTTP ${res.status}`);
    const data = (await res.json()) as { id: string; status: string; amount: number };
    return {
      refundId: data.id,
      status: data.status === 'succeeded' ? 'succeeded' : 'pending',
      amount: data.amount / 100,
    };
  }
}
