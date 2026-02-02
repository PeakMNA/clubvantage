'use client'

import { cn } from '../lib/utils'
import { Star, Grid3X3, SlidersHorizontal } from 'lucide-react'

export type ProductType = 'SIMPLE' | 'VARIABLE' | 'SERVICE' | 'COMPOSITE'

export interface POSProductTileProps {
  id: string
  name: string
  displayName?: string
  price: number
  imageUrl?: string
  productType: ProductType
  categoryColor?: string
  inStock?: boolean
  stockQuantity?: number
  lowStockThreshold?: number
  hasVariants?: boolean
  hasModifiers?: boolean
  isQuickKey?: boolean
  tileSize?: 'small' | 'medium' | 'large'
  showImage?: boolean
  showPrice?: boolean
  onClick?: () => void
  className?: string
}

// Tile size variants
const tileSizeVariants = {
  small: {
    container: 'p-1.5 min-h-[64px]',
    image: 'w-8 h-8',
    name: 'text-[10px] leading-tight',
    price: 'text-[9px]',
    badge: 'text-[8px] px-1 py-0.5',
    icon: 'h-2.5 w-2.5',
    indicator: 'h-3 w-3',
  },
  medium: {
    container: 'p-2 min-h-[80px]',
    image: 'w-10 h-10',
    name: 'text-xs leading-tight',
    price: 'text-[10px]',
    badge: 'text-[9px] px-1.5 py-0.5',
    icon: 'h-3 w-3',
    indicator: 'h-3.5 w-3.5',
  },
  large: {
    container: 'p-3 min-h-[100px]',
    image: 'w-14 h-14',
    name: 'text-sm leading-tight',
    price: 'text-xs',
    badge: 'text-[10px] px-2 py-1',
    icon: 'h-3.5 w-3.5',
    indicator: 'h-4 w-4',
  },
}

// Format price for display
function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(price)
}

// Check if a color is dark (for text contrast)
function isColorDark(hexColor: string): boolean {
  // Remove # if present
  const hex = hexColor.replace('#', '')

  // Parse RGB values
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)

  // Calculate relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255

  return luminance < 0.5
}

export function POSProductTile({
  id,
  name,
  displayName,
  price,
  imageUrl,
  productType,
  categoryColor,
  inStock = true,
  stockQuantity,
  lowStockThreshold = 5,
  hasVariants = false,
  hasModifiers = false,
  isQuickKey = false,
  tileSize = 'medium',
  showImage = true,
  showPrice = true,
  onClick,
  className,
}: POSProductTileProps) {
  const sizes = tileSizeVariants[tileSize]
  const displayLabel = displayName || name

  // Determine stock status
  const isOutOfStock = !inStock || stockQuantity === 0
  const isLowStock = !isOutOfStock && stockQuantity !== undefined && stockQuantity <= lowStockThreshold

  // Determine if category color should be used
  const useCategoryColor = categoryColor && !isOutOfStock
  const useWhiteText = useCategoryColor && isColorDark(categoryColor)

  // Build aria-label
  const ariaLabelParts = [displayLabel, formatPrice(price)]
  if (isOutOfStock) {
    ariaLabelParts.push('Out of stock')
  } else if (isLowStock) {
    ariaLabelParts.push(`Low stock: ${stockQuantity} remaining`)
  }
  const ariaLabel = ariaLabelParts.join(', ')

  return (
    <button
      type="button"
      onClick={isOutOfStock ? undefined : onClick}
      disabled={isOutOfStock}
      aria-label={ariaLabel}
      aria-disabled={isOutOfStock}
      className={cn(
        // Base styles
        'relative flex flex-col items-center justify-center gap-1',
        'rounded-lg border transition-all duration-150',
        'focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-1',
        sizes.container,

        // Default background and hover
        !useCategoryColor && !isOutOfStock && [
          'bg-white border-stone-200',
          'hover:bg-stone-50 hover:border-amber-300 hover:shadow-sm',
        ],

        // Category color background
        useCategoryColor && [
          'border-transparent',
          'hover:shadow-md hover:brightness-95',
        ],

        // Out of stock styles
        isOutOfStock && [
          'bg-stone-100 border-stone-200',
          'opacity-60 cursor-not-allowed',
        ],

        // Text color based on background
        useWhiteText ? 'text-white' : 'text-stone-700',

        className
      )}
      style={useCategoryColor ? { backgroundColor: categoryColor } : undefined}
    >
      {/* Quick key indicator - top left */}
      {isQuickKey && (
        <Star
          className={cn(
            'absolute top-1 left-1 fill-amber-400 text-amber-400',
            sizes.indicator
          )}
          aria-label="Quick key"
        />
      )}

      {/* Variant/Modifier indicators - top right */}
      <div className="absolute top-1 right-1 flex gap-0.5">
        {hasVariants && (
          <Grid3X3
            className={cn(
              sizes.icon,
              useWhiteText ? 'text-white/80' : 'text-stone-400'
            )}
            aria-label="Has variants"
          />
        )}
        {hasModifiers && (
          <SlidersHorizontal
            className={cn(
              sizes.icon,
              useWhiteText ? 'text-white/80' : 'text-stone-400'
            )}
            aria-label="Has modifiers"
          />
        )}
      </div>

      {/* Product image */}
      {showImage && imageUrl && (
        <div
          className={cn(
            'rounded overflow-hidden bg-stone-100 flex-shrink-0',
            sizes.image
          )}
        >
          <img
            src={imageUrl}
            alt=""
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      )}

      {/* Product name */}
      <span
        className={cn(
          'font-medium text-center line-clamp-2 w-full',
          sizes.name,
          useWhiteText ? 'text-white' : 'text-stone-700'
        )}
      >
        {displayLabel}
      </span>

      {/* Price */}
      {showPrice && (
        <span
          className={cn(
            'font-semibold',
            sizes.price,
            useWhiteText ? 'text-white/90' : 'text-stone-600'
          )}
        >
          {formatPrice(price)}
        </span>
      )}

      {/* Stock status badges - bottom */}
      {isOutOfStock && (
        <span
          className={cn(
            'absolute bottom-1 left-1/2 -translate-x-1/2',
            'bg-red-500 text-white font-medium rounded whitespace-nowrap',
            sizes.badge
          )}
        >
          Out of Stock
        </span>
      )}

      {isLowStock && (
        <span
          className={cn(
            'absolute bottom-1 left-1/2 -translate-x-1/2',
            'bg-amber-500 text-white font-medium rounded whitespace-nowrap',
            sizes.badge
          )}
        >
          Low: {stockQuantity}
        </span>
      )}
    </button>
  )
}
