import * as Sentry from '@sentry/nextjs';

/**
 * Sentry Node.js (server) config.
 * No-op safe when SENTRY_DSN is not set.
 */
const dsn = process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN;
if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV ?? 'development',
    tracesSampleRate: 0.1,
  });
}