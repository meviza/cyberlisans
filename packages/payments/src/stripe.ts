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
import { constantTimeEqual, verifyTimestampInWindow } from './webhook-security';

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
    const appUrl = process.env['NEXT_PUBLIC_APP_URL'] ?? 'http://localhost:3000';
    this.config = {
      secretKey,
      webhookSecret: webhookSecret ?? '',
      successUrl:
        config.successUrl ?? `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: config.cancelUrl ?? `${appUrl}/checkout?cancelled=1`,
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
    // Stripe requires Checkout total ≥ ~$0.50 USD equivalent
    const minByCurrency: Record<string, number> = { TRY: 50, USD: 0.5, EUR: 0.5 };
    const min = minByCurrency[input.currency] ?? 0.5;
    if (input.amount < min) {
      throw new InvalidAmountError(input.amount);
    }
    const currency = this.getCurrencyForStripe(input.currency);
    const amount = this.getAmountForCurrency(input.amount, currency);

    const appUrl = process.env['NEXT_PUBLIC_APP_URL'] ?? 'http://localhost:3000';
    const successUrl = input.orderId
      ? `${appUrl}/checkout/success?orderId=${encodeURIComponent(input.orderId)}&session_id={CHECKOUT_SESSION_ID}`
      : this.config.successUrl;
    const cancelUrl = input.orderId
      ? `${appUrl}/checkout?orderId=${encodeURIComponent(input.orderId)}&cancelled=1`
      : this.config.cancelUrl;

    const params = new URLSearchParams();
    params.append('mode', 'payment');
    params.append('success_url', successUrl);
    params.append('cancel_url', cancelUrl);
    // Card + Link (Stripe Link one-click when enabled on the account)
    params.append('payment_method_types[]', 'card');
    params.append('payment_method_types[]', 'link');
    params.append('line_items[0][price_data][currency]', currency);
    params.append(
      'line_items[0][price_data][product_data][name]',
      `CyberLisans sipariş ${input.orderId ?? ''}`.trim(),
    );
    params.append('line_items[0][price_data][unit_amount]', String(amount));
    params.append('line_items[0][quantity]', '1');
    params.append('metadata[userId]', input.userId);
    params.append('client_reference_id', input.orderId ?? input.userId);
    if (input.orderId) params.append('metadata[orderId]', input.orderId);
    params.append('metadata[provider]', 'STRIPE');
    if (input.metadata?.['paymentId']) {
      params.append('metadata[paymentId]', input.metadata['paymentId']);
    }
    // Allow promo / Link autofill
    params.append('billing_address_collection', 'auto');

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
      url: string | null;
      payment_status: string;
      amount_total: number;
      currency: string;
    };

    if (!session.url) {
      throw new Error('Stripe Checkout Session returned no URL');
    }

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
    // Allow missing webhook secret only when explicitly disabled (local dev)
    const allowUnsigned =
      process.env['STRIPE_WEBHOOK_ALLOW_UNSIGNED'] === '1' && !this.config.webhookSecret;
    if (!sig && !allowUnsigned) throw new WebhookSignatureError('STRIPE');
    if (!this.config.webhookSecret && !allowUnsigned) throw new WebhookSignatureError('STRIPE');

    const event =
      this.config.webhookSecret && sig
        ? await this.constructEvent(rawBody, sig)
        : (JSON.parse(rawBody) as {
            type: string;
            id: string;
            data: { object: Record<string, unknown> };
          });

    let status: WebhookPayload['status'] = 'PENDING';
    let amount = 0;
    let currency: Currency = 'USD';
    let providerRef = '';
    let orderId: string | undefined;
    let paymentId: string | undefined;

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Record<string, unknown>;
      status = session['payment_status'] === 'paid' ? 'SUCCEEDED' : 'PENDING';
      amount = Number(session['amount_total'] ?? 0) / 100;
      currency = String(session['currency'] ?? 'usd').toUpperCase() as Currency;
      providerRef = String(session['id'] ?? '');
      const meta = (session['metadata'] ?? {}) as Record<string, string>;
      orderId = meta['orderId'];
      paymentId = meta['paymentId'];
    } else if (event.type === 'checkout.session.async_payment_succeeded') {
      const session = event.data.object as Record<string, unknown>;
      status = 'SUCCEEDED';
      amount = Number(session['amount_total'] ?? 0) / 100;
      currency = String(session['currency'] ?? 'usd').toUpperCase() as Currency;
      providerRef = String(session['id'] ?? '');
      const meta = (session['metadata'] ?? {}) as Record<string, string>;
      orderId = meta['orderId'];
      paymentId = meta['paymentId'];
    } else if (event.type === 'checkout.session.expired') {
      status = 'EXPIRED';
      const session = event.data.object as Record<string, unknown>;
      providerRef = String(session['id'] ?? '');
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
      raw: { ...event, orderId, paymentId },
      receivedAt: new Date(),
    };
  }

  verifyWebhook(_headers: Record<string, string>, _body: string): WebhookPayload {
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
    const replayCheck = verifyTimestampInWindow(String(timestamp), 5 * 60_000, Date.now());
    if (!replayCheck.valid) throw new WebhookSignatureError('STRIPE');
    const signedPayload = `${timestamp}.${payload}`;
    const crypto = await import('crypto');
    const expected = crypto
      .createHmac('sha256', this.config.webhookSecret)
      .update(signedPayload)
      .digest('hex');
    if (!constantTimeEqual(expected, v1Sig)) throw new WebhookSignatureError('STRIPE');
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
