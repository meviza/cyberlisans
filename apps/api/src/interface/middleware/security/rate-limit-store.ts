import type { RateLimiterStore, RateLimitResult } from './rate-limit-types';

interface Bucket {
  count: number;
  resetAt: number;
}

export class InMemoryRateLimiterStore implements RateLimiterStore {
  private buckets = new Map<string, Bucket>();
  private interval: NodeJS.Timeout | null = null;

  constructor(private readonly gcIntervalMs = 5 * 60_000) {
    if (typeof process !== 'undefined' && process.env['NODE_ENV'] !== 'test') {
      this.interval = setInterval(() => this.gc(), this.gcIntervalMs);
      this.interval.unref?.();
    }
  }

  hit(key: string, windowMs: number, max: number): RateLimitResult {
    const now = Date.now();
    const bucket = this.buckets.get(key);
    if (!bucket || bucket.resetAt < now) {
      const resetAt = now + windowMs;
      this.buckets.set(key, { count: 1, resetAt });
      return { allowed: true, count: 1, remaining: max - 1, resetAt };
    }
    if (bucket.count >= max) {
      return { allowed: false, count: bucket.count, remaining: 0, resetAt: bucket.resetAt };
    }
    bucket.count += 1;
    return {
      allowed: true,
      count: bucket.count,
      remaining: Math.max(0, max - bucket.count),
      resetAt: bucket.resetAt,
    };
  }

  reset(key: string): void {
    this.buckets.delete(key);
  }

  stop(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    this.buckets.clear();
  }

  private gc(): void {
    const now = Date.now();
    for (const [k, b] of this.buckets) {
      if (b.resetAt < now) this.buckets.delete(k);
    }
  }
}

export class RedisRateLimiterStore implements RateLimiterStore {
  constructor(
    private readonly redis: {
      eval(script: string, numKeys: number, ...args: (string | number)[]): Promise<unknown>;
    },
  ) {}

  async hitAsync(key: string, windowMs: number, max: number): Promise<RateLimitResult> {
    const lua = `
      local current = redis.call('INCR', KEYS[1])
      if current == 1 then
        redis.call('PEXPIRE', KEYS[1], ARGV[1])
      end
      local ttl = redis.call('PTTL', KEYS[1])
      return { current, ttl }
    `;
    const result = (await this.redis.eval(lua, 1, key, windowMs)) as [number, number];
    const [count, ttl] = result;
    const resetAt = Date.now() + Math.max(ttl, 0);
    const allowed = count <= max;
    return {
      allowed,
      count,
      remaining: Math.max(0, max - count),
      resetAt,
    };
  }

  hit(): RateLimitResult {
    throw new Error('Use hitAsync for RedisRateLimiterStore');
  }

  reset(): void {}
}
