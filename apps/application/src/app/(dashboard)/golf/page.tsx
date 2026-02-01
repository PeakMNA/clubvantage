'use client'

import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import { Plus, Sun, Cloud, Printer, List, Columns } from 'lucide-react'
import { PageHeader, Button } from '@clubvantage/ui'

// API hooks for real data fetching
import { useCourses, useTeeSheet, useGolfMutations, useScheduleConfig, useWeekViewOccupancy, usePrefetchWeekView, useWeekTeeSheet, useMonthAvailability, usePrefetchMonthView } from '@/hooks/use-golf'

// Schedule utilities for slot generation
import {
  generateTeeTimeSlots,
  convertSlotsToFlights,
  DEFAULT_SCHEDULE_CONFIG,
  type ScheduleConfig,
  type TimePeriod,
} from '@/lib/golf/schedule-utils'
import { TimePeriodFilter, useTimePeriodFilter } from '@/components/golf/time-period-filter'

// Import all golf components
import { GolfTabsLayout, type GolfTab } from '@/components/golf/golf-tabs-layout'
import { TeeSheetMetrics } from '@/components/golf/tee-sheet-metrics'
import { TeeSheetGrid } from '@/components/golf/tee-sheet-grid'
import { TeeSheetBookingView } from '@/components/golf/tee-sheet-booking-view'
import type { BookingAction, SlotAction } from '@/components/golf/context-menus'
import { TeeSheetSideBySideView } from '@/components/golf/tee-sheet-side-by-side'
import { DateNavigator } from '@/components/golf/calendar-popup'
import { TeeSheetWeekView } from '@/components/golf/tee-sheet-week-view'
import { TeeSheetMonthView } from '@/components/golf/tee-sheet-month-view'
import { FlightDetailPanel } from '@/components/golf/flight-detail-panel'
import { ShoppingCartCheckInPanel } from '@/components/golf/shopping-cart-checkin-panel'
// Dynamic modal imports for better bundle size - only loaded when modal is opened
import {
  DynamicBookTeeTimeModal as BookTeeTimeModal,
  DynamicSettlementModal as SettlementModal,
  DynamicCourseModal as CourseModal,
  DynamicCartModal as CartModal,
  DynamicCartMaintenanceModal as CartMaintenanceModal,
  DynamicCaddyModal as CaddyModal,
  DynamicCaddyScheduleModal as CaddyScheduleModal,
} from '@/components/golf/dynamic-modals'
import { request, useSearchCaddiesQuery } from '@clubvantage/api-client'
import { CoursesTab } from '@/components/golf/courses-tab'
import { CartsTab } from '@/components/golf/carts-tab'
import { CaddiesTab } from '@/components/golf/caddies-tab'
import { SettingsTab } from '@/components/golf/settings-tab'
import { BlockTeeTimeModal, type BlockFormData } from '@/components/golf/block-tee-time-modal'
import { MoveBookingDialog } from '@/components/golf/confirmation-dialogs'
// Booking-centric components
import { BookingsTab } from '@/components/golf/bookings-tab'
import { BookingModal, type BookingPayload as NewBookingPayload, type ClubSettings as NewClubSettings } from '@/components/golf/booking-modal'
import { type PlayerData } from '@/components/golf/add-player-flow'
import { PlacementModeOverlay, usePlacementMode } from '@/components/golf/placement-mode-overlay'
import { GolfPOSWrapper } from '@/components/golf/golf-pos-wrapper'
import type { Flight, Course, Cart, Caddy, TeeSheetDay, DayAvailability, Player, BookingGroup, TeeSheetSideBySide, NineHoleType, NineType, Booking, BookingPlayer, BookingFilters, WeekViewSlot, WeekViewPosition, BackendPlayerType, RentalStatus } from '@/components/golf/types'
import type { FlightStatus } from '@/components/golf/flight-status-badge'
import type { PlayerType } from '@/components/golf/player-type-badge'

// Mock weather data
const weatherData = {
  temp: 32,
  condition: 'sunny' as const,
  humidity: 65,
  wind: '8 km/h',
}

// Mock courses data
const mockCourses: Course[] = [
  {
    id: 'course-1',
    name: 'Main Course',
    holes: 18,
    par: 72,
    rating: 72.5,
    slope: 128,
    interval: 8,
    status: 'active',
    condition: 'Excellent conditions, greens running fast',
    firstTeeTime: '06:00',
    lastTeeTime: '17:00',
    // 18-Hole Booking Configuration
    enable18HoleBooking: true,
    paceOfPlay: {
      front9Minutes: 120,
      back9Minutes: 120,
      turnTimeMinutes: 15,
    },
    front9: {
      name: 'Lakeside Nine',
      firstTeeTime: '06:00',
      lastTeeTime: '14:00',
    },
    back9: {
      name: 'Mountain Nine',
      firstTeeTime: '08:15',
      lastTeeTime: '16:00',
    },
  },
  {
    id: 'course-2',
    name: 'Executive Course',
    holes: 9,
    par: 36,
    rating: 35.2,
    slope: 115,
    interval: 8,
    status: 'active',
    firstTeeTime: '06:30',
    lastTeeTime: '16:00',
    enable18HoleBooking: false, // 9-hole course, no 18-hole booking
  },
]

// Mock carts data
const mockCarts: Cart[] = [
  { id: 'a0000001-0000-0000-0000-000000000001', number: '01', type: '2-seater', status: 'available' },
  { id: 'a0000001-0000-0000-0000-000000000002', number: '02', type: '2-seater', status: 'in-use', currentAssignment: '7:00 AM' },
  { id: 'a0000001-0000-0000-0000-000000000003', number: '03', type: '4-seater', status: 'available' },
  { id: 'a0000001-0000-0000-0000-000000000004', number: '04', type: '4-seater', status: 'maintenance', conditionNotes: 'Battery replacement needed' },
  { id: 'a0000001-0000-0000-0000-000000000005', number: '05', type: '2-seater', status: 'available' },
  { id: 'a0000001-0000-0000-0000-000000000006', number: '06', type: '2-seater', status: 'in-use', currentAssignment: '7:08 AM' },
]

// Mock caddies data
const mockCaddies: Caddy[] = [
  { id: 'c0000001-0000-0000-0000-000000000001', name: 'Somchai Prasert', skillLevel: 'expert', status: 'available', experience: 12, notes: 'Specializes in Main Course' },
  { id: 'c0000001-0000-0000-0000-000000000002', name: 'Niran Wongsawat', skillLevel: 'advanced', status: 'assigned', experience: 8, currentAssignment: '7:00 AM' },
  { id: 'c0000001-0000-0000-0000-000000000003', name: 'Prasit Chaiyasit', skillLevel: 'intermediate', status: 'available', experience: 3 },
  { id: 'c0000001-0000-0000-0000-000000000004', name: 'Wichai Khamwan', skillLevel: 'advanced', status: 'off-duty', experience: 6 },
  { id: 'c0000001-0000-0000-0000-000000000005', name: 'Apinya Srisuk', skillLevel: 'beginner', status: 'available', experience: 1, notes: 'New hire, training complete' },
]

// Map API tee time status to frontend flight status
function mapGolfStatus(apiStatus: string): FlightStatus {
  const statusMap: Record<string, FlightStatus> = {
    'PENDING': 'booked',
    'CONFIRMED': 'booked',
    'CHECKED_IN': 'checked-in',
    'IN_PROGRESS': 'on-course',
    'COMPLETED': 'finished',
    'CANCELLED': 'cancelled',
    'NO_SHOW': 'no-show',
  }
  return statusMap[apiStatus] || 'booked'
}

// Map API player type to frontend player type
function mapPlayerType(apiType: string): 'member' | 'guest' | 'dependent' | 'walkup' {
  const typeMap: Record<string, 'member' | 'guest' | 'dependent' | 'walkup'> = {
    'MEMBER': 'member',
    'GUEST': 'guest',
    'DEPENDENT': 'dependent',
    'WALK_UP': 'walkup',
  }
  return typeMap[apiType] || 'guest'
}

// Map frontend player type to backend player type
function mapToBackendPlayerType(playerType: 'member' | 'guest' | 'dependent' | 'walkup'): BackendPlayerType {
  const typeMap: Record<string, BackendPlayerType> = {
    'member': 'MEMBER',
    'guest': 'GUEST',
    'dependent': 'DEPENDENT',
    'walkup': 'WALK_UP',
  }
  return typeMap[playerType] || 'GUEST'
}

// Convert flights to week view slots for the current date
function convertFlightsToWeekViewSlots(flights: Flight[], date: Date): WeekViewSlot[] {
  const dateStr = date.toISOString().split('T')[0] as string
  const slots: WeekViewSlot[] = []

  for (const flight of flights) {
    // Convert flight time from display format (e.g., "7:00 AM") to 24h format (e.g., "07:00")
    let time24 = flight.time
    if (flight.time.includes('AM') || flight.time.includes('PM')) {
      const match = flight.time.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i)
      if (match) {
        let hours = parseInt(match[1] || '0', 10)
        const minutes = match[2] || '00'
        const period = match[3]?.toUpperCase()
        if (period === 'PM' && hours !== 12) hours += 12
        if (period === 'AM' && hours === 12) hours = 0
        time24 = `${hours.toString().padStart(2, '0')}:${minutes}`
      }
    }

    // Create positions array from flight players
    const positions: WeekViewPosition[] = flight.players.map((player, index) => {
      if (player === null) {
        return {
          position: index + 1,
          status: flight.status === 'blocked' ? 'BLOCKED' as const : 'AVAILABLE' as const,
        }
      }
      return {
        position: index + 1,
        status: 'BOOKED' as const,
        player: {
          id: player.id,
          name: player.name,
          type: mapToBackendPlayerType(player.type),
          memberId: player.memberId,
        },
      }
    })

    // Create FRONT nine slot
    slots.push({
      date: dateStr,
      time: time24,
      nine: 'FRONT',
      isBlocked: flight.status === 'blocked',
      positions,
    })

    // For crossover mode, also create BACK nine slot (typically at a different time)
    // For now, we'll just create FRONT nine since we don't have separate back 9 data
  }

  return slots
}

// Generate mock tee sheet data
function generateMockTeeSheetData(date: Date): TeeSheetDay {
  const flights: Flight[] = []
  const startHour = 6
  const endHour = 17
  const interval = 8

  let id = 1
  for (let hour = startHour; hour <= endHour; hour++) {
    for (let minute = 0; minute < 60; minute += interval) {
      if (hour === endHour && minute > 0) break

      const displayHour = hour > 12 ? hour - 12 : hour
      const ampm = hour >= 12 ? 'PM' : 'AM'
      const time = `${displayHour}:${minute.toString().padStart(2, '0')} ${ampm}`

      let status: FlightStatus = 'available'
      let players: Flight['players'] = [null, null, null, null]

      // Add mock bookings
      if (hour === 7 && minute === 0) {
        status = 'checked-in'
        players = [
          { id: 'p1', name: 'Somchai W.', type: 'member', memberId: 'M-0001', handicap: 12, checkedIn: true },
          { id: 'p2', name: 'Prasert C.', type: 'member', memberId: 'M-0003', handicap: 8, checkedIn: true },
          { id: 'p3', name: 'Wichai P.', type: 'member', memberId: 'M-0008', handicap: 15, checkedIn: true },
          { id: 'p4', name: 'Narong T.', type: 'member', memberId: 'M-0012', handicap: 10, checkedIn: true },
        ]
      } else if (hour === 7 && minute === 8) {
        status = 'booked'
        players = [
          { id: 'p5', name: 'Apinya S.', type: 'member', memberId: 'M-0005', handicap: 18 },
          { id: 'p6', name: 'John Smith', type: 'guest', handicap: 20 },
          null,
          null,
        ]
      } else if (hour === 8 && minute === 0) {
        status: 'on-course'
        players = [
          { id: 'p7', name: 'Nisa W.', type: 'member', memberId: 'M-0002', handicap: 24, checkedIn: true },
          { id: 'p8', name: 'Corporate Guest 1', type: 'guest' },
          { id: 'p9', name: 'Corporate Guest 2', type: 'guest' },
          { id: 'p10', name: 'Corporate Guest 3', type: 'guest' },
        ]
      } else if (hour === 9 && minute === 0) {
        status = 'booked'
        players = [
          { id: 'p11', name: 'Sompong K.', type: 'member', memberId: 'M-0015', handicap: 6 },
          null,
          null,
          null,
        ]
      } else if (hour === 12 && (minute === 0 || minute === 8)) {
        status = 'blocked'
      }

      flights.push({
        id: `flight-${id++}`,
        time,
        date: date.toISOString().split('T')[0] as string,
        status,
        players,
        blockedReason: status === 'blocked' ? 'Course maintenance' : undefined,
      })
    }
  }

  const bookedFlights = flights.filter((f: Flight) => f.status !== 'available' && f.status !== 'blocked')
  const totalPlayers = flights.reduce((acc: number, f: Flight) => acc + f.players.filter((p: Player | null) => p !== null).length, 0)
  const checkedInPlayers = flights.reduce((acc: number, f: Flight) => acc + f.players.filter((p: Player | null) => p?.checkedIn).length, 0)

  return {
    date: date.toISOString().split('T')[0] as string,
    flights,
    metrics: {
      totalSlots: flights.filter(f => f.status !== 'blocked').length,
      bookedSlots: bookedFlights.length,
      totalPlayers,
      checkedIn: checkedInPlayers,
      onCourse: 4,
      projectedRevenue: totalPlayers * 2500,
      cartsAssigned: 3,
      totalCarts: mockCarts.length,
    },
  }
}

// Generate mock side-by-side tee sheet data for 18-hole courses
function generateMockSideBySideData(date: Date, courseId: string): TeeSheetSideBySide {
  const front9Flights: Flight[] = []
  const back9Flights: Flight[] = []
  const linkedBookings: TeeSheetSideBySide['linkedBookings'] = []

  const startHour = 6
  const endHour = 11
  const interval = 8

  let id = 1

  // Generate front 9 flights
  for (let hour = startHour; hour <= endHour; hour++) {
    for (let minute = 0; minute < 60; minute += interval) {
      if (hour === endHour && minute > 0) break

      const displayHour = hour > 12 ? hour - 12 : hour
      const ampm = hour >= 12 ? 'PM' : 'AM'
      const time = `${displayHour}:${minute.toString().padStart(2, '0')} ${ampm}`

      let status: FlightStatus = 'available'
      let players: Flight['players'] = [null, null, null, null]
      let linkedSlot: Flight['linkedSlot'] | undefined = undefined

      // Add mock 18-hole booking at 7:00 AM
      if (hour === 7 && minute === 0) {
        status = 'checked-in'
        players = [
          { id: 'p1', name: 'Somchai W.', type: 'member', memberId: 'M-0001', handicap: 12, checkedIn: true },
          { id: 'p2', name: 'Prasert C.', type: 'member', memberId: 'M-0003', handicap: 8, checkedIn: true },
          { id: 'p3', name: 'Wichai P.', type: 'member', memberId: 'M-0008', handicap: 15, checkedIn: true },
          { id: 'p4', name: 'Narong T.', type: 'member', memberId: 'M-0012', handicap: 10, checkedIn: true },
        ]
        linkedSlot = {
          slotId: 'back9-flight-1',
          nineHole: 'back9',
          projectedTime: '9:15 AM',
          isAutoAssigned: true,
        }
      } else if (hour === 7 && minute === 8) {
        status = 'booked'
        players = [
          { id: 'p5', name: 'Apinya S.', type: 'member', memberId: 'M-0005', handicap: 18 },
          { id: 'p6', name: 'John Smith', type: 'guest', handicap: 20 },
          null,
          null,
        ]
      } else if (hour === 8 && minute === 0) {
        status = 'booked'
        players = [
          { id: 'p7', name: 'Nisa W.', type: 'member', memberId: 'M-0002', handicap: 24 },
          { id: 'p8', name: 'Corporate Guest 1', type: 'guest' },
          { id: 'p9', name: 'Corporate Guest 2', type: 'guest' },
          { id: 'p10', name: 'Corporate Guest 3', type: 'guest' },
        ]
        linkedSlot = {
          slotId: 'back9-flight-2',
          nineHole: 'back9',
          projectedTime: '10:15 AM',
          isAutoAssigned: true,
        }
      }

      front9Flights.push({
        id: `front9-flight-${id}`,
        time,
        date: date.toISOString().split('T')[0] as string,
        status,
        players,
        nineHole: 'front9',
        linkedSlot,
        courseId,
      })
      id++
    }
  }

  // Generate back 9 flights (starting later due to pace of play)
  id = 1
  for (let hour = startHour + 2; hour <= endHour + 2; hour++) { // Back 9 starts 2 hours later
    for (let minute = 0; minute < 60; minute += interval) {
      if (hour === endHour + 2 && minute > 0) break

      const displayHour = hour > 12 ? hour - 12 : hour
      const ampm = hour >= 12 ? 'PM' : 'AM'
      const time = `${displayHour}:${minute.toString().padStart(2, '0')} ${ampm}`

      let status: FlightStatus = 'available'
      let players: Flight['players'] = [null, null, null, null]
      let linkedSlot: Flight['linkedSlot'] | undefined = undefined

      // Add linked booking for 7:00 AM front 9 group (arrives at back 9 around 9:15)
      if (hour === 9 && minute === 16) {
        status = 'on-course'
        players = [
          { id: 'p1', name: 'Somchai W.', type: 'member', memberId: 'M-0001', handicap: 12, checkedIn: true },
          { id: 'p2', name: 'Prasert C.', type: 'member', memberId: 'M-0003', handicap: 8, checkedIn: true },
          { id: 'p3', name: 'Wichai P.', type: 'member', memberId: 'M-0008', handicap: 15, checkedIn: true },
          { id: 'p4', name: 'Narong T.', type: 'member', memberId: 'M-0012', handicap: 10, checkedIn: true },
        ]
        linkedSlot = {
          slotId: 'front9-flight-8', // 7:00 AM slot
          nineHole: 'front9',
          projectedTime: '7:00 AM',
          isAutoAssigned: true,
        }
      }
      // Add linked booking for 8:00 AM corporate group (arrives at back 9 around 10:15)
      else if (hour === 10 && minute === 16) {
        status = 'booked'
        players = [
          { id: 'p7', name: 'Nisa W.', type: 'member', memberId: 'M-0002', handicap: 24 },
          { id: 'p8', name: 'Corporate Guest 1', type: 'guest' },
          { id: 'p9', name: 'Corporate Guest 2', type: 'guest' },
          { id: 'p10', name: 'Corporate Guest 3', type: 'guest' },
        ]
        linkedSlot = {
          slotId: 'front9-flight-16', // 8:00 AM slot
          nineHole: 'front9',
          projectedTime: '8:00 AM',
          isAutoAssigned: true,
        }
      }

      back9Flights.push({
        id: `back9-flight-${id}`,
        time,
        date: date.toISOString().split('T')[0] as string,
        status,
        players,
        nineHole: 'back9',
        linkedSlot,
        courseId,
      })
      id++
    }
  }

  // Add linked bookings
  linkedBookings.push({
    front9FlightId: 'front9-flight-8',
    back9FlightId: 'back9-flight-1', // Will be at ~9:16 slot
    bookingGroupId: 'booking-18hole-1',
    playerIds: ['p1', 'p2', 'p3', 'p4'],
  })
  linkedBookings.push({
    front9FlightId: 'front9-flight-16',
    back9FlightId: 'back9-flight-2',
    bookingGroupId: 'booking-18hole-2',
    playerIds: ['p7', 'p8', 'p9', 'p10'],
  })

  // Calculate metrics
  const front9Booked = front9Flights.filter(f => f.status !== 'available' && f.status !== 'blocked')
  const back9Booked = back9Flights.filter(f => f.status !== 'available' && f.status !== 'blocked')
  const front9Players = front9Flights.reduce((acc, f) => acc + f.players.filter(p => p !== null).length, 0)
  const back9Players = back9Flights.reduce((acc, f) => acc + f.players.filter(p => p !== null).length, 0)

  return {
    date: date.toISOString().split('T')[0] as string,
    courseId,
    front9Flights,
    back9Flights,
    linkedBookings,
    metrics: {
      front9: {
        totalSlots: front9Flights.length,
        bookedSlots: front9Booked.length,
        players: front9Players,
      },
      back9: {
        totalSlots: back9Flights.length,
        bookedSlots: back9Booked.length,
        players: back9Players,
      },
      total18HoleBookings: linkedBookings.length,
      projectedRevenue: (front9Players + back9Players) * 2500,
    },
  }
}

// Generate mock bookings data from flights
function generateMockBookings(flights: Flight[], courseName: string, selectedDate: Date): Array<{
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
      const formattedDate = dateStr.replace(/-/g, '').substring(2) // YYMMDD
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

// Convert flight to Booking type for detail modal
function flightToBooking(flight: Flight, courseName: string, courseId: string): Booking {
  const dateStr = flight.date || new Date().toISOString().split('T')[0] || ''
  const formattedDate = dateStr.replace(/-/g, '').substring(2) // YYMMDD
  const players = flight.players.filter(p => p !== null)
  const firstPlayer = players[0]

  return {
    id: flight.id,
    bookingNumber: `CV-${formattedDate}-001`,
    status: (flight.status === 'available' ? 'booked' : flight.status === 'finished' ? 'completed' : flight.status) as import('@/components/golf/types').BookingStatus,
    flightId: flight.id,
    teeTime: flight.time.replace(' AM', '').replace(' PM', '').padStart(5, '0'),
    teeDate: dateStr,
    courseId,
    courseName,
    bookerId: firstPlayer?.id || 'unknown',
    bookerName: firstPlayer?.name || 'Unknown',
    bookerMemberId: firstPlayer?.memberId,
    bookerType: firstPlayer?.type === 'member' ? 'member' : 'staff',
    players: players.map((p, i) => ({
      id: `player-${p?.id || i}`,
      playerId: p?.id || `player-${i}`,
      playerType: (p?.type || 'guest') as import('@/components/golf/player-type-badge').PlayerType,
      position: (i + 1) as 1 | 2 | 3 | 4,
      name: p?.name || 'Unknown',
      memberId: p?.memberId,      // Display ID (M-0005)
      memberUuid: p?.memberUuid,  // Member.id (UUID) for API calls
      cartStatus: p?.cartStatus,  // Rental status for cart
      caddyStatus: p?.caddyStatus, // Rental status for caddy
    })),
    playerCount: players.length,
    notes: flight.notes,
    createdAt: new Date().toISOString(),
    createdBy: 'system',
    modifiedAt: new Date().toISOString(),
    modifiedBy: 'system',
  }
}

// Settings type for the settings tab
interface SettingsScheduleConfig {
  weekday: { firstTeeTime: string; lastTeeTime: string; interval: number }
  weekend: { firstTeeTime: string; lastTeeTime: string; interval: number }
  seasons: Array<{
    id: string
    name: string
    type: 'high' | 'low'
    startDate: string
    endDate: string
    customSchedule?: {
      weekday: { firstTeeTime: string; lastTeeTime: string; interval: number }
      weekend: { firstTeeTime: string; lastTeeTime: string; interval: number }
    }
  }>
  holidays: Array<{
    id: string
    name: string
    date: string
    recurring: boolean
    customSchedule?: {
      weekday: { firstTeeTime: string; lastTeeTime: string; interval: number }
      weekend: { firstTeeTime: string; lastTeeTime: string; interval: number }
    }
  }>
}

// Convert settings tab schedule to ScheduleConfig format
function convertSettingsToScheduleConfig(
  settings: SettingsScheduleConfig,
  courseId: string
): ScheduleConfig {
  // Create time periods based on interval (single period for entire day)
  const createTimePeriods = (interval: number, isWeekend: boolean): TimePeriod[] => [{
    id: `period-${isWeekend ? 'weekend' : 'weekday'}-all`,
    name: 'All Day',
    startTime: isWeekend ? settings.weekend.firstTeeTime : settings.weekday.firstTeeTime,
    endTime: null,
    intervalMinutes: interval,
    isPrimeTime: false,
    applicableDays: isWeekend ? 'WEEKEND' as const : 'WEEKDAY' as const,
    sortOrder: 0,
  }]

  // Convert seasons
  const seasons = settings.seasons.map((s, idx) => {
    const [startMonth, startDay] = s.startDate.split('-').map(Number)
    const [endMonth, endDay] = s.endDate.split('-').map(Number)

    return {
      id: s.id,
      name: s.name,
      startMonth: startMonth || 1,
      startDay: startDay || 1,
      endMonth: endMonth || 12,
      endDay: endDay || 31,
      isRecurring: true,
      priority: s.type === 'high' ? 2 : 1,
      overrideFirstTee: s.customSchedule?.weekday.firstTeeTime || null,
      overrideLastTee: s.customSchedule?.weekday.lastTeeTime || null,
      overrideBookingWindow: null,
      overrideTwilightTime: null,
      overrideTimePeriods: !!s.customSchedule,
      timePeriods: s.customSchedule ? [
        {
          id: `season-${s.id}-weekday`,
          name: 'Weekday',
          startTime: s.customSchedule.weekday.firstTeeTime,
          endTime: null,
          intervalMinutes: s.customSchedule.weekday.interval,
          isPrimeTime: s.type === 'high',
          applicableDays: 'WEEKDAY' as const,
          sortOrder: 0,
        },
        {
          id: `season-${s.id}-weekend`,
          name: 'Weekend',
          startTime: s.customSchedule.weekend.firstTeeTime,
          endTime: null,
          intervalMinutes: s.customSchedule.weekend.interval,
          isPrimeTime: s.type === 'high',
          applicableDays: 'WEEKEND' as const,
          sortOrder: 1,
        },
      ] : [],
    }
  })

  // Convert holidays to special days
  const specialDays = settings.holidays.map((h) => {
    // Parse date to get month-day format for recurring
    const dateParts = h.date.split('-')
    const mmdd = dateParts.length === 3 ? `${dateParts[1]}-${dateParts[2]}` : h.date

    return {
      id: h.id,
      name: h.name,
      startDate: h.recurring ? mmdd : h.date,
      endDate: h.recurring ? mmdd : h.date,
      isRecurring: h.recurring,
      type: h.customSchedule ? 'CUSTOM' as const : 'HOLIDAY' as const,
      customFirstTee: h.customSchedule?.weekday.firstTeeTime || null,
      customLastTee: h.customSchedule?.weekday.lastTeeTime || null,
      customTimePeriods: !!h.customSchedule,
      timePeriods: h.customSchedule ? [
        {
          id: `holiday-${h.id}-weekday`,
          name: 'Weekday',
          startTime: h.customSchedule.weekday.firstTeeTime,
          endTime: null,
          intervalMinutes: h.customSchedule.weekday.interval,
          isPrimeTime: false,
          applicableDays: 'WEEKDAY' as const,
          sortOrder: 0,
        },
        {
          id: `holiday-${h.id}-weekend`,
          name: 'Weekend',
          startTime: h.customSchedule.weekend.firstTeeTime,
          endTime: null,
          intervalMinutes: h.customSchedule.weekend.interval,
          isPrimeTime: false,
          applicableDays: 'WEEKEND' as const,
          sortOrder: 1,
        },
      ] : [],
    }
  })

  return {
    id: `settings-${courseId}`,
    courseId,
    weekdayFirstTee: settings.weekday.firstTeeTime,
    weekdayLastTee: settings.weekday.lastTeeTime,
    weekdayBookingMode: 'EIGHTEEN' as const,
    weekendFirstTee: settings.weekend.firstTeeTime,
    weekendLastTee: settings.weekend.lastTeeTime,
    weekendBookingMode: 'EIGHTEEN' as const,
    twilightMode: 'FIXED',
    twilightMinutesBeforeSunset: 90,
    twilightFixedDefault: '16:00',
    defaultBookingWindowDays: 7,
    timePeriods: [
      ...createTimePeriods(settings.weekday.interval, false),
      ...createTimePeriods(settings.weekend.interval, true),
    ],
    seasons,
    specialDays,
  }
}

// Initial settings state
const initialSettings = {
  general: {
    teeTimeInterval: 8,
    firstTeeTime: '06:00',
    lastTeeTime: '17:00',
    advanceBookingDays: 14,
    maxPlayersPerBooking: 4,
    walkupsAllowed: true,
  },
  schedule: {
    weekday: { firstTeeTime: '06:00', lastTeeTime: '17:00', interval: 8 },
    weekend: { firstTeeTime: '06:00', lastTeeTime: '17:30', interval: 8 },  // Same as weekday
    seasons: [],
    holidays: [],
  } as SettingsScheduleConfig,
  cancellation: {
    fullRefundHours: 48,
    partialRefundHours: 24,
    partialRefundPercentage: 50,
    noShowFee: 500,
  },
  guest: {
    maxGuestsPerMember: 3,
    requireSponsor: true,
    guestGreenFeeMultiplier: 1.5,
  },
  standingTeeTime: {
    enabled: true,
    maxStandingTimesPerMember: 2,
    priorityLevels: ['Gold', 'Silver', 'Bronze'],
    seasonRequired: true,
  },
  noShow: {
    gracePeriod: 15,
    penaltyFee: 500,
    maxStrikesPerYear: 3,
    suspensionDays: 30,
  },
  notifications: {
    bookingConfirmation: true,
    reminder24Hour: true,
    reminder2Hour: true,
    groupingNotice: true,
    cancellationConfirmation: true,
    noShowNotice: true,
  },
  blockManagement: {
    starterBlock: {
      enabled: false,
      numberOfSlots: 1,
      applyTo: 'all' as const,
    },
    defaultBlockDurationMinutes: 60,
    recurringMaintenance: [],
  },
}

type ViewMode = 'day' | 'week' | 'month'
type LayoutType = 'list' | 'split' // list = single column, split = front 9 / back 9 side by side

export default function GolfPage() {
  // =========================================================================
  // API DATA FETCHING
  // =========================================================================

  // Fetch courses from API with fallback to mock data
  const { courses: apiCourses, isLoading: isCoursesLoading } = useCourses()

  // Golf mutations for booking, check-in, etc.
  const { createTeeTime, updateTeeTime, updateTeeTimePlayers, checkIn, cancelTeeTime, updatePlayerRentalStatus, moveTeeTime, isCreating, isUpdatingRentalStatus, isMoving } = useGolfMutations()

  // Prefetch hook for week view (bundle-preload pattern - warm cache on hover)
  const prefetchWeekView = usePrefetchWeekView()

  // Time period filter state
  const [selectedTimePeriod, setSelectedTimePeriod] = useState<string | null>(null)

  // Settings state (synced with tee sheet)
  const [golfSettings, setGolfSettings] = useState(initialSettings)

  // Feature flag for POS integration (can be controlled via URL param or config)
  // Set to false by default - enable by adding ?pos=true to URL
  const [isPOSEnabled] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      return params.get('pos') === 'true'
    }
    return false
  })

  // =========================================================================
  // BOOKING-CENTRIC STATE
  // =========================================================================

  // Bookings tab state
  const [bookingsSearchQuery, setBookingsSearchQuery] = useState('')
  const [bookingsFilters, setBookingsFilters] = useState<BookingFilters>({
    dateRange: null,
    statuses: [],
    courseId: null,
    search: '',
  })

  // Selected booking for detail modal
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [isBookingProcessing, setIsBookingProcessing] = useState(false)
  const [bookingProcessingAction, setBookingProcessingAction] = useState<string | undefined>(undefined)

  // New BookingModal state (unified view/edit experience)
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)
  const [bookingModalMode, setBookingModalMode] = useState<'new' | 'existing'>('new')
  const [bookingModalSlot, setBookingModalSlot] = useState<{ time: string; courseId: string } | null>(null)

  // Clipboard for copy/paste operations
  const [clipboardBooking, setClipboardBooking] = useState<Booking | null>(null)

  // =========================================================================
  // MAIN STATE
  // =========================================================================
  const [activeTab, setActiveTab] = useState<GolfTab>('tee-sheet')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<ViewMode>('day')
  const [layoutType, setLayoutType] = useState<LayoutType>('list')

  // Local courses state for editing - starts empty, synced from API when loaded
  const [courses, setCourses] = useState<Course[]>([])
  // selectedCourse: empty until API courses load - ensures we never query with mock IDs
  const [selectedCourse, setSelectedCourse] = useState<string>('')

  // Debug logging for courses loading
  useEffect(() => {
    console.log('[Golf Page] apiCourses:', apiCourses)
    console.log('[Golf Page] isCoursesLoading:', isCoursesLoading)
  }, [apiCourses, isCoursesLoading])

  // Sync courses and selected course when API data loads
  useEffect(() => {
    if (apiCourses.length > 0) {
      // Transform API courses to match the expected Course type
      const transformedCourses: Course[] = apiCourses.map(c => ({
        id: c.id,
        name: c.name,
        holes: (c.holes === 9 || c.holes === 18 || c.holes === 27 || c.holes === 36 ? c.holes : 18) as 9 | 18 | 27 | 36,
        par: c.par,
        rating: c.rating ?? 72.0,
        slope: c.slope ?? 113,
        interval: c.teeInterval,
        status: c.isActive ? 'active' as const : 'closed' as const,
        firstTeeTime: c.firstTeeTime,
        lastTeeTime: c.lastTeeTime,
        enable18HoleBooking: c.holes === 18,
      }))
      console.log('[Golf Page] Setting courses from API:', transformedCourses)
      setCourses(transformedCourses)
      // Only set selectedCourse if not already set (preserve user selection)
      if (!selectedCourse) {
        setSelectedCourse(transformedCourses[0]?.id ?? '')
      }
    }
  }, [apiCourses, selectedCourse])

  // Fetch tee sheet for selected course and date
  const { teeSheet: apiTeeSheet, isLoading: isTeeSheetLoading, refetch: refetchTeeSheet } = useTeeSheet({
    courseId: selectedCourse,
    date: currentDate,
    enabled: !!selectedCourse,
  })

  // Fetch schedule config for selected course (auto-creates default if none exists)
  const { scheduleConfig, isLoading: isScheduleConfigLoading } = useScheduleConfig({
    courseId: selectedCourse,
    autoCreate: true,
    enabled: !!selectedCourse,
  })

  // Get effective time periods EARLY (needed for week view query optimization)
  const effectiveTimePeriods = useMemo((): TimePeriod[] => {
    if (!scheduleConfig) return DEFAULT_SCHEDULE_CONFIG.timePeriods as TimePeriod[]
    return scheduleConfig.timePeriods
  }, [scheduleConfig])

  // Compute the time range for week view based on selected period or current time
  const weekViewTimeRange = useMemo(() => {
    // Helper to convert time to minutes
    const timeToMinutes = (time: string): number => {
      const parts = time.split(':').map(Number)
      return (parts[0] ?? 0) * 60 + (parts[1] ?? 0)
    }

    // If a time period is selected, use it
    if (selectedTimePeriod !== null) {
      const period = effectiveTimePeriods.find((p) => p.id === selectedTimePeriod)
      if (period && period.endTime) {
        return { startTime: period.startTime, endTime: period.endTime }
      }
    }

    // Otherwise, auto-detect based on current time
    if (effectiveTimePeriods.length > 0) {
      const now = new Date()
      const currentMinutes = now.getHours() * 60 + now.getMinutes()

      const currentPeriod = effectiveTimePeriods.find((period) => {
        const startMinutes = timeToMinutes(period.startTime)
        const endMinutes = period.endTime ? timeToMinutes(period.endTime) : 24 * 60
        return currentMinutes >= startMinutes && currentMinutes < endMinutes
      })

      if (currentPeriod && currentPeriod.endTime) {
        return { startTime: currentPeriod.startTime, endTime: currentPeriod.endTime }
      }
    }

    return undefined // No time range filter - load everything
  }, [selectedTimePeriod, effectiveTimePeriods])

  // BETTER APPROACH: Fetch week view from tee sheet API (7 days in parallel)
  // This reuses the same working API as day view instead of a separate endpoint
  const { weekViewSlots: weekTeeSheetSlots, isLoading: isWeekTeeSheetLoading } = useWeekTeeSheet({
    courseId: selectedCourse,
    startDate: currentDate,
    enabled: !!selectedCourse && viewMode === 'week',
  })

  // Fallback to old API if needed (can remove once new approach is verified)
  const { weekViewSlots: weekViewApiSlots, isLoading: isWeekViewApiLoading } = useWeekViewOccupancy({
    courseId: selectedCourse,
    startDate: currentDate,
    timeRange: weekViewTimeRange,
    enabled: !!selectedCourse && viewMode === 'week' && weekTeeSheetSlots.length === 0,
  })

  // Use tee sheet data first (more reliable), fall back to API data
  const weekViewSlots = weekTeeSheetSlots.length > 0 ? weekTeeSheetSlots : weekViewApiSlots
  const isWeekViewLoading = isWeekTeeSheetLoading || (weekTeeSheetSlots.length === 0 && isWeekViewApiLoading)

  // TODO: Add real-time subscription for tee time updates when backend supports it

  // Fetch caddies from API
  const { data: caddiesData } = useSearchCaddiesQuery({}, {
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  })

  // Data state for carts and caddies
  const [carts, setCarts] = useState(mockCarts)
  const [caddies, setCaddies] = useState<Caddy[]>([])

  // Filter available carts for BookingModal
  const availableCarts = useMemo(() => {
    return carts.filter(cart => cart.status === 'available')
  }, [carts])

  // Update caddies when API data is available
  useEffect(() => {
    if (caddiesData?.searchCaddies && caddiesData.searchCaddies.length > 0) {
      const apiCaddies: Caddy[] = caddiesData.searchCaddies.map((c) => ({
        id: c.id,
        name: `${c.firstName} ${c.lastName}`,
        skillLevel: 'intermediate' as const, // Default
        status: c.isActive ? 'available' as const : 'off-duty' as const,
        experience: 5, // Default
      }))
      setCaddies(apiCaddies)
    }
  }, [caddiesData])

  // Modal state
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null)
  const [selectedGroupId, setSelectedGroupId] = useState<1 | 2 | undefined>(undefined)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [bookingModalFlight, setBookingModalFlight] = useState<Flight | null>(null)
  const [showCheckInModal, setShowCheckInModal] = useState(false)
  const [showSettlementModal, setShowSettlementModal] = useState(false)

  // Course modal state
  const [showCourseModal, setShowCourseModal] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)

  // Cart modal state
  const [showCartModal, setShowCartModal] = useState(false)
  const [editingCart, setEditingCart] = useState<Cart | null>(null)
  const [showCartMaintenanceModal, setShowCartMaintenanceModal] = useState(false)
  const [maintenanceCart, setMaintenanceCart] = useState<Cart | null>(null)

  // Block tee time modal state
  const [showBlockModal, setShowBlockModal] = useState(false)
  const [blockModalFlightTime, setBlockModalFlightTime] = useState<string | null>(null)

  // Caddy modal state
  const [showCaddyModal, setShowCaddyModal] = useState(false)
  const [editingCaddy, setEditingCaddy] = useState<Caddy | null>(null)
  const [showCaddyScheduleModal, setShowCaddyScheduleModal] = useState(false)
  const [scheduleCaddy, setScheduleCaddy] = useState<Caddy | null>(null)

  // Move/Copy booking dialog state
  const [moveDialog, setMoveDialog] = useState<{
    isOpen: boolean
    targetTeeTime: string
    isProcessing: boolean
  }>({ isOpen: false, targetTeeTime: '', isProcessing: false })

  // Flights state - generated from schedule config
  const [flights, setFlights] = useState<Flight[]>([])

  // Placement mode for move/copy operations (pass flights for smart validation)
  const placementMode = usePlacementMode(flights)

  // Generate flights from schedule config when config or date changes
  useEffect(() => {
    // Priority: API schedule config > Settings tab config > Default config
    let effectiveConfig: ScheduleConfig

    if (scheduleConfig) {
      // Use API config if available
      effectiveConfig = scheduleConfig
    } else {
      // Convert settings tab config to ScheduleConfig format
      effectiveConfig = convertSettingsToScheduleConfig(golfSettings.schedule, selectedCourse)
    }

    // Generate tee time slots from schedule config
    const previewData = generateTeeTimeSlots(effectiveConfig, currentDate)

    // Transform API tee sheet bookings to the format expected by convertSlotsToFlights
    const existingBookings = apiTeeSheet
      ?.filter(slot => slot.booking)
      .map(slot => {
        const booking = slot.booking!
        return {
          teeTime: slot.time,
          id: booking.id,
          status: mapGolfStatus(booking.status),
          // Map players to positions (1-4 -> index 0-3)
          // Important: Use position field to place players in correct slots
          // Each player carries their bookingId for direct lookup
          players: (() => {
            const slots: ({
              id: string
              name: string
              type: string
              memberId?: string
              memberUuid?: string
              bookingId?: string
              handicap?: number
              checkedIn?: boolean
              hasCart?: boolean
              hasCaddy?: boolean
              cartSharedWith?: number
              cartStatus?: RentalStatus
              caddyStatus?: RentalStatus
              cartRequest?: string
              caddyRequest?: string
              rentalRequest?: string
            } | null)[] = [null, null, null, null]

            // Get booking groups from API to find each player's actual booking ID
            const bookingGroups = (booking as any).bookingGroups as Array<{ id: string; playerIds: string[] }> | undefined

            for (const p of booking.players) {
              if (p && p.position >= 1 && p.position <= 4) {
                // Find which booking group this player belongs to
                const playerBookingId = bookingGroups?.find(g => g.playerIds?.includes(p.id))?.id || booking.id

                slots[p.position - 1] = {
                  id: p.id, // TeeTimePlayer.id (UUID of the player record)
                  name: p.member
                    ? `${p.member.firstName} ${p.member.lastName}`
                    : p.guestName || 'Guest',
                  type: mapPlayerType(p.playerType),
                  memberId: p.member?.memberId, // Display ID (M-0005) - for display
                  memberUuid: p.member?.id, // Member.id (UUID) - for API updates
                  bookingId: playerBookingId, // Track which booking this player belongs to
                  handicap: undefined,
                  checkedIn: !!p.checkedInAt,
                  // Cart and caddy info (legacy boolean)
                  hasCart: !!(p.cartType && p.cartType !== 'NONE' && p.cartType !== 'WALKING'),
                  hasCaddy: !!p.caddy,
                  cartSharedWith: p.sharedWithPosition,
                  // Rental status from API (mapped to lowercase)
                  cartStatus: ((p as any).cartStatus?.toLowerCase() || 'none') as RentalStatus,
                  caddyStatus: ((p as any).caddyStatus?.toLowerCase() || 'none') as RentalStatus,
                  // Rental requests from API
                  cartRequest: (p as any).cartRequest || 'NONE',
                  caddyRequest: (p as any).caddyRequest || 'NONE',
                  rentalRequest: (p as any).rentalRequest || 'NONE',
                }
              }
            }
            return slots
          })(),
          notes: booking.notes,
          holes: booking.holes as 9 | 18, // Number of holes for this booking
          // Pass through booking groups from API
          bookingGroups: (booking as any).bookingGroups?.map((g: any, index: number) => ({
            id: g.id,
            groupNumber: g.groupNumber || (index + 1) as 1 | 2,
            bookedBy: g.bookedBy,
            playerIds: g.playerIds,
          })),
        }
      })

    // Convert to Flight objects with existing bookings from API
    const generatedFlights = convertSlotsToFlights(
      previewData.teeTimeSlots,
      currentDate,
      selectedCourse,
      existingBookings,
    )

    setFlights(generatedFlights)
  }, [scheduleConfig, golfSettings.schedule, currentDate, selectedCourse, apiTeeSheet])

  // Track if we've auto-selected time period for week view (to avoid re-selecting after user clicks "All")
  const hasAutoSelectedTimePeriod = useRef(false)

  // Reset auto-select flag when leaving week view
  useEffect(() => {
    if (viewMode !== 'week') {
      hasAutoSelectedTimePeriod.current = false
    }
  }, [viewMode])

  // Auto-select time period containing current time when entering week view
  useEffect(() => {
    if (
      viewMode === 'week' &&
      effectiveTimePeriods.length > 0 &&
      selectedTimePeriod === null &&
      !hasAutoSelectedTimePeriod.current
    ) {
      const now = new Date()
      const currentMinutes = now.getHours() * 60 + now.getMinutes()

      // Find the time period that contains the current time
      const timeToMinutes = (time: string): number => {
        const parts = time.split(':').map(Number)
        return (parts[0] ?? 0) * 60 + (parts[1] ?? 0)
      }

      const currentPeriod = effectiveTimePeriods.find((period) => {
        const startMinutes = timeToMinutes(period.startTime)
        const endMinutes = period.endTime ? timeToMinutes(period.endTime) : 24 * 60
        return currentMinutes >= startMinutes && currentMinutes < endMinutes
      })

      if (currentPeriod) {
        setSelectedTimePeriod(currentPeriod.id)
        hasAutoSelectedTimePeriod.current = true
      }
    }
  }, [viewMode, effectiveTimePeriods, selectedTimePeriod])

  // Apply time period filter to flights (day view)
  const filteredFlights = useTimePeriodFilter(flights, effectiveTimePeriods, selectedTimePeriod)

  // Convert flights to week view slots for the current date (as fallback/supplement to API data)
  const flightsAsWeekViewSlots = useMemo(() => {
    return convertFlightsToWeekViewSlots(flights, currentDate)
  }, [flights, currentDate])

  // Merge API week view slots with flights-derived data for current date
  const mergedWeekViewSlots = useMemo(() => {
    const currentDateStr = currentDate.toISOString().split('T')[0] as string

    // Create a map of API slots by key for quick lookup
    const apiSlotMap = new Map<string, WeekViewSlot>()
    for (const slot of weekViewSlots) {
      const key = `${slot.date}|${slot.time}|${slot.nine}`
      apiSlotMap.set(key, slot)
    }

    // For the current date, use flights-derived data (which has the most up-to-date local state)
    // For other dates, use API data
    const result: WeekViewSlot[] = []

    // Add all API slots that are NOT for the current date
    for (const slot of weekViewSlots) {
      if (slot.date !== currentDateStr) {
        result.push(slot)
      }
    }

    // Add flights-derived slots for the current date
    for (const slot of flightsAsWeekViewSlots) {
      result.push(slot)
    }

    return result
  }, [weekViewSlots, flightsAsWeekViewSlots, currentDate])

  // Apply time period filter to week view slots
  const filteredWeekViewSlots = useMemo(() => {
    if (selectedTimePeriod === null || !mergedWeekViewSlots.length) {
      return mergedWeekViewSlots
    }

    const period = effectiveTimePeriods.find((p) => p.id === selectedTimePeriod)
    if (!period) {
      return mergedWeekViewSlots
    }

    // Convert time string (HH:MM) to minutes
    const timeToMinutes = (time: string): number => {
      const parts = time.split(':').map(Number)
      const hours = parts[0] ?? 0
      const minutes = parts[1] ?? 0
      return hours * 60 + minutes
    }

    const startMinutes = timeToMinutes(period.startTime)
    const endMinutes = period.endTime ? timeToMinutes(period.endTime) : 24 * 60

    return mergedWeekViewSlots.filter((slot) => {
      const slotMinutes = timeToMinutes(slot.time)
      return slotMinutes >= startMinutes && slotMinutes < endMinutes
    })
  }, [mergedWeekViewSlots, selectedTimePeriod, effectiveTimePeriods])

  // Compute the effective time range for the week view grid
  // When a time period is selected, only show that time range
  const weekViewTimeDisplay = useMemo(() => {
    if (selectedTimePeriod === null) {
      // No filter - use full day from schedule config
      return {
        firstTeeTime: scheduleConfig?.weekdayFirstTee || '06:00',
        lastTeeTime: scheduleConfig?.weekdayLastTee || '17:00',
      }
    }

    const period = effectiveTimePeriods.find((p) => p.id === selectedTimePeriod)
    if (!period || !period.endTime) {
      return {
        firstTeeTime: scheduleConfig?.weekdayFirstTee || '06:00',
        lastTeeTime: scheduleConfig?.weekdayLastTee || '17:00',
      }
    }

    return {
      firstTeeTime: period.startTime,
      lastTeeTime: period.endTime,
    }
  }, [selectedTimePeriod, effectiveTimePeriods, scheduleConfig])

  // Compute metrics from flights (all flights, not filtered)
  const teeSheetMetrics = useMemo(() => {
    const bookedFlights = flights.filter((f: Flight) => f.status !== 'available' && f.status !== 'blocked')
    const totalPlayers = flights.reduce((acc: number, f: Flight) => acc + f.players.filter((p: Player | null) => p !== null).length, 0)
    const checkedInPlayers = flights.reduce((acc: number, f: Flight) => acc + f.players.filter((p: Player | null) => p?.checkedIn).length, 0)
    const onCoursePlayers = flights.filter((f: Flight) => f.status === 'on-course').reduce((acc: number, f: Flight) => acc + f.players.filter((p: Player | null) => p !== null).length, 0)

    return {
      totalSlots: flights.filter(f => f.status !== 'blocked').length,
      bookedSlots: bookedFlights.length,
      totalPlayers,
      checkedIn: checkedInPlayers,
      onCourse: onCoursePlayers,
      projectedRevenue: totalPlayers * 2500,
      cartsAssigned: carts.filter(c => c.status === 'in-use').length,
      totalCarts: carts.length,
    }
  }, [flights, carts])

  // Reset time period filter when course changes
  useEffect(() => {
    setSelectedTimePeriod(null)
  }, [selectedCourse])

  // Prefetch month view on hover (bundle-preload pattern)
  const prefetchMonthView = usePrefetchMonthView()

  // Month availability - uses real data from tee sheet API
  const { availability: monthAvailability, isLoading: isMonthLoading } = useMonthAvailability({
    courseId: selectedCourse,
    month: currentDate,
    enabled: !!selectedCourse && viewMode === 'month',
  })

  // Generate side-by-side data for 18-hole view
  const sideBySideData = useMemo(
    () => generateMockSideBySideData(currentDate, selectedCourse),
    [currentDate, selectedCourse]
  )

  // Handlers
  const handleDateChange = (date: Date) => {
    setCurrentDate(date)
  }

  const handleFlightClick = (flight: Flight) => {
    setSelectedFlight(flight)
    setSelectedGroupId(undefined) // Show all groups when clicking row
  }

  const handlePlayerClick = (flight: Flight, groupId?: 1 | 2) => {
    setSelectedFlight(flight)
    setSelectedGroupId(groupId) // Filter to show only this group
  }

  const handleBookSlot = (flightId: string, position: number) => {
    const flight = flights.find(f => f.id === flightId)
    if (flight) {
      // Close detail panel before opening modal
      setSelectedFlight(null)
      // Always open new booking modal - multiple bookings can share a flight
      // To edit an existing booking, user clicks on a booked player instead
      openBookingModal('new', convertTo24Hour(flight.time), selectedCourse || '')
    }
  }

  const handleCheckIn = () => {
    if (selectedFlight) {
      setShowCheckInModal(true)
    }
  }

  const handleSettle = () => {
    if (selectedFlight) {
      setShowSettlementModal(true)
    }
  }

  // Course handlers
  const handleSaveCourse = async (data: Omit<Course, 'id'>) => {
    if (editingCourse) {
      setCourses(courses.map(c => c.id === editingCourse.id ? { ...data, id: editingCourse.id } : c))
    } else {
      setCourses([...courses, { ...data, id: `course-${Date.now()}` }])
    }
  }

  const handleDeleteCourse = async () => {
    if (editingCourse) {
      setCourses(courses.filter(c => c.id !== editingCourse.id))
    }
  }

  // Cart handlers
  const handleSaveCart = async (data: Omit<Cart, 'id'>) => {
    if (editingCart) {
      setCarts(carts.map(c => c.id === editingCart.id ? { ...data, id: editingCart.id } : c))
    } else {
      setCarts([...carts, { ...data, id: `cart-${Date.now()}` }])
    }
  }

  const handleDeleteCart = async () => {
    if (editingCart) {
      setCarts(carts.filter(c => c.id !== editingCart.id))
    }
  }

  // Caddy handlers
  const handleSaveCaddy = async (data: Omit<Caddy, 'id'>) => {
    if (editingCaddy) {
      setCaddies(caddies.map(c => c.id === editingCaddy.id ? { ...data, id: editingCaddy.id } : c))
    } else {
      setCaddies([...caddies, { ...data, id: `caddy-${Date.now()}` }])
    }
  }

  const handleDeleteCaddy = async () => {
    if (editingCaddy) {
      setCaddies(caddies.filter(c => c.id !== editingCaddy.id))
    }
  }

  // Helper to generate unique booking ID
  const generateBookingId = () => `booking-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

  // Mock club settings for BookingModal (TODO: fetch from clubGolfSettings API when available)
  const mockClubSettings: NewClubSettings = {
    cartPolicy: 'OPTIONAL',
    rentalPolicy: 'OPTIONAL',
    maxGuestsPerMember: 3,
    requireGuestContact: false,
  }

  // Open unified BookingModal in either mode
  const openBookingModal = useCallback((mode: 'new' | 'existing', time: string, courseId: string, booking?: Booking) => {
    setBookingModalMode(mode)
    setBookingModalSlot({ time, courseId })
    if (booking) {
      setSelectedBooking(booking)
    }
    setIsBookingModalOpen(true)
  }, [])

  // Search members for BookingModal
  const handleSearchMembers = useCallback(async (query: string): Promise<PlayerData[]> => {
    const SearchMembersQuery = `
      query SearchMembers($search: String!, $first: Int) {
        members(search: $search, first: $first) {
          edges {
            node {
              id
              memberId
              firstName
              lastName
              email
              phone
            }
          }
        }
      }
    `

    try {
      const data = await request<{
        members: {
          edges: Array<{
            node: {
              id: string
              memberId: string
              firstName: string
              lastName: string
              email?: string
              phone?: string
            }
          }>
        }
      }>(SearchMembersQuery, { search: query, first: 20 })

      return data.members.edges.map(edge => ({
        id: edge.node.id,
        name: `${edge.node.firstName} ${edge.node.lastName}`,
        type: 'member' as const,
        memberId: edge.node.memberId,
        email: edge.node.email,
        phone: edge.node.phone,
      }))
    } catch (error) {
      console.error('Error searching members:', error)
      return []
    }
  }, [])

  // Convert time from "7:00 AM" format to "07:00" 24-hour format
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

  // Flight action handlers
  const handleBookTeeTime = useCallback(async (data: {
    slotId: string
    players: Array<{ id: string; name: string; type: 'member' | 'guest' | 'dependent' | 'walkup'; memberId?: string }>
    notes?: string
    holeChoice?: '9-hole' | '18-hole'
  }) => {
    // Find the flight to get the time
    const flight = flights.find(f => f.id === data.slotId)
    if (!flight) {
      console.error('Flight not found:', data.slotId)
      return
    }

    // Convert time from "7:00 AM" format to "07:00" format for API
    const convertTo24Hour = (time12h: string): string => {
      const [time, modifier] = time12h.split(' ')
      let [hours, minutes] = (time || '12:00').split(':')
      if (hours === '12') {
        hours = modifier === 'AM' ? '00' : '12'
      } else if (modifier === 'PM') {
        hours = String(parseInt(hours || '0', 10) + 12)
      }
      return `${hours?.padStart(2, '0')}:${minutes}`
    }

    const teeTime = convertTo24Hour(flight.time)
    // Send full ISO date-time string for GraphQL DateTime scalar
    // Create a date at midnight UTC for the selected date
    const dateOnly = currentDate.toISOString().split('T')[0] || new Date().toISOString().split('T')[0] || ''
    const teeDate = `${dateOnly}T00:00:00.000Z`

    // Transform players to API format
    // Note: player.id is the actual member UUID (from API search), player.memberId is the member number (e.g., M-0001) for display
    // Map frontend player types to API enum values
    const playerTypeMap: Record<string, string> = {
      'member': 'MEMBER',
      'guest': 'GUEST',
      'dependent': 'DEPENDENT',
      'walkup': 'WALK_UP', // Frontend uses 'walkup', API expects 'WALK_UP'
    }
    const apiPlayers = data.players.map((player, index) => ({
      position: index + 1,
      playerType: playerTypeMap[player.type] || player.type.toUpperCase(),
      memberId: player.type === 'member' ? player.id : undefined, // Use player.id which is the real UUID
      guestName: player.type === 'guest' || player.type === 'walkup' ? player.name : undefined,
    }))

    try {
      // Call the API to create the tee time booking
      // Determine holes from holeChoice (default to 18 if not specified)
      const holes = data.holeChoice === '9-hole' ? 9 : 18

      // Debug: Log the data being sent to the API
      const createTeeTimeInput = {
        courseId: selectedCourse,
        teeDate,
        teeTime,
        holes,
        players: apiPlayers,
      }

      await createTeeTime(createTeeTimeInput)

      // Refetch the tee sheet to get updated data
      refetchTeeSheet()

      // Close the modal
      setShowBookingModal(false)
    } catch (error: any) {
      console.error('Failed to create tee time:', error)
      // Log detailed error information
      if (error.response?.errors) {
        console.error('GraphQL errors:', JSON.stringify(error.response.errors, null, 2))
      }
      if (error.message) {
        console.error('Error message:', error.message)
      }
      // TODO: Show error to user via toast or alert
    }
  }, [flights, currentDate, selectedCourse, createTeeTime, refetchTeeSheet])

  const handleCheckInFlight = useCallback(async (data: {
    flightId: string
    playerIds: string[]
    cartId?: string
    caddyId?: string
  }) => {
    try {
      // Call the API to check in the flight
      await checkIn(data.flightId)

      // Refetch the tee sheet to get updated data
      refetchTeeSheet()

      // Update cart status if assigned (local state for now)
      if (data.cartId) {
        setCarts(prev => prev.map(cart =>
          cart.id === data.cartId
            ? { ...cart, status: 'in-use' as Cart['status'], currentAssignment: selectedFlight?.time }
            : cart
        ))
      }

      // Update caddy status if assigned (local state for now)
      if (data.caddyId) {
        setCaddies(prev => prev.map(caddy =>
          caddy.id === data.caddyId
            ? { ...caddy, status: 'assigned' as Caddy['status'], currentAssignment: selectedFlight?.time }
            : caddy
        ))
      }

      setShowCheckInModal(false)
    } catch (error) {
      console.error('Failed to check in flight:', error)
    }
  }, [selectedFlight, checkIn, refetchTeeSheet])

  const handleRemovePlayer = useCallback(async (playerId: string) => {
    if (!selectedFlight) return

    setFlights((prev: Flight[]) => prev.map((flight: Flight) => {
      if (flight.id === selectedFlight.id) {
        const newPlayers = flight.players.map((p: Player | null) => p?.id === playerId ? null : p) as Flight['players']
        const hasPlayers = newPlayers.some((p: Player | null) => p !== null)
        return {
          ...flight,
          status: hasPlayers ? flight.status : 'available' as FlightStatus,
          players: newPlayers,
        }
      }
      return flight
    }))

    // Update selected flight
    setSelectedFlight((prev: Flight | null) => {
      if (!prev) return prev
      const newPlayers = prev.players.map((p: Player | null) => p?.id === playerId ? null : p) as Flight['players']
      return { ...prev, players: newPlayers }
    })
  }, [selectedFlight])

  const handleAssignCart = useCallback(async (cartId: string) => {
    if (!selectedFlight) return

    // Update the flight with cart assignment
    setFlights((prev: Flight[]) => prev.map((flight: Flight) =>
      flight.id === selectedFlight.id
        ? { ...flight, cartId }
        : flight
    ))

    // Update cart status
    setCarts((prev: Cart[]) => prev.map((cart: Cart) =>
      cart.id === cartId
        ? { ...cart, status: 'in-use' as Cart['status'], currentAssignment: selectedFlight.time }
        : cart
    ))

    // Update selected flight
    setSelectedFlight((prev: Flight | null) => prev ? { ...prev, cartId } : prev)
  }, [selectedFlight])

  const handleAssignCaddy = useCallback(async (caddyId: string) => {
    if (!selectedFlight) return

    // Update the flight with caddy assignment
    setFlights((prev: Flight[]) => prev.map((flight: Flight) =>
      flight.id === selectedFlight.id
        ? { ...flight, caddyId }
        : flight
    ))

    // Update caddy status
    setCaddies((prev: Caddy[]) => prev.map((caddy: Caddy) =>
      caddy.id === caddyId
        ? { ...caddy, status: 'assigned' as Caddy['status'], currentAssignment: selectedFlight.time }
        : caddy
    ))

    // Update selected flight
    setSelectedFlight((prev: Flight | null) => prev ? { ...prev, caddyId } : prev)
  }, [selectedFlight])

  const handleUnassignCart = useCallback(async () => {
    if (!selectedFlight?.cartId) return

    const cartId = selectedFlight.cartId

    // Update the flight to remove cart assignment
    setFlights((prev: Flight[]) => prev.map((flight: Flight) =>
      flight.id === selectedFlight.id
        ? { ...flight, cartId: undefined }
        : flight
    ))

    // Update cart status back to available
    setCarts((prev: Cart[]) => prev.map((cart: Cart) =>
      cart.id === cartId
        ? { ...cart, status: 'available' as Cart['status'], currentAssignment: undefined }
        : cart
    ))

    // Update selected flight
    setSelectedFlight((prev: Flight | null) => prev ? { ...prev, cartId: undefined } : prev)
  }, [selectedFlight])

  const handleUnassignCaddy = useCallback(async () => {
    if (!selectedFlight?.caddyId) return

    const caddyId = selectedFlight.caddyId

    // Update the flight to remove caddy assignment
    setFlights((prev: Flight[]) => prev.map((flight: Flight) =>
      flight.id === selectedFlight.id
        ? { ...flight, caddyId: undefined }
        : flight
    ))

    // Update caddy status back to available
    setCaddies((prev: Caddy[]) => prev.map((caddy: Caddy) =>
      caddy.id === caddyId
        ? { ...caddy, status: 'available' as Caddy['status'], currentAssignment: undefined }
        : caddy
    ))

    // Update selected flight
    setSelectedFlight((prev: Flight | null) => prev ? { ...prev, caddyId: undefined } : prev)
  }, [selectedFlight])

  // Per-player rental status handlers
  const handlePlayerCartStatusChange = useCallback(async (player: Player, status: RentalStatus) => {
    if (!selectedFlight) return

    // Update the player's cart status in the flight
    const updatePlayers = (players: Flight['players']) =>
      players.map((p: Player | null) =>
        p?.id === player.id ? { ...p, cartStatus: status, hasCart: status !== 'none' } : p
      ) as Flight['players']

    setFlights((prev: Flight[]) => prev.map((flight: Flight) =>
      flight.id === selectedFlight.id
        ? { ...flight, players: updatePlayers(flight.players) }
        : flight
    ))

    // Update selected flight
    setSelectedFlight((prev: Flight | null) =>
      prev ? { ...prev, players: updatePlayers(prev.players) } : prev
    )
  }, [selectedFlight])

  const handlePlayerCaddyStatusChange = useCallback(async (player: Player, status: RentalStatus) => {
    if (!selectedFlight) return

    // Update the player's caddy status in the flight
    const updatePlayers = (players: Flight['players']) =>
      players.map((p: Player | null) =>
        p?.id === player.id ? { ...p, caddyStatus: status, hasCaddy: status !== 'none' } : p
      ) as Flight['players']

    setFlights((prev: Flight[]) => prev.map((flight: Flight) =>
      flight.id === selectedFlight.id
        ? { ...flight, players: updatePlayers(flight.players) }
        : flight
    ))

    // Update selected flight
    setSelectedFlight((prev: Flight | null) =>
      prev ? { ...prev, players: updatePlayers(prev.players) } : prev
    )
  }, [selectedFlight])

  const handleSettlement = useCallback(async (data: {
    flightId: string
    settlements: Array<{ playerId: string; amount: number; method: string }>
  }) => {
    // Mark flight as completed
    setFlights((prev: Flight[]) => prev.map((flight: Flight) =>
      flight.id === data.flightId
        ? { ...flight, status: 'completed' as FlightStatus }
        : flight
    ))

    // Release cart if assigned
    if (selectedFlight?.cartId) {
      setCarts((prev: Cart[]) => prev.map((cart: Cart) =>
        cart.id === selectedFlight.cartId
          ? { ...cart, status: 'available' as Cart['status'], currentAssignment: undefined }
          : cart
      ))
    }

    // Release caddy if assigned
    if (selectedFlight?.caddyId) {
      setCaddies((prev: Caddy[]) => prev.map((caddy: Caddy) =>
        caddy.id === selectedFlight.caddyId
          ? { ...caddy, status: 'available' as Caddy['status'], currentAssignment: undefined }
          : caddy
      ))
    }

    setShowSettlementModal(false)
    setSelectedFlight(null)
  }, [selectedFlight])

  const handleViewFlightFromSchedule = useCallback((flightId: string) => {
    const flight = flights.find((f: Flight) => f.id === flightId)
    if (flight) {
      setSelectedFlight(flight)
      setActiveTab('tee-sheet')
    }
    setShowCaddyScheduleModal(false)
    setScheduleCaddy(null)
  }, [flights])

  // Row action handlers
  const handleRowCheckIn = useCallback((flight: Flight) => {
    setSelectedFlight(flight)
    setShowCheckInModal(true)
  }, [])

  const handleRowNoShow = useCallback((flight: Flight) => {
    // Mark flight as no-show
    setFlights((prev: Flight[]) => prev.map((f: Flight) =>
      f.id === flight.id
        ? { ...f, status: 'no-show' as FlightStatus }
        : f
    ))
  }, [])

  const handleResendConfirmation = useCallback((flight: Flight) => {
    // In production, this would send confirmation emails
    console.log('Resending confirmation for flight:', flight.id)
    // Show toast notification
    alert(`Confirmation emails sent to ${flight.players.filter((p: Player | null) => p !== null).length} player(s)`)
  }, [])

  const handleEditFlight = useCallback((flight: Flight) => {
    // Open BookingModal in edit mode for booked flights
    const hasPlayers = flight.players.some(p => p !== null)
    if (hasPlayers) {
      const courseName = courses.find(c => c.id === selectedCourse)?.name || 'Main Course'
      const booking = flightToBooking(flight, courseName, selectedCourse)
      openBookingModal('existing', convertTo24Hour(flight.time), selectedCourse, booking)
    } else {
      setSelectedFlight(flight)
    }
  }, [courses, selectedCourse, openBookingModal, convertTo24Hour])

  const handleMoveFlight = useCallback((flight: Flight) => {
    // For now, open the detail panel - in production would open a move modal
    setSelectedFlight(flight)
    // TODO: Implement move flight modal
    console.log('Move flight:', flight.id)
  }, [])

  const handleCancelFlight = useCallback((flight: Flight) => {
    // Cancel the booking
    setFlights((prev: Flight[]) => prev.map((f: Flight) =>
      f.id === flight.id
        ? {
            ...f,
            status: 'available' as FlightStatus,
            players: [null, null, null, null],
            notes: undefined,
          }
        : f
    ))
  }, [])

  // =========================================================================
  // BOOKING-CENTRIC HANDLERS
  // =========================================================================

  // Handle booking select from BookingChip - opens BookingModal
  const handleBookingViewSelect = useCallback((flightId: string, playerId: string) => {
    // Find the flight
    const flight = flights.find((f) => f.id === flightId)
    if (!flight) return

    // Find the clicked player to get their bookingId
    const clickedPlayer = flight.players.find((p) => p?.id === playerId)
    if (!clickedPlayer) return

    // Get the booking ID from the player (or fall back to flight ID)
    const bookingId = clickedPlayer.bookingId || flightId

    // Find all players that belong to the same booking (exact match on bookingId)
    const bookingPlayers = flight.players.filter(
      (p): p is NonNullable<typeof p> => p !== null && p !== undefined && p.bookingId === bookingId
    )

    if (bookingPlayers.length === 0) return

    const course = courses.find((c) => c.id === selectedCourse)
    const dateStr = flight.date || currentDate.toISOString().split('T')[0] || ''
    const formattedDate = dateStr.replace(/-/g, '').substring(2)

    const firstPlayer = bookingPlayers[0]
    const booking: Booking = {
      id: bookingId,
      bookingNumber: `CV-${formattedDate}-${bookingId.slice(-3)}`,
      status: (flight.status === 'available' ? 'booked' : flight.status === 'finished' ? 'completed' : flight.status) as import('@/components/golf/types').BookingStatus,
      flightId: flight.id,
      teeTime: flight.time.replace(' AM', '').replace(' PM', '').padStart(5, '0'),
      teeDate: dateStr,
      courseId: selectedCourse,
      courseName: course?.name || 'Main Course',
      bookerId: firstPlayer?.id || 'unknown',
      bookerName: firstPlayer?.name || 'Unknown',
      bookerMemberId: firstPlayer?.memberId,
      bookerType: firstPlayer?.type === 'member' ? 'member' : 'staff',
      players: bookingPlayers.map((p, i) => ({
        id: `player-${p?.id || i}`,
        playerId: p?.id || `player-${i}`,
        playerType: (p?.type || 'guest') as import('@/components/golf/player-type-badge').PlayerType,
        position: (i + 1) as 1 | 2 | 3 | 4,
        name: p?.name || 'Unknown',
        memberId: p?.memberId,      // Display ID (M-0005)
        memberUuid: p?.memberUuid,  // Member.id (UUID) for API calls
        cartStatus: p?.cartStatus,  // Rental status for cart
        caddyStatus: p?.caddyStatus, // Rental status for caddy
        cartRequest: p?.cartRequest,  // Cart request for edit modal
        caddyRequest: p?.caddyRequest, // Caddy request for edit modal
        rentalRequest: p?.rentalRequest, // Rental request for edit modal
      })),
      playerCount: bookingPlayers.length,
      notes: flight.notes,
      holes: flight.holes,
      createdAt: new Date().toISOString(),
      createdBy: 'system',
      modifiedAt: new Date().toISOString(),
      modifiedBy: 'system',
    }

    // Open the new BookingModal instead of BookingDetailModal
    openBookingModal('existing', convertTo24Hour(flight.time), selectedCourse, booking)
  }, [flights, courses, selectedCourse, currentDate, openBookingModal, convertTo24Hour])

  // Handle adding a new booking from empty slot
  const handleAddBookingFromSlot = useCallback((teeTime: string, slotIndex: number) => {
    // Find the flight for this tee time
    const flight = flights.find((f) => f.time === teeTime)
    if (flight) {
      handleBookSlot(flight.id, slotIndex)
    }
  }, [flights, handleBookSlot])

  // Handle booking context menu actions
  const handleBookingContextAction = useCallback((bookingId: string, action: BookingAction) => {
    // Find flight by booking group ID, player bookingId, or flight ID
    const flight = flights.find((f) =>
      f.bookingGroups?.some((g) => g.id === bookingId) ||
      f.players.some((p) => p?.bookingId === bookingId) ||
      f.id === bookingId
    )
    if (!flight) return

    // Filter players that belong to THIS specific booking
    let bookingPlayers = flight.players.filter(
      (p): p is NonNullable<typeof p> => p !== null && p !== undefined && p.bookingId === bookingId
    )

    // Fallback: if no players matched by bookingId, use all players from the flight
    if (bookingPlayers.length === 0) {
      bookingPlayers = flight.players.filter(
        (p): p is NonNullable<typeof p> => p !== null && p !== undefined
      )
    }

    switch (action) {
      case 'check_in':
        handleRowCheckIn(flight)
        break
      case 'move':
        // Start move mode with only players from this booking
        placementMode.startMove({
          id: bookingId,
          bookingNumber: `BK-${bookingId.slice(-4)}`,
          playerNames: bookingPlayers.map((p) => p.name),
          playerCount: bookingPlayers.length,
          sourceTeeTime: flight.time,
          sourceDate: currentDate.toISOString().slice(0, 10),
          sourceFlightId: flight.id,
          playerIds: bookingPlayers.map((p) => p.id),
        })
        break
      case 'copy':
        // Start copy mode with only players from this booking
        placementMode.startCopy({
          id: bookingId,
          bookingNumber: `BK-${bookingId.slice(-4)}`,
          playerNames: bookingPlayers.map((p) => p.name),
          playerCount: bookingPlayers.length,
          sourceTeeTime: flight.time,
          sourceDate: currentDate.toISOString().slice(0, 10),
          sourceFlightId: flight.id,
          playerIds: bookingPlayers.map((p) => p.id),
        })
        break
      case 'edit':
        // Open edit modal with only players from this booking
        if (bookingPlayers.length > 0) {
          const dateStr = currentDate.toISOString().split('T')[0] || ''
          const firstPlayer = bookingPlayers[0]
          const booking: Booking = {
            id: bookingId,
            bookingNumber: `BK-${bookingId.slice(-4)}`,
            status: (flight.status === 'available' ? 'booked' : flight.status === 'finished' ? 'completed' : flight.status) as import('@/components/golf/types').BookingStatus,
            flightId: flight.id,
            teeTime: convertTo24Hour(flight.time),
            teeDate: dateStr,
            courseId: selectedCourse,
            courseName: courses.find(c => c.id === selectedCourse)?.name || 'Main Course',
            bookerId: firstPlayer?.id || 'unknown',
            bookerName: firstPlayer?.name || 'Unknown',
            bookerMemberId: firstPlayer?.memberId,
            bookerType: firstPlayer?.type === 'member' ? 'member' : 'staff',
            players: bookingPlayers.map((p, i) => ({
              id: `player-${p.id}`,
              playerId: (p.type === 'member' || p.type === 'dependent') && p.memberUuid ? p.memberUuid : p.id,
              playerType: p.type as import('@/components/golf/player-type-badge').PlayerType,
              position: (i + 1) as 1 | 2 | 3 | 4,
              name: p.name,
              memberId: p.memberId,
              memberUuid: p.memberUuid,
              cartStatus: p.cartStatus,
              caddyStatus: p.caddyStatus,
            })),
            playerCount: bookingPlayers.length,
            notes: flight.notes,
            createdAt: new Date().toISOString(),
            createdBy: 'system',
            modifiedAt: new Date().toISOString(),
            modifiedBy: 'system',
          }
          openBookingModal('existing', convertTo24Hour(flight.time), selectedCourse, booking)
        }
        break
      case 'resend_confirm':
        handleResendConfirmation(flight)
        break
      case 'cancel':
        handleCancelFlight(flight)
        break
    }
  }, [flights, currentDate, placementMode, handleRowCheckIn, handleResendConfirmation, handleCancelFlight, convertTo24Hour])

  // Handle slot context menu actions
  const handleSlotContextAction = useCallback((teeTime: string, action: SlotAction) => {
    const flight = flights.find((f) => f.time === teeTime)
    if (!flight) return

    switch (action) {
      case 'new_booking':
        handleBookSlot(flight.id, 0)
        break
      case 'add_block':
        setBlockModalFlightTime(flight.time)
        setShowBlockModal(true)
        break
      case 'paste':
        if (clipboardBooking && placementMode.state.active) {
          // Complete the paste operation
          placementMode.complete()
          setClipboardBooking(null)
        }
        break
    }
  }, [flights, clipboardBooking, placementMode, handleBookSlot])

  // Handle placement target selection - show confirmation dialog
  const handlePlacementSelect = useCallback((teeTime: string) => {
    if (!placementMode.state.active || !placementMode.state.sourceBooking) return

    // Find the target flight
    const targetFlight = flights.find((f) => f.time === teeTime)
    if (!targetFlight) return

    // Check if there's room
    const currentPlayers = targetFlight.players.filter(Boolean).length
    const incomingPlayers = placementMode.state.sourceBooking.playerCount
    if (currentPlayers + incomingPlayers > 4) {
      console.warn('Not enough room in target slot')
      return
    }

    // Show confirmation dialog
    setMoveDialog({
      isOpen: true,
      targetTeeTime: teeTime,
      isProcessing: false,
    })
  }, [flights, placementMode])

  // Handle move/copy confirmation - actually perform the operation
  const handleMoveConfirm = useCallback(async () => {
    if (!placementMode.state.active || !placementMode.state.sourceBooking) return
    if (!selectedCourse) return

    const courseId = selectedCourse
    const { sourceBooking, action } = placementMode.state
    const targetTeeTime = moveDialog.targetTeeTime

    // Find source flight by ID first, fallback to time matching
    const sourceFlight = sourceBooking.sourceFlightId
      ? flights.find((f) => f.id === sourceBooking.sourceFlightId)
      : flights.find((f) => f.time === sourceBooking.sourceTeeTime)
    const targetFlight = flights.find((f) => f.time === targetTeeTime)

    if (!sourceFlight || !targetFlight) return

    setMoveDialog((prev) => ({ ...prev, isProcessing: true }))

    try {
      // Convert 12-hour time format to 24-hour format for API
      const convert12To24Hour = (time12: string): string => {
        const match = time12.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i)
        if (!match) return time12
        let hours = parseInt(match[1] || '0', 10)
        const minutes = match[2]
        const period = match[3]?.toUpperCase()
        if (period === 'PM' && hours !== 12) hours += 12
        if (period === 'AM' && hours === 12) hours = 0
        return `${hours.toString().padStart(2, '0')}:${minutes}`
      }

      const dateStr = currentDate.toISOString().slice(0, 10)
      const newTeeTime24 = convert12To24Hour(targetTeeTime)

      if (action === 'move') {
        await moveTeeTime(sourceBooking.id, {
          newTeeDate: dateStr,
          newTeeTime: newTeeTime24,
          newCourseId: courseId,
        })
      } else {
        // For copy action, create a new booking with the same players
        let playersToCopy = sourceFlight.players.filter(
          (p): p is Player => p !== null && (
            !sourceBooking.playerIds?.length ||
            sourceBooking.playerIds.includes(p.id) ||
            sourceBooking.playerNames.includes(p.name)
          )
        )

        if (playersToCopy.length === 0) {
          playersToCopy = sourceFlight.players.filter((p): p is Player => p !== null)
        }

        await createTeeTime({
          courseId: courseId,
          teeDate: dateStr,
          teeTime: newTeeTime24,
          holes: sourceFlight.holes || 18,
          players: playersToCopy.map((p, index) => ({
            position: index + 1,
            playerType: p.type === 'member' ? 'MEMBER' : p.type === 'guest' ? 'GUEST' : 'MEMBER',
            memberId: p.memberUuid,
            guestName: p.type === 'guest' ? p.name : undefined,
          })),
        })
      }

      // Refetch tee sheet to get updated data
      refetchTeeSheet()

      // Close dialog and complete placement mode
      setMoveDialog({ isOpen: false, targetTeeTime: '', isProcessing: false })
      placementMode.complete()
    } catch (error) {
      console.error('Move/copy operation failed:', error)
      setMoveDialog((prev) => ({ ...prev, isProcessing: false }))
    }
  }, [flights, placementMode, moveDialog.targetTeeTime, currentDate, selectedCourse, moveTeeTime, createTeeTime, refetchTeeSheet])

  // Handle move dialog cancel
  const handleMoveCancel = useCallback(() => {
    setMoveDialog({ isOpen: false, targetTeeTime: '', isProcessing: false })
  }, [])

  // Handle releasing a block
  const handleReleaseBlock = useCallback((blockId: string) => {
    setFlights((prev: Flight[]) => prev.map((f: Flight) =>
      f.id === blockId
        ? {
            ...f,
            status: 'available' as FlightStatus,
            blockedReason: undefined,
          }
        : f
    ))
  }, [])

  // Render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'tee-sheet':
        // Tee sheet content that can optionally be wrapped with POS
        const teeSheetContent = (
          <div className="space-y-6">
            {/* Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <DateNavigator
                  currentDate={currentDate}
                  onDateChange={handleDateChange}
                  availability={monthAvailability}
                />

                <div className="flex border border-border rounded-md overflow-hidden bg-card">
                  {(['day', 'week', 'month'] as ViewMode[]).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setViewMode(mode)}
                      // Preload data on hover (bundle-preload pattern)
                      onMouseEnter={
                        mode === 'week' && viewMode !== 'week' && selectedCourse
                          ? () => prefetchWeekView(selectedCourse, currentDate)
                          : mode === 'month' && viewMode !== 'month' && selectedCourse
                            ? () => prefetchMonthView(selectedCourse, currentDate)
                            : undefined
                      }
                      className={`px-3 py-1.5 text-sm capitalize ${
                        viewMode === mode
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>

                {/* Layout toggle - only show in day view */}
                {viewMode === 'day' && (
                  <div className="flex border border-border rounded-md overflow-hidden bg-card">
                    <button
                      onClick={() => setLayoutType('list')}
                      className={`px-3 py-1.5 text-sm flex items-center gap-1.5 ${
                        layoutType === 'list'
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                      title="List view"
                    >
                      <List className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setLayoutType('split')}
                      className={`px-3 py-1.5 text-sm flex items-center gap-1.5 ${
                        layoutType === 'split'
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                      title="Front 9 / Back 9 split view"
                    >
                      <Columns className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-4">
                <select
                  className="h-10 rounded-md border border-input bg-card text-foreground px-3 py-2 text-sm"
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                >
                  {courses.map((course) => (
                    <option key={course.id} value={course.id} className="bg-card text-foreground">
                      {course.name}
                    </option>
                  ))}
                </select>

                <div className="flex items-center gap-2 text-sm text-muted-foreground border border-border rounded-md px-3 py-2 bg-card">
                  {weatherData.condition === 'sunny' ? (
                    <Sun className="h-4 w-4 text-amber-500" />
                  ) : (
                    <Cloud className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span>{weatherData.temp}°C</span>
                  <span className="text-muted-foreground/60">|</span>
                  <span>{weatherData.humidity}%</span>
                </div>

                <Button variant="outline" size="icon">
                  <Printer className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Metrics */}
            <TeeSheetMetrics
              slots={{ booked: teeSheetMetrics.bookedSlots, total: teeSheetMetrics.totalSlots }}
              players={teeSheetMetrics.totalPlayers}
              checkedIn={teeSheetMetrics.checkedIn}
              onCourse={teeSheetMetrics.onCourse}
              revenue={teeSheetMetrics.projectedRevenue}
              carts={{ assigned: teeSheetMetrics.cartsAssigned, total: teeSheetMetrics.totalCarts }}
            />

            {/* Time Period Filter - show in day and week views */}
            {(viewMode === 'day' || viewMode === 'week') && effectiveTimePeriods.length > 0 && (
              <TimePeriodFilter
                periods={effectiveTimePeriods}
                selectedPeriod={selectedTimePeriod}
                onSelect={setSelectedTimePeriod}
              />
            )}

            {/* View Content */}
            {viewMode === 'day' && layoutType === 'list' && (
              <TeeSheetBookingView
                flights={filteredFlights}
                placementMode={placementMode}
                clipboardBooking={clipboardBooking}
                onBookingSelect={handleBookingViewSelect}
                onAddBooking={handleAddBookingFromSlot}
                onBookingAction={handleBookingContextAction}
                onSlotAction={handleSlotContextAction}
                onPlacementSelect={handlePlacementSelect}
                onReleaseBlock={handleReleaseBlock}
              />
            )}

            {viewMode === 'day' && layoutType === 'split' && (
              <TeeSheetSideBySideView
                data={sideBySideData}
                onFlightClick={(flight: Flight, nineHole: NineHoleType) => {
                  handleFlightClick(flight)
                }}
                onBookSlot={(flight: Flight, position: number, nineHole: NineHoleType) => {
                  handleBookSlot(flight.id, position)
                }}
              />
            )}

            {viewMode === 'week' && (
              <TeeSheetWeekView
                startDate={currentDate}
                weekViewSlots={filteredWeekViewSlots}
                isLoading={isWeekViewLoading}
                crossoverMode={scheduleConfig?.weekdayBookingMode === 'CROSS'}
                firstTeeTime={weekViewTimeDisplay.firstTeeTime}
                lastTeeTime={weekViewTimeDisplay.lastTeeTime}
                onDayClick={(date: Date) => {
                  setCurrentDate(date)
                  setViewMode('day')
                }}
                onSlotClick={(date, time, nine, position, slot) => {
                  // Open new booking modal - multiple bookings can share a flight
                  // Backend validates total players ≤ 4
                  setCurrentDate(date)
                  openBookingModal('new', time, selectedCourse || '')
                }}
                onPlayerEdit={(playerId, date, time, nine) => {
                  // Switch to day view for full editing experience
                  setCurrentDate(date)
                  setViewMode('day')
                }}
                onPlayerRemove={(playerId, date, time, nine) => {
                  // TODO: Implement player removal via mutation
                  console.log('Remove player', playerId, date, time, nine)
                }}
                onViewMember={(memberId) => {
                  // Navigate to member profile
                  window.location.href = `/members/${memberId}`
                }}
              />
            )}

            {viewMode === 'month' && (
              <TeeSheetMonthView
                currentMonth={currentDate}
                availability={monthAvailability}
                onDayClick={(date: Date) => {
                  setCurrentDate(date)
                  setViewMode('day')
                }}
                onMonthChange={setCurrentDate}
                isLoading={isMonthLoading}
              />
            )}
          </div>
        )

        // Conditionally wrap with POS when enabled
        if (isPOSEnabled) {
          // Get selected player IDs from selected flight
          const selectedPlayerIds = selectedFlight
            ? selectedFlight.players
                .filter((p): p is Player => p !== null)
                .map((p) => p.id)
            : []

          return (
            <GolfPOSWrapper
              selectedTeeTimeId={selectedFlight?.id}
              selectedPlayerIds={selectedPlayerIds}
              onOpenSettlement={() => setShowSettlementModal(true)}
            >
              {teeSheetContent}
            </GolfPOSWrapper>
          )
        }

        return teeSheetContent

      case 'bookings':
        // Generate bookings from flights for the bookings tab
        const mockBookings = generateMockBookings(
          flights,
          courses.find(c => c.id === selectedCourse)?.name || 'Main Course',
          currentDate
        )
        // Filter bookings based on search query
        const filteredBookings = mockBookings.filter(booking => {
          if (!bookingsSearchQuery.trim()) return true
          const query = bookingsSearchQuery.toLowerCase()
          return (
            booking.bookingNumber.toLowerCase().includes(query) ||
            booking.bookerName.toLowerCase().includes(query) ||
            booking.courseName.toLowerCase().includes(query)
          )
        })

        return (
          <BookingsTab
            bookings={filteredBookings}
            isLoading={isTeeSheetLoading}
            searchQuery={bookingsSearchQuery}
            onSearchChange={setBookingsSearchQuery}
            onBookingSelect={(bookingId) => {
              // Find the flight for this booking
              const flight = flights.find(f => f.id === bookingId)
              if (flight) {
                const booking = flightToBooking(
                  flight,
                  courses.find(c => c.id === selectedCourse)?.name || 'Main Course',
                  selectedCourse
                )
                // Open the new BookingModal instead of BookingDetailModal
                openBookingModal('existing', convertTo24Hour(flight.time), selectedCourse, booking)
              }
            }}
          />
        )

      case 'courses':
        return (
          <CoursesTab
            courses={courses}
            isLoading={isCoursesLoading}
            onAddCourse={() => {
              setEditingCourse(null)
              setShowCourseModal(true)
            }}
            onEditCourse={(course: Course) => {
              setEditingCourse(course)
              setShowCourseModal(true)
            }}
          />
        )

      case 'carts':
        return (
          <CartsTab
            carts={carts}
            onAddCart={() => {
              setEditingCart(null)
              setShowCartModal(true)
            }}
            onEditCart={(cart: Cart) => {
              setEditingCart(cart)
              setShowCartModal(true)
            }}
            onScheduleMaintenance={(cart: Cart) => {
              setMaintenanceCart(cart)
              setShowCartMaintenanceModal(true)
            }}
          />
        )

      case 'caddies':
        return (
          <CaddiesTab
            caddies={caddies}
            onAddCaddy={() => {
              setEditingCaddy(null)
              setShowCaddyModal(true)
            }}
            onEditCaddy={(caddy: Caddy) => {
              setEditingCaddy(caddy)
              setShowCaddyModal(true)
            }}
            onViewSchedule={(caddy: Caddy) => {
              setScheduleCaddy(caddy)
              setShowCaddyScheduleModal(true)
            }}
          />
        )

      case 'settings':
        return (
          <SettingsTab
            settings={golfSettings}
            onSaveSection={async (section: string, data: unknown) => {
              console.log('Saving section:', section, data)
              // Update local state - this will trigger tee sheet regeneration
              setGolfSettings(prev => ({
                ...prev,
                [section]: data,
              }))
              await new Promise((resolve) => setTimeout(resolve, 500))
            }}
          />
        )

      default:
        return null
    }
  }

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Golf Management"
        description="Manage tee times, courses, carts, and caddies"
        breadcrumbs={[{ label: 'Golf' }]}
        actions={
          activeTab === 'tee-sheet' && (
            <Button onClick={() => {
              // Find the first available slot to pre-select a time for new booking
              const firstAvailable = flights.find(f => f.status === 'available')
              if (firstAvailable) {
                openBookingModal('new', convertTo24Hour(firstAvailable.time), selectedCourse || '')
              } else {
                // Fallback to old modal if no available slots (should rarely happen)
                setBookingModalFlight(null)
                setShowBookingModal(true)
              }
            }}>
              <Plus className="mr-2 h-4 w-4" />
              New Booking
            </Button>
          )
        }
      />

      <GolfTabsLayout activeTab={activeTab} onTabChange={setActiveTab}>
        {renderTabContent()}
      </GolfTabsLayout>

      {/* Flight Detail Panel */}
      {selectedFlight && (
        <FlightDetailPanel
          isOpen={!!selectedFlight}
          onClose={() => {
            setSelectedFlight(null)
            setSelectedGroupId(undefined)
          }}
          flight={selectedFlight}
          selectedGroupId={selectedGroupId}
          onCheckIn={handleCheckIn}
          onSettle={handleSettle}
          onAddPlayer={() => {
            // Open BookingModal in edit mode to add players
            const courseName = courses.find(c => c.id === selectedCourse)?.name || 'Main Course'
            const booking = flightToBooking(selectedFlight, courseName, selectedCourse)
            openBookingModal('existing', convertTo24Hour(selectedFlight.time), selectedCourse, booking)
          }}
          onRemovePlayer={(player: Player) => handleRemovePlayer(player.id)}
          availableCarts={carts.filter((c: Cart) => c.status === 'available')}
          availableCaddies={caddies.filter((c: Caddy) => c.status === 'available')}
          onAssignCart={handleAssignCart}
          onAssignCaddy={handleAssignCaddy}
          onUnassignCart={handleUnassignCart}
          onUnassignCaddy={handleUnassignCaddy}
          onPlayerCartStatusChange={handlePlayerCartStatusChange}
          onPlayerCaddyStatusChange={handlePlayerCaddyStatusChange}
        />
      )}

      {/* Booking Modal */}
      <BookTeeTimeModal
        isOpen={showBookingModal}
        onClose={() => {
          setShowBookingModal(false)
          setBookingModalFlight(null)
        }}
        courseName={courses.find(c => c.id === selectedCourse)?.name || 'Main Course'}
        date={currentDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        preselectedTime={bookingModalFlight?.time}
        existingPlayers={bookingModalFlight?.players}
        existingGroups={bookingModalFlight?.bookingGroups}
        course={courses.find(c => c.id === selectedCourse)}
        enable18HoleBooking={courses.find(c => c.id === selectedCourse)?.enable18HoleBooking || false}
        availableSlots={bookingModalFlight
          ? [{ time: bookingModalFlight.time, available: 4 - bookingModalFlight.players.filter((p: Player | null) => p !== null).length }]
          : flights
            .filter((f: Flight) => f.status === 'available' || (f.status === 'booked' && f.players.some((p: Player | null) => p === null)))
            .map((f: Flight) => ({
              time: f.time,
              available: 4 - f.players.filter((p: Player | null) => p !== null).length
            }))}
        onConfirm={async (data: {
          time: string
          players: Array<{ id: string; name: string; type: PlayerType; memberId?: string }>
          caddyRequest: 'none' | 'shared' | 'individual'
          cartRequest: boolean
          notes: string
          bookingType?: 'add' | 'new'
          holeChoice?: '9-hole' | '18-hole'
        }) => {
          // Find the flight by time
          const flight = bookingModalFlight || flights.find((f: Flight) => f.time === data.time)
          if (flight) {
            if (data.bookingType === 'new') {
              // Create new booking group - add players to existing flight
              const existingPlayers = flight.players.filter((p: Player | null) => p !== null)

              // Assign groupId 1 to all existing players
              const newPlayers: Flight['players'] = flight.players.map((p: Player | null) =>
                p ? { ...p, groupId: 1 as const } : p
              )
              let nextPosition = newPlayers.findIndex((p: Player | null) => p === null)

              data.players.forEach((player) => {
                if (nextPosition !== -1 && nextPosition < 4) {
                  newPlayers[nextPosition] = {
                    id: player.id,
                    name: player.name,
                    type: player.type,
                    memberId: player.memberId,
                    groupId: 2, // New group
                  }
                  nextPosition = newPlayers.findIndex((p: Player | null, i: number) => i > nextPosition && p === null)
                }
              })

              // Create booking groups with unique IDs
              const existingGroup = flight.bookingGroups?.[0] || {
                id: generateBookingId(),
                groupNumber: 1 as const,
                bookedBy: existingPlayers[0] ? { id: existingPlayers[0].id, name: existingPlayers[0].name, memberId: existingPlayers[0].memberId } : { id: 'unknown', name: 'Unknown' },
                playerIds: existingPlayers.map((p: Player | null) => p!.id),
              }

              const newGroup: BookingGroup = {
                id: generateBookingId(),
                groupNumber: 2 as const,
                bookedBy: { id: data.players[0]?.id || 'unknown', name: data.players[0]?.name || 'Unknown', memberId: data.players[0]?.memberId },
                playerIds: data.players.map((p: { id: string }) => p.id),
              }

              setFlights(prev => prev.map(f => {
                if (f.id === flight.id) {
                  return {
                    ...f,
                    status: 'booked' as FlightStatus,
                    players: newPlayers,
                    bookingGroups: [existingGroup, newGroup],
                    notes: data.notes || f.notes,
                  }
                }
                return f
              }))
            } else {
              // Add to existing booking
              await handleBookTeeTime({
                slotId: flight.id,
                players: data.players.map((p: { id: string; name: string; type: PlayerType; memberId?: string }) => ({
                  id: p.id,
                  name: p.name,
                  type: p.type,
                  memberId: p.memberId,
                })),
                notes: data.notes,
                holeChoice: data.holeChoice,
              })
            }
          }
          setBookingModalFlight(null)
        }}
      />

      {/* Check-In Panel (Slide-over) */}
      {(selectedFlight || selectedBooking) && (
        <ShoppingCartCheckInPanel
          isOpen={showCheckInModal}
          teeTimeId={selectedFlight?.id || selectedBooking?.flightId || ''}
          onClose={() => setShowCheckInModal(false)}
          onCheckInComplete={() => {
            refetchTeeSheet()
            setShowCheckInModal(false)
          }}
        />
      )}

      {/* Settlement Modal */}
      {selectedFlight && (
        <SettlementModal
          isOpen={showSettlementModal}
          onClose={() => setShowSettlementModal(false)}
          flight={selectedFlight}
          charges={[
            { label: 'Green Fee (per player)', amount: 2500 * selectedFlight.players.filter((p: Player | null) => p !== null).length },
            { label: 'Cart (shared)', amount: 400 },
            { label: 'Caddy Fee', amount: 300 },
          ]}
          onComplete={async (data: { payments: Array<{ playerId: string; amount: number }>; paymentMethod: string }) => {
            await handleSettlement({
              flightId: selectedFlight.id,
              settlements: data.payments.map((p: { playerId: string; amount: number }) => ({
                playerId: p.playerId,
                amount: p.amount,
                method: data.paymentMethod,
              })),
            })
          }}
        />
      )}

      {/* Course Modal */}
      <CourseModal
        isOpen={showCourseModal}
        onClose={() => {
          setShowCourseModal(false)
          setEditingCourse(null)
        }}
        course={editingCourse}
        onSave={handleSaveCourse}
        onDelete={editingCourse ? handleDeleteCourse : undefined}
      />

      {/* Cart Modal */}
      <CartModal
        isOpen={showCartModal}
        onClose={() => {
          setShowCartModal(false)
          setEditingCart(null)
        }}
        cart={editingCart}
        onSave={handleSaveCart}
        onDelete={editingCart ? handleDeleteCart : undefined}
      />

      {/* Cart Maintenance Modal */}
      {maintenanceCart && (
        <CartMaintenanceModal
          isOpen={showCartMaintenanceModal}
          onClose={() => {
            setShowCartMaintenanceModal(false)
            setMaintenanceCart(null)
          }}
          cart={maintenanceCart}
          upcomingMaintenance={[]}
          maintenanceHistory={[]}
          onSchedule={async (data: {
            type: 'routine' | 'repair' | 'inspection' | 'battery' | 'tire' | 'cleaning'
            priority: 'low' | 'medium' | 'high' | 'urgent'
            scheduledDate: string
            recurrence: 'one-time' | 'weekly' | 'bi-weekly' | 'monthly' | 'quarterly'
            notes: string
          }) => {
            console.log('Schedule maintenance:', data)
          }}
          onMarkComplete={async (id: string) => {
            console.log('Mark complete:', id)
          }}
          onCancel={async (id: string) => {
            console.log('Cancel maintenance:', id)
          }}
        />
      )}

      {/* Caddy Modal */}
      <CaddyModal
        isOpen={showCaddyModal}
        onClose={() => {
          setShowCaddyModal(false)
          setEditingCaddy(null)
        }}
        caddy={editingCaddy}
        onSave={handleSaveCaddy}
        onDelete={editingCaddy ? handleDeleteCaddy : undefined}
      />

      {/* Caddy Schedule Modal */}
      {scheduleCaddy && (
        <CaddyScheduleModal
          isOpen={showCaddyScheduleModal}
          onClose={() => {
            setShowCaddyScheduleModal(false)
            setScheduleCaddy(null)
          }}
          caddy={scheduleCaddy}
          assignments={[]}
          onViewFlight={handleViewFlightFromSchedule}
        />
      )}

      {/* New BookingModal (unified view/edit experience) */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => {
          setIsBookingModalOpen(false)
          setSelectedBooking(null)
          setBookingModalSlot(null)
        }}
        mode={bookingModalMode}
        courseId={bookingModalSlot?.courseId || selectedCourse || ''}
        courseName={courses.find(c => c.id === (bookingModalSlot?.courseId || selectedCourse))?.name || ''}
        date={currentDate}
        time={bookingModalSlot?.time || ''}
        startingHole={1}
        booking={selectedBooking}
        availableCaddies={caddies.filter(c => c.status === 'available').map(c => {
          const nameParts = c.name.split(' ')
          const firstName = nameParts[0] || c.name
          const lastName = nameParts.slice(1).join(' ') || ''
          return {
            id: c.id,
            caddyNumber: c.id.split('-')[1] || '00',
            firstName,
            lastName,
            skillLevel: c.skillLevel === 'expert' ? 'advanced' : c.skillLevel as 'beginner' | 'intermediate' | 'advanced',
            status: c.status as 'available' | 'assigned' | 'off-duty',
          }
        })}
        availableCarts={availableCarts}
        clubSettings={mockClubSettings}
        onSearchMembers={handleSearchMembers}
        onSave={async (payload) => {
          // Handle save - create or update based on mode
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

            if (bookingModalMode === 'existing' && selectedBooking?.id) {
              // Update existing booking
              await updateTeeTime(selectedBooking.id, {
                holes: payload.holes,
                notes: payload.notes,
              })
              await updateTeeTimePlayers(selectedBooking.id, apiPlayers)
            } else {
              // Create new booking
              await createTeeTime({
                courseId: payload.courseId,
                teeDate,
                teeTime: payload.teeTime,
                holes: payload.holes,
                players: apiPlayers,
              })
            }

            refetchTeeSheet()
            setIsBookingModalOpen(false)
            setSelectedBooking(null)
            setBookingModalSlot(null)
          } catch (error) {
            console.error('Failed to save booking:', error)
            throw error
          }
        }}
        onCheckIn={selectedBooking ? async () => {
          // Open the check-in panel
          setShowCheckInModal(true)
          setIsBookingModalOpen(false)
        } : undefined}
        onCancel={selectedBooking ? async (reason) => {
          try {
            await cancelTeeTime(selectedBooking.id, reason || 'Cancelled by staff')
            refetchTeeSheet()
            setIsBookingModalOpen(false)
            setSelectedBooking(null)
            setBookingModalSlot(null)
          } catch (error) {
            console.error('Failed to cancel:', error)
            throw error
          }
        } : undefined}
        onMove={selectedBooking ? () => {
          // Start placement mode for move with smart validation
          placementMode.startMove({
            id: selectedBooking.id,
            bookingNumber: selectedBooking.bookingNumber,
            playerNames: selectedBooking.players.map(p => p.name),
            playerCount: selectedBooking.playerCount,
            sourceTeeTime: selectedBooking.teeTime,
            sourceDate: selectedBooking.teeDate,
            sourceFlightId: selectedBooking.flightId,
            playerIds: selectedBooking.players.map(p => p.id),
          })
          setIsBookingModalOpen(false)
          setActiveTab('tee-sheet')
        } : undefined}
        onCopy={selectedBooking ? () => {
          // Start placement mode for copy with smart validation
          placementMode.startCopy({
            id: selectedBooking.id,
            bookingNumber: selectedBooking.bookingNumber,
            playerNames: selectedBooking.players.map(p => p.name),
            playerCount: selectedBooking.playerCount,
            sourceTeeTime: selectedBooking.teeTime,
            sourceDate: selectedBooking.teeDate,
            sourceFlightId: selectedBooking.flightId,
            playerIds: selectedBooking.players.map(p => p.id),
          })
          setIsBookingModalOpen(false)
          setActiveTab('tee-sheet')
        } : undefined}
        onSettle={selectedBooking ? () => {
          // Open settlement modal
          const flight = flights.find(f => f.id === selectedBooking.flightId)
          if (flight) {
            setSelectedFlight(flight)
            setShowSettlementModal(true)
            setIsBookingModalOpen(false)
          }
        } : undefined}
      />

      {/* Block Tee Time Modal */}
      <BlockTeeTimeModal
        isOpen={showBlockModal}
        onClose={() => {
          setShowBlockModal(false)
          setBlockModalFlightTime(null)
        }}
        onSubmit={async (data: BlockFormData) => {
          console.log('Block tee time:', data)
          // TODO: Call API to block tee time
          // For now, just close the modal
          setShowBlockModal(false)
          setBlockModalFlightTime(null)
          refetchTeeSheet()
        }}
        courseId={selectedCourse || ''}
        courseName={courses.find(c => c.id === selectedCourse)?.name || 'Course'}
        initialDate={currentDate}
        initialTime={blockModalFlightTime || undefined}
      />

      {/* Placement Mode Overlay */}
      {placementMode.state.active && placementMode.state.sourceBooking && (
        <PlacementModeOverlay
          active={placementMode.state.active}
          action={placementMode.state.action}
          sourceBooking={placementMode.state.sourceBooking}
          isProcessing={isBookingProcessing}
          onCancel={placementMode.cancel}
        />
      )}

      {/* Move/Copy Booking Confirmation Dialog */}
      {placementMode.state.sourceBooking && (
        <MoveBookingDialog
          isOpen={moveDialog.isOpen}
          isProcessing={moveDialog.isProcessing}
          action={placementMode.state.action}
          playerNames={placementMode.state.sourceBooking.playerNames}
          sourceTeeTime={placementMode.state.sourceBooking.sourceTeeTime}
          targetTeeTime={moveDialog.targetTeeTime}
          date={currentDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
          onClose={handleMoveCancel}
          onConfirm={handleMoveConfirm}
        />
      )}
    </div>
  )
}
