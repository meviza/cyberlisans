import { cors } from 'hono/cors';
import type { MiddlewareHandler } from 'hono';

export interface CorsConfig {
  origins: string[];
  credentials: boolean;
  preflightMaxAge: number;
}

function parseOrigins(raw: string | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
}

export function getCorsConfig(): CorsConfig {
  const origins = parseOrigins(process.env['CYBERLISANS_ALLOWED_ORIGINS']);
  const fallback = process.env['NEXT_PUBLIC_APP_URL'] ?? 'http://localhost:3000';
  const adminOrigin = process.env['CYBERLISANS_ADMIN_URL'] ?? 'http://localhost:3002';
  const dealerOrigin = process.env['CYBERLISANS_DEALER_URL'] ?? 'http://localhost:3003';
  const all = origins.length > 0 ? origins : [fallback, adminOrigin, dealerOrigin];
  const isProd = process.env['NODE_ENV'] === 'production';
  return {
    origins: Array.from(new Set(all)),
    credentials: true,
    preflightMaxAge: isProd ? 24 * 60 * 60 : 60 * 60,
  };
}

export function createCorsMiddleware(): MiddlewareHandler {
  const config = getCorsConfig();
  return cors({
    origin: (origin, c) => {
      if (!origin) {
        const allowedNoOrigin = config.origins.includes('*');
        return allowedNoOrigin ? '*' : (config.origins[0] ?? '');
      }
      if (config.origins.includes('*')) return '*';
      return config.origins.includes(origin) ? origin : (config.origins[0] ?? '');
    },
    credentials: config.credentials,
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'X-CSRF-Token',
      'X-2FA-Token',
    ],
    exposeHeaders: [
      'X-RateLimit-Limit',
      'X-RateLimit-Remaining',
      'X-RateLimit-Reset',
      'Retry-After',
    ],
    maxAge: config.preflightMaxAge,
  });
}
