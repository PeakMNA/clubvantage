'use server'

import { getSession } from '@/lib/auth/session'
import { prisma } from '@/lib/db'

import type {
  TeeTimeBooking,
  BookingPlayer,
  GolfTimeSlot,
  PortalCourse,
} from '@/lib/types'

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

// ============================================================================
// FETCH ACTIONS
// ============================================================================

/**
 * Fetch all available golf courses
 * Uses direct Prisma query (the GraphQL API requires a JWT the portal doesn't have)
 */
export async function fetchMyCourses(): Promise<PortalCourse[]> {
  try {
    const session = await getSession()
    if (!session.isLoggedIn || !session.clubId) return []

    const courses = await prisma.golfCourse.findMany({
      where: { clubId: session.clubId, isActive: true },
      orderBy: { sortOrder: 'asc' },
    })

    return courses.map((c) => ({
      id: c.id,
      name: c.name,
      enable18HoleBooking: c.holes >= 18,
      advanceBookingDays: c.memberAdvanceDays ?? 14,
    }))
  } catch (error) {
    console.error('Error fetching courses:', error)
    return []
  }
}

/**
 * Fetch tee sheet for a specific course and date
 * Generates time slots from course config and marks booked ones
 */
export async function fetchTeeSheet(
  courseId: string,
  date: Date
): Promise<GolfTimeSlot[]> {
  try {
    const session = await getSession()
    if (!session.isLoggedIn || !session.clubId) return []

    const course = await prisma.golfCourse.findFirst({
      where: { id: courseId, clubId: session.clubId, isActive: true },
    })
    if (!course) return []

    // Fetch green fee rate for this course
    const rateConfig = await prisma.golfRateConfig.findFirst({
      where: {
        courseId,
        isActive: true,
        effectiveFrom: { lte: new Date() },
        OR: [{ effectiveTo: null }, { effectiveTo: { gte: new Date() } }],
      },
      include: {
        greenFeeRates: {
          where: { playerType: 'MEMBER', holes: 18 },
          take: 1,
        },
      },
      orderBy: { effectiveFrom: 'desc' },
    })
    const greenFeePrice = rateConfig?.greenFeeRates[0]
      ? Number(rateConfig.greenFeeRates[0].amount)
      : 0

    // Fetch existing bookings for this date
    const teeDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    const bookedTimes = await prisma.teeTime.findMany({
      where: {
        courseId,
        teeDate,
        status: { notIn: ['CANCELLED'] },
      },
      select: {
        teeTime: true,
        _count: { select: { players: true } },
      },
    })
    const bookedMap = new Map(
      bookedTimes.map((t) => [t.teeTime, t._count.players])
    )

    // Generate slots from firstTeeTime to lastTeeTime
    const slots: GolfTimeSlot[] = []
    const [startH, startM] = course.firstTeeTime.split(':').map(Number)
    const [endH, endM] = course.lastTeeTime.split(':').map(Number)
    const startMinutes = startH * 60 + startM
    const endMinutes = endH * 60 + endM
    const interval = course.teeInterval || 8

    for (let min = startMinutes; min <= endMinutes; min += interval) {
      const h = Math.floor(min / 60)
      const m = min % 60
      const time = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
      const playersBooked = bookedMap.get(time) ?? 0
      slots.push({
        time,
        available: playersBooked < (course.maxPlayers || 4),
        price: greenFeePrice,
        holes: '18',
      })
    }

    return slots
  } catch (error) {
    console.error('Error fetching tee sheet:', error)
    return []
  }
}

/**
 * Fetch member's golf bookings
 * Uses direct Prisma query filtered by the logged-in member's tee time players
 */
export async function fetchMyGolfBookings(
  status?: 'upcoming' | 'past'
): Promise<TeeTimeBooking[]> {
  try {
    const session = await getSession()
    if (!session.isLoggedIn || !session.memberId || !session.clubId) return []

    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    const teeTimes = await prisma.teeTime.findMany({
      where: {
        clubId: session.clubId,
        players: { some: { memberId: session.memberId } },
        ...(status === 'upcoming' ? { teeDate: { gte: today } } : {}),
        ...(status === 'past' ? { teeDate: { lt: today } } : {}),
      },
      include: {
        course: { select: { id: true, name: true, holes: true, par: true } },
        players: {
          include: {
            member: { select: { id: true, firstName: true, lastName: true, memberId: true } },
            dependent: { select: { id: true, firstName: true, lastName: true } },
          },
          orderBy: { position: 'asc' },
        },
      },
      orderBy: [
        { teeDate: status === 'past' ? 'desc' : 'asc' },
        { teeTime: status === 'past' ? 'desc' : 'asc' },
      ],
      take: 50,
    })

    return teeTimes.map((tt) => {
      const players: BookingPlayer[] = tt.players.map((p) => {
        let name = p.guestName ?? 'Unknown'
        let playerMemberId: string | undefined
        if (p.member) {
          name = `${p.member.firstName} ${p.member.lastName}`
          playerMemberId = p.member.memberId
        } else if (p.dependent) {
          name = `${p.dependent.firstName} ${p.dependent.lastName}`
        }
        return {
          id: p.id,
          name,
          type: mapPlayerType(p.playerType),
          memberId: playerMemberId,
          email: p.guestEmail ?? undefined,
          phone: p.guestPhone ?? undefined,
        }
      })

      // Sum actual fees from player records
      const totalGreenFees = tt.players.reduce((sum, p) => sum + Number(p.greenFee ?? 0), 0)
      const totalCartFees = tt.players.reduce((sum, p) => sum + Number(p.cartFee ?? 0), 0)
      const totalCaddyFees = tt.players.reduce((sum, p) => sum + Number(p.caddyFee ?? 0), 0)
      const totalPrice = totalGreenFees + totalCartFees + totalCaddyFees
      const hasCart = tt.players.some((p) => p.cartType !== 'WALKING')
      const hasCaddy = tt.players.some((p) => p.caddyStatus !== 'NONE')

      const priceBreakdown: { label: string; amount: number }[] = []
      if (totalGreenFees > 0) {
        priceBreakdown.push({ label: `Green Fee (${players.length} player${players.length > 1 ? 's' : ''})`, amount: totalGreenFees })
      }
      if (totalCartFees > 0) {
        priceBreakdown.push({ label: 'Cart Fee', amount: totalCartFees })
      }
      if (totalCaddyFees > 0) {
        priceBreakdown.push({ label: 'Caddy Fee', amount: totalCaddyFees })
      }

      const dateStr =
        tt.teeDate instanceof Date
          ? tt.teeDate.toISOString().split('T')[0]!
          : String(tt.teeDate).split('T')[0]!

      const teeDate = tt.teeDate instanceof Date ? tt.teeDate : new Date(String(tt.teeDate))
      const cancellationDeadline = new Date(teeDate)
      cancellationDeadline.setHours(cancellationDeadline.getHours() - 24)

      return {
        id: tt.id,
        date: dateStr,
        time: tt.teeTime,
        courseName: tt.course?.name ?? 'Unknown Course',
        courseId: tt.course?.id ?? '',
        roundType: (tt.holes === 9 ? '9-hole' : '18-hole') as '9-hole' | '18-hole',
        status: mapBookingStatus(tt.status),
        players,
        cart: hasCart,
        caddy: hasCaddy ? 'shared' as const : 'none' as const,
        totalPrice,
        priceBreakdown,
        cancellationPolicy: {
          fullRefundBefore: cancellationDeadline.toISOString(),
          partialRefundBefore: teeDate.toISOString(),
          noRefundAfter: teeDate.toISOString(),
          partialRefundPercent: 50,
        },
        createdAt: tt.createdAt.toISOString(),
      }
    })
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
    const session = await getSession()
    if (!session.isLoggedIn || !session.clubId || !session.memberId) return null

    const tt = await prisma.teeTime.findFirst({
      where: {
        id,
        clubId: session.clubId,
        players: { some: { memberId: session.memberId } },
      },
      include: {
        course: { select: { id: true, name: true, holes: true, par: true } },
        players: {
          include: {
            member: { select: { id: true, firstName: true, lastName: true, memberId: true } },
            dependent: { select: { id: true, firstName: true, lastName: true } },
          },
          orderBy: { position: 'asc' },
        },
      },
    })

    if (!tt) return null

    const players: BookingPlayer[] = tt.players.map((p) => {
      let name = p.guestName ?? 'Unknown'
      let playerMemberId: string | undefined
      if (p.member) {
        name = `${p.member.firstName} ${p.member.lastName}`
        playerMemberId = p.member.memberId
      } else if (p.dependent) {
        name = `${p.dependent.firstName} ${p.dependent.lastName}`
      }
      return {
        id: p.id,
        name,
        type: mapPlayerType(p.playerType),
        memberId: playerMemberId,
        email: p.guestEmail ?? undefined,
        phone: p.guestPhone ?? undefined,
      }
    })

    // Sum actual fees from player records
    const totalGreenFees = tt.players.reduce((sum, p) => sum + Number(p.greenFee ?? 0), 0)
    const totalCartFees = tt.players.reduce((sum, p) => sum + Number(p.cartFee ?? 0), 0)
    const totalCaddyFees = tt.players.reduce((sum, p) => sum + Number(p.caddyFee ?? 0), 0)
    const totalPrice = totalGreenFees + totalCartFees + totalCaddyFees
    const hasCart = tt.players.some((p) => p.cartType !== 'WALKING')
    const hasCaddy = tt.players.some((p) => p.caddyStatus !== 'NONE')

    const priceBreakdown: { label: string; amount: number }[] = []
    if (totalGreenFees > 0) {
      priceBreakdown.push({ label: `Green Fee (${players.length} player${players.length > 1 ? 's' : ''})`, amount: totalGreenFees })
    }
    if (totalCartFees > 0) {
      priceBreakdown.push({ label: 'Cart Fee', amount: totalCartFees })
    }
    if (totalCaddyFees > 0) {
      priceBreakdown.push({ label: 'Caddy Fee', amount: totalCaddyFees })
    }

    const dateStr =
      tt.teeDate instanceof Date
        ? tt.teeDate.toISOString().split('T')[0]!
        : String(tt.teeDate).split('T')[0]!

    const teeDate = tt.teeDate instanceof Date ? tt.teeDate : new Date(String(tt.teeDate))
    const cancellationDeadline = new Date(teeDate)
    cancellationDeadline.setHours(cancellationDeadline.getHours() - 24)

    return {
      id: tt.id,
      date: dateStr,
      time: tt.teeTime,
      courseName: tt.course?.name ?? 'Unknown Course',
      courseId: tt.course?.id ?? '',
      roundType: (tt.holes === 9 ? '9-hole' : '18-hole') as '9-hole' | '18-hole',
      status: mapBookingStatus(tt.status),
      players,
      cart: hasCart,
      caddy: hasCaddy ? 'shared' as const : 'none' as const,
      totalPrice,
      priceBreakdown,
      cancellationPolicy: {
        fullRefundBefore: cancellationDeadline.toISOString(),
        partialRefundBefore: teeDate.toISOString(),
        noRefundAfter: teeDate.toISOString(),
        partialRefundPercent: 50,
      },
      createdAt: tt.createdAt.toISOString(),
    }
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
    const session = await getSession()
    if (!session.isLoggedIn || !session.memberId) return []

    const dependents = await prisma.dependent.findMany({
      where: { memberId: session.memberId, isActive: true },
    })

    return dependents.map((d) => ({
      id: d.id,
      name: `${d.firstName} ${d.lastName}`,
      type: 'dependent' as const,
      email: d.email ?? undefined,
      phone: d.phone ?? undefined,
    }))
  } catch (error) {
    console.error('Error fetching dependents:', error)
    return []
  }
}

/**
 * Fetch current logged-in member info for booking forms
 */
export async function fetchCurrentMember(): Promise<{
  id: string
  name: string
  memberId: string
} | null> {
  try {
    const session = await getSession()
    if (!session.isLoggedIn || !session.memberId) return null

    const member = await prisma.member.findUnique({
      where: { id: session.memberId },
      select: { id: true, firstName: true, lastName: true, memberId: true },
    })

    if (!member) return null

    return {
      id: member.id,
      name: `${member.firstName} ${member.lastName}`,
      memberId: member.memberId,
    }
  } catch (error) {
    console.error('Error fetching current member:', error)
    return null
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
 * Uses direct Prisma — generates teeTimeNumber, validates slot, creates tee time + players
 */
export async function createGolfBooking(
  input: CreateGolfBookingInput
): Promise<{ success: boolean; bookingId?: string; error?: string }> {
  try {
    const session = await getSession()
    if (!session.isLoggedIn || !session.clubId || !session.memberId) {
      return { success: false, error: 'Not authenticated' }
    }

    // Validate course belongs to this club
    const course = await prisma.golfCourse.findFirst({
      where: { id: input.courseId, clubId: session.clubId, isActive: true },
    })
    if (!course) {
      return { success: false, error: 'Course not found' }
    }

    // Check slot availability
    const teeDate = new Date(input.teeDate + 'T00:00:00')
    const existingPlayers = await prisma.teeTimePlayer.count({
      where: {
        teeTime: {
          courseId: input.courseId,
          teeDate,
          teeTime: input.teeTime,
          status: { notIn: ['CANCELLED'] },
        },
      },
    })

    const maxPlayers = course.maxPlayers || 4
    if (existingPlayers + input.players.length > maxPlayers) {
      const available = maxPlayers - existingPlayers
      return {
        success: false,
        error: available > 0
          ? `Only ${available} position${available === 1 ? '' : 's'} available`
          : 'This tee time is fully booked',
      }
    }

    // Generate tee time number (TT-YYYY-NNNNN)
    const year = new Date().getFullYear()
    const lastTeeTime = await prisma.teeTime.findFirst({
      where: {
        clubId: session.clubId,
        teeTimeNumber: { startsWith: `TT-${year}` },
      },
      orderBy: { teeTimeNumber: 'desc' },
    })
    const nextNumber = lastTeeTime
      ? parseInt(lastTeeTime.teeTimeNumber.split('-')[2] ?? '0', 10) + 1
      : 1
    const teeTimeNumber = `TT-${year}-${nextNumber.toString().padStart(5, '0')}`

    const teeTime = await prisma.teeTime.create({
      data: {
        clubId: session.clubId,
        teeTimeNumber,
        courseId: input.courseId,
        teeDate,
        teeTime: input.teeTime,
        holes: input.holes || 18,
        status: 'CONFIRMED',
        confirmedAt: new Date(),
        notes: input.notes,
        players: {
          create: input.players.map((p) => ({
            position: p.position,
            playerType: p.playerType,
            memberId: p.playerType === 'MEMBER' ? p.memberId : null,
            guestName: p.guestName,
            guestEmail: p.guestEmail,
            guestPhone: p.guestPhone,
            cartType: p.cartType || 'WALKING',
            sharedWithPosition: p.sharedWithPosition,
            caddyId: p.caddyId,
          })),
        },
      },
    })

    return { success: true, bookingId: teeTime.id }
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
 * Uses direct Prisma — validates ownership and updates status
 */
export async function cancelGolfBooking(
  id: string,
  reason?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getSession()
    if (!session.isLoggedIn || !session.clubId || !session.memberId) {
      return { success: false, error: 'Not authenticated' }
    }

    // Verify the tee time belongs to this club and the member is a player
    const teeTime = await prisma.teeTime.findFirst({
      where: {
        id,
        clubId: session.clubId,
        players: { some: { memberId: session.memberId } },
      },
    })

    if (!teeTime) {
      return { success: false, error: 'Booking not found' }
    }

    if (teeTime.status === 'CANCELLED') {
      return { success: false, error: 'Booking is already cancelled' }
    }

    await prisma.teeTime.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        cancelReason: reason ?? 'Cancelled by member',
        cancelledAt: new Date(),
        cancelledBy: session.userId,
      },
    })

    return { success: true }
  } catch (error) {
    console.error('Error cancelling golf booking:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to cancel booking',
    }
  }
}
