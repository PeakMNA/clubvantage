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
  experimental: {
    optimizePackageImports: ['lucide-react', '@clubvantage/ui', 'date-fns', 'qrcode.react'],
  },
};

export default nextConfig;
