'use client'

import { useState, useEffect } from 'react'
import { cn } from '@clubvantage/ui'
import { Loader2, AlertCircle, Package, User, DollarSign, ClipboardCheck, FileText } from 'lucide-react'
import * as LucideIcons from 'lucide-react'
import { Modal } from '../golf/modal'
import {
  useAssignEquipmentMutation,
  type EquipmentCondition,
} from '@clubvantage/api-client'
import { useQueryClient } from '@tanstack/react-query'

// Equipment data for display
export interface EquipmentForAssignment {
  id: string
  assetNumber: string
  name: string
  condition: string
  category?: {
    id: string
    name: string
    icon?: string
    color?: string
    defaultRentalRate?: number
  }
}

export interface EquipmentAssignModalProps {
  isOpen: boolean
  onClose: () => void
  equipment: EquipmentForAssignment | null
  onSuccess?: () => void
  // Optional: pre-fill with booking context
  bookingId?: string
  bookingNumber?: string
  teeTimePlayerId?: string
  memberName?: string
}

const CONDITION_OPTIONS: { value: EquipmentCondition; label: string; color: string }[] = [
  { value: 'EXCELLENT', label: 'Excellent', color: 'emerald' },
  { value: 'GOOD', label: 'Good', color: 'blue' },
  { value: 'FAIR', label: 'Fair', color: 'amber' },
  { value: 'NEEDS_REPAIR', label: 'Needs Repair', color: 'orange' },
]

interface FormData {
  bookingReference: string
  teeTimePlayerId: string
  rentalFee: string
  conditionAtCheckout: EquipmentCondition
  notes: string
}

export function EquipmentAssignModal({
  isOpen,
  onClose,
  equipment,
  onSuccess,
  bookingId: initialBookingId,
  bookingNumber: initialBookingNumber,
  teeTimePlayerId: initialTeeTimePlayerId,
  memberName: initialMemberName,
}: EquipmentAssignModalProps) {
  const queryClient = useQueryClient()

  const [formData, setFormData] = useState<FormData>({
    bookingReference: '',
    teeTimePlayerId: '',
    rentalFee: '',
    conditionAtCheckout: 'GOOD',
    notes: '',
  })
  const [error, setError] = useState<string | null>(null)

  const assignMutation = useAssignEquipmentMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['GetEquipment'] })
      queryClient.invalidateQueries({ queryKey: ['GetEquipmentCategories'] })
      onSuccess?.()
      onClose()
    },
    onError: (err: Error) => {
      setError(err.message || 'Failed to assign equipment')
    },
  })

  const isSubmitting = assignMutation.isPending

  // Get the icon component dynamically
  const getIconComponent = (iconName: string): LucideIcons.LucideIcon => {
    const icons = LucideIcons as unknown as Record<string, LucideIcons.LucideIcon>
    return icons[iconName] || LucideIcons.Package
  }

  // Initialize form when modal opens
  useEffect(() => {
    if (isOpen && equipment) {
      setFormData({
        bookingReference: initialBookingNumber || '',
        teeTimePlayerId: initialTeeTimePlayerId || '',
        rentalFee: equipment.category?.defaultRentalRate?.toString() || '',
        conditionAtCheckout: (equipment.condition as EquipmentCondition) || 'GOOD',
        notes: '',
      })
      setError(null)
    }
  }, [isOpen, equipment, initialBookingNumber, initialTeeTimePlayerId])

  const handleAssign = async () => {
    if (!equipment) return

    // At least one reference should be provided (booking or tee time player)
    // For now, we'll allow assignment without a reference for walk-in rentals

    setError(null)

    const input: {
      equipmentId: string
      bookingId?: string
      teeTimePlayerId?: string
      rentalFee?: number
      conditionAtCheckout?: EquipmentCondition
      notes?: string
    } = {
      equipmentId: equipment.id,
      conditionAtCheckout: formData.conditionAtCheckout,
    }

    // Add booking ID if provided
    if (initialBookingId) {
      input.bookingId = initialBookingId
    }

    // Add tee time player ID if provided
    if (formData.teeTimePlayerId || initialTeeTimePlayerId) {
      input.teeTimePlayerId = formData.teeTimePlayerId || initialTeeTimePlayerId
    }

    // Add rental fee if provided
    if (formData.rentalFee) {
      input.rentalFee = parseFloat(formData.rentalFee)
    }

    // Add notes if provided
    if (formData.notes.trim()) {
      input.notes = formData.notes.trim()
    }

    assignMutation.mutate({ input })
  }

  if (!equipment) return null

  const CategoryIcon = getIconComponent(equipment.category?.icon || 'Package')

  const footer = (
    <div className="flex items-center justify-end gap-3 w-full">
      <button
        onClick={onClose}
        className="px-4 py-2 border border-border rounded-md font-medium hover:bg-muted/50 transition-colors"
      >
        Cancel
      </button>
      <button
        onClick={handleAssign}
        disabled={isSubmitting}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
      >
        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
        Assign Equipment
      </button>
    </div>
  )

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Assign Equipment"
      subtitle={`Checking out ${equipment.name}`}
      footer={footer}
      size="md"
    >
      <div className="space-y-6">
        {/* Error Banner */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 rounded-lg">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Equipment Info Card */}
        <div className="p-4 bg-muted/30 rounded-lg border">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: (equipment.category?.color || '#64748B') + '20' }}
            >
              <CategoryIcon
                className="h-6 w-6"
                style={{ color: equipment.category?.color || '#64748B' }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-foreground">{equipment.name}</div>
              <div className="text-sm text-muted-foreground">
                {equipment.assetNumber} • {equipment.category?.name}
              </div>
            </div>
            <div className={cn(
              'px-2 py-1 rounded text-xs font-medium',
              equipment.condition === 'EXCELLENT' && 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300',
              equipment.condition === 'GOOD' && 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300',
              equipment.condition === 'FAIR' && 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300',
              equipment.condition === 'NEEDS_REPAIR' && 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300',
            )}>
              {equipment.condition}
            </div>
          </div>
        </div>

        {/* Member/Booking Info (if pre-filled) */}
        {(initialMemberName || initialBookingNumber) && (
          <div className="space-y-3">
            <h3 className="font-medium text-foreground flex items-center gap-2">
              <User className="h-4 w-4" />
              Assignment To
            </h3>
            <div className="p-3 bg-blue-50 dark:bg-blue-500/10 rounded-lg border border-blue-200 dark:border-blue-500/30">
              {initialMemberName && (
                <div className="font-medium text-blue-900 dark:text-blue-100">{initialMemberName}</div>
              )}
              {initialBookingNumber && (
                <div className="text-sm text-blue-700 dark:text-blue-300">
                  Booking #{initialBookingNumber}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Manual Booking Reference (if no pre-fill) */}
        {!initialBookingId && !initialTeeTimePlayerId && (
          <div className="space-y-3">
            <h3 className="font-medium text-foreground flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Booking Reference (Optional)
            </h3>
            <input
              type="text"
              value={formData.bookingReference}
              onChange={(e) => setFormData({ ...formData, bookingReference: e.target.value })}
              placeholder="Enter booking number or leave blank for walk-in"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <p className="text-xs text-muted-foreground">
              You can assign equipment without a booking reference for walk-in rentals.
            </p>
          </div>
        )}

        {/* Rental Fee */}
        <div className="space-y-3">
          <h3 className="font-medium text-foreground flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Rental Fee
          </h3>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">฿</span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.rentalFee}
              onChange={(e) => setFormData({ ...formData, rentalFee: e.target.value })}
              placeholder="0.00"
              className="w-full pl-7 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          {equipment.category?.defaultRentalRate && (
            <p className="text-xs text-muted-foreground">
              Default rate: ฿{equipment.category.defaultRentalRate.toLocaleString()}
            </p>
          )}
        </div>

        {/* Condition at Checkout */}
        <div className="space-y-3">
          <h3 className="font-medium text-foreground flex items-center gap-2">
            <ClipboardCheck className="h-4 w-4" />
            Condition at Checkout
          </h3>
          <div className="grid grid-cols-4 gap-2">
            {CONDITION_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setFormData({ ...formData, conditionAtCheckout: option.value })}
                className={cn(
                  'py-2 px-2 text-xs font-medium rounded-md border transition-all text-center',
                  formData.conditionAtCheckout === option.value
                    ? option.color === 'emerald'
                      ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/30'
                      : option.color === 'blue'
                      ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-500/30'
                      : option.color === 'amber'
                      ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-500/30'
                      : 'bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-300 border-orange-300 dark:border-orange-500/30'
                    : 'hover:border-muted-foreground/30'
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-3">
          <h3 className="font-medium text-foreground">Notes</h3>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Any notes about this checkout..."
            rows={2}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />
        </div>
      </div>
    </Modal>
  )
}
