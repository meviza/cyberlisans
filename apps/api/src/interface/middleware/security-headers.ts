import { secureHeaders } from 'hono/secure-headers';
import type { MiddlewareHandler } from 'hono';

const CSP_DIRECTIVES = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' https: data:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join('; ');

export function securityHeaders(): MiddlewareHandler {
  return async (c, next) => {
    await next();
    c.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload', {
      append: false,
    });
    c.header('X-Frame-Options', 'DENY', { append: false });
    c.header('X-Content-Type-Options', 'nosniff', { append: false });
    c.header('Referrer-Policy', 'strict-origin-when-cross-origin', { append: false });
    c.header('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), interest-cohort=()', {
      append: false,
    });
    c.header('Content-Security-Policy', CSP_DIRECTIVES, { append: false });
    c.header('Cross-Origin-Opener-Policy', 'same-origin', { append: false });
    c.header('Cross-Origin-Resource-Policy', 'same-origin', { append: false });
    c.res.headers.delete('Server');
    c.res.headers.delete('X-Powered-By');
  };
}

export function honoSecureHeaders(): MiddlewareHandler {
  return secureHeaders({
    strictTransportSecurity: 'max-age=31536000; includeSubDomains; preload',
    xFrameOptions: 'DENY',
    xContentTypeOptions: 'nosniff',
    referrerPolicy: 'strict-origin-when-cross-origin',
    permissionsPolicy: {
      camera: [],
      microphone: [],
      geolocation: [],
    },
    crossOriginOpenerPolicy: 'same-origin',
    crossOriginResourcePolicy: 'same-origin',
    originAgentCluster: '?1',
  });
}
