import { paymentRepository } from '../../../infrastructure/repositories/payment.repository';
import { walletRepository } from '../../../infrastructure/repositories/wallet.repository';
import { orderRepository } from '../../../infrastructure/repositories/order.repository';
import { auditRepository } from '../../../infrastructure/repositories/audit.repository';
import { PaymentNotFoundError } from '../../errors/wallet';
import type { WebhookPayload } from '@cyberlisans/payments/types';

export class WebhookSignatureError extends Error {
  readonly code = 'WEBHOOK_SIGNATURE_INVALID';
  constructor(provider: string) {
    super(`${provider} webhook imzası geçersiz`);
  }
}

export class WebhookAmountMismatchError extends Error {
  readonly code = 'WEBHOOK_AMOUNT_MISMATCH';
  constructor() {
    super('Ödeme tutarı uyuşmuyor');
  }
}

export async function handlePaymentWebhook(payload: WebhookPayload) {
  const payment = await paymentRepository.findByProviderRef(payload.provider, payload.providerRef);
  if (!payment) throw new PaymentNotFoundError();
  if (payment.status === 'SUCCEEDED') {
    return { idempotent: true, payment };
  }
  if (payment.status !== 'PENDING' && payment.status !== 'PROCESSING') {
    return { idempotent: true, payment, skipped: true };
  }
  if (Math.abs(Number(payment.amount) - payload.amount) > 0.01) {
    throw new WebhookAmountMismatchError();
  }
  const updated = await paymentRepository.updateStatus(payment.id, 'SUCCEEDED', {
    paidAt: payload.receivedAt,
    webhookPayload: payload.raw as Record<string, unknown>,
  });
  await walletRepository.credit({
    userId: payment.userId,
    currency: payment.currency,
    amount: payment.amount,
    type: 'DEPOSIT',
    description: `${payload.provider} ödeme onayı`,
    referenceType: 'payment',
    referenceId: payment.id,
    metadata: { providerRef: payload.providerRef },
  });
  if (payment.orderId) {
    await orderRepository.markPaid(payment.orderId, payment.id);
  }
  await auditRepository.log({
    actorId: payment.userId,
    action: 'CREATE',
    targetType: 'payment',
    targetId: payment.id,
    payload: { provider: payload.provider, status: 'SUCCEEDED' },
  });
  return { idempotent: false, payment: updated };
}
