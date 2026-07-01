import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { ZodError } from 'zod';
import { authMiddleware, requireAdmin } from '../../../infrastructure/auth';
import { prisma } from '../../../infrastructure/db';
import { paymentRepository } from '../../../infrastructure/repositories/payment.repository';
import { auditRepository } from '../../../infrastructure/repositories/audit.repository';
import { walletRepository } from '../../../infrastructure/repositories/wallet.repository';
import { orderRepository } from '../../../infrastructure/repositories/order.repository';
import { getRequestMeta } from '../../middleware/request-meta';
import { PaymentError } from '@cyberlisans/payments/errors';
import { createPaymentProvider } from '@cyberlisans/payments/index';
import type { RefundInput } from '@cyberlisans/payments/types';

export const adminPaymentsRoutes = new Hono();

adminPaymentsRoutes.use('*', authMiddleware, requireAdmin());

adminPaymentsRoutes.use('*', async (c, next) => {
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
    console.error('[ADMIN PAYMENTS ERROR]', err);
    return c.json({ error: 'Internal error' }, 500);
  }
});

const listQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(200).default(20),
  search: z.string().trim().max(200).optional(),
  provider: z
    .enum(['PAYTR', 'PAPARA', 'STRIPE', 'NOWPAYMENTS', 'BANK_TRANSFER', 'WALLET'])
    .optional(),
  status: z
    .enum(['PENDING', 'PROCESSING', 'SUCCEEDED', 'FAILED', 'REFUNDED', 'EXPIRED'])
    .optional(),
  currency: z.enum(['TRY', 'USD', 'EUR', 'USDT']).optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  sort: z.enum(['createdAt', 'amount']).default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
});

adminPaymentsRoutes.get('/', zValidator('query', listQuerySchema), async (c) => {
  const q = c.req.valid('query');
  const where: Record<string, unknown> = {};
  if (q.provider) where['provider'] = q.provider;
  if (q.status) where['status'] = q.status;
  if (q.currency) where['currency'] = q.currency;
  if (q.from || q.to) {
    where['createdAt'] = {
      ...(q.from ? { gte: new Date(q.from) } : {}),
      ...(q.to ? { lte: new Date(q.to) } : {}),
    };
  }
  if (q.search) {
    where['OR'] = [
      { id: { contains: q.search, mode: 'insensitive' } },
      { providerRef: { contains: q.search, mode: 'insensitive' } },
      { order: { orderNumber: { contains: q.search, mode: 'insensitive' } } },
      { user: { email: { contains: q.search, mode: 'insensitive' } } },
      { user: { username: { contains: q.search, mode: 'insensitive' } } },
    ];
  }
  const txResult = (await prisma.$transaction([
    prisma.payment.findMany({
      where,
      orderBy: { [q.sort]: q.order },
      skip: (q.page - 1) * q.limit,
      take: q.limit,
      include: {
        user: { select: { id: true, email: true, username: true, displayName: true } },
        order: { select: { id: true, orderNumber: true } },
      },
    }),
    prisma.payment.count({ where }),
  ])) as [any[], number];
  const items = txResult[0];
  const total = txResult[1];
  return c.json({
    items: items.map((p) => ({
      id: p.id,
      orderId: p.orderId,
      orderNumber: p.order?.orderNumber ?? null,
      user: p.user,
      provider: p.provider,
      providerRef: p.providerRef,
      amount: Number(p.amount),
      currency: p.currency,
      status: p.status,
      paidAt: p.paidAt,
      refundedAt: p.refundedAt,
      createdAt: p.createdAt,
    })),
    total,
    page: q.page,
    limit: q.limit,
    totalPages: Math.ceil(total / q.limit) || 1,
  });
});

adminPaymentsRoutes.get('/:id', async (c) => {
  const id = c.req.param('id');
  const payment = await prisma.payment.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          username: true,
          displayName: true,
          role: true,
          status: true,
        },
      },
      order: { select: { id: true, orderNumber: true, totalAmount: true, currency: true } },
    },
  });
  if (!payment) return c.json({ error: 'Ödeme bulunamadı', code: 'PAYMENT_NOT_FOUND' }, 404);
  const refunds = await prisma.walletTransaction.findMany({
    where: { referenceType: 'payment', referenceId: id, type: { in: ['REFUND', 'ADMIN_CREDIT'] } },
    orderBy: { createdAt: 'desc' },
  });
  const audit = await prisma.auditLog.findMany({
    where: {
      OR: [
        { targetType: 'payment', targetId: id },
        { targetId: id, action: 'STATUS_CHANGE' },
      ],
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
  return c.json({
    payment: {
      id: payment.id,
      user: payment.user,
      order: payment.order,
      provider: payment.provider,
      providerRef: payment.providerRef,
      amount: Number(payment.amount),
      currency: payment.currency,
      status: payment.status,
      paidAt: payment.paidAt,
      refundedAt: payment.refundedAt,
      expiresAt: payment.expiresAt,
      webhookPayload: payment.webhookPayload,
      metadata: payment.metadata,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
    },
    refunds: refunds.map((r: (typeof refunds)[number]) => ({
      id: r.id,
      amount: Number(r.amount),
      currency: r.currency,
      description: r.description,
      createdAt: r.createdAt,
    })),
    audit: audit.map((a: (typeof audit)[number]) => ({
      id: a.id,
      action: a.action,
      targetType: a.targetType,
      payload: a.payload,
      ipAddress: a.ipAddress,
      userAgent: a.userAgent,
      createdAt: a.createdAt,
    })),
  });
});

adminPaymentsRoutes.post('/:id/retry', async (c) => {
  const id = c.req.param('id');
  const admin = c.get('user');
  const meta = getRequestMeta(c);
  const payment = await paymentRepository.findById(id);
  if (!payment) return c.json({ error: 'Ödeme bulunamadı', code: 'PAYMENT_NOT_FOUND' }, 404);
  if (payment.status !== 'PENDING' && payment.status !== 'PROCESSING') {
    return c.json(
      {
        error: 'Sadece PENDING/PROCESSING ödemeler yeniden denenebilir',
        code: 'PAYMENT_NOT_RETRIABLE',
      },
      409,
    );
  }
  const updated = await paymentRepository.updateStatus(id, 'PROCESSING', {
    webhookPayload: {
      ...(payment.webhookPayload as object | null),
      retriedAt: new Date().toISOString(),
    },
  });
  await auditRepository.log({
    actorId: admin.sub,
    targetUserId: payment.userId,
    action: 'STATUS_CHANGE',
    targetType: 'payment',
    targetId: id,
    payload: { from: payment.status, to: 'PROCESSING', reason: 'admin_retry' },
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
  });
  return c.json({ payment: updated });
});

const refundBodySchema = z.object({
  amount: z.number().positive().optional(),
  reason: z.string().max(500).optional(),
  creditWallet: z.boolean().default(true),
});

adminPaymentsRoutes.post('/:id/refund', zValidator('json', refundBodySchema), async (c) => {
  const id = c.req.param('id');
  const admin = c.get('user');
  const meta = getRequestMeta(c);
  const body = c.req.valid('json');
  const payment = await paymentRepository.findById(id);
  if (!payment) return c.json({ error: 'Ödeme bulunamadı', code: 'PAYMENT_NOT_FOUND' }, 404);
  if (payment.status !== 'SUCCEEDED') {
    return c.json(
      { error: 'Sadece başarılı ödemeler iade edilebilir', code: 'PAYMENT_NOT_REFUNDABLE' },
      409,
    );
  }
  const refundAmount = body.amount ?? Number(payment.amount);
  if (refundAmount > Number(payment.amount) + 0.01) {
    return c.json({ error: 'İade tutarı ödemeyi aşamaz', code: 'REFUND_OVERPAY' }, 400);
  }
  let providerResult: { refundId: string; status: string } | null = null;
  if (
    payment.providerRef &&
    payment.provider !== 'BANK_TRANSFER' &&
    payment.provider !== 'WALLET'
  ) {
    try {
      const provider = createPaymentProvider(payment.provider);
      const result = await provider.refund({
        paymentId: payment.providerRef,
        amount: body.amount,
        reason: body.reason,
      } satisfies RefundInput);
      providerResult = { refundId: result.refundId, status: result.status };
    } catch (err) {
      console.error('[ADMIN REFUND PROVIDER ERROR]', err);
    }
  }
  await paymentRepository.updateStatus(id, 'REFUNDED');
  if (body.creditWallet) {
    try {
      await walletRepository.credit({
        userId: payment.userId,
        currency: payment.currency,
        amount: refundAmount,
        type: 'REFUND',
        description: body.reason ?? `${payment.provider} iade`,
        referenceType: 'payment',
        referenceId: id,
        metadata: { providerResult, reason: body.reason ?? null },
      });
    } catch (err) {
      console.error('[ADMIN REFUND WALLET CREDIT ERROR]', err);
    }
  }
  if (payment.orderId) {
    try {
      await orderRepository.updateStatus(payment.orderId, 'REFUNDED', { refundedAt: new Date() });
    } catch (err) {
      console.error('[ADMIN REFUND ORDER UPDATE ERROR]', err);
    }
  }
  await auditRepository.log({
    actorId: admin.sub,
    targetUserId: payment.userId,
    action: 'BALANCE_CHANGE',
    targetType: 'payment',
    targetId: id,
    payload: {
      operation: 'refund',
      amount: refundAmount,
      currency: payment.currency,
      reason: body.reason ?? null,
      creditWallet: body.creditWallet,
      providerResult,
    },
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
  });
  const updated = await paymentRepository.findById(id);
  return c.json({ payment: updated, refundAmount, providerResult });
});
