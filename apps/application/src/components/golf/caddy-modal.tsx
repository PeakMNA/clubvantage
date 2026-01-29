'use client'

import { useState, useEffect } from 'react'
import { cn } from '@clubvantage/ui'
import { Loader2, AlertCircle, Trash2, Star } from 'lucide-react'
import { Modal } from './modal'
import type { Caddy } from './types'

export interface CaddyModalProps {
  isOpen: boolean
  onClose: () => void
  caddy?: Caddy | null
  onSave: (data: Omit<Caddy, 'id'>) => Promise<void>
  onDelete?: () => Promise<void>
}

const SKILL_LEVELS: { id: Caddy['skillLevel']; label: string; stars: number }[] = [
  { id: 'beginner', label: 'Beginner', stars: 1 },
  { id: 'intermediate', label: 'Intermediate', stars: 2 },
  { id: 'advanced', label: 'Advanced', stars: 3 },
  { id: 'expert', label: 'Expert', stars: 4 },
]

export function CaddyModal({
  isOpen,
  onClose,
  caddy,
  onSave,
  onDelete,
}: CaddyModalProps) {
  const isEditMode = !!caddy

  const [formData, setFormData] = useState({
    name: '',
    skillLevel: 'intermediate' as Caddy['skillLevel'],
    status: 'available' as Caddy['status'],
    experience: 0,
    currentAssignment: undefined as string | undefined,
    notes: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    if (caddy) {
      setFormData({
        name: caddy.name,
        skillLevel: caddy.skillLevel,
        status: caddy.status,
        experience: caddy.experience,
        currentAssignment: caddy.currentAssignment,
        notes: caddy.notes || '',
      })
    } else {
      setFormData({
        name: '',
        skillLevel: 'intermediate',
        status: 'available',
        experience: 0,
        currentAssignment: undefined,
        notes: '',
      })
    }
  }, [caddy, isOpen])

  const handleSave = async () => {
    if (!formData.name.trim()) {
      setError('Caddy name is required')
      return
    }

    if (formData.experience < 0) {
      setError('Experience cannot be negative')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      await onSave(formData)
      onClose()
    } catch (err) {
      setError('Failed to save caddy. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!onDelete) return

    if (caddy?.status === 'assigned') {
      setError('Cannot delete a caddy that is currently assigned')
      setShowDeleteConfirm(false)
      return
    }

    setIsDeleting(true)
    setError(null)

    try {
      await onDelete()
      onClose()
    } catch (err) {
      setError('Failed to delete caddy. Please try again.')
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
              <span className="text-sm text-red-600">Delete this caddy?</span>
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
          {isEditMode ? 'Save Changes' : 'Add Caddy'}
        </button>
      </div>
    </div>
  )

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Edit Caddy' : 'Add Caddy'}
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

        {/* Caddy Details */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Enter caddy name"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Skill Level
            </label>
            <div className="grid grid-cols-2 gap-2">
              {SKILL_LEVELS.map((level) => (
                <button
                  key={level.id}
                  onClick={() => setFormData({ ...formData, skillLevel: level.id })}
                  className={cn(
                    'py-2 px-3 text-sm rounded-md border transition-colors flex items-center justify-center gap-2',
                    formData.skillLevel === level.id
                      ? level.id === 'beginner'
                        ? 'bg-gray-100 dark:bg-gray-500/20 text-muted-foreground border-border'
                        : level.id === 'intermediate'
                        ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-500/30'
                        : level.id === 'advanced'
                        ? 'bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-500/30'
                        : 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-500/30'
                      : 'hover:border-border'
                  )}
                >
                  <span className="flex">
                    {[...Array(level.stars)].map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          'h-3 w-3',
                          formData.skillLevel === level.id ? 'fill-current' : ''
                        )}
                      />
                    ))}
                  </span>
                  {level.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  status: e.target.value as Caddy['status'],
                })
              }
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="available">Available</option>
              <option value="assigned">Assigned</option>
              <option value="off-duty">Off Duty</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Experience
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={formData.experience}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    experience: Math.max(0, parseInt(e.target.value) || 0),
                  })
                }
                min={0}
                className="w-24 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <span className="text-sm text-muted-foreground">years</span>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="space-y-4">
          <h3 className="font-medium text-foreground">Additional Info</h3>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              placeholder="e.g., Specializes in course B, speaks English"
              rows={3}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>
        </div>
      </div>
    </Modal>
  )
}
