'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { ArrowLeft, ChevronRight, TrendingDown, TrendingUp, Target, Flag } from 'lucide-react'
import { cn } from '@clubvantage/ui'

interface ScorecardSummary {
  id: string
  playedAt: Date
  courseName: string
  coursePar: number
  totalScore: number
  totalPutts: number | null
  weather: string | null
  scoreToPar: number
}

interface Stats {
  roundsPlayed: number
  bestScore: number | null
  averageScore: number | null
  averagePutts: number | null
  scoreTrend: { date: Date; score: number; par: number }[]
}

function formatScoreToPar(diff: number) {
  if (diff === 0) return 'E'
  return diff > 0 ? `+${diff}` : `${diff}`
}

export function ScorecardListContent({
  scorecards,
  stats,
}: {
  scorecards: ScorecardSummary[]
  stats: Stats
}) {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-stone-100">
        <div className="flex items-center justify-between px-5 py-3 pt-safe">
          <button
            onClick={() => router.back()}
            className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-stone-50 -ml-1"
          >
            <ArrowLeft className="h-5 w-5 text-stone-700" />
          </button>
          <h1 className="text-base font-semibold text-stone-900">Scorecards</h1>
          <div className="w-9" />
        </div>
      </div>

      <div className="px-5 py-6 space-y-8 pb-36">
        {/* Stats Cards */}
        {stats.roundsPlayed > 0 && (
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl p-4 bg-white/80 border border-stone-100">
              <p className="text-xs text-stone-500 font-medium">Rounds Played</p>
              <p className="text-2xl font-bold text-stone-900 mt-1">{stats.roundsPlayed}</p>
            </div>
            <div className="rounded-xl p-4 bg-white/80 border border-stone-100">
              <p className="text-xs text-stone-500 font-medium">Best Score</p>
              <p className="text-2xl font-bold text-stone-900 mt-1">{stats.bestScore}</p>
            </div>
            <div className="rounded-xl p-4 bg-white/80 border border-stone-100">
              <p className="text-xs text-stone-500 font-medium">Avg Score</p>
              <p className="text-2xl font-bold text-stone-900 mt-1">{stats.averageScore}</p>
            </div>
            <div className="rounded-xl p-4 bg-white/80 border border-stone-100">
              <p className="text-xs text-stone-500 font-medium">Avg Putts</p>
              <p className="text-2xl font-bold text-stone-900 mt-1">{stats.averagePutts ?? '—'}</p>
            </div>
          </div>
        )}

        {/* Score Trend */}
        {stats.scoreTrend.length > 1 && (
          <section>
            <h2 className="text-base font-semibold text-stone-900 mb-4">Score Trend</h2>
            <div className="flex items-end gap-1.5 h-24">
              {stats.scoreTrend.map((point, i) => {
                const maxScore = Math.max(...stats.scoreTrend.map((p) => p.score))
                const minScore = Math.min(...stats.scoreTrend.map((p) => p.score))
                const range = maxScore - minScore || 1
                const height = ((point.score - minScore) / range) * 70 + 30
                const isUnderPar = point.score <= point.par
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[9px] font-medium text-stone-500">{point.score}</span>
                    <div
                      className={cn(
                        'w-full rounded-t-md transition-all',
                        isUnderPar ? 'bg-emerald-500' : 'bg-amber-500'
                      )}
                      style={{ height: `${height}%` }}
                    />
                  </div>
                )
              })}
            </div>
            <div className="flex items-center gap-4 mt-2 justify-center">
              <span className="flex items-center gap-1 text-[10px] text-stone-500">
                <div className="w-2 h-2 rounded-full bg-emerald-500" /> At/Under Par
              </span>
              <span className="flex items-center gap-1 text-[10px] text-stone-500">
                <div className="w-2 h-2 rounded-full bg-amber-500" /> Over Par
              </span>
            </div>
          </section>
        )}

        {/* Round List */}
        <section>
          <h2 className="text-base font-semibold text-stone-900 mb-4">Recent Rounds</h2>
          <div className="space-y-2">
            {scorecards.map((sc) => (
              <Link
                key={sc.id}
                href={`/portal/golf/scorecard/${sc.id}`}
                className="flex items-center gap-3 p-3 rounded-xl bg-white/80 border border-stone-100 active:opacity-70 transition-opacity"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-stone-50 flex-shrink-0">
                  <Flag className="h-5 w-5 text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-medium text-stone-900">
                    {sc.courseName}
                  </p>
                  <p className="text-xs text-stone-500 mt-0.5">
                    {format(new Date(sc.playedAt), 'MMM d, yyyy')}
                    {sc.weather && ` · ${sc.weather}`}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="text-right">
                    <p className="text-lg font-bold text-stone-900">{sc.totalScore}</p>
                    <p className={cn(
                      'text-xs font-semibold',
                      sc.scoreToPar <= 0 ? 'text-emerald-600' : 'text-amber-600'
                    )}>
                      {formatScoreToPar(sc.scoreToPar)}
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-stone-300" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Empty State */}
        {scorecards.length === 0 && (
          <div className="text-center py-16">
            <Target className="h-10 w-10 text-stone-300 mx-auto mb-3" />
            <p className="text-stone-500 text-sm">No scorecards yet</p>
            <p className="text-stone-400 text-xs mt-1">Your round scores will appear here</p>
          </div>
        )}
      </div>
    </div>
  )
}
