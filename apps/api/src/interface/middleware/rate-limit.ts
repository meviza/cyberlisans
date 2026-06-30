import type { Context, Next } from 'hono';

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

interface Options {
  windowMs?: number;
  max?: number;
  keyBy?: (c: Context) => string;
}

const DEFAULT_OPTS: Required<Options> = {
  windowMs: 60_000,
  max: 30,
  keyBy: (c) => c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ?? c.req.header('x-real-ip') ?? 'global',
};

export function rateLimit(opts: Options = {}) {
  const { windowMs, max, keyBy } = { ...DEFAULT_OPTS, ...opts };

  return async (c: Context, next: Next) => {
    const key = keyBy(c);
    const now = Date.now();
    const bucket = buckets.get(key);

    if (!bucket || bucket.resetAt < now) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      await next();
      return;
    }

    if (bucket.count >= max) {
      const retryAfter = Math.ceil((bucket.resetAt - now) / 1000);
      c.header('Retry-After', String(retryAfter));
      c.header('X-RateLimit-Limit', String(max));
      c.header('X-RateLimit-Remaining', '0');
      c.header('X-RateLimit-Reset', String(Math.ceil(bucket.resetAt / 1000)));
      return c.json({ error: 'Too many requests', code: 'RATE_LIMITED', retryAfter }, 429);
    }

    bucket.count += 1;
    c.header('X-RateLimit-Limit', String(max));
    c.header('X-RateLimit-Remaining', String(Math.max(0, max - bucket.count)));
    await next();
  };
}

setInterval(() => {
  const now = Date.now();
  for (const [k, b] of buckets) {
    if (b.resetAt < now) buckets.delete(k);
  }
}, 5 * 60_000).unref?.();
