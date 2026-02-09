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
        position
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

const AcceptWaitlistOfferDocument = /* GraphQL */ `
  mutation AcceptWaitlistOffer($input: WaitlistActionInput!) {
    acceptWaitlistOffer(input: $input) {
      success
      entry {
        id
        status
      }
      message
      error
    }
  }
`

const DeclineWaitlistOfferDocument = /* GraphQL */ `
  mutation DeclineWaitlistOffer($input: WaitlistActionInput!) {
    declineWaitlistOffer(input: $input) {
      success
      entry {
        id
        status
      }
      message
      error
    }
  }
`
import { getSession } from '@/lib/auth/session'
import { prisma } from '@/lib/db'

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
  DayHours,
} from '@/lib/types'

// ==========================================================================
// SERVER-SIDE GRAPHQL CLIENT
// ==========================================================================

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

function getServerClient(): GraphQLClient {
  return new GraphQLClient(`${API_URL}/graphql`, {})
}

async function getCurrentMemberId(): Promise<string> {
  const session = await getSession()
  if (!session.isLoggedIn || !session.memberId) {
    throw new Error('Not authenticated')
  }
  return session.memberId
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

    // Fetch real operating hours and pricing from Prisma for all facilities
    const facilityIds = (result.facilities || []).map((f) => f.id)
    const dbFacilities = facilityIds.length > 0
      ? await prisma.facility.findMany({
          where: { id: { in: facilityIds } },
          select: {
            id: true,
            description: true,
            amenities: true,
            operatingHours: true,
            bookingDuration: true,
            maxAdvanceDays: true,
            memberRate: true,
            guestRate: true,
          },
        })
      : []
    const dbMap = new Map(dbFacilities.map((f) => [f.id, f]))

    let facilities = (result.facilities || []).map((f): PortalFacility => {
      const db = dbMap.get(f.id)
      const hours = db?.operatingHours as Record<string, { open: string; close: string }> | null
      const duration = db?.bookingDuration || 60

      const weekDays: DayHours['day'][] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
      const operatingHours: DayHours[] = hours
        ? weekDays.map((day) => {
            const dh = hours[day]
            return {
              day,
              isOpen: !!dh,
              openTime: dh?.open ?? '06:00',
              closeTime: dh?.close ?? '22:00',
            }
          })
        : weekDays.map((day): DayHours => ({
            day,
            isOpen: true,
            openTime: day === 'saturday' || day === 'sunday' ? '07:00' : '06:00',
            closeTime: day === 'saturday' || day === 'sunday' ? '21:00' : '22:00',
          }))

      return {
        id: f.id,
        name: f.name,
        type: mapFacilityType(f.type),
        location: f.location || '',
        description: db?.description ?? '',
        features: (db?.amenities as string[]) ?? [],
        capacity: f.capacity || undefined,
        operatingHours,
        advanceBookingDays: db?.maxAdvanceDays ?? 14,
        bookingDurationMinutes: [duration, duration * 2, duration * 3].filter((d) => d <= 240),
        basePrice: Number(db?.guestRate ?? 0),
        memberPrice: Number(db?.memberRate ?? 0),
      }
    })

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
      rating: 4.8, // Default rating until review system is implemented
      services: s.capabilities || [], // Staff capabilities serve as service list until dedicated service-staff linkage is added
      nextAvailable: 'Today',
    }))

    return staff
  } catch (error) {
    console.error('Error fetching staff:', error)
    return []
  }
}

const DAY_NAMES = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const

export async function fetchFacilityAvailability(
  facilityId: string,
  date: string
): Promise<TimeSlot[]> {
  const facility = await prisma.facility.findUnique({
    where: { id: facilityId },
    include: {
      resources: {
        where: { isActive: true, isBookable: true },
        select: { id: true },
      },
    },
  })

  if (!facility) return []

  const dateObj = new Date(date)
  const dayName = DAY_NAMES[dateObj.getUTCDay()]!
  const hours = facility.operatingHours as Record<string, { open: string; close: string }> | null
  const dayHours = hours?.[dayName]

  // Fallback to 6am-9pm if no operating hours configured
  const openHour = dayHours ? parseInt(dayHours.open.split(':')[0]!, 10) : 6
  const closeHour = dayHours ? parseInt(dayHours.close.split(':')[0]!, 10) : 21
  const slotDuration = facility.bookingDuration || 60

  const resourceIds = facility.resources.map((r) => r.id)
  const totalResources = resourceIds.length

  if (totalResources === 0) return []

  const dayStart = new Date(date + 'T00:00:00Z')
  const dayEnd = new Date(date + 'T23:59:59Z')

  const existingBookings = await prisma.booking.findMany({
    where: {
      resourceId: { in: resourceIds },
      status: { in: ['PENDING', 'CONFIRMED', 'CHECKED_IN'] },
      startTime: { gte: dayStart },
      endTime: { lte: dayEnd },
    },
    select: { resourceId: true, startTime: true, endTime: true },
  })

  const memberRate = Number(facility.memberRate ?? 0)
  const guestRate = Number(facility.guestRate ?? 0)
  const slots: TimeSlot[] = []

  for (let hour = openHour; hour < closeHour; hour++) {
    const slotEndHour = hour + slotDuration / 60
    if (slotEndHour > closeHour) break

    const slotStart = new Date(date + `T${String(hour).padStart(2, '0')}:00:00Z`)
    const slotEnd = new Date(slotStart.getTime() + slotDuration * 60 * 1000)

    const bookedCount = existingBookings.filter(
      (b) => b.startTime < slotEnd && b.endTime > slotStart
    ).length

    const spotsAvailable = totalResources - bookedCount
    let status: 'available' | 'limited' | 'booked' = 'available'
    if (spotsAvailable === 0) status = 'booked'
    else if (spotsAvailable <= Math.ceil(totalResources / 3)) status = 'limited'

    slots.push({
      id: `slot-${facilityId}-${date}-${hour}`,
      startTime: `${String(hour).padStart(2, '0')}:00`,
      endTime: `${String(hour + Math.ceil(slotDuration / 60)).padStart(2, '0')}:00`,
      status,
      spotsAvailable,
      maxCapacity: totalResources,
      price: memberRate * (slotDuration / 60),
      basePrice: guestRate * (slotDuration / 60),
    })
  }

  return slots
}

export async function fetchServiceAvailability(
  serviceId: string,
  date: string,
  staffId?: string
): Promise<TimeSlot[]> {
  const service = await prisma.service.findUnique({
    where: { id: serviceId },
  })

  if (!service) return []

  const durationMinutes = service.durationMinutes || 60
  // Service operating hours default to 9am-7pm
  const startHour = 9
  const endHour = 19

  const dayStart = new Date(date + 'T00:00:00Z')
  const dayEnd = new Date(date + 'T23:59:59Z')

  // Query existing bookings for this service (and optionally staff) on the given date
  const existingBookings = await prisma.booking.findMany({
    where: {
      serviceId,
      ...(staffId ? { staffId } : {}),
      status: { in: ['PENDING', 'CONFIRMED', 'CHECKED_IN'] },
      startTime: { gte: dayStart },
      endTime: { lte: dayEnd },
    },
    select: { startTime: true, endTime: true },
  })

  const basePrice = Number(service.basePrice ?? 0)
  const memberPrice = Math.round(basePrice * 0.8) // Member discount applied
  const slots: TimeSlot[] = []

  for (let hour = startHour; hour < endHour; hour++) {
    const slotEndMinutes = hour * 60 + durationMinutes
    if (slotEndMinutes > endHour * 60) break

    const slotStart = new Date(date + `T${String(hour).padStart(2, '0')}:00:00Z`)
    const slotEnd = new Date(slotStart.getTime() + durationMinutes * 60 * 1000)

    const hasConflict = existingBookings.some(
      (b) => b.startTime < slotEnd && b.endTime > slotStart
    )

    slots.push({
      id: `slot-${serviceId}-${date}-${hour}`,
      startTime: `${String(hour).padStart(2, '0')}:00`,
      endTime: `${String(Math.floor(slotEndMinutes / 60)).padStart(2, '0')}:${String(slotEndMinutes % 60).padStart(2, '0')}`,
      status: hasConflict ? 'booked' : 'available',
      price: memberPrice,
      basePrice,
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
        refundAmount: 0, // Backend cancelBooking mutation does not return refund amount; billing handles refund separately
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
        bookingType: (w.facilityName ? 'facility' : 'service') as 'facility' | 'service',
        serviceId: undefined, // Waitlist GraphQL response does not include serviceId/facilityId; only names are available
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
        position: (result.joinWaitlist.entry as { position?: number } | undefined)?.position,
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
  try {
    const client = getServerClient()

    const result = await client.request<{
      acceptWaitlistOffer: {
        success: boolean
        entry?: { id: string; status: string }
        message?: string
        error?: string
      }
    }>(AcceptWaitlistOfferDocument, {
      input: { entryId },
    })

    if (result.acceptWaitlistOffer.success) {
      return {
        success: true,
        bookingId: result.acceptWaitlistOffer.entry?.id,
      }
    } else {
      return {
        success: false,
        error: result.acceptWaitlistOffer.error || 'Failed to accept waitlist offer',
      }
    }
  } catch (error) {
    console.error('Error accepting waitlist offer:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to accept waitlist offer',
    }
  }
}

export async function declineWaitlistOffer(
  entryId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const client = getServerClient()

    const result = await client.request<{
      declineWaitlistOffer: {
        success: boolean
        entry?: { id: string; status: string }
        message?: string
        error?: string
      }
    }>(DeclineWaitlistOfferDocument, {
      input: { entryId },
    })

    if (result.declineWaitlistOffer.success) {
      return { success: true }
    } else {
      return {
        success: false,
        error: result.declineWaitlistOffer.error || 'Failed to decline waitlist offer',
      }
    }
  } catch (error) {
    console.error('Error declining waitlist offer:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to decline waitlist offer',
    }
  }
}
