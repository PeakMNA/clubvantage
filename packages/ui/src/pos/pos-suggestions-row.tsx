'use client'

import { cn } from '../lib/utils'
import { POSProductTile, type ProductType } from './pos-product-tile'
import { Sparkles, RefreshCw } from 'lucide-react'

export interface SuggestedProduct {
  id: string
  name: string
  price: number
  imageUrl?: string
  productType: ProductType
  categoryColor?: string
}

export interface POSSuggestionsRowProps {
  products: SuggestedProduct[]
  position?: 'top' | 'sidebar' | 'floating'
  onProductClick: (product: SuggestedProduct) => void
  onRefresh?: () => void
  isRefreshing?: boolean
  className?: string
}

export function POSSuggestionsRow({
  products,
  position = 'top',
  onProductClick,
  onRefresh,
  isRefreshing = false,
  className,
}: POSSuggestionsRowProps) {
  // Return null if products array is empty
  if (products.length === 0) {
    return null
  }

  const isTop = position === 'top'
  const isSidebar = position === 'sidebar'
  const isFloating = position === 'floating'

  return (
    <div
      className={cn(
        // Base styles
        'bg-gradient-to-r from-emerald-50 to-emerald-100/50',
        'border-emerald-200 p-2',

        // Position-specific container styles
        isTop && 'flex items-center gap-2 overflow-x-auto border-b [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar-thumb]:bg-emerald-300 [&::-webkit-scrollbar-track]:bg-transparent',
        isSidebar && 'flex flex-col gap-2 w-28 border-l',
        isFloating && 'rounded-lg shadow-lg border',

        className
      )}
    >
      {/* Header */}
      <div
        className={cn(
          'flex items-center gap-1.5 flex-shrink-0',
          isSidebar && 'justify-between px-1',
          isFloating && 'mb-2'
        )}
      >
        <div className="flex items-center gap-1">
          <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
          <span className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wider">
            Suggested
          </span>
        </div>

        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className={cn(
              'p-1 rounded hover:bg-emerald-200/50 transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
            aria-label="Refresh suggestions"
          >
            <RefreshCw
              className={cn(
                'h-3 w-3 text-emerald-600',
                isRefreshing && 'animate-spin'
              )}
            />
          </button>
        )}
      </div>

      {/* Products */}
      <div
        className={cn(
          isTop && 'flex items-center gap-2',
          isSidebar && 'flex flex-col gap-2',
          isFloating && 'flex items-center gap-2 flex-wrap'
        )}
      >
        {products.map((product) => (
          <div
            key={product.id}
            className={cn(
              isTop && 'w-20 flex-shrink-0',
              isSidebar && 'w-full',
              isFloating && 'w-20'
            )}
          >
            <POSProductTile
              id={product.id}
              name={product.name}
              price={product.price}
              imageUrl={product.imageUrl}
              productType={product.productType}
              categoryColor={product.categoryColor}
              tileSize="small"
              showImage={!isSidebar}
              onClick={() => onProductClick(product)}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
