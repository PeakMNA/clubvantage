'use client';

import {
  useGetFeatureFlagsQuery,
  useIsFeatureEnabledQuery,
  useUpdateOperationalFlagMutation,
} from '@clubvantage/api-client/hooks';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

export function useFeatureFlags() {
  return useGetFeatureFlagsQuery(undefined, {
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes (matches Redis TTL)
  });
}

export function useIsFeatureEnabled(featureKey: string) {
  return useIsFeatureEnabledQuery(
    { featureKey },
    {
      enabled: !!featureKey,
      staleTime: 5 * 60 * 1000,
    },
  );
}

export function useUpdateOperationalFlag() {
  const queryClient = useQueryClient();
  const mutation = useUpdateOperationalFlagMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['GetFeatureFlags'] });
      queryClient.invalidateQueries({ queryKey: ['IsFeatureEnabled'] });
    },
  });

  const updateFlag = useCallback(
    (key: string, value: boolean) => mutation.mutateAsync({ key, value }),
    [mutation],
  );

  return { updateFlag, ...mutation };
}
