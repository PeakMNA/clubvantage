'use client';

import {
  useGetAllClubFeatureFlagsQuery,
  useGetClubFeatureFlagsQuery,
  useGetTierDefaultsQuery,
  useUpdateClubOperationalFlagMutation,
} from '@clubvantage/api-client/hooks';
import type {
  GetAllClubFeatureFlagsQuery,
  GetClubFeatureFlagsQuery,
  GetTierDefaultsQuery,
} from '@clubvantage/api-client/types';
import { useQueryClient } from '@tanstack/react-query';

/**
 * Hook to fetch all clubs' feature flags (platform admin only).
 * Returns array of clubs with their resolved flags and metadata.
 * Stale time: 2 minutes
 */
export function useAllClubFeatureFlags() {
  return useGetAllClubFeatureFlagsQuery(
    {},
    {
      staleTime: 2 * 60 * 1000, // 2 minutes
    },
  );
}

/**
 * Hook to fetch a specific club's feature flags (platform admin only).
 * Returns resolved flags for the specified club.
 * Stale time: 5 minutes
 */
export function useClubFeatureFlags(clubId: string) {
  return useGetClubFeatureFlagsQuery(
    { clubId },
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      enabled: !!clubId,
    },
  );
}

/**
 * Hook to fetch tier defaults for all subscription tiers.
 * Returns default feature flags for STARTER, PROFESSIONAL, and ENTERPRISE tiers.
 * Stale time: 30 minutes (tier defaults rarely change)
 */
export function useTierDefaults() {
  return useGetTierDefaultsQuery(
    {},
    {
      staleTime: 30 * 60 * 1000, // 30 minutes
    },
  );
}

/**
 * Hook to update an operational flag for a specific club (platform admin only).
 * Invalidates both allClubFeatureFlags and clubFeatureFlags queries on success.
 */
export function useUpdateClubOperationalFlag() {
  const queryClient = useQueryClient();
  const mutation = useUpdateClubOperationalFlagMutation();

  return {
    ...mutation,
    mutate: (variables: { clubId: string; key: string; value: boolean }) =>
      mutation.mutate(variables, {
        onSuccess: (data, variables) => {
          // Invalidate queries to refetch updated flags
          queryClient.invalidateQueries({
            queryKey: ['GetAllClubFeatureFlags'],
          });
          queryClient.invalidateQueries({
            queryKey: ['GetClubFeatureFlags', { clubId: variables.clubId }],
          });
        },
      }),
  };
}

// Type exports for convenience
export type AllClubFeatureFlagsData = GetAllClubFeatureFlagsQuery['allClubFeatureFlags'];
export type ClubFeatureFlagsData = GetClubFeatureFlagsQuery['clubFeatureFlags'];
export type TierDefaultsData = GetTierDefaultsQuery['tierDefaults'];
