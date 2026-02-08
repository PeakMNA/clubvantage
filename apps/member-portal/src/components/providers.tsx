'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React, { useState, createContext, useContext, useMemo, useCallback } from 'react'
import { ThemeProvider } from 'next-themes'
import { useRouter } from 'next/navigation'
import { FeatureFlagsProvider } from '@/lib/features'
import { ToastProvider } from '@/components/portal/toast'
import type { FeatureFlags } from '@/lib/tenant'

export interface AuthUser {
  userId: string
  memberId: string
  clubId: string
  email: string
  firstName: string
  lastName: string
  role: string
}

interface AuthContextValue {
  user: AuthUser | null
  isAuthenticated: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function AuthProvider({
  children,
  user,
}: {
  children: React.ReactNode
  user: AuthUser | null
}) {
  const router = useRouter()

  const signOut = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }, [router])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: !!user,
      signOut,
    }),
    [user, signOut]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider')
  }
  return context
}

// Default feature flags
const DEFAULT_FEATURES: FeatureFlags = {
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
}

interface ProvidersProps {
  children: React.ReactNode
  featureFlags?: FeatureFlags
  user?: AuthUser | null
}

export function Providers({ children, featureFlags, user }: ProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  )

  const flags = featureFlags ?? DEFAULT_FEATURES

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider user={user ?? null}>
        <FeatureFlagsProvider value={flags}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange={false}
            storageKey="clubvantage-member-theme"
          >
            <ToastProvider>
              {children}
            </ToastProvider>
          </ThemeProvider>
        </FeatureFlagsProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}
