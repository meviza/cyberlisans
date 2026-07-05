import * as Sentry from '@sentry/node';

export type ApiErrorTag =
  | 'AUTH_ERROR'
  | 'ESCROW_ERROR'
  | 'PAYMENT_ERROR'
  | 'VALIDATION_ERROR'
  | 'RATE_LIMIT_ERROR'
  | 'UPSTREAM_ERROR'
  | 'INTERNAL_ERROR';

export interface ApiErrorContext {
  route?: string;
  method?: string;
  userId?: string;
  requestId?: string;
  statusCode?: number;
  extra?: Record<string, unknown>;
}

function toError(err: unknown): Error {
  if (err instanceof Error) return err;
  if (typeof err === 'string') return new Error(err);
  try {
    return new Error(JSON.stringify(err));
  } catch {
    return new Error('Unknown error');
  }
}

export function captureApiError(
  error: unknown,
  context: ApiErrorContext & { tag?: ApiErrorTag } = {},
): string {
  const err = toError(error);
  const tag = context.tag ?? classifyError(err, context.statusCode);

  return Sentry.withScope((scope) => {
    scope.setTag('error_category', tag);
    if (context.route) scope.setTag('route', context.route);
    if (context.method) scope.setTag('http.method', context.method);
    if (context.statusCode) scope.setTag('http.status_code', String(context.statusCode));
    if (context.userId) scope.setUser({ id: context.userId });
    if (context.requestId) scope.setTag('request_id', context.requestId);
    if (context.extra) scope.setExtras(context.extra);
    return Sentry.captureException(err);
  });
}

function classifyError(err: Error, statusCode?: number): ApiErrorTag {
  const code = (err as { code?: string }).code;
  if (typeof code === 'string') {
    if (code.startsWith('AUTH_') || code.includes('UNAUTHORIZED') || code.includes('FORBIDDEN')) {
      return 'AUTH_ERROR';
    }
    if (code.includes('ESCROW')) return 'ESCROW_ERROR';
    if (code.includes('PAYMENT')) return 'PAYMENT_ERROR';
    if (code === 'VALIDATION_ERROR') return 'VALIDATION_ERROR';
    if (code.includes('RATE_LIMIT')) return 'RATE_LIMIT_ERROR';
    if (code.includes('UPSTREAM')) return 'UPSTREAM_ERROR';
  }
  if (statusCode === 401 || statusCode === 403) return 'AUTH_ERROR';
  if (statusCode === 400) return 'VALIDATION_ERROR';
  if (statusCode === 429) return 'RATE_LIMIT_ERROR';
  return 'INTERNAL_ERROR';
}

export function captureAuthFailure(
  userId: string | null,
  email: string | null,
  reason: string,
  context: ApiErrorContext = {},
): string {
  return Sentry.withScope((scope) => {
    scope.setTag('error_category', 'AUTH_ERROR');
    scope.setTag('auth.outcome', 'failure');
    scope.setTag('auth.failure_reason', reason);
    scope.setExtras({
      attempted_email: email,
      attempted_user_id: userId,
    });
    if (context.route) scope.setTag('route', context.route);
    if (context.requestId) scope.setTag('request_id', context.requestId);
    return Sentry.captureMessage(`Auth failure: ${reason}`, 'warning');
  });
}

export type EscrowEvent =
  | 'ESCROW_HELD'
  | 'ESCROW_RELEASED'
  | 'ESCROW_REFUNDED'
  | 'ESCROW_DISPUTED'
  | 'ESCROW_RESOLVED';

export function captureEscrowEvent(
  event: EscrowEvent,
  escrowId: string,
  metadata: Record<string, unknown> = {},
): string {
  return Sentry.withScope((scope) => {
    scope.setTag('error_category', 'ESCROW_ERROR');
    scope.setTag('escrow.event', event);
    scope.setTag('escrow.id', escrowId);
    scope.setExtras(metadata);
    const level: Sentry.SeverityLevel = event === 'ESCROW_DISPUTED' ? 'warning' : 'info';
    scope.setLevel(level);
    return Sentry.captureMessage(`Escrow ${event}: ${escrowId}`, level);
  });
}

export function addBreadcrumb(
  category: string,
  message: string,
  data?: Record<string, unknown>,
  level: Sentry.SeverityLevel = 'info',
): void {
  Sentry.addBreadcrumb({
    category,
    message,
    level,
    data,
  });
}
