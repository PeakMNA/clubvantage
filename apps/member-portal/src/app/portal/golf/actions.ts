'use server'

import { GraphQLClient } from '@clubvantage/api-client/client'
import { getSession } from '@/lib/auth/session'
import { prisma } from '@/lib/db'

import type {
  TeeTimeBooking,
  BookingPlayer,
  GolfTimeSlot,
  PortalCourse,
  CancellationPolicy,
} from '@/lib/types'

// ============================================================================
// GRAPHQL DOCUMENTS
// ============================================================================

const GetCoursesDocument = /* GraphQL */ `
  query GetCourses {
    courses {
      id
      name
      code
      description
      holes
      par
      slope
      rating
      firstTeeTime
      lastTeeTime
      teeInterval
      isActive
    }
  }
`

const GetTeeSheetDocument = /* GraphQL */ `
  query GetTeeSheet($courseId: ID!, $date: DateTime!) {
    teeSheet(courseId: $courseId, date: $date) {
      time
      courseId
      date
      available
      booking {
        id
        teeTimeNumber
        teeDate
        teeTime
        holes
        status
        notes
        course {
          id
          name
        }
        players {
          id
          position
          playerType
          member {
            id
            memberId
            firstName
            lastName
          }
          guestName
          guestEmail
          guestPhone
          cartType
          caddy {
            id
            firstName
            lastName
          }
        }
      }
    }
  }
`

const GetTeeTimesDocument = /* GraphQL */ `
  query GetTeeTimes(
    $memberId: ID
    $startDate: DateTime
    $endDate: DateTime
    $status: TeeTimeStatus
    $first: Int
    $skip: Int
  ) {
    teeTimes(
      memberId: $memberId
      startDate: $startDate
      endDate: $endDate
      status: $status
      first: $first
      skip: $skip
    ) {
      edges {
        node {
          id
          teeTimeNumber
          teeDate
          teeTime
          holes
          status
          notes
          createdAt
          course {
            id
            name
            code
          }
          players {
            id
            position
            playerType
            member {
              id
              memberId
              firstName
              lastName
            }
            guestName
            guestEmail
            guestPhone
            cartType
            sharedWithPosition
            caddy {
              id
              firstName
              lastName
            }
          }
        }
      }
      totalCount
    }
  }
`

const GetTeeTimeDocument = /* GraphQL */ `
  query GetTeeTime($id: ID!) {
    teeTime(id: $id) {
      id
      teeTimeNumber
      teeDate
      teeTime
      holes
      status
      notes
      createdAt
      updatedAt
      course {
        id
        name
        code
        description
        holes
        par
      }
      players {
        id
        position
        playerType
        member {
          id
          memberId
          firstName
          lastName
        }
        guestName
        guestEmail
        guestPhone
        cartType
        sharedWithPosition
        caddy {
          id
          caddyNumber
          firstName
          lastName
        }
        checkedInAt
      }
    }
  }
`

const CreateTeeTimeDocument = /* GraphQL */ `
  mutation CreateTeeTime($input: CreateTeeTimeInput!) {
    createTeeTime(input: $input) {
      id
      teeTimeNumber
      teeDate
      teeTime
      status
      course {
        id
        name
      }
      players {
        id
        position
        playerType
      }
    }
  }
`

const CancelTeeTimeDocument = /* GraphQL */ `
  mutation CancelTeeTime($id: ID!, $reason: String) {
    cancelTeeTime(id: $id, reason: $reason) {
      message
    }
  }
`

const GetDependentsDocument = /* GraphQL */ `
  query GetDependents {
    myDependents {
      id
      firstName
      lastName
      relationship
      email
      phone
    }
  }
`

// ============================================================================
// TYPE DEFINITIONS FOR GRAPHQL RESPONSES
// ============================================================================

interface GolfCourseResponse {
  id: string
  name: string
  code: string
  description?: string
  holes: number
  par: number
  slope?: number
  rating?: number
  firstTeeTime: string
  lastTeeTime: string
  teeInterval: number
  isActive: boolean
}

interface TeeSheetSlotResponse {
  time: string
  courseId: string
  date: string
  available: boolean
  booking?: TeeTimeResponse
}

interface TeeTimeResponse {
  id: string
  teeTimeNumber: string
  teeDate: string
  teeTime: string
  holes: number
  status: string
  notes?: string
  createdAt: string
  updatedAt?: string
  course?: {
    id: string
    name: string
    code?: string
    description?: string
    holes?: number
    par?: number
  }
  players: TeeTimePlayerResponse[]
}

interface TeeTimePlayerResponse {
  id: string
  position: number
  playerType: string
  member?: {
    id: string
    memberId: string
    firstName: string
    lastName: string
  }
  guestName?: string
  guestEmail?: string
  guestPhone?: string
  cartType: string
  sharedWithPosition?: number
  caddy?: {
    id: string
    caddyNumber?: string
    firstName: string
    lastName: string
  }
  checkedInAt?: string
}

interface DependentResponse {
  id: string
  firstName: string
  lastName: string
  relationship: string
  email?: string
  phone?: string
}

// ============================================================================
// SERVER-SIDE GRAPHQL CLIENT
// ============================================================================

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

function getServerClient(): GraphQLClient {
  return new GraphQLClient(`${API_URL}/graphql`, {})
}

async function getCurrentMemberId(): Promise<string> {
  const session = await getSession()
  return session.isLoggedIn ? session.memberId : 'member-placeholder'
}

// ============================================================================
// TYPE MAPPING HELPERS
// ============================================================================

function mapPlayerType(type: string): 'member' | 'dependent' | 'guest' {
  const typeMap: Record<string, 'member' | 'dependent' | 'guest'> = {
    MEMBER: 'member',
    DEPENDENT: 'dependent',
    GUEST: 'guest',
    WALK_UP: 'guest',
  }
  return typeMap[type] || 'guest'
}

function mapBookingStatus(
  status: string
): 'confirmed' | 'pending' | 'cancelled' | 'completed' | 'no-show' {
  const statusMap: Record<
    string,
    'confirmed' | 'pending' | 'cancelled' | 'completed' | 'no-show'
  > = {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    CHECKED_IN: 'confirmed',
    IN_PROGRESS: 'confirmed',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
    NO_SHOW: 'no-show',
  }
  return statusMap[status] || 'pending'
}

function getCaddyType(
  players: TeeTimePlayerResponse[]
): 'none' | 'shared' | 'individual' {
  const playersWithCaddy = players.filter((p) => p.caddy)
  if (playersWithCaddy.length === 0) return 'none'
  if (playersWithCaddy.length === 1 && players.length > 1) return 'shared'
  if (playersWithCaddy.length === players.length) return 'individual'
  return 'shared'
}

function hasCart(players: TeeTimePlayerResponse[]): boolean {
  return players.some(
    (p) => p.cartType === 'SINGLE' || p.cartType === 'SHARED'
  )
}

interface GolfRates {
  greenFeePerPlayer: number
  cartFee: number
  caddyFeeShared: number
  caddyFeeIndividual: number
}

async function getGolfRates(courseId: string): Promise<GolfRates> {
  const rateConfig = await prisma.golfRateConfig.findFirst({
    where: {
      courseId,
      isActive: true,
      effectiveFrom: { lte: new Date() },
      OR: [{ effectiveTo: null }, { effectiveTo: { gte: new Date() } }],
    },
    orderBy: { effectiveFrom: 'desc' },
    include: {
      greenFeeRates: true,
      cartRates: true,
      caddyRates: true,
    },
  })

  const greenFee = rateConfig?.greenFeeRates.find(
    (r) => r.playerType === 'MEMBER' && r.holes === 18
  )
  const cartRate = rateConfig?.cartRates.find((r) => r.cartType === 'SHARED')
  const caddyShared = rateConfig?.caddyRates.find((r) => r.caddyType === 'SHARED')
  const caddyIndividual = rateConfig?.caddyRates.find((r) => r.caddyType === 'INDIVIDUAL')

  return {
    greenFeePerPlayer: greenFee ? Number(greenFee.amount) : 3500,
    cartFee: cartRate ? Number(cartRate.amount) : 500,
    caddyFeeShared: caddyShared ? Number(caddyShared.amount) : 1500,
    caddyFeeIndividual: caddyIndividual ? Number(caddyIndividual.amount) : 2500,
  }
}

function transformTeeTimeToBooking(teeTime: TeeTimeResponse, rates: GolfRates): TeeTimeBooking {
  const teeDate = new Date(teeTime.teeDate)
  const cancellationDeadline = new Date(teeDate)
  cancellationDeadline.setHours(cancellationDeadline.getHours() - 24)

  const cancellationPolicy: CancellationPolicy = {
    fullRefundBefore: cancellationDeadline.toISOString(),
    partialRefundBefore: teeDate.toISOString(),
    noRefundAfter: teeDate.toISOString(),
    partialRefundPercent: 50,
  }

  const players: BookingPlayer[] = teeTime.players.map((p) => ({
    id: p.id,
    name: p.member
      ? `${p.member.firstName} ${p.member.lastName}`
      : p.guestName || 'Guest',
    type: mapPlayerType(p.playerType),
    memberId: p.member?.memberId,
    phone: p.guestPhone,
    email: p.guestEmail,
  }))

  const { greenFeePerPlayer, cartFee, caddyFeeShared, caddyFeeIndividual } = rates

  const caddyType = getCaddyType(teeTime.players)
  const cartIncluded = hasCart(teeTime.players)

  let totalPrice = greenFeePerPlayer * players.length
  const priceBreakdown = [
    {
      label: `Green Fee (${players.length} player${players.length > 1 ? 's' : ''})`,
      amount: greenFeePerPlayer * players.length,
    },
  ]

  if (cartIncluded) {
    totalPrice += cartFee
    priceBreakdown.push({ label: 'Golf Cart', amount: cartFee })
  }

  if (caddyType === 'shared') {
    totalPrice += caddyFeeShared
    priceBreakdown.push({ label: 'Shared Caddy', amount: caddyFeeShared })
  } else if (caddyType === 'individual') {
    const caddyTotal = caddyFeeIndividual * players.length
    totalPrice += caddyTotal
    priceBreakdown.push({
      label: `Individual Caddies (${players.length})`,
      amount: caddyTotal,
    })
  }

  return {
    id: teeTime.id,
    date: teeDate.toISOString().split('T')[0] || '',
    time: teeTime.teeTime,
    courseName: teeTime.course?.name || 'Unknown Course',
    courseId: teeTime.course?.id || '',
    roundType: teeTime.holes === 18 ? '18-hole' : '9-hole',
    players,
    cart: cartIncluded,
    caddy: caddyType,
    status: mapBookingStatus(teeTime.status),
    totalPrice,
    priceBreakdown,
    cancellationPolicy,
    createdAt: teeTime.createdAt,
  }
}

// ============================================================================
// FETCH ACTIONS
// ============================================================================

/**
 * Fetch all available golf courses
 */
export async function fetchMyCourses(): Promise<PortalCourse[]> {
  try {
    const client = getServerClient()
    const result = await client.request<{ courses: GolfCourseResponse[] }>(
      GetCoursesDocument
    )

    return (result.courses || [])
      .filter((c) => c.isActive)
      .map((c) => ({
        id: c.id,
        name: c.name,
        enable18HoleBooking: c.holes >= 18,
        advanceBookingDays: 14, // Default, could be from course settings
      }))
  } catch (error) {
    console.error('Error fetching courses:', error)
    return []
  }
}

/**
 * Fetch tee sheet for a specific course and date
 */
export async function fetchTeeSheet(
  courseId: string,
  date: Date
): Promise<GolfTimeSlot[]> {
  try {
    const client = getServerClient()
    const result = await client.request<{ teeSheet: TeeSheetSlotResponse[] }>(
      GetTeeSheetDocument,
      {
        courseId,
        date: date.toISOString(),
      }
    )

    return (result.teeSheet || []).map((slot) => ({
      time: slot.time,
      available: slot.available,
      price: 3500, // Default price, should come from rate configuration
      holes: '18',
    }))
  } catch (error) {
    console.error('Error fetching tee sheet:', error)
    return []
  }
}

/**
 * Fetch member's golf bookings
 */
export async function fetchMyGolfBookings(
  status?: 'upcoming' | 'past'
): Promise<TeeTimeBooking[]> {
  try {
    const client = getServerClient()
    const memberId = await getCurrentMemberId()
    const now = new Date()

    let startDate: string | undefined
    let endDate: string | undefined

    if (status === 'upcoming') {
      startDate = now.toISOString()
    } else if (status === 'past') {
      endDate = now.toISOString()
    }

    const result = await client.request<{
      teeTimes: {
        edges: { node: TeeTimeResponse }[]
        totalCount: number
      }
    }>(GetTeeTimesDocument, {
      memberId,
      startDate,
      endDate,
      first: 50,
    })

    // Pre-fetch rates per unique course to avoid N+1 queries
    const edges = result.teeTimes?.edges || []
    const courseIds = [...new Set(edges.map((e) => e.node.course?.id).filter(Boolean) as string[])]
    const ratesMap = new Map<string, GolfRates>()
    await Promise.all(
      courseIds.map(async (cid) => {
        ratesMap.set(cid, await getGolfRates(cid))
      })
    )

    const defaultRates: GolfRates = {
      greenFeePerPlayer: 3500, cartFee: 500, caddyFeeShared: 1500, caddyFeeIndividual: 2500,
    }

    const bookings = edges
      .map((edge) => {
        const rates = ratesMap.get(edge.node.course?.id ?? '') ?? defaultRates
        return transformTeeTimeToBooking(edge.node, rates)
      })
      .sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time}`)
        const dateB = new Date(`${b.date}T${b.time}`)
        return status === 'past'
          ? dateB.getTime() - dateA.getTime()
          : dateA.getTime() - dateB.getTime()
      })

    return bookings
  } catch (error) {
    console.error('Error fetching golf bookings:', error)
    return []
  }
}

/**
 * Fetch a specific golf booking by ID
 */
export async function fetchGolfBookingById(
  id: string
): Promise<TeeTimeBooking | null> {
  try {
    const client = getServerClient()
    const result = await client.request<{ teeTime: TeeTimeResponse }>(
      GetTeeTimeDocument,
      { id }
    )

    if (!result.teeTime) return null

    const rates = result.teeTime.course?.id
      ? await getGolfRates(result.teeTime.course.id)
      : { greenFeePerPlayer: 3500, cartFee: 500, caddyFeeShared: 1500, caddyFeeIndividual: 2500 }

    return transformTeeTimeToBooking(result.teeTime, rates)
  } catch (error) {
    console.error('Error fetching golf booking:', error)
    return null
  }
}

/**
 * Fetch member's dependents for adding to bookings
 */
export async function fetchMyDependents(): Promise<BookingPlayer[]> {
  try {
    const client = getServerClient()
    const result = await client.request<{ myDependents: DependentResponse[] }>(
      GetDependentsDocument
    )

    return (result.myDependents || []).map((d) => ({
      id: d.id,
      name: `${d.firstName} ${d.lastName}`,
      type: 'dependent' as const,
      email: d.email,
      phone: d.phone,
    }))
  } catch (error) {
    console.error('Error fetching dependents:', error)
    return []
  }
}

// ============================================================================
// MUTATION ACTIONS
// ============================================================================

export interface CreateGolfBookingInput {
  courseId: string
  teeDate: string // YYYY-MM-DD
  teeTime: string // HH:MM
  holes?: number
  players: {
    position: number
    playerType: 'MEMBER' | 'GUEST' | 'DEPENDENT'
    memberId?: string
    guestName?: string
    guestEmail?: string
    guestPhone?: string
    cartType?: 'WALKING' | 'SINGLE' | 'SHARED'
    sharedWithPosition?: number
    caddyId?: string
  }[]
  notes?: string
}

/**
 * Create a new golf booking
 */
export async function createGolfBooking(
  input: CreateGolfBookingInput
): Promise<{ success: boolean; bookingId?: string; error?: string }> {
  try {
    const client = getServerClient()

    const result = await client.request<{
      createTeeTime: TeeTimeResponse
    }>(CreateTeeTimeDocument, {
      input: {
        courseId: input.courseId,
        teeDate: new Date(input.teeDate).toISOString(),
        teeTime: input.teeTime,
        holes: input.holes || 18,
        players: input.players,
        notes: input.notes,
      },
    })

    return {
      success: true,
      bookingId: result.createTeeTime.id,
    }
  } catch (error) {
    console.error('Error creating golf booking:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create booking',
    }
  }
}

/**
 * Cancel a golf booking
 */
export async function cancelGolfBooking(
  id: string,
  reason?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const client = getServerClient()

    await client.request<{ cancelTeeTime: { message: string } }>(
      CancelTeeTimeDocument,
      { id, reason }
    )

    return { success: true }
  } catch (error) {
    console.error('Error cancelling golf booking:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to cancel booking',
    }
  }
}
