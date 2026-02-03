/**
 * Lookup hooks for fetching and managing configurable lookup values
 */

import { useMemo, useCallback } from 'react';
import {
  useGetLookupCategoriesQuery,
  useGetLookupCategoryQuery,
  useGetLookupValuesQuery,
  useGetLookupValueQuery,
  useCreateLookupValueMutation,
  useUpdateLookupValueMutation,
  useDeleteLookupValueMutation,
  useAddLookupTranslationMutation,
  useDeleteLookupTranslationMutation,
  type LookupCategory,
  type LookupValue,
  type LookupTranslation,
  type LookupCategoryFilterInput,
  type CreateLookupValueInput,
  type UpdateLookupValueInput,
  type AddLookupTranslationInput,
} from '@clubvantage/api-client';
import { useQueryClient } from '@tanstack/react-query';

// ============================================================================
// Types
// ============================================================================

export interface LookupCategoryWithValues {
  id: string;
  code: string;
  name: string;
  description?: string;
  isSystem: boolean;
  isGlobal: boolean;
  sortOrder: number;
  valueCount: number;
  values?: LookupValueDisplay[];
}

export interface LookupValueDisplay {
  id: string;
  categoryId: string;
  clubId?: string;
  code: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  sortOrder: number;
  isActive: boolean;
  isDefault: boolean;
  metadata?: Record<string, any>;
  translations?: LookupTranslationDisplay[];
  isGlobal: boolean; // Derived: true if clubId is null
}

export interface LookupTranslationDisplay {
  id: string;
  locale: string;
  name: string;
  description?: string;
}

// ============================================================================
// Transform Functions
// ============================================================================

function transformCategory(cat: any): LookupCategoryWithValues {
  return {
    id: cat.id,
    code: cat.code,
    name: cat.name,
    description: cat.description ?? undefined,
    isSystem: cat.isSystem,
    isGlobal: cat.isGlobal,
    sortOrder: cat.sortOrder,
    valueCount: cat.valueCount ?? 0,
    values: cat.values?.map(transformValue),
  };
}

function transformValue(val: any): LookupValueDisplay {
  return {
    id: val.id,
    categoryId: val.categoryId,
    clubId: val.clubId ?? undefined,
    code: val.code,
    name: val.name,
    description: val.description ?? undefined,
    icon: val.icon ?? undefined,
    color: val.color ?? undefined,
    sortOrder: val.sortOrder,
    isActive: val.isActive,
    isDefault: val.isDefault,
    metadata: val.metadata ?? undefined,
    translations: val.translations?.map(transformTranslation),
    isGlobal: !val.clubId, // Global if no clubId
  };
}

function transformTranslation(trans: any): LookupTranslationDisplay {
  return {
    id: trans.id,
    locale: trans.locale,
    name: trans.name,
    description: trans.description ?? undefined,
  };
}

// ============================================================================
// Category Hooks
// ============================================================================

/**
 * Hook to fetch all lookup categories
 */
export function useLookupCategories(filter?: LookupCategoryFilterInput) {
  const query = useGetLookupCategoriesQuery({ filter });

  const categories = useMemo(() => {
    if (!query.data?.lookupCategories) return [];
    return query.data.lookupCategories.map(transformCategory);
  }, [query.data]);

  return {
    categories,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

/**
 * Hook to fetch a single lookup category by code with its values
 */
export function useLookupCategory(code: string) {
  const query = useGetLookupCategoryQuery(
    { code },
    { enabled: !!code }
  );

  const category = useMemo(() => {
    if (!query.data?.lookupCategory) return null;
    return transformCategory(query.data.lookupCategory);
  }, [query.data]);

  return {
    category,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

// ============================================================================
// Value Hooks
// ============================================================================

/**
 * Hook to fetch lookup values for a category (with club override support)
 */
export function useLookupValues(
  categoryCode: string,
  options?: { includeInactive?: boolean }
) {
  const query = useGetLookupValuesQuery(
    {
      categoryCode,
      includeInactive: options?.includeInactive ?? false,
    },
    { enabled: !!categoryCode }
  );

  const values = useMemo(() => {
    if (!query.data?.lookupValues) return [];
    return query.data.lookupValues.map(transformValue);
  }, [query.data]);

  // Group values by active/inactive
  const activeValues = useMemo(
    () => values.filter((v) => v.isActive),
    [values]
  );

  const inactiveValues = useMemo(
    () => values.filter((v) => !v.isActive),
    [values]
  );

  // Get default value
  const defaultValue = useMemo(
    () => values.find((v) => v.isDefault && v.isActive),
    [values]
  );

  return {
    values,
    activeValues,
    inactiveValues,
    defaultValue,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

/**
 * Hook to fetch a single lookup value by ID
 */
export function useLookupValue(id: string) {
  const query = useGetLookupValueQuery(
    { id },
    { enabled: !!id }
  );

  const value = useMemo(() => {
    if (!query.data?.lookupValue) return null;
    return transformValue(query.data.lookupValue);
  }, [query.data]);

  return {
    value,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

// ============================================================================
// Mutation Hooks
// ============================================================================

/**
 * Hook for lookup value CRUD mutations
 */
export function useLookupMutations() {
  const queryClient = useQueryClient();

  const invalidateLookups = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['GetLookupCategories'] });
    queryClient.invalidateQueries({ queryKey: ['GetLookupCategory'] });
    queryClient.invalidateQueries({ queryKey: ['GetLookupValues'] });
    queryClient.invalidateQueries({ queryKey: ['GetLookupValue'] });
  }, [queryClient]);

  const createMutation = useCreateLookupValueMutation({
    onSuccess: invalidateLookups,
  });

  const updateMutation = useUpdateLookupValueMutation({
    onSuccess: invalidateLookups,
  });

  const deleteMutation = useDeleteLookupValueMutation({
    onSuccess: invalidateLookups,
  });

  const addTranslationMutation = useAddLookupTranslationMutation({
    onSuccess: invalidateLookups,
  });

  const deleteTranslationMutation = useDeleteLookupTranslationMutation({
    onSuccess: invalidateLookups,
  });

  const createValue = useCallback(
    async (input: Omit<CreateLookupValueInput, 'clubId'>) => {
      return createMutation.mutateAsync({ input: input as CreateLookupValueInput });
    },
    [createMutation]
  );

  const updateValue = useCallback(
    async (id: string, input: Omit<UpdateLookupValueInput, 'id'>) => {
      return updateMutation.mutateAsync({ input: { id, ...input } });
    },
    [updateMutation]
  );

  const deleteValue = useCallback(
    async (id: string) => {
      return deleteMutation.mutateAsync({ id });
    },
    [deleteMutation]
  );

  const addTranslation = useCallback(
    async (input: AddLookupTranslationInput) => {
      return addTranslationMutation.mutateAsync({ input });
    },
    [addTranslationMutation]
  );

  const deleteTranslation = useCallback(
    async (id: string) => {
      return deleteTranslationMutation.mutateAsync({ id });
    },
    [deleteTranslationMutation]
  );

  return {
    createValue,
    updateValue,
    deleteValue,
    addTranslation,
    deleteTranslation,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isAddingTranslation: addTranslationMutation.isPending,
    isDeletingTranslation: deleteTranslationMutation.isPending,
    isMutating:
      createMutation.isPending ||
      updateMutation.isPending ||
      deleteMutation.isPending ||
      addTranslationMutation.isPending ||
      deleteTranslationMutation.isPending,
  };
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get the display label for a lookup value, optionally in a specific locale
 */
export function getLookupLabel(
  value: LookupValueDisplay | undefined,
  locale?: string
): string {
  if (!value) return '';

  // If locale specified, try to find translation
  if (locale && value.translations) {
    const translation = value.translations.find((t) => t.locale === locale);
    if (translation) return translation.name;
  }

  return value.name;
}

/**
 * Find a lookup value by code from a list of values
 */
export function findLookupByCode(
  values: LookupValueDisplay[],
  code: string
): LookupValueDisplay | undefined {
  return values.find((v) => v.code === code);
}

/**
 * Create options array for select/dropdown components
 */
export function toLookupOptions(
  values: LookupValueDisplay[],
  options?: { includeInactive?: boolean; locale?: string }
) {
  const filtered = options?.includeInactive
    ? values
    : values.filter((v) => v.isActive);

  return filtered.map((v) => ({
    value: v.code,
    label: getLookupLabel(v, options?.locale),
    icon: v.icon,
    color: v.color,
    isDefault: v.isDefault,
    disabled: !v.isActive,
  }));
}
