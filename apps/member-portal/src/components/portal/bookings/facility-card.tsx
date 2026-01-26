'use client'

import { cn, Button, Badge } from '@clubvantage/ui'
import {
  Building2,
  Sparkles,
  Dumbbell,
  Waves,
  DoorOpen,
  MapPin,
  Clock,
  Users,
  ChevronRight,
} from 'lucide-react'
import type { PortalFacility, FacilityType } from '@/lib/types'

export interface FacilityCardProps {
  facility: PortalFacility
  onSelect?: (facility: PortalFacility) => void
  className?: string
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
  }).format(amount)
}

const facilityTypeConfig: Record<FacilityType, { label: string; icon: typeof Building2; color: string }> = {
  court: {
    label: 'Court',
    icon: Building2,
    color: 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400',
  },
  spa: {
    label: 'Spa',
    icon: Sparkles,
    color: 'bg-pink-100 text-pink-600 dark:bg-pink-500/20 dark:text-pink-400',
  },
  studio: {
    label: 'Studio',
    icon: Dumbbell,
    color: 'bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400',
  },
  pool: {
    label: 'Pool',
    icon: Waves,
    color: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-400',
  },
  room: {
    label: 'Room',
    icon: DoorOpen,
    color: 'bg-stone-100 text-stone-600 dark:bg-stone-500/20 dark:text-stone-400',
  },
}

/**
 * FacilityCard (PRT-07)
 *
 * Displays a bookable facility with image, features, and pricing.
 */
export function FacilityCard({
  facility,
  onSelect,
  className,
}: FacilityCardProps) {
  const typeConfig = facilityTypeConfig[facility.type]
  const Icon = typeConfig.icon

  const displayPrice = facility.memberPrice ?? facility.basePrice
  const hasDiscount = facility.memberPrice && facility.memberPrice < facility.basePrice

  return (
    <button
      type="button"
      onClick={() => onSelect?.(facility)}
      className={cn(
        'flex w-full flex-col overflow-hidden rounded-xl border border-border bg-card text-left transition-all',
        'hover:border-amber-300 hover:shadow-md dark:hover:border-amber-500/50',
        className
      )}
    >
      {/* Image */}
      {facility.imageUrl ? (
        <div className="relative h-32 w-full overflow-hidden bg-muted">
          <img
            src={facility.imageUrl}
            alt={facility.name}
            className="h-full w-full object-cover"
          />
          <div className="absolute right-2 top-2">
            <Badge className={cn('text-[10px]', typeConfig.color)}>
              {typeConfig.label}
            </Badge>
          </div>
        </div>
      ) : (
        <div className="relative flex h-32 w-full items-center justify-center bg-muted">
          <Icon className="h-12 w-12 text-muted-foreground/50" />
          <div className="absolute right-2 top-2">
            <Badge className={cn('text-[10px]', typeConfig.color)}>
              {typeConfig.label}
            </Badge>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-base font-semibold text-foreground">
          {facility.name}
        </h3>

        <div className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3" />
          <span>{facility.location}</span>
        </div>

        {/* Features */}
        {facility.features.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {facility.features.slice(0, 3).map((feature) => (
              <span
                key={feature}
                className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground"
              >
                {feature}
              </span>
            ))}
            {facility.features.length > 3 && (
              <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                +{facility.features.length - 3}
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
                  {formatCurrency(facility.basePrice)}
                </span>
              )}
            </div>
            <p className="text-[10px] text-muted-foreground">
              per {facility.bookingDurationMinutes[0]} min
            </p>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </div>
      </div>
    </button>
  )
}
