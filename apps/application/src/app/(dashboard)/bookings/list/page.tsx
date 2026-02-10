'use client'

import { useState, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { cn, Button } from '@clubvantage/ui'
import {
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List,
  Calendar as CalendarIcon,
  User,
  Building2,
  Briefcase,
  Clock,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react'
import {
  useGetBookingsQuery,
  useGetBookingStatsQuery,
  useGetBookingQuery,
  useCheckInBookingMutation,
  useCancelBookingMutation,
} from '@clubvantage/api-client'
import type { BookingStatus as ApiBookingStatus } from '@clubvantage/api-client'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import {
  useBooking,
  BookingStatusBadge,
  BookingDetailPanel,
  BookingEmptyState,
  BookingErrorState,
  BookingSearchBar,
} from '@/components/bookings'
import type { BookingStatus } from '@/components/bookings'

// ============================================================================
// TYPES
// ============================================================================

type ViewMode = 'cards' | 'list'

interface BookingRow {
  id: string
  bookingNumber: string
  memberName: string
  memberNumber: string
  memberPhotoUrl?: string | null
  serviceName: string
  facilityName: string
  staffName: string
  startTime: string
  endTime: string
  date: Date
  status: ApiBookingStatus
  total: number
}

// ============================================================================
// CONSTANTS
// ============================================================================

const PAGE_SIZE = 20

const STATUS_FILTERS: Array<{ value: ApiBookingStatus; label: string }> = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'CHECKED_IN', label: 'Checked In' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'NO_SHOW', label: 'No Show' },
]

// ============================================================================
// HELPERS
// ============================================================================

function formatDateForApi(date: Date): string {
  return date.toISOString().split('T')[0] || new Date().toISOString().split('T')[0]!
}

function formatDateDisplay(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

function formatTime(isoString: string): string {
  const d = new Date(isoString)
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function mapStatus(status: string): BookingStatus {
  const statusMap: Record<string, BookingStatus> = {
    PENDING: 'PENDING' as BookingStatus,
    CONFIRMED: 'CONFIRMED' as BookingStatus,
    CHECKED_IN: 'CHECKED_IN' as BookingStatus,
    IN_PROGRESS: 'IN_PROGRESS' as BookingStatus,
    COMPLETED: 'COMPLETED' as BookingStatus,
    CANCELLED: 'CANCELLED' as BookingStatus,
    NO_SHOW: 'NO_SHOW' as BookingStatus,
  }
  return statusMap[status] || ('CONFIRMED' as BookingStatus)
}

// ============================================================================
// PAGE
// ============================================================================

export default function BookingsListPage() {
  const { selectedDate, setSelectedDate } = useBooking()
  const router = useRouter()
  const queryClient = useQueryClient()

  // View & filter state
  const [viewMode, setViewMode] = useState<ViewMode>('cards')
  const [statusFilters, setStatusFilters] = useState<ApiBookingStatus[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(0)

  // Detail panel
  const [detailPanelOpen, setDetailPanelOpen] = useState(false)
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null)

  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  const startDate = formatDateForApi(selectedDate)
  // Show bookings for the selected day
  const endDate = startDate

  const {
    data: bookingsData,
    isLoading,
    error,
  } = useGetBookingsQuery({
    startDate,
    endDate,
    statuses: statusFilters.length > 0 ? statusFilters : undefined,
    first: PAGE_SIZE,
    skip: page * PAGE_SIZE,
  })

  const { data: statsData } = useGetBookingStatsQuery()

  const { data: bookingDetailData } = useGetBookingQuery(
    { id: selectedBookingId || '' },
    { enabled: !!selectedBookingId }
  )

  // ============================================================================
  // MUTATIONS
  // ============================================================================

  const checkInMutation = useCheckInBookingMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['GetBookings'] })
      queryClient.invalidateQueries({ queryKey: ['GetBookingStats'] })
    },
  })

  const cancelMutation = useCancelBookingMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['GetBookings'] })
      queryClient.invalidateQueries({ queryKey: ['GetBookingStats'] })
      setDetailPanelOpen(false)
    },
  })

  // ============================================================================
  // TRANSFORMS
  // ============================================================================

  const bookings: BookingRow[] = useMemo(() => {
    if (!bookingsData?.bookings?.edges) return []
    return bookingsData.bookings.edges.map((edge) => {
      const b = edge.node
      return {
        id: b.id,
        bookingNumber: b.bookingNumber,
        memberName: `${b.member.firstName} ${b.member.lastName}`,
        memberNumber: b.member.memberId,
        memberPhotoUrl: b.member.photoUrl,
        serviceName: b.service?.name || 'Facility Booking',
        facilityName: b.facility?.name || '—',
        staffName: b.staff ? `${b.staff.firstName} ${b.staff.lastName}` : '—',
        startTime: b.startTime,
        endTime: b.endTime,
        date: new Date(b.startTime),
        status: b.status,
        total: b.pricing?.total ?? 0,
      }
    })
  }, [bookingsData])

  // Filter by search query (client-side on current page)
  const filteredBookings = useMemo(() => {
    if (!searchQuery) return bookings
    const q = searchQuery.toLowerCase()
    return bookings.filter(
      (b) =>
        b.bookingNumber.toLowerCase().includes(q) ||
        b.memberName.toLowerCase().includes(q) ||
        b.memberNumber.toLowerCase().includes(q) ||
        b.serviceName.toLowerCase().includes(q) ||
        b.staffName.toLowerCase().includes(q)
    )
  }, [bookings, searchQuery])

  const totalCount = bookingsData?.bookings?.totalCount ?? 0
  const pageInfo = bookingsData?.bookings?.pageInfo
  const totalPages = Math.ceil(totalCount / PAGE_SIZE)

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
      facility: { name: b.facility?.name || 'Unknown' },
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
    }
  }, [bookingDetailData])

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const goToPrevDay = () => {
    const d = new Date(selectedDate)
    d.setDate(d.getDate() - 1)
    setSelectedDate(d)
    setPage(0)
  }

  const goToNextDay = () => {
    const d = new Date(selectedDate)
    d.setDate(d.getDate() + 1)
    setSelectedDate(d)
    setPage(0)
  }

  const goToToday = () => {
    setSelectedDate(new Date())
    setPage(0)
  }

  const toggleStatusFilter = useCallback((status: ApiBookingStatus) => {
    setStatusFilters((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    )
    setPage(0)
  }, [])

  const handleBookingClick = useCallback((bookingId: string) => {
    setSelectedBookingId(bookingId)
    setDetailPanelOpen(true)
  }, [])

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

  const handleViewMemberHistory = useCallback(
    (memberNumber: string) => {
      router.push(`/members?search=${encodeURIComponent(memberNumber)}`)
    },
    [router]
  )

  // ============================================================================
  // RENDER
  // ============================================================================

  const stats = statsData?.bookingStats

  return (
    <>
      <div className="flex h-full flex-col">
        {/* Stats Summary Cards */}
        {stats && (
          <div className="grid grid-cols-2 gap-3 px-4 pt-4 sm:grid-cols-3 lg:grid-cols-6 sm:px-6">
            <StatCard label="Today" value={stats.todayBookings} />
            <StatCard label="Confirmed" value={stats.confirmedBookings} color="blue" />
            <StatCard label="Checked In" value={stats.checkedInBookings} color="emerald" />
            <StatCard label="Completed" value={stats.completedBookings} color="stone" />
            <StatCard label="No Shows" value={stats.noShows} color="red" />
            <StatCard label="Utilization" value={`${Math.round(stats.utilizationRate)}%`} color="amber" />
          </div>
        )}

        {/* Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 pt-3 sm:px-6">
          {/* Left: Search */}
          <div className="w-full sm:w-72">
            <BookingSearchBar
              placeholder="Search bookings..."
              value={searchQuery}
              onChange={setSearchQuery}
            />
          </div>

          {/* Right: View Toggle + Date Navigation */}
          <div className="flex items-center gap-3">
            {/* View Toggle */}
            <div className="flex rounded-lg border border-border p-0.5">
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={cn(
                  'flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
                  viewMode === 'cards'
                    ? 'bg-amber-500 text-white'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                Cards
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={cn(
                  'flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
                  viewMode === 'list'
                    ? 'bg-amber-500 text-white'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <List className="h-3.5 w-3.5" />
                List
              </button>
            </div>

            {/* Date Navigation */}
            <div className="flex items-center gap-1.5">
              <Button variant="outline" size="icon" onClick={goToPrevDay}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <button
                type="button"
                onClick={goToToday}
                className="flex items-center gap-1 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
              >
                <CalendarIcon className="h-3.5 w-3.5" />
                {formatDateDisplay(selectedDate)}
              </button>
              <Button variant="outline" size="icon" onClick={goToNextDay}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Status Filter Chips */}
        <div className="flex gap-1.5 overflow-x-auto px-4 pt-2 sm:px-6">
          {STATUS_FILTERS.map((sf) => {
            const isActive = statusFilters.includes(sf.value)
            return (
              <button
                key={sf.value}
                type="button"
                onClick={() => toggleStatusFilter(sf.value)}
                className={cn(
                  'whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium transition-colors',
                  isActive
                    ? 'bg-amber-500 text-white'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-400'
                )}
              >
                {sf.label}
              </button>
            )
          })}
          {statusFilters.length > 0 && (
            <button
              type="button"
              onClick={() => setStatusFilters([])}
              className="whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium text-stone-500 hover:text-stone-700 dark:text-stone-400"
            >
              Clear
            </button>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto px-4 pb-4 pt-3 sm:px-6">
          {error ? (
            <BookingErrorState
              variant="server"
              title="Failed to load bookings"
              description="Unable to fetch booking data."
              onRetry={() => queryClient.invalidateQueries({ queryKey: ['GetBookings'] })}
            />
          ) : isLoading ? (
            viewMode === 'cards' ? <CardsViewSkeleton /> : <ListViewSkeleton />
          ) : filteredBookings.length === 0 ? (
            <BookingEmptyState
              variant="no-data"
              title={searchQuery ? 'No bookings match your search' : 'No bookings for this date'}
              description={searchQuery ? 'Try a different search term.' : 'Try selecting a different date or clear your filters.'}
            />
          ) : viewMode === 'cards' ? (
            <CardsView bookings={filteredBookings} onBookingClick={handleBookingClick} />
          ) : (
            <ListView bookings={filteredBookings} onBookingClick={handleBookingClick} />
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
              <p className="text-xs text-muted-foreground">
                Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, totalCount)} of {totalCount}
              </p>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  disabled={page === 0}
                  onClick={() => setPage(0)}
                >
                  <ChevronsLeft className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  disabled={page === 0}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </Button>
                <span className="px-2 text-xs font-medium text-foreground">
                  {page + 1} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  disabled={!pageInfo?.hasNextPage}
                  onClick={() => setPage((p) => p + 1)}
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  disabled={!pageInfo?.hasNextPage}
                  onClick={() => setPage(totalPages - 1)}
                >
                  <ChevronsRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
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
        onViewMemberHistory={handleViewMemberHistory}
      />
    </>
  )
}

// ============================================================================
// STAT CARD
// ============================================================================

function StatCard({
  label,
  value,
  color = 'stone',
}: {
  label: string
  value: number | string
  color?: 'blue' | 'emerald' | 'amber' | 'red' | 'stone'
}) {
  const colorClasses = {
    blue: 'text-blue-600 dark:text-blue-400',
    emerald: 'text-emerald-600 dark:text-emerald-400',
    amber: 'text-amber-600 dark:text-amber-400',
    red: 'text-red-600 dark:text-red-400',
    stone: 'text-stone-600 dark:text-stone-400',
  }

  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn('text-xl font-bold', colorClasses[color])}>{value}</p>
    </div>
  )
}

// ============================================================================
// CARDS VIEW
// ============================================================================

function CardsView({
  bookings,
  onBookingClick,
}: {
  bookings: BookingRow[]
  onBookingClick: (id: string) => void
}) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {bookings.map((b) => (
        <button
          key={b.id}
          type="button"
          onClick={() => onBookingClick(b.id)}
          className="flex flex-col gap-2.5 rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-amber-300 hover:shadow-md dark:hover:border-amber-500/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40"
        >
          {/* Header: booking # + status */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground">{b.bookingNumber}</span>
            <BookingStatusBadge status={mapStatus(b.status)} size="sm" />
          </div>

          {/* Service */}
          <div className="flex items-center gap-1.5">
            <Briefcase className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <span className="truncate text-sm font-medium text-foreground">{b.serviceName}</span>
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1 truncate">
              <User className="h-3 w-3 shrink-0" />
              {b.memberName}
            </span>
            <span className="flex items-center gap-1 truncate">
              <Building2 className="h-3 w-3 shrink-0" />
              {b.facilityName}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3 shrink-0" />
              {formatTime(b.startTime)}
            </span>
            {b.staffName !== '—' && (
              <span className="truncate">{b.staffName}</span>
            )}
          </div>

          {/* Price */}
          {b.total > 0 && (
            <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">
              {formatCurrency(b.total)}
            </p>
          )}
        </button>
      ))}
    </div>
  )
}

// ============================================================================
// LIST VIEW
// ============================================================================

function ListView({
  bookings,
  onBookingClick,
}: {
  bookings: BookingRow[]
  onBookingClick: (id: string) => void
}) {
  return (
    <div className="overflow-auto rounded-lg border border-border">
      {/* Header */}
      <div className="sticky top-0 z-10 flex border-b border-border bg-muted/50 text-xs font-medium text-muted-foreground">
        <div className="w-[100px] shrink-0 px-3 py-2.5">#</div>
        <div className="w-[160px] shrink-0 px-3 py-2.5">Member</div>
        <div className="w-[140px] shrink-0 px-3 py-2.5">Service</div>
        <div className="w-[120px] shrink-0 px-3 py-2.5">Facility</div>
        <div className="w-[120px] shrink-0 px-3 py-2.5">Staff</div>
        <div className="w-[100px] shrink-0 px-3 py-2.5">Time</div>
        <div className="w-[90px] shrink-0 px-3 py-2.5 text-right">Amount</div>
        <div className="w-[100px] shrink-0 px-3 py-2.5 text-center">Status</div>
      </div>

      {/* Rows */}
      {bookings.map((b) => (
        <button
          key={b.id}
          type="button"
          onClick={() => onBookingClick(b.id)}
          className="flex w-full border-b border-border text-left transition-colors last:border-b-0 hover:bg-muted/30 focus:outline-none focus-visible:bg-amber-50 dark:focus-visible:bg-amber-500/10"
        >
          <div className="w-[100px] shrink-0 px-3 py-2.5">
            <span className="text-xs font-semibold text-foreground">{b.bookingNumber}</span>
          </div>
          <div className="w-[160px] shrink-0 px-3 py-2.5">
            <p className="truncate text-sm font-medium text-foreground">{b.memberName}</p>
            <p className="truncate text-xs text-muted-foreground">{b.memberNumber}</p>
          </div>
          <div className="w-[140px] shrink-0 px-3 py-2.5">
            <span className="truncate text-sm text-foreground">{b.serviceName}</span>
          </div>
          <div className="w-[120px] shrink-0 px-3 py-2.5">
            <span className="truncate text-sm text-muted-foreground">{b.facilityName}</span>
          </div>
          <div className="w-[120px] shrink-0 px-3 py-2.5">
            <span className="truncate text-sm text-muted-foreground">{b.staffName}</span>
          </div>
          <div className="w-[100px] shrink-0 px-3 py-2.5">
            <span className="text-sm text-foreground">{formatTime(b.startTime)}</span>
          </div>
          <div className="w-[90px] shrink-0 px-3 py-2.5 text-right">
            <span className="text-sm font-medium text-foreground">
              {b.total > 0 ? formatCurrency(b.total) : '—'}
            </span>
          </div>
          <div className="flex w-[100px] shrink-0 items-center justify-center px-3 py-2.5">
            <BookingStatusBadge status={mapStatus(b.status)} size="sm" />
          </div>
        </button>
      ))}
    </div>
  )
}

// ============================================================================
// SKELETONS
// ============================================================================

function CardsViewSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-2.5 rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <div className="h-4 w-16 animate-pulse rounded bg-muted" />
            <div className="h-5 w-20 animate-pulse rounded-full bg-muted" />
          </div>
          <div className="h-4 w-32 animate-pulse rounded bg-muted" />
          <div className="grid grid-cols-2 gap-2">
            <div className="h-3 w-20 animate-pulse rounded bg-muted" />
            <div className="h-3 w-16 animate-pulse rounded bg-muted" />
          </div>
          <div className="h-4 w-14 animate-pulse rounded bg-muted" />
        </div>
      ))}
    </div>
  )
}

function ListViewSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <div className="flex border-b border-border bg-muted/50">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="w-[120px] shrink-0 px-3 py-2.5">
            <div className="h-3 w-16 animate-pulse rounded bg-muted" />
          </div>
        ))}
      </div>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex border-b border-border last:border-b-0">
          {Array.from({ length: 8 }).map((_, j) => (
            <div key={j} className="w-[120px] shrink-0 px-3 py-3">
              <div className="h-3.5 w-full max-w-[80px] animate-pulse rounded bg-muted" />
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
