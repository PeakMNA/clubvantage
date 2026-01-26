'use client'

import { useState } from 'react'
import { cn } from '@clubvantage/ui'
import { Plus, User, Star, Settings, Calendar, Clock } from 'lucide-react'
import type { Caddy } from './types'

interface CaddiesTabProps {
  caddies: Caddy[]
  isLoading?: boolean
  onAddCaddy: () => void
  onEditCaddy: (caddy: Caddy) => void
  onViewSchedule: (caddy: Caddy) => void
}

type FilterStatus = 'all' | 'available' | 'assigned' | 'off-duty'
type FilterSkill = 'all' | 'beginner' | 'intermediate' | 'advanced' | 'expert'

function CaddyStatusBadge({ status }: { status: Caddy['status'] }) {
  const config = {
    available: { bg: 'bg-emerald-50 dark:bg-emerald-500/20 border-emerald-200/60 dark:border-emerald-500/30', text: 'text-emerald-700 dark:text-emerald-400', label: 'Available' },
    assigned: { bg: 'bg-blue-50 dark:bg-blue-500/20 border-blue-200/60 dark:border-blue-500/30', text: 'text-blue-700 dark:text-blue-400', label: 'Assigned' },
    'off-duty': { bg: 'bg-amber-50 dark:bg-amber-500/20 border-amber-200/60 dark:border-amber-500/30', text: 'text-amber-700 dark:text-amber-400', label: 'Off Duty' },
  }[status]

  return (
    <span className={cn('px-2.5 py-1 rounded-full text-xs font-medium border', config.bg, config.text)}>
      {config.label}
    </span>
  )
}

function SkillBadge({ level }: { level: Caddy['skillLevel'] }) {
  const config = {
    beginner: { bg: 'bg-muted border/60', text: 'text-muted-foreground', stars: 1 },
    intermediate: { bg: 'bg-blue-50 dark:bg-blue-500/20 border-blue-200/60 dark:border-blue-500/30', text: 'text-blue-600 dark:text-blue-400', stars: 2 },
    advanced: { bg: 'bg-violet-50 dark:bg-violet-500/20 border-violet-200/60 dark:border-violet-500/30', text: 'text-violet-600 dark:text-violet-400', stars: 3 },
    expert: { bg: 'bg-amber-50 dark:bg-amber-500/20 border-amber-200/60 dark:border-amber-500/30', text: 'text-amber-600 dark:text-amber-400', stars: 4 },
  }[level]

  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border text-xs font-medium capitalize', config.bg, config.text)}>
      {[...Array(config.stars)].map((_, i) => (
        <Star key={i} className="h-3 w-3 fill-current" />
      ))}
      {level}
    </span>
  )
}

function CaddyCard({
  caddy,
  onEdit,
  onViewSchedule,
}: {
  caddy: Caddy
  onEdit: () => void
  onViewSchedule: () => void
}) {
  return (
    <div className="relative overflow-hidden rounded-xl sm:rounded-2xl border border/60 bg-card/80 shadow-lg shadow-slate-200/30 dark:shadow-black/20 backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-black/30 group">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-muted/50 to-transparent pointer-events-none" />

      {/* Accent line - color based on status */}
      <div className={cn(
        'absolute left-0 top-0 h-1 w-full',
        caddy.status === 'available' && 'bg-gradient-to-r from-emerald-300 via-emerald-500 to-emerald-300',
        caddy.status === 'assigned' && 'bg-gradient-to-r from-blue-300 via-blue-500 to-blue-300',
        caddy.status === 'off-duty' && 'bg-gradient-to-r from-amber-300 via-amber-500 to-amber-300'
      )} />

      <div className="relative p-4 sm:p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              'flex h-10 w-10 items-center justify-center rounded-xl shadow-inner',
              caddy.status === 'available' && 'bg-gradient-to-br from-emerald-100 to-emerald-200/50',
              caddy.status === 'assigned' && 'bg-gradient-to-br from-blue-100 to-blue-200/50',
              caddy.status === 'off-duty' && 'bg-gradient-to-br from-amber-100 to-amber-200/50'
            )}>
              <User className={cn(
                'h-5 w-5',
                caddy.status === 'available' && 'text-emerald-600',
                caddy.status === 'assigned' && 'text-blue-600',
                caddy.status === 'off-duty' && 'text-amber-600'
              )} />
            </div>
            <div>
              <h3 className="text-lg font-bold tracking-tight text-foreground">{caddy.name}</h3>
              <SkillBadge level={caddy.skillLevel} />
            </div>
          </div>
          <CaddyStatusBadge status={caddy.status} />
        </div>

        {/* Details */}
        <div className="space-y-3 mb-4">
          {caddy.status === 'assigned' && caddy.currentAssignment && (
            <p className="text-sm text-blue-600 dark:text-blue-400 font-medium bg-blue-50/80 dark:bg-blue-500/10 px-3 py-2 rounded-lg border border-blue-100 dark:border-blue-500/30">
              Flight: {caddy.currentAssignment}
            </p>
          )}

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{caddy.experience} {caddy.experience === 1 ? 'year' : 'years'} experience</span>
          </div>

          {caddy.notes && (
            <p className="text-sm text-muted-foreground line-clamp-2 p-3 bg-muted/80 rounded-lg border border-border">
              {caddy.notes}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t border-border">
          <button
            onClick={onViewSchedule}
            className="flex-1 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-all duration-200 font-medium flex items-center justify-center gap-1.5"
          >
            <Calendar className="h-4 w-4" />
            Schedule
          </button>
          <button
            onClick={onEdit}
            className="flex-1 py-2.5 text-sm text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-xl transition-all duration-200 font-semibold"
          >
            Edit
          </button>
        </div>
      </div>
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="relative overflow-hidden rounded-xl sm:rounded-2xl border border/60 bg-card/80 p-4 sm:p-5 animate-pulse">
      <div className="absolute left-0 top-0 h-1 w-full bg-muted" />
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-muted rounded-xl" />
          <div className="space-y-2">
            <div className="h-5 w-24 bg-muted rounded" />
            <div className="h-5 w-20 bg-muted rounded-lg" />
          </div>
        </div>
        <div className="h-6 w-16 bg-muted rounded-full" />
      </div>
      <div className="h-8 w-32 bg-muted rounded-lg mb-4" />
      <div className="h-12 bg-muted rounded-xl" />
    </div>
  )
}

export function CaddiesTab({
  caddies,
  isLoading,
  onAddCaddy,
  onEditCaddy,
  onViewSchedule,
}: CaddiesTabProps) {
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all')
  const [skillFilter, setSkillFilter] = useState<FilterSkill>('all')

  const filteredCaddies = caddies.filter((caddy) => {
    const matchesStatus = statusFilter === 'all' || caddy.status === statusFilter
    const matchesSkill = skillFilter === 'all' || caddy.skillLevel === skillFilter
    return matchesStatus && matchesSkill
  })

  const availableCount = caddies.filter((c) => c.status === 'available').length

  const statusCounts = {
    all: caddies.length,
    available: caddies.filter((c) => c.status === 'available').length,
    assigned: caddies.filter((c) => c.status === 'assigned').length,
    'off-duty': caddies.filter((c) => c.status === 'off-duty').length,
  }

  const statusFilters: { id: FilterStatus; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'available', label: 'Available' },
    { id: 'assigned', label: 'Assigned' },
    { id: 'off-duty', label: 'Off Duty' },
  ]

  const skillFilters: { id: FilterSkill; label: string }[] = [
    { id: 'all', label: 'All Levels' },
    { id: 'beginner', label: 'Beginner' },
    { id: 'intermediate', label: 'Intermediate' },
    { id: 'advanced', label: 'Advanced' },
    { id: 'expert', label: 'Expert' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">Caddies</h2>
          <p className="text-sm text-muted-foreground">
            {caddies.length} {caddies.length === 1 ? 'caddy' : 'caddies'} ({availableCount} available)
          </p>
        </div>
        <button
          onClick={onAddCaddy}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-br from-slate-800 to-slate-900 text-white rounded-xl font-medium shadow-lg shadow-slate-900/20 hover:shadow-xl transition-all duration-300"
        >
          <Plus className="h-4 w-4" />
          Add Caddy
        </button>
      </div>

      {/* Filter Bars */}
      <div className="space-y-3">
        {/* Status Filter */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {statusFilters.map((f) => (
            <button
              key={f.id}
              onClick={() => setStatusFilter(f.id)}
              className={cn(
                'px-4 py-2 text-sm rounded-full border transition-all duration-200 whitespace-nowrap font-medium',
                statusFilter === f.id
                  ? 'bg-gradient-to-br from-slate-800 to-slate-900 text-white border-slate-800 shadow-lg shadow-slate-900/20'
                  : 'border text-muted-foreground hover:border-slate-300 hover:bg-muted'
              )}
            >
              {f.label} ({statusCounts[f.id]})
            </button>
          ))}
        </div>

        {/* Skill Filter */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {skillFilters.map((f) => (
            <button
              key={f.id}
              onClick={() => setSkillFilter(f.id)}
              className={cn(
                'px-3 py-1.5 text-sm rounded-full border transition-all duration-200 whitespace-nowrap',
                skillFilter === f.id
                  ? 'bg-muted text-foreground border-slate-300 font-medium'
                  : 'border text-muted-foreground hover:border-slate-300 hover:bg-muted'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filteredCaddies.length === 0 ? (
        <div className="relative overflow-hidden rounded-2xl border border/60 bg-card/80 shadow-lg shadow-slate-200/30 dark:shadow-black/20 backdrop-blur-sm">
          <div className="absolute inset-0 bg-gradient-to-br from-muted/50 to-transparent pointer-events-none" />
          <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-border via-muted-foreground to-muted" />
          <div className="relative flex flex-col items-center justify-center py-12 sm:py-16 px-4">
            {statusFilter === 'all' && skillFilter === 'all' ? (
              <>
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                  <Settings className="h-7 w-7 text-muted-foreground" />
                </div>
                <h3 className="mt-4 text-lg font-bold tracking-tight text-foreground">
                  No caddies configured
                </h3>
                <p className="mt-2 text-sm text-muted-foreground text-center max-w-sm">
                  Add caddies to your roster to start assigning them to flights.
                </p>
                <button
                  onClick={onAddCaddy}
                  className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-br from-slate-800 to-slate-900 text-white rounded-xl font-medium shadow-lg shadow-slate-900/20 hover:shadow-xl transition-all duration-300"
                >
                  <Plus className="h-4 w-4" />
                  Add Caddy
                </button>
              </>
            ) : (
              <>
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                  <User className="h-7 w-7 text-muted-foreground" />
                </div>
                <h3 className="mt-4 text-lg font-bold tracking-tight text-foreground">
                  No caddies match filters
                </h3>
                <button
                  onClick={() => {
                    setStatusFilter('all')
                    setSkillFilter('all')
                  }}
                  className="mt-4 text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
                >
                  Clear filters
                </button>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredCaddies.map((caddy) => (
            <CaddyCard
              key={caddy.id}
              caddy={caddy}
              onEdit={() => onEditCaddy(caddy)}
              onViewSchedule={() => onViewSchedule(caddy)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
