// Portal Member Types

export interface PortalMember {
  id: string
  memberId: string // Display ID like "M-12345"
  name: string
  email: string
  phone?: string
  photo?: string
  membershipType: 'standard' | 'premium' | 'platinum' | 'honorary'
  joinDate: string
  status: 'active' | 'suspended'
}

// Account/Billing Types
export interface AccountSummary {
  balance: number
  aging: {
    current: number
    days30: number
    days60: number
    days90: number
    days91Plus: number
  }
  nextDueDate: string
  credits: number
  isSuspended: boolean
}

export interface Statement {
  id: string
  period: string // "January 2026"
  periodStart: string
  periodEnd: string
  openingBalance: number
  closingBalance: number
  totalCharges: number
  totalPayments: number
  status: 'paid' | 'partial' | 'outstanding'
}

export interface Transaction {
  id: string
  type: 'invoice' | 'payment' | 'credit' | 'wht' | 'late_fee'
  date: string
  description: string
  amount: number
  reference?: string
  lineItems?: LineItem[]
}

export interface LineItem {
  description: string
  quantity: number
  unitPrice: number
  total: number
  revenueCenter?: string
}

// Payment Types
export interface PaymentMethod {
  id: string
  type: 'card' | 'bank_transfer'
  last4?: string
  brand?: string // 'visa', 'mastercard'
  expiryMonth?: number
  expiryYear?: number
  isDefault: boolean
  isExpiringSoon: boolean
}

// WHT Certificate Types
export interface WHTCertificate {
  id: string
  certificateNumber: string
  date: string
  amount: number
  documentUrl: string
  status: 'submitted' | 'verified' | 'rejected'
  rejectionReason?: string
  linkedInvoices: string[]
  submittedAt: string
  verifiedAt?: string
}

// Golf Booking Types
export interface TeeTimeBooking {
  id: string
  date: string
  time: string
  courseName: string
  courseId: string
  roundType: '9-hole' | '18-hole'
  players: BookingPlayer[]
  cart: boolean
  caddy: 'none' | 'shared' | 'individual'
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed' | 'no-show'
  totalPrice: number
  priceBreakdown: PriceItem[]
  cancellationPolicy: CancellationPolicy
  createdAt: string
}

export interface BookingPlayer {
  id: string
  name: string
  type: 'member' | 'dependent' | 'guest'
  memberId?: string
  phone?: string
  email?: string
}

export interface PriceItem {
  label: string
  amount: number
}

export interface CancellationPolicy {
  fullRefundBefore: string // ISO datetime
  partialRefundBefore: string
  noRefundAfter: string
  partialRefundPercent: number
}

// Golf-specific time slot (for golf booking)
export interface GolfTimeSlot {
  time: string
  available: boolean
  price?: number
  holes?: string
}

// Generic booking time slot (for facility/service booking)
export interface TimeSlot {
  id: string
  startTime: string
  endTime?: string
  status: 'available' | 'limited' | 'booked'
  spotsAvailable?: number
  maxCapacity?: number
  price?: number
  basePrice?: number
}

export interface DateAvailability {
  date: string
  level: 'open' | 'limited' | 'full'
  slotsAvailable: number
}

// Member ID Types
export interface CheckInEvent {
  id: string
  location: string
  timestamp: string
}

// Notification Types
export interface PortalNotification {
  id: string
  type: 'invoice' | 'payment' | 'booking' | 'reminder' | 'wht' | 'system'
  title: string
  message: string
  read: boolean
  createdAt: string
  actionUrl?: string
}

// Activity Feed Types
export interface ActivityItem {
  id: string
  type: 'invoice' | 'payment' | 'booking' | 'check_in' | 'wht'
  title: string
  description: string
  amount?: number
  timestamp: string
}

// Course Types for Golf Booking
export interface PortalCourse {
  id: string
  name: string
  enable18HoleBooking: boolean
  advanceBookingDays: number
}

// ==========================================================================
// FACILITY & SERVICE BOOKING TYPES
// ==========================================================================

// Booking Status
export type PortalBookingStatus = 'pending' | 'confirmed' | 'checked_in' | 'completed' | 'cancelled' | 'no_show'

// Facility Types
export type FacilityType = 'court' | 'spa' | 'studio' | 'pool' | 'room'

export interface PortalFacility {
  id: string
  name: string
  type: FacilityType
  location: string
  description?: string
  imageUrl?: string
  features: string[]
  capacity?: number
  operatingHours: DayHours[]
  advanceBookingDays: number
  bookingDurationMinutes: number[] // e.g., [30, 60, 90]
  basePrice: number
  memberPrice?: number
}

export interface DayHours {
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'
  isOpen: boolean
  openTime?: string // e.g., "09:00"
  closeTime?: string // e.g., "21:00"
}

// Service Types
export type ServiceCategory = 'spa' | 'fitness' | 'sports' | 'wellness'

export interface PortalService {
  id: string
  name: string
  category: ServiceCategory
  description: string
  imageUrl?: string
  durationMinutes: number
  basePrice: number
  memberPrice?: number
  maxParticipants?: number
  requiresStaff: boolean
  variations?: ServiceVariation[]
  staffCount: number // Number of available staff for this service
}

export interface ServiceVariation {
  id: string
  name: string
  description?: string
  priceDiff: number // Added/subtracted from base price (deprecated, use additionalPrice)
  additionalPrice: number // Price to add
  durationDiff?: number // Added/subtracted minutes (deprecated, use additionalDuration)
  additionalDuration?: number // Minutes to add
  isPopular?: boolean
}

// Staff Types
export interface PortalStaff {
  id: string
  name: string
  photoUrl?: string
  specialties: string[]
  rating?: number
  bio?: string
  services: string[] // Service IDs
  nextAvailable?: string // e.g., "Today 2:00 PM"
}

// Time Slot Types
export interface FacilityTimeSlot {
  startTime: string // e.g., "09:00"
  endTime: string // e.g., "10:00"
  available: boolean
  price: number
}

export interface ServiceTimeSlot {
  startTime: string
  endTime: string
  available: boolean
  staffId?: string
  staffName?: string
  price: number
}

// Booking Types
export interface PortalFacilityBooking {
  id: string
  type: 'facility'
  facility: {
    id: string
    name: string
    type: FacilityType
    location: string
  }
  date: string // ISO date string
  startTime: string
  endTime: string
  durationMinutes: number
  status: PortalBookingStatus
  pricing: BookingPricing
  payment?: BookingPaymentInfo
  cancellationPolicy: CancellationPolicy
  notes?: string
  createdAt: string
  modifiedAt?: string
}

export interface PortalServiceBooking {
  id: string
  type: 'service'
  service: {
    id: string
    name: string
    category: ServiceCategory
  }
  variation?: {
    id: string
    name: string
  }
  staff?: {
    id: string
    name: string
    photoUrl?: string
  }
  facility?: {
    id: string
    name: string
    location: string
  }
  date: string
  startTime: string
  endTime: string
  durationMinutes: number
  participants?: number
  status: PortalBookingStatus
  pricing: BookingPricing
  payment?: BookingPaymentInfo
  cancellationPolicy: CancellationPolicy
  notes?: string
  createdAt: string
  modifiedAt?: string
}

export type PortalBooking = PortalFacilityBooking | PortalServiceBooking

// Pricing Types
export interface BookingPricing {
  base: number
  modifiers: BookingPriceModifier[]
  total: number
}

export interface BookingPriceModifier {
  label: string
  amount: number
  type?: 'discount' | 'surcharge' | 'add_on'
}

// Payment Types for Bookings
export interface BookingPaymentInfo {
  method: 'credit_card' | 'account' | 'cash'
  status: 'pending' | 'paid' | 'partial' | 'refunded'
  amountPaid?: number
  lastFour?: string
}

// Waitlist Types
export interface PortalWaitlistEntry {
  id: string
  bookingType: 'facility' | 'service'
  facilityId?: string
  serviceId?: string
  preferredDate: string
  preferredTimeStart: string
  preferredTimeEnd: string
  preferredStaffId?: string
  status: 'waiting' | 'offered' | 'booked' | 'expired' | 'cancelled'
  offerExpiresAt?: string
  offeredSlot?: {
    date: string
    startTime: string
    endTime: string
    staffId?: string
    staffName?: string
  }
  createdAt: string
  position?: number
}

// Browse Category for Member Portal
export interface BookingCategory {
  id: string
  name: string
  description: string
  icon: string // Icon name
  type: 'facility' | 'service'
  facilityTypes?: FacilityType[]
  serviceCategories?: ServiceCategory[]
  itemCount: number
}

// Booking Request Types (for creating new bookings)
export interface FacilityBookingRequest {
  facilityId: string
  date: string
  startTime: string
  durationMinutes: number
  notes?: string
}

export interface ServiceBookingRequest {
  serviceId: string
  variationId?: string
  staffId?: string
  date: string
  startTime: string
  participants?: number
  notes?: string
}

// Modification Request
export interface BookingModificationRequest {
  bookingId: string
  newDate?: string
  newStartTime?: string
  newStaffId?: string // Only for service bookings
}
