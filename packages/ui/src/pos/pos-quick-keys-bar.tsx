'use client'

import { cn } from '../lib/utils'
import { POSProductTile, type ProductType } from './pos-product-tile'

export interface QuickKeyProduct {
  id: string
  name: string
  displayName?: string
  price: number
  imageUrl?: string
  productType: ProductType
  categoryColor?: string
}

export interface POSQuickKeysBarProps {
  products: QuickKeyProduct[]
  position?: 'top' | 'left'
  onProductClick: (product: QuickKeyProduct) => void
  className?: string
}

export function POSQuickKeysBar({
  products,
  position = 'top',
  onProductClick,
  className,
}: POSQuickKeysBarProps) {
  // Return null if no products
  if (products.length === 0) {
    return null
  }

  const isHorizontal = position === 'top'

  return (
    <div
      className={cn(
        // Background and border
        'bg-gradient-to-r from-amber-50 to-amber-100/50',
        'border-amber-200',
        'p-2',

        // Position-specific layout
        isHorizontal
          ? 'flex items-center gap-2 overflow-x-auto border-b [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar-thumb]:bg-amber-300 [&::-webkit-scrollbar-track]:bg-transparent'
          : 'flex flex-col gap-2 w-24 overflow-y-auto border-r',

        className
      )}
    >
      {/* Quick label */}
      <span
        className={cn(
          'text-[10px] font-semibold text-amber-700 uppercase tracking-wider',
          isHorizontal ? 'flex-shrink-0' : 'text-center'
        )}
      >
        Quick
      </span>

      {/* Product tiles */}
      {products.map((product) => (
        <div
          key={product.id}
          className={cn(
            'flex-shrink-0',
            isHorizontal ? 'w-20' : 'w-full'
          )}
        >
          <POSProductTile
            id={product.id}
            name={product.name}
            displayName={product.displayName}
            price={product.price}
            imageUrl={product.imageUrl}
            productType={product.productType}
            categoryColor={product.categoryColor}
            tileSize="small"
            showImage={false}
            showPrice={false}
            isQuickKey={true}
            onClick={() => onProductClick(product)}
            className="w-full"
          />
        </div>
      ))}
    </div>
  )
}
