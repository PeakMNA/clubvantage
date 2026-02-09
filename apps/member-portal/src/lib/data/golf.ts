import { cache } from 'react'
import { prisma, getClubId, getMemberId } from '@/lib/db'

export const getGolfCourses = cache(async () => {
  const clubId = await getClubId()
  const courses = await prisma.golfCourse.findMany({
    where: { clubId, isActive: true },
    orderBy: { sortOrder: 'asc' },
  })

  return courses.map((c) => ({
    id: c.id,
    name: c.name,
    holes: c.holes,
    par: c.par,
    yardage: c.yardage,
    imageUrl: c.imageUrl,
  }))
})

export const getAvailableTeeTimes = cache(async (date: string) => {
  const clubId = await getClubId()
  const teeTimes = await prisma.teeTime.findMany({
    where: {
      clubId,
      teeDate: new Date(date),
    },
    select: {
      id: true,
      teeTime: true,
      teeDate: true,
      holes: true,
      status: true,
      courseId: true,
      course: { select: { name: true, holes: true, par: true } },
      _count: { select: { players: true } },
    },
    orderBy: { teeTime: 'asc' },
  })

  // Fetch green fee rates for courses on this date
  const courseIds = [...new Set(teeTimes.map((t) => t.courseId))]
  const rateConfigs = courseIds.length > 0
    ? await prisma.golfRateConfig.findMany({
        where: {
          courseId: { in: courseIds },
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
    : []
  const priceMap = new Map<string, number>()
  for (const rc of rateConfigs) {
    if (!priceMap.has(rc.courseId) && rc.greenFeeRates[0]) {
      priceMap.set(rc.courseId, Number(rc.greenFeeRates[0].amount))
    }
  }

  return teeTimes.map((t) => ({
    id: t.id,
    time: t.teeTime,
    date: t.teeDate,
    courseName: t.course.name,
    holes: t.holes,
    status: t.status,
    spotsBooked: t._count.players,
    maxSpots: 4,
    price: priceMap.get(t.courseId) ?? 2400,
  }))
})

export const getUpcomingTeeTimes = cache(async () => {
  const clubId = await getClubId()
  const memberId = await getMemberId()
  const teeTimes = await prisma.teeTime.findMany({
    where: {
      clubId,
      teeDate: { gte: new Date() },
      status: { in: ['CONFIRMED', 'PENDING'] },
      players: { some: { memberId } },
    },
    include: {
      course: { select: { name: true } },
      players: { select: { id: true } },
    },
    orderBy: [{ teeDate: 'asc' }, { teeTime: 'asc' }],
    take: 5,
  })

  return teeTimes.map((t) => ({
    id: t.id,
    date: t.teeDate,
    time: t.teeTime,
    courseName: t.course.name,
    status: t.status,
    playerCount: t.players.length,
  }))
})

export const getPastTeeTimes = cache(async () => {
  const clubId = await getClubId()
  const memberId = await getMemberId()
  const teeTimes = await prisma.teeTime.findMany({
    where: {
      clubId,
      teeDate: { lt: new Date() },
      players: { some: { memberId } },
    },
    include: {
      course: { select: { name: true } },
      players: { select: { id: true } },
    },
    orderBy: [{ teeDate: 'desc' }, { teeTime: 'desc' }],
    take: 10,
  })

  return teeTimes.map((t) => ({
    id: t.id,
    date: t.teeDate,
    time: t.teeTime,
    courseName: t.course.name,
    status: t.status,
    playerCount: t.players.length,
  }))
})

export const getTeeTimeById = cache(async (id: string) => {
  const clubId = await getClubId()
  const teeTime = await prisma.teeTime.findFirst({
    where: { id, clubId },
    include: {
      course: { select: { name: true, holes: true, par: true } },
      players: {
        include: {
          member: { select: { firstName: true, lastName: true } },
          dependent: { select: { firstName: true, lastName: true } },
        },
        orderBy: { position: 'asc' },
      },
    },
  })

  if (!teeTime) return null

  return {
    id: teeTime.id,
    date: teeTime.teeDate,
    time: teeTime.teeTime,
    holes: teeTime.holes,
    status: teeTime.status,
    courseName: teeTime.course.name,
    courseHoles: teeTime.course.holes,
    coursePar: teeTime.course.par,
    players: teeTime.players.map((p) => {
      let name = p.guestName ?? 'Unknown'
      let initials = '??'
      if (p.member) {
        name = `${p.member.firstName} ${p.member.lastName}`
        initials = `${p.member.firstName[0]}${p.member.lastName[0]}`
      } else if (p.dependent) {
        name = `${p.dependent.firstName} ${p.dependent.lastName}`
        initials = `${p.dependent.firstName[0]}${p.dependent.lastName[0]}`
      } else if (p.guestName) {
        const parts = p.guestName.split(' ')
        initials = parts.map((n) => n[0]).join('').slice(0, 2).toUpperCase()
      }
      return {
        id: p.id,
        position: p.position,
        playerType: p.playerType,
        name,
        initials,
        cartType: p.cartType,
        caddyRequest: p.caddyRequest,
        greenFee: p.greenFee ? Number(p.greenFee) : 0,
        cartFee: p.cartFee ? Number(p.cartFee) : 0,
        caddyFee: p.caddyFee ? Number(p.caddyFee) : 0,
      }
    }),
  }
})
