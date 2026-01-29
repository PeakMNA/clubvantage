'use client'

import { useState, useEffect } from 'react'
import { cn } from '@clubvantage/ui'
import { Loader2, AlertCircle, Trash2, Settings2 } from 'lucide-react'
import { Modal } from './modal'
import type { Course } from './types'

export interface CourseModalProps {
  isOpen: boolean
  onClose: () => void
  course?: Course | null
  onSave: (data: Omit<Course, 'id'>) => Promise<void>
  onDelete?: () => Promise<void>
}

const HOLE_OPTIONS: Course['holes'][] = [9, 18, 27, 36]

export function CourseModal({
  isOpen,
  onClose,
  course,
  onSave,
  onDelete,
}: CourseModalProps) {
  const isEditMode = !!course

  const [formData, setFormData] = useState({
    name: '',
    holes: 18 as Course['holes'],
    par: 72,
    rating: 72.0,
    slope: 113,
    status: 'active' as Course['status'],
    condition: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Populate form when editing
  useEffect(() => {
    if (course) {
      setFormData({
        name: course.name,
        holes: course.holes,
        par: course.par,
        rating: course.rating,
        slope: course.slope,
        status: course.status,
        condition: course.condition || '',
      })
    } else {
      setFormData({
        name: '',
        holes: 18,
        par: 72,
        rating: 72.0,
        slope: 113,
        status: 'active',
        condition: '',
      })
    }
  }, [course, isOpen])

  const handleSave = async () => {
    if (!formData.name.trim()) {
      setError('Course name is required')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      await onSave(formData)
      onClose()
    } catch (err) {
      setError('Failed to save course. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!onDelete) return

    setIsDeleting(true)
    setError(null)

    try {
      await onDelete()
      onClose()
    } catch (err) {
      setError('Failed to delete course. Please try again.')
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
              <span className="text-sm text-red-600">Delete this course?</span>
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
          {isEditMode ? 'Save Changes' : 'Create Course'}
        </button>
      </div>
    </div>
  )

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Edit Course' : 'Add Course'}
      footer={footer}
      size="lg"
    >
      <div className="space-y-6">
        {/* Error Banner */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 rounded-lg">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Basic Info */}
        <div className="space-y-4">
          <h3 className="font-medium text-foreground">Basic Information</h3>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Course Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Main Course"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Number of Holes
            </label>
            <div className="flex gap-2">
              {HOLE_OPTIONS.map((holes) => (
                <button
                  key={holes}
                  onClick={() => setFormData({ ...formData, holes })}
                  className={cn(
                    'flex-1 py-2 px-3 text-sm rounded-md border transition-colors',
                    formData.holes === holes
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'hover:border-border'
                  )}
                >
                  {holes}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Description
            </label>
            <textarea
              value={formData.condition}
              onChange={(e) =>
                setFormData({ ...formData, condition: e.target.value })
              }
              placeholder="Course description or current conditions..."
              rows={2}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>
        </div>

        {/* Course Details */}
        <div className="space-y-4">
          <h3 className="font-medium text-foreground">Course Details</h3>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Par
              </label>
              <input
                type="number"
                value={formData.par}
                onChange={(e) =>
                  setFormData({ ...formData, par: parseInt(e.target.value) || 72 })
                }
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Course Rating
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.rating}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    rating: parseFloat(e.target.value) || 72.0,
                  })
                }
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Slope Rating
              </label>
              <input
                type="number"
                value={formData.slope}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    slope: parseInt(e.target.value) || 113,
                  })
                }
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        {/* Tee Time Configuration Note */}
        <div className="space-y-4">
          <h3 className="font-medium text-foreground">Tee Time Configuration</h3>

          <div className="flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-lg">
            <Settings2 className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-amber-900 dark:text-amber-200 font-medium">
                Schedule settings are configured in the Settings tab
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                Configure operating hours, intervals, seasons, and holidays from Golf → Settings → Schedule Configuration
              </p>
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="space-y-4">
          <h3 className="font-medium text-foreground">Status</h3>

          <div className="flex gap-2">
            {(['active', 'maintenance', 'closed'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFormData({ ...formData, status })}
                className={cn(
                  'flex-1 py-2 px-3 text-sm rounded-md border transition-colors capitalize',
                  formData.status === status
                    ? status === 'active'
                      ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/30'
                      : status === 'maintenance'
                      ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-500/30'
                      : 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300 border-red-300 dark:border-red-500/30'
                    : 'hover:border-border'
                )}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  )
}
