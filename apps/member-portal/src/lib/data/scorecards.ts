import { cache } from 'react'
import { prisma, getMemberId } from '@/lib/db'

export const getScorecards = cache(async () => {
  const memberId = await getMemberId()

  const scorecards = await prisma.scorecard.findMany({
    where: { memberId },
    include: {
      course: { select: { name: true, par: true, holes: true } },
    },
    orderBy: { playedAt: 'desc' },
    take: 20,
  })

  return scorecards.map((sc) => ({
    id: sc.id,
    playedAt: sc.playedAt,
    courseName: sc.course.name,
    coursePar: sc.course.par,
    courseHoles: sc.course.holes,
    totalScore: sc.totalScore,
    totalPutts: sc.totalPutts,
    fairwaysHit: sc.fairwaysHit,
    greensInReg: sc.greensInReg,
    weather: sc.weather,
    scoreToPar: sc.totalScore - sc.course.par,
  }))
})

export const getScorecardById = cache(async (id: string) => {
  const memberId = await getMemberId()

  const scorecard = await prisma.scorecard.findUnique({
    where: { id },
    include: {
      course: { select: { name: true, par: true, holes: true } },
      holes: { orderBy: { holeNumber: 'asc' } },
    },
  })

  if (!scorecard || scorecard.memberId !== memberId) return null

  return {
    id: scorecard.id,
    playedAt: scorecard.playedAt,
    courseName: scorecard.course.name,
    coursePar: scorecard.course.par,
    courseHoles: scorecard.course.holes,
    totalScore: scorecard.totalScore,
    totalPutts: scorecard.totalPutts,
    fairwaysHit: scorecard.fairwaysHit,
    greensInReg: scorecard.greensInReg,
    weather: scorecard.weather,
    notes: scorecard.notes,
    scoreToPar: scorecard.totalScore - scorecard.course.par,
    holes: scorecard.holes.map((h) => ({
      holeNumber: h.holeNumber,
      par: h.par,
      strokes: h.strokes,
      putts: h.putts,
      fairwayHit: h.fairwayHit,
      greenInReg: h.greenInReg,
    })),
  }
})

export const getScorecardStats = cache(async () => {
  const memberId = await getMemberId()

  // Use database aggregation instead of fetching all scorecards
  const [aggregate, trendData] = await Promise.all([
    prisma.scorecard.aggregate({
      where: { memberId },
      _count: true,
      _min: { totalScore: true },
      _avg: { totalScore: true, totalPutts: true },
    }),
    // Only fetch last 10 for trend (not all scorecards)
    prisma.scorecard.findMany({
      where: { memberId },
      select: {
        playedAt: true,
        totalScore: true,
        course: { select: { par: true } },
      },
      orderBy: { playedAt: 'desc' },
      take: 10,
    }),
  ])

  if (aggregate._count === 0) {
    return { roundsPlayed: 0, bestScore: null, averageScore: null, averagePutts: null, scoreTrend: [] }
  }

  const scoreTrend = trendData.reverse().map((s) => ({
    date: s.playedAt,
    score: s.totalScore,
    par: s.course.par,
  }))

  return {
    roundsPlayed: aggregate._count,
    bestScore: aggregate._min.totalScore,
    averageScore: aggregate._avg.totalScore
      ? Math.round(aggregate._avg.totalScore * 10) / 10
      : null,
    averagePutts: aggregate._avg.totalPutts
      ? Math.round(aggregate._avg.totalPutts * 10) / 10
      : null,
    scoreTrend,
  }
})
