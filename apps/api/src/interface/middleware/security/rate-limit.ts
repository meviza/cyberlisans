import type { Context, MiddlewareHandler, Next } from 'hono';
import { getRequestMeta } from '../request-meta';
import { InMemoryRateLimiterStore } from './rate-limit-store';
import type { RateLimiterStore } from './rate-limit-types';
import type { RateLimitConfig } from './rate-limit-types';

let defaultStore: RateLimiterStore | null = null;

export function getDefaultRateLimiterStore(): RateLimiterStore {
  if (!defaultStore) defaultStore = new InMemoryRateLimiterStore();
  return defaultStore;
}

export function setDefaultRateLimiterStore(store: RateLimiterStore): void {
  defaultStore = store;
}

export interface CreateRateLimiterOptions {
  config: RateLimitConfig;
  store?: RateLimiterStore;
  identifier?: (c: Context) => string | null;
  skipFailed?: boolean;
  skipSuccess?: boolean;
}

export function createRateLimiter(opts: CreateRateLimiterOptions): MiddlewareHandler {
  const { config, store = getDefaultRateLimiterStore() } = opts;
  const identifier = opts.identifier ?? defaultIdentifier;

  return async (c: Context, next: Next) => {
    const id = identifier(c);
    if (!id) {
      await next();
      return;
    }
    const key = `${config.keyPrefix}:${id}`;
    const result = store.hit(key, config.windowMs, config.max);

    c.header('X-RateLimit-Limit', String(config.max));
    c.header('X-RateLimit-Remaining', String(result.remaining));
    c.header('X-RateLimit-Reset', String(Math.ceil(result.resetAt / 1000)));

    if (!result.allowed) {
      const retryAfter = Math.ceil((result.resetAt - Date.now()) / 1000);
      c.header('Retry-After', String(retryAfter));
      return c.json(
        {
          error: config.message ?? 'Çok fazla istek. Lütfen daha sonra tekrar deneyin.',
          code: config.code ?? 'RATE_LIMITED',
          retryAfter,
        },
        429,
      );
    }
    await next();
  };
}

function defaultIdentifier(c: Context): string | null {
  const meta = getRequestMeta(c);
  return meta.ipAddress ?? 'unknown';
}

export function ipAndBodyIdentifier(c: Context): string | null {
  const meta = getRequestMeta(c);
  return meta.ipAddress ?? 'unknown';
}

export function ipAndPathIdentifier(c: Context): string | null {
  const meta = getRequestMeta(c);
  return `${meta.ipAddress ?? 'unknown'}:${c.req.path}`;
}

export const RATE_LIMIT_CONFIGS = {
  login: { windowMs: 15 * 60_000, max: 5, keyPrefix: 'rl:login' },
  register: { windowMs: 60 * 60_000, max: 3, keyPrefix: 'rl:register' },
  forgotPassword: { windowMs: 60 * 60_000, max: 3, keyPrefix: 'rl:forgot' },
  resetPassword: { windowMs: 60 * 60_000, max: 5, keyPrefix: 'rl:reset' },
  verifyEmail: { windowMs: 60 * 60_000, max: 10, keyPrefix: 'rl:verify-email' },
  twoFactor: { windowMs: 15 * 60_000, max: 5, keyPrefix: 'rl:2fa' },
  webhook: { windowMs: 1000, max: 100, keyPrefix: 'rl:webhook' },
  api: { windowMs: 1000, max: 60, keyPrefix: 'rl:api' },
  admin: { windowMs: 60_000, max: 30, keyPrefix: 'rl:admin' },
  dealer: { windowMs: 60_000, max: 60, keyPrefix: 'rl:dealer' },
} satisfies Record<string, RateLimitConfig>;
