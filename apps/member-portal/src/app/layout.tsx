import type { Metadata, Viewport } from 'next'
import { DM_Sans, IBM_Plex_Mono } from 'next/font/google'
import { Providers } from '@/components/providers'
import { ServiceWorkerRegister } from '@/components/portal/sw-register'
import { OfflineBanner } from '@/components/portal/offline-banner'
import { getFeatureFlags } from '@/lib/tenant'
import { getSession } from '@/lib/auth/session'
import '@clubvantage/ui/globals.css'
import './globals.css'

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
})

const ibmPlexMono = IBM_Plex_Mono({
  weight: ['400', '500', '600'],
  subsets: ['latin'],
  variable: '--font-mono',
})

export const metadata: Metadata = {
  title: 'Member Portal | Royal Club',
  description: 'Self-service member portal for Royal Club',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Royal Club',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fafaf9' },
    { media: '(prefers-color-scheme: dark)', color: '#1c1917' },
  ],
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Server-side: resolve feature flags and session
  const [featureFlags, session] = await Promise.all([getFeatureFlags(), getSession()])

  const user = session.isLoggedIn
    ? {
        userId: session.userId,
        memberId: session.memberId,
        clubId: session.clubId,
        email: session.email,
        firstName: session.firstName,
        lastName: session.lastName,
        role: session.role,
      }
    : null

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${dmSans.variable} ${ibmPlexMono.variable} font-sans antialiased bg-background text-foreground`}
      >
        <ServiceWorkerRegister />
        <OfflineBanner />
        <Providers featureFlags={featureFlags} user={user}>{children}</Providers>
      </body>
    </html>
  )
}
