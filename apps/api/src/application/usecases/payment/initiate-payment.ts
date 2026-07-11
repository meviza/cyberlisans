import { paymentRepository } from '../../../infrastructure/repositories/payment.repository';
import { orderRepository } from '../../../infrastructure/repositories/order.repository';
import { createPaymentProvider } from '@cyberlisans/payments/index';
import {
  providerSupportsCurrency,
  type PaymentInitResult,
  type PaymentProvider,
} from '@cyberlisans/payments/types';
import type { PaymentEntity, Currency } from '../../../domain/entities/wallet';
import {
  OrderNotFoundError,
  OrderNotOwnedError,
  OrderNotPendingError,
} from '../../../domain/errors/wallet';

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
  if (!supported?.includes(input.currency)) {
    throw new Error('CURRENCY_NOT_SUPPORTED');
  }

  // Prefer order totals when orderId is provided (never trust client amount alone)
  let amount = input.amount;
  let currency = input.currency;
  if (input.orderId) {
    const order = await orderRepository.findById(input.orderId);
    if (!order) throw new OrderNotFoundError();
    if (order.userId !== input.userId) throw new OrderNotOwnedError();
    if (order.status !== 'PENDING') throw new OrderNotPendingError();
    amount = order.totalAmount;
    currency = order.currency as Currency;
  }

  const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
  const payment = await paymentRepository.create({
    userId: input.userId,
    orderId: input.orderId,
    provider: input.provider,
    amount,
    currency,
    expiresAt,
    metadata: {
      ...(input.metadata ?? {}),
      purpose: input.orderId ? 'order' : 'deposit',
    },
  });

  // WALLET is handled by pay-with-wallet, not external provider
  if (input.provider === 'WALLET') {
    await paymentRepository.updateStatus(payment.id, 'PENDING');
    return {
      payment,
      paymentId: payment.id,
      provider: 'WALLET',
      providerRef: payment.id,
      status: 'PENDING',
      expiresAt,
    };
  }

  const provider = createPaymentProvider(input.provider);
  const init = await provider.init({
    userId: input.userId,
    orderId: input.orderId,
    amount,
    currency,
    returnUrl: input.returnUrl,
    metadata: {
      paymentId: payment.id,
      ...(input.metadata
        ? Object.fromEntries(Object.entries(input.metadata).map(([k, v]) => [k, String(v)]))
        : {}),
    },
  });

  const updated = await paymentRepository.updateStatus(payment.id, 'PROCESSING', {
    providerRef: init.providerRef,
  });

  return {
    payment: updated,
    paymentId: payment.id,
    provider: init.provider,
    providerRef: init.providerRef,
    status: init.status,
    redirectUrl: init.redirectUrl,
    expiresAt: init.expiresAt ?? expiresAt,
    raw: init.raw,
  };
}
