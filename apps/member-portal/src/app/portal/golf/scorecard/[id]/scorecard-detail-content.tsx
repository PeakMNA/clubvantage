'use client'

import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { ArrowLeft, Cloud, Sun, Flag } from 'lucide-react'
import { cn } from '@clubvantage/ui'

interface HoleScore {
  holeNumber: number
  par: number
  strokes: number
  putts: number | null
  fairwayHit: boolean | null
  greenInReg: boolean | null
}

interface ScorecardDetail {
  id: string
  playedAt: Date
  courseName: string
  coursePar: number
  courseHoles: number
  totalScore: number
  totalPutts: number | null
  fairwaysHit: number | null
  greensInReg: number | null
  weather: string | null
  notes: string | null
  scoreToPar: number
  holes: HoleScore[]
}

function formatScoreToPar(diff: number) {
  if (diff === 0) return 'E'
  return diff > 0 ? `+${diff}` : `${diff}`
}

function getScoreLabel(strokes: number, par: number) {
  const diff = strokes - par
  if (diff <= -2) return 'Eagle'
  if (diff === -1) return 'Birdie'
  if (diff === 0) return 'Par'
  if (diff === 1) return 'Bogey'
  if (diff === 2) return 'Double'
  return 'Triple+'
}

function getScoreColor(strokes: number, par: number) {
  const diff = strokes - par
  if (diff <= -2) return 'bg-amber-500 text-white'
  if (diff === -1) return 'bg-emerald-500 text-white'
  if (diff === 0) return 'bg-stone-100 text-stone-700'
  if (diff === 1) return 'bg-blue-100 text-blue-700'
  return 'bg-red-100 text-red-700'
}

export function ScorecardDetailContent({ scorecard }: { scorecard: ScorecardDetail }) {
  const router = useRouter()
  const frontNine = scorecard.holes.filter((h) => h.holeNumber <= 9)
  const backNine = scorecard.holes.filter((h) => h.holeNumber > 9)
  const frontScore = frontNine.reduce((sum, h) => sum + h.strokes, 0)
  const backScore = backNine.reduce((sum, h) => sum + h.strokes, 0)
  const frontPar = frontNine.reduce((sum, h) => sum + h.par, 0)
  const backPar = backNine.reduce((sum, h) => sum + h.par, 0)

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
          <h1 className="text-base font-semibold text-stone-900">Scorecard</h1>
          <div className="w-9" />
        </div>
      </div>

      <div className="px-5 py-6 space-y-6 pb-36">
        {/* Round Summary */}
        <div className="rounded-2xl p-5 card-glass shadow-lg shadow-stone-200/30 text-center">
          <p className="text-sm text-stone-500">{scorecard.courseName}</p>
          <p className="text-4xl font-bold text-stone-900 mt-1">{scorecard.totalScore}</p>
          <p className={cn(
            'text-lg font-semibold mt-0.5',
            scorecard.scoreToPar <= 0 ? 'text-emerald-600' : 'text-amber-600'
          )}>
            {formatScoreToPar(scorecard.scoreToPar)}
          </p>
          <p className="text-xs text-stone-500 mt-2">
            {format(new Date(scorecard.playedAt), 'EEEE, MMMM d, yyyy')}
            {scorecard.weather && ` · ${scorecard.weather}`}
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3">
          {scorecard.totalPutts != null && (
            <div className="rounded-xl p-3 bg-white/80 border border-stone-100 text-center">
              <p className="text-xs text-stone-500">Putts</p>
              <p className="text-lg font-bold text-stone-900">{scorecard.totalPutts}</p>
            </div>
          )}
          {scorecard.fairwaysHit != null && (
            <div className="rounded-xl p-3 bg-white/80 border border-stone-100 text-center">
              <p className="text-xs text-stone-500">FIR</p>
              <p className="text-lg font-bold text-stone-900">{scorecard.fairwaysHit}/14</p>
            </div>
          )}
          {scorecard.greensInReg != null && (
            <div className="rounded-xl p-3 bg-white/80 border border-stone-100 text-center">
              <p className="text-xs text-stone-500">GIR</p>
              <p className="text-lg font-bold text-stone-900">{scorecard.greensInReg}/18</p>
            </div>
          )}
        </div>

        {/* Hole-by-Hole Scorecard */}
        <section>
          <h2 className="text-base font-semibold text-stone-900 mb-4">Hole by Hole</h2>

          {/* Front 9 */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-stone-500">FRONT 9</p>
              <p className="text-xs font-semibold text-stone-700">
                {frontScore} ({formatScoreToPar(frontScore - frontPar)})
              </p>
            </div>
            <div className="rounded-xl border border-stone-100 overflow-hidden">
              {/* Header */}
              <div className="grid grid-cols-[2.5rem_1fr_2.5rem_2.5rem] bg-stone-50 px-3 py-2">
                <span className="text-[10px] font-semibold text-stone-500">Hole</span>
                <span className="text-[10px] font-semibold text-stone-500">Par</span>
                <span className="text-[10px] font-semibold text-stone-500 text-center">Score</span>
                <span className="text-[10px] font-semibold text-stone-500 text-center">Putts</span>
              </div>
              {frontNine.map((hole) => (
                <div key={hole.holeNumber} className="grid grid-cols-[2.5rem_1fr_2.5rem_2.5rem] px-3 py-2 border-t border-stone-50 items-center">
                  <span className="text-sm font-medium text-stone-700">{hole.holeNumber}</span>
                  <span className="text-sm text-stone-500">{hole.par}</span>
                  <div className="flex justify-center">
                    <span className={cn(
                      'w-7 h-7 flex items-center justify-center rounded-full text-sm font-bold',
                      getScoreColor(hole.strokes, hole.par)
                    )}>
                      {hole.strokes}
                    </span>
                  </div>
                  <span className="text-sm text-stone-500 text-center">{hole.putts ?? '—'}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Back 9 */}
          {backNine.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-stone-500">BACK 9</p>
                <p className="text-xs font-semibold text-stone-700">
                  {backScore} ({formatScoreToPar(backScore - backPar)})
                </p>
              </div>
              <div className="rounded-xl border border-stone-100 overflow-hidden">
                <div className="grid grid-cols-[2.5rem_1fr_2.5rem_2.5rem] bg-stone-50 px-3 py-2">
                  <span className="text-[10px] font-semibold text-stone-500">Hole</span>
                  <span className="text-[10px] font-semibold text-stone-500">Par</span>
                  <span className="text-[10px] font-semibold text-stone-500 text-center">Score</span>
                  <span className="text-[10px] font-semibold text-stone-500 text-center">Putts</span>
                </div>
                {backNine.map((hole) => (
                  <div key={hole.holeNumber} className="grid grid-cols-[2.5rem_1fr_2.5rem_2.5rem] px-3 py-2 border-t border-stone-50 items-center">
                    <span className="text-sm font-medium text-stone-700">{hole.holeNumber}</span>
                    <span className="text-sm text-stone-500">{hole.par}</span>
                    <div className="flex justify-center">
                      <span className={cn(
                        'w-7 h-7 flex items-center justify-center rounded-full text-sm font-bold',
                        getScoreColor(hole.strokes, hole.par)
                      )}>
                        {hole.strokes}
                      </span>
                    </div>
                    <span className="text-sm text-stone-500 text-center">{hole.putts ?? '—'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Score Distribution */}
        <section>
          <h2 className="text-base font-semibold text-stone-900 mb-4">Score Distribution</h2>
          <div className="flex gap-2 justify-center flex-wrap">
            {[
              { label: 'Eagle', count: scorecard.holes.filter((h) => h.strokes - h.par <= -2).length, color: 'bg-amber-500 text-white' },
              { label: 'Birdie', count: scorecard.holes.filter((h) => h.strokes - h.par === -1).length, color: 'bg-emerald-500 text-white' },
              { label: 'Par', count: scorecard.holes.filter((h) => h.strokes === h.par).length, color: 'bg-stone-100 text-stone-700' },
              { label: 'Bogey', count: scorecard.holes.filter((h) => h.strokes - h.par === 1).length, color: 'bg-blue-100 text-blue-700' },
              { label: 'Double+', count: scorecard.holes.filter((h) => h.strokes - h.par >= 2).length, color: 'bg-red-100 text-red-700' },
            ].filter((d) => d.count > 0).map((dist) => (
              <div key={dist.label} className="flex flex-col items-center gap-1">
                <span className={cn('w-10 h-10 flex items-center justify-center rounded-full text-sm font-bold', dist.color)}>
                  {dist.count}
                </span>
                <span className="text-[10px] font-medium text-stone-500">{dist.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Notes */}
        {scorecard.notes && (
          <section>
            <h2 className="text-base font-semibold text-stone-900 mb-2">Notes</h2>
            <p className="text-sm text-stone-600 leading-relaxed">{scorecard.notes}</p>
          </section>
        )}
      </div>
    </div>
  )
}
