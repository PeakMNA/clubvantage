'use client'

import { useState, useCallback, useEffect } from 'react'
import { cn, Button } from '@clubvantage/ui'
import { X, Loader2, Layout, Plus, GripVertical, Trash2, ChevronDown } from 'lucide-react'
import type { POSOutletType } from '../types'
import { POS_ACTION_TYPES, ACTION_TYPE_METADATA, type POSActionType } from '../utils/action-types'

// ============================================================================
// TYPES
// ============================================================================

export interface TemplateFormData {
  id?: string
  name: string
  description: string
  outletType: POSOutletType | ''
  isDefault: boolean
  toolbarConfig: ToolbarConfig
  actionBarConfig: ActionBarConfig
}

interface ToolbarConfig {
  groups: ToolbarGroup[]
}

interface ToolbarGroup {
  id: string
  label: string
  zone: 'left' | 'center' | 'right'
  items: string[] // e.g., ['search', 'categoryTabs', 'memberLookup']
}

interface ActionBarConfig {
  buttons: ActionButton[]
}

interface ActionButton {
  id: string
  label: string
  actionType: POSActionType
  variant: 'primary' | 'secondary' | 'danger' | 'ghost'
  position: 'left' | 'center' | 'right'
}

export interface TemplateModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: TemplateFormData) => Promise<void>
  template?: Partial<TemplateFormData> | null
  className?: string
}

// ============================================================================
// CONSTANTS
// ============================================================================

const OUTLET_TYPES: { value: POSOutletType; label: string; description: string }[] = [
  { value: 'GOLF_TEE_SHEET', label: 'Golf Tee Sheet', description: 'Check-in and booking operations' },
  { value: 'GOLF_PRO_SHOP', label: 'Pro Shop', description: 'Retail merchandise sales' },
  { value: 'FNB_RESTAURANT', label: 'Restaurant', description: 'Full-service dining' },
  { value: 'FNB_BAR', label: 'Bar', description: 'Bar and lounge service' },
  { value: 'FNB_BANQUET', label: 'Banquet', description: 'Event and banquet service' },
  { value: 'MEMBERSHIP', label: 'Membership', description: 'Member services desk' },
  { value: 'GENERAL', label: 'General', description: 'Multi-purpose outlet' },
]

// Available toolbar items that can be placed in zones
const TOOLBAR_ITEMS = [
  { id: 'search', label: 'Search Bar', description: 'Product search input' },
  { id: 'categoryTabs', label: 'Category Tabs', description: 'Browse products by category' },
  { id: 'memberLookup', label: 'Member Lookup', description: 'Find and attach member to ticket' },
  { id: 'holdTicket', label: 'Hold Ticket', description: 'Save ticket for later' },
  { id: 'newTicket', label: 'New Ticket', description: 'Start a fresh transaction' },
]

const DEFAULT_TOOLBAR_CONFIG: ToolbarConfig = {
  groups: [
    { id: 'left-zone', label: 'Left Zone', zone: 'left', items: ['search', 'memberLookup'] },
    { id: 'center-zone', label: 'Center Zone', zone: 'center', items: ['categoryTabs'] },
    { id: 'right-zone', label: 'Right Zone', zone: 'right', items: ['holdTicket', 'newTicket'] },
  ],
}

const DEFAULT_ACTION_BAR_CONFIG: ActionBarConfig = {
  buttons: [
    { id: 'cancel', label: 'Cancel', actionType: POS_ACTION_TYPES.CANCEL_TRANSACTION, variant: 'danger', position: 'left' },
    { id: 'void', label: 'Void Item', actionType: POS_ACTION_TYPES.VOID_ITEM, variant: 'ghost', position: 'left' },
    { id: 'discount', label: 'Discount', actionType: POS_ACTION_TYPES.APPLY_DISCOUNT, variant: 'secondary', position: 'center' },
    { id: 'hold', label: 'Hold', actionType: POS_ACTION_TYPES.HOLD_TICKET, variant: 'secondary', position: 'center' },
    { id: 'print', label: 'Print', actionType: POS_ACTION_TYPES.PRINT_RECEIPT, variant: 'ghost', position: 'center' },
    { id: 'cash', label: 'Cash', actionType: POS_ACTION_TYPES.PROCESS_CASH_PAYMENT, variant: 'secondary', position: 'right' },
    { id: 'card', label: 'Card', actionType: POS_ACTION_TYPES.PROCESS_CARD_PAYMENT, variant: 'secondary', position: 'right' },
    { id: 'pay', label: 'Pay', actionType: POS_ACTION_TYPES.OPEN_PAYMENT_MODAL, variant: 'primary', position: 'right' },
  ],
}

function normalizeToolbarConfig(config: unknown): ToolbarConfig {
  if (!config || typeof config !== 'object') {
    return DEFAULT_TOOLBAR_CONFIG
  }
  const cfg = config as Record<string, unknown>
  const validZones = ['left', 'center', 'right']
  return {
    groups: Array.isArray(cfg.groups) ? cfg.groups.map((g: unknown, i: number) => {
      const group = g as Record<string, unknown>
      const zone = typeof group.zone === 'string' && validZones.includes(group.zone)
        ? (group.zone as ToolbarGroup['zone'])
        : (['left', 'center', 'right'][i] as ToolbarGroup['zone']) || 'center'
      return {
        id: typeof group.id === 'string' ? group.id : `group-${i}`,
        label: typeof group.label === 'string' ? group.label : 'Group',
        zone,
        items: Array.isArray(group.items) ? group.items : (Array.isArray(group.buttons) ? group.buttons : []),
      }
    }) : DEFAULT_TOOLBAR_CONFIG.groups,
  }
}

function normalizeActionBarConfig(config: unknown): ActionBarConfig {
  if (!config || typeof config !== 'object') {
    return DEFAULT_ACTION_BAR_CONFIG
  }
  const cfg = config as Record<string, unknown>
  const validVariants = ['primary', 'secondary', 'danger', 'ghost']
  const validPositions = ['left', 'center', 'right']
  const validActionTypes = Object.values(POS_ACTION_TYPES)
  return {
    buttons: Array.isArray(cfg.buttons) ? cfg.buttons.map((b: unknown, i: number) => {
      const btn = b as Record<string, unknown>
      const variant = typeof btn.variant === 'string' && validVariants.includes(btn.variant)
        ? (btn.variant as ActionButton['variant'])
        : 'secondary'
      const position = typeof btn.position === 'string' && validPositions.includes(btn.position)
        ? (btn.position as ActionButton['position'])
        : 'center'
      const actionType = typeof btn.actionType === 'string' && validActionTypes.includes(btn.actionType as POSActionType)
        ? (btn.actionType as POSActionType)
        : POS_ACTION_TYPES.CUSTOM
      return {
        id: typeof btn.id === 'string' ? btn.id : `btn-${i}`,
        label: typeof btn.label === 'string' ? btn.label : 'Button',
        actionType,
        variant,
        position,
      }
    }) : DEFAULT_ACTION_BAR_CONFIG.buttons,
  }
}

function getInitialFormData(template?: Partial<TemplateFormData> | null): TemplateFormData {
  return {
    id: template?.id,
    name: template?.name || '',
    description: template?.description || '',
    outletType: template?.outletType || '',
    isDefault: template?.isDefault ?? false,
    toolbarConfig: normalizeToolbarConfig(template?.toolbarConfig),
    actionBarConfig: normalizeActionBarConfig(template?.actionBarConfig),
  }
}

// ============================================================================
// COMPONENT
// ============================================================================

export function TemplateModal({
  isOpen,
  onClose,
  onSave,
  template,
  className,
}: TemplateModalProps) {
  const [formData, setFormData] = useState<TemplateFormData>(() => getInitialFormData(template))
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'details' | 'toolbar' | 'actions'>('details')

  const isEditMode = !!template?.id

  // Reset form when template changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData(getInitialFormData(template))
      setErrors({})
      setActiveTab('details')
    }
  }, [isOpen, template])

  const updateField = useCallback(<K extends keyof TemplateFormData>(
    field: K,
    value: TemplateFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }, [errors])

  const validate = useCallback(() => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    } else if (formData.name.length > 100) {
      newErrors.name = 'Name must be 100 characters or less'
    }

    if (!formData.outletType) {
      newErrors.outletType = 'Outlet type is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData])

  const handleSave = useCallback(async () => {
    if (!validate()) {
      setActiveTab('details')
      return
    }

    setIsSaving(true)
    try {
      await onSave(formData)
      onClose()
    } catch (error) {
      console.error('Failed to save template:', error)
    } finally {
      setIsSaving(false)
    }
  }, [formData, validate, onSave, onClose])

  const handleClose = useCallback(() => {
    if (!isSaving) {
      onClose()
    }
  }, [isSaving, onClose])

  // Toolbar group management
  const addToolbarGroup = useCallback(() => {
    const groups = formData.toolbarConfig.groups ?? []
    // Determine which zone doesn't have a group yet
    const usedZones = groups.map(g => g.zone)
    const availableZone = (['left', 'center', 'right'] as const).find(z => !usedZones.includes(z)) || 'center'
    const zoneLabels = { left: 'Left Zone', center: 'Center Zone', right: 'Right Zone' }
    const newGroup: ToolbarGroup = {
      id: `group-${Date.now()}`,
      label: zoneLabels[availableZone],
      zone: availableZone,
      items: [],
    }
    updateField('toolbarConfig', {
      ...formData.toolbarConfig,
      groups: [...groups, newGroup],
    })
  }, [formData.toolbarConfig, updateField])

  const updateToolbarGroup = useCallback((index: number, updates: Partial<ToolbarGroup>) => {
    const groups = formData.toolbarConfig.groups ?? []
    const newGroups = [...groups]
    const currentGroup = newGroups[index]
    if (!currentGroup) return
    newGroups[index] = {
      id: currentGroup.id,
      label: updates.label ?? currentGroup.label,
      zone: updates.zone ?? currentGroup.zone,
      items: updates.items ?? currentGroup.items,
    }
    updateField('toolbarConfig', { ...formData.toolbarConfig, groups: newGroups })
  }, [formData.toolbarConfig, updateField])

  const removeToolbarGroup = useCallback((index: number) => {
    const groups = formData.toolbarConfig.groups ?? []
    const newGroups = groups.filter((_, i) => i !== index)
    updateField('toolbarConfig', { ...formData.toolbarConfig, groups: newGroups })
  }, [formData.toolbarConfig, updateField])

  // Action bar button management
  const addActionButton = useCallback(() => {
    const existingCount = (formData.actionBarConfig.buttons ?? []).length
    // Default button presets based on count
    const presets: Array<{ label: string; actionType: POSActionType; variant: ActionButton['variant']; position: ActionButton['position'] }> = [
      { label: 'Pay', actionType: POS_ACTION_TYPES.OPEN_PAYMENT_MODAL, variant: 'primary', position: 'right' },
      { label: 'Hold', actionType: POS_ACTION_TYPES.HOLD_TICKET, variant: 'secondary', position: 'center' },
      { label: 'Cancel', actionType: POS_ACTION_TYPES.CANCEL_TRANSACTION, variant: 'danger', position: 'left' },
      { label: 'Cash', actionType: POS_ACTION_TYPES.PROCESS_CASH_PAYMENT, variant: 'secondary', position: 'right' },
      { label: 'Card', actionType: POS_ACTION_TYPES.PROCESS_CARD_PAYMENT, variant: 'secondary', position: 'right' },
      { label: 'Print', actionType: POS_ACTION_TYPES.PRINT_RECEIPT, variant: 'ghost', position: 'center' },
      { label: 'Discount', actionType: POS_ACTION_TYPES.APPLY_DISCOUNT, variant: 'secondary', position: 'center' },
    ]
    const preset = presets[existingCount] || { label: `Action ${existingCount + 1}`, actionType: POS_ACTION_TYPES.CUSTOM, variant: 'secondary' as const, position: 'center' as const }
    const newButton: ActionButton = {
      id: `btn-${Date.now()}`,
      label: preset.label,
      actionType: preset.actionType,
      variant: preset.variant,
      position: preset.position,
    }
    updateField('actionBarConfig', {
      ...formData.actionBarConfig,
      buttons: [...(formData.actionBarConfig.buttons ?? []), newButton],
    })
  }, [formData.actionBarConfig, updateField])

  const updateActionButton = useCallback((index: number, updates: Partial<ActionButton>) => {
    const buttons = formData.actionBarConfig.buttons ?? []
    const newButtons = [...buttons]
    const currentButton = newButtons[index]
    if (!currentButton) return
    newButtons[index] = {
      id: currentButton.id,
      label: updates.label ?? currentButton.label,
      actionType: updates.actionType ?? currentButton.actionType,
      variant: updates.variant ?? currentButton.variant,
      position: updates.position ?? currentButton.position,
    }
    updateField('actionBarConfig', { ...formData.actionBarConfig, buttons: newButtons })
  }, [formData.actionBarConfig, updateField])

  const removeActionButton = useCallback((index: number) => {
    const buttons = formData.actionBarConfig.buttons ?? []
    const newButtons = buttons.filter((_, i) => i !== index)
    updateField('actionBarConfig', { ...formData.actionBarConfig, buttons: newButtons })
  }, [formData.actionBarConfig, updateField])

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop with subtle gradient */}
      <div
        className="fixed inset-0 z-50 bg-gradient-to-br from-stone-900/60 to-stone-950/80 backdrop-blur-sm"
        onClick={handleClose}
        style={{
          animation: 'fadeIn 0.15s ease-out',
        }}
      />

      {/* Modal */}
      <div
        className={cn(
          'fixed inset-x-4 top-[3%] z-50 mx-auto max-h-[94vh] w-full max-w-2xl overflow-hidden rounded-2xl border border-stone-200/60 bg-white shadow-2xl sm:inset-x-auto',
          'ring-1 ring-black/5',
          className
        )}
        style={{
          animation: 'slideUp 0.2s ease-out',
        }}
      >
        {/* Header with gradient accent */}
        <div className="relative border-b border-stone-100 bg-gradient-to-r from-stone-50 to-white px-6 py-5">
          <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-amber-100 to-amber-50 shadow-sm ring-1 ring-amber-200/50">
                <Layout className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold tracking-tight text-stone-900">
                  {isEditMode ? 'Edit Template' : 'Create Template'}
                </h2>
                <p className="text-sm text-stone-500">
                  {isEditMode ? 'Modify template configuration' : 'Define a new POS layout template'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleClose}
              disabled={isSaving}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-stone-400 transition-all hover:bg-stone-100 hover:text-stone-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="mt-5 flex gap-1">
            {(['details', 'toolbar', 'actions'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'rounded-lg px-4 py-2 text-sm font-medium transition-all',
                  activeTab === tab
                    ? 'bg-white text-stone-900 shadow-sm ring-1 ring-stone-200/60'
                    : 'text-stone-500 hover:bg-stone-50 hover:text-stone-700'
                )}
              >
                {tab === 'details' && 'Details'}
                {tab === 'toolbar' && 'Toolbar'}
                {tab === 'actions' && 'Action Bar'}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="max-h-[calc(94vh-220px)] overflow-y-auto p-6">
          {/* Details Tab */}
          {activeTab === 'details' && (
            <div className="space-y-5">
              {/* Name */}
              <div>
                <label className="mb-2 block text-sm font-medium text-stone-700">
                  Template Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  placeholder="e.g., Golf Pro Shop Standard"
                  maxLength={100}
                  className={cn(
                    'h-11 w-full rounded-xl border bg-white px-4 text-sm transition-all',
                    'focus:outline-none focus:ring-2 focus:ring-offset-1',
                    errors.name
                      ? 'border-red-300 focus:border-red-400 focus:ring-red-200'
                      : 'border-stone-200 focus:border-amber-400 focus:ring-amber-100'
                  )}
                />
                {errors.name && (
                  <p className="mt-1.5 text-xs text-red-500">{errors.name}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="mb-2 block text-sm font-medium text-stone-700">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder="Optional description of this template's purpose..."
                  rows={3}
                  maxLength={500}
                  className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm transition-all focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100 focus:ring-offset-1"
                />
              </div>

              {/* Outlet Type */}
              <div>
                <label className="mb-2 block text-sm font-medium text-stone-700">
                  Outlet Type <span className="text-red-500">*</span>
                </label>
                <div className="grid gap-2">
                  {OUTLET_TYPES.map((type) => (
                    <label
                      key={type.value}
                      className={cn(
                        'flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition-all',
                        formData.outletType === type.value
                          ? 'border-amber-300 bg-amber-50/50 ring-1 ring-amber-200'
                          : 'border-stone-200 hover:border-stone-300 hover:bg-stone-50'
                      )}
                    >
                      <input
                        type="radio"
                        name="outletType"
                        value={type.value}
                        checked={formData.outletType === type.value}
                        onChange={(e) => updateField('outletType', e.target.value as POSOutletType)}
                        className="sr-only"
                      />
                      <div
                        className={cn(
                          'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all',
                          formData.outletType === type.value
                            ? 'border-amber-500 bg-amber-500'
                            : 'border-stone-300'
                        )}
                      >
                        {formData.outletType === type.value && (
                          <div className="h-2 w-2 rounded-full bg-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-stone-900">{type.label}</div>
                        <div className="text-sm text-stone-500">{type.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
                {errors.outletType && (
                  <p className="mt-1.5 text-xs text-red-500">{errors.outletType}</p>
                )}
              </div>

              {/* Default Toggle */}
              <div className="flex items-center justify-between rounded-xl border border-stone-200 bg-stone-50/50 p-4">
                <div>
                  <div className="font-medium text-stone-900">Set as Default</div>
                  <div className="text-sm text-stone-500">
                    Use this template for new outlets of this type
                  </div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={formData.isDefault}
                  onClick={() => updateField('isDefault', !formData.isDefault)}
                  className={cn(
                    'relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors',
                    formData.isDefault ? 'bg-amber-500' : 'bg-stone-300'
                  )}
                >
                  <span
                    className={cn(
                      'inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform',
                      formData.isDefault ? 'translate-x-5' : 'translate-x-0.5'
                    )}
                  />
                </button>
              </div>
            </div>
          )}

          {/* Toolbar Tab */}
          {activeTab === 'toolbar' && (
            <div className="space-y-5">
              {/* Explanation */}
              <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4">
                <p className="text-sm text-blue-800">
                  <strong>Toolbar</strong> appears at the top of the POS screen. Use groups to organize
                  category tabs (e.g., &quot;Apparel&quot;, &quot;Equipment&quot;) or quick-access buttons
                  (e.g., &quot;Search&quot;, &quot;Member Lookup&quot;).
                </p>
              </div>

              <div className="flex items-center justify-between">
                <h3 className="font-medium text-stone-900">Toolbar Groups</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addToolbarGroup}
                  className="gap-1.5"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Group
                </Button>
              </div>

              <div className="space-y-3">
                {(formData.toolbarConfig.groups ?? []).map((group, index) => (
                  <div
                    key={group.id}
                    className="group rounded-xl border border-stone-200 bg-white p-4 transition-all hover:border-stone-300"
                  >
                    <div className="flex items-center gap-3">
                      <div className="cursor-move text-stone-300 hover:text-stone-500">
                        <GripVertical className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <label className="mb-1 block text-xs font-medium text-stone-500">Group Name</label>
                        <input
                          type="text"
                          value={group.label}
                          onChange={(e) => updateToolbarGroup(index, { label: e.target.value })}
                          className="h-9 w-full rounded-lg border border-stone-200 bg-stone-50 px-3 text-sm font-medium transition-colors focus:border-amber-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-100"
                          placeholder="e.g., Categories, Actions..."
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeToolbarGroup(index)}
                        className="rounded-lg p-1.5 text-stone-400 transition-all hover:bg-red-50 hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="mt-2 text-xs text-stone-400 pl-7">
                      Buttons for this group will be configured in the POS button registry
                    </p>
                  </div>
                ))}

                {(formData.toolbarConfig.groups ?? []).length === 0 && (
                  <div className="rounded-xl border border-dashed border-stone-300 bg-stone-50 py-8 text-center">
                    <Layout className="mx-auto h-8 w-8 text-stone-300 mb-2" />
                    <p className="text-sm text-stone-500">No groups yet. Add a group to get started.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Actions Tab */}
          {activeTab === 'actions' && (
            <div className="space-y-5">
              {/* Explanation */}
              <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4">
                <p className="text-sm text-blue-800">
                  <strong>Action Bar</strong> appears at the bottom of the POS screen. Configure buttons
                  for payment options (Pay, Cash, Card), transaction actions (Cancel, Hold), and other
                  common operations.
                </p>
              </div>

              {/* Preview */}
              <div className="rounded-xl border border-stone-200 bg-stone-100 p-4">
                <p className="mb-3 text-xs font-medium uppercase tracking-wider text-stone-500">Live Preview</p>
                <div className="rounded-lg bg-white p-3 shadow-sm">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="mb-1.5 text-[10px] font-medium text-stone-400 uppercase">Left</p>
                      <div className="flex flex-wrap gap-1.5 min-h-[32px]">
                        {(formData.actionBarConfig.buttons ?? [])
                          .filter((b) => b.position === 'left')
                          .map((btn) => (
                            <span
                              key={btn.id}
                              className={cn(
                                'rounded px-2.5 py-1 text-xs font-medium',
                                btn.variant === 'danger' && 'bg-red-500 text-white',
                                btn.variant === 'ghost' && 'bg-stone-100 text-stone-600',
                                btn.variant === 'secondary' && 'bg-stone-200 text-stone-700',
                                btn.variant === 'primary' && 'bg-amber-500 text-white'
                              )}
                            >
                              {btn.label || 'Untitled'}
                            </span>
                          ))}
                        {(formData.actionBarConfig.buttons ?? []).filter((b) => b.position === 'left').length === 0 && (
                          <span className="text-xs text-stone-300 italic">Empty</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="mb-1.5 text-[10px] font-medium text-stone-400 uppercase text-center">Center</p>
                      <div className="flex flex-wrap gap-1.5 justify-center min-h-[32px]">
                        {(formData.actionBarConfig.buttons ?? [])
                          .filter((b) => b.position === 'center')
                          .map((btn) => (
                            <span
                              key={btn.id}
                              className={cn(
                                'rounded px-2.5 py-1 text-xs font-medium',
                                btn.variant === 'danger' && 'bg-red-500 text-white',
                                btn.variant === 'ghost' && 'bg-stone-100 text-stone-600',
                                btn.variant === 'secondary' && 'bg-stone-200 text-stone-700',
                                btn.variant === 'primary' && 'bg-amber-500 text-white'
                              )}
                            >
                              {btn.label || 'Untitled'}
                            </span>
                          ))}
                        {(formData.actionBarConfig.buttons ?? []).filter((b) => b.position === 'center').length === 0 && (
                          <span className="text-xs text-stone-300 italic">Empty</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="mb-1.5 text-[10px] font-medium text-stone-400 uppercase text-right">Right</p>
                      <div className="flex flex-wrap gap-1.5 justify-end min-h-[32px]">
                        {(formData.actionBarConfig.buttons ?? [])
                          .filter((b) => b.position === 'right')
                          .map((btn) => (
                            <span
                              key={btn.id}
                              className={cn(
                                'rounded px-2.5 py-1 text-xs font-medium',
                                btn.variant === 'danger' && 'bg-red-500 text-white',
                                btn.variant === 'ghost' && 'bg-stone-100 text-stone-600',
                                btn.variant === 'secondary' && 'bg-stone-200 text-stone-700',
                                btn.variant === 'primary' && 'bg-amber-500 text-white'
                              )}
                            >
                              {btn.label || 'Untitled'}
                            </span>
                          ))}
                        {(formData.actionBarConfig.buttons ?? []).filter((b) => b.position === 'right').length === 0 && (
                          <span className="text-xs text-stone-300 italic">Empty</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Header */}
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-stone-900">Buttons</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addActionButton}
                  className="gap-1.5"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Button
                </Button>
              </div>

              {/* Column Headers */}
              {(formData.actionBarConfig.buttons ?? []).length > 0 && (
                <div className="grid gap-2 grid-cols-[1fr_1.5fr_auto_auto] px-10 text-xs font-medium text-stone-500">
                  <span>Label</span>
                  <span>Action</span>
                  <span>Style</span>
                  <span>Position</span>
                </div>
              )}

              {/* Button List */}
              <div className="space-y-2">
                {(formData.actionBarConfig.buttons ?? []).map((btn, index) => (
                  <div
                    key={btn.id}
                    className="group flex items-center gap-3 rounded-xl border border-stone-200 bg-white p-3 transition-all hover:border-stone-300"
                  >
                    <div className="cursor-move text-stone-300 hover:text-stone-500">
                      <GripVertical className="h-4 w-4" />
                    </div>
                    <div className="flex-1 grid gap-2 grid-cols-[1fr_1.5fr_auto_auto]">
                      <input
                        type="text"
                        value={btn.label}
                        onChange={(e) => updateActionButton(index, { label: e.target.value })}
                        className="h-9 rounded-lg border border-stone-200 bg-stone-50 px-3 text-sm transition-colors focus:border-amber-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-100"
                        placeholder="Label..."
                      />
                      <div className="relative">
                        <select
                          value={btn.actionType}
                          onChange={(e) => updateActionButton(index, { actionType: e.target.value as POSActionType })}
                          className="h-9 w-full appearance-none rounded-lg border border-stone-200 bg-stone-50 pl-3 pr-8 text-sm transition-colors focus:border-amber-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-100"
                        >
                          <optgroup label="Payment">
                            <option value={POS_ACTION_TYPES.OPEN_PAYMENT_MODAL}>Open Payment Modal</option>
                            <option value={POS_ACTION_TYPES.PROCESS_CASH_PAYMENT}>Cash Payment</option>
                            <option value={POS_ACTION_TYPES.PROCESS_CARD_PAYMENT}>Card Payment</option>
                            <option value={POS_ACTION_TYPES.CHARGE_TO_MEMBER}>Charge to Member</option>
                            <option value={POS_ACTION_TYPES.SPLIT_PAYMENT}>Split Payment</option>
                          </optgroup>
                          <optgroup label="Transaction">
                            <option value={POS_ACTION_TYPES.CANCEL_TRANSACTION}>Cancel Transaction</option>
                            <option value={POS_ACTION_TYPES.HOLD_TICKET}>Hold Ticket</option>
                            <option value={POS_ACTION_TYPES.RECALL_TICKET}>Recall Ticket</option>
                            <option value={POS_ACTION_TYPES.VOID_TRANSACTION}>Void Transaction</option>
                          </optgroup>
                          <optgroup label="Item">
                            <option value={POS_ACTION_TYPES.VOID_ITEM}>Void Item</option>
                            <option value={POS_ACTION_TYPES.APPLY_DISCOUNT}>Apply Discount</option>
                            <option value={POS_ACTION_TYPES.APPLY_ITEM_DISCOUNT}>Item Discount</option>
                            <option value={POS_ACTION_TYPES.CHANGE_QUANTITY}>Change Quantity</option>
                            <option value={POS_ACTION_TYPES.PRICE_OVERRIDE}>Price Override</option>
                          </optgroup>
                          <optgroup label="Utility">
                            <option value={POS_ACTION_TYPES.PRINT_RECEIPT}>Print Receipt</option>
                            <option value={POS_ACTION_TYPES.OPEN_DRAWER}>Open Drawer</option>
                            <option value={POS_ACTION_TYPES.PRICE_CHECK}>Price Check</option>
                          </optgroup>
                          <optgroup label="Member">
                            <option value={POS_ACTION_TYPES.MEMBER_LOOKUP}>Member Lookup</option>
                            <option value={POS_ACTION_TYPES.ATTACH_MEMBER}>Attach Member</option>
                            <option value={POS_ACTION_TYPES.DETACH_MEMBER}>Detach Member</option>
                          </optgroup>
                          <optgroup label="Navigation">
                            <option value={POS_ACTION_TYPES.NEW_TICKET}>New Ticket</option>
                            <option value={POS_ACTION_TYPES.SWITCH_OUTLET}>Switch Outlet</option>
                          </optgroup>
                          <optgroup label="Other">
                            <option value={POS_ACTION_TYPES.CUSTOM}>Custom Action</option>
                          </optgroup>
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                      </div>
                      <div className="relative w-28">
                        <select
                          value={btn.variant}
                          onChange={(e) => updateActionButton(index, { variant: e.target.value as ActionButton['variant'] })}
                          className="h-9 w-full appearance-none rounded-lg border border-stone-200 bg-stone-50 pl-3 pr-8 text-sm transition-colors focus:border-amber-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-100"
                        >
                          <option value="primary">Primary</option>
                          <option value="secondary">Secondary</option>
                          <option value="danger">Danger</option>
                          <option value="ghost">Ghost</option>
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                      </div>
                      <div className="relative w-24">
                        <select
                          value={btn.position}
                          onChange={(e) => updateActionButton(index, { position: e.target.value as ActionButton['position'] })}
                          className="h-9 w-full appearance-none rounded-lg border border-stone-200 bg-stone-50 pl-3 pr-8 text-sm transition-colors focus:border-amber-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-100"
                        >
                          <option value="left">Left</option>
                          <option value="center">Center</option>
                          <option value="right">Right</option>
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeActionButton(index)}
                      className="rounded-lg p-1.5 text-stone-400 transition-all hover:bg-red-50 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}

                {(formData.actionBarConfig.buttons ?? []).length === 0 && (
                  <div className="rounded-xl border border-dashed border-stone-300 bg-stone-50 py-8 text-center">
                    <Layout className="mx-auto h-8 w-8 text-stone-300 mb-2" />
                    <p className="text-sm text-stone-500">No buttons yet. Add buttons to build your action bar.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-stone-100 bg-stone-50/50 px-6 py-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSaving}
            className="min-w-[100px]"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="min-w-[140px] bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-sm hover:from-amber-600 hover:to-amber-700"
          >
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditMode ? 'Save Changes' : 'Create Template'}
          </Button>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(10px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </>
  )
}
