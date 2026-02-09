'use client'

import { cn } from '@clubvantage/ui'
import { Search, Calendar, Loader2, CalendarX2 } from 'lucide-react'
import type { BookingStatus } from './types'
import { FlightStatusBadge } from './flight-status-badge'

interface BookingsTabProps {
  bookings: Array<{
    id: string
    bookingNumber: string
    date: string
    teeTime: string
    courseName: string
    bookerName: string
    playerCount: number
    status: BookingStatus
  }>
  isLoading?: boolean
  searchQuery: string
  onSearchChange: (query: string) => void
  onBookingSelect: (bookingId: string) => void
}

// Format date string to "Jan 28" format
function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// Format time string to "06:00" format
function formatTime(timeString: string): string {
  // If already in HH:mm format, return as is
  if (/^\d{2}:\d{2}$/.test(timeString)) {
    return timeString
  }
  // Otherwise try to parse and format
  const date = new Date(`1970-01-01T${timeString}`)
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
}

function SkeletonRow() {
  return (
    <tr className="border-b border-stone-200 dark:border-stone-700 animate-pulse">
      <td className="py-3 px-4"><div className="h-4 w-28 bg-stone-200 dark:bg-stone-700 rounded" /></td>
      <td className="py-3 px-4"><div className="h-4 w-14 bg-stone-200 dark:bg-stone-700 rounded" /></td>
      <td className="py-3 px-4"><div className="h-4 w-12 bg-stone-200 dark:bg-stone-700 rounded" /></td>
      <td className="py-3 px-4"><div className="h-4 w-16 bg-stone-200 dark:bg-stone-700 rounded" /></td>
      <td className="py-3 px-4"><div className="h-4 w-24 bg-stone-200 dark:bg-stone-700 rounded" /></td>
      <td className="py-3 px-4"><div className="h-4 w-8 bg-stone-200 dark:bg-stone-700 rounded" /></td>
      <td className="py-3 px-4"><div className="h-6 w-16 bg-stone-200 dark:bg-stone-700 rounded-full" /></td>
    </tr>
  )
}

export function BookingsTab({
  bookings,
  isLoading,
  searchQuery,
  onSearchChange,
  onBookingSelect,
}: BookingsTabProps) {
  const hasFilters = searchQuery.trim().length > 0

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400 dark:text-stone-500" />
        <input
          type="text"
          placeholder="Search by booking #, member, or name..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className={cn(
            'w-full h-12 pl-12 pr-4 border border-stone-300 dark:border-stone-600 rounded-xl',
            'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500',
            'focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent',
            'transition-all duration-200'
          )}
        />
      </div>

      {/* Filter Bar (Placeholder) */}
      <div className="flex items-center gap-3 py-3">
        <span className="text-sm text-stone-500 dark:text-stone-400">Filters:</span>
        <button className="px-3 py-1.5 text-sm text-stone-600 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 rounded-lg border border-stone-200 dark:border-stone-700 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors flex items-center gap-1.5">
          <Calendar className="h-4 w-4" />
          Date Range
        </button>
        <button className="px-3 py-1.5 text-sm text-stone-600 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 rounded-lg border border-stone-200 dark:border-stone-700 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors">
          Status
        </button>
        <button className="px-3 py-1.5 text-sm text-stone-600 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 rounded-lg border border-stone-200 dark:border-stone-700 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors">
          Course
        </button>
        {hasFilters && (
          <button
            onClick={() => onSearchChange('')}
            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium ml-auto"
          >
            Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900">
        <table className="w-full">
          <thead>
            <tr className="bg-stone-50 dark:bg-stone-800 border-b border-stone-200 dark:border-stone-700">
              <th className="text-left py-3 px-4 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider" style={{ width: '140px' }}>
                Booking #
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider" style={{ width: '80px' }}>
                Date
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider" style={{ width: '60px' }}>
                Time
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider" style={{ width: '100px' }}>
                Course
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                Booker
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider" style={{ width: '60px' }}>
                Players
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider" style={{ width: '100px' }}>
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              // Loading state: Skeleton rows
              <>
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
              </>
            ) : bookings.length === 0 ? (
              // Empty state
              <tr>
                <td colSpan={7} className="py-16 px-4">
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-stone-100 dark:bg-stone-800 mb-4">
                      <CalendarX2 className="h-7 w-7 text-stone-400 dark:text-stone-500" />
                    </div>
                    {hasFilters ? (
                      <>
                        <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-1">
                          No bookings match your search
                        </h3>
                        <p className="text-sm text-stone-500 dark:text-stone-400 mb-4">
                          Try adjusting your search criteria
                        </p>
                        <button
                          onClick={() => onSearchChange('')}
                          className="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        >
                          Clear Filters
                        </button>
                      </>
                    ) : (
                      <>
                        <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-1">
                          No upcoming bookings
                        </h3>
                        <p className="text-sm text-stone-500 dark:text-stone-400">
                          Bookings will appear here once they are created
                        </p>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              // Data rows
              bookings.map((booking) => (
                <tr
                  key={booking.id}
                  onClick={() => onBookingSelect(booking.id)}
                  className="border-b border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 cursor-pointer transition-colors"
                >
                  <td className="py-3 px-4 text-sm font-medium text-stone-900 dark:text-stone-100">
                    {booking.bookingNumber}
                  </td>
                  <td className="py-3 px-4 text-sm text-stone-600 dark:text-stone-400">
                    {formatDate(booking.date)}
                  </td>
                  <td className="py-3 px-4 text-sm text-stone-600 dark:text-stone-400">
                    {formatTime(booking.teeTime)}
                  </td>
                  <td className="py-3 px-4 text-sm text-stone-600 dark:text-stone-400">
                    {booking.courseName}
                  </td>
                  <td className="py-3 px-4 text-sm text-stone-900 dark:text-stone-100">
                    {booking.bookerName}
                  </td>
                  <td className="py-3 px-4 text-sm text-stone-600 dark:text-stone-400 text-center">
                    {booking.playerCount}
                  </td>
                  <td className="py-3 px-4">
                    <FlightStatusBadge status={booking.status} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
