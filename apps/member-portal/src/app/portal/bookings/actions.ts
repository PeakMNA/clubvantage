'use server'

import { GraphQLClient } from '@clubvantage/api-client/client'
import type {
  GetFacilitiesQuery,
  GetServicesQuery,
  GetBookingStaffQuery,
  GetBookingsQuery,
  GetWaitlistQuery,
  CreateBookingMutation,
  CancelBookingMutation,
  RescheduleBookingMutation,
  JoinWaitlistMutation,
  RemoveFromWaitlistMutation,
  CreateBookingInput,
  RescheduleBookingInput,
  JoinWaitlistInput,
  BookingStatus,
} from '@clubvantage/api-client/types'

// ============================================================================
// GRAPHQL DOCUMENTS (defined locally to avoid 'use client' import issues)
// ============================================================================

const GetFacilitiesDocument = /* GraphQL */ `
  query GetFacilities($filter: FacilityFilterInput) {
    facilities(filter: $filter) {
      id
      name
      type
      location
      capacity
      isActive
    }
  }
`

const GetServicesDocument = /* GraphQL */ `
  query GetServices($filter: ServiceFilterInput) {
    services(filter: $filter) {
      id
      name
      category
      description
      durationMinutes
      basePrice
      isActive
    }
  }
`

const GetBookingStaffDocument = /* GraphQL */ `
  query GetBookingStaff($filter: StaffFilterInput) {
    bookingStaff(filter: $filter) {
      id
      firstName
      lastName
      photoUrl
      role
      capabilities
      isActive
    }
  }
`

const GetBookingsDocument = /* GraphQL */ `
  query GetBookings(
    $facilityId: ID
    $staffId: ID
    $startDate: String
    $endDate: String
    $statuses: [BookingStatus!]
    $first: Int = 20
    $skip: Int
  ) {
    bookings(
      facilityId: $facilityId
      staffId: $staffId
      startDate: $startDate
      endDate: $endDate
      statuses: $statuses
      first: $first
      skip: $skip
    ) {
      edges {
        cursor
        node {
          id
          bookingNumber
          bookingType
          status
          startTime
          endTime
          durationMinutes
          guestCount
          notes
          member {
            id
            firstName
            lastName
            memberId
            photoUrl
            status
          }
          service {
            id
            name
            category
            durationMinutes
            basePrice
          }
          staff {
            id
            firstName
            lastName
            photoUrl
            role
            isActive
          }
          facility {
            id
            name
            type
            location
            capacity
            isActive
          }
          createdAt
        }
      }
      totalCount
    }
  }
`

const GetWaitlistDocument = /* GraphQL */ `
  query GetWaitlist($facilityId: ID, $serviceId: ID, $date: String, $first: Int = 20, $skip: Int) {
    waitlist(facilityId: $facilityId, serviceId: $serviceId, date: $date, first: $first, skip: $skip) {
      edges {
        cursor
        node {
          id
          requestedDate
          requestedTime
          status
          offerExpiresAt
          position
          notes
          member {
            id
            firstName
            lastName
            memberId
            photoUrl
          }
          serviceName
          facilityName
          createdAt
        }
      }
      totalCount
    }
  }
`

const CreateBookingDocument = /* GraphQL */ `
  mutation CreateBooking($input: CreateBookingInput!) {
    createBooking(input: $input) {
      success
      booking {
        id
        bookingNumber
        status
        startTime
        endTime
        durationMinutes
      }
      error
    }
  }
`

const CancelBookingDocument = /* GraphQL */ `
  mutation CancelBooking($input: CancelBookingInput!) {
    cancelBooking(input: $input) {
      success
      message
      error
    }
  }
`

const RescheduleBookingDocument = /* GraphQL */ `
  mutation RescheduleBooking($input: RescheduleBookingInput!) {
    rescheduleBooking(input: $input) {
      success
      booking {
        id
        status
        startTime
        endTime
      }
      error
    }
  }
`

const JoinWaitlistDocument = /* GraphQL */ `
  mutation JoinWaitlist($input: JoinWaitlistInput!) {
    joinWaitlist(input: $input) {
      success
      entry {
        id
        status
        requestedDate
        requestedTime
      }
      error
    }
  }
`

const RemoveFromWaitlistDocument = /* GraphQL */ `
  mutation RemoveFromWaitlist($input: WaitlistActionInput!) {
    removeFromWaitlist(input: $input) {
      success
      entry {
        id
        status
      }
      error
    }
  }
`
import { cookies } from 'next/headers'

import type {
  PortalFacility,
  PortalService,
  PortalStaff,
  PortalBooking,
  PortalWaitlistEntry,
  BookingCategory,
  TimeSlot,
  FacilityBookingRequest,
  ServiceBookingRequest,
  BookingModificationRequest,
  FacilityType,
  ServiceCategory,
  PortalBookingStatus,
} from '@/lib/types'

// ==========================================================================
// SERVER-SIDE GRAPHQL CLIENT
// ==========================================================================

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

function getServerClient(): GraphQLClient {
  return new GraphQLClient(`${API_URL}/graphql`, {})
}

async function getCurrentMemberId(): Promise<string> {
  // Get member ID from session/cookies
  const cookieStore = await cookies()
  const memberId = cookieStore.get('member_id')?.value
  // For now, return a placeholder if not found - in production this should throw
  return memberId || 'member-placeholder'
}

// ==========================================================================
// TYPE MAPPING HELPERS
// ==========================================================================

function mapFacilityType(type: string): FacilityType {
  const typeMap: Record<string, FacilityType> = {
    COURT: 'court',
    SPA: 'spa',
    STUDIO: 'studio',
    POOL: 'pool',
    ROOM: 'room',
  }
  return typeMap[type] || 'room'
}

function mapServiceCategory(category: string): ServiceCategory {
  const categoryMap: Record<string, ServiceCategory> = {
    SPA: 'spa',
    FITNESS: 'fitness',
    SPORTS: 'sports',
    WELLNESS: 'wellness',
    spa: 'spa',
    fitness: 'fitness',
    sports: 'sports',
    wellness: 'wellness',
  }
  return categoryMap[category] || 'wellness'
}

function mapBookingStatus(status: string): PortalBookingStatus {
  const statusMap: Record<string, PortalBookingStatus> = {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    CHECKED_IN: 'checked_in',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
    NO_SHOW: 'no_show',
  }
  return statusMap[status] || 'pending'
}

// ==========================================================================
// CATEGORY DATA (Static - no backend equivalent)
// ==========================================================================

const bookingCategories: BookingCategory[] = [
  {
    id: 'cat-courts',
    name: 'Courts',
    description: 'Tennis, badminton, squash courts',
    icon: 'Building2',
    type: 'facility',
    facilityTypes: ['court'],
    itemCount: 0, // Will be updated dynamically
  },
  {
    id: 'cat-spa',
    name: 'Spa & Wellness',
    description: 'Massage, treatments, relaxation',
    icon: 'Sparkles',
    type: 'service',
    serviceCategories: ['spa', 'wellness'],
    itemCount: 0,
  },
  {
    id: 'cat-pool',
    name: 'Pool',
    description: 'Lap lanes and aquatic facilities',
    icon: 'Waves',
    type: 'facility',
    facilityTypes: ['pool'],
    itemCount: 0,
  },
  {
    id: 'cat-fitness',
    name: 'Fitness',
    description: 'Personal training and classes',
    icon: 'Dumbbell',
    type: 'service',
    serviceCategories: ['fitness', 'sports'],
    itemCount: 0,
  },
]

// ==========================================================================
// FETCH ACTIONS
// ==========================================================================

export async function fetchCategories(): Promise<BookingCategory[]> {
  try {
    const client = getServerClient()

    // Fetch facilities and services to get counts
    const [facilitiesResult, servicesResult] = await Promise.all([
      client.request<GetFacilitiesQuery>(GetFacilitiesDocument, { filter: { isActive: true } }),
      client.request<GetServicesQuery>(GetServicesDocument, { filter: { isActive: true } }),
    ])

    const facilities = facilitiesResult.facilities || []
    const services = servicesResult.services || []

    // Update counts in categories
    return bookingCategories.map((cat) => {
      if (cat.type === 'facility' && cat.facilityTypes) {
        const count = facilities.filter((f) =>
          cat.facilityTypes!.includes(mapFacilityType(f.type))
        ).length
        return { ...cat, itemCount: count }
      }
      if (cat.type === 'service' && cat.serviceCategories) {
        const count = services.filter((s) =>
          cat.serviceCategories!.includes(mapServiceCategory(s.category))
        ).length
        return { ...cat, itemCount: count }
      }
      return cat
    })
  } catch (error) {
    console.error('Error fetching categories:', error)
    return bookingCategories
  }
}

export async function fetchFacilities(options?: {
  type?: string
  search?: string
}): Promise<PortalFacility[]> {
  try {
    const client = getServerClient()
    const result = await client.request<GetFacilitiesQuery>(GetFacilitiesDocument, {
      filter: { isActive: true },
    })

    let facilities = (result.facilities || []).map((f): PortalFacility => ({
      id: f.id,
      name: f.name,
      type: mapFacilityType(f.type),
      location: f.location || '',
      description: '',
      features: [],
      capacity: f.capacity || undefined,
      operatingHours: [
        { day: 'monday', isOpen: true, openTime: '06:00', closeTime: '22:00' },
        { day: 'tuesday', isOpen: true, openTime: '06:00', closeTime: '22:00' },
        { day: 'wednesday', isOpen: true, openTime: '06:00', closeTime: '22:00' },
        { day: 'thursday', isOpen: true, openTime: '06:00', closeTime: '22:00' },
        { day: 'friday', isOpen: true, openTime: '06:00', closeTime: '22:00' },
        { day: 'saturday', isOpen: true, openTime: '07:00', closeTime: '21:00' },
        { day: 'sunday', isOpen: true, openTime: '07:00', closeTime: '21:00' },
      ],
      advanceBookingDays: 14,
      bookingDurationMinutes: [30, 60, 90, 120],
      basePrice: 0,
      memberPrice: 0,
    }))

    // Apply filters
    if (options?.type) {
      facilities = facilities.filter((f) => f.type === options.type)
    }
    if (options?.search) {
      const search = options.search.toLowerCase()
      facilities = facilities.filter(
        (f) =>
          f.name.toLowerCase().includes(search) ||
          f.location.toLowerCase().includes(search)
      )
    }

    return facilities
  } catch (error) {
    console.error('Error fetching facilities:', error)
    return []
  }
}

export async function fetchFacilityById(id: string): Promise<PortalFacility | null> {
  const facilities = await fetchFacilities()
  return facilities.find((f) => f.id === id) || null
}

export async function fetchServices(options?: {
  category?: string
  search?: string
}): Promise<PortalService[]> {
  try {
    const client = getServerClient()
    const result = await client.request<GetServicesQuery>(GetServicesDocument, {
      filter: { isActive: true },
    })

    let services = (result.services || []).map((s): PortalService => ({
      id: s.id,
      name: s.name,
      category: mapServiceCategory(s.category),
      description: s.description || '',
      durationMinutes: s.durationMinutes,
      basePrice: s.basePrice,
      memberPrice: s.basePrice * 0.8, // 20% member discount (placeholder)
      requiresStaff: true,
      staffCount: 0, // Will be populated when fetching staff
      variations: [],
    }))

    // Apply filters
    if (options?.category) {
      services = services.filter((s) => s.category === options.category)
    }
    if (options?.search) {
      const search = options.search.toLowerCase()
      services = services.filter(
        (s) =>
          s.name.toLowerCase().includes(search) ||
          s.description.toLowerCase().includes(search)
      )
    }

    return services
  } catch (error) {
    console.error('Error fetching services:', error)
    return []
  }
}

export async function fetchServiceById(id: string): Promise<PortalService | null> {
  const services = await fetchServices()
  return services.find((s) => s.id === id) || null
}

export async function fetchStaffForService(serviceId: string): Promise<PortalStaff[]> {
  try {
    const client = getServerClient()
    const result = await client.request<GetBookingStaffQuery>(GetBookingStaffDocument, {
      filter: { isActive: true },
    })

    // Map staff and filter by capabilities (service match)
    const staff = (result.bookingStaff || []).map((s): PortalStaff => ({
      id: s.id,
      name: `${s.firstName} ${s.lastName}`,
      photoUrl: s.photoUrl || undefined,
      specialties: s.capabilities || [],
      rating: 4.5 + Math.random() * 0.5, // Placeholder rating
      services: [], // TODO: Map from capabilities or separate service-staff linkage
      nextAvailable: 'Today',
    }))

    return staff
  } catch (error) {
    console.error('Error fetching staff:', error)
    return []
  }
}

export async function fetchFacilityAvailability(
  facilityId: string,
  date: string
): Promise<TimeSlot[]> {
  // TODO: Implement real availability query when backend supports it
  // For now, generate mock time slots based on operating hours
  const slots: TimeSlot[] = []
  const startHour = 6
  const endHour = 21

  for (let hour = startHour; hour < endHour; hour++) {
    const isAvailable = Math.random() > 0.3
    slots.push({
      id: `slot-${facilityId}-${date}-${hour}`,
      startTime: `${String(hour).padStart(2, '0')}:00`,
      endTime: `${String(hour + 1).padStart(2, '0')}:00`,
      status: isAvailable ? 'available' : Math.random() > 0.5 ? 'limited' : 'booked',
      spotsAvailable: isAvailable ? Math.floor(Math.random() * 4) + 1 : 0,
      price: 600,
      basePrice: 800,
    })
  }
  return slots
}

export async function fetchServiceAvailability(
  serviceId: string,
  date: string,
  staffId?: string
): Promise<TimeSlot[]> {
  // TODO: Implement real availability query when backend supports it
  const slots: TimeSlot[] = []
  const startHour = 9
  const endHour = 19

  for (let hour = startHour; hour < endHour; hour++) {
    const isAvailable = Math.random() > 0.4
    slots.push({
      id: `slot-${serviceId}-${date}-${hour}`,
      startTime: `${String(hour).padStart(2, '0')}:00`,
      endTime: `${String(hour + 1).padStart(2, '0')}:00`,
      status: isAvailable ? 'available' : 'booked',
      price: 1200,
      basePrice: 1500,
    })
  }
  return slots
}

// ==========================================================================
// BOOKING ACTIONS
// ==========================================================================

export async function fetchMyBookings(options?: {
  status?: 'upcoming' | 'past' | 'all'
}): Promise<PortalBooking[]> {
  try {
    const client = getServerClient()

    // Determine status filter
    let statuses: BookingStatus[] | undefined
    if (options?.status === 'upcoming') {
      statuses = ['PENDING' as BookingStatus, 'CONFIRMED' as BookingStatus, 'CHECKED_IN' as BookingStatus]
    } else if (options?.status === 'past') {
      statuses = ['COMPLETED' as BookingStatus, 'CANCELLED' as BookingStatus, 'NO_SHOW' as BookingStatus]
    }

    const result = await client.request<GetBookingsQuery>(GetBookingsDocument, {
      statuses,
      first: 50,
    })

    const bookings: PortalBooking[] = (result.bookings?.edges || []).map((edge) => {
      const b = edge.node
      const isFacilityBooking = b.bookingType === 'FACILITY'
      const startDate = new Date(b.startTime)
      const endDate = new Date(b.endTime)

      const baseBooking = {
        id: b.id,
        date: startDate.toISOString().split('T')[0] || '',
        startTime: startDate.toTimeString().slice(0, 5),
        endTime: endDate.toTimeString().slice(0, 5),
        durationMinutes: b.durationMinutes,
        status: mapBookingStatus(b.status),
        pricing: {
          base: b.pricing?.basePrice || 0,
          modifiers: (b.pricing?.modifiers || []).map((m) => ({
            label: m.label,
            amount: m.amount,
            type: m.isPercentage ? 'discount' as const : 'surcharge' as const,
          })),
          total: b.pricing?.total || 0,
        },
        cancellationPolicy: {
          fullRefundBefore: startDate.toISOString(),
          partialRefundBefore: startDate.toISOString(),
          noRefundAfter: startDate.toISOString(),
          partialRefundPercent: 50,
        },
        notes: b.notes || undefined,
        createdAt: b.createdAt,
      }

      if (isFacilityBooking && b.facility) {
        return {
          ...baseBooking,
          type: 'facility' as const,
          facility: {
            id: b.facility.id,
            name: b.facility.name,
            type: mapFacilityType(b.facility.type),
            location: b.facility.location || '',
          },
        }
      } else {
        return {
          ...baseBooking,
          type: 'service' as const,
          service: {
            id: b.service?.id || '',
            name: b.service?.name || '',
            category: mapServiceCategory(b.service?.category || 'spa'),
          },
          staff: b.staff ? {
            id: b.staff.id,
            name: `${b.staff.firstName} ${b.staff.lastName}`,
            photoUrl: b.staff.photoUrl || undefined,
          } : undefined,
        }
      }
    })

    // Apply date filtering for upcoming/past
    if (options?.status === 'upcoming') {
      const now = new Date()
      return bookings.filter((b) => new Date(b.date) >= now && b.status !== 'cancelled')
    }
    if (options?.status === 'past') {
      const now = new Date()
      return bookings.filter((b) => new Date(b.date) < now || b.status === 'completed')
    }

    return bookings
  } catch (error) {
    console.error('Error fetching bookings:', error)
    return []
  }
}

export async function fetchBookingById(id: string): Promise<PortalBooking | null> {
  const bookings = await fetchMyBookings()
  return bookings.find((b) => b.id === id) || null
}

export async function createFacilityBooking(
  request: FacilityBookingRequest
): Promise<{ success: boolean; bookingId?: string; error?: string }> {
  try {
    const client = getServerClient()
    const memberId = await getCurrentMemberId()

    // Parse date and time into ISO datetime
    const startDateTime = new Date(`${request.date}T${request.startTime}:00`)
    const endDateTime = new Date(startDateTime.getTime() + request.durationMinutes * 60 * 1000)

    const input: CreateBookingInput = {
      memberId,
      facilityId: request.facilityId,
      bookingType: 'FACILITY',
      startTime: startDateTime.toISOString(),
      endTime: endDateTime.toISOString(),
      notes: request.notes,
    }

    const result = await client.request<CreateBookingMutation>(CreateBookingDocument, { input })

    if (result.createBooking.success) {
      return {
        success: true,
        bookingId: result.createBooking.booking?.id,
      }
    } else {
      return {
        success: false,
        error: result.createBooking.error || 'Failed to create booking',
      }
    }
  } catch (error) {
    console.error('Error creating facility booking:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create booking',
    }
  }
}

export async function createServiceBooking(
  request: ServiceBookingRequest
): Promise<{ success: boolean; bookingId?: string; error?: string }> {
  try {
    const client = getServerClient()
    const memberId = await getCurrentMemberId()

    // Get service to determine duration
    const service = await fetchServiceById(request.serviceId)
    const durationMinutes = service?.durationMinutes || 60

    // Parse date and time into ISO datetime
    const startDateTime = new Date(`${request.date}T${request.startTime}:00`)
    const endDateTime = new Date(startDateTime.getTime() + durationMinutes * 60 * 1000)

    const input: CreateBookingInput = {
      memberId,
      serviceId: request.serviceId,
      staffId: request.staffId,
      bookingType: 'SERVICE',
      startTime: startDateTime.toISOString(),
      endTime: endDateTime.toISOString(),
      guestCount: request.participants,
      notes: request.notes,
    }

    const result = await client.request<CreateBookingMutation>(CreateBookingDocument, { input })

    if (result.createBooking.success) {
      return {
        success: true,
        bookingId: result.createBooking.booking?.id,
      }
    } else {
      return {
        success: false,
        error: result.createBooking.error || 'Failed to create booking',
      }
    }
  } catch (error) {
    console.error('Error creating service booking:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create booking',
    }
  }
}

export async function cancelBooking(
  bookingId: string
): Promise<{ success: boolean; refundAmount?: number; error?: string }> {
  try {
    const client = getServerClient()

    const result = await client.request<CancelBookingMutation>(CancelBookingDocument, {
      input: { bookingId },
    })

    if (result.cancelBooking.success) {
      return {
        success: true,
        refundAmount: 0, // TODO: Get refund amount from backend
      }
    } else {
      return {
        success: false,
        error: result.cancelBooking.error || 'Failed to cancel booking',
      }
    }
  } catch (error) {
    console.error('Error cancelling booking:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to cancel booking',
    }
  }
}

export async function rescheduleBooking(
  bookingId: string,
  newDate: string,
  newStartTime: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const client = getServerClient()

    // Get the existing booking to determine duration
    const booking = await fetchBookingById(bookingId)
    if (!booking) {
      return {
        success: false,
        error: 'Booking not found',
      }
    }

    // Parse new date and time into ISO datetime
    const newStartDateTime = new Date(`${newDate}T${newStartTime}:00`)

    const input: RescheduleBookingInput = {
      id: bookingId,
      newStartTime: newStartDateTime.toISOString(),
    }

    const result = await client.request<RescheduleBookingMutation>(
      RescheduleBookingDocument,
      { input }
    )

    if (result.rescheduleBooking.success) {
      return { success: true }
    } else {
      return {
        success: false,
        error: result.rescheduleBooking.error || 'Failed to reschedule booking',
      }
    }
  } catch (error) {
    console.error('Error rescheduling booking:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to reschedule booking',
    }
  }
}

// Keep old function signature for backwards compatibility
export async function modifyBooking(
  request: BookingModificationRequest
): Promise<{ success: boolean; error?: string }> {
  if (!request.newDate || !request.newStartTime) {
    return {
      success: false,
      error: 'New date and start time are required',
    }
  }
  return rescheduleBooking(request.bookingId, request.newDate, request.newStartTime)
}

// ==========================================================================
// WAITLIST ACTIONS
// ==========================================================================

export async function fetchMyWaitlist(): Promise<PortalWaitlistEntry[]> {
  try {
    const client = getServerClient()

    const result = await client.request<GetWaitlistQuery>(GetWaitlistDocument, {
      first: 50,
    })

    return (result.waitlist?.edges || []).map((edge) => {
      const w = edge.node
      return {
        id: w.id,
        bookingType: 'service' as const, // TODO: Determine from service/facility ID
        serviceId: undefined, // TODO: Extract from waitlist entry
        preferredDate: w.requestedDate,
        preferredTimeStart: w.requestedTime || '09:00',
        preferredTimeEnd: '18:00',
        status: w.status.toLowerCase() as PortalWaitlistEntry['status'],
        position: w.position || undefined,
        offerExpiresAt: w.offerExpiresAt || undefined,
        createdAt: w.createdAt,
      }
    })
  } catch (error) {
    console.error('Error fetching waitlist:', error)
    return []
  }
}

export async function joinWaitlist(params: {
  bookingType: 'facility' | 'service'
  facilityId?: string
  serviceId?: string
  preferredDate: string
  preferredTimeStart: string
  preferredTimeEnd: string
  preferredStaffId?: string
}): Promise<{ success: boolean; entryId?: string; position?: number; error?: string }> {
  try {
    const client = getServerClient()
    const memberId = await getCurrentMemberId()

    // Build notes with staff preference if provided
    let notes = `Preferred time window: ${params.preferredTimeStart} - ${params.preferredTimeEnd}`
    if (params.preferredStaffId) {
      notes += `. Preferred staff: ${params.preferredStaffId}`
    }

    const input: JoinWaitlistInput = {
      memberId,
      facilityId: params.facilityId,
      serviceId: params.serviceId,
      requestedDate: params.preferredDate,
      requestedTime: params.preferredTimeStart,
      notes,
    }

    const result = await client.request<JoinWaitlistMutation>(JoinWaitlistDocument, { input })

    if (result.joinWaitlist.success) {
      return {
        success: true,
        entryId: result.joinWaitlist.entry?.id,
        position: undefined, // TODO: Get position from backend
      }
    } else {
      return {
        success: false,
        error: result.joinWaitlist.error || 'Failed to join waitlist',
      }
    }
  } catch (error) {
    console.error('Error joining waitlist:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to join waitlist',
    }
  }
}

export async function leaveWaitlist(
  entryId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const client = getServerClient()

    const result = await client.request<RemoveFromWaitlistMutation>(RemoveFromWaitlistDocument, {
      input: { waitlistId: entryId },
    })

    if (result.removeFromWaitlist.success) {
      return { success: true }
    } else {
      return {
        success: false,
        error: result.removeFromWaitlist.error || 'Failed to leave waitlist',
      }
    }
  } catch (error) {
    console.error('Error leaving waitlist:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to leave waitlist',
    }
  }
}

export async function acceptWaitlistOffer(
  entryId: string
): Promise<{ success: boolean; bookingId?: string; error?: string }> {
  // TODO: Implement when backend supports accepting waitlist offers
  console.log('Accepting waitlist offer:', entryId)
  return {
    success: false,
    error: 'Accepting waitlist offers not yet implemented',
  }
}

export async function declineWaitlistOffer(
  entryId: string
): Promise<{ success: boolean; error?: string }> {
  // TODO: Implement when backend supports declining waitlist offers
  console.log('Declining waitlist offer:', entryId)
  return {
    success: false,
    error: 'Declining waitlist offers not yet implemented',
  }
}
