/**
 * Golf hooks that wrap the API client and transform data
 * for use in the frontend components
 */

import { useMemo, useCallback } from 'react';
import {
  useGetTeeSheetQuery,
  useGetCoursesQuery,
  useGetTeeTimeQuery,
  useCreateTeeTimeMutation,
  useUpdateTeeTimeMutation,
  useCancelTeeTimeMutation,
  useCheckInTeeTimeMutation,
  useSubscription,
} from '@clubvantage/api-client';
import { useQueryClient } from '@tanstack/react-query';

export interface Course {
  id: string;
  name: string;
  code: string;
  description?: string;
  holes: number;
  par: number;
  slope?: number;
  rating?: number;
  firstTeeTime: string;
  lastTeeTime: string;
  teeInterval: number;
  isActive: boolean;
}

export interface TeeTimeSlot {
  time: string;
  courseId: string;
  date: string;
  available: boolean;
  booking?: {
    id: string;
    teeTimeNumber: string;
    teeDate: string;
    teeTime: string;
    holes: number;
    status: string;
    notes?: string;
    players: Array<{
      id: string;
      position: number;
      playerType: string;
      member?: {
        id: string;
        memberId: string;
        firstName: string;
        lastName: string;
      };
      guestName?: string;
      guestEmail?: string;
      guestPhone?: string;
      cartType: string;
      sharedWithPosition?: number;
      caddy?: {
        id: string;
        caddyNumber: string;
        firstName: string;
        lastName: string;
      };
      checkedInAt?: string;
    }>;
  };
}

function transformCourse(apiCourse: any): Course {
  return {
    id: apiCourse.id,
    name: apiCourse.name,
    code: apiCourse.code,
    description: apiCourse.description,
    holes: apiCourse.holes,
    par: apiCourse.par,
    slope: apiCourse.slope,
    rating: apiCourse.rating,
    firstTeeTime: apiCourse.firstTeeTime,
    lastTeeTime: apiCourse.lastTeeTime,
    teeInterval: apiCourse.teeInterval || 8,
    isActive: apiCourse.isActive,
  };
}

export function useCourses() {
  const { data, isLoading, error } = useGetCoursesQuery();

  const courses = useMemo(() => {
    if (!data?.courses) return [];
    return data.courses.map(transformCourse);
  }, [data]);

  return {
    courses,
    isLoading,
    error,
  };
}

export interface UseTeeSheetOptions {
  courseId: string;
  date: Date;
  enabled?: boolean;
}

export function useTeeSheet(options: UseTeeSheetOptions) {
  const { courseId, date, enabled = true } = options;

  const { data, isLoading, error, refetch } = useGetTeeSheetQuery(
    {
      courseId,
      date: date.toISOString(),
    },
    {
      enabled: enabled && !!courseId,
    }
  );

  const teeSheet = useMemo((): TeeTimeSlot[] => {
    if (!data?.teeSheet) return [];
    // Transform null to undefined for type compatibility
    return data.teeSheet.map((slot) => ({
      ...slot,
      booking: slot.booking || undefined,
    })) as TeeTimeSlot[];
  }, [data]);

  return {
    teeSheet,
    isLoading,
    error,
    refetch,
  };
}

export function useTeeTime(id: string, enabled = true) {
  const { data, isLoading, error, refetch } = useGetTeeTimeQuery(
    { id },
    { enabled: enabled && !!id }
  );

  const teeTime = useMemo(() => {
    if (!data?.teeTime) return null;
    return data.teeTime;
  }, [data]);

  return {
    teeTime,
    isLoading,
    error,
    refetch,
  };
}

export function useGolfMutations() {
  const queryClient = useQueryClient();

  const createMutation = useCreateTeeTimeMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['GetTeeSheet'] });
      queryClient.invalidateQueries({ queryKey: ['GetTeeTimes'] });
    },
  });

  const updateMutation = useUpdateTeeTimeMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['GetTeeSheet'] });
      queryClient.invalidateQueries({ queryKey: ['GetTeeTimes'] });
    },
  });

  const cancelMutation = useCancelTeeTimeMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['GetTeeSheet'] });
      queryClient.invalidateQueries({ queryKey: ['GetTeeTimes'] });
    },
  });

  const checkInMutation = useCheckInTeeTimeMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['GetTeeSheet'] });
    },
  });

  const createTeeTime = useCallback(
    async (data: {
      courseId: string;
      teeDate: string;
      teeTime: string;
      holes?: number;
      players: Array<{
        position: number;
        playerType: string;
        memberId?: string;
        guestName?: string;
        guestEmail?: string;
        guestPhone?: string;
        cartType?: string;
        caddyId?: string;
      }>;
    }) => {
      return createMutation.mutateAsync({ input: data as any });
    },
    [createMutation]
  );

  const updateTeeTime = useCallback(
    async (
      id: string,
      data: {
        holes?: number;
        notes?: string;
        players?: Array<{
          position: number;
          playerType: string;
          memberId?: string;
          guestName?: string;
          cartType?: string;
          caddyId?: string;
        }>;
      }
    ) => {
      return updateMutation.mutateAsync({ id, input: data as any });
    },
    [updateMutation]
  );

  const cancelTeeTime = useCallback(
    async (id: string, reason?: string) => {
      return cancelMutation.mutateAsync({ id, reason });
    },
    [cancelMutation]
  );

  const checkIn = useCallback(
    async (id: string) => {
      return checkInMutation.mutateAsync({ input: { bookingId: id } });
    },
    [checkInMutation]
  );

  return {
    createTeeTime,
    updateTeeTime,
    cancelTeeTime,
    checkIn,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isCancelling: cancelMutation.isPending,
    isCheckingIn: checkInMutation.isPending,
  };
}

// Re-export subscription hook for real-time updates
export { useSubscription };
