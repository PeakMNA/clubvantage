// Tenant configuration and resolution
// Mock implementation — will be replaced with Redis-cached Control Plane lookup

export interface TenantBranding {
  logoUrl: string
  faviconUrl: string
  loginBackgroundUrl?: string
  splashScreenUrl?: string
  appName: string
  shortName: string
  description: string
  welcomeMessage?: string
}

export interface TenantTheme {
  primaryColor: string
  secondaryColor: string
  neutralColor: string
  fontFamily?: string
  borderRadius?: string
}

export interface FeatureFlags {
  golf: {
    enabled: boolean
    guestBooking: boolean
    cartRequest: boolean
    caddyRequest: boolean
  }
  bookings: {
    enabled: boolean
    autoApprove: boolean
  }
  billing: {
    enabled: boolean
    onlinePayments: boolean
    showBalance: boolean
  }
  portal: {
    memberIdQr: boolean
    pushNotifications: boolean
    darkMode: boolean
    languageSwitcher: boolean
    dependentAccess: boolean
  }
}

export interface TenantConfig {
  id: string
  slug: string
  name: string
  tier: 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE'
  hostnames: string[]
  branding: TenantBranding
  theme: TenantTheme
  features: FeatureFlags
  createdAt: Date
  updatedAt: Date
}

// Mock tenant config for Royal Club
const ROYAL_CLUB_CONFIG: TenantConfig = {
  id: 'tenant-001',
  slug: 'royal-club',
  name: 'Royal Club',
  tier: 'ENTERPRISE',
  hostnames: ['localhost:3004', 'royalclub.clubvantage.app'],
  branding: {
    logoUrl: '/icons/icon-192.png',
    faviconUrl: '/favicon.ico',
    loginBackgroundUrl: '/mockup/club-entrance.jpg',
    appName: 'Royal Club',
    shortName: 'Royal Club',
    description: 'Self-service member portal for Royal Club',
    welcomeMessage: 'Welcome back',
  },
  theme: {
    primaryColor: '#f59e0b',
    secondaryColor: '#10b981',
    neutralColor: '#78716c',
    fontFamily: 'DM Sans',
    borderRadius: '0.75rem',
  },
  features: {
    golf: {
      enabled: true,
      guestBooking: true,
      cartRequest: true,
      caddyRequest: false,
    },
    bookings: {
      enabled: true,
      autoApprove: false,
    },
    billing: {
      enabled: true,
      onlinePayments: false,
      showBalance: true,
    },
    portal: {
      memberIdQr: true,
      pushNotifications: true,
      darkMode: false,
      languageSwitcher: true,
      dependentAccess: true,
    },
  },
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2026-02-01'),
}

// In-memory cache (simulates Redis with 5min TTL)
let cachedConfig: TenantConfig | null = null
let cacheTimestamp = 0
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

/**
 * Resolve tenant configuration from hostname.
 * Server-side only — used in middleware and server components.
 */
export async function getTenantConfig(_hostname?: string): Promise<TenantConfig> {
  const now = Date.now()

  if (cachedConfig && now - cacheTimestamp < CACHE_TTL) {
    return cachedConfig
  }

  // Mock: always return Royal Club config
  // Production: lookup from Supabase Control Plane, cache in Redis
  cachedConfig = ROYAL_CLUB_CONFIG
  cacheTimestamp = now

  return cachedConfig
}

/**
 * Get feature flags for the current tenant.
 * Convenience wrapper for server components.
 */
export async function getFeatureFlags(): Promise<FeatureFlags> {
  const config = await getTenantConfig()
  return config.features
}

/**
 * Generate CSS custom properties string from tenant theme.
 * Used by middleware to inject into response headers.
 */
export function generateThemeCSS(theme: TenantTheme): string {
  // Convert hex to HSL for Tailwind compatibility
  return [
    `--color-primary: ${theme.primaryColor}`,
    `--color-secondary: ${theme.secondaryColor}`,
    `--color-neutral: ${theme.neutralColor}`,
    `--font-family: "${theme.fontFamily || 'DM Sans'}", system-ui, sans-serif`,
    `--radius: ${theme.borderRadius || '0.75rem'}`,
  ].join('; ')
}
