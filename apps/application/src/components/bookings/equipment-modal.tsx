'use client'

import { useState, useEffect } from 'react'
import { cn } from '@clubvantage/ui'
import { Loader2, AlertCircle, Trash2, ChevronDown } from 'lucide-react'
import { getEquipmentIcon } from './equipment-icon-map'
import { Modal } from '../golf/modal'
import { useEquipmentCategories, type EquipmentCategory } from '@/hooks/use-equipment'
import {
  useCreateEquipmentMutation,
  useUpdateEquipmentMutation,
  useDeleteEquipmentMutation,
  type EquipmentCondition,
} from '@clubvantage/api-client'
import { useQueryClient } from '@tanstack/react-query'

// Extended equipment type for the modal (includes more details than the list view)
export interface EquipmentItem {
  id: string
  categoryId: string
  assetNumber: string
  name: string
  serialNumber?: string
  manufacturer?: string
  model?: string
  purchaseDate?: string
  warrantyExpiry?: string
  condition: string
  status: string
  location?: string
  notes?: string
  category?: {
    id: string
    name: string
    icon?: string
    color?: string
  }
}

export interface EquipmentModalProps {
  isOpen: boolean
  onClose: () => void
  equipment?: EquipmentItem | null
  onSuccess?: () => void
  defaultCategoryId?: string
}

const CONDITION_OPTIONS: { value: EquipmentCondition; label: string; color: string }[] = [
  { value: 'EXCELLENT', label: 'Excellent', color: 'emerald' },
  { value: 'GOOD', label: 'Good', color: 'blue' },
  { value: 'FAIR', label: 'Fair', color: 'amber' },
  { value: 'NEEDS_REPAIR', label: 'Needs Repair', color: 'orange' },
  { value: 'OUT_OF_SERVICE', label: 'Out of Service', color: 'red' },
]

interface FormData {
  categoryId: string
  assetNumber: string
  name: string
  serialNumber: string
  manufacturer: string
  model: string
  purchaseDate: string
  warrantyExpiry: string
  condition: EquipmentCondition
  location: string
  notes: string
}

const defaultFormData: FormData = {
  categoryId: '',
  assetNumber: '',
  name: '',
  serialNumber: '',
  manufacturer: '',
  model: '',
  purchaseDate: '',
  warrantyExpiry: '',
  condition: 'GOOD',
  location: '',
  notes: '',
}

export function EquipmentModal({
  isOpen,
  onClose,
  equipment,
  onSuccess,
  defaultCategoryId,
}: EquipmentModalProps) {
  const isEditMode = !!equipment
  const queryClient = useQueryClient()
  const { categories, isLoading: categoriesLoading } = useEquipmentCategories()

  const [formData, setFormData] = useState<FormData>(defaultFormData)
  const [error, setError] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)

  const createMutation = useCreateEquipmentMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['GetEquipment'] })
      queryClient.invalidateQueries({ queryKey: ['GetEquipmentCategories'] })
      onSuccess?.()
      onClose()
    },
    onError: (err: Error) => {
      setError(err.message || 'Failed to create equipment')
    },
  })

  const updateMutation = useUpdateEquipmentMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['GetEquipment'] })
      queryClient.invalidateQueries({ queryKey: ['GetEquipmentCategories'] })
      onSuccess?.()
      onClose()
    },
    onError: (err: Error) => {
      setError(err.message || 'Failed to update equipment')
    },
  })

  const deleteMutation = useDeleteEquipmentMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['GetEquipment'] })
      queryClient.invalidateQueries({ queryKey: ['GetEquipmentCategories'] })
      onSuccess?.()
      onClose()
    },
    onError: (err: Error) => {
      setError(err.message || 'Failed to delete equipment')
    },
  })

  const isSubmitting = createMutation.isPending || updateMutation.isPending
  const isDeleting = deleteMutation.isPending

  // Get selected category
  const selectedCategory = categories.find((c: EquipmentCategory) => c.id === formData.categoryId)

  // Get the icon component from static map (avoids importing all 400+ lucide icons)
  const getIconComponent = getEquipmentIcon

  // Populate form when editing or when defaultCategoryId changes
  useEffect(() => {
    if (equipment) {
      setFormData({
        categoryId: equipment.categoryId || equipment.category?.id || '',
        assetNumber: equipment.assetNumber,
        name: equipment.name,
        serialNumber: equipment.serialNumber || '',
        manufacturer: equipment.manufacturer || '',
        model: equipment.model || '',
        purchaseDate: equipment.purchaseDate ? String(equipment.purchaseDate).split('T')[0] ?? '' : '',
        warrantyExpiry: equipment.warrantyExpiry ? String(equipment.warrantyExpiry).split('T')[0] ?? '' : '',
        condition: (equipment.condition as EquipmentCondition) || 'GOOD',
        location: equipment.location || '',
        notes: equipment.notes || '',
      })
    } else {
      setFormData({
        ...defaultFormData,
        categoryId: defaultCategoryId || '',
      })
    }
    setError(null)
    setShowDeleteConfirm(false)
  }, [equipment, defaultCategoryId, isOpen])

  const handleSave = async () => {
    if (!formData.categoryId) {
      setError('Please select a category')
      return
    }
    if (!formData.assetNumber.trim()) {
      setError('Asset number is required')
      return
    }
    if (!formData.name.trim()) {
      setError('Equipment name is required')
      return
    }

    setError(null)

    if (isEditMode && equipment) {
      updateMutation.mutate({
        input: {
          id: equipment.id,
          name: formData.name.trim(),
          serialNumber: formData.serialNumber.trim() || undefined,
          manufacturer: formData.manufacturer.trim() || undefined,
          model: formData.model.trim() || undefined,
          purchaseDate: formData.purchaseDate || undefined,
          warrantyExpiry: formData.warrantyExpiry || undefined,
          condition: formData.condition,
          location: formData.location.trim() || undefined,
          notes: formData.notes.trim() || undefined,
        },
      })
    } else {
      createMutation.mutate({
        input: {
          categoryId: formData.categoryId,
          assetNumber: formData.assetNumber.trim(),
          name: formData.name.trim(),
          serialNumber: formData.serialNumber.trim() || undefined,
          manufacturer: formData.manufacturer.trim() || undefined,
          model: formData.model.trim() || undefined,
          purchaseDate: formData.purchaseDate || undefined,
          warrantyExpiry: formData.warrantyExpiry || undefined,
          condition: formData.condition,
          location: formData.location.trim() || undefined,
          notes: formData.notes.trim() || undefined,
        },
      })
    }
  }

  const handleDelete = async () => {
    if (!equipment) return
    deleteMutation.mutate({ id: equipment.id })
  }

  const footer = (
    <div className="flex items-center justify-between w-full">
      <div>
        {isEditMode && (
          showDeleteConfirm ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-red-600">Delete this equipment?</span>
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
          {isEditMode ? 'Save Changes' : 'Create Equipment'}
        </button>
      </div>
    </div>
  )

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Edit Equipment' : 'Add Equipment'}
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

        {/* Category Selection */}
        <div className="space-y-4">
          <h3 className="font-medium text-foreground">Category</h3>

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
              disabled={isEditMode || categoriesLoading}
              className={cn(
                'w-full flex items-center justify-between px-3 py-2.5 border rounded-md transition-colors',
                isEditMode ? 'bg-muted cursor-not-allowed' : 'hover:bg-muted/50',
                !formData.categoryId && 'text-muted-foreground'
              )}
            >
              <div className="flex items-center gap-2">
                {selectedCategory ? (
                  <>
                    <div
                      className="w-8 h-8 rounded-md flex items-center justify-center"
                      style={{ backgroundColor: (selectedCategory.color || '#64748B') + '20' }}
                    >
                      {(() => {
                        const IconComp = getIconComponent(selectedCategory.icon || 'Package')
                        return <IconComp className="h-4 w-4" style={{ color: selectedCategory.color || '#64748B' }} />
                      })()}
                    </div>
                    <span>{selectedCategory.name}</span>
                  </>
                ) : (
                  <span>{categoriesLoading ? 'Loading categories...' : 'Select a category'}</span>
                )}
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </button>

            {showCategoryDropdown && !isEditMode && (
              <div className="absolute z-50 mt-1 w-full bg-white dark:bg-stone-800 border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {categories.filter((c: EquipmentCategory) => c.isActive).map((category: EquipmentCategory) => {
                  const IconComp = getIconComponent(category.icon || 'Package')
                  return (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, categoryId: category.id })
                        setShowCategoryDropdown(false)
                      }}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-2.5 hover:bg-muted/50 transition-colors',
                        formData.categoryId === category.id && 'bg-primary/5'
                      )}
                    >
                      <div
                        className="w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: (category.color || '#64748B') + '20' }}
                      >
                        <IconComp className="h-4 w-4" style={{ color: category.color || '#64748B' }} />
                      </div>
                      <div className="text-left">
                        <div className="font-medium text-sm">{category.name}</div>
                        {category.description && (
                          <div className="text-xs text-muted-foreground truncate max-w-[300px]">
                            {category.description}
                          </div>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Basic Info */}
        <div className="space-y-4">
          <h3 className="font-medium text-foreground">Basic Information</h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Asset Number *
              </label>
              <input
                type="text"
                value={formData.assetNumber}
                onChange={(e) => setFormData({ ...formData, assetNumber: e.target.value })}
                placeholder="e.g., CART-001"
                disabled={isEditMode}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-muted disabled:cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Electric Golf Cart #1"
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Manufacturer
              </label>
              <input
                type="text"
                value={formData.manufacturer}
                onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                placeholder="e.g., Club Car"
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Model
              </label>
              <input
                type="text"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                placeholder="e.g., Tempo 2+2"
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Serial Number
              </label>
              <input
                type="text"
                value={formData.serialNumber}
                onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                placeholder="e.g., SN123456"
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        {/* Purchase & Warranty */}
        <div className="space-y-4">
          <h3 className="font-medium text-foreground">Purchase & Warranty</h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Purchase Date
              </label>
              <input
                type="date"
                value={formData.purchaseDate}
                onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Warranty Expiry
              </label>
              <input
                type="date"
                value={formData.warrantyExpiry}
                onChange={(e) => setFormData({ ...formData, warrantyExpiry: e.target.value })}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        {/* Condition */}
        <div className="space-y-4">
          <h3 className="font-medium text-foreground">Condition</h3>

          <div className="grid grid-cols-5 gap-2">
            {CONDITION_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setFormData({ ...formData, condition: option.value })}
                className={cn(
                  'py-2 px-2 text-xs font-medium rounded-md border transition-all text-center',
                  formData.condition === option.value
                    ? option.color === 'emerald'
                      ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/30'
                      : option.color === 'blue'
                      ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-500/30'
                      : option.color === 'amber'
                      ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-500/30'
                      : option.color === 'orange'
                      ? 'bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-300 border-orange-300 dark:border-orange-500/30'
                      : 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300 border-red-300 dark:border-red-500/30'
                    : 'hover:border-muted-foreground/30'
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Location & Notes */}
        <div className="space-y-4">
          <h3 className="font-medium text-foreground">Location & Notes</h3>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g., Cart Barn, Locker 12"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes about this equipment..."
              rows={3}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>
        </div>
      </div>
    </Modal>
  )
}
