'use client';

import type { ReactNode } from 'react';
import { useIsFeatureEnabled } from '@/hooks/use-feature-flags';

interface FeatureGateProps {
  featureKey: string;
  children: ReactNode;
  fallback?: ReactNode;
}

export function FeatureGate({ featureKey, children, fallback = null }: FeatureGateProps) {
  const { data, isLoading } = useIsFeatureEnabled(featureKey);

  if (isLoading) return null;

  if (!data?.isFeatureEnabled) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
