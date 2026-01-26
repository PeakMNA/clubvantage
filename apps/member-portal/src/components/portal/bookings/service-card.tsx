'use client'

import { cn, Button, Badge } from '@clubvantage/ui'
import {
  Sparkles,
  Dumbbell,
  Heart,
  Trophy,
  Clock,
  User,
  ChevronRight,
} from 'lucide-react'
import type { PortalService, ServiceCategory } from '@/lib/types'

export interface ServiceCardProps {
  service: PortalService
  onSelect?: (service: PortalService) => void
  className?: string
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
  }).format(amount)
}

function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`
  }
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  if (remainingMinutes === 0) {
    return `${hours} hr`
  }
  return `${hours} hr ${remainingMinutes} min`
}

const categoryConfig: Record<ServiceCategory, { label: string; icon: typeof Sparkles; color: string }> = {
  spa: {
    label: 'Spa',
    icon: Sparkles,
    color: 'bg-pink-100 text-pink-600 dark:bg-pink-500/20 dark:text-pink-400',
  },
  fitness: {
    label: 'Fitness',
    icon: Dumbbell,
    color: 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400',
  },
  wellness: {
    label: 'Wellness',
    icon: Heart,
    color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400',
  },
  sports: {
    label: 'Sports',
    icon: Trophy,
    color: 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400',
  },
}

/**
 * ServiceCard (PRT-08)
 *
 * Displays a bookable service with image, staff, duration, and pricing.
 */
export function ServiceCard({
  service,
  onSelect,
  className,
}: ServiceCardProps) {
  const categoryConf = categoryConfig[service.category]
  const Icon = categoryConf.icon

  const displayPrice = service.memberPrice ?? service.basePrice
  const hasDiscount = service.memberPrice && service.memberPrice < service.basePrice

  return (
    <button
      type="button"
      onClick={() => onSelect?.(service)}
      className={cn(
        'flex w-full flex-col overflow-hidden rounded-xl border border-border bg-card text-left transition-all',
        'hover:border-amber-300 hover:shadow-md dark:hover:border-amber-500/50',
        className
      )}
    >
      {/* Image */}
      {service.imageUrl ? (
        <div className="relative h-32 w-full overflow-hidden bg-muted">
          <img
            src={service.imageUrl}
            alt={service.name}
            className="h-full w-full object-cover"
          />
          <div className="absolute right-2 top-2">
            <Badge className={cn('text-[10px]', categoryConf.color)}>
              {categoryConf.label}
            </Badge>
          </div>
        </div>
      ) : (
        <div className="relative flex h-32 w-full items-center justify-center bg-muted">
          <Icon className="h-12 w-12 text-muted-foreground/50" />
          <div className="absolute right-2 top-2">
            <Badge className={cn('text-[10px]', categoryConf.color)}>
              {categoryConf.label}
            </Badge>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-base font-semibold text-foreground">
          {service.name}
        </h3>

        {service.description && (
          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
            {service.description}
          </p>
        )}

        {/* Duration and Staff */}
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatDuration(service.durationMinutes)}
          </span>
          {service.staffCount > 0 && (
            <span className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {service.staffCount} {service.staffCount === 1 ? 'therapist' : 'therapists'}
            </span>
          )}
        </div>

        {/* Variations preview */}
        {service.variations && service.variations.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {service.variations.slice(0, 2).map((variation) => (
              <span
                key={variation.id}
                className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground"
              >
                {variation.name}
              </span>
            ))}
            {service.variations.length > 2 && (
              <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                +{service.variations.length - 2}
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-auto flex items-end justify-between pt-3">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-bold text-foreground">
                {formatCurrency(displayPrice)}
              </span>
              {hasDiscount && (
                <span className="text-xs text-muted-foreground line-through">
                  {formatCurrency(service.basePrice)}
                </span>
              )}
            </div>
            <p className="text-[10px] text-muted-foreground">
              {formatDuration(service.durationMinutes)} session
            </p>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </div>
      </div>
    </button>
  )
}
