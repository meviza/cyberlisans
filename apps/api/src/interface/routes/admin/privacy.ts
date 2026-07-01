import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { createAdminStack, errorHandler } from '../../middleware/admin-stack';
import { prisma } from '../../../infrastructure/db';
import { auditRepository } from '../../../infrastructure/repositories/audit.repository';
import { getRequestMeta } from '../../middleware/request-meta';

export const adminPrivacyRoutes = new Hono();

adminPrivacyRoutes.use('*', ...createAdminStack());

adminPrivacyRoutes.use('*', async (c, next) => {
  try {
    await next();
  } catch (err) {
    return errorHandler(err, c);
  }
});

adminPrivacyRoutes.get('/overview', async (c) => {
  const [total, byType, users] = await prisma.$transaction([
    prisma.consentRecord.count(),
    prisma.consentRecord.groupBy({
      by: ['type', 'granted'],
      _count: { _all: true },
    }),
    prisma.user.count(),
  ]);
  const breakdown: Record<string, { granted: number; denied: number; total: number }> = {};
  for (const row of byType) {
    if (!breakdown[row.type]) {
      breakdown[row.type] = { granted: 0, denied: 0, total: 0 };
    }
    if (row.granted) breakdown[row.type]!.granted += row._count._all;
    else breakdown[row.type]!.denied += row._count._all;
    breakdown[row.type]!.total += row._count._all;
  }
  return c.json({ totalConsents: total, totalUsers: users, breakdown });
});

const exportQuerySchema = z.object({});

adminPrivacyRoutes.get('/export/:userId', async (c) => {
  const userId = c.req.param('userId');
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      wallet: true,
      orders: { include: { items: { include: { product: true } } } },
      payments: true,
      sessions: true,
      consentRecords: true,
      productKeys: { where: { usedById: userId } },
    },
  });
  if (!user) return c.json({ error: 'Kullanıcı bulunamadı', code: 'USER_NOT_FOUND' }, 404);
  const audit = await prisma.auditLog.findMany({
    where: { OR: [{ actorId: userId }, { targetUserId: userId }] },
    orderBy: { createdAt: 'desc' },
  });
  const payload = {
    exportedAt: new Date().toISOString(),
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      displayName: user.displayName,
      locale: user.locale,
      currency: user.currency,
      role: user.role,
      status: user.status,
      twoFactorEnabled: user.twoFactorEnabled,
      isAdult: user.isAdult,
      marketingOptIn: user.marketingOptIn,
      referralCode: user.referralCode,
      referredById: user.referredById,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      lastLoginAt: user.lastLoginAt,
    },
    wallet: user.wallet,
    orders: user.orders,
    payments: user.payments,
    sessions: user.sessions.map((s: (typeof user.sessions)[number]) => ({
      id: s.id,
      userAgent: s.userAgent,
      ipAddress: s.ipAddress,
      createdAt: s.createdAt,
      expiresAt: s.expiresAt,
    })),
    consentRecords: user.consentRecords,
    productKeys: user.productKeys,
    audit: audit.map((a: (typeof audit)[number]) => ({
      id: a.id,
      action: a.action,
      targetType: a.targetType,
      targetId: a.targetId,
      payload: a.payload,
      ipAddress: a.ipAddress,
      userAgent: a.userAgent,
      createdAt: a.createdAt,
    })),
  };
  const admin = c.get('user');
  const meta = getRequestMeta(c);
  await auditRepository.log({
    actorId: admin.sub,
    targetUserId: userId,
    action: 'CREATE',
    targetType: 'privacy_export',
    targetId: userId,
    payload: { kind: 'kvkk_data_export' },
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
  });
  return c.json(payload);
});

adminPrivacyRoutes.delete('/delete/:userId', async (c) => {
  const userId = c.req.param('userId');
  const admin = c.get('user');
  const meta = getRequestMeta(c);
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return c.json({ error: 'Kullanıcı bulunamadı', code: 'USER_NOT_FOUND' }, 404);
  if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
    return c.json({ error: 'Admin kullanıcılar silinemez', code: 'CANNOT_DELETE_ADMIN' }, 409);
  }
  await prisma.$transaction(async (tx: typeof prisma) => {
    await tx.session.deleteMany({ where: { userId } });
    await tx.walletTransaction.deleteMany({ where: { userId } });
    await tx.consentRecord.updateMany({
      where: { userId },
      data: { userId: null, email: `[deleted:${userId}]@deleted.local` },
    });
    await tx.productKey.updateMany({
      where: { usedById: userId },
      data: { usedById: null, isUsed: false },
    });
    await tx.productKey.updateMany({
      where: { reservedFor: userId },
      data: { reservedFor: null, reservedAt: null },
    });
    await tx.orderItem.updateMany({
      where: { order: { userId } },
      data: { productKeyId: null },
    });
    await tx.order.deleteMany({ where: { userId } });
    await tx.payment.deleteMany({ where: { userId } });
    await tx.wallet.deleteMany({ where: { userId } });
    await tx.userCredential.deleteMany({ where: { userId } });
    await tx.user.delete({ where: { id: userId } });
  });
  await auditRepository.log({
    actorId: admin.sub,
    targetUserId: admin.sub,
    action: 'DELETE',
    targetType: 'user',
    targetId: userId,
    payload: { kind: 'kvkk_hard_delete', email: user.email, username: user.username },
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
  });
  return c.json({ ok: true, deletedUserId: userId });
});
