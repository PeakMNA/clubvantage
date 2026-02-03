'use client'

import { useState, useEffect } from 'react'
import { cn } from '@clubvantage/ui'
import { Loader2, AlertCircle, Trash2, Check } from 'lucide-react'
import * as LucideIcons from 'lucide-react'
import { Modal } from '../golf/modal'
import type { EquipmentCategory } from '@/hooks/use-equipment'
import {
  useCreateEquipmentCategoryMutation,
  useUpdateEquipmentCategoryMutation,
  useDeleteEquipmentCategoryMutation,
  type EquipmentAttachmentType,
} from '@clubvantage/api-client'
import { useQueryClient } from '@tanstack/react-query'

export interface EquipmentCategoryModalProps {
  isOpen: boolean
  onClose: () => void
  category?: EquipmentCategory | null
  onSuccess?: () => void
}

// Common icons for equipment categories
const ICON_OPTIONS = [
  'Car', 'Bike', 'Flag', 'Circle', 'CircleDot', 'ShoppingCart',
  'Dumbbell', 'Waves', 'Sparkles', 'UtensilsCrossed', 'Users',
  'Baby', 'Projector', 'Speaker', 'Table2', 'Armchair',
  'Package', 'Box', 'Wrench', 'Settings', 'Trophy',
] as const

// Preset colors for categories
const COLOR_OPTIONS = [
  { name: 'Emerald', value: '#10B981' },
  { name: 'Blue', value: '#3B82F6' },
  { name: 'Indigo', value: '#6366F1' },
  { name: 'Amber', value: '#F59E0B' },
  { name: 'Red', value: '#EF4444' },
  { name: 'Lime', value: '#84CC16' },
  { name: 'Violet', value: '#8B5CF6' },
  { name: 'Pink', value: '#EC4899' },
  { name: 'Teal', value: '#14B8A6' },
  { name: 'Slate', value: '#64748B' },
  { name: 'Orange', value: '#F97316' },
  { name: 'Cyan', value: '#06B6D4' },
]

const ATTACHMENT_TYPES: { value: EquipmentAttachmentType; label: string; description: string }[] = [
  {
    value: 'OPTIONAL_ADDON',
    label: 'Optional Add-on',
    description: 'Can be added to bookings (e.g., golf carts, rental clubs)',
  },
  {
    value: 'REQUIRED_RESOURCE',
    label: 'Required Resource',
    description: 'Required for service delivery (e.g., equipment for spa treatments)',
  },
]

interface FormData {
  code: string
  name: string
  description: string
  icon: string
  color: string
  attachmentType: EquipmentAttachmentType
  defaultRentalRate: string
  requiresDeposit: boolean
  depositAmount: string
  isActive: boolean
}

const defaultFormData: FormData = {
  code: '',
  name: '',
  description: '',
  icon: 'Package',
  color: '#10B981',
  attachmentType: 'OPTIONAL_ADDON',
  defaultRentalRate: '',
  requiresDeposit: false,
  depositAmount: '',
  isActive: true,
}

export function EquipmentCategoryModal({
  isOpen,
  onClose,
  category,
  onSuccess,
}: EquipmentCategoryModalProps) {
  const isEditMode = !!category
  const queryClient = useQueryClient()

  const [formData, setFormData] = useState<FormData>(defaultFormData)
  const [error, setError] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showIconPicker, setShowIconPicker] = useState(false)
  const [showColorPicker, setShowColorPicker] = useState(false)

  const createMutation = useCreateEquipmentCategoryMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['GetEquipmentCategories'] })
      onSuccess?.()
      onClose()
    },
    onError: (err: Error) => {
      setError(err.message || 'Failed to create category')
    },
  })

  const updateMutation = useUpdateEquipmentCategoryMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['GetEquipmentCategories'] })
      onSuccess?.()
      onClose()
    },
    onError: (err: Error) => {
      setError(err.message || 'Failed to update category')
    },
  })

  const deleteMutation = useDeleteEquipmentCategoryMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['GetEquipmentCategories'] })
      onSuccess?.()
      onClose()
    },
    onError: (err: Error) => {
      setError(err.message || 'Failed to delete category')
    },
  })

  const isSubmitting = createMutation.isPending || updateMutation.isPending
  const isDeleting = deleteMutation.isPending

  // Populate form when editing
  useEffect(() => {
    if (category) {
      setFormData({
        code: category.code,
        name: category.name,
        description: category.description || '',
        icon: category.icon || 'Package',
        color: category.color || '#10B981',
        attachmentType: (category.attachmentType as EquipmentAttachmentType) || 'OPTIONAL_ADDON',
        defaultRentalRate: category.defaultRentalRate?.toString() || '',
        requiresDeposit: category.requiresDeposit,
        depositAmount: category.depositAmount?.toString() || '',
        isActive: category.isActive,
      })
    } else {
      setFormData(defaultFormData)
    }
    setError(null)
    setShowDeleteConfirm(false)
  }, [category, isOpen])

  const handleSave = async () => {
    if (!formData.code.trim()) {
      setError('Category code is required')
      return
    }
    if (!formData.name.trim()) {
      setError('Category name is required')
      return
    }

    setError(null)

    const input = {
      code: formData.code.trim().toUpperCase().replace(/\s+/g, '_'),
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      icon: formData.icon,
      color: formData.color,
      attachmentType: formData.attachmentType,
      defaultRentalRate: formData.defaultRentalRate ? parseFloat(formData.defaultRentalRate) : undefined,
      requiresDeposit: formData.requiresDeposit,
      depositAmount: formData.depositAmount ? parseFloat(formData.depositAmount) : undefined,
    }

    if (isEditMode && category) {
      updateMutation.mutate({
        input: {
          id: category.id,
          ...input,
          isActive: formData.isActive,
        },
      })
    } else {
      createMutation.mutate({ input })
    }
  }

  const handleDelete = async () => {
    if (!category) return
    deleteMutation.mutate({ id: category.id })
  }

  // Get the icon component dynamically
  const getIconComponent = (iconName: string): LucideIcons.LucideIcon => {
    const icons = LucideIcons as unknown as Record<string, LucideIcons.LucideIcon>
    return icons[iconName] || LucideIcons.Package
  }

  const SelectedIcon = getIconComponent(formData.icon)

  const footer = (
    <div className="flex items-center justify-between w-full">
      <div>
        {isEditMode && (
          showDeleteConfirm ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-red-600">Delete this category?</span>
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
          {isEditMode ? 'Save Changes' : 'Create Category'}
        </button>
      </div>
    </div>
  )

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Edit Equipment Category' : 'New Equipment Category'}
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Code *
              </label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase().replace(/\s+/g, '_') })}
                placeholder="e.g., GOLF_CARTS"
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
                placeholder="e.g., Golf Carts"
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of this equipment category..."
              rows={2}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>
        </div>

        {/* Appearance */}
        <div className="space-y-4">
          <h3 className="font-medium text-foreground">Appearance</h3>

          <div className="grid grid-cols-2 gap-4">
            {/* Icon Picker */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Icon
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowIconPicker(!showIconPicker)}
                  className="w-full flex items-center gap-2 px-3 py-2 border rounded-md hover:bg-muted/50 transition-colors"
                >
                  <div
                    className="w-8 h-8 rounded-md flex items-center justify-center"
                    style={{ backgroundColor: formData.color + '20' }}
                  >
                    <SelectedIcon className="h-5 w-5" style={{ color: formData.color }} />
                  </div>
                  <span className="text-sm">{formData.icon}</span>
                </button>

                {showIconPicker && (
                  <div className="absolute z-50 mt-1 p-3 bg-white dark:bg-stone-800 border rounded-lg shadow-lg max-h-48 overflow-y-auto w-full">
                    <div className="grid grid-cols-5 gap-2">
                      {ICON_OPTIONS.map((iconName) => {
                        const IconComp = getIconComponent(iconName)
                        return (
                          <button
                            key={iconName}
                            type="button"
                            onClick={() => {
                              setFormData({ ...formData, icon: iconName })
                              setShowIconPicker(false)
                            }}
                            className={cn(
                              'p-2 rounded-md transition-colors',
                              formData.icon === iconName
                                ? 'bg-primary/10 ring-2 ring-primary'
                                : 'hover:bg-muted/50'
                            )}
                            title={iconName}
                          >
                            <IconComp className="h-5 w-5 mx-auto" />
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Color Picker */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Color
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowColorPicker(!showColorPicker)}
                  className="w-full flex items-center gap-2 px-3 py-2 border rounded-md hover:bg-muted/50 transition-colors"
                >
                  <div
                    className="w-6 h-6 rounded-full border-2 border-white shadow"
                    style={{ backgroundColor: formData.color }}
                  />
                  <span className="text-sm">{formData.color}</span>
                </button>

                {showColorPicker && (
                  <div className="absolute z-50 mt-1 p-3 bg-white dark:bg-stone-800 border rounded-lg shadow-lg w-full">
                    <div className="grid grid-cols-6 gap-2">
                      {COLOR_OPTIONS.map((color) => (
                        <button
                          key={color.value}
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, color: color.value })
                            setShowColorPicker(false)
                          }}
                          className={cn(
                            'w-8 h-8 rounded-full border-2 transition-all',
                            formData.color === color.value
                              ? 'ring-2 ring-primary ring-offset-2'
                              : 'border-white shadow hover:scale-110'
                          )}
                          style={{ backgroundColor: color.value }}
                          title={color.name}
                        />
                      ))}
                    </div>
                    {/* Custom color input */}
                    <div className="mt-2 pt-2 border-t">
                      <input
                        type="color"
                        value={formData.color}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        className="w-full h-8 rounded cursor-pointer"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Attachment Type */}
        <div className="space-y-4">
          <h3 className="font-medium text-foreground">Attachment Type</h3>

          <div className="grid grid-cols-2 gap-3">
            {ATTACHMENT_TYPES.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => setFormData({ ...formData, attachmentType: type.value })}
                className={cn(
                  'p-4 rounded-lg border text-left transition-all',
                  formData.attachmentType === type.value
                    ? 'border-primary bg-primary/5 ring-2 ring-primary'
                    : 'hover:border-muted-foreground/30'
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{type.label}</span>
                  {formData.attachmentType === type.value && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{type.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Rental & Deposit */}
        <div className="space-y-4">
          <h3 className="font-medium text-foreground">Rental & Deposit</h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Default Rental Rate
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">฿</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.defaultRentalRate}
                  onChange={(e) => setFormData({ ...formData, defaultRentalRate: e.target.value })}
                  placeholder="0.00"
                  className="w-full pl-7 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div className="flex items-end gap-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.requiresDeposit}
                  onChange={(e) => setFormData({ ...formData, requiresDeposit: e.target.checked })}
                  className="w-4 h-4 rounded border-muted-foreground/30 text-primary focus:ring-primary"
                />
                <span className="text-sm font-medium">Requires Deposit</span>
              </label>
            </div>
          </div>

          {formData.requiresDeposit && (
            <div className="max-w-[calc(50%-0.5rem)]">
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Deposit Amount
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">฿</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.depositAmount}
                  onChange={(e) => setFormData({ ...formData, depositAmount: e.target.value })}
                  placeholder="0.00"
                  className="w-full pl-7 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          )}
        </div>

        {/* Status (Edit Mode Only) */}
        {isEditMode && (
          <div className="space-y-4">
            <h3 className="font-medium text-foreground">Status</h3>

            <div className="flex gap-2">
              {[
                { value: true, label: 'Active', color: 'emerald' },
                { value: false, label: 'Inactive', color: 'stone' },
              ].map((status) => (
                <button
                  key={String(status.value)}
                  type="button"
                  onClick={() => setFormData({ ...formData, isActive: status.value })}
                  className={cn(
                    'flex-1 py-2 px-3 text-sm rounded-md border transition-colors',
                    formData.isActive === status.value
                      ? status.color === 'emerald'
                        ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/30'
                        : 'bg-stone-100 dark:bg-stone-500/20 text-stone-700 dark:text-stone-300 border-stone-300 dark:border-stone-500/30'
                      : 'hover:border-muted-foreground/30'
                  )}
                >
                  {status.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}
