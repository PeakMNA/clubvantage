import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    '@clubvantage/ui',
    '@clubvantage/types',
    '@clubvantage/utils',
    '@clubvantage/database',
  ],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  devIndicators: false,
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
    optimizePackageImports: ['lucide-react', '@clubvantage/ui', 'date-fns', 'qrcode.react'],
  },
};

export default nextConfig;
