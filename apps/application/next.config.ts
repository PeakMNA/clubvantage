import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    '@clubvantage/ui',
    '@clubvantage/types',
    '@clubvantage/utils',
    '@clubvantage/i18n',
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
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@clubvantage/ui',
      '@clubvantage/api-client',
    ],
  },
};

export default withNextIntl(nextConfig);
