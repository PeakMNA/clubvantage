import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@clubvantage/ui', '@clubvantage/utils', '@clubvantage/types'],
  experimental: {
    // Enable server actions
  },
};

export default nextConfig;
