'use client';

import {
  useGetClubProfileQuery,
  useGetBillingSettingsQuery,
  useUpdateClubProfileMutation,
  useUpdateBillingSettingsMutation,
} from '@clubvantage/api-client/hooks';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

export function useClubProfile() {
  return useGetClubProfileQuery();
}

export function useBillingSettings() {
  return useGetBillingSettingsQuery();
}

export function useUpdateClubProfile() {
  const queryClient = useQueryClient();
  const mutation = useUpdateClubProfileMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['GetClubProfile'] });
    },
  });

  const updateClubProfile = useCallback(
    (input: Record<string, unknown>) => mutation.mutateAsync({ input }),
    [mutation],
  );

  return { updateClubProfile, ...mutation };
}

export function useUpdateBillingSettings() {
  const queryClient = useQueryClient();
  const mutation = useUpdateBillingSettingsMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['GetBillingSettings'] });
    },
  });

  const updateBillingSettings = useCallback(
    (input: Record<string, unknown>) => mutation.mutateAsync({ input }),
    [mutation],
  );

  return { updateBillingSettings, ...mutation };
}
