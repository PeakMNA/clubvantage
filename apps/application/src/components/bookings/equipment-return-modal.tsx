'use client'

import { useState, useEffect } from 'react'
import { cn } from '@clubvantage/ui'
import { Loader2, AlertCircle, User, Clock, ArrowRight, AlertTriangle } from 'lucide-react'
import { getEquipmentIcon } from './equipment-icon-map'
import { Modal } from '../golf/modal'
import {
  useReturnEquipmentMutation,
  type EquipmentCondition,
} from '@clubvantage/api-client'
import { useQueryClient } from '@tanstack/react-query'

// Assignment data for return
export interface EquipmentAssignmentForReturn {
  id: string // Assignment ID
  equipmentId: string
  equipment: {
    id: string
    assetNumber: string
    name: string
    category?: {
      id: string
      name: string
      icon?: string
      color?: string
    }
  }
  member?: {
    id: string
    firstName: string
    lastName: string
    memberId?: string
  }
  bookingNumber?: string
  assignedAt: string
  conditionAtCheckout?: string
  rentalFee?: number
  notes?: string
}

export interface EquipmentReturnModalProps {
  isOpen: boolean
  onClose: () => void
  assignment: EquipmentAssignmentForReturn | null
  onSuccess?: () => void
}

const CONDITION_OPTIONS: { value: EquipmentCondition; label: string; color: string; description: string }[] = [
  { value: 'EXCELLENT', label: 'Excellent', color: 'emerald', description: 'Like new condition' },
  { value: 'GOOD', label: 'Good', color: 'blue', description: 'Normal wear' },
  { value: 'FAIR', label: 'Fair', color: 'amber', description: 'Minor issues' },
  { value: 'NEEDS_REPAIR', label: 'Needs Repair', color: 'orange', description: 'Requires maintenance' },
  { value: 'OUT_OF_SERVICE', label: 'Out of Service', color: 'red', description: 'Cannot be used' },
]

interface FormData {
  conditionAtReturn: EquipmentCondition
  notes: string
  hasDamage: boolean
}

export function EquipmentReturnModal({
  isOpen,
  onClose,
  assignment,
  onSuccess,
}: EquipmentReturnModalProps) {
  const queryClient = useQueryClient()

  const [formData, setFormData] = useState<FormData>({
    conditionAtReturn: 'GOOD',
    notes: '',
    hasDamage: false,
  })
  const [error, setError] = useState<string | null>(null)

  const returnMutation = useReturnEquipmentMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['GetEquipment'] })
      queryClient.invalidateQueries({ queryKey: ['GetEquipmentCategories'] })
      onSuccess?.()
      onClose()
    },
    onError: (err: Error) => {
      setError(err.message || 'Failed to return equipment')
    },
  })

  const isSubmitting = returnMutation.isPending

  // Get the icon component from static map (avoids importing all 400+ lucide icons)
  const getIconComponent = getEquipmentIcon

  // Format date for display
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  // Calculate duration
  const calculateDuration = (startDate: string) => {
    const start = new Date(startDate)
    const now = new Date()
    const diffMs = now.getTime() - start.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

    if (diffHours > 24) {
      const days = Math.floor(diffHours / 24)
      return `${days} day${days > 1 ? 's' : ''}`
    }
    if (diffHours > 0) {
      return `${diffHours}h ${diffMins}m`
    }
    return `${diffMins}m`
  }

  // Initialize form when modal opens
  useEffect(() => {
    if (isOpen && assignment) {
      // Default to the condition at checkout, or GOOD if not set
      const defaultCondition = (assignment.conditionAtCheckout as EquipmentCondition) || 'GOOD'
      setFormData({
        conditionAtReturn: defaultCondition,
        notes: '',
        hasDamage: false,
      })
      setError(null)
    }
  }, [isOpen, assignment])

  // Check if condition has degraded
  const conditionDegraded = () => {
    if (!assignment?.conditionAtCheckout) return false
    const checkoutIndex = CONDITION_OPTIONS.findIndex(c => c.value === assignment.conditionAtCheckout)
    const returnIndex = CONDITION_OPTIONS.findIndex(c => c.value === formData.conditionAtReturn)
    return returnIndex > checkoutIndex
  }

  const handleReturn = async () => {
    if (!assignment) return

    setError(null)

    const input: {
      assignmentId: string
      conditionAtReturn?: EquipmentCondition
      notes?: string
    } = {
      assignmentId: assignment.id,
      conditionAtReturn: formData.conditionAtReturn,
    }

    // Add notes if provided or if damage reported
    if (formData.notes.trim()) {
      input.notes = formData.notes.trim()
    }

    returnMutation.mutate({ input })
  }

  if (!assignment) return null

  const CategoryIcon = getIconComponent(assignment.equipment.category?.icon || 'Package')
  const memberName = assignment.member
    ? `${assignment.member.firstName} ${assignment.member.lastName}`
    : 'Unknown Member'

  const footer = (
    <div className="flex items-center justify-end gap-3 w-full">
      <button
        onClick={onClose}
        className="px-4 py-2 border border-border rounded-md font-medium hover:bg-muted/50 transition-colors"
      >
        Cancel
      </button>
      <button
        onClick={handleReturn}
        disabled={isSubmitting}
        className={cn(
          "px-4 py-2 rounded-md font-medium transition-colors disabled:opacity-50 flex items-center gap-2",
          conditionDegraded()
            ? "bg-amber-600 hover:bg-amber-700 text-white"
            : "bg-primary text-primary-foreground hover:bg-primary/90"
        )}
      >
        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
        {conditionDegraded() ? 'Return with Damage Report' : 'Return Equipment'}
      </button>
    </div>
  )

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Return Equipment"
      subtitle={`Checking in ${assignment.equipment.name}`}
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

        {/* Equipment & Assignment Info */}
        <div className="p-4 bg-muted/30 rounded-lg border space-y-4">
          {/* Equipment */}
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: (assignment.equipment.category?.color || '#64748B') + '20' }}
            >
              <CategoryIcon
                className="h-6 w-6"
                style={{ color: assignment.equipment.category?.color || '#64748B' }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-foreground">{assignment.equipment.name}</div>
              <div className="text-sm text-muted-foreground">
                {assignment.equipment.assetNumber} • {assignment.equipment.category?.name}
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-border" />

          {/* Assignment Details */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-muted-foreground">Assigned to</div>
                <div className="font-medium">{memberName}</div>
                {assignment.member?.memberId && (
                  <div className="text-xs text-muted-foreground">{assignment.member.memberId}</div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-muted-foreground">Checked out</div>
                <div className="font-medium">{formatDateTime(assignment.assignedAt)}</div>
                <div className="text-xs text-muted-foreground">
                  Duration: {calculateDuration(assignment.assignedAt)}
                </div>
              </div>
            </div>
          </div>

          {/* Rental Fee & Booking */}
          {(assignment.rentalFee || assignment.bookingNumber) && (
            <>
              <div className="border-t border-border" />
              <div className="flex items-center justify-between text-sm">
                {assignment.bookingNumber && (
                  <div className="text-muted-foreground">
                    Booking #{assignment.bookingNumber}
                  </div>
                )}
                {assignment.rentalFee && (
                  <div className="font-medium">
                    Rental: ฿{assignment.rentalFee.toLocaleString()}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Condition Comparison */}
        <div className="space-y-3">
          <h3 className="font-medium text-foreground">Condition</h3>

          {/* Checkout vs Return comparison */}
          {assignment.conditionAtCheckout && (
            <div className="flex items-center gap-3 text-sm mb-3">
              <div className={cn(
                'px-2 py-1 rounded',
                assignment.conditionAtCheckout === 'EXCELLENT' && 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300',
                assignment.conditionAtCheckout === 'GOOD' && 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300',
                assignment.conditionAtCheckout === 'FAIR' && 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300',
                assignment.conditionAtCheckout === 'NEEDS_REPAIR' && 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300',
              )}>
                {assignment.conditionAtCheckout} at checkout
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <div className={cn(
                'px-2 py-1 rounded',
                formData.conditionAtReturn === 'EXCELLENT' && 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300',
                formData.conditionAtReturn === 'GOOD' && 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300',
                formData.conditionAtReturn === 'FAIR' && 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300',
                formData.conditionAtReturn === 'NEEDS_REPAIR' && 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300',
                formData.conditionAtReturn === 'OUT_OF_SERVICE' && 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300',
              )}>
                {formData.conditionAtReturn} at return
              </div>
            </div>
          )}

          {/* Condition Selector */}
          <div className="grid grid-cols-1 gap-2">
            {CONDITION_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setFormData({ ...formData, conditionAtReturn: option.value })}
                className={cn(
                  'flex items-center justify-between p-3 rounded-lg border transition-all text-left',
                  formData.conditionAtReturn === option.value
                    ? option.color === 'emerald'
                      ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-300 dark:border-emerald-500/30 ring-2 ring-emerald-500'
                      : option.color === 'blue'
                      ? 'bg-blue-50 dark:bg-blue-500/10 border-blue-300 dark:border-blue-500/30 ring-2 ring-blue-500'
                      : option.color === 'amber'
                      ? 'bg-amber-50 dark:bg-amber-500/10 border-amber-300 dark:border-amber-500/30 ring-2 ring-amber-500'
                      : option.color === 'orange'
                      ? 'bg-orange-50 dark:bg-orange-500/10 border-orange-300 dark:border-orange-500/30 ring-2 ring-orange-500'
                      : 'bg-red-50 dark:bg-red-500/10 border-red-300 dark:border-red-500/30 ring-2 ring-red-500'
                    : 'hover:border-muted-foreground/30'
                )}
              >
                <div>
                  <div className={cn(
                    'font-medium text-sm',
                    formData.conditionAtReturn === option.value
                      ? option.color === 'emerald' ? 'text-emerald-700 dark:text-emerald-300'
                        : option.color === 'blue' ? 'text-blue-700 dark:text-blue-300'
                        : option.color === 'amber' ? 'text-amber-700 dark:text-amber-300'
                        : option.color === 'orange' ? 'text-orange-700 dark:text-orange-300'
                        : 'text-red-700 dark:text-red-300'
                      : 'text-foreground'
                  )}>
                    {option.label}
                  </div>
                  <div className="text-xs text-muted-foreground">{option.description}</div>
                </div>
                {formData.conditionAtReturn === option.value && (
                  <div className={cn(
                    'w-2 h-2 rounded-full',
                    option.color === 'emerald' && 'bg-emerald-500',
                    option.color === 'blue' && 'bg-blue-500',
                    option.color === 'amber' && 'bg-amber-500',
                    option.color === 'orange' && 'bg-orange-500',
                    option.color === 'red' && 'bg-red-500',
                  )} />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Damage Warning */}
        {conditionDegraded() && (
          <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-500/10 text-amber-800 dark:text-amber-200 rounded-lg border border-amber-200 dark:border-amber-500/30">
            <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-medium text-sm">Condition Degraded</div>
              <p className="text-xs mt-0.5">
                The equipment condition has worsened since checkout. Please add notes describing the damage or issues.
              </p>
            </div>
          </div>
        )}

        {/* Notes */}
        <div className="space-y-3">
          <h3 className="font-medium text-foreground">
            Return Notes {conditionDegraded() && <span className="text-red-500">*</span>}
          </h3>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder={conditionDegraded()
              ? "Please describe the damage or issues..."
              : "Any notes about this return (optional)..."
            }
            rows={3}
            className={cn(
              "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 resize-none",
              conditionDegraded() && !formData.notes.trim()
                ? "border-amber-300 focus:ring-amber-500"
                : "focus:ring-primary"
            )}
          />
        </div>
      </div>
    </Modal>
  )
}
