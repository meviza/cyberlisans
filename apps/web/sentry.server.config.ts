import * as Sentry from '@sentry/nextjs';

const dsn = process.env['NEXT_PUBLIC_SENTRY_DSN'];

Sentry.init({
  dsn: dsn || undefined,
  tracesSampleRate: 0.1,
  environment: process.env['NODE_ENV'],
  beforeSendTransaction(event) {
    if (event.user) {
      delete event.user.ip_address;
    }
    return event;
  },
});
