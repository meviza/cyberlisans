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

interface PayTRConfig {
  merchantId: string;
  merchantKey: string;
  merchantSalt: string;
  testMode?: boolean;
  okUrl: string;
  failUrl: string;
  timeoutLimit?: number;
}

export class PayTRProvider implements IPaymentProvider {
  readonly name = 'PAYTR' as const;
  private config: PayTRConfig;

  constructor(config: Partial<PayTRConfig> = {}) {
    const merchantId = config.merchantId ?? process.env['PAYTR_MERCHANT_ID'];
    const merchantKey = config.merchantKey ?? process.env['PAYTR_MERCHANT_KEY'];
    const merchantSalt = config.merchantSalt ?? process.env['PAYTR_MERCHANT_SALT'];
    if (!merchantId || !merchantKey || !merchantSalt)
      throw new ProviderConfigError('PAYTR', 'merchant_id/key/salt');
    this.config = {
      merchantId,
      merchantKey,
      merchantSalt,
      testMode: config.testMode ?? process.env['NODE_ENV'] !== 'production',
      okUrl:
        config.okUrl ??
        process.env['PAYTR_OK_URL'] ??
        `${process.env['NEXT_PUBLIC_APP_URL'] ?? 'http://localhost:3000'}/payment/success`,
      failUrl:
        config.failUrl ??
        process.env['PAYTR_FAIL_URL'] ??
        `${process.env['NEXT_PUBLIC_APP_URL'] ?? 'http://localhost:3000'}/payment/failed`,
      timeoutLimit: config.timeoutLimit ?? 30,
    };
  }

  async init(input: PaymentInitInput): Promise<PaymentInitResult> {
    if (input.currency !== 'TRY') throw new CurrencyNotSupportedError(input.currency, 'PAYTR');
    if (input.amount <= 0) throw new InvalidAmountError(input.amount);

    const merchantOid = `CL${Date.now()}${Math.floor(Math.random() * 1000)}`;
    const paymentAmount = Math.round(input.amount * 100).toString();
    const userIp = '127.0.0.1';
    const userName = input.customerName ?? 'CyberLisans User';
    const userAddress = 'Turkey';
    const userPhone = '5555555555';
    const userBasket = Buffer.from(
      JSON.stringify([[input.orderId ?? merchantOid, input.amount.toFixed(2), 1]]),
    ).toString('base64');
    const email = input.customerEmail ?? '[email protected]';
    const testMode = this.config.testMode ? '1' : '0';

    const hashStr = [
      this.config.merchantId,
      userIp,
      merchantOid,
      email,
      paymentAmount,
      'TL',
      testMode,
      '0',
      '0',
      userName,
      userAddress,
      userPhone,
      userBasket,
      this.config.timeoutLimit!.toString(),
      'TL',
      testMode,
      '0',
      this.config.merchantKey,
    ].join('');
    const token = createHmac('sha256', this.config.merchantSalt).update(hashStr).digest('base64');

    const body = new URLSearchParams({
      merchant_id: this.config.merchantId,
      user_ip: userIp,
      merchant_oid: merchantOid,
      email,
      payment_amount: paymentAmount,
      currency: 'TL',
      test_mode: testMode,
      no_installment: '0',
      max_installment: '0',
      user_name: userName,
      user_address: userAddress,
      user_phone: userPhone,
      user_basket: userBasket,
      merchant_ok_url: this.config.okUrl,
      merchant_fail_url: this.config.failUrl,
      timeout_limit: this.config.timeoutLimit!.toString(),
      debug_on: '0',
      lang: 'tr',
      paytr_token: token,
    });

    const res = await fetch('https://www.paytr.com/odeme/api/get-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });
    const data = (await res.json()) as { status: string; token?: string; reason?: string };
    if (data.status !== 'success' || !data.token) {
      throw new Error(`PayTR init failed: ${data.reason ?? 'unknown'}`);
    }

    return {
      paymentId: merchantOid,
      provider: 'PAYTR',
      providerRef: merchantOid,
      status: 'PENDING',
      redirectUrl: `https://www.paytr.com/odeme/guvenli/${data.token}`,
      expiresAt: new Date(Date.now() + (this.config.timeoutLimit ?? 30) * 60 * 1000),
      raw: data,
    };
  }

  verifyWebhook(headers: Record<string, string>, body: string): WebhookPayload {
    const params = new URLSearchParams(body);
    const merchantOid = params.get('merchant_oid');
    const status = params.get('status');
    const totalAmount = params.get('total_amount');
    const hash = params.get('hash');
    if (!merchantOid || !status || !totalAmount || !hash) {
      throw new WebhookPayloadError('PAYTR', 'missing required fields');
    }
    const expectedHash = createHmac('sha256', this.config.merchantSalt)
      .update(merchantOid + this.config.merchantSalt + status + totalAmount)
      .digest('base64');
    if (expectedHash !== hash) throw new WebhookSignatureError('PAYTR');
    return {
      provider: 'PAYTR',
      providerRef: merchantOid,
      status: status === 'success' ? 'SUCCEEDED' : 'FAILED',
      amount: Number(totalAmount) / 100,
      currency: 'TRY',
      raw: Object.fromEntries(params),
      receivedAt: new Date(),
    };
  }

  async refund(input: RefundInput): Promise<RefundResult> {
    const res = await fetch('https://www.paytr.com/odeme/iade', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        merchant_id: this.config.merchantId,
        merchant_oid: input.paymentId,
        return_amount: (input.amount ?? 0).toString(),
        reference_no: `REF${Date.now()}`,
      }).toString(),
    });
    if (!res.ok) throw new RefundFailedError('PAYTR', `HTTP ${res.status}`);
    const data = (await res.json()) as { status: string; refund_id?: string };
    return {
      refundId: data.refund_id ?? `refund-${Date.now()}`,
      status: data.status === 'success' ? 'succeeded' : 'failed',
      amount: input.amount ?? 0,
    };
  }
}
