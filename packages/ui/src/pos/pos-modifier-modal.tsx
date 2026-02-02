'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { X, Check } from 'lucide-react'
import { Button } from '../primitives/button'
import { cn } from '../lib/utils'

export type ModifierSelectionType = 'SINGLE' | 'MULTIPLE'

export interface Modifier {
  id: string
  name: string
  priceAdjustment: number
  isDefault: boolean
  isActive: boolean
}

export interface ModifierGroup {
  id: string
  name: string
  selectionType: ModifierSelectionType
  minSelections: number
  maxSelections?: number
  isRequired: boolean
  modifiers: Modifier[]
}

export interface SelectedModifier {
  groupId: string
  modifierId: string
  name: string
  priceAdjustment: number
}

export interface POSModifierModalProps {
  isOpen: boolean
  onClose: () => void
  productName: string
  basePrice: number
  modifierGroups: ModifierGroup[]
  onConfirm: (modifiers: SelectedModifier[]) => void
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

// Get selection hint text for a modifier group
function getSelectionHint(group: ModifierGroup): string {
  if (group.selectionType === 'SINGLE') {
    return 'Choose one'
  }
  if (group.maxSelections !== undefined) {
    return `Choose up to ${group.maxSelections}`
  }
  return 'Choose any'
}

export function POSModifierModal({
  isOpen,
  onClose,
  productName,
  basePrice,
  modifierGroups,
  onConfirm,
}: POSModifierModalProps) {
  // selections: Record<groupId, array of modifierIds>
  const [selections, setSelections] = useState<Record<string, string[]>>({})

  // Initialize selections with default modifiers when modal opens
  useEffect(() => {
    if (isOpen) {
      const initialSelections: Record<string, string[]> = {}
      modifierGroups.forEach((group) => {
        const defaultModifiers = group.modifiers
          .filter((m) => m.isDefault && m.isActive)
          .map((m) => m.id)
        initialSelections[group.id] = defaultModifiers
      })
      setSelections(initialSelections)
    }
  }, [isOpen, modifierGroups])

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

  // Handle modifier selection
  const handleModifierToggle = useCallback(
    (group: ModifierGroup, modifierId: string) => {
      setSelections((prev) => {
        const currentSelections = prev[group.id] || []
        const isSelected = currentSelections.includes(modifierId)

        if (group.selectionType === 'SINGLE') {
          // Radio behavior: selecting one deselects others
          return {
            ...prev,
            [group.id]: isSelected ? [] : [modifierId],
          }
        } else {
          // Checkbox behavior
          if (isSelected) {
            // Deselect
            return {
              ...prev,
              [group.id]: currentSelections.filter((id) => id !== modifierId),
            }
          } else {
            // Check if we've reached max selections
            if (
              group.maxSelections !== undefined &&
              currentSelections.length >= group.maxSelections
            ) {
              return prev // Don't allow more selections
            }
            // Select
            return {
              ...prev,
              [group.id]: [...currentSelections, modifierId],
            }
          }
        }
      })
    },
    []
  )

  // Check if a group is valid (meets minimum selection requirement)
  const isGroupValid = useCallback(
    (group: ModifierGroup): boolean => {
      const groupSelections = selections[group.id] || []
      if (group.isRequired && groupSelections.length < group.minSelections) {
        return false
      }
      return true
    },
    [selections]
  )

  // Check if all required groups are valid
  const isFormValid = useMemo(() => {
    return modifierGroups.every((group) => isGroupValid(group))
  }, [modifierGroups, isGroupValid])

  // Calculate total price
  const totalPrice = useMemo(() => {
    let total = basePrice
    Object.entries(selections).forEach(([groupId, modifierIds]) => {
      const group = modifierGroups.find((g) => g.id === groupId)
      if (group) {
        modifierIds.forEach((modifierId) => {
          const modifier = group.modifiers.find((m) => m.id === modifierId)
          if (modifier) {
            total += modifier.priceAdjustment
          }
        })
      }
    })
    return total
  }, [basePrice, selections, modifierGroups])

  // Handle confirm
  const handleConfirm = useCallback(() => {
    const selectedModifiers: SelectedModifier[] = []
    Object.entries(selections).forEach(([groupId, modifierIds]) => {
      const group = modifierGroups.find((g) => g.id === groupId)
      if (group) {
        modifierIds.forEach((modifierId) => {
          const modifier = group.modifiers.find((m) => m.id === modifierId)
          if (modifier) {
            selectedModifiers.push({
              groupId,
              modifierId,
              name: modifier.name,
              priceAdjustment: modifier.priceAdjustment,
            })
          }
        })
      }
    })
    onConfirm(selectedModifiers)
    onClose()
  }, [selections, modifierGroups, onConfirm, onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modifier-modal-title"
    >
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-start gap-3 p-4 border-b border-stone-200">
          <div className="flex-1 min-w-0">
            <h2
              id="modifier-modal-title"
              className="text-lg font-semibold text-stone-900 truncate"
            >
              Customize {productName}
            </h2>
            <p className="text-sm text-stone-500">Select your options</p>
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

        {/* Body - Scrollable modifier groups */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {modifierGroups.length === 0 ? (
            <p className="text-center text-stone-500 py-8">
              No modifiers available
            </p>
          ) : (
            modifierGroups.map((group) => {
              const groupSelections = selections[group.id] || []
              const groupValid = isGroupValid(group)
              const activeModifiers = group.modifiers.filter((m) => m.isActive)

              return (
                <div key={group.id} className="space-y-2">
                  {/* Group header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <span className="font-medium text-stone-900">
                        {group.name}
                      </span>
                      {group.isRequired && (
                        <span className="text-red-500 font-medium">*</span>
                      )}
                    </div>
                    <span
                      className={cn(
                        'text-xs',
                        !groupValid ? 'text-red-500' : 'text-stone-500'
                      )}
                    >
                      {getSelectionHint(group)}
                    </span>
                  </div>

                  {/* Modifier options */}
                  <div className="space-y-1">
                    {activeModifiers.map((modifier) => {
                      const isSelected = groupSelections.includes(modifier.id)
                      const priceText = formatPriceAdjustment(
                        modifier.priceAdjustment
                      )
                      const isSingle = group.selectionType === 'SINGLE'

                      // Check if this modifier can be selected (not at max)
                      const canSelect =
                        isSelected ||
                        group.maxSelections === undefined ||
                        groupSelections.length < group.maxSelections

                      return (
                        <button
                          key={modifier.id}
                          type="button"
                          onClick={() =>
                            handleModifierToggle(group, modifier.id)
                          }
                          disabled={!canSelect && !isSelected}
                          className={cn(
                            'w-full flex items-center gap-3 p-3 rounded-lg border transition-all duration-150',
                            'focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-1',
                            isSelected
                              ? 'border-amber-500 bg-amber-50'
                              : 'border-stone-200 hover:border-stone-300',
                            !canSelect &&
                              !isSelected &&
                              'opacity-50 cursor-not-allowed'
                          )}
                        >
                          {/* Selection indicator */}
                          <div
                            className={cn(
                              'flex-shrink-0 flex items-center justify-center transition-colors',
                              isSingle
                                ? 'w-5 h-5 rounded-full border-2'
                                : 'w-5 h-5 rounded border-2',
                              isSelected
                                ? 'border-amber-500 bg-amber-500'
                                : 'border-stone-300 bg-white'
                            )}
                          >
                            {isSelected && (
                              <Check className="h-3 w-3 text-white" />
                            )}
                          </div>

                          {/* Modifier name */}
                          <span className="flex-1 text-left text-stone-900">
                            {modifier.name}
                          </span>

                          {/* Price adjustment */}
                          {priceText && (
                            <span
                              className={cn(
                                'text-sm font-medium',
                                modifier.priceAdjustment > 0
                                  ? 'text-amber-600'
                                  : 'text-emerald-600'
                              )}
                            >
                              {priceText}
                            </span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
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
            onClick={handleConfirm}
            disabled={!isFormValid}
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
