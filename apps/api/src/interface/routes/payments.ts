import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z, ZodError } from 'zod';
import { authMiddleware, requireAdmin } from '../../infrastructure/auth';
import { paymentRepository } from '../../infrastructure/repositories/payment.repository';
import { initiatePayment } from '../../application/usecases/payment/initiate-payment';
import {
  handlePaymentWebhook,
  WebhookSignatureError,
  WebhookAmountMismatchError,
} from '../../application/usecases/payment/handle-webhook';
import {
  initiatePaymentSchema,
  refundPaymentSchema,
  availableProvidersSchema,
  type InitiatePaymentInputBody,
} from './payments.schema';
import {
  PaymentError,
  WebhookSignatureError as ProviderWebhookSignatureError,
} from '@cyberlisans/payments/errors';
import type { WebhookPayload } from '@cyberlisans/payments/types';
import { PaymentNotFoundError } from '../../domain/errors/wallet';
import { createRateLimiter, RATE_LIMIT_CONFIGS } from '../middleware/security/rate-limit';
import { getRequestMeta } from '../middleware/request-meta';
import { isIpWhitelisted, verifyTimestampInWindow } from '@cyberlisans/payments/webhook-security';
import { createPaymentProvider } from '@cyberlisans/payments/index';
import { selectAvailableProviders } from '@cyberlisans/payments/provider-selector';

export const paymentsRoutes = new Hono();

const apiRateLimit = createRateLimiter({ config: RATE_LIMIT_CONFIGS.api });
const webhookRateLimit = createRateLimiter({
  config: RATE_LIMIT_CONFIGS.webhook,
  identifier: (c) => c.req.param('provider') ?? 'unknown',
});

paymentsRoutes.use('*', apiRateLimit);

paymentsRoutes.use('*', async (c, next) => {
  try {
    await next();
  } catch (err: unknown) {
    if (err instanceof ZodError) {
      return c.json({ error: 'Validation', code: 'VALIDATION_ERROR' }, 400);
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
    return c.json({ error: 'Bir hata oluştu, lütfen tekrar deneyin', code: 'INTERNAL_ERROR' }, 500);
  }
});

paymentsRoutes.post(
  '/available-providers',
  zValidator('json', availableProvidersSchema),
  async (c) => {
    const body = c.req.valid('json');
    const providers = selectAvailableProviders({
      currency: body.currency,
      amount: body.amount,
      customerCountry: body.customerCountry,
      preferredProvider: body.preferredProvider,
    });
    return c.json({ providers });
  },
);

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

/** Success-page fallback: verify Stripe session server-side when webhook is late */
paymentsRoutes.post(
  '/confirm-stripe-session',
  authMiddleware,
  zValidator('json', z.object({ sessionId: z.string().min(5).max(200) })),
  async (c) => {
    const user = c.get('user');
    const { sessionId } = c.req.valid('json');
    const { confirmStripeSession } = await import(
      '../../application/usecases/payment/confirm-stripe-session'
    );
    try {
      return c.json(await confirmStripeSession({ userId: user.sub, sessionId }));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'CONFIRM_FAILED';
      if (msg === 'FORBIDDEN') return c.json({ error: 'Forbidden', code: 'FORBIDDEN' }, 403);
      if (msg.includes('PaymentNotFound') || msg === 'Payment not found') {
        return c.json({ error: 'Ödeme bulunamadı', code: 'PAYMENT_NOT_FOUND' }, 404);
      }
      throw err;
    }
  },
);

paymentsRoutes.post('/webhook/:provider', webhookRateLimit, async (c) => {
  const provider = c.req.param('provider').toUpperCase() as WebhookPayload['provider'];
  const meta = getRequestMeta(c);
  const ip = meta.ipAddress ?? 'unknown';

  const envKey = `CYBERLISANS_WEBHOOK_IP_WHITELIST_${provider}`;
  const whitelistRaw = process.env[envKey];
  const whitelist = whitelistRaw ? whitelistRaw.split(',').map((s: string) => s.trim()) : undefined;
  if (whitelist && !isIpWhitelisted(ip, whitelist)) {
    return c.json({ error: 'Webhook IP whitelist reddi', code: 'WEBHOOK_IP_NOT_ALLOWED' }, 403);
  }

  const rawBody = await c.req.text();
  const headers: Record<string, string> = {};
  c.req.raw.headers.forEach((v, k) => {
    headers[k.toLowerCase()] = v;
  });
  headers['x-forwarded-for'] = ip;

  // Stripe signature carries its own timestamp (t=); generic x-timestamp optional for others
  const stripeSig = headers['stripe-signature'];
  const isStripe = provider === 'STRIPE';
  if (!isStripe) {
    const tsCheck = verifyTimestampInWindow(headers['x-timestamp']);
    if (!tsCheck.valid && headers['x-timestamp']) {
      return c.json({ error: 'Webhook replay/time window hatası', code: 'WEBHOOK_REJECTED' }, 401);
    }
  }

  let providerInstance: any;
  try {
    providerInstance = createPaymentProvider(provider);
  } catch {
    return c.json({ error: 'Provider yapılandırması eksik', code: 'PROVIDER_CONFIG_MISSING' }, 500);
  }

  let payload: WebhookPayload;
  try {
    payload = providerInstance.verifyWebhookAsync
      ? await providerInstance.verifyWebhookAsync(headers, rawBody)
      : providerInstance.verifyWebhook(headers, rawBody);
  } catch (err: unknown) {
    if (err instanceof ProviderWebhookSignatureError) {
      return c.json({ error: 'Webhook imzası geçersiz', code: 'WEBHOOK_SIGNATURE_INVALID' }, 401);
    }
    throw err;
  }

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
    items: items.map(
      (p: {
        id: string;
        orderId: string | null;
        provider: string;
        amount: unknown;
        currency: string;
        status: string;
        paidAt: Date | null;
        createdAt: Date;
      }) => ({
        id: p.id,
        orderId: p.orderId,
        provider: p.provider,
        amount: p.amount,
        currency: p.currency,
        status: p.status,
        paidAt: p.paidAt,
        createdAt: p.createdAt,
      }),
    ),
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
