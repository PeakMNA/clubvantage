// Client-side feature flag access
// Server components should use getFeatureFlags() from @/lib/tenant directly

'use client'

import { createContext, useContext } from 'react'
import type { FeatureFlags } from '@/lib/tenant'

const FeatureFlagsContext = createContext<FeatureFlags | null>(null)

export const FeatureFlagsProvider = FeatureFlagsContext.Provider

export function useFeatureFlags(): FeatureFlags {
  const flags = useContext(FeatureFlagsContext)
  if (!flags) {
    throw new Error('useFeatureFlags must be used within FeatureFlagsProvider')
  }
  return flags
}
