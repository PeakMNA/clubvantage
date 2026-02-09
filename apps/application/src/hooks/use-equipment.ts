/**
 * Equipment hooks for fetching and managing equipment data
 */

import { useMemo } from 'react';
import {
  useGetEquipmentCategoriesQuery,
  useGetEquipmentQuery,
  useUpdateEquipmentStatusMutation,
  useAssignEquipmentMutation,
  useReturnEquipmentMutation,
  type EquipmentCondition,
  type EquipmentStatus,
  type OperationType,
  type Equipment as ApiEquipment,
  type EquipmentCategory as ApiEquipmentCategory,
  type EquipmentFilterInput,
} from '@clubvantage/api-client';
import { useQueryClient } from '@tanstack/react-query';

// Frontend types matching the equipment-tab.tsx expectations
export type EquipmentCategoryType = 'CART' | 'BIKE' | 'SPORTS' | 'FITNESS' | 'APPAREL' | 'OTHER';
export type EquipmentStatusType = 'AVAILABLE' | 'IN_USE' | 'RESERVED' | 'MAINTENANCE';
export type EquipmentConditionType = 'EXCELLENT' | 'GOOD' | 'FAIR' | 'NEEDS_REPAIR';

export interface EquipmentAssignment {
  assignmentId: string;
  memberId: string;
  memberName: string;
  memberNumber: string;
  memberPhoto?: string;
  assignedAt: string; // Formatted time for display
  assignedAtRaw: string; // Raw ISO date for calculations
  expectedReturn?: string;
}

export interface Equipment {
  id: string;
  name: string;
  code: string;
  category: EquipmentCategoryType;
  status: EquipmentStatusType;
  condition: EquipmentConditionType;
  assignment?: EquipmentAssignment;
  maintenanceNote?: string;
  location?: string;
  dailyRate?: number;
  categoryId?: string;
  categoryColor?: string;
  categoryIcon?: string;
}

export interface EquipmentCategory {
  id: string;
  code: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  attachmentType: string;
  defaultRentalRate?: number;
  requiresDeposit: boolean;
  depositAmount?: number;
  sortOrder: number;
  isActive: boolean;
  equipmentCount: number;
  availableCount: number;
}

// Map API category codes to frontend category types
function mapCategoryCode(code: string): EquipmentCategoryType {
  const codeMap: Record<string, EquipmentCategoryType> = {
    'GOLF_CARTS': 'CART',
    'GOLF_CLUBS': 'SPORTS',
    'PULL_CARTS': 'CART',
    'RANGE_BALLS': 'SPORTS',
    'TENNIS_RACKETS': 'SPORTS',
    'TENNIS_BALLS': 'SPORTS',
    'PROJECTORS': 'OTHER',
    'AUDIO_SYSTEMS': 'OTHER',
    'TABLES': 'OTHER',
    'CHAIRS': 'OTHER',
    'BIKES': 'BIKE',
    'ELECTRIC_BIKES': 'BIKE',
    'FITNESS_EQUIPMENT': 'FITNESS',
    'YOGA_MATS': 'FITNESS',
    'SWIM_GEAR': 'APPAREL',
  };
  return codeMap[code] || 'OTHER';
}

// Map API status to frontend status
function mapStatus(apiStatus: EquipmentStatus): EquipmentStatusType {
  const statusMap: Record<string, EquipmentStatusType> = {
    'AVAILABLE': 'AVAILABLE',
    'IN_USE': 'IN_USE',
    'RESERVED': 'RESERVED',
    'MAINTENANCE': 'MAINTENANCE',
    'RETIRED': 'MAINTENANCE',
  };
  return statusMap[apiStatus] || 'AVAILABLE';
}

// Map API condition to frontend condition
function mapCondition(apiCondition: EquipmentCondition): EquipmentConditionType {
  const conditionMap: Record<string, EquipmentConditionType> = {
    'EXCELLENT': 'EXCELLENT',
    'GOOD': 'GOOD',
    'FAIR': 'FAIR',
    'POOR': 'NEEDS_REPAIR',
    'NEEDS_REPAIR': 'NEEDS_REPAIR',
    'OUT_OF_SERVICE': 'NEEDS_REPAIR',
  };
  return conditionMap[apiCondition] || 'GOOD';
}

// Format time for assignment display
function formatTime(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

// Transform API equipment to frontend Equipment type
function transformEquipment(apiEquipment: any): Equipment {
  const assignment = apiEquipment.currentAssignment ? {
    assignmentId: apiEquipment.currentAssignment.id,
    memberId: apiEquipment.currentAssignment.member?.id || '',
    memberName: apiEquipment.currentAssignment.member
      ? `${apiEquipment.currentAssignment.member.firstName} ${apiEquipment.currentAssignment.member.lastName}`
      : 'Unknown',
    memberNumber: apiEquipment.currentAssignment.member?.memberId || '',
    memberPhoto: apiEquipment.currentAssignment.member?.avatarUrl ?? undefined,
    assignedAt: formatTime(apiEquipment.currentAssignment.assignedAt),
    assignedAtRaw: apiEquipment.currentAssignment.assignedAt,
    expectedReturn: apiEquipment.currentAssignment.returnedAt
      ? formatTime(apiEquipment.currentAssignment.returnedAt)
      : undefined,
  } : undefined;

  return {
    id: apiEquipment.id,
    name: apiEquipment.name,
    code: apiEquipment.assetNumber,
    category: mapCategoryCode(apiEquipment.category?.code || ''),
    status: mapStatus(apiEquipment.status),
    condition: mapCondition(apiEquipment.condition),
    assignment,
    maintenanceNote: apiEquipment.status === 'MAINTENANCE' ? (apiEquipment.notes ?? undefined) : undefined,
    location: apiEquipment.location ?? undefined,
    dailyRate: apiEquipment.category?.defaultRentalRate ?? undefined,
    categoryId: apiEquipment.category?.id,
    categoryColor: apiEquipment.category?.color ?? undefined,
    categoryIcon: apiEquipment.category?.icon ?? undefined,
  };
}

// Transform API category to frontend EquipmentCategory type
function transformCategory(apiCategory: any): EquipmentCategory {
  return {
    id: apiCategory.id,
    code: apiCategory.code,
    name: apiCategory.name,
    description: apiCategory.description ?? undefined,
    icon: apiCategory.icon ?? undefined,
    color: apiCategory.color ?? undefined,
    attachmentType: apiCategory.attachmentType,
    defaultRentalRate: apiCategory.defaultRentalRate ?? undefined,
    requiresDeposit: apiCategory.requiresDeposit,
    depositAmount: apiCategory.depositAmount ?? undefined,
    sortOrder: apiCategory.sortOrder,
    isActive: apiCategory.isActive,
    equipmentCount: apiCategory.equipmentCount,
    availableCount: apiCategory.availableCount,
  };
}

/**
 * Hook to fetch equipment categories
 * @param operationType - Optional filter to show only categories for a specific operation (GOLF, FACILITY, SPA, EVENT)
 */
export function useEquipmentCategories(operationType?: OperationType) {
  const query = useGetEquipmentCategoriesQuery({
    filter: operationType ? { operationType } : undefined,
  });

  const categories = useMemo(() => {
    if (!query.data?.equipmentCategories) return [];
    return query.data.equipmentCategories.map(transformCategory);
  }, [query.data]);

  return {
    categories,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

/**
 * Hook to fetch equipment items
 * @param operationType - Optional filter to show only equipment for a specific operation (GOLF, FACILITY, SPA, EVENT)
 * @param filter - Additional filter options (categoryId, status, condition)
 */
export function useEquipment(operationType?: OperationType, filter?: Omit<EquipmentFilterInput, 'operationType'>) {
  const query = useGetEquipmentQuery({
    filter: {
      ...filter,
      ...(operationType && { operationType }),
    },
  });

  const equipment = useMemo(() => {
    if (!query.data?.equipment) return [];
    return query.data.equipment.map(transformEquipment);
  }, [query.data]);

  const counts = useMemo(() => {
    return {
      total: equipment.length,
      available: equipment.filter((e: Equipment) => e.status === 'AVAILABLE').length,
      inUse: equipment.filter((e: Equipment) => e.status === 'IN_USE' || e.status === 'RESERVED').length,
      maintenance: equipment.filter((e: Equipment) => e.status === 'MAINTENANCE').length,
    };
  }, [equipment]);

  return {
    equipment,
    counts,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

/**
 * Hook for equipment mutations
 */
export function useEquipmentMutations() {
  const queryClient = useQueryClient();

  const updateStatusMutation = useUpdateEquipmentStatusMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['GetEquipment'] });
    },
  });

  const assignMutation = useAssignEquipmentMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['GetEquipment'] });
    },
  });

  const returnMutation = useReturnEquipmentMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['GetEquipment'] });
    },
  });

  const setMaintenance = async (equipmentId: string, isMaintenance: boolean) => {
    return updateStatusMutation.mutateAsync({
      input: {
        id: equipmentId,
        status: isMaintenance ? 'MAINTENANCE' as EquipmentStatus : 'AVAILABLE' as EquipmentStatus,
      },
    });
  };

  const assignEquipment = async (
    equipmentId: string,
    options: { bookingId?: string; teeTimePlayerId?: string; rentalFee?: number; notes?: string }
  ) => {
    return assignMutation.mutateAsync({
      input: {
        equipmentId,
        bookingId: options.bookingId,
        teeTimePlayerId: options.teeTimePlayerId,
        rentalFee: options.rentalFee,
        notes: options.notes,
      },
    });
  };

  const returnEquipment = async (
    assignmentId: string,
    options?: { condition?: string; notes?: string }
  ) => {
    const input: { assignmentId: string; conditionAtReturn?: EquipmentCondition; notes?: string } = {
      assignmentId,
    };
    if (options?.condition) {
      input.conditionAtReturn = options.condition as EquipmentCondition;
    }
    if (options?.notes) {
      input.notes = options.notes;
    }
    return returnMutation.mutateAsync({ input });
  };

  return {
    setMaintenance,
    assignEquipment,
    returnEquipment,
    isUpdating: updateStatusMutation.isPending || assignMutation.isPending || returnMutation.isPending,
  };
}
