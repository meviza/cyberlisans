export interface RateLimitConfig {
  windowMs: number;
  max: number;
  keyPrefix: string;
  message?: string;
  code?: string;
}

export interface RateLimitResult {
  allowed: boolean;
  count: number;
  remaining: number;
  resetAt: number;
}

export interface RateLimiterStore {
  hit(key: string, windowMs: number, max: number): RateLimitResult;
  reset(key: string): void;
  stop?(): void;
}

export interface RateLimiterOptions {
  config: RateLimitConfig;
  store: RateLimiterStore;
  keyFn: (identifier: string) => string;
}
