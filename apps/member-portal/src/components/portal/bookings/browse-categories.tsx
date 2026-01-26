'use client'

import { cn } from '@clubvantage/ui'
import {
  Building2,
  Sparkles,
  Dumbbell,
  Heart,
  Trophy,
  Waves,
  DoorOpen,
  ChevronRight,
} from 'lucide-react'
import type { BookingCategory } from '@/lib/types'

export interface BrowseCategoriesProps {
  categories: BookingCategory[]
  onSelectCategory?: (category: BookingCategory) => void
  className?: string
}

// Icon mapping
const iconMap: Record<string, typeof Building2> = {
  Building2,
  Sparkles,
  Dumbbell,
  Heart,
  Trophy,
  Waves,
  DoorOpen,
}

function getIcon(iconName: string) {
  return iconMap[iconName] || Building2
}

// Category colors based on type
function getCategoryColor(category: BookingCategory): { bg: string; text: string; icon: string } {
  if (category.type === 'facility') {
    // Facility type colors
    if (category.facilityTypes?.includes('court')) {
      return {
        bg: 'bg-blue-100 dark:bg-blue-500/20',
        text: 'text-blue-700 dark:text-blue-400',
        icon: 'text-blue-600 dark:text-blue-400',
      }
    }
    if (category.facilityTypes?.includes('spa')) {
      return {
        bg: 'bg-pink-100 dark:bg-pink-500/20',
        text: 'text-pink-700 dark:text-pink-400',
        icon: 'text-pink-600 dark:text-pink-400',
      }
    }
    if (category.facilityTypes?.includes('pool')) {
      return {
        bg: 'bg-cyan-100 dark:bg-cyan-500/20',
        text: 'text-cyan-700 dark:text-cyan-400',
        icon: 'text-cyan-600 dark:text-cyan-400',
      }
    }
    return {
      bg: 'bg-stone-100 dark:bg-stone-500/20',
      text: 'text-stone-700 dark:text-stone-400',
      icon: 'text-stone-600 dark:text-stone-400',
    }
  } else {
    // Service category colors
    if (category.serviceCategories?.includes('spa')) {
      return {
        bg: 'bg-pink-100 dark:bg-pink-500/20',
        text: 'text-pink-700 dark:text-pink-400',
        icon: 'text-pink-600 dark:text-pink-400',
      }
    }
    if (category.serviceCategories?.includes('fitness')) {
      return {
        bg: 'bg-blue-100 dark:bg-blue-500/20',
        text: 'text-blue-700 dark:text-blue-400',
        icon: 'text-blue-600 dark:text-blue-400',
      }
    }
    if (category.serviceCategories?.includes('sports')) {
      return {
        bg: 'bg-amber-100 dark:bg-amber-500/20',
        text: 'text-amber-700 dark:text-amber-400',
        icon: 'text-amber-600 dark:text-amber-400',
      }
    }
    if (category.serviceCategories?.includes('wellness')) {
      return {
        bg: 'bg-emerald-100 dark:bg-emerald-500/20',
        text: 'text-emerald-700 dark:text-emerald-400',
        icon: 'text-emerald-600 dark:text-emerald-400',
      }
    }
    return {
      bg: 'bg-stone-100 dark:bg-stone-500/20',
      text: 'text-stone-700 dark:text-stone-400',
      icon: 'text-stone-600 dark:text-stone-400',
    }
  }
}

/**
 * BrowseCategories (PRT-06)
 *
 * Grid of browseable booking categories (facilities and services).
 */
export function BrowseCategories({
  categories,
  onSelectCategory,
  className,
}: BrowseCategoriesProps) {
  return (
    <div className={cn('space-y-4', className)}>
      <h2 className="text-lg font-semibold text-foreground">
        Browse & Book
      </h2>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {categories.map((category) => {
          const Icon = getIcon(category.icon)
          const colors = getCategoryColor(category)

          return (
            <button
              key={category.id}
              type="button"
              onClick={() => onSelectCategory?.(category)}
              className={cn(
                'group flex flex-col items-center rounded-xl border border-border bg-card p-4 text-center transition-all',
                'hover:border-amber-300 hover:shadow-sm dark:hover:border-amber-500/50'
              )}
            >
              <div
                className={cn(
                  'mb-3 flex h-12 w-12 items-center justify-center rounded-full transition-transform group-hover:scale-110',
                  colors.bg
                )}
              >
                <Icon className={cn('h-6 w-6', colors.icon)} />
              </div>
              <h3 className="text-sm font-medium text-foreground">
                {category.name}
              </h3>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {category.itemCount} {category.itemCount === 1 ? 'option' : 'options'}
              </p>
            </button>
          )
        })}
      </div>
    </div>
  )
}

/**
 * CategoryCard - Single category card for use outside the grid
 */
export interface CategoryCardProps {
  category: BookingCategory
  onSelect?: (category: BookingCategory) => void
  className?: string
}

export function CategoryCard({
  category,
  onSelect,
  className,
}: CategoryCardProps) {
  const Icon = getIcon(category.icon)
  const colors = getCategoryColor(category)

  return (
    <button
      type="button"
      onClick={() => onSelect?.(category)}
      className={cn(
        'flex w-full items-center gap-4 rounded-xl border border-border bg-card p-4 text-left transition-all',
        'hover:border-amber-300 hover:shadow-sm dark:hover:border-amber-500/50',
        className
      )}
    >
      <div
        className={cn(
          'flex h-12 w-12 shrink-0 items-center justify-center rounded-full',
          colors.bg
        )}
      >
        <Icon className={cn('h-6 w-6', colors.icon)} />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="font-medium text-foreground">{category.name}</h3>
        <p className="text-sm text-muted-foreground">{category.description}</p>
      </div>
      <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
    </button>
  )
}
