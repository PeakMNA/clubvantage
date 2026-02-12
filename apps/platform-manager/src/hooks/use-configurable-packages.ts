'use client';

import {
  useGetFeatureDefinitionsQuery,
  useGetVerticalsQuery,
  useGetVerticalQuery,
  useGetPackagesQuery,
  useGetPackageQuery,
  useGetClubPackageQuery,
  useGetClubAddonsQuery,
  useCreateFeatureDefinitionMutation,
  useUpdateFeatureDefinitionMutation,
  useCreateVerticalMutation,
  useUpdateVerticalMutation,
  useCreatePackageMutation,
  useUpdatePackageMutation,
  useSetPackageFeaturesMutation,
  useAssignClubPackageMutation,
  useAddClubAddonMutation,
  useRemoveClubAddonMutation,
} from '@clubvantage/api-client/hooks';
import type { FeatureCategory } from '@clubvantage/api-client/types';
import { useQueryClient } from '@tanstack/react-query';

// ============================================================================
// FEATURE DEFINITIONS
// ============================================================================

export function useFeatureDefinitions(category?: FeatureCategory) {
  return useGetFeatureDefinitionsQuery(
    { category },
    { staleTime: 5 * 60 * 1000 },
  );
}

export function useCreateFeatureDefinition() {
  const queryClient = useQueryClient();
  const mutation = useCreateFeatureDefinitionMutation();
  return {
    ...mutation,
    mutateAsync: (variables: Parameters<typeof mutation.mutateAsync>[0]) =>
      mutation.mutateAsync(variables, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['GetFeatureDefinitions'] });
        },
      }),
  };
}

export function useUpdateFeatureDefinition() {
  const queryClient = useQueryClient();
  const mutation = useUpdateFeatureDefinitionMutation();
  return {
    ...mutation,
    mutateAsync: (variables: Parameters<typeof mutation.mutateAsync>[0]) =>
      mutation.mutateAsync(variables, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['GetFeatureDefinitions'] });
        },
      }),
  };
}

// ============================================================================
// VERTICALS
// ============================================================================

export function useVerticals() {
  return useGetVerticalsQuery({}, { staleTime: 5 * 60 * 1000 });
}

export function useVertical(id: string) {
  return useGetVerticalQuery({ id }, { staleTime: 5 * 60 * 1000, enabled: !!id });
}

export function useCreateVertical() {
  const queryClient = useQueryClient();
  const mutation = useCreateVerticalMutation();
  return {
    ...mutation,
    mutateAsync: (variables: Parameters<typeof mutation.mutateAsync>[0]) =>
      mutation.mutateAsync(variables, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['GetVerticals'] });
        },
      }),
  };
}

export function useUpdateVertical() {
  const queryClient = useQueryClient();
  const mutation = useUpdateVerticalMutation();
  return {
    ...mutation,
    mutateAsync: (variables: Parameters<typeof mutation.mutateAsync>[0]) =>
      mutation.mutateAsync(variables, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['GetVerticals'] });
          queryClient.invalidateQueries({ queryKey: ['GetVertical'] });
        },
      }),
  };
}

// ============================================================================
// PACKAGES
// ============================================================================

export function usePackages(verticalId?: string) {
  return useGetPackagesQuery(
    { verticalId },
    { staleTime: 5 * 60 * 1000 },
  );
}

export function usePackage(id: string) {
  return useGetPackageQuery({ id }, { staleTime: 5 * 60 * 1000, enabled: !!id });
}

export function useCreatePackage() {
  const queryClient = useQueryClient();
  const mutation = useCreatePackageMutation();
  return {
    ...mutation,
    mutateAsync: (variables: Parameters<typeof mutation.mutateAsync>[0]) =>
      mutation.mutateAsync(variables, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['GetPackages'] });
          queryClient.invalidateQueries({ queryKey: ['GetVerticals'] });
        },
      }),
  };
}

export function useUpdatePackage() {
  const queryClient = useQueryClient();
  const mutation = useUpdatePackageMutation();
  return {
    ...mutation,
    mutateAsync: (variables: Parameters<typeof mutation.mutateAsync>[0]) =>
      mutation.mutateAsync(variables, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['GetPackages'] });
          queryClient.invalidateQueries({ queryKey: ['GetPackage'] });
          queryClient.invalidateQueries({ queryKey: ['GetVerticals'] });
        },
      }),
  };
}

export function useSetPackageFeatures() {
  const queryClient = useQueryClient();
  const mutation = useSetPackageFeaturesMutation();
  return {
    ...mutation,
    mutateAsync: (variables: Parameters<typeof mutation.mutateAsync>[0]) =>
      mutation.mutateAsync(variables, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['GetPackage'] });
          queryClient.invalidateQueries({ queryKey: ['GetPackages'] });
        },
      }),
  };
}

// ============================================================================
// CLUB PACKAGE & ADD-ONS
// ============================================================================

export function useClubPackage(clubId: string) {
  return useGetClubPackageQuery(
    { clubId },
    { staleTime: 5 * 60 * 1000, enabled: !!clubId },
  );
}

export function useAssignClubPackage() {
  const queryClient = useQueryClient();
  const mutation = useAssignClubPackageMutation();
  return {
    ...mutation,
    mutateAsync: (variables: Parameters<typeof mutation.mutateAsync>[0]) =>
      mutation.mutateAsync(variables, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['GetClubPackage'] });
          queryClient.invalidateQueries({ queryKey: ['GetAllClubFeatureFlags'] });
        },
      }),
  };
}

export function useClubAddons(clubId: string) {
  return useGetClubAddonsQuery(
    { clubId },
    { staleTime: 5 * 60 * 1000, enabled: !!clubId },
  );
}

export function useAddClubAddon() {
  const queryClient = useQueryClient();
  const mutation = useAddClubAddonMutation();
  return {
    ...mutation,
    mutateAsync: (variables: Parameters<typeof mutation.mutateAsync>[0]) =>
      mutation.mutateAsync(variables, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['GetClubAddons'] });
          queryClient.invalidateQueries({ queryKey: ['GetAllClubFeatureFlags'] });
        },
      }),
  };
}

export function useRemoveClubAddon() {
  const queryClient = useQueryClient();
  const mutation = useRemoveClubAddonMutation();
  return {
    ...mutation,
    mutateAsync: (variables: Parameters<typeof mutation.mutateAsync>[0]) =>
      mutation.mutateAsync(variables, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['GetClubAddons'] });
          queryClient.invalidateQueries({ queryKey: ['GetAllClubFeatureFlags'] });
        },
      }),
  };
}
