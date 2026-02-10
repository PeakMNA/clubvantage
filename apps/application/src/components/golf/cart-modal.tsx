'use client'

import { useState } from 'react'
import { cn } from '@clubvantage/ui'
import { Loader2, AlertCircle, Trash2 } from 'lucide-react'
import { Modal } from './modal'
import type { Cart } from './types'

export interface CartModalProps {
  isOpen: boolean
  onClose: () => void
  cart?: Cart | null
  onSave: (data: Omit<Cart, 'id'>) => Promise<void>
  onDelete?: () => Promise<void>
}

function getInitialCartForm(cart?: Cart | null) {
  if (cart) {
    return {
      number: cart.number,
      type: cart.type,
      status: cart.status,
      conditionNotes: cart.conditionNotes || '',
      lastMaintenance: cart.lastMaintenance || '',
      currentAssignment: cart.currentAssignment,
    }
  }
  return {
    number: '',
    type: '2-seater' as Cart['type'],
    status: 'AVAILABLE' as Cart['status'],
    conditionNotes: '',
    lastMaintenance: '',
    currentAssignment: undefined as string | undefined,
  }
}

export function CartModal({
  isOpen,
  onClose,
  cart,
  onSave,
  onDelete,
}: CartModalProps) {
  const isEditMode = !!cart

  const formKey = `${isOpen}-${cart?.id ?? 'new'}`
  const [prevFormKey, setPrevFormKey] = useState(formKey)
  const [formData, setFormData] = useState(() => getInitialCartForm(cart))
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  if (formKey !== prevFormKey) {
    setPrevFormKey(formKey)
    setFormData(getInitialCartForm(cart))
    setError(null)
    setShowDeleteConfirm(false)
  }

  const handleSave = async () => {
    if (!formData.number.trim()) {
      setError('Cart number is required')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      await onSave(formData)
      onClose()
    } catch (err) {
      setError('Failed to save cart. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!onDelete) return

    if (cart?.status === 'IN_USE') {
      setError('Cannot delete a cart that is currently in use')
      setShowDeleteConfirm(false)
      return
    }

    setIsDeleting(true)
    setError(null)

    try {
      await onDelete()
      onClose()
    } catch (err) {
      setError('Failed to delete cart. Please try again.')
    } finally {
      setIsDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  const footer = (
    <div className="flex items-center justify-between w-full">
      <div>
        {isEditMode && onDelete && (
          showDeleteConfirm ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-red-600">Delete this cart?</span>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Confirm'}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-3 py-1 text-sm border rounded hover:bg-muted/50"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-1 px-3 py-1 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          )
        )}
      </div>
      <div className="flex gap-3">
        <button
          onClick={onClose}
          className="px-4 py-2 border border-border rounded-md font-medium hover:bg-muted/50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={isSubmitting}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {isEditMode ? 'Save Changes' : 'Add Cart'}
        </button>
      </div>
    </div>
  )

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Edit Cart' : 'Add Cart'}
      footer={footer}
    >
      <div className="space-y-6">
        {/* Error Banner */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 rounded-lg">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Cart Details */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Cart Number/ID *
            </label>
            <input
              type="text"
              value={formData.number}
              onChange={(e) =>
                setFormData({ ...formData, number: e.target.value })
              }
              placeholder="e.g., 12 or A-05"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Type
            </label>
            <div className="flex gap-3">
              {(['2-seater', '4-seater'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setFormData({ ...formData, type })}
                  className={cn(
                    'flex-1 py-2 px-4 text-sm rounded-md border transition-colors',
                    formData.type === type
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'hover:border-border'
                  )}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  status: e.target.value as Cart['status'],
                })
              }
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="AVAILABLE">Available</option>
              <option value="IN_USE">In Use</option>
              <option value="MAINTENANCE">Maintenance</option>
              <option value="OUT_OF_SERVICE">Out of Service</option>
            </select>
          </div>
        </div>

        {/* Condition */}
        <div className="space-y-4">
          <h3 className="font-medium text-foreground">Condition</h3>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Condition Notes
            </label>
            <textarea
              value={formData.conditionNotes}
              onChange={(e) =>
                setFormData({ ...formData, conditionNotes: e.target.value })
              }
              placeholder="e.g., New battery installed 1/10"
              rows={2}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Last Maintenance Date
            </label>
            <input
              type="date"
              value={formData.lastMaintenance}
              onChange={(e) =>
                setFormData({ ...formData, lastMaintenance: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      </div>
    </Modal>
  )
}
