/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  transpilePackages: ['@fitai/shared'],
};

module.exports = nextConfig;
