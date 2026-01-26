import type { FlightStatus } from './flight-status-badge'
import type { PlayerType } from './player-type-badge'

// 18-Hole Booking Types
export type NineHoleType = 'front9' | 'back9'
export type HoleChoice = '9-hole' | '18-hole'

export interface LinkedSlot {
  slotId: string // ID of the linked slot on the other 9
  nineHole: NineHoleType // Which 9 this linked slot is on
  projectedTime: string // Projected arrival time based on pace of play
  isAutoAssigned: boolean // Whether system auto-assigned this slot
}

export interface BookingGroup {
  id: string
  groupNumber: 1 | 2
  bookedBy: { id: string; name: string; memberId?: string }
  playerIds: string[]
  preferences?: { stayTogether?: boolean; openToPairing?: boolean }
  settlementOption?: 'individual' | 'group_pay' | 'split'
  holeChoice?: HoleChoice // 9-hole or 18-hole booking
}

export interface Player {
  id: string
  name: string
  type: PlayerType
  memberId?: string
  handicap?: number
  checkedIn?: boolean
  noShow?: boolean
  groupId?: 1 | 2
}

export interface Flight {
  id: string
  time: string // e.g., "6:00 AM"
  date: string
  status: FlightStatus
  players: (Player | null)[]
  carts?: number
  caddies?: number
  cartId?: string // Assigned cart ID
  caddyId?: string // Assigned caddy ID
  blockedReason?: string
  notes?: string
  bookingGroups?: BookingGroup[]
  // 18-Hole Booking Support
  nineHole?: NineHoleType // Which 9 this slot belongs to (front9 or back9)
  linkedSlot?: LinkedSlot // Linked slot on the other 9 for 18-hole bookings
  courseId?: string // Course this slot is for (when club has multiple courses)
}

export interface Course {
  id: string
  name: string
  holes: 9 | 18 | 27 | 36
  par: number
  rating: number
  slope: number
  interval: number
  status: 'active' | 'maintenance' | 'closed'
  condition?: string
  firstTeeTime: string
  lastTeeTime: string
  // 18-Hole Booking Configuration
  enable18HoleBooking?: boolean // Whether 18-hole bookings are enabled
  paceOfPlay?: {
    front9Minutes: number // Average time to complete front 9 (default: 120)
    back9Minutes: number // Average time to complete back 9 (default: 120)
    turnTimeMinutes: number // Buffer time between 9s (default: 15)
  }
  // 9-Hole specific settings
  front9?: {
    name: string // e.g., "Lakeside Nine"
    firstTeeTime: string
    lastTeeTime: string
  }
  back9?: {
    name: string // e.g., "Mountain Nine"
    firstTeeTime: string
    lastTeeTime: string
  }
}

export interface Cart {
  id: string
  number: string
  type: '2-seater' | '4-seater'
  status: 'available' | 'in-use' | 'maintenance' | 'out-of-service'
  currentAssignment?: string
  conditionNotes?: string
  lastMaintenance?: string
}

export interface Caddy {
  id: string
  name: string
  skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  status: 'available' | 'assigned' | 'off-duty'
  experience: number // years
  currentAssignment?: string
  notes?: string
}

export interface TeeSheetDay {
  date: string
  flights: Flight[]
  metrics: {
    totalSlots: number
    bookedSlots: number
    totalPlayers: number
    checkedIn: number
    onCourse: number
    projectedRevenue: number
    cartsAssigned: number
    totalCarts: number
  }
}

// Side-by-Side Tee Sheet for 18-Hole Courses
export interface TeeSheetSideBySide {
  date: string
  courseId: string
  front9Flights: Flight[] // Flights starting on front 9
  back9Flights: Flight[] // Flights starting on back 9
  linkedBookings: Array<{
    front9FlightId: string
    back9FlightId: string
    bookingGroupId: string
    playerIds: string[]
  }>
  metrics: {
    front9: {
      totalSlots: number
      bookedSlots: number
      players: number
    }
    back9: {
      totalSlots: number
      bookedSlots: number
      players: number
    }
    total18HoleBookings: number
    projectedRevenue: number
  }
}

// Availability levels for calendar views
export type AvailabilityLevel = 'open' | 'limited' | 'full' | 'blocked'

export interface DayAvailability {
  date: string
  level: AvailabilityLevel
  availableSlots: number
  totalSlots: number
}

// Slot position status for week view
export type SlotPositionStatus = 'available' | 'occupied' | 'blocked'

export interface TimeSlotOccupancy {
  time: string
  date: string
  positions: [SlotPositionStatus, SlotPositionStatus, SlotPositionStatus, SlotPositionStatus]
  isBlocked?: boolean
}
