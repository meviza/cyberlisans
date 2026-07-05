export type Currency = 'TRY' | 'USD' | 'EUR' | 'USDT';
export type WalletTxType =
  | 'DEPOSIT'
  | 'WITHDRAWAL'
  | 'PURCHASE'
  | 'REFUND'
  | 'ADMIN_CREDIT'
  | 'ADMIN_DEBIT'
  | 'REFERRAL_REWARD'
  | 'LOYALTY_REWARD'
  | 'GIFT_RECEIVED'
  | 'GIFT_SENT';

export interface WalletEntity {
  id: string;
  userId: string;
  balanceTry: number;
  balanceUsd: number;
  balanceEur: number;
  balanceUsdt: number;
  loyaltyCoins: number;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface WalletTransactionEntity {
  id: string;
  userId: string;
  type: WalletTxType;
  currency: Currency;
  amount: number;
  balanceAfter: number;
  referenceType: string | null;
  referenceId: string | null;
  description: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
}

export interface PaymentEntity {
  id: string;
  userId: string;
  orderId: string | null;
  provider: 'PAYTR' | 'PAPARA' | 'NOWPAYMENTS' | 'STRIPE' | 'BANK_TRANSFER' | 'SHOPIER' | 'WALLET';
  providerRef: string | null;
  amount: number;
  currency: Currency;
  status: 'PENDING' | 'PROCESSING' | 'SUCCEEDED' | 'FAILED' | 'REFUNDED' | 'EXPIRED';
  webhookPayload: Record<string, unknown> | null;
  metadata: Record<string, unknown> | null;
  expiresAt: Date | null;
  paidAt: Date | null;
  refundedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
