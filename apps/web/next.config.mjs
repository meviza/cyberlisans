import path from 'node:path';
import { createRequire } from 'node:module';

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
};

export default nextConfig;