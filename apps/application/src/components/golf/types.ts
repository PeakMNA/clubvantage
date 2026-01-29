import type { FlightStatus } from './flight-status-badge'
import type { PlayerType } from './player-type-badge'

// Tee Sheet Booking Mode - controls tee sheet display
export type BookingMode = 'EIGHTEEN' | 'CROSS'
// EIGHTEEN = Single column (Hole 1 start only)
// CROSS = Dual columns (Hole 1 + Hole 10 starts)

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

// Rental status options for cart and caddy
export type RentalStatus = 'none' | 'requested' | 'paid' | 'assigned' | 'returned'

export interface Player {
  id: string              // TeeTimePlayer.id (UUID of the player record)
  name: string
  type: PlayerType
  memberId?: string       // Member display ID (M-0005) - for display only
  memberUuid?: string     // Member.id (UUID) - for API calls when updating
  handicap?: number
  checkedIn?: boolean
  noShow?: boolean
  groupId?: 1 | 2
  // Booking reference - which booking this player belongs to
  bookingId?: string
  // Resource indicators (legacy boolean - for backwards compatibility)
  hasCart?: boolean      // Player has a cart rental
  hasCaddy?: boolean     // Player has a caddy assigned
  cartSharedWith?: number // Position of player sharing cart (1-4)
  // Rental status (new dropdown-based)
  cartStatus?: RentalStatus
  caddyStatus?: RentalStatus
  // Rental requests (for edit modal)
  cartRequest?: string
  caddyRequest?: string
  rentalRequest?: string
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
  // Schedule config properties
  isPrimeTime?: boolean // Whether this slot is in a prime time period
  isTwilight?: boolean // Whether this slot is in twilight period
  periodName?: string // Name of the time period (e.g., "Prime AM", "Twilight")
  // Cross Booking Mode
  startingHole?: 1 | 10 // Which tee the flight starts from (1 = Hole 1, 10 = Hole 10)
  holes?: 9 | 18 // Number of holes booked (always selectable at booking time)
}

export interface Course {
  id: string
  name: string
  holes: 9 | 18 | 27 | 36
  par: number
  rating: number
  slope: number
  interval?: number // Now configured via Settings tab schedule
  status: 'active' | 'maintenance' | 'closed'
  condition?: string
  firstTeeTime?: string // Now configured via Settings tab schedule
  lastTeeTime?: string // Now configured via Settings tab schedule
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
  availableSlots: number  // Tee time slots available
  totalSlots: number      // Total tee time slots
  bookedSlots?: number    // Tee time slots with bookings
  playerCount?: number    // Total players booked
}

// Slot position status for week view
export type SlotPositionStatus = 'available' | 'occupied' | 'blocked'

export interface TimeSlotOccupancy {
  time: string
  date: string
  positions: [SlotPositionStatus, SlotPositionStatus, SlotPositionStatus, SlotPositionStatus]
  isBlocked?: boolean
}

// ============================================================================
// Week View Occupancy Types (matching GraphQL schema)
// ============================================================================

export type NineType = 'FRONT' | 'BACK'
export type PositionStatusType = 'AVAILABLE' | 'BOOKED' | 'BLOCKED'

// Backend player types (uppercase from GraphQL)
export type BackendPlayerType = 'MEMBER' | 'GUEST' | 'DEPENDENT' | 'WALK_UP'

export interface WeekViewPlayer {
  id: string
  name: string
  type: BackendPlayerType
  memberId?: string
}

export interface WeekViewPosition {
  position: number
  status: PositionStatusType
  player?: WeekViewPlayer
}

export interface WeekViewSlot {
  date: string
  time: string
  nine: NineType
  isBlocked: boolean
  positions: WeekViewPosition[]
}

export interface WeekViewOccupancy {
  slots: WeekViewSlot[]
}

// ============================================================================
// Booking-Centric Types (New booking management model)
// ============================================================================

/**
 * Booking status - independent lifecycle for each booking
 */
export type BookingStatus =
  | 'booked'
  | 'checked-in'
  | 'on-course'
  | 'completed'
  | 'cancelled'
  | 'no-show'

/**
 * Cancellation reason options
 */
export type CancellationReason =
  | 'member_request'
  | 'weather_conditions'
  | 'course_maintenance'
  | 'staff_cancellation'
  | 'no_show_conversion'
  | 'other'

/**
 * Player within a booking - with per-player resource assignments
 */
export interface BookingPlayer {
  id: string
  playerId: string
  playerType: PlayerType
  position: 1 | 2 | 3 | 4
  name: string
  memberId?: string      // Display ID (M-0005) - for UI display
  memberUuid?: string    // Member.id (UUID) - for API calls when updating

  // Resources (per player, not per booking)
  cartId?: string
  cartNumber?: string
  caddyId?: string
  caddyName?: string

  // Rental status (for dropdown display)
  cartStatus?: RentalStatus
  caddyStatus?: RentalStatus
  // Rental requests (for edit modal)
  cartRequest?: string
  caddyRequest?: string
  rentalRequest?: string

  // Guest info (if guest type)
  guestName?: string
  guestPhone?: string
  guestEmail?: string
}

/**
 * Booking preferences
 */
export interface BookingPreferences {
  stayTogether?: boolean
  openToPairing?: boolean
  specialRequests?: string
}

/**
 * First-class Booking entity
 */
export interface Booking {
  id: string
  bookingNumber: string // CV-YYMMDD-NNN format
  status: BookingStatus

  // Time slot reference
  flightId: string
  teeTime: string // "06:00"
  teeDate: string // ISO date
  courseId: string
  courseName?: string

  // Booker info
  bookerId: string
  bookerName: string
  bookerMemberId?: string
  bookerType: 'member' | 'staff'

  // Players
  players: BookingPlayer[]
  playerCount: number

  // Party (optional - for multi-slot group bookings)
  partyId?: string
  partyName?: string

  // Metadata
  notes?: string
  preferences?: BookingPreferences
  holes?: 9 | 18

  // Timestamps
  createdAt: string
  createdBy: string
  createdByName?: string
  modifiedAt: string
  modifiedBy: string

  // Cancellation (if cancelled)
  cancelledAt?: string
  cancelledBy?: string
  cancelledByName?: string
  cancelReason?: CancellationReason
  cancelNotes?: string
  lateCancellation?: boolean
}

/**
 * Party booking - links multiple bookings across time slots
 */
export interface Party {
  id: string
  name: string // e.g., "Smith Wedding"
  organizerId: string
  organizerName: string
  organizerMemberId?: string

  bookingIds: string[]
  bookings?: Booking[]

  slotCount: number
  totalPlayers: number

  // Billing
  greenFeesPaidBy: 'organizer' | 'individual'

  // Timestamps
  createdAt: string
  createdBy: string
}

/**
 * Block type - starter (dynamic) or maintenance (recurring)
 */
export type BlockType = 'starter' | 'maintenance'

/**
 * Time slot block (starter or maintenance)
 */
export interface Block {
  id: string
  type: BlockType
  reason: string

  // Time range
  courseId: string
  courseName?: string
  startTime: string // "06:00"
  endTime: string // "06:16" (if spans multiple slots)
  date?: string // For one-time blocks

  // Recurrence (for maintenance blocks)
  recurring?: boolean
  recurrencePattern?: string // "WEEKLY:MON"
  recurrenceEndDate?: string

  // Metadata
  createdAt: string
  createdBy: string
  createdByName?: string
  releasedAt?: string
  releasedBy?: string
  releasedByName?: string
}

/**
 * Audit trail action types
 */
export type AuditAction =
  | 'created'
  | 'modified'
  | 'cancelled'
  | 'checked_in'
  | 'marked_on_course'
  | 'marked_finished'
  | 'moved'
  | 'copied'
  | 'player_added'
  | 'player_removed'
  | 'cart_assigned'
  | 'caddy_assigned'
  | 'no_show'

/**
 * Audit trail entry for booking history
 */
export interface AuditEntry {
  id: string
  bookingId: string
  action: AuditAction
  timestamp: string
  userId: string
  userName: string
  userRole?: string // "Member Portal" | "Staff" | etc.
  details?: Record<string, unknown>
}

/**
 * Waitlist entry for a full time slot
 */
export interface WaitlistEntry {
  id: string
  flightId: string
  teeTime: string
  teeDate: string
  courseId: string

  memberId: string
  memberName: string
  playerCount: number

  position: number // Queue position
  createdAt: string
  notifiedAt?: string
  expiredAt?: string
  status: 'waiting' | 'notified' | 'expired' | 'booked'
}

/**
 * Placement mode state for move/copy operations
 */
export interface PlacementModeState {
  active: boolean
  action: 'move' | 'copy'
  sourceBooking: {
    id: string
    bookingNumber: string
    playerNames: string[]
    playerCount: number
    sourceTeeTime: string
    sourceDate: string
    playerIds?: string[] // Player IDs for conflict detection
  } | null
}

/**
 * Booking chip data for tee sheet display
 */
export interface BookingChipData {
  id: string
  bookingNumber: string
  playerNames: string[]
  playerCount: number
  status: BookingStatus
  bookerName: string
  partyId?: string
  partyName?: string
}

/**
 * Time slot with nested bookings (booking-centric view)
 */
export interface TimeSlot {
  id: string
  teeTime: string
  teeDate: string
  courseId: string

  // Derived status from bookings
  status: FlightStatus

  // Bookings in this slot (0-2 typically)
  bookings: BookingChipData[]
  totalPlayers: number
  capacity: number // Usually 4

  // Block (if blocked)
  block?: Block

  // Schedule config properties
  isPrimeTime?: boolean
  isTwilight?: boolean
  periodName?: string
}

/**
 * Booking filters for list view
 */
export interface BookingFilters {
  dateRange: {
    start: string
    end: string
  } | null
  statuses: BookingStatus[]
  courseId: string | null
  search: string
}
