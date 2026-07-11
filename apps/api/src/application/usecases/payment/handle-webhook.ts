import { paymentRepository } from '../../../infrastructure/repositories/payment.repository';
import { walletRepository } from '../../../infrastructure/repositories/wallet.repository';
import { orderRepository } from '../../../infrastructure/repositories/order.repository';
import { auditRepository } from '../../../infrastructure/repositories/audit.repository';
import { fulfillOrder } from '../order/fulfill-order';
import { recordDealerSale } from '../dealer/record-dealer-sale';
import { PaymentNotFoundError } from '../../../domain/errors/wallet';
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
  // Resolve payment by provider session/ref, or metadata.paymentId fallback
  let payment = await paymentRepository.findByProviderRef(payload.provider, payload.providerRef);
  if (!payment) {
    const raw = payload.raw as {
      paymentId?: string;
      data?: { object?: { metadata?: { paymentId?: string } } };
    };
    const metaPaymentId = raw?.paymentId ?? raw?.data?.object?.metadata?.paymentId;
    if (metaPaymentId) {
      payment = await paymentRepository.findById(metaPaymentId);
      if (payment && !payment.providerRef) {
        payment = await paymentRepository.updateStatus(payment.id, payment.status, {
          providerRef: payload.providerRef,
        });
      }
    }
  }
  if (!payment) throw new PaymentNotFoundError();

  if (payload.status === 'EXPIRED' || payload.status === 'FAILED') {
    if (payment.status === 'PENDING' || payment.status === 'PROCESSING') {
      const updated = await paymentRepository.updateStatus(payment.id, payload.status);
      return { idempotent: false, payment: updated };
    }
    return { idempotent: true, payment };
  }

  if (payload.status !== 'SUCCEEDED') {
    return { idempotent: true, payment, skipped: true, status: payload.status };
  }

  if (payment.status === 'SUCCEEDED') {
    return { idempotent: true, payment };
  }
  if (payment.status !== 'PENDING' && payment.status !== 'PROCESSING') {
    return { idempotent: true, payment, skipped: true };
  }

  // Amount check (allow zero for some expired-only events already handled)
  if (payload.amount > 0 && Math.abs(Number(payment.amount) - payload.amount) > 0.05) {
    // Stripe may send amount in different precision for some currencies — soft check
    const ratio =
      Math.abs(Number(payment.amount) - payload.amount) / Math.max(payment.amount, 0.01);
    if (ratio > 0.02) throw new WebhookAmountMismatchError();
  }

  const updated = await paymentRepository.updateStatus(payment.id, 'SUCCEEDED', {
    paidAt: payload.receivedAt,
    providerRef: payload.providerRef,
    webhookPayload: payload.raw as Record<string, unknown>,
  });

  const purpose =
    (payment.metadata as Record<string, unknown> | null)?.['purpose'] ??
    (payment.orderId ? 'order' : 'deposit');

  // Wallet top-up only for deposit payments (no order)
  if (purpose === 'deposit' && !payment.orderId) {
    await walletRepository.credit({
      userId: payment.userId,
      currency: payment.currency,
      amount: payment.amount,
      type: 'DEPOSIT',
      description: `${payload.provider} bakiye yükleme`,
      referenceType: 'payment',
      referenceId: payment.id,
      metadata: { providerRef: payload.providerRef },
    });
  }

  if (payment.orderId) {
    await orderRepository.markPaid(payment.orderId, payment.id);
    try {
      await fulfillOrder({
        orderId: payment.orderId,
        userId: payment.userId,
        ipAddress: undefined,
        userAgent: payload.provider,
      });
    } catch (err) {
      console.error('[FULFILL_ORDER_AFTER_WEBHOOK_FAILED]', err);
    }
    try {
      const meta = payment.metadata as Record<string, unknown> | null;
      const refCode = (meta?.['refCode'] as string | undefined) ?? undefined;
      await recordDealerSale({ orderId: payment.orderId, refCode });
    } catch (err) {
      console.error('[RECORD_DEALER_SALE_FAILED]', err);
    }
  }

  await auditRepository.log({
    actorId: payment.userId,
    action: 'CREATE',
    targetType: 'payment',
    targetId: payment.id,
    payload: { provider: payload.provider, status: 'SUCCEEDED', purpose },
  });
  return { idempotent: false, payment: updated };
}
