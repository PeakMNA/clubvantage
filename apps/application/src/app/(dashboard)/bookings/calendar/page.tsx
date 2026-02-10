'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react'
import { Button } from '@clubvantage/ui'
import {
  useGetCalendarDayQuery,
  useGetBookingQuery,
  useGetServicesQuery,
  useCheckInBookingMutation,
  useCancelBookingMutation,
  useRescheduleBookingMutation,
  useCreateBookingMutation,
  queryKeys,
} from '@clubvantage/api-client'
import { useBookingSubscription } from '@/components/bookings'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import {
  useBooking,
  CalendarDayView,
  CalendarDayViewSkeleton,
  WeekViewGrid,
  WeekViewGridSkeleton,
  BookingDetailPanel,
  BookingEmptyState,
  BookingErrorState,
  QuickBookingPopover,
  type QuickBookingContext,
  type QuickBookingResult,
  type QuickBookingService,
  type WeekViewBooking,
} from '@/components/bookings'
import type { CalendarResource, CalendarBooking } from '@/components/bookings'
import type { BookingStatus } from '@/components/bookings'

import {
  searchMembers,
  prepareQuickBooking,
  getAvailableSlots,
} from '../actions'

// Helper to get the Monday of the week containing the given date
function getWeekStartDate(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay() // 0=Sun, 1=Mon, ...
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
}

// Helper to format date for API
function formatDateForApi(date: Date): string {
  const isoDate = date.toISOString().split('T')[0]
  return isoDate || new Date().toISOString().split('T')[0]!
}

// Helper to map API status to component status
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

// Helper to map resource type
function mapResourceType(type: string): 'court' | 'spa' | 'studio' | 'pool' | 'room' {
  const typeMap: Record<string, 'court' | 'spa' | 'studio' | 'pool' | 'room'> = {
    COURT: 'court',
    SPA: 'spa',
    STUDIO: 'studio',
    POOL: 'pool',
    ROOM: 'room',
  }
  return typeMap[type] || 'room'
}

export default function BookingsCalendarPage() {
  const {
    selectedDate,
    setSelectedDate,
    viewMode,
    setViewMode,
    openWizard,
  } = useBooking()

  const router = useRouter()
  const queryClient = useQueryClient()
  const [detailPanelOpen, setDetailPanelOpen] = useState(false)
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null)
  const [rescheduleBookingId, setRescheduleBookingId] = useState<string | null>(null)

  // Quick booking state (declared early so `enabled` flag can reference it)
  const [quickBookContext, setQuickBookContext] = useState<QuickBookingContext | null>(null)
  const [isQuickBookOpen, setIsQuickBookOpen] = useState(false)

  // Fetch calendar data from API
  const {
    data: calendarData,
    isLoading: isCalendarLoading,
    error: calendarError,
  } = useGetCalendarDayQuery(
    { date: formatDateForApi(selectedDate) },
    { staleTime: 30000 }
  )

  // Fetch selected booking details
  const { data: bookingDetailData } = useGetBookingQuery(
    { id: selectedBookingId || '' },
    { enabled: !!selectedBookingId }
  )

  // Fetch services for quick booking (deferred until quick booking is opened)
  const { data: servicesData } = useGetServicesQuery(
    undefined,
    { enabled: isQuickBookOpen }
  )

  // Derive quick booking services from real data
  const quickBookingServices: QuickBookingService[] = useMemo(() => {
    if (!servicesData?.services) return []
    return servicesData.services
      .filter((s) => s.isActive)
      .map((s) => ({
        id: s.id,
        name: s.name,
        duration: s.durationMinutes,
        price: s.basePrice,
        category: s.category || 'Other',
      }))
  }, [servicesData])

  // Mutations
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

  const createBookingMutation = useCreateBookingMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.calendarDay({ date: formatDateForApi(selectedDate) }) })
      toast.success('Booking created successfully')
    },
    onError: (error: Error) => {
      toast.error('Failed to create booking', {
        description: error.message,
      })
    },
  })

  // Quick booking handlers
  const handleQuickBookSubmit = useCallback(async (result: QuickBookingResult) => {
    try {
      const prepared = await prepareQuickBooking({
        clubId: 'default-club',
        memberId: result.memberId,
        serviceId: result.serviceId,
        staffId: result.staffId,
        facilityId: result.facilityId,
        startTime: result.date,
        durationMinutes: result.duration,
      })

      if (!prepared.valid) {
        toast.error('Booking validation failed', {
          description: prepared.errors?.join(', '),
        })
        return
      }

      if (prepared.warnings?.length) {
        toast.warning('Booking created with warnings', {
          description: prepared.warnings.join(', '),
        })
      }

      const endTime = new Date(result.date)
      endTime.setMinutes(endTime.getMinutes() + result.duration)

      await createBookingMutation.mutateAsync({
        input: {
          bookingType: 'SERVICE',
          memberId: result.memberId,
          serviceId: result.serviceId,
          staffId: result.staffId,
          facilityId: result.facilityId,
          startTime: result.date.toISOString(),
          endTime: endTime.toISOString(),
        },
      })

      setIsQuickBookOpen(false)
    } catch (error) {
      console.error('Quick booking error:', error)
      throw error
    }
  }, [createBookingMutation])

  const handleOpenFullWizard = useCallback(() => {
    setIsQuickBookOpen(false)
    openWizard(true)
  }, [openWizard])

  const handleMemberSearch = useCallback(async (query: string) => {
    const results = await searchMembers(query)
    return results.map((m) => ({
      id: m.id,
      name: m.name,
      memberNumber: m.memberNumber,
      membershipType: m.membershipType,
      status: m.status,
    }))
  }, [])

  // Subscribe to real-time updates — invalidate calendar cache on any booking event
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

  // Transform API data to component format
  const resources: CalendarResource[] = useMemo(() => {
    if (!calendarData?.calendarDay?.resources) return []
    return calendarData.calendarDay.resources.map((r) => ({
      id: r.id,
      name: r.name,
      type: mapResourceType(r.type),
      subtitle: r.subtitle,
    }))
  }, [calendarData])

  const bookings: CalendarBooking[] = useMemo(() => {
    if (!calendarData?.calendarDay?.bookings) return []
    return calendarData.calendarDay.bookings.map((b) => ({
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
  }, [calendarData])

  // Transform bookings for week view (shows current day's data on the week grid)
  const weekViewBookings: WeekViewBooking[] = useMemo(() => {
    if (!calendarData?.calendarDay?.bookings) return []
    const dateStr = formatDateForApi(selectedDate)
    return calendarData.calendarDay.bookings.map((b) => ({
      id: b.id,
      resourceId: b.resourceId,
      date: dateStr,
      status: mapStatus(b.status),
      count: 1,
    }))
  }, [calendarData, selectedDate])

  const weekStartDate = useMemo(() => getWeekStartDate(selectedDate), [selectedDate])

  // Convert API booking to detail panel format
  const bookingDetail = useMemo(() => {
    if (!bookingDetailData?.booking) return null
    const b = bookingDetailData.booking

    const memberStatus: 'ACTIVE' | 'SUSPENDED' =
      b.member.status === 'ACTIVE' ? 'ACTIVE' : 'SUSPENDED'

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
      createdBy: 'System',
      checkedInAt: undefined,
      cancelledAt: undefined,
      cancelReason: undefined,
    }
  }, [bookingDetailData])

  // Date navigation
  const goToPrevDay = () => {
    const newDate = new Date(selectedDate)
    newDate.setDate(newDate.getDate() - 1)
    setSelectedDate(newDate)
  }

  const goToNextDay = () => {
    const newDate = new Date(selectedDate)
    newDate.setDate(newDate.getDate() + 1)
    setSelectedDate(newDate)
  }

  const goToToday = () => {
    setSelectedDate(new Date())
  }

  const formatDateDisplay = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  // Booking handlers
  const handleBookingClick = useCallback((bookingId: string) => {
    setSelectedBookingId(bookingId)
    setDetailPanelOpen(true)
  }, [])

  const handleSlotClick = useCallback((resourceId: string, time: Date) => {
    // Reschedule mode: move the booking to this slot
    if (rescheduleBookingId) {
      rescheduleMutation.mutate(
        {
          input: {
            id: rescheduleBookingId,
            newStartTime: time.toISOString(),
            newResourceId: resourceId,
          },
        },
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

    // Normal mode: open quick booking
    const resource = resources.find((r) => r.id === resourceId)
    const timeStr = `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}`

    setQuickBookContext({
      date: time,
      time: timeStr,
      facilityId: resourceId,
      facilityName: resource?.name || 'Unknown',
      resourceType: 'facility',
    })
    setIsQuickBookOpen(true)
  }, [resources, rescheduleBookingId, rescheduleMutation])

  const handleCloseDetail = useCallback(() => {
    setDetailPanelOpen(false)
    setSelectedBookingId(null)
  }, [])

  const handleCheckIn = useCallback(async () => {
    if (!selectedBookingId) return
    try {
      await checkInMutation.mutateAsync({ input: { bookingId: selectedBookingId } })
      toast.success('Member checked in successfully')
    } catch (error) {
      toast.error('Failed to check in')
    }
  }, [selectedBookingId, checkInMutation])

  const handleCancel = useCallback(async () => {
    if (!selectedBookingId) return
    try {
      await cancelMutation.mutateAsync({
        input: { id: selectedBookingId, reason: 'Cancelled by staff' },
      })
      toast.success('Booking cancelled')
    } catch (error) {
      toast.error('Failed to cancel booking')
    }
  }, [selectedBookingId, cancelMutation])

  // Modify handler: enter reschedule mode
  const handleModify = useCallback(() => {
    if (!selectedBookingId) return
    setRescheduleBookingId(selectedBookingId)
    setDetailPanelOpen(false)
    setSelectedBookingId(null)
    toast.info('Click a time slot on the calendar to reschedule this booking. Press Escape to cancel.', {
      duration: 8000,
    })
  }, [selectedBookingId])

  // Edit handler: open wizard with pre-filled data
  const handleEdit = useCallback(() => {
    setDetailPanelOpen(false)
    openWizard(true)
  }, [openWizard])

  // Member history handler: navigate to members page with search
  const handleViewMemberHistory = useCallback((memberNumber: string) => {
    router.push(`/members?search=${encodeURIComponent(memberNumber)}`)
  }, [router])

  // Week view: click a day cell to switch to day view for that date
  const handleWeekDayClick = useCallback((_resourceId: string, date: Date) => {
    setSelectedDate(date)
    setViewMode('day')
  }, [setSelectedDate, setViewMode])

  return (
    <>
      <div className="space-y-4 p-4 sm:p-6">
        {/* Calendar Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={goToPrevDay}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="min-w-[240px] text-center text-lg font-semibold sm:min-w-[280px]">
              {formatDateDisplay(selectedDate)}
            </h2>
            <Button variant="outline" size="icon" onClick={goToNextDay}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={goToToday}>
              Today
            </Button>
          </div>

          <div className="flex items-center gap-2">
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

        {/* Reschedule Mode Banner */}
        {rescheduleBookingId && (
          <div className="flex items-center justify-between rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 dark:border-amber-500/30 dark:bg-amber-500/10">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <span className="text-sm font-medium text-amber-800 dark:text-amber-200">
                Reschedule mode — click a time slot to move this booking
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

        {/* Calendar View */}
        {calendarError ? (
          <BookingErrorState
            variant="server"
            title="Failed to load calendar"
            description="Unable to load calendar data. Please try again."
            onRetry={() => queryClient.invalidateQueries({ queryKey: ['GetCalendarDay'] })}
          />
        ) : isCalendarLoading ? (
          viewMode === 'week' ? (
            <WeekViewGridSkeleton resourceCount={6} />
          ) : (
            <CalendarDayViewSkeleton resourceCount={6} />
          )
        ) : resources.length === 0 ? (
          <BookingEmptyState
            variant="no-data"
            title="No resources configured"
            description="No resources are configured for this facility."
          />
        ) : viewMode === 'week' ? (
          <WeekViewGrid
            startDate={weekStartDate}
            resources={resources}
            bookings={weekViewBookings}
            selectedDate={selectedDate}
            onDayClick={handleWeekDayClick}
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
            className="max-h-[calc(100vh-220px)]"
            onBookingReschedule={(bookingId, newResourceId, newStartTime) => {
              rescheduleMutation.mutate(
                { input: { id: bookingId, newStartTime, newResourceId } },
                {
                  onSuccess: () => {
                    toast.success('Booking rescheduled successfully');
                  },
                  onError: () => {
                    toast.error('Could not reschedule this booking');
                  },
                }
              );
            }}
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
        onModify={handleModify}
        onEdit={handleEdit}
        onViewMemberHistory={handleViewMemberHistory}
      />

      {/* Quick Booking Popover */}
      {quickBookContext && (
        <QuickBookingPopover
          open={isQuickBookOpen}
          context={quickBookContext}
          services={quickBookingServices}
          onSubmit={handleQuickBookSubmit}
          onOpenFullWizard={handleOpenFullWizard}
          onClose={() => setIsQuickBookOpen(false)}
          onSearchMembers={handleMemberSearch}
          onCheckAvailability={async (_serviceId, duration) => {
            const availability = await getAvailableSlots({
              clubId: 'current',
              date: quickBookContext.date,
              staffId: quickBookContext.staffId,
              facilityId: quickBookContext.facilityId,
              durationMinutes: duration,
            })
            if (!availability) return ['Could not check availability']
            const selectedTime = quickBookContext.time
            const slot = availability.slots?.find((s) => s.time === selectedTime)
            if (!slot) return []
            if (slot.status === 'unavailable') {
              return [slot.unavailableReason || 'This time slot is not available']
            }
            if (slot.status === 'limited') {
              return ['Limited availability — some resources may be occupied']
            }
            return []
          }}
          isSubmitting={createBookingMutation.isPending}
        />
      )}
    </>
  )
}
