import type { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { ZodError } from 'zod';
import { PaymentError } from '@cyberlisans/payments/errors';

export interface ErrorResponse {
  error: string;
  code: string;
  status: number;
  details?: unknown;
}

const GENERIC_500 = 'Bir hata oluştu, lütfen tekrar deneyin';

export function buildErrorResponse(
  err: unknown,
  isProd: boolean,
): {
  response: ErrorResponse;
  status: number;
} {
  if (err instanceof HTTPException) {
    const status = err.status;
    return {
      response: {
        error: err.message || 'İstek hatalı',
        code: `HTTP_${status}`,
        status,
      },
      status,
    };
  }

  if (err instanceof ZodError) {
    return {
      response: {
        error: 'Validation',
        code: 'VALIDATION_ERROR',
        status: 400,
        details: isProd ? undefined : err.issues,
      },
      status: 400,
    };
  }

  if (err instanceof PaymentError) {
    return {
      response: {
        error: err.message,
        code: err.code,
        status: err.statusCode,
      },
      status: err.statusCode,
    };
  }

  if (err && typeof err === 'object' && 'code' in err && 'message' in err) {
    const domainErr = err as { code: string; message: string; statusCode?: number };
    if (typeof domainErr.code === 'string' && typeof domainErr.message === 'string') {
      return {
        response: {
          error: domainErr.message,
          code: domainErr.code,
          status: domainErr.statusCode ?? 400,
        },
        status: domainErr.statusCode ?? 400,
      };
    }
  }

  return {
    response: {
      error: GENERIC_500,
      code: 'INTERNAL_ERROR',
      status: 500,
    },
    status: 500,
  };
}

export function errorHandler(err: unknown, c: Context): Response {
  const isProd = process.env['NODE_ENV'] === 'production';
  const { response, status } = buildErrorResponse(err, isProd);
  if (status >= 500) {
    console.error('[API ERROR]', err);
  }
  return c.json(response, status as 400 | 401 | 403 | 404 | 409 | 429 | 500);
}
