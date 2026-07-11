import { paymentRepository } from '../../../infrastructure/repositories/payment.repository';
import { orderRepository } from '../../../infrastructure/repositories/order.repository';
import { fulfillOrder } from '../order/fulfill-order';
import { PaymentNotFoundError } from '../../../domain/errors/wallet';

/**
 * Client-side success fallback when webhook is delayed or not yet configured.
 * Verifies Checkout Session with Stripe API and marks payment/order paid.
 */
export async function confirmStripeSession(input: { userId: string; sessionId: string }) {
  const secret = process.env['STRIPE_SECRET_KEY'];
  if (!secret) throw new Error('STRIPE_NOT_CONFIGURED');

  const res = await fetch(`https://api.stripe.com/v1/checkout/sessions/${input.sessionId}`, {
    headers: { Authorization: `Bearer ${secret}` },
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`STRIPE_SESSION_FETCH_FAILED: ${res.status} ${t}`);
  }
  const session = (await res.json()) as {
    id: string;
    payment_status: string;
    amount_total: number;
    currency: string;
    metadata?: { orderId?: string; paymentId?: string; userId?: string };
    client_reference_id?: string;
  };

  if (session.metadata?.userId && session.metadata.userId !== input.userId) {
    throw new Error('FORBIDDEN');
  }

  let payment = await paymentRepository.findByProviderRef('STRIPE', session.id);
  if (!payment && session.metadata?.paymentId) {
    payment = await paymentRepository.findById(session.metadata.paymentId);
  }
  if (!payment) throw new PaymentNotFoundError();
  if (payment.userId !== input.userId) throw new Error('FORBIDDEN');

  if (payment.status === 'SUCCEEDED') {
    return { payment, orderId: payment.orderId, alreadyPaid: true };
  }

  if (session.payment_status !== 'paid') {
    return {
      payment,
      orderId: payment.orderId,
      alreadyPaid: false,
      sessionStatus: session.payment_status,
    };
  }

  const updated = await paymentRepository.updateStatus(payment.id, 'SUCCEEDED', {
    paidAt: new Date(),
    providerRef: session.id,
    webhookPayload: session as unknown as Record<string, unknown>,
  });

  if (payment.orderId) {
    await orderRepository.markPaid(payment.orderId, payment.id);
    try {
      await fulfillOrder({
        orderId: payment.orderId,
        userId: payment.userId,
      });
    } catch (err) {
      console.error('[CONFIRM_SESSION_FULFILL_FAILED]', err);
    }
  }

  return { payment: updated, orderId: payment.orderId, alreadyPaid: false, confirmed: true };
}
