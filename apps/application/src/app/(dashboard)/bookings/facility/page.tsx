'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { cn, Button } from '@clubvantage/ui'
import { ChevronLeft, ChevronRight, AlertCircle, Building2, Sparkles, Dumbbell, Waves, DoorOpen } from 'lucide-react'
import {
  useGetCalendarDayQuery,
  useGetBookingQuery,
  useRescheduleBookingMutation,
  useCheckInBookingMutation,
  useCancelBookingMutation,
  queryKeys,
} from '@clubvantage/api-client'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import {
  useBooking,
  CalendarDayView,
  CalendarDayViewSkeleton,
  BookingDetailPanel,
  BookingEmptyState,
  BookingErrorState,
  BookingCreationSheet,
  useBookingSubscription,
} from '@/components/bookings'
import type { CalendarResource, CalendarBooking } from '@/components/bookings'
import type { BookingStatus } from '@/components/bookings'

// ============================================================================
// HELPERS
// ============================================================================

function formatDateForApi(date: Date): string {
  return date.toISOString().split('T')[0] || new Date().toISOString().split('T')[0]!
}

function mapStatus(status: string): BookingStatus {
  const statusMap: Record<string, BookingStatus> = {
    PENDING: 'CONFIRMED' as BookingStatus,
    CONFIRMED: 'CONFIRMED' as BookingStatus,
    CHECKED_IN: 'CHECKED_IN' as BookingStatus,
    IN_PROGRESS: 'IN_PROGRESS' as BookingStatus,
    COMPLETED: 'COMPLETED' as BookingStatus,
    CANCELLED: 'CANCELLED' as BookingStatus,
    NO_SHOW: 'NO_SHOW' as BookingStatus,
  }
  return statusMap[status] || ('CONFIRMED' as BookingStatus)
}

function mapResourceType(type: string): CalendarResource['type'] {
  const typeMap: Record<string, CalendarResource['type']> = {
    COURT: 'court',
    SPA: 'spa',
    STUDIO: 'studio',
    POOL: 'pool',
    ROOM: 'room',
  }
  return typeMap[type] || 'room'
}

function formatDateDisplay(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

// ============================================================================
// FACILITY TYPE SUB-TABS
// ============================================================================

type FacilityTypeFilter = 'all' | 'court' | 'spa' | 'studio' | 'pool' | 'room'

const facilityTypeConfig: Array<{
  id: FacilityTypeFilter
  label: string
  icon: typeof Building2
}> = [
  { id: 'all', label: 'All', icon: Building2 },
  { id: 'court', label: 'Courts', icon: Building2 },
  { id: 'spa', label: 'Spa', icon: Sparkles },
  { id: 'studio', label: 'Studios', icon: Dumbbell },
  { id: 'pool', label: 'Pools', icon: Waves },
  { id: 'room', label: 'Rooms', icon: DoorOpen },
]

// ============================================================================
// PAGE
// ============================================================================

export default function BookingsFacilityPage() {
  const { selectedDate, setSelectedDate, bookingSheet, openBookingSheet, closeBookingSheet } = useBooking()
  const router = useRouter()
  const queryClient = useQueryClient()

  // Local state
  const [facilityType, setFacilityType] = useState<FacilityTypeFilter>('all')
  const [detailPanelOpen, setDetailPanelOpen] = useState(false)
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null)
  const [rescheduleBookingId, setRescheduleBookingId] = useState<string | null>(null)

  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  const {
    data: calendarData,
    isLoading,
    error,
  } = useGetCalendarDayQuery(
    { date: formatDateForApi(selectedDate) },
    { staleTime: 30000 }
  )

  const { data: bookingDetailData } = useGetBookingQuery(
    { id: selectedBookingId || '' },
    { enabled: !!selectedBookingId }
  )

  // ============================================================================
  // MUTATIONS
  // ============================================================================

  const checkInMutation = useCheckInBookingMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.calendarDay({ date: formatDateForApi(selectedDate) }) })
    },
  })

  const cancelMutation = useCancelBookingMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.calendarDay({ date: formatDateForApi(selectedDate) }) })
      setDetailPanelOpen(false)
    },
  })

  const rescheduleMutation = useRescheduleBookingMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.calendarDay({ date: formatDateForApi(selectedDate) }) })
    },
  })

  // ============================================================================
  // REAL-TIME UPDATES
  // ============================================================================

  const invalidateCalendar = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: queryKeys.bookings.calendarDay({ date: formatDateForApi(selectedDate) }),
    })
  }, [queryClient, selectedDate])

  useBookingSubscription({
    date: selectedDate,
    onBookingCreated: invalidateCalendar,
    onBookingUpdated: invalidateCalendar,
    onBookingCancelled: invalidateCalendar,
    onBookingRescheduled: invalidateCalendar,
  })

  // ============================================================================
  // TRANSFORMS
  // ============================================================================

  // All resources from API
  const allResources: CalendarResource[] = useMemo(() => {
    if (!calendarData?.calendarDay?.resources) return []
    return calendarData.calendarDay.resources.map((r) => ({
      id: r.id,
      name: r.name,
      type: mapResourceType(r.type),
      subtitle: r.subtitle,
    }))
  }, [calendarData])

  // Filtered resources by facility type sub-tab
  const resources = useMemo(() => {
    if (facilityType === 'all') return allResources
    return allResources.filter((r) => r.type === facilityType)
  }, [allResources, facilityType])

  // Derive which facility type sub-tabs have resources
  const availableTypes = useMemo(() => {
    const types = new Set(allResources.map((r) => r.type))
    return facilityTypeConfig.filter((t) => t.id === 'all' || types.has(t.id as CalendarResource['type']))
  }, [allResources])

  // Bookings filtered to visible resources
  const bookings: CalendarBooking[] = useMemo(() => {
    if (!calendarData?.calendarDay?.bookings) return []
    const visibleResourceIds = new Set(resources.map((r) => r.id))
    return calendarData.calendarDay.bookings
      .filter((b) => visibleResourceIds.has(b.resourceId))
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
      }))
  }, [calendarData, resources])

  // Booking detail for the side panel
  const bookingDetail = useMemo(() => {
    if (!bookingDetailData?.booking) return null
    const b = bookingDetailData.booking
    const memberStatus: 'ACTIVE' | 'SUSPENDED' = b.member.status === 'ACTIVE' ? 'ACTIVE' : 'SUSPENDED'

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
      startTime: new Date(b.startTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      endTime: new Date(b.endTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      staff: b.staff ? { name: `${b.staff.firstName} ${b.staff.lastName}` } : undefined,
      facility: { name: b.resource?.name || b.facility?.name || 'Unknown' },
      pricing: b.pricing
        ? {
            base: b.pricing.basePrice,
            modifiers: b.pricing.modifiers.map((m) => ({ label: m.label, amount: m.amount, isPercentage: m.isPercentage })),
            total: b.pricing.total,
          }
        : { base: 0, modifiers: [], total: 0 },
      status: mapStatus(b.status),
      createdAt: new Date(b.createdAt),
      createdBy: 'System',
      checkedInAt: undefined,
      cancelledAt: undefined,
      cancelReason: undefined,
    }
  }, [bookingDetailData])

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const goToPrevDay = () => {
    const d = new Date(selectedDate)
    d.setDate(d.getDate() - 1)
    setSelectedDate(d)
  }

  const goToNextDay = () => {
    const d = new Date(selectedDate)
    d.setDate(d.getDate() + 1)
    setSelectedDate(d)
  }

  const goToToday = () => setSelectedDate(new Date())

  const handleBookingClick = useCallback((bookingId: string) => {
    setSelectedBookingId(bookingId)
    setDetailPanelOpen(true)
  }, [])

  const handleSlotClick = useCallback(
    (resourceId: string, time: Date) => {
      // Reschedule mode
      if (rescheduleBookingId) {
        rescheduleMutation.mutate(
          { input: { id: rescheduleBookingId, newStartTime: time.toISOString(), newResourceId: resourceId } },
          {
            onSuccess: () => {
              toast.success('Booking rescheduled successfully')
              setRescheduleBookingId(null)
            },
            onError: () => {
              toast.error('Failed to reschedule booking')
              setRescheduleBookingId(null)
            },
          }
        )
        return
      }

      // Normal mode: open booking creation sheet
      const resource = resources.find((r) => r.id === resourceId)
      const timeStr = `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}`

      openBookingSheet({
        facilityId: resourceId,
        facilityName: resource?.name,
        date: selectedDate,
        startTime: timeStr,
      })
    },
    [resources, rescheduleBookingId, rescheduleMutation, openBookingSheet, selectedDate]
  )

  const handleCloseDetail = useCallback(() => {
    setDetailPanelOpen(false)
    setSelectedBookingId(null)
  }, [])

  const handleCheckIn = useCallback(async () => {
    if (!selectedBookingId) return
    try {
      await checkInMutation.mutateAsync({ input: { bookingId: selectedBookingId } })
      toast.success('Member checked in')
    } catch {
      toast.error('Failed to check in')
    }
  }, [selectedBookingId, checkInMutation])

  const handleCancel = useCallback(async () => {
    if (!selectedBookingId) return
    try {
      await cancelMutation.mutateAsync({ input: { id: selectedBookingId, reason: 'Cancelled by staff' } })
      toast.success('Booking cancelled')
    } catch {
      toast.error('Failed to cancel')
    }
  }, [selectedBookingId, cancelMutation])

  const handleModify = useCallback(() => {
    if (!selectedBookingId) return
    setRescheduleBookingId(selectedBookingId)
    setDetailPanelOpen(false)
    setSelectedBookingId(null)
    toast.info('Click a time slot to reschedule this booking. Press Escape to cancel.', { duration: 8000 })
  }, [selectedBookingId])

  const handleViewMemberHistory = useCallback(
    (memberNumber: string) => {
      router.push(`/members?search=${encodeURIComponent(memberNumber)}`)
    },
    [router]
  )

  // Escape key exits reschedule mode
  useEffect(() => {
    if (!rescheduleBookingId) return
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setRescheduleBookingId(null)
        toast.dismiss()
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [rescheduleBookingId])

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <>
      <div className="flex h-full flex-col">
        {/* Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 pt-4 sm:px-6">
          {/* Date Navigation */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={goToPrevDay}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="min-w-[220px] text-center text-sm font-semibold sm:min-w-[260px] sm:text-base">
              {formatDateDisplay(selectedDate)}
            </h2>
            <Button variant="outline" size="icon" onClick={goToNextDay}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={goToToday}>
              Today
            </Button>
          </div>
        </div>

        {/* Facility Type Sub-Tabs */}
        <div className="flex gap-1 overflow-x-auto px-4 py-2 sm:px-6">
          {availableTypes.map((tab) => {
            const Icon = tab.icon
            const isActive = tab.id === facilityType
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFacilityType(tab.id)}
                className={cn(
                  'flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
                  isActive
                    ? 'bg-amber-500 text-white'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-400 dark:hover:bg-stone-700'
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Reschedule Banner */}
        {rescheduleBookingId && (
          <div className="mx-4 flex items-center justify-between rounded-lg border border-amber-300 bg-amber-50 px-4 py-2.5 sm:mx-6 dark:border-amber-500/30 dark:bg-amber-500/10">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <span className="text-sm font-medium text-amber-800 dark:text-amber-200">
                Reschedule mode — click a slot to move this booking
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setRescheduleBookingId(null)}
              className="text-amber-700 hover:text-amber-900 dark:text-amber-300"
            >
              Cancel
            </Button>
          </div>
        )}

        {/* Calendar Grid */}
        <div className="flex-1 overflow-hidden px-4 pb-4 pt-1 sm:px-6">
          {error ? (
            <BookingErrorState
              variant="server"
              title="Failed to load calendar"
              description="Unable to load facility calendar data."
              onRetry={() => queryClient.invalidateQueries({ queryKey: ['GetCalendarDay'] })}
            />
          ) : isLoading ? (
            <CalendarDayViewSkeleton resourceCount={4} className="h-full" />
          ) : resources.length === 0 ? (
            <BookingEmptyState
              variant="no-data"
              title={facilityType === 'all' ? 'No facilities configured' : `No ${facilityType} facilities found`}
              description="Try selecting a different facility type or check facility configuration."
            />
          ) : (
            <CalendarDayView
              date={selectedDate}
              resources={resources}
              bookings={bookings}
              operatingHours={{ start: '06:00', end: '22:00' }}
              onBookingClick={handleBookingClick}
              onSlotClick={handleSlotClick}
              enableDragDrop={!rescheduleBookingId}
              className="max-h-[calc(100vh-260px)]"
              onBookingReschedule={(bookingId, newResourceId, newStartTime) => {
                rescheduleMutation.mutate(
                  { input: { id: bookingId, newStartTime, newResourceId } },
                  {
                    onSuccess: () => toast.success('Booking rescheduled'),
                    onError: () => toast.error('Could not reschedule'),
                  }
                )
              }}
            />
          )}
        </div>
      </div>

      {/* Booking Detail Panel */}
      <BookingDetailPanel
        isOpen={detailPanelOpen}
        onClose={handleCloseDetail}
        booking={bookingDetail}
        onCheckIn={handleCheckIn}
        onCancel={handleCancel}
        onModify={handleModify}
        onViewMemberHistory={handleViewMemberHistory}
      />

      {/* Booking Creation Sheet */}
      <BookingCreationSheet
        open={bookingSheet.isOpen}
        onOpenChange={(open) => { if (!open) closeBookingSheet() }}
        prefilled={bookingSheet.prefilled}
        onSuccess={() => toast.success('Booking created successfully')}
      />
    </>
  )
}
