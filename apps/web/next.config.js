/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  transpilePackages: ['@fitai/shared'],
  typescript: {
    // Type checking done in CI via tsc; don't block Docker build
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
