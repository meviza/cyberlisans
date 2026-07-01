export type Currency = 'TRY' | 'USD' | 'EUR' | 'USDT';
export type PaymentProvider =
  | 'PAYTR'
  | 'PAPARA'
  | 'NOWPAYMENTS'
  | 'STRIPE'
  | 'BANK_TRANSFER'
  | 'WALLET';
export type PaymentStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'SUCCEEDED'
  | 'FAILED'
  | 'REFUNDED'
  | 'EXPIRED';

export interface PaymentInitInput {
  orderId?: string;
  userId: string;
  amount: number;
  currency: Currency;
  returnUrl?: string;
  cancelUrl?: string;
  metadata?: Record<string, string>;
  customerEmail?: string;
  customerName?: string;
}

export interface PaymentInitResult {
  paymentId: string;
  provider: PaymentProvider;
  providerRef: string;
  status: PaymentStatus;
  redirectUrl?: string;
  expiresAt?: Date;
  raw?: unknown;
}

export interface WebhookPayload {
  provider: PaymentProvider;
  providerRef: string;
  status: PaymentStatus;
  amount: number;
  currency: Currency;
  raw: unknown;
  signature?: string;
  receivedAt: Date;
}

export interface RefundInput {
  paymentId: string;
  amount?: number;
  reason?: string;
}

export interface RefundResult {
  refundId: string;
  status: 'pending' | 'succeeded' | 'failed';
  amount: number;
  raw?: unknown;
}

export interface IPaymentProvider {
  readonly name: PaymentProvider;
  init(input: PaymentInitInput): Promise<PaymentInitResult>;
  verifyWebhook(headers: Record<string, string>, body: string): WebhookPayload;
  verifyWebhookAsync?(headers: Record<string, string>, body: string): Promise<WebhookPayload>;
  refund(input: RefundInput): Promise<RefundResult>;
}

export const SUPPORTED_CURRENCIES: Currency[] = ['TRY', 'USD', 'EUR', 'USDT'];

export const providerSupportsCurrency: Record<PaymentProvider, Currency[]> = {
  PAYTR: ['TRY'],
  PAPARA: ['TRY'],
  NOWPAYMENTS: ['USD', 'EUR', 'USDT', 'TRY'],
  STRIPE: ['TRY', 'USD', 'EUR'],
  BANK_TRANSFER: ['TRY', 'USD', 'EUR', 'USDT'],
  WALLET: ['TRY', 'USD', 'EUR', 'USDT'],
};
