/**
 * Golf hooks that wrap the API client and transform data
 * for use in the frontend components
 */

import { useMemo, useCallback } from 'react';
import {
  useGetTeeSheetQuery,
  useGetCoursesQuery,
  useGetTeeTimeQuery,
  useGetWeekViewOccupancyQuery,
  useCreateTeeTimeMutation,
  useUpdateTeeTimeMutation,
  useUpdateTeeTimePlayersMutation,
  useCancelTeeTimeMutation,
  useCheckInTeeTimeMutation,
  useUpdatePlayerRentalStatusMutation,
  useMoveTeeTimeMutation,
  useSubscription,
} from '@clubvantage/api-client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { request } from '@clubvantage/api-client';
import type {
  ScheduleConfig,
  TimePeriod,
  Season,
  SpecialDay,
} from '@/lib/golf/schedule-utils';

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
    bookingGroups?: Array<{
      id: string;
      groupNumber: number;
      bookedBy: {
        id: string;
        name: string;
        memberId?: string;
      };
      playerIds: string[];
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
  const { data, isLoading, error, status } = useGetCoursesQuery();

  // Debug logging
  console.log('[useCourses] status:', status, 'isLoading:', isLoading, 'error:', error, 'data:', data);

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
      queryClient.invalidateQueries({ queryKey: ['GetWeekViewOccupancy'] });
    },
  });

  const updateMutation = useUpdateTeeTimeMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['GetTeeSheet'] });
      queryClient.invalidateQueries({ queryKey: ['GetTeeTimes'] });
      queryClient.invalidateQueries({ queryKey: ['GetWeekViewOccupancy'] });
    },
  });

  const updatePlayersMutation = useUpdateTeeTimePlayersMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['GetTeeSheet'] });
      queryClient.invalidateQueries({ queryKey: ['GetTeeTimes'] });
      queryClient.invalidateQueries({ queryKey: ['GetWeekViewOccupancy'] });
    },
  });

  const cancelMutation = useCancelTeeTimeMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['GetTeeSheet'] });
      queryClient.invalidateQueries({ queryKey: ['GetTeeTimes'] });
      queryClient.invalidateQueries({ queryKey: ['GetWeekViewOccupancy'] });
    },
  });

  const checkInMutation = useCheckInTeeTimeMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['GetTeeSheet'] });
      queryClient.invalidateQueries({ queryKey: ['GetWeekViewOccupancy'] });
    },
  });

  const updatePlayerRentalStatusMutation = useUpdatePlayerRentalStatusMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['GetTeeSheet'] });
      queryClient.invalidateQueries({ queryKey: ['GetWeekViewOccupancy'] });
    },
  });

  const moveMutation = useMoveTeeTimeMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['GetTeeSheet'] });
      queryClient.invalidateQueries({ queryKey: ['GetTeeTimes'] });
      queryClient.invalidateQueries({ queryKey: ['GetWeekViewOccupancy'] });
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

  const updateTeeTimePlayers = useCallback(
    async (
      id: string,
      players: Array<{
        position: number;
        playerType: string;
        memberId?: string;
        guestName?: string;
        guestEmail?: string;
        guestPhone?: string;
        cartType?: string;
        caddyId?: string;
        caddyRequest?: string;
        cartRequest?: string;
        rentalRequest?: string;
        cartStatus?: string;
        caddyStatus?: string;
      }>
    ) => {
      return updatePlayersMutation.mutateAsync({ id, players: players as any });
    },
    [updatePlayersMutation]
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

  const updatePlayerRentalStatus = useCallback(
    async (
      playerId: string,
      updates: {
        cartStatus?: string;
        caddyStatus?: string;
        caddyId?: string | null;
      }
    ) => {
      return updatePlayerRentalStatusMutation.mutateAsync({
        playerId,
        input: updates as any,
      });
    },
    [updatePlayerRentalStatusMutation]
  );

  const moveTeeTime = useCallback(
    async (
      id: string,
      data: {
        newTeeDate: string;
        newTeeTime: string;
        newCourseId?: string;
      }
    ) => {
      return moveMutation.mutateAsync({ id, input: data });
    },
    [moveMutation]
  );

  return {
    createTeeTime,
    updateTeeTime,
    updateTeeTimePlayers,
    cancelTeeTime,
    checkIn,
    updatePlayerRentalStatus,
    moveTeeTime,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isUpdatingPlayers: updatePlayersMutation.isPending,
    isCancelling: cancelMutation.isPending,
    isCheckingIn: checkInMutation.isPending,
    isUpdatingRentalStatus: updatePlayerRentalStatusMutation.isPending,
    isMoving: moveMutation.isPending,
  };
}

// Re-export subscription hook for real-time updates
export { useSubscription };

// ============================================================================
// SCHEDULE CONFIG HOOKS
// These are temporary until GraphQL codegen generates the hooks
// ============================================================================

const GET_SCHEDULE_CONFIG_QUERY = `
  query GetScheduleConfig($courseId: ID!, $autoCreate: Boolean) {
    getScheduleConfig(courseId: $courseId, autoCreate: $autoCreate) {
      id
      courseId
      weekdayFirstTee
      weekdayLastTee
      weekendFirstTee
      weekendLastTee
      twilightMode
      twilightMinutesBeforeSunset
      twilightFixedDefault
      clubLatitude
      clubLongitude
      defaultBookingWindowDays
      timePeriods {
        id
        name
        startTime
        endTime
        intervalMinutes
        isPrimeTime
        applicableDays
        sortOrder
      }
      seasons {
        id
        name
        startMonth
        startDay
        endMonth
        endDay
        isRecurring
        priority
        overrideFirstTee
        overrideLastTee
        overrideBookingWindow
        overrideTwilightTime
        overrideTimePeriods
        timePeriods {
          id
          name
          startTime
          endTime
          intervalMinutes
          isPrimeTime
          applicableDays
          sortOrder
        }
      }
      specialDays {
        id
        name
        startDate
        endDate
        isRecurring
        type
        customFirstTee
        customLastTee
        customTimePeriods
        timePeriods {
          id
          name
          startTime
          endTime
          intervalMinutes
          isPrimeTime
          applicableDays
          sortOrder
        }
      }
    }
  }
`;

interface GetScheduleConfigResponse {
  getScheduleConfig: ScheduleConfig | null;
}

interface GetScheduleConfigVariables {
  courseId: string;
  autoCreate?: boolean;
}

export interface UseScheduleConfigOptions {
  courseId: string;
  autoCreate?: boolean;
  enabled?: boolean;
}

export function useScheduleConfig(options: UseScheduleConfigOptions) {
  const { courseId, autoCreate = true, enabled = true } = options;

  const { data, isLoading, error, refetch } = useQuery<GetScheduleConfigResponse>({
    queryKey: ['GetScheduleConfig', courseId, autoCreate],
    queryFn: async () => {
      return request<GetScheduleConfigResponse, GetScheduleConfigVariables>(
        GET_SCHEDULE_CONFIG_QUERY,
        { courseId, autoCreate }
      );
    },
    enabled: enabled && !!courseId,
  });

  const scheduleConfig = useMemo(() => {
    return data?.getScheduleConfig ?? null;
  }, [data]);

  return {
    scheduleConfig,
    isLoading,
    error,
    refetch,
  };
}

// ============================================================================
// WEEK VIEW OCCUPANCY HOOKS
// ============================================================================

export interface UseWeekViewOccupancyOptions {
  courseId: string;
  startDate: Date;
  /** Optional time range filter for prioritized loading */
  timeRange?: {
    startTime: string; // HH:MM format
    endTime: string;   // HH:MM format
  };
  enabled?: boolean;
}

// Helper to transform GraphQL response to frontend types
function transformWeekViewSlots(slots: any[]): {
  date: string;
  time: string;
  nine: 'FRONT' | 'BACK';
  isBlocked: boolean;
  positions: {
    position: number;
    status: 'AVAILABLE' | 'BOOKED' | 'BLOCKED';
    player?: {
      id: string;
      name: string;
      type: 'MEMBER' | 'GUEST' | 'DEPENDENT' | 'WALK_UP';
      memberId?: string;
    };
  }[];
}[] {
  return slots.map((slot) => ({
    date: slot.date,
    time: slot.time,
    nine: slot.nine as 'FRONT' | 'BACK',
    isBlocked: slot.isBlocked,
    positions: slot.positions.map((pos: any) => ({
      position: pos.position,
      status: pos.status as 'AVAILABLE' | 'BOOKED' | 'BLOCKED',
      player: pos.player
        ? {
            id: pos.player.id,
            name: pos.player.name,
            type: pos.player.type as 'MEMBER' | 'GUEST' | 'DEPENDENT' | 'WALK_UP',
            memberId: pos.player.memberId ?? undefined,
          }
        : undefined,
    })),
  }));
}

export function useWeekViewOccupancy(options: UseWeekViewOccupancyOptions) {
  const { courseId, startDate, timeRange, enabled = true } = options;

  // Calculate end date (7 days from start)
  const endDate = useMemo(() => {
    const end = new Date(startDate);
    end.setDate(end.getDate() + 6);
    return end;
  }, [startDate]);

  // Format dates as YYYY-MM-DD strings
  const startDateStr = startDate.toISOString().split('T')[0] as string;
  const endDateStr = endDate.toISOString().split('T')[0] as string;

  // PARALLEL LOADING: Both queries start simultaneously
  // Priority query (filtered time range) will typically complete faster
  // Full query runs in parallel, not waiting for priority query

  // Priority query - fetch only the selected time range (fast initial load)
  const priorityQuery = useGetWeekViewOccupancyQuery(
    {
      input: {
        courseId,
        startDate: startDateStr,
        endDate: endDateStr,
        startTime: timeRange?.startTime,
        endTime: timeRange?.endTime,
      },
    },
    {
      enabled: enabled && !!courseId && !!timeRange,
      staleTime: 30 * 1000,
      gcTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    }
  );

  // Full query - fetch all data in parallel (not waiting for priority query)
  const fullQuery = useGetWeekViewOccupancyQuery(
    {
      input: {
        courseId,
        startDate: startDateStr,
        endDate: endDateStr,
        // No time filter - fetch everything
      },
    },
    {
      // Run in parallel - enabled immediately, don't wait for priority query
      enabled: enabled && !!courseId,
      staleTime: 30 * 1000,
      gcTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    }
  );

  // Combine results: use priority data first, then merge with full data
  const weekViewSlots = useMemo(() => {
    // If we have full data, use it (most complete)
    if (fullQuery.data?.weekViewOccupancy?.slots) {
      return transformWeekViewSlots(fullQuery.data.weekViewOccupancy.slots);
    }
    // Otherwise use priority data if available
    if (priorityQuery.data?.weekViewOccupancy?.slots) {
      return transformWeekViewSlots(priorityQuery.data.weekViewOccupancy.slots);
    }
    return [];
  }, [fullQuery.data, priorityQuery.data]);

  // Loading: only show loading for priority query (initial load)
  // Background loading of full data happens silently
  const isLoading = timeRange ? priorityQuery.isLoading : fullQuery.isLoading;

  // Track if we're loading background data (for UI indicator if needed)
  const isLoadingBackground = timeRange && priorityQuery.data && fullQuery.isLoading;

  return {
    weekViewSlots,
    isLoading,
    isLoadingBackground,
    error: priorityQuery.error || fullQuery.error,
    refetch: () => {
      priorityQuery.refetch();
      fullQuery.refetch();
    },
  };
}

// Prefetch hook for week view - call on hover to warm cache (bundle-preload pattern)
export function usePrefetchWeekView() {
  const queryClient = useQueryClient();

  return useCallback(
    (courseId: string, startDate: Date) => {
      if (!courseId) return;

      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 6);
      const startDateStr = startDate.toISOString().split('T')[0] as string;
      const endDateStr = endDate.toISOString().split('T')[0] as string;

      // Prefetch full week data into cache
      queryClient.prefetchQuery({
        queryKey: ['GetWeekViewOccupancy', { input: { courseId, startDate: startDateStr, endDate: endDateStr } }],
        staleTime: 30 * 1000,
      });
    },
    [queryClient]
  );
}

// ============================================================================
// MONTH AVAILABILITY HOOK
// Fetches summary availability data for calendar month view
// ============================================================================

export type AvailabilityLevel = 'open' | 'limited' | 'full' | 'blocked';

export interface DayAvailability {
  date: string;
  level: AvailabilityLevel;
  availableSlots: number;  // Tee time slots available
  totalSlots: number;      // Total tee time slots
  bookedSlots: number;     // Tee time slots with bookings
  playerCount: number;     // Total players booked
}

export interface UseMonthAvailabilityOptions {
  courseId: string;
  month: Date; // Any date within the target month
  enabled?: boolean;
}

/**
 * Hook to fetch month availability data by aggregating tee sheet data.
 * Uses parallel fetching in weekly batches to balance performance and server load.
 * Shares cache with day/week views for efficiency.
 */
export function useMonthAvailability(options: UseMonthAvailabilityOptions) {
  const { courseId, month, enabled = true } = options;

  // Calculate the date range for the month (include padding for calendar display)
  const { monthDates, startOfMonth, endOfMonth } = useMemo(() => {
    const start = new Date(month.getFullYear(), month.getMonth(), 1);
    const end = new Date(month.getFullYear(), month.getMonth() + 1, 0);

    // Generate all dates in the month
    const dates: Date[] = [];
    const current = new Date(start);
    while (current <= end) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return {
      monthDates: dates,
      startOfMonth: start,
      endOfMonth: end,
    };
  }, [month]);

  // Split into weekly batches for parallel fetching (max 5 batches for a month)
  const weekBatches = useMemo(() => {
    const batches: Date[][] = [];
    for (let i = 0; i < monthDates.length; i += 7) {
      batches.push(monthDates.slice(i, i + 7));
    }
    return batches;
  }, [monthDates]);

  // Fetch each week batch in parallel using useQueries pattern
  // We'll use the GetTeeSheet API for each day within each batch
  const week0 = useWeekBatchQuery(courseId, weekBatches[0] || [], enabled);
  const week1 = useWeekBatchQuery(courseId, weekBatches[1] || [], enabled);
  const week2 = useWeekBatchQuery(courseId, weekBatches[2] || [], enabled);
  const week3 = useWeekBatchQuery(courseId, weekBatches[3] || [], enabled);
  const week4 = useWeekBatchQuery(courseId, weekBatches[4] || [], enabled);

  const weekQueries = [week0, week1, week2, week3, week4];

  // Transform tee sheet data to day availability
  const availability = useMemo((): DayAvailability[] => {
    const result: DayAvailability[] = [];

    weekQueries.forEach((weekQuery, batchIndex) => {
      const batchDates = weekBatches[batchIndex] || [];

      batchDates.forEach((date, dayIndex) => {
        const dayData = weekQuery.data?.[dayIndex];
        const dateStr = date.toISOString().split('T')[0] as string;

        if (!dayData?.teeSheet) {
          // No data yet
          result.push({
            date: dateStr,
            level: 'open',
            availableSlots: 0,
            totalSlots: 0,
            bookedSlots: 0,
            playerCount: 0,
          });
          return;
        }

        // Calculate availability from tee sheet slots
        const teeSheet = dayData.teeSheet;
        const totalSlots = teeSheet.length; // Count of tee time slots

        let bookedSlots = 0;
        let blockedSlots = 0;
        let playerCount = 0;

        teeSheet.forEach((slot) => {
          if (!slot.available && !slot.booking) {
            blockedSlots++;
          }
          if (slot.booking) {
            bookedSlots++;
            if (slot.booking.players) {
              playerCount += slot.booking.players.length;
            }
          }
        });

        const availableSlots = totalSlots - bookedSlots - blockedSlots;
        const bookedRatio = totalSlots > 0 ? bookedSlots / totalSlots : 0;

        // Determine availability level based on booked percentage
        let level: AvailabilityLevel = 'open';
        if (blockedSlots === totalSlots) {
          level = 'blocked';
        } else if (bookedRatio >= 0.85) {
          level = 'full';
        } else if (bookedRatio >= 0.5) {
          level = 'limited';
        }

        result.push({
          date: dateStr,
          level,
          availableSlots: Math.max(0, availableSlots),
          totalSlots,
          bookedSlots,
          playerCount,
        });
      });
    });

    // Sort by date
    return result.sort((a, b) => a.date.localeCompare(b.date));
  }, [weekQueries, weekBatches]);

  // Loading state
  const isLoading = weekQueries.some((q) => q.isLoading);

  // Error state
  const error = weekQueries.find((q) => q.error)?.error;

  // Refetch all batches
  const refetch = useCallback(() => {
    weekQueries.forEach((q) => q.refetch());
  }, [weekQueries]);

  return {
    availability,
    isLoading,
    error,
    refetch,
  };
}

// Helper hook to fetch a batch of days (up to 7) in parallel
function useWeekBatchQuery(
  courseId: string,
  dates: Date[],
  enabled: boolean
) {
  // Fetch each day in the batch in parallel
  const day0 = useGetTeeSheetQuery(
    { courseId, date: dates[0]?.toISOString() || '' },
    { enabled: enabled && !!courseId && !!dates[0], staleTime: 60 * 1000 }
  );
  const day1 = useGetTeeSheetQuery(
    { courseId, date: dates[1]?.toISOString() || '' },
    { enabled: enabled && !!courseId && !!dates[1], staleTime: 60 * 1000 }
  );
  const day2 = useGetTeeSheetQuery(
    { courseId, date: dates[2]?.toISOString() || '' },
    { enabled: enabled && !!courseId && !!dates[2], staleTime: 60 * 1000 }
  );
  const day3 = useGetTeeSheetQuery(
    { courseId, date: dates[3]?.toISOString() || '' },
    { enabled: enabled && !!courseId && !!dates[3], staleTime: 60 * 1000 }
  );
  const day4 = useGetTeeSheetQuery(
    { courseId, date: dates[4]?.toISOString() || '' },
    { enabled: enabled && !!courseId && !!dates[4], staleTime: 60 * 1000 }
  );
  const day5 = useGetTeeSheetQuery(
    { courseId, date: dates[5]?.toISOString() || '' },
    { enabled: enabled && !!courseId && !!dates[5], staleTime: 60 * 1000 }
  );
  const day6 = useGetTeeSheetQuery(
    { courseId, date: dates[6]?.toISOString() || '' },
    { enabled: enabled && !!courseId && !!dates[6], staleTime: 60 * 1000 }
  );

  const dayQueries = [day0, day1, day2, day3, day4, day5, day6];

  return {
    data: dayQueries.map((q) => q.data),
    isLoading: dayQueries.some((q) => q.isLoading),
    error: dayQueries.find((q) => q.error)?.error,
    refetch: () => dayQueries.forEach((q) => q.refetch()),
  };
}

// Prefetch hook for month view - call on hover to warm cache
export function usePrefetchMonthView() {
  const queryClient = useQueryClient();

  return useCallback(
    (courseId: string, month: Date) => {
      if (!courseId) return;

      // Generate first week of month for prefetch
      const start = new Date(month.getFullYear(), month.getMonth(), 1);
      const dates: Date[] = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date(start);
        date.setDate(date.getDate() + i);
        dates.push(date);
      }

      // Prefetch first 7 days to give quick feedback
      dates.forEach((date) => {
        queryClient.prefetchQuery({
          queryKey: ['GetTeeSheet', { courseId, date: date.toISOString() }],
          staleTime: 60 * 1000,
        });
      });
    },
    [queryClient]
  );
}

// ============================================================================
// WEEK VIEW FROM TEE SHEET (BETTER APPROACH)
// Fetches 7 days of tee sheet data in parallel using the working API
// ============================================================================

export interface UseWeekTeeSheetOptions {
  courseId: string;
  startDate: Date;
  enabled?: boolean;
}

export function useWeekTeeSheet(options: UseWeekTeeSheetOptions) {
  const { courseId, startDate, enabled = true } = options;

  // Generate 7 dates for the week
  const weekDates = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      return date;
    });
  }, [startDate]);

  // Fetch all 7 days in PARALLEL using Promise.all pattern via React Query
  // Each day uses the same working GetTeeSheet API
  const day0 = useGetTeeSheetQuery(
    { courseId, date: weekDates[0]!.toISOString() },
    { enabled: enabled && !!courseId, staleTime: 30 * 1000 }
  );
  const day1 = useGetTeeSheetQuery(
    { courseId, date: weekDates[1]!.toISOString() },
    { enabled: enabled && !!courseId, staleTime: 30 * 1000 }
  );
  const day2 = useGetTeeSheetQuery(
    { courseId, date: weekDates[2]!.toISOString() },
    { enabled: enabled && !!courseId, staleTime: 30 * 1000 }
  );
  const day3 = useGetTeeSheetQuery(
    { courseId, date: weekDates[3]!.toISOString() },
    { enabled: enabled && !!courseId, staleTime: 30 * 1000 }
  );
  const day4 = useGetTeeSheetQuery(
    { courseId, date: weekDates[4]!.toISOString() },
    { enabled: enabled && !!courseId, staleTime: 30 * 1000 }
  );
  const day5 = useGetTeeSheetQuery(
    { courseId, date: weekDates[5]!.toISOString() },
    { enabled: enabled && !!courseId, staleTime: 30 * 1000 }
  );
  const day6 = useGetTeeSheetQuery(
    { courseId, date: weekDates[6]!.toISOString() },
    { enabled: enabled && !!courseId, staleTime: 30 * 1000 }
  );

  const dayQueries = [day0, day1, day2, day3, day4, day5, day6];

  // Transform tee sheet data to week view slots
  const weekViewSlots = useMemo(() => {
    const slots: {
      date: string;
      time: string;
      nine: 'FRONT' | 'BACK';
      isBlocked: boolean;
      positions: {
        position: number;
        status: 'AVAILABLE' | 'BOOKED' | 'BLOCKED';
        player?: {
          id: string;
          name: string;
          type: 'MEMBER' | 'GUEST' | 'DEPENDENT' | 'WALK_UP';
          memberId?: string;
        };
      }[];
    }[] = [];

    dayQueries.forEach((query, dayIndex) => {
      const date = weekDates[dayIndex];
      if (!date || !query.data?.teeSheet) return;

      const dateStr = date.toISOString().split('T')[0] as string;

      for (const slot of query.data.teeSheet) {
        // Convert slot time to 24h format if needed
        const time = slot.time;

        // Build positions from booking players or empty slots
        const positions: typeof slots[0]['positions'] = [];

        if (slot.booking?.players) {
          for (let i = 0; i < 4; i++) {
            const player = slot.booking.players.find(p => p.position === i + 1);
            if (player) {
              const playerName = player.member
                ? `${player.member.firstName} ${player.member.lastName}`
                : player.guestName || 'Guest';

              positions.push({
                position: i + 1,
                status: 'BOOKED',
                player: {
                  id: player.id,
                  name: playerName,
                  type: player.playerType as 'MEMBER' | 'GUEST' | 'DEPENDENT' | 'WALK_UP',
                  memberId: player.member?.memberId,
                },
              });
            } else {
              positions.push({
                position: i + 1,
                status: 'AVAILABLE',
              });
            }
          }
        } else {
          // No booking - all positions available
          for (let i = 0; i < 4; i++) {
            positions.push({
              position: i + 1,
              status: slot.available ? 'AVAILABLE' : 'BLOCKED',
            });
          }
        }

        slots.push({
          date: dateStr,
          time,
          nine: 'FRONT', // Default to front 9
          isBlocked: !slot.available && !slot.booking,
          positions,
        });
      }
    });

    return slots;
  }, [dayQueries, weekDates]);

  // Loading if any day is still loading
  const isLoading = dayQueries.some(q => q.isLoading);

  // Error if any day has error
  const error = dayQueries.find(q => q.error)?.error;

  // Refetch all days
  const refetch = useCallback(() => {
    dayQueries.forEach(q => q.refetch());
  }, [dayQueries]);

  return {
    weekViewSlots,
    isLoading,
    error,
    refetch,
  };
}
