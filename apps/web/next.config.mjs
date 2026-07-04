import path from 'node:path';
import { createRequire } from 'node:module';
import fs from 'node:fs';

const require = createRequire(import.meta.url);

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

export default nextConfig;