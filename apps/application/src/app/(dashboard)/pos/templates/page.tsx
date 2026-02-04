'use client'

import { useState, useCallback } from 'react'
import { Plus, Copy, Pencil, Trash2, Loader2, LayoutGrid, Grid3X3, Zap, Sparkles, AlertCircle } from 'lucide-react'
import { Button, Card, CardContent, CardHeader, CardTitle } from '@clubvantage/ui'
import {
  useGetPosTemplatesQuery,
  useClonePosTemplateMutation,
  useUpsertPosTemplateMutation,
} from '@clubvantage/api-client'
import { useQueryClient } from '@tanstack/react-query'
import { formatDistanceToNow } from 'date-fns'
import {
  TemplateEditorModal,
  type POSTemplateData,
  type POSTemplateInput,
  type TemplateToolbarGroup,
  type TemplateActionButton,
  POS_ACTION_TYPES,
} from '@/components/pos'

// ============================================================================
// Types & Helpers
// ============================================================================

interface APITemplateConfig {
  gridColumns?: number
  gridRows?: number
  tileSize?: 'SMALL' | 'MEDIUM' | 'LARGE'
  showImages?: boolean
  showPrices?: boolean
  categoryStyle?: 'TABS' | 'SIDEBAR' | 'DROPDOWN'
  showAllCategory?: boolean
  quickKeysEnabled?: boolean
  quickKeysCount?: number
  quickKeysPosition?: 'TOP' | 'LEFT'
  suggestionsEnabled?: boolean
  suggestionsCount?: number
  suggestionsPosition?: 'TOP' | 'SIDEBAR' | 'FLOATING'
  timeOfDayWeight?: number
  salesVelocityWeight?: number
  staffHistoryWeight?: number
  // Toolbar and Action Bar configs
  toolbarGroups?: TemplateToolbarGroup[]
  actionButtons?: TemplateActionButton[]
}

interface APITemplate {
  id: string
  name: string
  description?: string | null
  outletType: string
  toolbarConfig: APITemplateConfig | unknown
  actionBarConfig: unknown
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

// Default F&B toolbar config
// Note: categoryTabs removed since category tabs are in the product panel
const DEFAULT_TOOLBAR_GROUPS: TemplateToolbarGroup[] = [
  { id: 'left-zone', label: 'Table Operations', zone: 'left', items: ['openTable', 'floorPlan', 'search'] },
  { id: 'center-zone', label: 'Member', zone: 'center', items: ['memberLookup', 'attachMember', 'chargeToMember'] },
  { id: 'right-zone', label: 'Table & Ticket', zone: 'right', items: ['splitCheck', 'mergeTables', 'transferTable', 'holdTicket', 'newTicket'] },
]

// Default action bar buttons
const DEFAULT_ACTION_BUTTONS: TemplateActionButton[] = [
  { id: 'cancel', label: 'Cancel', actionType: POS_ACTION_TYPES.CANCEL_TRANSACTION, variant: 'danger', position: 'left' },
  { id: 'void', label: 'Void', actionType: POS_ACTION_TYPES.VOID_ITEM, variant: 'ghost', position: 'left' },
  { id: 'discount', label: 'Discount', actionType: POS_ACTION_TYPES.APPLY_DISCOUNT, variant: 'secondary', position: 'center' },
  { id: 'hold', label: 'Hold', actionType: POS_ACTION_TYPES.HOLD_TICKET, variant: 'secondary', position: 'center' },
  { id: 'print', label: 'Print', actionType: POS_ACTION_TYPES.PRINT_RECEIPT, variant: 'ghost', position: 'center' },
  { id: 'cash', label: 'Cash', actionType: POS_ACTION_TYPES.PROCESS_CASH_PAYMENT, variant: 'secondary', position: 'right' },
  { id: 'card', label: 'Card', actionType: POS_ACTION_TYPES.PROCESS_CARD_PAYMENT, variant: 'secondary', position: 'right' },
  { id: 'pay', label: 'Pay', actionType: POS_ACTION_TYPES.OPEN_PAYMENT_MODAL, variant: 'primary', position: 'right' },
]

// Convert API template to modal data format
function apiTemplateToModalData(template: APITemplate): POSTemplateData {
  const config = (template.toolbarConfig || {}) as APITemplateConfig
  // Debug: log what's being loaded
  console.log('Loading template config:', {
    toolbarConfig: template.toolbarConfig,
    toolbarGroups: config.toolbarGroups,
    actionButtons: config.actionButtons
  })
  return {
    id: template.id,
    name: template.name,
    description: template.description || undefined,
    gridColumns: config.gridColumns ?? 6,
    gridRows: config.gridRows ?? 4,
    tileSize: config.tileSize ?? 'MEDIUM',
    showImages: config.showImages ?? true,
    showPrices: config.showPrices ?? true,
    categoryStyle: config.categoryStyle ?? 'TABS',
    showAllCategory: config.showAllCategory ?? true,
    quickKeysEnabled: config.quickKeysEnabled ?? true,
    quickKeysCount: config.quickKeysCount ?? 8,
    quickKeysPosition: config.quickKeysPosition ?? 'TOP',
    suggestionsEnabled: config.suggestionsEnabled ?? true,
    suggestionsCount: config.suggestionsCount ?? 6,
    suggestionsPosition: config.suggestionsPosition ?? 'TOP',
    timeOfDayWeight: config.timeOfDayWeight ?? 40,
    salesVelocityWeight: config.salesVelocityWeight ?? 35,
    staffHistoryWeight: config.staffHistoryWeight ?? 25,
    // Toolbar and Action Bar configs
    toolbarConfig: {
      groups: config.toolbarGroups ?? DEFAULT_TOOLBAR_GROUPS,
    },
    actionBarConfig: {
      buttons: config.actionButtons ?? DEFAULT_ACTION_BUTTONS,
    },
  }
}

// Convert modal input to API format
function modalInputToAPIFormat(
  input: POSTemplateInput,
  outletType: string = 'RESTAURANT'
) {
  // Debug: log what's being saved
  console.log('Saving template input:', {
    toolbarConfig: input.toolbarConfig,
    actionBarConfig: input.actionBarConfig
  })
  const toolbarConfig: APITemplateConfig = {
    gridColumns: input.gridColumns,
    gridRows: input.gridRows,
    tileSize: input.tileSize,
    showImages: input.showImages,
    showPrices: input.showPrices,
    categoryStyle: input.categoryStyle,
    showAllCategory: input.showAllCategory,
    quickKeysEnabled: input.quickKeysEnabled,
    quickKeysCount: input.quickKeysCount,
    quickKeysPosition: input.quickKeysPosition,
    suggestionsEnabled: input.suggestionsEnabled,
    suggestionsCount: input.suggestionsCount,
    suggestionsPosition: input.suggestionsPosition,
    timeOfDayWeight: input.timeOfDayWeight,
    salesVelocityWeight: input.salesVelocityWeight,
    staffHistoryWeight: input.staffHistoryWeight,
    // Save toolbar and action bar configs
    toolbarGroups: input.toolbarConfig?.groups ?? DEFAULT_TOOLBAR_GROUPS,
    actionButtons: input.actionBarConfig?.buttons ?? DEFAULT_ACTION_BUTTONS,
  }

  return {
    name: input.name,
    description: input.description || '',
    outletType,
    toolbarConfig,
    actionBarConfig: { buttons: input.actionBarConfig?.buttons ?? DEFAULT_ACTION_BUTTONS },
    isDefault: false,
  }
}

// ============================================================================
// Feature Badge Component
// ============================================================================

interface FeatureBadgeProps {
  icon: React.ReactNode
  label: string
  enabled: boolean
}

function FeatureBadge({ icon, label, enabled }: FeatureBadgeProps) {
  if (!enabled) return null
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-stone-100 text-stone-600">
      {icon}
      {label}
    </span>
  )
}

// ============================================================================
// Delete Confirmation Modal
// ============================================================================

interface DeleteConfirmModalProps {
  isOpen: boolean
  templateName: string
  onConfirm: () => void
  onCancel: () => void
  isDeleting: boolean
}

function DeleteConfirmModal({ isOpen, templateName, onConfirm, onCancel, isDeleting }: DeleteConfirmModalProps) {
  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" onClick={onCancel} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-in fade-in-0 zoom-in-95">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-stone-900">Delete Template</h3>
              <p className="mt-2 text-sm text-stone-600">
                Are you sure you want to delete <span className="font-medium">"{templateName}"</span>?
                This action cannot be undone.
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              onClick={onConfirm}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Template'
              )}
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}

// ============================================================================
// Template Card Component
// ============================================================================

interface TemplateCardProps {
  template: APITemplate
  onEdit: (template: APITemplate) => void
  onClone: (templateId: string, templateName: string) => void
  onDelete: (template: APITemplate) => void
  isCloning: boolean
}

function TemplateCard({ template, onEdit, onClone, onDelete, isCloning }: TemplateCardProps) {
  const config = (template.toolbarConfig || {}) as APITemplateConfig
  const gridCols = config.gridColumns ?? 6
  const gridRows = config.gridRows ?? 4
  const quickKeysEnabled = config.quickKeysEnabled ?? false
  const suggestionsEnabled = config.suggestionsEnabled ?? false

  return (
    <Card className="group hover:shadow-lg hover:shadow-stone-200/50 transition-all duration-200 border-stone-200 bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg truncate">{template.name}</CardTitle>
              {template.isDefault && (
                <span className="flex-shrink-0 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                  Default
                </span>
              )}
            </div>
            <p className="text-sm text-stone-500 mt-1 line-clamp-2">
              {template.description || `${template.outletType} template`}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Grid Info */}
        <div className="flex items-center gap-2 text-sm text-stone-600 mb-3">
          <Grid3X3 className="h-4 w-4 text-stone-400" />
          <span>{gridCols} x {gridRows} grid</span>
          <span className="text-stone-300">|</span>
          <span className="capitalize">{(config.tileSize || 'MEDIUM').toLowerCase()} tiles</span>
        </div>

        {/* Feature Badges */}
        <div className="flex flex-wrap gap-2 mb-4">
          <FeatureBadge
            icon={<Zap className="h-3 w-3" />}
            label="Quick Keys"
            enabled={quickKeysEnabled}
          />
          <FeatureBadge
            icon={<Sparkles className="h-3 w-3" />}
            label="Suggestions"
            enabled={suggestionsEnabled}
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-stone-100">
          <span className="text-xs text-stone-400">
            Updated {formatDistanceToNow(new Date(template.updatedAt), { addSuffix: true })}
          </span>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-stone-500 hover:text-amber-600 hover:bg-amber-50"
              onClick={() => onEdit(template)}
              title="Edit template"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-stone-500 hover:text-blue-600 hover:bg-blue-50"
              onClick={() => onClone(template.id, template.name)}
              disabled={isCloning}
              title="Clone template"
            >
              {isCloning ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-stone-500 hover:text-red-600 hover:bg-red-50"
              onClick={() => onDelete(template)}
              title="Delete template"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================================================
// Empty State Component
// ============================================================================

interface EmptyStateProps {
  onCreateClick: () => void
}

function EmptyState({ onCreateClick }: EmptyStateProps) {
  return (
    <Card className="py-16 border-dashed border-2 border-stone-200 bg-stone-50/50">
      <div className="text-center">
        <div className="mx-auto h-16 w-16 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center mb-4">
          <LayoutGrid className="h-8 w-8 text-amber-600" />
        </div>
        <h3 className="text-xl font-semibold text-stone-900">No templates yet</h3>
        <p className="text-sm text-stone-500 mt-2 max-w-md mx-auto">
          Create your first POS template to define button layouts, quick keys, and
          smart suggestions for your outlets.
        </p>
        <Button
          onClick={onCreateClick}
          className="mt-6 bg-gradient-to-br from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Your First Template
        </Button>
      </div>
    </Card>
  )
}

// ============================================================================
// Main Page Component
// ============================================================================

export default function POSTemplatesPage() {
  const queryClient = useQueryClient()

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<POSTemplateData | null>(null)
  const [editingApiTemplate, setEditingApiTemplate] = useState<APITemplate | null>(null)

  // Delete confirmation state
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; template: APITemplate | null }>({
    isOpen: false,
    template: null,
  })
  const [isDeleting, setIsDeleting] = useState(false)

  // Clone state
  const [cloningId, setCloningId] = useState<string | null>(null)

  // Fetch templates from API
  const { data, isLoading, error } = useGetPosTemplatesQuery()
  const templates = (data?.posTemplates ?? []) as APITemplate[]

  // Clone mutation
  const cloneMutation = useClonePosTemplateMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['GetPosTemplates'] })
      setCloningId(null)
    },
    onError: (error) => {
      console.error('Failed to clone template:', error)
      setCloningId(null)
    },
  })

  // Upsert mutation
  const upsertMutation = useUpsertPosTemplateMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['GetPosTemplates'] })
      setIsModalOpen(false)
      setSelectedTemplate(null)
      setEditingApiTemplate(null)
    },
    onError: (error) => {
      console.error('Failed to save template:', error)
    },
  })

  // Handlers
  const handleCreate = useCallback(() => {
    setSelectedTemplate(null)
    setEditingApiTemplate(null)
    setIsModalOpen(true)
  }, [])

  const handleEdit = useCallback((template: APITemplate) => {
    const modalData = apiTemplateToModalData(template)
    setSelectedTemplate(modalData)
    setEditingApiTemplate(template)
    setIsModalOpen(true)
  }, [])

  const handleClone = useCallback(async (templateId: string, templateName: string) => {
    setCloningId(templateId)
    const newName = `${templateName} (Copy)`
    await cloneMutation.mutateAsync({ id: templateId, newName })
  }, [cloneMutation])

  const handleDeleteClick = useCallback((template: APITemplate) => {
    setDeleteConfirm({ isOpen: true, template })
  }, [])

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteConfirm.template) return

    setIsDeleting(true)
    // Note: Delete mutation would be implemented here once available in the API
    // For now, we'll just close the modal
    console.log('Delete template:', deleteConfirm.template.id)

    // Simulating delete for now since there's no delete mutation
    setTimeout(() => {
      setIsDeleting(false)
      setDeleteConfirm({ isOpen: false, template: null })
      // Would invalidate queries here after real delete
    }, 500)
  }, [deleteConfirm.template])

  const handleDeleteCancel = useCallback(() => {
    setDeleteConfirm({ isOpen: false, template: null })
  }, [])

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false)
    setSelectedTemplate(null)
    setEditingApiTemplate(null)
  }, [])

  const handleModalSave = useCallback((input: POSTemplateInput) => {
    // Determine outlet type from the existing template or default to RESTAURANT
    const outletType = editingApiTemplate?.outletType || 'RESTAURANT'

    const apiInput = modalInputToAPIFormat(input, outletType)
    console.log('API Input being sent:', apiInput)

    if (editingApiTemplate) {
      // Update existing template
      upsertMutation.mutate({
        id: editingApiTemplate.id,
        input: apiInput,
      })
    } else {
      // Create new template
      upsertMutation.mutate({
        input: apiInput,
      })
    }
  }, [editingApiTemplate, upsertMutation])

  // Loading state
  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-amber-500 mx-auto" />
          <p className="mt-2 text-sm text-stone-500">Loading templates...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="p-6">
        <Card className="py-12 border-red-200 bg-red-50/50">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <AlertCircle className="h-6 w-6 text-red-500" />
            </div>
            <p className="text-red-700 font-medium">Failed to load templates</p>
            <p className="text-sm text-red-500 mt-1">{String(error)}</p>
            <Button
              variant="outline"
              className="mt-4 border-red-200 text-red-700 hover:bg-red-100"
              onClick={() => queryClient.invalidateQueries({ queryKey: ['GetPosTemplates'] })}
            >
              Try Again
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-stone-900">POS Templates</h1>
          <p className="text-sm text-stone-500 mt-1">
            Manage layout templates for your point of sale terminals
          </p>
        </div>
        <Button
          onClick={handleCreate}
          className="bg-gradient-to-br from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Template
        </Button>
      </div>

      {/* Templates Grid */}
      {templates.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {templates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onEdit={handleEdit}
              onClone={handleClone}
              onDelete={handleDeleteClick}
              isCloning={cloningId === template.id}
            />
          ))}
        </div>
      ) : (
        <EmptyState onCreateClick={handleCreate} />
      )}

      {/* Template Editor Modal */}
      <TemplateEditorModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        template={selectedTemplate}
        onSave={handleModalSave}
        isSaving={upsertMutation.isPending}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteConfirm.isOpen}
        templateName={deleteConfirm.template?.name || ''}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        isDeleting={isDeleting}
      />
    </div>
  )
}
