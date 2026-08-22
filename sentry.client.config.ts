import * as Sentry from '@sentry/nextjs';

/**
 * Sentry browser client config.
 * No-op safe when NEXT_PUBLIC_SENTRY_DSN is not set (dev/CI without creds).
 * DSN placeholder must be supplied by the human in .env.local (never committed).
 */
if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.NODE_ENV ?? 'development',
    tracesSampleRate: 0.1,
    integrations: [Sentry.browserTracingIntegration()],
  });
}