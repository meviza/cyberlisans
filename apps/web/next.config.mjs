import { withSentryConfig } from '@sentry/nextjs';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: '/dashboard/admin/disputes',
        destination: '/admin/disputes',
        permanent: false,
      },
      {
        source: '/dashboard/admin/disputes/:id',
        destination: '/admin/disputes/:id',
        permanent: false,
      },
      {
        source: '/dashboard/admin/escrow',
        destination: '/admin/escrow',
        permanent: false,
      },
      {
        source: '/dashboard/admin/products',
        destination: '/admin/product-approvals',
        permanent: false,
      },
      {
        source: '/dashboard/admin/products/:id',
        destination: '/admin/product-approvals/:id',
        permanent: false,
      },
    ];
  },
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
  outputFileTracingIncludes: {
    '/api/[...path]': ['./node_modules/.pnpm/@prisma+client*/**', './node_modules/.prisma/**'],
    '/api/**': ['./node_modules/.pnpm/@prisma+client*/**', './node_modules/.prisma/**'],
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