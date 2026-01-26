'use client';

import { useState, useMemo, useCallback } from 'react';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { PageHeader, Button } from '@clubvantage/ui';
import {
  useGetCalendarDayQuery,
  useGetBookingQuery,
  useGetFacilitiesQuery,
  useCheckInBookingMutation,
  useCancelBookingMutation,
  queryKeys,
} from '@clubvantage/api-client';
import { useQueryClient } from '@tanstack/react-query';

import {
  BookingProvider,
  useBooking,
  CalendarDayView,
  CalendarDayViewSkeleton,
  BookingDetailPanel,
  CreateBookingModal,
  BookingEmptyState,
  BookingErrorState,
} from '@/components/bookings';
import type { CalendarResource, CalendarBooking } from '@/components/bookings';
import type { BookingStatus } from '@/components/bookings';

// Facility type filters
const facilityTypes = [
  { value: 'all', label: 'All Facilities', type: null },
  { value: 'COURT', label: 'Tennis Courts', type: 'court' as const },
  { value: 'POOL', label: 'Swimming Pool', type: 'pool' as const },
  { value: 'STUDIO', label: 'Fitness Center', type: 'studio' as const },
  { value: 'SPA', label: 'Spa & Wellness', type: 'spa' as const },
];

// Helper to format date for API
function formatDateForApi(date: Date): string {
  const isoDate = date.toISOString().split('T')[0];
  return isoDate || new Date().toISOString().split('T')[0]!;
}

// Helper to map API status to component status
function mapStatus(status: string): BookingStatus {
  const statusMap: Record<string, BookingStatus> = {
    PENDING: 'confirmed',
    CONFIRMED: 'confirmed',
    CHECKED_IN: 'checked_in',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
    NO_SHOW: 'no_show',
  };
  return statusMap[status] || 'confirmed';
}

// Helper to map resource type
function mapResourceType(type: string): 'court' | 'spa' | 'studio' | 'pool' | 'room' {
  const typeMap: Record<string, 'court' | 'spa' | 'studio' | 'pool' | 'room'> = {
    COURT: 'court',
    SPA: 'spa',
    STUDIO: 'studio',
    POOL: 'pool',
    ROOM: 'room',
  };
  return typeMap[type] || 'room';
}

// ============================================================================
// INNER COMPONENT
// ============================================================================

function FacilityPageContent() {
  const { openWizard } = useBooking();
  const queryClient = useQueryClient();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [resourceTypeFilter, setResourceTypeFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');

  // Detail panel state
  const [detailPanelOpen, setDetailPanelOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);

  // Fetch calendar data from API
  const {
    data: calendarData,
    isLoading: isCalendarLoading,
    error: calendarError,
  } = useGetCalendarDayQuery(
    { date: formatDateForApi(currentDate) },
    { staleTime: 30000 }
  );

  // Fetch selected booking details
  const { data: bookingDetailData } = useGetBookingQuery(
    { id: selectedBookingId || '' },
    { enabled: !!selectedBookingId }
  );

  // Mutations
  const checkInMutation = useCheckInBookingMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.calendarDay({ date: formatDateForApi(currentDate) }) });
    },
  });

  const cancelMutation = useCancelBookingMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.calendarDay({ date: formatDateForApi(currentDate) }) });
      setDetailPanelOpen(false);
    },
  });

  // TODO: Add real-time subscription when WebSocket support is implemented
  // useBookingSubscription({
  //   date: formatDateForApi(currentDate),
  //   invalidateQueries: true,
  // });

  // Filter and transform resources
  const resources: CalendarResource[] = useMemo(() => {
    if (!calendarData?.calendarDay?.resources) return [];

    let filteredResources = calendarData.calendarDay.resources;

    // Filter by type if not 'all'
    if (resourceTypeFilter !== 'all') {
      filteredResources = filteredResources.filter((r) => r.type === resourceTypeFilter);
    }

    return filteredResources.map((r) => ({
      id: r.id,
      name: r.name,
      type: mapResourceType(r.type),
      subtitle: r.subtitle,
    }));
  }, [calendarData, resourceTypeFilter]);

  // Transform bookings, filtered by visible resources
  const bookings: CalendarBooking[] = useMemo(() => {
    if (!calendarData?.calendarDay?.bookings) return [];

    const resourceIds = new Set(resources.map((r) => r.id));

    return calendarData.calendarDay.bookings
      .filter((b) => resourceIds.has(b.resourceId))
      .map((b) => ({
        id: b.id,
        resourceId: b.resourceId,
        startTime: b.startTime,
        endTime: b.endTime,
        status: mapStatus(b.status),
        serviceName: b.serviceName,
        memberName: b.memberName,
        memberPhotoUrl: b.memberPhotoUrl,
        bufferBefore: b.bufferBefore,
        bufferAfter: b.bufferAfter,
      }));
  }, [calendarData, resources]);

  // Convert API booking to detail panel format
  const bookingDetail = useMemo(() => {
    if (!bookingDetailData?.booking) return null;
    const b = bookingDetailData.booking;

    const memberStatus: 'ACTIVE' | 'SUSPENDED' =
      b.member.status === 'ACTIVE' ? 'ACTIVE' : 'SUSPENDED';

    return {
      id: b.id,
      member: {
        name: `${b.member.firstName} ${b.member.lastName}`,
        number: b.member.memberId,
        status: memberStatus,
      },
      service: {
        name: b.service?.name || 'Facility Booking',
        duration: b.durationMinutes,
      },
      date: new Date(b.startTime),
      startTime: new Date(b.startTime).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      }),
      endTime: new Date(b.endTime).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      }),
      staff: b.staff ? { name: `${b.staff.firstName} ${b.staff.lastName}` } : undefined,
      facility: {
        name: b.resource?.name || b.facility?.name || 'Unknown',
      },
      pricing: b.pricing
        ? {
            base: b.pricing.basePrice,
            modifiers: b.pricing.modifiers.map((m) => ({
              label: m.label,
              amount: m.amount,
              isPercentage: m.isPercentage,
            })),
            total: b.pricing.total,
          }
        : { base: 0, modifiers: [], total: 0 },
      status: mapStatus(b.status),
      createdAt: new Date(b.createdAt),
      createdBy: 'System', // TODO: Add to GraphQL query when schema supports it
      checkedInAt: undefined, // TODO: Add to GraphQL query when schema supports it
      cancelledAt: undefined, // TODO: Add to GraphQL query when schema supports it
      cancelReason: undefined, // TODO: Add to GraphQL query when schema supports it
    };
  }, [bookingDetailData]);

  // Navigation
  const goToPrevDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 1);
    setCurrentDate(newDate);
  };

  const goToNextDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 1);
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  // Handlers
  const handleBookingClick = useCallback((bookingId: string) => {
    setSelectedBookingId(bookingId);
    setDetailPanelOpen(true);
  }, []);

  const handleSlotClick = useCallback(
    (_resourceId: string, _time: Date) => {
      openWizard(true);
    },
    [openWizard]
  );

  const handleCloseDetail = useCallback(() => {
    setDetailPanelOpen(false);
    setSelectedBookingId(null);
  }, []);

  const handleCheckIn = useCallback(async () => {
    if (!selectedBookingId) return;
    await checkInMutation.mutateAsync({ input: { bookingId: selectedBookingId } });
  }, [selectedBookingId, checkInMutation]);

  const handleCancel = useCallback(async () => {
    if (!selectedBookingId) return;
    await cancelMutation.mutateAsync({
      input: { id: selectedBookingId, reason: 'Cancelled by staff' },
    });
  }, [selectedBookingId, cancelMutation]);

  const handleNewBooking = () => {
    openWizard(true);
  };

  return (
    <div className="flex h-full flex-col p-6">
      <PageHeader
        title="Facility Booking"
        description="Manage facility reservations and scheduling"
        breadcrumbs={[{ label: 'Facility' }]}
        actions={
          <Button onClick={handleNewBooking}>
            <Plus className="mr-2 h-4 w-4" />
            New Booking
          </Button>
        }
      />

      {/* Calendar Controls */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 sm:gap-4">
          <Button variant="outline" size="icon" onClick={goToPrevDay}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="min-w-[200px] text-center text-lg font-semibold sm:min-w-[280px] sm:text-xl">
            {formatDate(currentDate)}
          </h2>
          <Button variant="outline" size="icon" onClick={goToNextDay}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={goToToday}>
            Today
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <select
            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={resourceTypeFilter}
            onChange={(e) => setResourceTypeFilter(e.target.value)}
          >
            {facilityTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
          <div className="flex rounded-md border border-border">
            <Button
              variant={viewMode === 'day' ? 'secondary' : 'ghost'}
              size="sm"
              className="rounded-r-none"
              onClick={() => setViewMode('day')}
            >
              Day
            </Button>
            <Button
              variant={viewMode === 'week' ? 'secondary' : 'ghost'}
              size="sm"
              className="rounded-l-none"
              onClick={() => setViewMode('week')}
            >
              Week
            </Button>
          </div>
        </div>
      </div>

      {/* Calendar View */}
      <div className="mt-6 flex-1 overflow-auto">
        {calendarError ? (
          <BookingErrorState
            variant="server"
            title="Failed to load calendar"
            description="Unable to load facility booking data. Please try again."
            onRetry={() => queryClient.invalidateQueries({ queryKey: ['GetCalendarDay'] })}
          />
        ) : isCalendarLoading ? (
          <CalendarDayViewSkeleton resourceCount={4} />
        ) : resources.length === 0 ? (
          <BookingEmptyState
            variant="no-facilities"
            title="No facilities found"
            description={resourceTypeFilter !== 'all'
              ? "No facilities match the selected filter. Try selecting 'All Facilities'."
              : "No facilities are configured yet."
            }
          />
        ) : (
          <CalendarDayView
            date={currentDate}
            resources={resources}
            bookings={bookings}
            operatingHours={{ start: '06:00', end: '22:00' }}
            onBookingClick={handleBookingClick}
            onSlotClick={handleSlotClick}
          />
        )}
      </div>

      {/* Booking Detail Panel */}
      <BookingDetailPanel
        isOpen={detailPanelOpen}
        onClose={handleCloseDetail}
        booking={bookingDetail}
        onCheckIn={handleCheckIn}
        onCancel={handleCancel}
        onModify={() => console.log('Modify')}
        onEdit={() => console.log('Edit')}
      />

      {/* Create Booking Modal */}
      <CreateBookingModal />
    </div>
  );
}

// ============================================================================
// PAGE COMPONENT
// ============================================================================

export default function FacilityPage() {
  return (
    <BookingProvider>
      <FacilityPageContent />
    </BookingProvider>
  );
}
