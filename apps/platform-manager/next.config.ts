import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@clubvantage/ui', '@clubvantage/utils', '@clubvantage/types'],
  // Proxy GraphQL requests through Next.js so HttpOnly auth cookies are sent same-origin.
  // Without this, cookies set on :3000 won't be sent to :3001 cross-origin.
  async rewrites() {
    const apiUrl = process.env.API_URL || 'http://localhost:3001';
    return [
      {
        source: '/graphql',
        destination: `${apiUrl}/graphql`,
      },
    ];
  },
  experimental: {
    // Enable server actions
  },
};

export default nextConfig;
