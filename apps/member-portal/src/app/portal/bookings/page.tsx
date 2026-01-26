'use client'

import { useState, useEffect } from 'react'
import { cn, Button, Badge } from '@clubvantage/ui'
import { AlertCircle, Calendar, Clock, Plus, RefreshCw, Search } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  UpcomingBookingCard,
  PastBookingRow,
  WaitlistEntryCard,
  CancelBookingDialog,
  ModifyBookingModal,
} from '@/components/portal/bookings'
import type { PortalBooking, PortalWaitlistEntry, TimeSlot } from '@/lib/types'
import {
  fetchMyBookings,
  fetchMyWaitlist,
  cancelBooking,
  rescheduleBooking,
  fetchFacilityAvailability,
  fetchServiceAvailability,
} from './actions'

type Tab = 'upcoming' | 'past' | 'waitlist'

export default function MyBookingsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>('upcoming')
  const [upcomingBookings, setUpcomingBookings] = useState<PortalBooking[]>([])
  const [pastBookings, setPastBookings] = useState<PortalBooking[]>([])
  const [waitlistEntries, setWaitlistEntries] = useState<PortalWaitlistEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Modal states
  const [selectedBooking, setSelectedBooking] = useState<PortalBooking | null>(null)
  const [showModifyModal, setShowModifyModal] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [isRescheduling, setIsRescheduling] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)

  const loadData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [upcoming, past, waitlist] = await Promise.all([
        fetchMyBookings({ status: 'upcoming' }),
        fetchMyBookings({ status: 'past' }),
        fetchMyWaitlist(),
      ])
      setUpcomingBookings(upcoming)
      setPastBookings(past)
      setWaitlistEntries(waitlist)
    } catch (err) {
      console.error('Failed to load bookings:', err)
      setError('Unable to load your bookings. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Modal handlers
  const handleOpenModify = (bookingId: string) => {
    const booking = upcomingBookings.find((b) => b.id === bookingId)
    if (booking) {
      setSelectedBooking(booking)
      setShowModifyModal(true)
    }
  }

  const handleOpenCancel = (bookingId: string) => {
    const booking = upcomingBookings.find((b) => b.id === bookingId)
    if (booking) {
      setSelectedBooking(booking)
      setShowCancelDialog(true)
    }
  }

  const handleReschedule = async (newDate: string, newStartTime: string) => {
    if (!selectedBooking) return
    setIsRescheduling(true)
    try {
      const result = await rescheduleBooking(selectedBooking.id, newDate, newStartTime)
      if (result.success) {
        await loadData()
        setShowModifyModal(false)
        setSelectedBooking(null)
      }
    } catch (error) {
      console.error('Failed to reschedule:', error)
    } finally {
      setIsRescheduling(false)
    }
  }

  const handleCancel = async () => {
    if (!selectedBooking) return
    setIsCancelling(true)
    try {
      const result = await cancelBooking(selectedBooking.id)
      if (result.success) {
        await loadData()
        setShowCancelDialog(false)
        setSelectedBooking(null)
      }
    } catch (error) {
      console.error('Failed to cancel:', error)
    } finally {
      setIsCancelling(false)
    }
  }

  const fetchTimeSlots = async (date: string): Promise<TimeSlot[]> => {
    if (!selectedBooking) return []
    if (selectedBooking.type === 'facility') {
      return fetchFacilityAvailability(selectedBooking.facility.id, date)
    } else {
      return fetchServiceAvailability(
        selectedBooking.service.id,
        date,
        selectedBooking.staff?.id
      )
    }
  }

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatTime = (time: string | undefined): string => {
    if (!time) return ''
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours ?? '0', 10)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const hour12 = hour % 12 || 12
    return `${hour12}:${minutes ?? '00'} ${ampm}`
  }

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: 'upcoming', label: 'Upcoming', count: upcomingBookings.length },
    { id: 'past', label: 'Past', count: pastBookings.length },
    { id: 'waitlist', label: 'Waitlist', count: waitlistEntries.length },
  ]

  return (
    <div className="flex flex-col gap-6 p-4 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">My Bookings</h1>
        <Link href="/portal/book">
          <Button size="sm" className="bg-amber-500 text-white hover:bg-amber-600">
            <Plus className="mr-1 h-4 w-4" />
            Book
          </Button>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'relative flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors',
              activeTab === tab.id
                ? 'text-amber-600 dark:text-amber-400'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {tab.label}
            {tab.count > 0 && (
              <Badge
                className={cn(
                  'h-5 min-w-[20px] px-1.5 text-[10px]',
                  activeTab === tab.id
                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                {tab.count}
              </Badge>
            )}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500" />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent" />
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-500/30 dark:bg-red-500/10">
          <AlertCircle className="mx-auto mb-3 h-10 w-10 text-red-500" />
          <p className="mb-1 font-medium text-red-700 dark:text-red-400">Something went wrong</p>
          <p className="mb-4 text-sm text-red-600 dark:text-red-300">{error}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            className="border-red-300 text-red-700 hover:bg-red-100 dark:border-red-500/50 dark:text-red-400 dark:hover:bg-red-500/20"
          >
            <RefreshCw className="mr-1.5 h-4 w-4" />
            Try Again
          </Button>
        </div>
      ) : (
        <>
          {/* Upcoming Tab */}
          {activeTab === 'upcoming' && (
            <div className="space-y-3">
              {upcomingBookings.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center">
                  <Calendar className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
                  <p className="mb-1 font-medium text-foreground">No upcoming bookings</p>
                  <p className="mb-4 text-sm text-muted-foreground">
                    Browse our facilities and services to make a reservation
                  </p>
                  <Link href="/portal/book">
                    <Button className="bg-amber-500 text-white hover:bg-amber-600">
                      Browse & Book
                    </Button>
                  </Link>
                </div>
              ) : (
                upcomingBookings.map((booking) => (
                  <UpcomingBookingCard
                    key={booking.id}
                    booking={booking}
                    onModify={handleOpenModify}
                    onCancel={handleOpenCancel}
                    onView={(id) => router.push(`/portal/bookings/${id}`)}
                  />
                ))
              )}
            </div>
          )}

          {/* Past Tab */}
          {activeTab === 'past' && (
            <div className="space-y-2">
              {pastBookings.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center">
                  <Clock className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
                  <p className="mb-1 font-medium text-foreground">No past bookings</p>
                  <p className="text-sm text-muted-foreground">
                    Your booking history will appear here
                  </p>
                </div>
              ) : (
                pastBookings.map((booking) => (
                  <PastBookingRow
                    key={booking.id}
                    booking={booking}
                    onView={(id) => router.push(`/portal/bookings/${id}`)}
                  />
                ))
              )}
            </div>
          )}

          {/* Waitlist Tab */}
          {activeTab === 'waitlist' && (
            <div className="space-y-3">
              {waitlistEntries.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center">
                  <Clock className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
                  <p className="mb-1 font-medium text-foreground">No waitlist entries</p>
                  <p className="text-sm text-muted-foreground">
                    Join a waitlist when your preferred time is fully booked
                  </p>
                </div>
              ) : (
                waitlistEntries.map((entry) => (
                  <WaitlistEntryCard
                    key={entry.id}
                    entry={entry}
                    serviceName={entry.serviceId ? 'Thai Traditional Massage' : undefined}
                    facilityName={entry.facilityId ? 'Tennis Court 1' : undefined}
                    onAcceptOffer={(id) => console.log('Accept:', id)}
                    onDeclineOffer={(id) => console.log('Decline:', id)}
                    onCancel={(id) => console.log('Cancel waitlist:', id)}
                  />
                ))
              )}
            </div>
          )}
        </>
      )}

      {/* Modify Booking Modal */}
      {selectedBooking && (
        <ModifyBookingModal
          isOpen={showModifyModal}
          onClose={() => {
            setShowModifyModal(false)
            setSelectedBooking(null)
          }}
          onConfirm={handleReschedule}
          booking={selectedBooking}
          fetchTimeSlots={fetchTimeSlots}
          isLoading={isRescheduling}
        />
      )}

      {/* Cancel Booking Dialog */}
      {selectedBooking && (
        <CancelBookingDialog
          isOpen={showCancelDialog}
          onClose={() => {
            setShowCancelDialog(false)
            setSelectedBooking(null)
          }}
          onConfirm={handleCancel}
          bookingTitle={
            selectedBooking.type === 'facility'
              ? selectedBooking.facility.name
              : selectedBooking.service.name
          }
          bookingDate={formatDate(selectedBooking.date)}
          bookingTime={`${formatTime(selectedBooking.startTime)} - ${formatTime(selectedBooking.endTime)}`}
          refundAmount={selectedBooking.pricing.total}
          refundPercentage={100}
          isLoading={isCancelling}
        />
      )}
    </div>
  )
}
