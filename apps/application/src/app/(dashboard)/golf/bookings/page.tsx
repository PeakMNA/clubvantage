'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import { PageHeader } from '@clubvantage/ui'
import { useCourses, useTeeSheet, useScheduleConfig, useGolfMutations } from '@/hooks/use-golf'
import {
  generateTeeTimeSlots,
  convertSlotsToFlights,
  DEFAULT_SCHEDULE_CONFIG,
  type ScheduleConfig,
} from '@/lib/golf/schedule-utils'
import { BookingsTab } from '@/components/golf/bookings-tab'
import { BookingModal, type BookingPayload as NewBookingPayload, type ClubSettings as NewClubSettings } from '@/components/golf/booking-modal'
import { type PlayerData } from '@/components/golf/add-player-flow'
import { request } from '@clubvantage/api-client'
import type { Flight, Course, Booking, BookingFilters } from '@/components/golf/types'
import type { FlightStatus } from '@/components/golf/flight-status-badge'

// Map API status to frontend flight status
function mapGolfStatus(apiStatus: string): FlightStatus {
  const statusMap: Record<string, FlightStatus> = {
    'PENDING': 'BOOKED',
    'CONFIRMED': 'BOOKED',
    'CHECKED_IN': 'CHECKED_IN',
    'IN_PROGRESS': 'STARTED',
    'COMPLETED': 'COMPLETED',
    'CANCELLED': 'CANCELLED',
    'NO_SHOW': 'NO_SHOW',
  }
  return statusMap[apiStatus] || 'BOOKED'
}

function mapPlayerType(apiType: string): 'MEMBER' | 'GUEST' | 'DEPENDENT' | 'WALK_UP' {
  const typeMap: Record<string, 'MEMBER' | 'GUEST' | 'DEPENDENT' | 'WALK_UP'> = {
    'MEMBER': 'MEMBER',
    'GUEST': 'GUEST',
    'DEPENDENT': 'DEPENDENT',
    'WALK_UP': 'WALK_UP',
  }
  return typeMap[apiType] || 'GUEST'
}

// Generate bookings list from flights
function generateBookingsFromFlights(flights: Flight[], courseName: string, selectedDate: Date): Array<{
  id: string
  bookingNumber: string
  date: string
  teeTime: string
  courseName: string
  bookerName: string
  playerCount: number
  status: import('@/components/golf/types').BookingStatus
}> {
  const bookings: Array<{
    id: string
    bookingNumber: string
    date: string
    teeTime: string
    courseName: string
    bookerName: string
    playerCount: number
    status: import('@/components/golf/types').BookingStatus
  }> = []

  let bookingIndex = 1
  flights.forEach(flight => {
    const players = flight.players.filter(p => p !== null)
    if (players.length > 0) {
      const dateStr = selectedDate.toISOString().split('T')[0] || ''
      const formattedDate = dateStr.replace(/-/g, '').substring(2)
      bookings.push({
        id: flight.id,
        bookingNumber: `CV-${formattedDate}-${String(bookingIndex++).padStart(3, '0')}`,
        date: dateStr,
        teeTime: flight.time,
        courseName,
        bookerName: players[0]?.name || 'Unknown',
        playerCount: players.length,
        status: flight.status as import('@/components/golf/types').BookingStatus,
      })
    }
  })

  return bookings
}

// Convert flight to Booking type
function flightToBooking(flight: Flight, courseName: string, courseId: string): Booking {
  const dateStr = flight.date || new Date().toISOString().split('T')[0] || ''
  const formattedDate = dateStr.replace(/-/g, '').substring(2)
  const players = flight.players.filter(p => p !== null)
  const firstPlayer = players[0]

  return {
    id: flight.id,
    bookingNumber: `CV-${formattedDate}-001`,
    status: (flight.status === 'AVAILABLE' ? 'BOOKED' : flight.status) as import('@/components/golf/types').BookingStatus,
    flightId: flight.id,
    teeTime: flight.time.replace(' AM', '').replace(' PM', '').padStart(5, '0'),
    teeDate: dateStr,
    courseId,
    courseName,
    bookerId: firstPlayer?.id || 'unknown',
    bookerName: firstPlayer?.name || 'Unknown',
    bookerMemberId: firstPlayer?.memberId,
    bookerType: firstPlayer?.type === 'MEMBER' ? 'MEMBER' : 'STAFF',
    players: players.map((p, i) => ({
      id: `player-${p?.id || i}`,
      playerId: p?.id || `player-${i}`,
      playerType: (p?.type || 'GUEST') as import('@/components/golf/player-type-badge').PlayerType,
      position: (i + 1) as 1 | 2 | 3 | 4,
      name: p?.name || 'Unknown',
      memberId: p?.memberId,
      memberUuid: p?.memberUuid,
      cartStatus: p?.cartStatus,
      caddyStatus: p?.caddyStatus,
    })),
    playerCount: players.length,
    notes: flight.notes,
    createdAt: new Date().toISOString(),
    createdBy: 'system',
    modifiedAt: new Date().toISOString(),
    modifiedBy: 'system',
  }
}

const mockClubSettings: NewClubSettings = {
  cartPolicy: 'OPTIONAL',
  rentalPolicy: 'OPTIONAL',
  maxGuestsPerMember: 3,
  requireGuestContact: false,
}

export default function GolfBookingsPage() {
  const [currentDate] = useState(new Date())
  const [searchQuery, setSearchQuery] = useState('')
  const [flights, setFlights] = useState<Flight[]>([])
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)

  // Fetch courses
  const { courses: apiCourses } = useCourses()
  const selectedCourse = apiCourses[0]?.id || ''
  const courseName = apiCourses[0]?.name || 'Main Course'

  // Fetch tee sheet
  const { teeSheet: apiTeeSheet, isLoading: isTeeSheetLoading, refetch: refetchTeeSheet } = useTeeSheet({
    courseId: selectedCourse,
    date: currentDate,
    enabled: !!selectedCourse,
  })

  // Fetch schedule config
  const { scheduleConfig } = useScheduleConfig({
    courseId: selectedCourse,
    autoCreate: true,
    enabled: !!selectedCourse,
  })

  // Golf mutations
  const { createTeeTime, updateTeeTime, updateTeeTimePlayers } = useGolfMutations()

  // Generate flights from schedule config and API data
  useEffect(() => {
    if (!selectedCourse) return

    try {
      const effectiveConfig: ScheduleConfig = scheduleConfig || {
        ...DEFAULT_SCHEDULE_CONFIG,
        id: `default-${selectedCourse}`,
        courseId: selectedCourse,
      }
      const previewData = generateTeeTimeSlots(effectiveConfig, currentDate)

      const existingBookings = apiTeeSheet
        ?.filter(slot => slot.booking)
        .map(slot => {
          const booking = slot.booking!
          return {
            teeTime: slot.time,
            id: booking.id,
            status: mapGolfStatus(booking.status),
            players: (() => {
              const slots: (any | null)[] = [null, null, null, null]
              for (const p of booking.players) {
                if (p && p.position >= 1 && p.position <= 4) {
                  slots[p.position - 1] = {
                    id: p.id,
                    name: p.member
                      ? `${p.member.firstName} ${p.member.lastName}`
                      : p.guestName || 'Guest',
                    type: mapPlayerType(p.playerType),
                    memberId: p.member?.memberId,
                    memberUuid: p.member?.id,
                    checkedIn: !!p.checkedInAt,
                  }
                }
              }
              return slots
            })(),
          }
        })

      const generatedFlights = convertSlotsToFlights(
        previewData.teeTimeSlots,
        currentDate,
        selectedCourse,
        existingBookings,
      )

      setFlights(generatedFlights)
    } catch (error) {
      console.error('[Golf Bookings] Error generating flights:', error)
    }
  }, [scheduleConfig, currentDate, selectedCourse, apiTeeSheet])

  // Generate bookings from flights
  const bookings = useMemo(() => {
    return generateBookingsFromFlights(flights, courseName, currentDate)
  }, [flights, courseName, currentDate])

  // Filter bookings
  const filteredBookings = useMemo(() => {
    if (!searchQuery.trim()) return bookings
    const query = searchQuery.toLowerCase()
    return bookings.filter(booking =>
      booking.bookingNumber.toLowerCase().includes(query) ||
      booking.bookerName.toLowerCase().includes(query) ||
      booking.courseName.toLowerCase().includes(query)
    )
  }, [bookings, searchQuery])

  // Convert time helper
  const convertTo24Hour = (time12h: string): string => {
    const parts = time12h.split(' ')
    const timePart = parts[0] || '12:00'
    const modifier = parts[1] || 'AM'
    const [hoursStr, minutes] = timePart.split(':')
    let hours = hoursStr || '12'
    if (hours === '12') {
      hours = modifier === 'AM' ? '00' : '12'
    } else if (modifier === 'PM') {
      hours = String(parseInt(hours, 10) + 12)
    }
    return `${hours.padStart(2, '0')}:${minutes}`
  }

  // Search members
  const handleSearchMembers = useCallback(async (query: string): Promise<PlayerData[]> => {
    const SearchMembersQuery = `
      query SearchMembers($search: String!, $first: Int) {
        members(search: $search, first: $first) {
          edges {
            node { id memberId firstName lastName email phone }
          }
        }
      }
    `
    try {
      const data = await request<{
        members: { edges: Array<{ node: { id: string; memberId: string; firstName: string; lastName: string; email?: string; phone?: string } }> }
      }>(SearchMembersQuery, { search: query, first: 20 })
      return data.members.edges.map(edge => ({
        id: edge.node.id,
        name: `${edge.node.firstName} ${edge.node.lastName}`,
        type: 'MEMBER' as const,
        memberId: edge.node.memberId,
        email: edge.node.email,
        phone: edge.node.phone,
      }))
    } catch (error) {
      console.error('Error searching members:', error)
      return []
    }
  }, [])

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Golf Management"
        description="View and manage golf bookings"
        breadcrumbs={[{ label: 'Golf' }, { label: 'Bookings' }]}
      />

      <BookingsTab
        bookings={filteredBookings}
        isLoading={isTeeSheetLoading}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onBookingSelect={(bookingId) => {
          const flight = flights.find(f => f.id === bookingId)
          if (flight) {
            const booking = flightToBooking(flight, courseName, selectedCourse)
            setSelectedBooking(booking)
            setIsBookingModalOpen(true)
          }
        }}
      />

      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => {
          setIsBookingModalOpen(false)
          setSelectedBooking(null)
        }}
        mode="existing"
        courseId={selectedCourse}
        courseName={courseName}
        date={currentDate}
        time={selectedBooking?.teeTime || ''}
        startingHole={1}
        booking={selectedBooking}
        availableCaddies={[]}
        availableCarts={[]}
        clubSettings={mockClubSettings}
        onSearchMembers={handleSearchMembers}
        onSave={async (payload) => {
          try {
            const dateOnly = currentDate.toISOString().split('T')[0] || ''
            const teeDate = `${dateOnly}T00:00:00.000Z`
            const apiPlayers = payload.players.map(p => ({
              position: p.position,
              playerType: p.playerType,
              memberId: p.memberId,
              guestName: p.guestName,
              guestEmail: p.guestEmail,
              guestPhone: p.guestPhone,
              caddyRequest: p.caddyRequest,
              cartRequest: p.cartRequest,
              cartId: p.cartId,
              rentalRequest: p.rentalRequest,
            }))

            if (selectedBooking?.id) {
              await updateTeeTime(selectedBooking.id, {
                holes: payload.holes,
                notes: payload.notes,
              })
              await updateTeeTimePlayers(selectedBooking.id, apiPlayers)
            }

            refetchTeeSheet()
            setIsBookingModalOpen(false)
            setSelectedBooking(null)
          } catch (error) {
            console.error('Failed to save booking:', error)
            throw error
          }
        }}
      />
    </div>
  )
}
