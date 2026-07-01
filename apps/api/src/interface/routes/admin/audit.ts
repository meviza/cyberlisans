import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { createAdminStack, errorHandler } from '../../middleware/admin-stack';
import { prisma } from '../../../infrastructure/db';

export const adminAuditRoutes = new Hono();

adminAuditRoutes.use('*', ...createAdminStack());

adminAuditRoutes.use('*', async (c, next) => {
  try {
    await next();
  } catch (err) {
    return errorHandler(err, c);
  }
});

const listQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(200).default(50),
  search: z.string().trim().max(200).optional(),
  action: z.string().trim().max(64).optional(),
  actorId: z.string().uuid().optional(),
  targetUserId: z.string().uuid().optional(),
  targetType: z.string().trim().max(64).optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
});

adminAuditRoutes.get('/', zValidator('query', listQuerySchema), async (c) => {
  const q = c.req.valid('query');
  const where: Record<string, unknown> = {};
  if (q.action) where['action'] = q.action;
  if (q.actorId) where['actorId'] = q.actorId;
  if (q.targetUserId) where['targetUserId'] = q.targetUserId;
  if (q.targetType) where['targetType'] = q.targetType;
  if (q.from || q.to) {
    where['createdAt'] = {
      ...(q.from ? { gte: new Date(q.from) } : {}),
      ...(q.to ? { lte: new Date(q.to) } : {}),
    };
  }
  if (q.search) {
    where['OR'] = [
      { actorId: { contains: q.search, mode: 'insensitive' } },
      { targetId: { contains: q.search, mode: 'insensitive' } },
      { targetUserId: { contains: q.search, mode: 'insensitive' } },
      { targetType: { contains: q.search, mode: 'insensitive' } },
    ];
  }
  const txResult = (await prisma.$transaction([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (q.page - 1) * q.limit,
      take: q.limit,
      include: {
        actor: { select: { id: true, email: true, username: true, role: true } },
        targetUser: { select: { id: true, email: true, username: true } },
      },
    }),
    prisma.auditLog.count({ where }),
    prisma.auditLog.groupBy({ by: ['action'], _count: { _all: true } }),
  ])) as [any[], number, Array<{ action: string; _count: { _all: number } }>];
  const items = txResult[0];
  const total = txResult[1];
  const actions = txResult[2];
  return c.json({
    items: items.map((a) => ({
      id: a.id,
      actor: a.actor,
      targetUser: a.targetUser,
      action: a.action,
      targetType: a.targetType,
      targetId: a.targetId,
      payload: a.payload,
      ipAddress: a.ipAddress,
      userAgent: a.userAgent,
      createdAt: a.createdAt,
    })),
    total,
    page: q.page,
    limit: q.limit,
    totalPages: Math.ceil(total / q.limit) || 1,
    actionBreakdown: actions.map((a) => ({ action: a.action, count: a._count._all })),
  });
});

adminAuditRoutes.get('/export', zValidator('query', listQuerySchema), async (c) => {
  const q = c.req.valid('query');
  const where: Record<string, unknown> = {};
  if (q.action) where['action'] = q.action;
  if (q.actorId) where['actorId'] = q.actorId;
  if (q.targetUserId) where['targetUserId'] = q.targetUserId;
  if (q.targetType) where['targetType'] = q.targetType;
  if (q.from || q.to) {
    where['createdAt'] = {
      ...(q.from ? { gte: new Date(q.from) } : {}),
      ...(q.to ? { lte: new Date(q.to) } : {}),
    };
  }
  const items = await prisma.auditLog.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 10000,
  });
  const headers = [
    'id',
    'createdAt',
    'action',
    'actorId',
    'targetUserId',
    'targetType',
    'targetId',
    'ipAddress',
    'userAgent',
    'payload',
  ];
  const escape = (v: unknown): string => {
    if (v === null || v === undefined) return '';
    const s = String(v);
    if (s.includes(',') || s.includes('"') || s.includes('\n')) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };
  const lines = [headers.join(',')];
  for (const a of items) {
    lines.push(
      [
        a.id,
        a.createdAt.toISOString(),
        a.action,
        a.actorId ?? '',
        a.targetUserId ?? '',
        a.targetType ?? '',
        a.targetId ?? '',
        a.ipAddress ?? '',
        a.userAgent ?? '',
        a.payload ? JSON.stringify(a.payload) : '',
      ]
        .map(escape)
        .join(','),
    );
  }
  const body = lines.join('\n');
  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="audit-${new Date().toISOString()}.csv"`,
      'Cache-Control': 'no-store',
    },
  });
});
