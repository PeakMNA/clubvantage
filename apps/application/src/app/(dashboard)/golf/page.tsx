'use client'

import { useState, useCallback, useMemo, useEffect } from 'react'
import { Plus, Sun, Cloud, Printer, List, Columns } from 'lucide-react'
import { PageHeader, Button } from '@clubvantage/ui'

// API hooks for real data fetching
import { useCourses, useTeeSheet, useGolfMutations } from '@/hooks/use-golf'

// Import all golf components
import { GolfTabsLayout, type GolfTab } from '@/components/golf/golf-tabs-layout'
import { TeeSheetMetrics } from '@/components/golf/tee-sheet-metrics'
import { TeeSheetGrid } from '@/components/golf/tee-sheet-grid'
import { TeeSheetSideBySideView } from '@/components/golf/tee-sheet-side-by-side'
import { DateNavigator } from '@/components/golf/calendar-popup'
import { TeeSheetWeekView } from '@/components/golf/tee-sheet-week-view'
import { TeeSheetMonthView } from '@/components/golf/tee-sheet-month-view'
import { FlightDetailPanel } from '@/components/golf/flight-detail-panel'
import { BookTeeTimeModal } from '@/components/golf/book-tee-time-modal'
import { CheckInModal } from '@/components/golf/check-in-modal'
import { SettlementModal } from '@/components/golf/settlement-modal'
import { AddPlayerModal } from '@/components/golf/add-player-modal'
import { CoursesTab } from '@/components/golf/courses-tab'
import { CourseModal } from '@/components/golf/course-modal'
import { CartsTab } from '@/components/golf/carts-tab'
import { CartModal } from '@/components/golf/cart-modal'
import { CartMaintenanceModal } from '@/components/golf/cart-maintenance-modal'
import { CaddiesTab } from '@/components/golf/caddies-tab'
import { CaddyModal } from '@/components/golf/caddy-modal'
import { CaddyScheduleModal } from '@/components/golf/caddy-schedule-modal'
import { SettingsTab } from '@/components/golf/settings-tab'
import type { Flight, Course, Cart, Caddy, TeeSheetDay, DayAvailability, Player, BookingGroup, TeeSheetSideBySide, NineHoleType } from '@/components/golf/types'
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
  { id: 'cart-1', number: '01', type: '2-seater', status: 'available' },
  { id: 'cart-2', number: '02', type: '2-seater', status: 'in-use', currentAssignment: '7:00 AM' },
  { id: 'cart-3', number: '03', type: '4-seater', status: 'available' },
  { id: 'cart-4', number: '04', type: '4-seater', status: 'maintenance', conditionNotes: 'Battery replacement needed' },
  { id: 'cart-5', number: '05', type: '2-seater', status: 'available' },
  { id: 'cart-6', number: '06', type: '2-seater', status: 'in-use', currentAssignment: '7:08 AM' },
]

// Mock caddies data
const mockCaddies: Caddy[] = [
  { id: 'caddy-1', name: 'Somchai Prasert', skillLevel: 'expert', status: 'available', experience: 12, notes: 'Specializes in Main Course' },
  { id: 'caddy-2', name: 'Niran Wongsawat', skillLevel: 'advanced', status: 'assigned', experience: 8, currentAssignment: '7:00 AM' },
  { id: 'caddy-3', name: 'Prasit Chaiyasit', skillLevel: 'intermediate', status: 'available', experience: 3 },
  { id: 'caddy-4', name: 'Wichai Khamwan', skillLevel: 'advanced', status: 'off-duty', experience: 6 },
  { id: 'caddy-5', name: 'Apinya Srisuk', skillLevel: 'beginner', status: 'available', experience: 1, notes: 'New hire, training complete' },
]

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

// Generate mock availability data
function generateMockAvailability(): DayAvailability[] {
  const availability: DayAvailability[] = []
  const today = new Date()

  for (let i = -7; i < 30; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() + i)

    const totalSlots = 85
    const bookedSlots = Math.floor(Math.random() * 85)
    const availableSlots = totalSlots - bookedSlots
    const ratio = availableSlots / totalSlots

    let level: DayAvailability['level'] = 'open'
    if (ratio < 0.1) level = 'full'
    else if (ratio < 0.3) level = 'limited'

    availability.push({
      date: date.toISOString().split('T')[0] as string,
      level,
      availableSlots,
      totalSlots,
    })
  }

  return availability
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

// Mock settings
const mockSettings = {
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
    weekend: { firstTeeTime: '05:30', lastTeeTime: '17:30', interval: 8 },
    seasons: [],
    holidays: [],
  },
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
  const { createTeeTime, checkIn, cancelTeeTime, isCreating } = useGolfMutations()

  // =========================================================================
  // MAIN STATE
  // =========================================================================
  const [activeTab, setActiveTab] = useState<GolfTab>('tee-sheet')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<ViewMode>('day')
  const [layoutType, setLayoutType] = useState<LayoutType>('list')

  // Use API courses if available, otherwise fall back to mock data
  const [courses, setCourses] = useState(mockCourses)
  const [selectedCourse, setSelectedCourse] = useState(mockCourses[0]?.id ?? 'course-1')

  // Update courses when API data loads
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
      setCourses(transformedCourses)
      if (transformedCourses[0]?.id) {
        setSelectedCourse(transformedCourses[0].id)
      }
    }
  }, [apiCourses])

  // Fetch tee sheet for selected course and date
  const { teeSheet: apiTeeSheet, isLoading: isTeeSheetLoading, refetch: refetchTeeSheet } = useTeeSheet({
    courseId: selectedCourse,
    date: currentDate,
    enabled: !!selectedCourse,
  })

  // TODO: Add real-time subscription for tee time updates when backend supports it

  // Data state for carts and caddies (still using mock for now)
  const [carts, setCarts] = useState(mockCarts)
  const [caddies, setCaddies] = useState(mockCaddies)

  // Modal state
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null)
  const [selectedGroupId, setSelectedGroupId] = useState<1 | 2 | undefined>(undefined)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [bookingModalFlight, setBookingModalFlight] = useState<Flight | null>(null)
  const [showCheckInModal, setShowCheckInModal] = useState(false)
  const [showSettlementModal, setShowSettlementModal] = useState(false)
  const [showAddPlayerModal, setShowAddPlayerModal] = useState(false)
  const [addPlayerPosition, setAddPlayerPosition] = useState(0)

  // Course modal state
  const [showCourseModal, setShowCourseModal] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)

  // Cart modal state
  const [showCartModal, setShowCartModal] = useState(false)
  const [editingCart, setEditingCart] = useState<Cart | null>(null)
  const [showCartMaintenanceModal, setShowCartMaintenanceModal] = useState(false)
  const [maintenanceCart, setMaintenanceCart] = useState<Cart | null>(null)

  // Caddy modal state
  const [showCaddyModal, setShowCaddyModal] = useState(false)
  const [editingCaddy, setEditingCaddy] = useState<Caddy | null>(null)
  const [showCaddyScheduleModal, setShowCaddyScheduleModal] = useState(false)
  const [scheduleCaddy, setScheduleCaddy] = useState<Caddy | null>(null)

  // Flights state - mutable for actions
  const [flights, setFlights] = useState<Flight[]>(() => generateMockTeeSheetData(new Date()).flights)

  // Regenerate flights when date changes
  useEffect(() => {
    setFlights(generateMockTeeSheetData(currentDate).flights)
  }, [currentDate])

  // Compute metrics from flights
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

  // Generate availability data
  const availability = useMemo(() => generateMockAvailability(), [])

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
      const hasExistingPlayers = flight.players.some(p => p !== null)
      if (hasExistingPlayers) {
        // Partial flight - close detail panel and open booking modal
        setSelectedFlight(null)
        setBookingModalFlight(flight)
        setShowBookingModal(true)
      } else {
        // Empty flight - open add player modal (keep detail panel closed)
        setSelectedFlight(null)
        setBookingModalFlight(flight)
        setAddPlayerPosition(position)
        setShowAddPlayerModal(true)
      }
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

  // Flight action handlers
  const handleBookTeeTime = useCallback(async (data: {
    slotId: string
    players: Array<{ id: string; name: string; type: 'member' | 'guest' | 'dependent' | 'walkup'; memberId?: string }>
    notes?: string
  }) => {
    setFlights(prev => prev.map(flight => {
      if (flight.id === data.slotId) {
        const existingPlayers = flight.players.filter((p: Player | null) => p !== null)
        const hasExistingBooking = existingPlayers.length > 0

        // Start with existing players (preserve them)
        const newPlayers: Flight['players'] = [...flight.players]

        // Determine groupId for new players
        const groupId = hasExistingBooking ? 1 : 1 // Always group 1 when adding to existing

        // Add new players to empty slots
        let playerIndex = 0
        for (let i = 0; i < 4 && playerIndex < data.players.length; i++) {
          if (newPlayers[i] === null) {
            const player = data.players[playerIndex]
            if (player) {
              newPlayers[i] = {
                id: player.id,
                name: player.name,
                type: player.type,
                memberId: player.memberId,
                groupId: 1, // All players in "add to existing" go to group 1
              }
            }
            playerIndex++
          }
        }

        // Update existing players to have groupId if not set
        const updatedPlayers = newPlayers.map((p: Player | null) =>
          p && !p.groupId ? { ...p, groupId: 1 as const } : p
        ) as Flight['players']

        // Create or update booking groups
        let bookingGroups = flight.bookingGroups || []
        if (bookingGroups.length === 0) {
          // Create new booking group for first booking
          const firstPlayer = data.players[0]
          bookingGroups = [{
            id: generateBookingId(),
            groupNumber: 1 as const,
            bookedBy: firstPlayer
              ? { id: firstPlayer.id, name: firstPlayer.name, memberId: firstPlayer.memberId }
              : { id: 'unknown', name: 'Unknown' },
            playerIds: data.players.map(p => p.id),
          }]
        } else {
          // Add new player IDs to existing group 1
          const group1 = bookingGroups.find(g => g.groupNumber === 1)
          if (group1) {
            bookingGroups = bookingGroups.map(g =>
              g.groupNumber === 1
                ? { ...g, playerIds: [...g.playerIds, ...data.players.map(p => p.id)] }
                : g
            )
          }
        }

        return {
          ...flight,
          status: 'booked' as FlightStatus,
          players: updatedPlayers,
          bookingGroups,
          notes: data.notes || flight.notes,
        }
      }
      return flight
    }))
    setShowBookingModal(false)
  }, [])

  const handleCheckInFlight = useCallback(async (data: {
    flightId: string
    playerIds: string[]
    cartId?: string
    caddyId?: string
  }) => {
    // Update flight status and player check-in state
    setFlights((prev: Flight[]) => prev.map((flight: Flight) => {
      if (flight.id === data.flightId) {
        const updatedPlayers = flight.players.map((player: Player | null) => {
          if (player && data.playerIds.includes(player.id)) {
            return { ...player, checkedIn: true }
          }
          return player
        })
        const allCheckedIn = updatedPlayers.filter((p: Player | null) => p !== null).every((p: Player | null) => p?.checkedIn)
        return {
          ...flight,
          status: allCheckedIn ? 'checked-in' as FlightStatus : flight.status,
          players: updatedPlayers,
          cartId: data.cartId || flight.cartId,
          caddyId: data.caddyId || flight.caddyId,
        }
      }
      return flight
    }))

    // Update cart status if assigned
    if (data.cartId) {
      setCarts(prev => prev.map(cart =>
        cart.id === data.cartId
          ? { ...cart, status: 'in-use' as Cart['status'], currentAssignment: selectedFlight?.time }
          : cart
      ))
    }

    // Update caddy status if assigned
    if (data.caddyId) {
      setCaddies(prev => prev.map(caddy =>
        caddy.id === data.caddyId
          ? { ...caddy, status: 'assigned' as Caddy['status'], currentAssignment: selectedFlight?.time }
          : caddy
      ))
    }

    // Update selected flight to reflect changes
    if (selectedFlight) {
      const updatedFlight = flights.find(f => f.id === data.flightId)
      if (updatedFlight) {
        setSelectedFlight({ ...updatedFlight })
      }
    }

    setShowCheckInModal(false)
  }, [selectedFlight, flights])

  const handleAddPlayer = useCallback(async (data: {
    flightId: string
    position: number
    player: { id: string; name: string; type: 'member' | 'guest' | 'dependent' | 'walkup'; memberId?: string; handicap?: number }
    notes?: string
  }) => {
    setFlights((prev: Flight[]) => prev.map((flight: Flight) => {
      if (flight.id === data.flightId) {
        const newPlayers = [...flight.players] as Flight['players']
        newPlayers[data.position] = {
          id: data.player.id,
          name: data.player.name,
          type: data.player.type,
          memberId: data.player.memberId,
          handicap: data.player.handicap,
          groupId: 1, // Add to group 1 by default
        }

        // Ensure all existing players have groupId
        const updatedPlayers = newPlayers.map((p: Player | null) =>
          p && !p.groupId ? { ...p, groupId: 1 as const } : p
        ) as Flight['players']

        // Update status if this was an available slot
        const hasPlayers = updatedPlayers.some((p: Player | null) => p !== null)

        // Create or update booking groups
        let bookingGroups = flight.bookingGroups || []
        if (bookingGroups.length === 0) {
          // Create new booking group
          bookingGroups = [{
            id: generateBookingId(),
            groupNumber: 1 as const,
            bookedBy: { id: data.player.id, name: data.player.name, memberId: data.player.memberId },
            playerIds: [data.player.id],
          }]
        } else {
          // Add player to group 1
          bookingGroups = bookingGroups.map(g =>
            g.groupNumber === 1
              ? { ...g, playerIds: [...g.playerIds, data.player.id] }
              : g
          )
        }

        return {
          ...flight,
          status: hasPlayers && flight.status === 'available' ? 'booked' as FlightStatus : flight.status,
          players: updatedPlayers,
          bookingGroups,
        }
      }
      return flight
    }))

    // Update selected flight
    if (selectedFlight && selectedFlight.id === data.flightId) {
      setSelectedFlight((prev: Flight | null) => {
        if (!prev) return prev
        const newPlayers = [...prev.players] as Flight['players']
        newPlayers[data.position] = {
          id: data.player.id,
          name: data.player.name,
          type: data.player.type,
          memberId: data.player.memberId,
          handicap: data.player.handicap,
          groupId: 1,
        }
        return { ...prev, players: newPlayers }
      })
    }

    setShowAddPlayerModal(false)
  }, [selectedFlight])

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
    setSelectedFlight(flight)
  }, [])

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

  // Render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'tee-sheet':
        return (
          <div className="space-y-6">
            {/* Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <DateNavigator
                  currentDate={currentDate}
                  onDateChange={handleDateChange}
                  availability={availability}
                />

                <div className="flex border border-border rounded-md overflow-hidden">
                  {(['day', 'week', 'month'] as ViewMode[]).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setViewMode(mode)}
                      className={`px-3 py-1.5 text-sm capitalize ${
                        viewMode === mode
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-muted'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>

                {/* Layout toggle - only show in day view */}
                {viewMode === 'day' && (
                  <div className="flex border border-border rounded-md overflow-hidden">
                    <button
                      onClick={() => setLayoutType('list')}
                      className={`px-3 py-1.5 text-sm flex items-center gap-1.5 ${
                        layoutType === 'list'
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-muted'
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
                          : 'hover:bg-muted'
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
                  className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                >
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
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

            {/* View Content */}
            {viewMode === 'day' && layoutType === 'list' && (
              <TeeSheetGrid
                flights={flights}
                onFlightClick={handleFlightClick}
                onBookSlot={(flight: Flight, position: number) => handleBookSlot(flight.id, position)}
                onPlayerClick={handlePlayerClick}
                onCheckIn={handleRowCheckIn}
                onNoShow={handleRowNoShow}
                onResendConfirmation={handleResendConfirmation}
                onEditFlight={handleEditFlight}
                onMoveFlight={handleMoveFlight}
                onCancelFlight={handleCancelFlight}
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
                availability={availability}
                onDayClick={(date: Date) => {
                  setCurrentDate(date)
                  setViewMode('day')
                }}
              />
            )}

            {viewMode === 'month' && (
              <TeeSheetMonthView
                currentMonth={currentDate}
                availability={availability}
                onDayClick={(date: Date) => {
                  setCurrentDate(date)
                  setViewMode('day')
                }}
                onMonthChange={setCurrentDate}
              />
            )}
          </div>
        )

      case 'courses':
        return (
          <CoursesTab
            courses={courses}
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
            settings={mockSettings}
            onSaveSection={async (section: string, data: unknown) => {
              console.log('Saving section:', section, data)
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
              setBookingModalFlight(null)
              setShowBookingModal(true)
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
            // Find first available position
            const firstEmptySlot = selectedFlight.players.findIndex((p: Player | null) => p === null)
            if (firstEmptySlot !== -1) {
              setAddPlayerPosition(firstEmptySlot)
              setShowAddPlayerModal(true)
            }
          }}
          onRemovePlayer={(player: Player) => handleRemovePlayer(player.id)}
          availableCarts={carts.filter((c: Cart) => c.status === 'available')}
          availableCaddies={caddies.filter((c: Caddy) => c.status === 'available')}
          onAssignCart={handleAssignCart}
          onAssignCaddy={handleAssignCaddy}
          onUnassignCart={handleUnassignCart}
          onUnassignCaddy={handleUnassignCaddy}
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
              })
            }
          }
          setBookingModalFlight(null)
        }}
      />

      {/* Check-In Modal */}
      {selectedFlight && (
        <CheckInModal
          isOpen={showCheckInModal}
          onClose={() => setShowCheckInModal(false)}
          flight={selectedFlight}
          availableCarts={carts.filter((c: Cart) => c.status === 'available')}
          availableCaddies={caddies.filter((c: Caddy) => c.status === 'available')}
          onComplete={async (data: {
            checkedInPlayers: string[]
            assignedCarts: string[]
            assignedCaddies: string[]
            notes: string
          }) => {
            await handleCheckInFlight({
              flightId: selectedFlight.id,
              playerIds: data.checkedInPlayers,
              cartId: data.assignedCarts[0],
              caddyId: data.assignedCaddies[0],
            })
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

      {/* Add Player Modal */}
      {(selectedFlight || bookingModalFlight) && (
        <AddPlayerModal
          isOpen={showAddPlayerModal}
          onClose={() => {
            setShowAddPlayerModal(false)
            if (!selectedFlight) setBookingModalFlight(null)
          }}
          flight={(selectedFlight || bookingModalFlight)!}
          onAdd={async (data: {
            position: number
            player: { id: string; name: string; type: PlayerType; memberId?: string; handicap?: number }
            notes: string
          }) => {
            const targetFlight = selectedFlight || bookingModalFlight
            if (!targetFlight) return
            await handleAddPlayer({
              flightId: targetFlight.id,
              position: data.position,
              player: {
                id: data.player.id,
                name: data.player.name,
                type: data.player.type,
                memberId: data.player.memberId,
                handicap: data.player.handicap,
              },
              notes: data.notes,
            })
            if (!selectedFlight) setBookingModalFlight(null)
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
    </div>
  )
}
