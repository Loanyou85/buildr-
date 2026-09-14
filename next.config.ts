import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typedRoutes: false,
  experimental: {
    // Server Actions carry onboarding answers and step validations.
    serverActions: { bodySizeLimit: '1mb' },
  },
};

export default nextConfig;
