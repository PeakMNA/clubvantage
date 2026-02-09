'use client'

import { cn } from '@clubvantage/ui'
import { Plus, MapPin, Settings, Flag } from 'lucide-react'
import type { Course } from './types'

interface CoursesTabProps {
  courses: Course[]
  isLoading?: boolean
  onAddCourse: () => void
  onEditCourse: (course: Course) => void
  onViewMaintenance?: (course: Course) => void
}

function CourseStatusBadge({ status }: { status: Course['status'] }) {
  const config = {
    ACTIVE: { bg: 'bg-emerald-50 dark:bg-emerald-500/20 border-emerald-200/60 dark:border-emerald-500/30', text: 'text-emerald-700 dark:text-emerald-400', label: 'Active' },
    MAINTENANCE: { bg: 'bg-amber-50 dark:bg-amber-500/20 border-amber-200/60 dark:border-amber-500/30', text: 'text-amber-700 dark:text-amber-400', label: 'Maintenance' },
    CLOSED: { bg: 'bg-red-50 dark:bg-red-500/20 border-red-200/60 dark:border-red-500/30', text: 'text-red-700 dark:text-red-400', label: 'Closed' },
  }[status]

  return (
    <span className={cn('px-2.5 py-1 rounded-full text-xs font-medium border', config.bg, config.text)}>
      {config.label}
    </span>
  )
}

function CourseCard({
  course,
  onEdit,
  onViewMaintenance,
}: {
  course: Course
  onEdit: () => void
  onViewMaintenance?: () => void
}) {
  return (
    <div className="relative overflow-hidden rounded-xl sm:rounded-2xl border border/60 bg-card/80 shadow-lg shadow-slate-200/30 dark:shadow-black/20 backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-black/30 group">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-muted/50 to-transparent pointer-events-none" />

      {/* Accent line - color based on status */}
      <div className={cn(
        'absolute left-0 top-0 h-1 w-full',
        course.status === 'ACTIVE' && 'bg-gradient-to-r from-emerald-300 via-emerald-500 to-emerald-300',
        course.status === 'MAINTENANCE' && 'bg-gradient-to-r from-amber-300 via-amber-500 to-amber-300',
        course.status === 'CLOSED' && 'bg-gradient-to-r from-red-300 via-red-500 to-red-300'
      )} />

      <div className="relative p-4 sm:p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-200/50 shadow-inner">
              <Flag className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold tracking-tight text-foreground">{course.name}</h3>
              <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
                {course.holes} Holes
              </span>
            </div>
          </div>
          <CourseStatusBadge status={course.status} />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="text-center p-2.5 bg-muted/80 rounded-xl border border-border">
            <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Par</div>
            <div className="text-lg font-bold tracking-tight text-foreground">{course.par}</div>
          </div>
          <div className="text-center p-2.5 bg-muted/80 rounded-xl border border-border">
            <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Rating</div>
            <div className="text-lg font-bold tracking-tight text-foreground">{course.rating}</div>
          </div>
          <div className="text-center p-2.5 bg-muted/80 rounded-xl border border-border">
            <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Slope</div>
            <div className="text-lg font-bold tracking-tight text-foreground">{course.slope}</div>
          </div>
        </div>

        {/* Schedule Info */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <Settings className="h-4 w-4 text-muted-foreground" />
          <span>Schedule configured in Settings</span>
        </div>

        {/* Condition notes */}
        {course.condition && (
          <p className="text-sm text-muted-foreground italic mb-4 line-clamp-2 p-3 bg-muted/80 rounded-xl border border-border">
            {course.condition}
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t border-border">
          {onViewMaintenance && (
            <button
              onClick={onViewMaintenance}
              className="flex-1 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-all duration-200 font-medium"
            >
              View Maintenance
            </button>
          )}
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
            <div className="h-5 w-32 bg-muted rounded" />
            <div className="h-4 w-20 bg-muted rounded" />
          </div>
        </div>
        <div className="h-6 w-16 bg-muted rounded-full" />
      </div>
      <div className="grid grid-cols-3 gap-2 mb-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-muted rounded-xl" />
        ))}
      </div>
      <div className="h-4 w-28 bg-muted rounded mb-4" />
      <div className="h-12 bg-muted rounded-xl" />
    </div>
  )
}

export function CoursesTab({
  courses,
  isLoading,
  onAddCourse,
  onEditCourse,
  onViewMaintenance,
}: CoursesTabProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">Courses</h2>
          <p className="text-sm text-muted-foreground">
            {courses.length} course{courses.length !== 1 ? 's' : ''} configured
          </p>
        </div>
        <button
          onClick={onAddCourse}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-br from-slate-800 to-slate-900 text-white rounded-xl font-medium shadow-lg shadow-slate-900/20 hover:shadow-xl transition-all duration-300"
        >
          <Plus className="h-4 w-4" />
          Add Course
        </button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : courses.length === 0 ? (
        <div className="relative overflow-hidden rounded-2xl border border/60 bg-card/80 shadow-lg shadow-slate-200/30 dark:shadow-black/20 backdrop-blur-sm">
          <div className="absolute inset-0 bg-gradient-to-br from-muted/50 to-transparent pointer-events-none" />
          <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-border via-muted-foreground to-muted" />
          <div className="relative flex flex-col items-center justify-center py-12 sm:py-16 px-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <Settings className="h-7 w-7 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-bold tracking-tight text-foreground">
              No courses configured
            </h3>
            <p className="mt-2 text-sm text-muted-foreground text-center max-w-sm">
              Add your first course to start managing tee times.
            </p>
            <button
              onClick={onAddCourse}
              className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-br from-slate-800 to-slate-900 text-white rounded-xl font-medium shadow-lg shadow-slate-900/20 hover:shadow-xl transition-all duration-300"
            >
              <Plus className="h-4 w-4" />
              Add Course
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {courses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              onEdit={() => onEditCourse(course)}
              onViewMaintenance={
                onViewMaintenance ? () => onViewMaintenance(course) : undefined
              }
            />
          ))}
        </div>
      )}
    </div>
  )
}
