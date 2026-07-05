import * as Sentry from '@sentry/node';
import { honoIntegration, setupHonoErrorHandler } from '@sentry/node';
import type { Hono } from 'hono';

let initialized = false;

export function initSentry(): void {
  if (initialized) return;
  initialized = true;

  Sentry.init({
    dsn: process.env['SENTRY_DSN'] || undefined,
    tracesSampleRate: 0.1,
    environment: process.env['NODE_ENV'],
    integrations: [honoIntegration()],
    beforeSend(event) {
      if (event.user) {
        delete event.user.ip_address;
      }
      return event;
    },
    beforeSendTransaction(event) {
      if (event.user) {
        delete event.user.ip_address;
      }
      return event;
    },
  });
}

export function bindSentryErrorHandler(app: Hono): void {
  setupHonoErrorHandler(app as unknown as { use: Hono['use'] });
}

export {
  captureApiError,
  captureAuthFailure,
  captureEscrowEvent,
  addBreadcrumb,
} from './lib/sentry-helpers.ts';

export { Sentry };
