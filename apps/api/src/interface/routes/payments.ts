import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { ZodError } from 'zod';
import { authMiddleware, requireAdmin } from '../../infrastructure/auth';
import { paymentRepository } from '../../infrastructure/repositories/payment.repository';
import { initiatePayment } from '../../domain/usecases/payment/initiate-payment';
import {
  handlePaymentWebhook,
  WebhookSignatureError,
  WebhookAmountMismatchError,
} from '../../domain/usecases/payment/handle-webhook';
import {
  initiatePaymentSchema,
  refundPaymentSchema,
  type InitiatePaymentInputBody,
} from './payments.schema';
import {
  PaymentError,
  WebhookSignatureError as ProviderWebhookSignatureError,
} from '@cyberlisans/payments/errors';
import type { WebhookPayload } from '@cyberlisans/payments/types';
import { PaymentNotFoundError } from '../../domain/errors/wallet';

export const paymentsRoutes = new Hono();

paymentsRoutes.use('*', async (c, next) => {
  try {
    await next();
  } catch (err) {
    if (err instanceof ZodError) {
      return c.json({ error: 'Validation', issues: err.issues }, 400);
    }
    if (err instanceof PaymentError) {
      return c.json(
        { error: err.message, code: err.code },
        err.statusCode as 400 | 401 | 403 | 404 | 409,
      );
    }
    if (err instanceof PaymentNotFoundError) {
      return c.json({ error: err.message, code: err.code }, 404);
    }
    if (err instanceof WebhookSignatureError || err instanceof ProviderWebhookSignatureError) {
      return c.json({ error: 'Webhook imzası geçersiz', code: 'WEBHOOK_SIGNATURE_INVALID' }, 401);
    }
    if (err instanceof WebhookAmountMismatchError) {
      return c.json({ error: err.message, code: err.code }, 409);
    }
    if (err instanceof Error && err.message === 'CURRENCY_NOT_SUPPORTED') {
      return c.json(
        { error: 'Bu sağlayıcı bu para birimini desteklemiyor', code: 'CURRENCY_NOT_SUPPORTED' },
        400,
      );
    }
    console.error('[PAYMENTS ERROR]', err);
    return c.json({ error: 'Internal error' }, 500);
  }
});

paymentsRoutes.post(
  '/initiate',
  authMiddleware,
  zValidator('json', initiatePaymentSchema),
  async (c) => {
    const user = c.get('user');
    const body = c.req.valid('json') as InitiatePaymentInputBody;
    return c.json(await initiatePayment({ userId: user.sub, ...body }), 201);
  },
);

paymentsRoutes.post('/webhook/:provider', async (c) => {
  const provider = c.req.param('provider').toUpperCase() as WebhookPayload['provider'];
  const rawBody = await c.req.text();
  let parsed: {
    amount: number;
    currency: WebhookPayload['currency'];
    providerRef: string;
    status: WebhookPayload['status'];
    signature?: string;
  };
  try {
    parsed = JSON.parse(rawBody);
  } catch {
    return c.json({ error: 'Geçersiz JSON', code: 'WEBHOOK_PAYLOAD_INVALID' }, 400);
  }
  const signature = c.req.header('x-signature') ?? parsed.signature;
  const payload: WebhookPayload = {
    provider,
    providerRef: parsed.providerRef,
    status: parsed.status,
    amount: Number(parsed.amount),
    currency: parsed.currency,
    raw: parsed,
    signature,
    receivedAt: new Date(),
  };
  const result = await handlePaymentWebhook(payload);
  return c.json(result);
});

paymentsRoutes.get('/', authMiddleware, async (c) => {
  const user = c.get('user');
  const limit = Math.min(Number(c.req.query('limit') ?? 20), 100);
  const cursor = c.req.query('cursor');
  const items = await paymentRepository.listForUser(
    user.sub,
    Number.isFinite(limit) ? limit : 20,
    cursor,
  );
  return c.json({
    items: items.map((p) => ({
      id: p.id,
      orderId: p.orderId,
      provider: p.provider,
      amount: p.amount,
      currency: p.currency,
      status: p.status,
      paidAt: p.paidAt,
      createdAt: p.createdAt,
    })),
    nextCursor: items.length > limit ? (items[limit]?.id ?? null) : null,
  });
});

paymentsRoutes.get('/:id', authMiddleware, async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');
  const payment = await paymentRepository.findById(id);
  if (!payment) return c.json({ error: 'Ödeme bulunamadı', code: 'PAYMENT_NOT_FOUND' }, 404);
  if (payment.userId !== user.sub) {
    return c.json({ error: 'Bu ödemeyi görme yetkiniz yok', code: 'FORBIDDEN' }, 403);
  }
  return c.json(payment);
});

paymentsRoutes.post(
  '/:id/refund',
  requireAdmin(),
  zValidator('json', refundPaymentSchema),
  async (c) => {
    const id = c.req.param('id');
    const body = c.req.valid('json');
    const payment = await paymentRepository.findById(id);
    if (!payment) return c.json({ error: 'Ödeme bulunamadı', code: 'PAYMENT_NOT_FOUND' }, 404);
    if (payment.status !== 'SUCCEEDED') {
      return c.json(
        { error: 'Sadece başarılı ödemeler iade edilebilir', code: 'PAYMENT_NOT_REFUNDABLE' },
        409,
      );
    }
    const updated = await paymentRepository.updateStatus(id, 'REFUNDED');
    return c.json({ payment: updated, reason: body.reason, amount: body.amount });
  },
);
