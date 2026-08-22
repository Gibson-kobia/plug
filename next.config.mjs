import { withSentryConfig } from '@sentry/nextjs';

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

const sentryWebpackPluginOptions = {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  // Keep the build green when no Sentry credentials are configured (dev/CI).
  disableServerWebpackPlugin: !process.env.SENTRY_AUTH_TOKEN,
  disableClientWebpackPlugin: !process.env.SENTRY_AUTH_TOKEN,
  hideSourceMaps: true,
  silent: true,
};

const userSentryOptions = {
  // Disable automatic middleware wrapping to prevent Vercel Edge runtime crash
  autoInstrumentMiddleware: false,
  hideSourceMaps: true,
};

let finalConfig = nextConfig;

if (process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN || process.env.SENTRY_AUTH_TOKEN) {
  finalConfig = withSentryConfig(nextConfig, sentryWebpackPluginOptions, userSentryOptions);
}

export default finalConfig;