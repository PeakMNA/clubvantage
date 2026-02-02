'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { cn } from '@clubvantage/ui'
import { X, Loader2 } from 'lucide-react'
import { POSGridPreview } from '@clubvantage/ui'

// ============================================================================
// Types
// ============================================================================

export interface POSTemplateData {
  id: string
  name: string
  description?: string
  gridColumns: number
  gridRows: number
  tileSize: 'SMALL' | 'MEDIUM' | 'LARGE'
  showImages: boolean
  showPrices: boolean
  categoryStyle: 'TABS' | 'SIDEBAR' | 'DROPDOWN'
  showAllCategory: boolean
  quickKeysEnabled: boolean
  quickKeysCount: number
  quickKeysPosition: 'TOP' | 'LEFT'
  suggestionsEnabled: boolean
  suggestionsCount: number
  suggestionsPosition: 'TOP' | 'SIDEBAR' | 'FLOATING'
  timeOfDayWeight: number
  salesVelocityWeight: number
  staffHistoryWeight: number
}

export interface POSTemplateInput {
  name: string
  description?: string
  gridColumns: number
  gridRows: number
  tileSize: 'SMALL' | 'MEDIUM' | 'LARGE'
  showImages: boolean
  showPrices: boolean
  categoryStyle: 'TABS' | 'SIDEBAR' | 'DROPDOWN'
  showAllCategory: boolean
  quickKeysEnabled: boolean
  quickKeysCount: number
  quickKeysPosition: 'TOP' | 'LEFT'
  suggestionsEnabled: boolean
  suggestionsCount: number
  suggestionsPosition: 'TOP' | 'SIDEBAR' | 'FLOATING'
  timeOfDayWeight: number
  salesVelocityWeight: number
  staffHistoryWeight: number
}

export interface TemplateEditorModalProps {
  isOpen: boolean
  onClose: () => void
  template?: POSTemplateData | null  // null = create mode, template = edit mode
  onSave: (template: POSTemplateInput) => void
  isSaving?: boolean
}

// ============================================================================
// Constants
// ============================================================================

type TabKey = 'general' | 'grid' | 'quickKeys' | 'suggestions'

const TABS: { key: TabKey; label: string }[] = [
  { key: 'general', label: 'General' },
  { key: 'grid', label: 'Grid Layout' },
  { key: 'quickKeys', label: 'Quick Keys' },
  { key: 'suggestions', label: 'Suggestions' },
]

const DEFAULT_FORM_STATE: POSTemplateInput = {
  name: '',
  description: '',
  gridColumns: 6,
  gridRows: 4,
  tileSize: 'MEDIUM',
  showImages: true,
  showPrices: true,
  categoryStyle: 'TABS',
  showAllCategory: true,
  quickKeysEnabled: true,
  quickKeysCount: 8,
  quickKeysPosition: 'TOP',
  suggestionsEnabled: true,
  suggestionsCount: 6,
  suggestionsPosition: 'TOP',
  timeOfDayWeight: 40,
  salesVelocityWeight: 35,
  staffHistoryWeight: 25,
}

// ============================================================================
// Helper Components
// ============================================================================

interface ToggleSwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  label?: string
  description?: string
}

function ToggleSwitch({ checked, onChange, disabled, label, description }: ToggleSwitchProps) {
  return (
    <label className={cn(
      'flex items-start gap-3 cursor-pointer',
      disabled && 'opacity-50 cursor-not-allowed'
    )}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={cn(
          'relative inline-flex h-6 w-11 flex-shrink-0 rounded-full transition-colors duration-200 ease-in-out',
          'focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2',
          checked ? 'bg-amber-500' : 'bg-stone-200',
          disabled && 'pointer-events-none'
        )}
      >
        <span
          className={cn(
            'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
            checked ? 'translate-x-5' : 'translate-x-0.5',
            'mt-0.5'
          )}
        />
      </button>
      {(label || description) && (
        <div className="flex-1 min-w-0">
          {label && (
            <span className="text-sm font-medium text-stone-900 dark:text-stone-100">
              {label}
            </span>
          )}
          {description && (
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              {description}
            </p>
          )}
        </div>
      )}
    </label>
  )
}

interface SliderProps {
  value: number
  onChange: (value: number) => void
  min: number
  max: number
  disabled?: boolean
  label: string
  showPercentage?: boolean
}

function Slider({ value, onChange, min, max, disabled, label, showPercentage }: SliderProps) {
  return (
    <div className={cn('space-y-2', disabled && 'opacity-50')}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-stone-700 dark:text-stone-300">{label}</span>
        <span className="text-sm font-semibold text-amber-600">
          {value}{showPercentage ? '%' : ''}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        disabled={disabled}
        className={cn(
          'w-full h-2 rounded-full appearance-none cursor-pointer',
          'bg-stone-200 dark:bg-stone-700',
          '[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4',
          '[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-amber-500',
          '[&::-webkit-slider-thumb]:hover:bg-amber-600 [&::-webkit-slider-thumb]:cursor-pointer',
          '[&::-webkit-slider-thumb]:shadow-md',
          disabled && 'cursor-not-allowed [&::-webkit-slider-thumb]:cursor-not-allowed'
        )}
      />
    </div>
  )
}

interface RadioGroupProps {
  options: { value: string; label: string }[]
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  label?: string
  orientation?: 'horizontal' | 'vertical'
}

function RadioGroup({ options, value, onChange, disabled, label, orientation = 'horizontal' }: RadioGroupProps) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">
          {label}
        </label>
      )}
      <div className={cn(
        'flex gap-3',
        orientation === 'vertical' && 'flex-col',
        disabled && 'opacity-50'
      )}>
        {options.map((option) => (
          <label
            key={option.value}
            className={cn(
              'flex items-center gap-2 cursor-pointer',
              disabled && 'cursor-not-allowed'
            )}
          >
            <input
              type="radio"
              name={label || 'radio-group'}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              disabled={disabled}
              className={cn(
                'w-4 h-4 text-amber-500 border-stone-300 focus:ring-amber-500',
                'dark:border-stone-600 dark:bg-stone-800'
              )}
            />
            <span className="text-sm text-stone-700 dark:text-stone-300">{option.label}</span>
          </label>
        ))}
      </div>
    </div>
  )
}

// ============================================================================
// Tab Content Components
// ============================================================================

interface GeneralTabProps {
  name: string
  description: string
  onNameChange: (value: string) => void
  onDescriptionChange: (value: string) => void
  nameError?: string
}

function GeneralTab({ name, description, onNameChange, onDescriptionChange, nameError }: GeneralTabProps) {
  return (
    <div className="space-y-6">
      {/* Template Name */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">
          Template Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="e.g., Pro Shop Default"
          className={cn(
            'w-full px-3 py-2 rounded-lg border bg-white dark:bg-stone-800',
            'text-stone-900 dark:text-stone-100 placeholder-stone-400',
            'focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500',
            nameError
              ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
              : 'border-stone-300 dark:border-stone-600'
          )}
        />
        {nameError && (
          <p className="text-sm text-red-500">{nameError}</p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Describe this template's purpose..."
          rows={4}
          className={cn(
            'w-full px-3 py-2 rounded-lg border bg-white dark:bg-stone-800',
            'text-stone-900 dark:text-stone-100 placeholder-stone-400',
            'border-stone-300 dark:border-stone-600',
            'focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500',
            'resize-none'
          )}
        />
      </div>
    </div>
  )
}

interface GridLayoutTabProps {
  gridColumns: number
  gridRows: number
  tileSize: 'SMALL' | 'MEDIUM' | 'LARGE'
  showImages: boolean
  showPrices: boolean
  categoryStyle: 'TABS' | 'SIDEBAR' | 'DROPDOWN'
  showAllCategory: boolean
  onColumnsChange: (value: number) => void
  onRowsChange: (value: number) => void
  onTileSizeChange: (value: 'SMALL' | 'MEDIUM' | 'LARGE') => void
  onShowImagesChange: (value: boolean) => void
  onShowPricesChange: (value: boolean) => void
  onCategoryStyleChange: (value: 'TABS' | 'SIDEBAR' | 'DROPDOWN') => void
  onShowAllCategoryChange: (value: boolean) => void
}

function GridLayoutTab({
  gridColumns,
  gridRows,
  tileSize,
  showImages,
  showPrices,
  categoryStyle,
  showAllCategory,
  onColumnsChange,
  onRowsChange,
  onTileSizeChange,
  onShowImagesChange,
  onShowPricesChange,
  onCategoryStyleChange,
  onShowAllCategoryChange,
}: GridLayoutTabProps) {
  return (
    <div className="space-y-6">
      {/* Grid Dimensions */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">
            Grid Columns (2-12)
          </label>
          <input
            type="number"
            min={2}
            max={12}
            value={gridColumns}
            onChange={(e) => onColumnsChange(Math.min(12, Math.max(2, Number(e.target.value) || 2)))}
            className={cn(
              'w-full px-3 py-2 rounded-lg border bg-white dark:bg-stone-800',
              'text-stone-900 dark:text-stone-100',
              'border-stone-300 dark:border-stone-600',
              'focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500'
            )}
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">
            Grid Rows (2-8)
          </label>
          <input
            type="number"
            min={2}
            max={8}
            value={gridRows}
            onChange={(e) => onRowsChange(Math.min(8, Math.max(2, Number(e.target.value) || 2)))}
            className={cn(
              'w-full px-3 py-2 rounded-lg border bg-white dark:bg-stone-800',
              'text-stone-900 dark:text-stone-100',
              'border-stone-300 dark:border-stone-600',
              'focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500'
            )}
          />
        </div>
      </div>

      {/* Tile Size */}
      <RadioGroup
        label="Tile Size"
        options={[
          { value: 'SMALL', label: 'Small' },
          { value: 'MEDIUM', label: 'Medium' },
          { value: 'LARGE', label: 'Large' },
        ]}
        value={tileSize}
        onChange={(v) => onTileSizeChange(v as 'SMALL' | 'MEDIUM' | 'LARGE')}
      />

      {/* Display Options */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-stone-700 dark:text-stone-300">Display Options</h4>
        <div className="space-y-3">
          <ToggleSwitch
            checked={showImages}
            onChange={onShowImagesChange}
            label="Show Product Images"
            description="Display images on product tiles"
          />
          <ToggleSwitch
            checked={showPrices}
            onChange={onShowPricesChange}
            label="Show Prices"
            description="Display prices on product tiles"
          />
        </div>
      </div>

      {/* Category Style */}
      <RadioGroup
        label="Category Navigation Style"
        options={[
          { value: 'TABS', label: 'Tabs' },
          { value: 'SIDEBAR', label: 'Sidebar' },
          { value: 'DROPDOWN', label: 'Dropdown' },
        ]}
        value={categoryStyle}
        onChange={(v) => onCategoryStyleChange(v as 'TABS' | 'SIDEBAR' | 'DROPDOWN')}
      />

      {/* Show All Category */}
      <ToggleSwitch
        checked={showAllCategory}
        onChange={onShowAllCategoryChange}
        label="Show 'All' Category"
        description="Include an 'All Items' category option"
      />
    </div>
  )
}

interface QuickKeysTabProps {
  enabled: boolean
  count: number
  position: 'TOP' | 'LEFT'
  onEnabledChange: (value: boolean) => void
  onCountChange: (value: number) => void
  onPositionChange: (value: 'TOP' | 'LEFT') => void
}

function QuickKeysTab({
  enabled,
  count,
  position,
  onEnabledChange,
  onCountChange,
  onPositionChange,
}: QuickKeysTabProps) {
  return (
    <div className="space-y-6">
      {/* Enable Quick Keys */}
      <ToggleSwitch
        checked={enabled}
        onChange={onEnabledChange}
        label="Enable Quick Keys"
        description="Show quick access buttons for frequently used items"
      />

      {/* Quick Keys Count */}
      <div className="space-y-2">
        <label className={cn(
          'block text-sm font-medium text-stone-700 dark:text-stone-300',
          !enabled && 'opacity-50'
        )}>
          Number of Quick Keys (4-16)
        </label>
        <input
          type="number"
          min={4}
          max={16}
          value={count}
          onChange={(e) => onCountChange(Math.min(16, Math.max(4, Number(e.target.value) || 4)))}
          disabled={!enabled}
          className={cn(
            'w-full px-3 py-2 rounded-lg border bg-white dark:bg-stone-800',
            'text-stone-900 dark:text-stone-100',
            'border-stone-300 dark:border-stone-600',
            'focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        />
      </div>

      {/* Position */}
      <RadioGroup
        label="Quick Keys Position"
        options={[
          { value: 'TOP', label: 'Top' },
          { value: 'LEFT', label: 'Left' },
        ]}
        value={position}
        onChange={(v) => onPositionChange(v as 'TOP' | 'LEFT')}
        disabled={!enabled}
      />
    </div>
  )
}

interface SuggestionsTabProps {
  enabled: boolean
  count: number
  position: 'TOP' | 'SIDEBAR' | 'FLOATING'
  timeOfDayWeight: number
  salesVelocityWeight: number
  staffHistoryWeight: number
  onEnabledChange: (value: boolean) => void
  onCountChange: (value: number) => void
  onPositionChange: (value: 'TOP' | 'SIDEBAR' | 'FLOATING') => void
  onWeightsChange: (timeOfDay: number, salesVelocity: number, staffHistory: number) => void
}

function SuggestionsTab({
  enabled,
  count,
  position,
  timeOfDayWeight,
  salesVelocityWeight,
  staffHistoryWeight,
  onEnabledChange,
  onCountChange,
  onPositionChange,
  onWeightsChange,
}: SuggestionsTabProps) {
  // Calculate total weight
  const totalWeight = timeOfDayWeight + salesVelocityWeight + staffHistoryWeight

  // Handler to adjust weights while keeping sum at 100%
  const handleWeightChange = (type: 'timeOfDay' | 'salesVelocity' | 'staffHistory', newValue: number) => {
    const weights = { timeOfDay: timeOfDayWeight, salesVelocity: salesVelocityWeight, staffHistory: staffHistoryWeight }
    const oldValue = weights[type]
    const diff = newValue - oldValue

    // Get the other two types
    const otherTypes = (['timeOfDay', 'salesVelocity', 'staffHistory'] as const).filter(t => t !== type)

    // Distribute the difference proportionally among the other two
    const otherTotal = otherTypes.reduce((sum, t) => sum + weights[t], 0)

    if (otherTotal === 0) {
      // If other weights are 0, split evenly
      const splitDiff = diff / 2
      otherTypes.forEach(t => {
        weights[t] = Math.max(0, Math.round(weights[t] - splitDiff))
      })
    } else {
      // Distribute proportionally
      otherTypes.forEach(t => {
        const proportion = weights[t] / otherTotal
        weights[t] = Math.max(0, Math.round(weights[t] - diff * proportion))
      })
    }

    weights[type] = newValue

    // Ensure total is exactly 100
    const newTotal = weights.timeOfDay + weights.salesVelocity + weights.staffHistory
    if (newTotal !== 100) {
      const adjustment = 100 - newTotal
      // Add adjustment to the largest other weight
      const firstOther = otherTypes[0]
      if (firstOther) {
        const largestOther = otherTypes.reduce((max, t) => weights[t] > weights[max] ? t : max, firstOther)
        weights[largestOther] = Math.max(0, weights[largestOther] + adjustment)
      }
    }

    onWeightsChange(weights.timeOfDay, weights.salesVelocity, weights.staffHistory)
  }

  return (
    <div className="space-y-6">
      {/* Enable Suggestions */}
      <ToggleSwitch
        checked={enabled}
        onChange={onEnabledChange}
        label="Enable Smart Suggestions"
        description="Show AI-powered product recommendations"
      />

      {/* Suggestions Count */}
      <div className="space-y-2">
        <label className={cn(
          'block text-sm font-medium text-stone-700 dark:text-stone-300',
          !enabled && 'opacity-50'
        )}>
          Number of Suggestions (4-12)
        </label>
        <input
          type="number"
          min={4}
          max={12}
          value={count}
          onChange={(e) => onCountChange(Math.min(12, Math.max(4, Number(e.target.value) || 4)))}
          disabled={!enabled}
          className={cn(
            'w-full px-3 py-2 rounded-lg border bg-white dark:bg-stone-800',
            'text-stone-900 dark:text-stone-100',
            'border-stone-300 dark:border-stone-600',
            'focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        />
      </div>

      {/* Position */}
      <div className="space-y-2">
        <label className={cn(
          'block text-sm font-medium text-stone-700 dark:text-stone-300',
          !enabled && 'opacity-50'
        )}>
          Suggestions Position
        </label>
        <select
          value={position}
          onChange={(e) => onPositionChange(e.target.value as 'TOP' | 'SIDEBAR' | 'FLOATING')}
          disabled={!enabled}
          className={cn(
            'w-full px-3 py-2 rounded-lg border bg-white dark:bg-stone-800',
            'text-stone-900 dark:text-stone-100',
            'border-stone-300 dark:border-stone-600',
            'focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          <option value="TOP">Top</option>
          <option value="SIDEBAR">Sidebar</option>
          <option value="FLOATING">Floating</option>
        </select>
      </div>

      {/* Algorithm Weights */}
      {enabled && (
        <div className="space-y-4 p-4 bg-stone-50 dark:bg-stone-800/50 rounded-lg border border-stone-200 dark:border-stone-700">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-stone-700 dark:text-stone-300">Algorithm Weights</h4>
            <span className={cn(
              'text-xs font-medium px-2 py-0.5 rounded-full',
              totalWeight === 100
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
            )}>
              Total: {totalWeight}%
            </span>
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Adjust how different factors influence product suggestions. Weights must sum to 100%.
          </p>
          <div className="space-y-4">
            <Slider
              label="Time of Day"
              value={timeOfDayWeight}
              onChange={(v) => handleWeightChange('timeOfDay', v)}
              min={0}
              max={100}
              showPercentage
            />
            <Slider
              label="Sales Velocity"
              value={salesVelocityWeight}
              onChange={(v) => handleWeightChange('salesVelocity', v)}
              min={0}
              max={100}
              showPercentage
            />
            <Slider
              label="Staff History"
              value={staffHistoryWeight}
              onChange={(v) => handleWeightChange('staffHistory', v)}
              min={0}
              max={100}
              showPercentage
            />
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================================================
// Main Component
// ============================================================================

export function TemplateEditorModal({
  isOpen,
  onClose,
  template,
  onSave,
  isSaving = false,
}: TemplateEditorModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const [activeTab, setActiveTab] = useState<TabKey>('general')
  const [formState, setFormState] = useState<POSTemplateInput>(DEFAULT_FORM_STATE)
  const [nameError, setNameError] = useState<string | undefined>()

  const isEditMode = !!template

  // Initialize form state when modal opens or template changes
  useEffect(() => {
    if (isOpen) {
      if (template) {
        setFormState({
          name: template.name,
          description: template.description || '',
          gridColumns: template.gridColumns,
          gridRows: template.gridRows,
          tileSize: template.tileSize,
          showImages: template.showImages,
          showPrices: template.showPrices,
          categoryStyle: template.categoryStyle,
          showAllCategory: template.showAllCategory,
          quickKeysEnabled: template.quickKeysEnabled,
          quickKeysCount: template.quickKeysCount,
          quickKeysPosition: template.quickKeysPosition,
          suggestionsEnabled: template.suggestionsEnabled,
          suggestionsCount: template.suggestionsCount,
          suggestionsPosition: template.suggestionsPosition,
          timeOfDayWeight: template.timeOfDayWeight,
          salesVelocityWeight: template.salesVelocityWeight,
          staffHistoryWeight: template.staffHistoryWeight,
        })
      } else {
        setFormState(DEFAULT_FORM_STATE)
      }
      setActiveTab('general')
      setNameError(undefined)
    }
  }, [isOpen, template])

  // Handle Escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape' && !isSaving) {
        onClose()
      }
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, isSaving, onClose])

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = ''
      }
    }
  }, [isOpen])

  // Focus trap
  useEffect(() => {
    if (isOpen && modalRef.current) {
      const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      const firstFocusable = focusableElements[0]
      firstFocusable?.focus()
    }
  }, [isOpen])

  // Form update handlers
  const updateField = useCallback(<K extends keyof POSTemplateInput>(
    field: K,
    value: POSTemplateInput[K]
  ) => {
    setFormState((prev) => ({ ...prev, [field]: value }))
    if (field === 'name') {
      setNameError(undefined)
    }
  }, [])

  const handleWeightsChange = useCallback((timeOfDay: number, salesVelocity: number, staffHistory: number) => {
    setFormState((prev) => ({
      ...prev,
      timeOfDayWeight: timeOfDay,
      salesVelocityWeight: salesVelocity,
      staffHistoryWeight: staffHistory,
    }))
  }, [])

  // Validation
  const validate = (): boolean => {
    if (!formState.name.trim()) {
      setNameError('Template name is required')
      setActiveTab('general')
      return false
    }

    const totalWeight = formState.timeOfDayWeight + formState.salesVelocityWeight + formState.staffHistoryWeight
    if (formState.suggestionsEnabled && totalWeight !== 100) {
      // Auto-correct to 100% if close
      const diff = 100 - totalWeight
      if (Math.abs(diff) <= 3) {
        // Auto-adjust the largest weight
        const weights = [
          { key: 'timeOfDayWeight' as const, value: formState.timeOfDayWeight },
          { key: 'salesVelocityWeight' as const, value: formState.salesVelocityWeight },
          { key: 'staffHistoryWeight' as const, value: formState.staffHistoryWeight },
        ]
        const largest = weights.reduce((max, w) => w.value > max.value ? w : max)
        setFormState((prev) => ({ ...prev, [largest.key]: largest.value + diff }))
      }
    }

    return true
  }

  // Handle save
  const handleSave = () => {
    if (!validate()) return
    onSave(formState)
  }

  // Handle close
  const handleClose = () => {
    if (!isSaving) {
      onClose()
    }
  }

  if (!isOpen) return null

  // Map form state to preview props
  const previewProps = {
    columns: formState.gridColumns,
    rows: formState.gridRows,
    tileSize: formState.tileSize.toLowerCase() as 'small' | 'medium' | 'large',
    showImages: formState.showImages,
    showPrices: formState.showPrices,
    quickKeysEnabled: formState.quickKeysEnabled,
    quickKeysPosition: formState.quickKeysPosition.toLowerCase() as 'top' | 'left',
    quickKeysCount: formState.quickKeysCount,
    suggestionsEnabled: formState.suggestionsEnabled,
    categoryStyle: formState.categoryStyle.toLowerCase() as 'tabs' | 'sidebar' | 'dropdown',
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          ref={modalRef}
          className={cn(
            'w-full max-w-5xl bg-white dark:bg-stone-900 rounded-2xl shadow-2xl shadow-stone-900/20 dark:shadow-black/40',
            'flex flex-col max-h-[90vh]',
            'animate-in fade-in-0 zoom-in-95 duration-200'
          )}
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          {/* Header */}
          <div className="relative border-b border-stone-100 dark:border-stone-700 bg-gradient-to-b from-stone-50 to-white dark:from-stone-800 dark:to-stone-900 px-6 pb-4 pt-5 rounded-t-2xl">
            {/* Close Button */}
            <button
              onClick={handleClose}
              disabled={isSaving}
              className="absolute right-4 top-4 rounded-lg p-2 text-stone-400 dark:text-stone-500 transition-colors hover:bg-stone-100 dark:hover:bg-stone-700 hover:text-stone-600 dark:hover:text-stone-300 disabled:opacity-50"
            >
              <X className="h-5 w-5" />
            </button>

            <div>
              <h2 id="modal-title" className="text-xl font-bold text-stone-900 dark:text-stone-100">
                {isEditMode ? 'Edit Template' : 'Create Template'}
              </h2>
              <p className="mt-1.5 text-sm text-stone-500 dark:text-stone-400">
                {isEditMode
                  ? 'Modify the template settings and preview changes in real-time'
                  : 'Configure a new POS layout template'
                }
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-stone-100 dark:border-stone-700 px-6">
            <nav className="flex gap-1" aria-label="Tabs">
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={cn(
                    'px-4 py-3 text-sm font-medium transition-colors relative',
                    activeTab === tab.key
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200'
                  )}
                >
                  {tab.label}
                  {activeTab === tab.key && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500" />
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto">
            <div className="flex h-full">
              {/* Form Section */}
              <div className="flex-1 px-6 py-5 overflow-y-auto">
                {activeTab === 'general' && (
                  <GeneralTab
                    name={formState.name}
                    description={formState.description || ''}
                    onNameChange={(v) => updateField('name', v)}
                    onDescriptionChange={(v) => updateField('description', v)}
                    nameError={nameError}
                  />
                )}
                {activeTab === 'grid' && (
                  <GridLayoutTab
                    gridColumns={formState.gridColumns}
                    gridRows={formState.gridRows}
                    tileSize={formState.tileSize}
                    showImages={formState.showImages}
                    showPrices={formState.showPrices}
                    categoryStyle={formState.categoryStyle}
                    showAllCategory={formState.showAllCategory}
                    onColumnsChange={(v) => updateField('gridColumns', v)}
                    onRowsChange={(v) => updateField('gridRows', v)}
                    onTileSizeChange={(v) => updateField('tileSize', v)}
                    onShowImagesChange={(v) => updateField('showImages', v)}
                    onShowPricesChange={(v) => updateField('showPrices', v)}
                    onCategoryStyleChange={(v) => updateField('categoryStyle', v)}
                    onShowAllCategoryChange={(v) => updateField('showAllCategory', v)}
                  />
                )}
                {activeTab === 'quickKeys' && (
                  <QuickKeysTab
                    enabled={formState.quickKeysEnabled}
                    count={formState.quickKeysCount}
                    position={formState.quickKeysPosition}
                    onEnabledChange={(v) => updateField('quickKeysEnabled', v)}
                    onCountChange={(v) => updateField('quickKeysCount', v)}
                    onPositionChange={(v) => updateField('quickKeysPosition', v)}
                  />
                )}
                {activeTab === 'suggestions' && (
                  <SuggestionsTab
                    enabled={formState.suggestionsEnabled}
                    count={formState.suggestionsCount}
                    position={formState.suggestionsPosition}
                    timeOfDayWeight={formState.timeOfDayWeight}
                    salesVelocityWeight={formState.salesVelocityWeight}
                    staffHistoryWeight={formState.staffHistoryWeight}
                    onEnabledChange={(v) => updateField('suggestionsEnabled', v)}
                    onCountChange={(v) => updateField('suggestionsCount', v)}
                    onPositionChange={(v) => updateField('suggestionsPosition', v)}
                    onWeightsChange={handleWeightsChange}
                  />
                )}
              </div>

              {/* Preview Section */}
              <div className="w-80 border-l border-stone-100 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800/50 p-5 flex flex-col">
                <h3 className="text-sm font-semibold text-stone-700 dark:text-stone-300 mb-4">
                  Live Preview
                </h3>
                <div className="flex-1 flex items-start justify-center">
                  <POSGridPreview {...previewProps} />
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 border-t border-stone-100 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800/50 px-6 py-4 rounded-b-2xl">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSaving}
              className={cn(
                'px-4 py-2 rounded-lg font-medium transition-colors',
                'border border-stone-200 dark:border-stone-600',
                'text-stone-700 dark:text-stone-200',
                'hover:bg-stone-100 dark:hover:bg-stone-700',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className={cn(
                'px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2',
                'bg-gradient-to-br from-amber-500 to-amber-600 text-white',
                'hover:from-amber-600 hover:to-amber-700',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEditMode ? 'Update Template' : 'Create Template'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
