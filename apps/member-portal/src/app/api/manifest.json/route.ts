import { getTenantConfig } from '@/lib/tenant'

export async function GET() {
  const tenant = await getTenantConfig()

  const manifest = {
    name: tenant.branding.appName,
    short_name: tenant.branding.shortName,
    description: tenant.branding.description,
    start_url: '/portal',
    display: 'standalone' as const,
    background_color: '#ffffff',
    theme_color: '#fafaf9',
    orientation: 'portrait' as const,
    icons: [
      {
        src: tenant.branding.logoUrl || '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    categories: ['lifestyle', 'sports'],
    shortcuts: [
      {
        name: 'Book Tee Time',
        url: '/portal/golf/browse',
        icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }],
      },
      {
        name: 'Member ID',
        url: '/portal/member-id',
        icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }],
      },
    ],
  }

  return Response.json(manifest, {
    headers: {
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
