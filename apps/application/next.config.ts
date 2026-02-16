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
  // COOP/COEP headers required for OPFS-backed SQLite WASM in POS local mode.
  // Only applied to POS routes to avoid breaking external embeds (Supabase, Stripe, etc.).
  async headers() {
    return [
      {
        source: '/pos/:path*',
        headers: [
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
          { key: 'Cross-Origin-Embedder-Policy', value: 'require-corp' },
        ],
      },
    ];
  },
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'date-fns',
      '@clubvantage/ui',
      '@clubvantage/api-client',
    ],
  },
  webpack: (config, { isServer }) => {
    // Enable Web Worker support for SQLite WASM
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
    }
    return config;
  },
};

export default withNextIntl(nextConfig);
