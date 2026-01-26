'use client'

import { cn, Badge } from '@clubvantage/ui'
import { Star, User, Shuffle } from 'lucide-react'
import type { PortalStaff } from '@/lib/types'

export interface StaffSelectorProps {
  staff: PortalStaff[]
  selectedStaffId?: string | 'any'
  onSelectStaff?: (staffId: string | 'any') => void
  showRatings?: boolean
  className?: string
}

/**
 * StaffSelector (PRT-17)
 *
 * Allows members to select a preferred staff member or choose "Any Available".
 */
export function StaffSelector({
  staff,
  selectedStaffId = 'any',
  onSelectStaff,
  showRatings = true,
  className,
}: StaffSelectorProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {/* Any Available option */}
      <button
        type="button"
        onClick={() => onSelectStaff?.('any')}
        className={cn(
          'flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all',
          selectedStaffId === 'any'
            ? 'border-amber-400 bg-amber-50 ring-2 ring-amber-400 dark:border-amber-500 dark:bg-amber-500/10 dark:ring-amber-500'
            : 'border-border bg-card hover:border-amber-300 dark:hover:border-amber-500/50'
        )}
      >
        <div
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-full',
            selectedStaffId === 'any'
              ? 'bg-amber-100 dark:bg-amber-500/20'
              : 'bg-muted'
          )}
        >
          <Shuffle
            className={cn(
              'h-5 w-5',
              selectedStaffId === 'any'
                ? 'text-amber-600 dark:text-amber-400'
                : 'text-muted-foreground'
            )}
          />
        </div>
        <div className="flex-1">
          <p
            className={cn(
              'text-sm font-medium',
              selectedStaffId === 'any'
                ? 'text-amber-700 dark:text-amber-400'
                : 'text-foreground'
            )}
          >
            Any Available
          </p>
          <p className="text-xs text-muted-foreground">
            We'll assign the best available therapist
          </p>
        </div>
      </button>

      {/* Staff list */}
      {staff.map((member) => {
        const isSelected = selectedStaffId === member.id

        return (
          <button
            key={member.id}
            type="button"
            onClick={() => onSelectStaff?.(member.id)}
            className={cn(
              'flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all',
              isSelected
                ? 'border-amber-400 bg-amber-50 ring-2 ring-amber-400 dark:border-amber-500 dark:bg-amber-500/10 dark:ring-amber-500'
                : 'border-border bg-card hover:border-amber-300 dark:hover:border-amber-500/50'
            )}
          >
            {/* Avatar */}
            {member.photoUrl ? (
              <img
                src={member.photoUrl}
                alt={member.name}
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                <User className="h-5 w-5 text-muted-foreground" />
              </div>
            )}

            {/* Info */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p
                  className={cn(
                    'text-sm font-medium',
                    isSelected
                      ? 'text-amber-700 dark:text-amber-400'
                      : 'text-foreground'
                  )}
                >
                  {member.name}
                </p>
                {showRatings && member.rating && (
                  <span className="flex items-center gap-0.5 text-xs text-amber-600 dark:text-amber-400">
                    <Star className="h-3 w-3 fill-current" />
                    {member.rating.toFixed(1)}
                  </span>
                )}
              </div>
              {member.specialties && member.specialties.length > 0 && (
                <div className="mt-1 flex flex-wrap gap-1">
                  {member.specialties.slice(0, 2).map((specialty) => (
                    <span
                      key={specialty}
                      className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground"
                    >
                      {specialty}
                    </span>
                  ))}
                  {member.specialties.length > 2 && (
                    <span className="text-[10px] text-muted-foreground">
                      +{member.specialties.length - 2}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Next available */}
            {member.nextAvailable && (
              <span className="text-xs text-muted-foreground">
                Next: {member.nextAvailable}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
