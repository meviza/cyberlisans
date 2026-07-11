import { Hono } from 'hono';
import { ZodError } from 'zod';
import { authMiddleware } from '../../infrastructure/auth';
import { sessionRepository } from '../../infrastructure/repositories/session.repository';
import { logout, logoutAll, logoutSession } from '../../application/usecases/auth/logout';
import { getRequestMeta } from '../middleware/request-meta';
import { InvalidTokenError } from '../../domain/errors';

export const sessionRoutes = new Hono();

sessionRoutes.use('*', authMiddleware);

sessionRoutes.use('*', async (c, next) => {
  try {
    await next();
  } catch (err) {
    if (err instanceof ZodError) return c.json({ error: 'Validation', issues: err.issues }, 400);
    if (err instanceof InvalidTokenError)
      return c.json({ error: err.message, code: err.code }, 404);
    console.error('[SESSION ERROR]', err);
    return c.json({ error: 'Internal error' }, 500);
  }
});

sessionRoutes.get('/', async (c) => {
  const user = c.get('user');
  const sessions = await sessionRepository.listForUser(user.sub);
  return c.json(
    {
      sessions: sessions.map((s) => ({
        id: s.id,
        userAgent: s.userAgent,
        ipAddress: s.ipAddress,
        createdAt: s.createdAt,
        expiresAt: s.expiresAt,
      })),
      count: sessions.length,
    },
    200,
  );
});

sessionRoutes.delete('/all', async (c) => {
  const user = c.get('user');
  const meta = getRequestMeta(c);
  await logoutAll(user.sub, meta);
  return c.json({ message: 'Tüm oturumlar kapatıldı' }, 200);
});

sessionRoutes.post('/logout', async (c) => {
  const user = c.get('user');
  const body = await c.req.json().catch(() => null);
  const token = body?.refreshToken as string | undefined;
  const meta = getRequestMeta(c);
  await logout(token, user.sub, meta);
  return c.json({ message: 'Çıkış yapıldı' }, 200);
});

sessionRoutes.delete('/:id', async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');
  const meta = getRequestMeta(c);
  await logoutSession(id, user.sub, meta);
  return c.json({ message: 'Oturum silindi' }, 200);
});
