import { paymentRepository } from '../../../infrastructure/repositories/payment.repository';
import { getOrCreateIdempotencyKey } from '@cyberlisans/payments/idempotency';
import {
  providerSupportsCurrency,
  type PaymentInitResult,
  type PaymentProvider,
} from '@cyberlisans/payments/types';
import type { PaymentEntity, Currency } from '../../entities/wallet';

export interface InitiatePaymentInput {
  userId: string;
  orderId?: string;
  amount: number;
  currency: Currency;
  provider: PaymentProvider;
  returnUrl?: string;
  metadata?: Record<string, unknown>;
}

export async function initiatePayment(
  input: InitiatePaymentInput,
): Promise<PaymentInitResult & { payment: PaymentEntity }> {
  const supported = providerSupportsCurrency[input.provider];
  if (!supported.includes(input.currency)) {
    throw new Error('CURRENCY_NOT_SUPPORTED');
  }
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
  const providerRef = getOrCreateIdempotencyKey(`${input.provider.toLowerCase()}-${input.userId}`);
  const payment = await paymentRepository.create({
    userId: input.userId,
    orderId: input.orderId,
    provider: input.provider,
    amount: input.amount,
    currency: input.currency,
    expiresAt,
    metadata: { ...(input.metadata ?? {}), providerRef },
  });
  await paymentRepository.updateStatus(payment.id, 'PROCESSING', { providerRef });
  return {
    payment,
    paymentId: payment.id,
    provider: input.provider,
    providerRef,
    status: 'PROCESSING',
    expiresAt,
  };
}
