import type { Context } from 'hono';

export function getRequestMeta(c: Context): { ipAddress?: string; userAgent?: string } {
  const ipAddress =
    c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ??
    c.req.header('x-real-ip') ??
    undefined;
  const userAgent = c.req.header('user-agent') ?? undefined;
  return { ipAddress, userAgent };
}