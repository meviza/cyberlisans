/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@cyberlisans/ui', '@cyberlisans/db', '@cyberlisans/types', '@cyberlisans/validators'],
};

export default nextConfig;