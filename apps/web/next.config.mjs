import { withSentryConfig } from '@sentry/nextjs';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    '@cyberlisans/api',
    '@cyberlisans/ui',
    '@cyberlisans/db',
    '@cyberlisans/types',
    '@cyberlisans/validators',
    '@cyberlisans/auth',
    '@cyberlisans/payments',
  ],
  serverExternalPackages: ['@prisma/client', 'prisma'],
  experimental: {
    outputFileTracingIncludes: {
      '/api/[...path]': ['./node_modules/.pnpm/@prisma+client*/**', './node_modules/.prisma/**'],
      '/api/**': ['./node_modules/.pnpm/@prisma+client*/**', './node_modules/.prisma/**'],
    },
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.resolve.fallback = { ...config.resolve.fallback, fs: false };
    }
    return config;
  },
};

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG || 'osllc',
  project: process.env.SENTRY_PROJECT || 'javascript-react',
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: false,
  hideSourceMaps: true,
  widenClientFileUpload: true,
  uploadSourceMaps: true,
  dryRun: false,
});