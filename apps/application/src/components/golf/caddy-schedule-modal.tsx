'use client'

import { useState, useMemo } from 'react'
import { cn } from '@clubvantage/ui'
import { ChevronLeft, ChevronRight, User, Star, Calendar, ExternalLink } from 'lucide-react'
import { Modal } from './modal'
import type { Caddy } from './types'

type AssignmentStatus = 'scheduled' | 'completed' | 'cancelled'

interface CaddyAssignment {
  id: string
  date: string
  teeTime: string
  status: AssignmentStatus
  players: string[]
  flightId: string
}

interface CaddyScheduleModalProps {
  isOpen: boolean
  onClose: () => void
  caddy: Caddy
  assignments: CaddyAssignment[]
  onViewFlight?: (flightId: string) => void
}

function SkillBadge({ level }: { level: Caddy['skillLevel'] }) {
  const config = {
    beginner: { bg: 'bg-muted', text: 'text-muted-foreground', stars: 1 },
    intermediate: { bg: 'bg-blue-100', text: 'text-blue-700', stars: 2 },
    advanced: { bg: 'bg-purple-100', text: 'text-purple-700', stars: 3 },
    expert: { bg: 'bg-amber-100', text: 'text-amber-700', stars: 4 },
  }[level]

  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium capitalize', config.bg, config.text)}>
      {[...Array(config.stars)].map((_, i) => (
        <Star key={i} className="h-3 w-3 fill-current" />
      ))}
      {level}
    </span>
  )
}

export function CaddyScheduleModal({
  isOpen,
  onClose,
  caddy,
  assignments,
  onViewFlight,
}: CaddyScheduleModalProps) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date()
    return { year: now.getFullYear(), month: now.getMonth() }
  })

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Get days in current month view
  const calendarDays = useMemo(() => {
    const { year, month } = currentMonth
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startPadding = firstDay.getDay()

    const days: (Date | null)[] = []

    // Add padding for days before the first day
    for (let i = 0; i < startPadding; i++) {
      days.push(null)
    }

    // Add all days in the month
    for (let day = 1; day <= lastDay.getDate(); day++) {
      days.push(new Date(year, month, day))
    }

    return days
  }, [currentMonth])

  // Group assignments by date
  const assignmentsByDate = useMemo(() => {
    const map = new Map<string, CaddyAssignment[]>()
    assignments.forEach((assignment) => {
      const existing = map.get(assignment.date) || []
      map.set(assignment.date, [...existing, assignment])
    })
    return map
  }, [assignments])

  // Calculate monthly stats
  const monthlyStats = useMemo(() => {
    const { year, month } = currentMonth
    const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`

    const monthAssignments = assignments.filter((a) => a.date.startsWith(monthStr))

    return {
      total: monthAssignments.length,
      scheduled: monthAssignments.filter((a) => a.status === 'scheduled').length,
      completed: monthAssignments.filter((a) => a.status === 'completed').length,
      cancelled: monthAssignments.filter((a) => a.status === 'cancelled').length,
    }
  }, [assignments, currentMonth])

  // Get next 5 upcoming assignments
  const upcomingAssignments = useMemo(() => {
    const todayStr = today.toISOString().split('T')[0] as string
    return assignments
      .filter((a) => a.date >= todayStr && a.status === 'scheduled')
      .sort((a, b) => {
        const dateCompare = a.date.localeCompare(b.date)
        if (dateCompare !== 0) return dateCompare
        return a.teeTime.localeCompare(b.teeTime)
      })
      .slice(0, 5)
  }, [assignments, today])

  const navigateMonth = (delta: number) => {
    setCurrentMonth((prev) => {
      let newMonth = prev.month + delta
      let newYear = prev.year

      if (newMonth > 11) {
        newMonth = 0
        newYear++
      } else if (newMonth < 0) {
        newMonth = 11
        newYear--
      }

      return { year: newYear, month: newMonth }
    })
  }

  const formatMonthYear = () => {
    const date = new Date(currentMonth.year, currentMonth.month)
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }

  const formatDateWithWeekday = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
  }

  const getAssignmentIndicators = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0] as string
    const dayAssignments = assignmentsByDate.get(dateStr) || []

    const scheduled = dayAssignments.filter((a) => a.status === 'scheduled').length
    const completed = dayAssignments.filter((a) => a.status === 'completed').length
    const cancelled = dayAssignments.filter((a) => a.status === 'cancelled').length

    return { scheduled, completed, cancelled, total: dayAssignments.length }
  }

  const isToday = (date: Date | null) => {
    if (!date) return false
    return date.toISOString().split('T')[0] === today.toISOString().split('T')[0]
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      size="lg"
      footer={
        <button
          onClick={onClose}
          className="px-4 py-2 border border-border rounded-md font-medium hover:bg-muted/50 transition-colors"
        >
          Close
        </button>
      }
    >
      <div className="space-y-6">
        {/* Caddy Header */}
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 bg-muted rounded-full flex items-center justify-center">
            <User className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">{caddy.name}</h2>
            <div className="flex items-center gap-2">
              <SkillBadge level={caddy.skillLevel} />
              <span className="text-sm text-muted-foreground">
                {caddy.experience} {caddy.experience === 1 ? 'year' : 'years'} experience
              </span>
            </div>
          </div>
        </div>

        {/* Monthly Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="p-3 bg-muted/50 rounded-lg text-center">
            <div className="text-2xl font-bold">{monthlyStats.total}</div>
            <div className="text-xs text-muted-foreground">Total</div>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-700">{monthlyStats.scheduled}</div>
            <div className="text-xs text-blue-600">Scheduled</div>
          </div>
          <div className="p-3 bg-emerald-50 rounded-lg text-center">
            <div className="text-2xl font-bold text-emerald-700">{monthlyStats.completed}</div>
            <div className="text-xs text-emerald-600">Completed</div>
          </div>
          <div className="p-3 bg-muted/50 rounded-lg text-center">
            <div className="text-2xl font-bold text-muted-foreground">{monthlyStats.cancelled}</div>
            <div className="text-xs text-muted-foreground">Cancelled</div>
          </div>
        </div>

        {/* Calendar */}
        <div className="border rounded-lg p-4">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigateMonth(-1)}
              className="p-1 hover:bg-muted rounded"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <h3 className="font-semibold">{formatMonthYear()}</h3>
            <button
              onClick={() => navigateMonth(1)}
              className="p-1 hover:bg-muted rounded"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Day Headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                {day}
              </div>
            ))}

            {/* Calendar Days */}
            {calendarDays.map((date, index) => {
              if (!date) {
                return <div key={`empty-${index}`} className="aspect-square" />
              }

              const indicators = getAssignmentIndicators(date)
              const todayHighlight = isToday(date)

              return (
                <div
                  key={date.toISOString()}
                  className={cn(
                    'aspect-square p-1 flex flex-col items-center',
                    todayHighlight && 'ring-2 ring-primary ring-offset-1 rounded-lg'
                  )}
                >
                  <span className={cn(
                    'text-sm',
                    todayHighlight && 'font-bold text-primary'
                  )}>
                    {date.getDate()}
                  </span>

                  {indicators.total > 0 && (
                    <div className="flex gap-0.5 mt-1">
                      {indicators.scheduled > 0 && (
                        <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                      )}
                      {indicators.completed > 0 && (
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      )}
                      {indicators.cancelled > 0 && (
                        <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                      )}
                    </div>
                  )}

                  {indicators.total > 3 && (
                    <span className="text-[10px] text-muted-foreground">+{indicators.total - 3}</span>
                  )}
                </div>
              )
            })}
          </div>

          {/* Legend */}
          <div className="flex justify-center gap-4 mt-4 pt-4 border-t">
            <div className="flex items-center gap-1.5 text-xs">
              <div className="h-2 w-2 rounded-full bg-blue-500" />
              <span>Scheduled</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <div className="h-2 w-2 rounded-full bg-emerald-500" />
              <span>Completed</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <div className="h-2 w-2 rounded-full bg-muted-foreground" />
              <span>Cancelled</span>
            </div>
          </div>
        </div>

        {/* Upcoming Assignments */}
        <div>
          <h3 className="font-medium mb-3 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Upcoming Assignments
          </h3>

          {upcomingAssignments.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No upcoming assignments
            </p>
          ) : (
            <div className="space-y-2">
              {upcomingAssignments.map((assignment) => (
                <div
                  key={assignment.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div>
                    <div className="flex items-center gap-2 font-medium">
                      <span>{formatDateWithWeekday(assignment.date)}</span>
                      <span className="text-primary">{assignment.teeTime}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {assignment.players.slice(0, 2).join(', ')}
                      {assignment.players.length > 2 && ` +${assignment.players.length - 2} more`}
                    </p>
                  </div>
                  {onViewFlight && (
                    <button
                      onClick={() => {
                        onClose()
                        onViewFlight(assignment.flightId)
                      }}
                      className="flex items-center gap-1 text-sm text-primary hover:underline"
                    >
                      View Flight
                      <ExternalLink className="h-3 w-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}
