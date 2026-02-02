'use client'

import { useEffect, useState, useCallback } from 'react'
import { X, Check, Package } from 'lucide-react'
import { Button } from '../primitives/button'
import { cn } from '../lib/utils'

export interface ProductVariant {
  id: string
  name: string
  sku?: string
  priceAdjustment: number
  attributes?: Record<string, string>
  stockQuantity?: number
  imageUrl?: string
  isActive: boolean
}

export interface POSVariantPickerProps {
  isOpen: boolean
  onClose: () => void
  productName: string
  productPrice: number
  productImageUrl?: string
  variants: ProductVariant[]
  onSelectVariant: (variant: ProductVariant) => void
}

// Format price for display
function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(price)
}

// Format price adjustment (e.g., "+$5.00", "-$3.00", or empty for zero)
function formatPriceAdjustment(adjustment: number): string {
  if (adjustment === 0) return ''
  const prefix = adjustment > 0 ? '+' : ''
  return `${prefix}${formatPrice(adjustment)}`
}

export function POSVariantPicker({
  isOpen,
  onClose,
  productName,
  productPrice,
  productImageUrl,
  variants,
  onSelectVariant,
}: POSVariantPickerProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)

  // Reset selection when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedId(null)
    }
  }, [isOpen])

  // Handle ESC key to close modal
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // Handle backdrop click
  const handleBackdropClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (event.target === event.currentTarget) {
        onClose()
      }
    },
    [onClose]
  )

  // Handle add to cart
  const handleAddToCart = useCallback(() => {
    const selectedVariant = variants.find((v) => v.id === selectedId)
    if (selectedVariant) {
      onSelectVariant(selectedVariant)
      onClose()
    }
  }, [selectedId, variants, onSelectVariant, onClose])

  // Get selected variant for price calculation
  const selectedVariant = variants.find((v) => v.id === selectedId)
  const totalPrice = selectedVariant
    ? productPrice + selectedVariant.priceAdjustment
    : productPrice

  // Filter to only active variants
  const activeVariants = variants.filter((v) => v.isActive)

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="variant-picker-title"
    >
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-start gap-3 p-4 border-b border-stone-200">
          {/* Product image */}
          {productImageUrl ? (
            <div className="w-16 h-16 rounded-lg overflow-hidden bg-stone-100 flex-shrink-0">
              <img
                src={productImageUrl}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-lg bg-stone-100 flex items-center justify-center flex-shrink-0">
              <Package className="h-8 w-8 text-stone-400" />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <h2
              id="variant-picker-title"
              className="text-lg font-semibold text-stone-900 truncate"
            >
              {productName}
            </h2>
            <p className="text-sm text-stone-500">Select a variant</p>
          </div>

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body - Scrollable variant list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {activeVariants.length === 0 ? (
            <p className="text-center text-stone-500 py-8">
              No variants available
            </p>
          ) : (
            activeVariants.map((variant) => {
              const isSelected = selectedId === variant.id
              const isOutOfStock =
                variant.stockQuantity !== undefined && variant.stockQuantity <= 0
              const priceAdjustmentText = formatPriceAdjustment(
                variant.priceAdjustment
              )

              return (
                <button
                  key={variant.id}
                  type="button"
                  onClick={() => !isOutOfStock && setSelectedId(variant.id)}
                  disabled={isOutOfStock}
                  className={cn(
                    'w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all duration-150',
                    'focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-1',
                    isSelected
                      ? 'border-amber-500 bg-amber-50'
                      : 'border-stone-200 hover:border-stone-300',
                    isOutOfStock && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  {/* Variant image or placeholder */}
                  {variant.imageUrl ? (
                    <div className="w-10 h-10 rounded overflow-hidden bg-stone-100 flex-shrink-0">
                      <img
                        src={variant.imageUrl}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded bg-stone-100 flex items-center justify-center flex-shrink-0">
                      <Package className="h-5 w-5 text-stone-400" />
                    </div>
                  )}

                  {/* Variant details */}
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-stone-900 truncate">
                        {variant.name}
                      </span>
                      {priceAdjustmentText && (
                        <span
                          className={cn(
                            'text-sm font-medium',
                            variant.priceAdjustment > 0
                              ? 'text-amber-600'
                              : 'text-emerald-600'
                          )}
                        >
                          {priceAdjustmentText}
                        </span>
                      )}
                    </div>
                    {variant.sku && (
                      <span className="text-xs text-stone-500">
                        SKU: {variant.sku}
                      </span>
                    )}
                    {isOutOfStock && (
                      <span className="text-xs text-red-500 font-medium">
                        Out of Stock
                      </span>
                    )}
                  </div>

                  {/* Selection indicator */}
                  <div
                    className={cn(
                      'w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors',
                      isSelected
                        ? 'border-amber-500 bg-amber-500'
                        : 'border-stone-300 bg-white'
                    )}
                  >
                    {isSelected && <Check className="h-4 w-4 text-white" />}
                  </div>
                </button>
              )
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-200 space-y-3">
          {/* Price display */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-stone-600">Total Price</span>
            <span className="text-xl font-semibold text-stone-900">
              {formatPrice(totalPrice)}
            </span>
          </div>

          {/* Add to Cart button */}
          <Button
            onClick={handleAddToCart}
            disabled={!selectedId}
            className="w-full"
            size="lg"
          >
            Add to Cart
          </Button>
        </div>
      </div>
    </div>
  )
}
