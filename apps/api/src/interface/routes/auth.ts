import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  enable2FASchema,
} from '../../infrastructure/validators';
import { authMiddleware } from '../../infrastructure/auth';
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { ZodError } from 'zod';

import { getRequestMeta } from '../middleware/request-meta';
import { createRateLimiter, RATE_LIMIT_CONFIGS } from '../middleware/security/rate-limit';
import { registerUserGeneric } from '../../domain/usecases/auth/register-user';
import { loginUser } from '../../domain/usecases/auth/login-user';
import { refreshToken } from '../../domain/usecases/auth/refresh-token';
import { logout } from '../../domain/usecases/auth/logout';
import { verifyEmail } from '../../domain/usecases/auth/verify-email';
import { requestPasswordReset } from '../../domain/usecases/auth/request-password-reset';
import { resetPassword } from '../../domain/usecases/auth/reset-password';
import { enable2FA } from '../../domain/usecases/auth/enable-2fa';
import { verify2FA } from '../../domain/usecases/auth/verify-2fa';
import { disable2FA } from '../../domain/usecases/auth/disable-2fa';
import {
  EmailAlreadyExistsError,
  UsernameTakenError,
  InvalidCredentialsError,
  AccountLockedError,
  AccountBannedError,
  AccountPendingError,
  TwoFactorRequiredError,
  InvalidTwoFactorError,
  InvalidReferralError,
  AgeRestrictionError,
  EmailNotVerifiedError,
  InvalidTokenError,
  UserNotFoundError,
  MissingConsentError,
  TwoFactorMandatoryError,
} from '../../domain/errors';

export const authRoutes = new Hono();

const registerRateLimit = createRateLimiter({ config: RATE_LIMIT_CONFIGS.register });
const loginRateLimit = createRateLimiter({ config: RATE_LIMIT_CONFIGS.login });
const forgotRateLimit = createRateLimiter({ config: RATE_LIMIT_CONFIGS.forgotPassword });
const resetRateLimit = createRateLimiter({ config: RATE_LIMIT_CONFIGS.resetPassword });
const verifyEmailRateLimit = createRateLimiter({ config: RATE_LIMIT_CONFIGS.verifyEmail });
const twoFactorRateLimit = createRateLimiter({ config: RATE_LIMIT_CONFIGS.twoFactor });

authRoutes.use('*', async (c, next) => {
  try {
    await next();
  } catch (err) {
    return handleAuthError(c, err);
  }
});

authRoutes.post('/register', registerRateLimit, zValidator('json', registerSchema), async (c) => {
  const body = c.req.valid('json');
  const meta = getRequestMeta(c);
  const result = await registerUserGeneric(body, meta);
  return c.json(result, 201);
});

authRoutes.post('/login', loginRateLimit, zValidator('json', loginSchema), async (c) => {
  const body = c.req.valid('json');
  const meta = getRequestMeta(c);
  const result = await loginUser(body, meta);
  return c.json(result, 200);
});

authRoutes.post('/refresh', async (c) => {
  const body = await c.req.json().catch(() => null);
  const token = body?.refreshToken as string | undefined;
  if (!token) return c.json({ error: 'refreshToken gerekli' }, 400);
  const meta = getRequestMeta(c);
  const result = await refreshToken(token, meta);
  return c.json(result, 200);
});

authRoutes.post('/logout', authMiddleware, async (c) => {
  const user = c.get('user');
  const body = await c.req.json().catch(() => null);
  const token = body?.refreshToken as string | undefined;
  const meta = getRequestMeta(c);
  await logout(token, user.sub, meta);
  return c.json({ message: 'Çıkış yapıldı' }, 200);
});

authRoutes.post(
  '/forgot-password',
  forgotRateLimit,
  zValidator('json', forgotPasswordSchema),
  async (c) => {
    const body = c.req.valid('json');
    const meta = getRequestMeta(c);
    const result = await requestPasswordReset(body.email, meta);
    return c.json(result, 200);
  },
);

authRoutes.post(
  '/reset-password',
  resetRateLimit,
  zValidator('json', resetPasswordSchema),
  async (c) => {
    const body = c.req.valid('json');
    const meta = getRequestMeta(c);
    const result = await resetPassword(body, meta);
    return c.json(result, 200);
  },
);

authRoutes.get('/verify-email', verifyEmailRateLimit, async (c) => {
  const token = c.req.query('token');
  if (!token) return c.json({ error: 'token gerekli' }, 400);
  const parsed = verifyEmailSchema.safeParse({ token });
  if (!parsed.success) return c.json({ error: 'Geçersiz token' }, 400);
  const meta = getRequestMeta(c);
  await verifyEmail(parsed.data.token, meta);
  return c.json({ message: 'E-posta doğrulandı' }, 200);
});

authRoutes.post('/2fa/setup', authMiddleware, async (c) => {
  const user = c.get('user');
  const meta = getRequestMeta(c);
  const result = await enable2FA(user.sub, meta);
  return c.json(result, 200);
});

authRoutes.post(
  '/2fa/verify',
  authMiddleware,
  twoFactorRateLimit,
  zValidator('json', enable2FASchema),
  async (c) => {
    const user = c.get('user');
    const body = c.req.valid('json');
    const meta = getRequestMeta(c);
    const result = await verify2FA(user.sub, body, meta);
    return c.json(result, 200);
  },
);

authRoutes.post('/2fa/disable', authMiddleware, twoFactorRateLimit, async (c) => {
  const user = c.get('user');
  const body = await c.req.json().catch(() => null);
  if (!body?.password) return c.json({ error: 'password gerekli' }, 400);
  const meta = getRequestMeta(c);
  const result = await disable2FA(user.sub, { password: body.password }, meta);
  return c.json(result, 200);
});

async function handleAuthError(c: any, err: unknown) {
  if (err instanceof ZodError) {
    return c.json({ error: 'Validation', code: 'VALIDATION_ERROR', issues: err.issues }, 400);
  }
  if (err instanceof EmailAlreadyExistsError)
    return c.json({ error: err.message, code: err.code }, 409);
  if (err instanceof UsernameTakenError) return c.json({ error: err.message, code: err.code }, 409);
  if (err instanceof InvalidCredentialsError)
    return c.json({ error: err.message, code: err.code }, 401);
  if (err instanceof AccountLockedError) return c.json({ error: err.message, code: err.code }, 403);
  if (err instanceof AccountBannedError) return c.json({ error: err.message, code: err.code }, 403);
  if (err instanceof AccountPendingError)
    return c.json({ error: err.message, code: err.code }, 403);
  if (err instanceof TwoFactorRequiredError)
    return c.json({ error: err.message, code: err.code }, 401);
  if (err instanceof TwoFactorMandatoryError)
    return c.json({ error: err.message, code: err.code }, 403);
  if (err instanceof InvalidTwoFactorError)
    return c.json({ error: err.message, code: err.code }, 401);
  if (err instanceof InvalidReferralError)
    return c.json({ error: err.message, code: err.code }, 400);
  if (err instanceof AgeRestrictionError)
    return c.json({ error: err.message, code: err.code }, 403);
  if (err instanceof EmailNotVerifiedError)
    return c.json({ error: err.message, code: err.code }, 403);
  if (err instanceof InvalidTokenError) return c.json({ error: err.message, code: err.code }, 400);
  if (err instanceof UserNotFoundError) return c.json({ error: err.message, code: err.code }, 404);
  if (err instanceof MissingConsentError)
    return c.json({ error: err.message, code: err.code }, 400);
  console.error('[AUTH ERROR]', err);
  return c.json({ error: 'Bir hata oluştu, lütfen tekrar deneyin', code: 'INTERNAL_ERROR' }, 500);
}
