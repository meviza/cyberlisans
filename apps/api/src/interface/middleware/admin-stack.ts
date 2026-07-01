import { authMiddleware, requireAdmin, requireTwoFactor } from '../../infrastructure/auth';
import { createRateLimiter, RATE_LIMIT_CONFIGS } from './security/rate-limit';
import { userTwoFactorRepository } from '../../infrastructure/repositories/user-two-factor.repository';
import { errorHandler } from './error-handler';
import type { MiddlewareHandler } from 'hono';

export function createAdminStack(): MiddlewareHandler[] {
  const rateLimit = createRateLimiter({ config: RATE_LIMIT_CONFIGS.admin });
  const twoFactorGuard = requireTwoFactor(async (userId: string) => {
    const rec = await userTwoFactorRepository.findByUserId(userId);
    return rec?.enabled === true;
  });
  return [authMiddleware, requireAdmin(), rateLimit, twoFactorGuard];
}

export { errorHandler };
