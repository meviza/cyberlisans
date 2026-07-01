import type { Context, Next } from 'hono';
import { verifyAccessToken, type AccessTokenPayload } from './jwt';

declare module 'hono' {
  interface ContextVariableMap {
    user: AccessTokenPayload;
  }
}

export async function authMiddleware(c: Context, next: Next) {
  const header = c.req.header('Authorization');
  if (!header || !header.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized', code: 'NO_TOKEN' }, 401);
  }
  const token = header.substring(7);
  const payload = await verifyAccessToken(token);
  if (!payload) {
    return c.json({ error: 'Invalid or expired token', code: 'INVALID_TOKEN' }, 401);
  }
  c.set('user', payload);
  await next();
}

export function requireRole(...roles: Array<'CUSTOMER' | 'ADMIN' | 'SUPER_ADMIN'>) {
  return async (c: Context, next: Next) => {
    const user = c.get('user');
    if (!user) return c.json({ error: 'Unauthorized' }, 401);
    if (!roles.includes(user.role)) {
      return c.json({ error: 'Forbidden', code: 'INSUFFICIENT_ROLE' }, 403);
    }
    await next();
  };
}

export function requireAdmin() {
  return requireRole('ADMIN', 'SUPER_ADMIN');
}

export function requireSuperAdmin() {
  return requireRole('SUPER_ADMIN');
}

export function requireTwoFactor(isTwoFactorEnabled: (userId: string) => Promise<boolean>) {
  return async (c: Context, next: Next) => {
    const user = c.get('user');
    if (!user) return c.json({ error: 'Unauthorized' }, 401);
    if (user.role === 'CUSTOMER') {
      await next();
      return;
    }
    const enabled = await isTwoFactorEnabled(user.sub);
    if (!enabled) {
      return c.json(
        {
          error: 'Bu hesap için iki faktörlü doğrulama zorunludur.',
          code: '2FA_REQUIRED',
          twoFactorSetupUrl: '/auth/2fa/setup',
        },
        403,
      );
    }
    await next();
  };
}

export function optionalAuth() {
  return async (c: Context, next: Next) => {
    const header = c.req.header('Authorization');
    if (header?.startsWith('Bearer ')) {
      const token = header.substring(7);
      const payload = await verifyAccessToken(token);
      if (payload) c.set('user', payload);
    }
    await next();
  };
}
