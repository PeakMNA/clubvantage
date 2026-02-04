'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { cn } from '@clubvantage/ui'
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  AlertCircle,
  DollarSign,
  Car,
  Users,
  ChevronDown,
  ChevronRight,
  Calendar,
  Settings,
  Check,
  X,
} from 'lucide-react'
import { Modal } from './modal'

// =============================================================================
// Types
// =============================================================================

export type PlayerType = 'MEMBER' | 'GUEST' | 'DEPENDENT' | 'WALK_UP'
export type HoleOption = 9 | 18
export type TimeCategory = 'PRIME' | 'STANDARD' | 'TWILIGHT' | 'SUPER_TWILIGHT'
export type CartType = 'SINGLE' | 'SHARED' | 'PRIVATE'
export type CaddyType = 'SINGLE' | 'SHARED' | 'FORECADDY'
export type TaxType = 'INCLUSIVE' | 'EXCLUSIVE' | 'EXEMPT'

export interface GreenFeeRate {
  id: string
  playerType: PlayerType
  holes: HoleOption
  timeCategory: TimeCategory
  amount: number
  taxType: TaxType
  taxRate: number
  createdAt?: string
  updatedAt?: string
}

export interface CartRate {
  id: string
  cartType: CartType
  amount: number
  taxType: TaxType
  taxRate: number
  createdAt?: string
  updatedAt?: string
}

export interface CaddyRate {
  id: string
  caddyType: CaddyType
  amount: number
  taxType: TaxType
  taxRate: number
  createdAt?: string
  updatedAt?: string
}

export interface RateConfig {
  id: string
  courseId: string
  name: string
  description?: string
  isActive: boolean
  effectiveFrom?: string
  effectiveTo?: string
  greenFeeRates: GreenFeeRate[]
  cartRates: CartRate[]
  caddyRates: CaddyRate[]
  createdAt?: string
  updatedAt?: string
}

// =============================================================================
// Props
// =============================================================================

interface RateConfigManagerProps {
  courseId: string
  courseName?: string
  rateConfigs: RateConfig[]
  isLoading?: boolean
  onCreateRateConfig: (data: Omit<RateConfig, 'id' | 'createdAt' | 'updatedAt' | 'greenFeeRates' | 'cartRates' | 'caddyRates'>) => Promise<RateConfig>
  onUpdateRateConfig: (id: string, data: Partial<RateConfig>) => Promise<void>
  onDeleteRateConfig: (id: string) => Promise<void>
  onCreateGreenFeeRate: (rateConfigId: string, data: Omit<GreenFeeRate, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  onUpdateGreenFeeRate: (id: string, data: Partial<GreenFeeRate>) => Promise<void>
  onDeleteGreenFeeRate: (id: string) => Promise<void>
  onCreateCartRate: (rateConfigId: string, data: Omit<CartRate, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  onUpdateCartRate: (id: string, data: Partial<CartRate>) => Promise<void>
  onDeleteCartRate: (id: string) => Promise<void>
  onCreateCaddyRate: (rateConfigId: string, data: Omit<CaddyRate, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  onUpdateCaddyRate: (id: string, data: Partial<CaddyRate>) => Promise<void>
  onDeleteCaddyRate: (id: string) => Promise<void>
  onRefresh?: () => void
}

// =============================================================================
// Constants
// =============================================================================

const PLAYER_TYPE_OPTIONS: { value: PlayerType; label: string }[] = [
  { value: 'MEMBER', label: 'Member' },
  { value: 'GUEST', label: 'Guest' },
  { value: 'DEPENDENT', label: 'Dependent' },
  { value: 'WALK_UP', label: 'Walk-up' },
]

const HOLE_OPTIONS: { value: HoleOption; label: string }[] = [
  { value: 9, label: '9 Holes' },
  { value: 18, label: '18 Holes' },
]

const TIME_CATEGORY_OPTIONS: { value: TimeCategory; label: string }[] = [
  { value: 'PRIME', label: 'Prime Time' },
  { value: 'STANDARD', label: 'Standard' },
  { value: 'TWILIGHT', label: 'Twilight' },
  { value: 'SUPER_TWILIGHT', label: 'Super Twilight' },
]

const CART_TYPE_OPTIONS: { value: CartType; label: string }[] = [
  { value: 'SINGLE', label: 'Single Rider' },
  { value: 'SHARED', label: 'Shared Cart' },
  { value: 'PRIVATE', label: 'Private Cart' },
]

const CADDY_TYPE_OPTIONS: { value: CaddyType; label: string }[] = [
  { value: 'SINGLE', label: 'Single Caddy' },
  { value: 'SHARED', label: 'Shared Caddy' },
  { value: 'FORECADDY', label: 'Forecaddy' },
]

const TAX_TYPE_OPTIONS: { value: TaxType; label: string }[] = [
  { value: 'INCLUSIVE', label: 'Inclusive' },
  { value: 'EXCLUSIVE', label: 'Exclusive' },
  { value: 'EXEMPT', label: 'Exempt' },
]

// =============================================================================
// Helper Components
// =============================================================================

function StatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium',
        isActive
          ? 'bg-emerald-500 text-white'
          : 'bg-stone-100 text-stone-600 dark:bg-stone-700 dark:text-stone-400'
      )}
    >
      {isActive ? 'Active' : 'Inactive'}
    </span>
  )
}

function PlayerTypeBadge({ type }: { type: PlayerType }) {
  const config = {
    MEMBER: { bg: 'bg-blue-500', text: 'text-white', label: 'M' },
    GUEST: { bg: 'bg-amber-500', text: 'text-white', label: 'G' },
    DEPENDENT: { bg: 'bg-teal-500', text: 'text-white', label: 'D' },
    WALK_UP: { bg: 'bg-stone-200', text: 'text-stone-700', label: 'W' },
  }[type]

  return (
    <span className={cn('inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold', config.bg, config.text)}>
      {config.label}
    </span>
  )
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function SkeletonCard() {
  return (
    <div className="relative overflow-hidden rounded-xl border bg-card/80 p-5 animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="space-y-2">
          <div className="h-5 w-40 bg-muted rounded" />
          <div className="h-4 w-24 bg-muted/50 rounded" />
        </div>
        <div className="h-6 w-16 bg-muted rounded-full" />
      </div>
      <div className="space-y-3">
        <div className="h-4 w-full bg-muted/50 rounded" />
        <div className="h-4 w-3/4 bg-muted/50 rounded" />
      </div>
    </div>
  )
}

// =============================================================================
// Inline Edit Row Component
// =============================================================================

interface InlineEditRowProps<T> {
  item: T
  fields: {
    key: keyof T
    label: string
    type: 'text' | 'number' | 'select'
    options?: { value: string | number; label: string }[]
    width?: string
  }[]
  onSave: (data: Partial<T>) => Promise<void>
  onDelete: () => Promise<void>
  renderBadge?: (item: T) => React.ReactNode
  formatValue?: (key: keyof T, value: unknown) => string
}

function InlineEditRow<T extends { id: string }>({
  item,
  fields,
  onSave,
  onDelete,
  renderBadge,
  formatValue,
}: InlineEditRowProps<T>) {
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState<Partial<T>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleStartEdit = () => {
    setEditData({})
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    setEditData({})
    setIsEditing(false)
  }

  const handleSave = async () => {
    if (Object.keys(editData).length === 0) {
      setIsEditing(false)
      return
    }

    setIsSaving(true)
    try {
      await onSave(editData)
      setIsEditing(false)
      setEditData({})
    } catch (err) {
      console.error('Failed to save:', err)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await onDelete()
    } catch (err) {
      console.error('Failed to delete:', err)
    } finally {
      setIsDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  const getValue = (key: keyof T) => {
    return key in editData ? editData[key] : item[key]
  }

  const displayValue = (key: keyof T) => {
    const value = item[key]
    if (formatValue) {
      return formatValue(key, value)
    }
    return String(value)
  }

  return (
    <tr className="border-b border-stone-100 dark:border-stone-700 hover:bg-stone-50/50 dark:hover:bg-stone-800/50">
      {renderBadge && (
        <td className="px-3 py-2.5">
          {renderBadge(item)}
        </td>
      )}
      {fields.map((field) => (
        <td key={String(field.key)} className={cn('px-3 py-2.5', field.width)}>
          {isEditing ? (
            field.type === 'select' ? (
              <select
                value={String(getValue(field.key))}
                onChange={(e) => setEditData({ ...editData, [field.key]: e.target.value } as Partial<T>)}
                className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {field.options?.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type={field.type}
                value={String(getValue(field.key))}
                onChange={(e) => {
                  const value = field.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value
                  setEditData({ ...editData, [field.key]: value } as Partial<T>)
                }}
                className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            )
          ) : (
            <span className="text-sm text-stone-700 dark:text-stone-300">
              {displayValue(field.key)}
            </span>
          )}
        </td>
      ))}
      <td className="px-3 py-2.5 text-right">
        {isEditing ? (
          <div className="flex items-center justify-end gap-1">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded transition-colors"
              title="Save"
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            </button>
            <button
              onClick={handleCancelEdit}
              className="p-1.5 text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-700 rounded transition-colors"
              title="Cancel"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : showDeleteConfirm ? (
          <div className="flex items-center justify-end gap-1">
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
            >
              {isDeleting ? 'Deleting...' : 'Confirm'}
            </button>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="px-2 py-1 text-xs border rounded hover:bg-stone-100 dark:hover:bg-stone-700"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-end gap-1">
            <button
              onClick={handleStartEdit}
              className="p-1.5 text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-700 rounded transition-colors"
              title="Edit"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded transition-colors"
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )}
      </td>
    </tr>
  )
}

// =============================================================================
// Rate Tables
// =============================================================================

interface GreenFeeRateTableProps {
  rates: GreenFeeRate[]
  onUpdate: (id: string, data: Partial<GreenFeeRate>) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onAdd: () => void
}

function GreenFeeRateTable({ rates, onUpdate, onDelete, onAdd }: GreenFeeRateTableProps) {
  const sortedRates = useMemo(() => {
    return [...rates].sort((a, b) => {
      const playerTypeOrder = ['MEMBER', 'GUEST', 'DEPENDENT', 'WALK_UP']
      const timeCategoryOrder = ['PRIME', 'STANDARD', 'TWILIGHT', 'SUPER_TWILIGHT']

      const playerCompare = playerTypeOrder.indexOf(a.playerType) - playerTypeOrder.indexOf(b.playerType)
      if (playerCompare !== 0) return playerCompare

      const holesCompare = a.holes - b.holes
      if (holesCompare !== 0) return holesCompare

      return timeCategoryOrder.indexOf(a.timeCategory) - timeCategoryOrder.indexOf(b.timeCategory)
    })
  }, [rates])

  const formatRateValue = (key: keyof GreenFeeRate, value: unknown): string => {
    if (key === 'amount') return formatCurrency(value as number)
    if (key === 'holes') return `${value} holes`
    if (key === 'taxRate') return `${value}%`
    if (key === 'timeCategory') {
      return TIME_CATEGORY_OPTIONS.find(o => o.value === value)?.label || String(value)
    }
    if (key === 'taxType') {
      return TAX_TYPE_OPTIONS.find(o => o.value === value)?.label || String(value)
    }
    return String(value)
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-stone-50 dark:bg-stone-800 border-b">
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-emerald-600" />
          <h4 className="font-medium text-sm text-stone-900 dark:text-stone-100">Green Fee Rates</h4>
          <span className="text-xs text-stone-500 dark:text-stone-400">({rates.length})</span>
        </div>
        <button
          onClick={onAdd}
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-500/10 rounded-lg transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Rate
        </button>
      </div>

      {rates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 px-4">
          <DollarSign className="h-8 w-8 text-stone-300 dark:text-stone-600 mb-2" />
          <p className="text-sm text-stone-500 dark:text-stone-400">No green fee rates configured</p>
          <button
            onClick={onAdd}
            className="mt-3 text-sm text-amber-600 hover:underline"
          >
            Add your first rate
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-stone-50/50 dark:bg-stone-800/50 text-left text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                <th className="px-3 py-2">Type</th>
                <th className="px-3 py-2">Holes</th>
                <th className="px-3 py-2">Time</th>
                <th className="px-3 py-2">Amount</th>
                <th className="px-3 py-2">Tax Type</th>
                <th className="px-3 py-2">Tax %</th>
                <th className="px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedRates.map((rate) => (
                <InlineEditRow
                  key={rate.id}
                  item={rate}
                  fields={[
                    { key: 'holes', label: 'Holes', type: 'select', options: HOLE_OPTIONS.map(o => ({ value: o.value, label: o.label })) },
                    { key: 'timeCategory', label: 'Time', type: 'select', options: TIME_CATEGORY_OPTIONS.map(o => ({ value: o.value, label: o.label })) },
                    { key: 'amount', label: 'Amount', type: 'number' },
                    { key: 'taxType', label: 'Tax Type', type: 'select', options: TAX_TYPE_OPTIONS.map(o => ({ value: o.value, label: o.label })) },
                    { key: 'taxRate', label: 'Tax %', type: 'number' },
                  ]}
                  onSave={(data) => onUpdate(rate.id, data)}
                  onDelete={() => onDelete(rate.id)}
                  renderBadge={(item) => <PlayerTypeBadge type={item.playerType} />}
                  formatValue={formatRateValue}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

interface CartRateTableProps {
  rates: CartRate[]
  onUpdate: (id: string, data: Partial<CartRate>) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onAdd: () => void
}

function CartRateTable({ rates, onUpdate, onDelete, onAdd }: CartRateTableProps) {
  const formatRateValue = (key: keyof CartRate, value: unknown): string => {
    if (key === 'amount') return formatCurrency(value as number)
    if (key === 'taxRate') return `${value}%`
    if (key === 'cartType') {
      return CART_TYPE_OPTIONS.find(o => o.value === value)?.label || String(value)
    }
    if (key === 'taxType') {
      return TAX_TYPE_OPTIONS.find(o => o.value === value)?.label || String(value)
    }
    return String(value)
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-stone-50 dark:bg-stone-800 border-b">
        <div className="flex items-center gap-2">
          <Car className="h-4 w-4 text-blue-600" />
          <h4 className="font-medium text-sm text-stone-900 dark:text-stone-100">Cart Rates</h4>
          <span className="text-xs text-stone-500 dark:text-stone-400">({rates.length})</span>
        </div>
        <button
          onClick={onAdd}
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-500/10 rounded-lg transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Rate
        </button>
      </div>

      {rates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 px-4">
          <Car className="h-8 w-8 text-stone-300 dark:text-stone-600 mb-2" />
          <p className="text-sm text-stone-500 dark:text-stone-400">No cart rates configured</p>
          <button
            onClick={onAdd}
            className="mt-3 text-sm text-amber-600 hover:underline"
          >
            Add your first rate
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-stone-50/50 dark:bg-stone-800/50 text-left text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                <th className="px-3 py-2">Cart Type</th>
                <th className="px-3 py-2">Amount</th>
                <th className="px-3 py-2">Tax Type</th>
                <th className="px-3 py-2">Tax %</th>
                <th className="px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rates.map((rate) => (
                <InlineEditRow
                  key={rate.id}
                  item={rate}
                  fields={[
                    { key: 'cartType', label: 'Cart Type', type: 'select', options: CART_TYPE_OPTIONS.map(o => ({ value: o.value, label: o.label })) },
                    { key: 'amount', label: 'Amount', type: 'number' },
                    { key: 'taxType', label: 'Tax Type', type: 'select', options: TAX_TYPE_OPTIONS.map(o => ({ value: o.value, label: o.label })) },
                    { key: 'taxRate', label: 'Tax %', type: 'number' },
                  ]}
                  onSave={(data) => onUpdate(rate.id, data)}
                  onDelete={() => onDelete(rate.id)}
                  formatValue={formatRateValue}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

interface CaddyRateTableProps {
  rates: CaddyRate[]
  onUpdate: (id: string, data: Partial<CaddyRate>) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onAdd: () => void
}

function CaddyRateTable({ rates, onUpdate, onDelete, onAdd }: CaddyRateTableProps) {
  const formatRateValue = (key: keyof CaddyRate, value: unknown): string => {
    if (key === 'amount') return formatCurrency(value as number)
    if (key === 'taxRate') return `${value}%`
    if (key === 'caddyType') {
      return CADDY_TYPE_OPTIONS.find(o => o.value === value)?.label || String(value)
    }
    if (key === 'taxType') {
      return TAX_TYPE_OPTIONS.find(o => o.value === value)?.label || String(value)
    }
    return String(value)
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-stone-50 dark:bg-stone-800 border-b">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-purple-600" />
          <h4 className="font-medium text-sm text-stone-900 dark:text-stone-100">Caddy Rates</h4>
          <span className="text-xs text-stone-500 dark:text-stone-400">({rates.length})</span>
        </div>
        <button
          onClick={onAdd}
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-500/10 rounded-lg transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Rate
        </button>
      </div>

      {rates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 px-4">
          <Users className="h-8 w-8 text-stone-300 dark:text-stone-600 mb-2" />
          <p className="text-sm text-stone-500 dark:text-stone-400">No caddy rates configured</p>
          <button
            onClick={onAdd}
            className="mt-3 text-sm text-amber-600 hover:underline"
          >
            Add your first rate
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-stone-50/50 dark:bg-stone-800/50 text-left text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                <th className="px-3 py-2">Caddy Type</th>
                <th className="px-3 py-2">Amount</th>
                <th className="px-3 py-2">Tax Type</th>
                <th className="px-3 py-2">Tax %</th>
                <th className="px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rates.map((rate) => (
                <InlineEditRow
                  key={rate.id}
                  item={rate}
                  fields={[
                    { key: 'caddyType', label: 'Caddy Type', type: 'select', options: CADDY_TYPE_OPTIONS.map(o => ({ value: o.value, label: o.label })) },
                    { key: 'amount', label: 'Amount', type: 'number' },
                    { key: 'taxType', label: 'Tax Type', type: 'select', options: TAX_TYPE_OPTIONS.map(o => ({ value: o.value, label: o.label })) },
                    { key: 'taxRate', label: 'Tax %', type: 'number' },
                  ]}
                  onSave={(data) => onUpdate(rate.id, data)}
                  onDelete={() => onDelete(rate.id)}
                  formatValue={formatRateValue}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// =============================================================================
// Rate Config Card
// =============================================================================

interface RateConfigCardProps {
  config: RateConfig
  onEdit: () => void
  onDelete: () => void
  onUpdateGreenFeeRate: (id: string, data: Partial<GreenFeeRate>) => Promise<void>
  onDeleteGreenFeeRate: (id: string) => Promise<void>
  onAddGreenFeeRate: () => void
  onUpdateCartRate: (id: string, data: Partial<CartRate>) => Promise<void>
  onDeleteCartRate: (id: string) => Promise<void>
  onAddCartRate: () => void
  onUpdateCaddyRate: (id: string, data: Partial<CaddyRate>) => Promise<void>
  onDeleteCaddyRate: (id: string) => Promise<void>
  onAddCaddyRate: () => void
}

function RateConfigCard({
  config,
  onEdit,
  onDelete,
  onUpdateGreenFeeRate,
  onDeleteGreenFeeRate,
  onAddGreenFeeRate,
  onUpdateCartRate,
  onDeleteCartRate,
  onAddCartRate,
  onUpdateCaddyRate,
  onDeleteCaddyRate,
  onAddCaddyRate,
}: RateConfigCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await onDelete()
    } catch (err) {
      console.error('Failed to delete rate config:', err)
    } finally {
      setIsDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  const totalRates = config.greenFeeRates.length + config.cartRates.length + config.caddyRates.length

  const effectiveDateText = useMemo(() => {
    if (config.effectiveFrom && config.effectiveTo) {
      const from = new Date(config.effectiveFrom).toLocaleDateString()
      const to = new Date(config.effectiveTo).toLocaleDateString()
      return `${from} - ${to}`
    }
    if (config.effectiveFrom) {
      return `From ${new Date(config.effectiveFrom).toLocaleDateString()}`
    }
    if (config.effectiveTo) {
      return `Until ${new Date(config.effectiveTo).toLocaleDateString()}`
    }
    return 'Always effective'
  }, [config.effectiveFrom, config.effectiveTo])

  return (
    <div className="relative overflow-hidden rounded-xl border bg-card/80 shadow-lg shadow-stone-200/30 dark:shadow-black/20 backdrop-blur-sm transition-all duration-300">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-muted/50 to-transparent pointer-events-none" />

      {/* Accent line */}
      <div className={cn(
        'absolute left-0 top-0 h-1 w-full',
        config.isActive
          ? 'bg-gradient-to-r from-emerald-300 via-emerald-500 to-emerald-300'
          : 'bg-gradient-to-r from-stone-200 via-stone-400 to-stone-200'
      )} />

      <div className="relative">
        {/* Header */}
        <div className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className={cn(
                'flex h-10 w-10 items-center justify-center rounded-xl shadow-inner',
                config.isActive
                  ? 'bg-gradient-to-br from-emerald-100 to-emerald-200/50'
                  : 'bg-gradient-to-br from-stone-100 to-stone-200/50'
              )}>
                <DollarSign className={cn(
                  'h-5 w-5',
                  config.isActive ? 'text-emerald-600' : 'text-stone-500'
                )} />
              </div>
              <div>
                <h3 className="text-lg font-bold tracking-tight text-foreground">{config.name}</h3>
                {config.description && (
                  <p className="text-sm text-muted-foreground line-clamp-1">{config.description}</p>
                )}
              </div>
            </div>
            <StatusBadge isActive={config.isActive} />
          </div>

          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-muted/80 rounded-lg border text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              {effectiveDateText}
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-muted/80 rounded-lg border text-xs text-muted-foreground">
              <Settings className="h-3.5 w-3.5" />
              {totalRates} rate{totalRates !== 1 ? 's' : ''} configured
            </div>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="text-center p-2.5 bg-muted/80 rounded-xl border">
              <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Green Fees</div>
              <div className="text-lg font-bold tracking-tight text-foreground">{config.greenFeeRates.length}</div>
            </div>
            <div className="text-center p-2.5 bg-muted/80 rounded-xl border">
              <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Cart Rates</div>
              <div className="text-lg font-bold tracking-tight text-foreground">{config.cartRates.length}</div>
            </div>
            <div className="text-center p-2.5 bg-muted/80 rounded-xl border">
              <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Caddy Rates</div>
              <div className="text-lg font-bold tracking-tight text-foreground">{config.caddyRates.length}</div>
            </div>
          </div>

          {/* Expand/Collapse button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-center gap-2 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors"
          >
            {isExpanded ? (
              <>
                <ChevronDown className="h-4 w-4" />
                Hide Rates
              </>
            ) : (
              <>
                <ChevronRight className="h-4 w-4" />
                View & Edit Rates
              </>
            )}
          </button>
        </div>

        {/* Expanded content */}
        {isExpanded && (
          <div className="px-5 pb-5 space-y-4 border-t pt-4">
            <GreenFeeRateTable
              rates={config.greenFeeRates}
              onUpdate={onUpdateGreenFeeRate}
              onDelete={onDeleteGreenFeeRate}
              onAdd={onAddGreenFeeRate}
            />
            <CartRateTable
              rates={config.cartRates}
              onUpdate={onUpdateCartRate}
              onDelete={onDeleteCartRate}
              onAdd={onAddCartRate}
            />
            <CaddyRateTable
              rates={config.caddyRates}
              onUpdate={onUpdateCaddyRate}
              onDelete={onDeleteCaddyRate}
              onAdd={onAddCaddyRate}
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 px-5 pb-5 pt-2 border-t">
          {showDeleteConfirm ? (
            <div className="flex items-center gap-2 w-full">
              <span className="text-sm text-red-600 flex-1">Delete this rate configuration?</span>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Confirm'}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-3 py-1.5 text-sm border rounded-lg hover:bg-muted/50"
              >
                Cancel
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex-1 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all duration-200 font-medium flex items-center justify-center gap-1.5"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
              <button
                onClick={onEdit}
                className="flex-1 py-2.5 text-sm text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-500/10 rounded-xl transition-all duration-200 font-semibold"
              >
                Edit Config
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// =============================================================================
// Rate Config Modal
// =============================================================================

interface RateConfigModalProps {
  isOpen: boolean
  onClose: () => void
  config?: RateConfig | null
  courseId: string
  onSave: (data: Omit<RateConfig, 'id' | 'createdAt' | 'updatedAt' | 'greenFeeRates' | 'cartRates' | 'caddyRates'>) => Promise<void>
}

function RateConfigModal({
  isOpen,
  onClose,
  config,
  courseId,
  onSave,
}: RateConfigModalProps) {
  const isEditMode = !!config

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isActive: true,
    effectiveFrom: '',
    effectiveTo: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (config) {
      setFormData({
        name: config.name,
        description: config.description || '',
        isActive: config.isActive,
        effectiveFrom: config.effectiveFrom?.split('T')[0] || '',
        effectiveTo: config.effectiveTo?.split('T')[0] || '',
      })
    } else {
      setFormData({
        name: '',
        description: '',
        isActive: true,
        effectiveFrom: '',
        effectiveTo: '',
      })
    }
    setError(null)
  }, [config, isOpen])

  const handleSave = async () => {
    if (!formData.name.trim()) {
      setError('Rate configuration name is required')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      await onSave({
        courseId,
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        isActive: formData.isActive,
        effectiveFrom: formData.effectiveFrom || undefined,
        effectiveTo: formData.effectiveTo || undefined,
      })
      onClose()
    } catch (err) {
      setError('Failed to save rate configuration. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const footer = (
    <div className="flex items-center justify-end gap-3 w-full">
      <button
        onClick={onClose}
        className="px-4 py-2 border rounded-lg font-medium hover:bg-muted/50 transition-colors"
      >
        Cancel
      </button>
      <button
        onClick={handleSave}
        disabled={isSubmitting}
        className="px-4 py-2 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-colors disabled:opacity-50 flex items-center gap-2"
      >
        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
        {isEditMode ? 'Save Changes' : 'Create Configuration'}
      </button>
    </div>
  )

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Edit Rate Configuration' : 'Create Rate Configuration'}
      footer={footer}
      size="lg"
    >
      <div className="space-y-6">
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 rounded-lg">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Configuration Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Standard Rates 2024"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Optional description for this rate configuration..."
              rows={2}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Effective From
              </label>
              <input
                type="date"
                value={formData.effectiveFrom}
                onChange={(e) => setFormData({ ...formData, effectiveFrom: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Effective To
              </label>
              <input
                type="date"
                value={formData.effectiveTo}
                onChange={(e) => setFormData({ ...formData, effectiveTo: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
            <label className="flex items-center gap-2 cursor-pointer">
              <button
                type="button"
                role="switch"
                aria-checked={formData.isActive}
                onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                className={cn(
                  'relative h-6 w-11 rounded-full transition-colors',
                  formData.isActive ? 'bg-emerald-500' : 'bg-stone-300 dark:bg-stone-600'
                )}
              >
                <span
                  className={cn(
                    'absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform',
                    formData.isActive && 'translate-x-5'
                  )}
                />
              </button>
              <span className="text-sm font-medium">
                {formData.isActive ? 'Active' : 'Inactive'}
              </span>
            </label>
            <span className="text-xs text-muted-foreground">
              {formData.isActive
                ? 'This configuration will be used for rate calculations'
                : 'This configuration is disabled and will not be used'}
            </span>
          </div>
        </div>
      </div>
    </Modal>
  )
}

// =============================================================================
// Add Rate Modals
// =============================================================================

interface AddGreenFeeRateModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: Omit<GreenFeeRate, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
}

function AddGreenFeeRateModal({ isOpen, onClose, onSave }: AddGreenFeeRateModalProps) {
  const [formData, setFormData] = useState({
    playerType: 'MEMBER' as PlayerType,
    holes: 18 as HoleOption,
    timeCategory: 'STANDARD' as TimeCategory,
    amount: 0,
    taxType: 'INCLUSIVE' as TaxType,
    taxRate: 7,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      setFormData({
        playerType: 'MEMBER',
        holes: 18,
        timeCategory: 'STANDARD',
        amount: 0,
        taxType: 'INCLUSIVE',
        taxRate: 7,
      })
      setError(null)
    }
  }, [isOpen])

  const handleSave = async () => {
    if (formData.amount <= 0) {
      setError('Amount must be greater than 0')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      await onSave(formData)
      onClose()
    } catch (err) {
      setError('Failed to add green fee rate. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const footer = (
    <div className="flex items-center justify-end gap-3 w-full">
      <button onClick={onClose} className="px-4 py-2 border rounded-lg font-medium hover:bg-muted/50">
        Cancel
      </button>
      <button
        onClick={handleSave}
        disabled={isSubmitting}
        className="px-4 py-2 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 disabled:opacity-50 flex items-center gap-2"
      >
        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
        Add Rate
      </button>
    </div>
  )

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Green Fee Rate" footer={footer} size="md">
      <div className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 rounded-lg">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Player Type</label>
            <select
              value={formData.playerType}
              onChange={(e) => setFormData({ ...formData, playerType: e.target.value as PlayerType })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              {PLAYER_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Holes</label>
            <select
              value={formData.holes}
              onChange={(e) => setFormData({ ...formData, holes: parseInt(e.target.value) as HoleOption })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              {HOLE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">Time Category</label>
          <select
            value={formData.timeCategory}
            onChange={(e) => setFormData({ ...formData, timeCategory: e.target.value as TimeCategory })}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            {TIME_CATEGORY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">Amount (THB)</label>
          <input
            type="number"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
            min={0}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Tax Type</label>
            <select
              value={formData.taxType}
              onChange={(e) => setFormData({ ...formData, taxType: e.target.value as TaxType })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              {TAX_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Tax Rate (%)</label>
            <input
              type="number"
              value={formData.taxRate}
              onChange={(e) => setFormData({ ...formData, taxRate: parseFloat(e.target.value) || 0 })}
              min={0}
              max={100}
              step={0.1}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>
      </div>
    </Modal>
  )
}

interface AddCartRateModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: Omit<CartRate, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
}

function AddCartRateModal({ isOpen, onClose, onSave }: AddCartRateModalProps) {
  const [formData, setFormData] = useState({
    cartType: 'SHARED' as CartType,
    amount: 0,
    taxType: 'INCLUSIVE' as TaxType,
    taxRate: 7,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      setFormData({ cartType: 'SHARED', amount: 0, taxType: 'INCLUSIVE', taxRate: 7 })
      setError(null)
    }
  }, [isOpen])

  const handleSave = async () => {
    if (formData.amount <= 0) {
      setError('Amount must be greater than 0')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      await onSave(formData)
      onClose()
    } catch (err) {
      setError('Failed to add cart rate. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const footer = (
    <div className="flex items-center justify-end gap-3 w-full">
      <button onClick={onClose} className="px-4 py-2 border rounded-lg font-medium hover:bg-muted/50">
        Cancel
      </button>
      <button
        onClick={handleSave}
        disabled={isSubmitting}
        className="px-4 py-2 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 disabled:opacity-50 flex items-center gap-2"
      >
        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
        Add Rate
      </button>
    </div>
  )

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Cart Rate" footer={footer} size="md">
      <div className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 rounded-lg">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">Cart Type</label>
          <select
            value={formData.cartType}
            onChange={(e) => setFormData({ ...formData, cartType: e.target.value as CartType })}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            {CART_TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">Amount (THB)</label>
          <input
            type="number"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
            min={0}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Tax Type</label>
            <select
              value={formData.taxType}
              onChange={(e) => setFormData({ ...formData, taxType: e.target.value as TaxType })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              {TAX_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Tax Rate (%)</label>
            <input
              type="number"
              value={formData.taxRate}
              onChange={(e) => setFormData({ ...formData, taxRate: parseFloat(e.target.value) || 0 })}
              min={0}
              max={100}
              step={0.1}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>
      </div>
    </Modal>
  )
}

interface AddCaddyRateModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: Omit<CaddyRate, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
}

function AddCaddyRateModal({ isOpen, onClose, onSave }: AddCaddyRateModalProps) {
  const [formData, setFormData] = useState({
    caddyType: 'SINGLE' as CaddyType,
    amount: 0,
    taxType: 'INCLUSIVE' as TaxType,
    taxRate: 7,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      setFormData({ caddyType: 'SINGLE', amount: 0, taxType: 'INCLUSIVE', taxRate: 7 })
      setError(null)
    }
  }, [isOpen])

  const handleSave = async () => {
    if (formData.amount <= 0) {
      setError('Amount must be greater than 0')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      await onSave(formData)
      onClose()
    } catch (err) {
      setError('Failed to add caddy rate. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const footer = (
    <div className="flex items-center justify-end gap-3 w-full">
      <button onClick={onClose} className="px-4 py-2 border rounded-lg font-medium hover:bg-muted/50">
        Cancel
      </button>
      <button
        onClick={handleSave}
        disabled={isSubmitting}
        className="px-4 py-2 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 disabled:opacity-50 flex items-center gap-2"
      >
        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
        Add Rate
      </button>
    </div>
  )

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Caddy Rate" footer={footer} size="md">
      <div className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 rounded-lg">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">Caddy Type</label>
          <select
            value={formData.caddyType}
            onChange={(e) => setFormData({ ...formData, caddyType: e.target.value as CaddyType })}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            {CADDY_TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">Amount (THB)</label>
          <input
            type="number"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
            min={0}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Tax Type</label>
            <select
              value={formData.taxType}
              onChange={(e) => setFormData({ ...formData, taxType: e.target.value as TaxType })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              {TAX_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Tax Rate (%)</label>
            <input
              type="number"
              value={formData.taxRate}
              onChange={(e) => setFormData({ ...formData, taxRate: parseFloat(e.target.value) || 0 })}
              min={0}
              max={100}
              step={0.1}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>
      </div>
    </Modal>
  )
}

// =============================================================================
// Main Component
// =============================================================================

export function RateConfigManager({
  courseId,
  courseName,
  rateConfigs,
  isLoading,
  onCreateRateConfig,
  onUpdateRateConfig,
  onDeleteRateConfig,
  onCreateGreenFeeRate,
  onUpdateGreenFeeRate,
  onDeleteGreenFeeRate,
  onCreateCartRate,
  onUpdateCartRate,
  onDeleteCartRate,
  onCreateCaddyRate,
  onUpdateCaddyRate,
  onDeleteCaddyRate,
  onRefresh,
}: RateConfigManagerProps) {
  // Modal states
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false)
  const [editingConfig, setEditingConfig] = useState<RateConfig | null>(null)

  // Add rate modal states
  const [addGreenFeeRateFor, setAddGreenFeeRateFor] = useState<string | null>(null)
  const [addCartRateFor, setAddCartRateFor] = useState<string | null>(null)
  const [addCaddyRateFor, setAddCaddyRateFor] = useState<string | null>(null)

  const activeCount = rateConfigs.filter((c) => c.isActive).length

  const handleCreateConfig = useCallback(async (
    data: Omit<RateConfig, 'id' | 'createdAt' | 'updatedAt' | 'greenFeeRates' | 'cartRates' | 'caddyRates'>
  ) => {
    await onCreateRateConfig(data)
    onRefresh?.()
  }, [onCreateRateConfig, onRefresh])

  const handleUpdateConfig = useCallback(async (
    data: Omit<RateConfig, 'id' | 'createdAt' | 'updatedAt' | 'greenFeeRates' | 'cartRates' | 'caddyRates'>
  ) => {
    if (editingConfig) {
      await onUpdateRateConfig(editingConfig.id, data)
      onRefresh?.()
    }
  }, [editingConfig, onUpdateRateConfig, onRefresh])

  const handleOpenCreate = () => {
    setEditingConfig(null)
    setIsConfigModalOpen(true)
  }

  const handleOpenEdit = (config: RateConfig) => {
    setEditingConfig(config)
    setIsConfigModalOpen(true)
  }

  const handleCloseConfigModal = () => {
    setIsConfigModalOpen(false)
    setEditingConfig(null)
  }

  // Green fee rate handlers
  const handleAddGreenFeeRate = useCallback(async (
    data: Omit<GreenFeeRate, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    if (addGreenFeeRateFor) {
      await onCreateGreenFeeRate(addGreenFeeRateFor, data)
      onRefresh?.()
    }
  }, [addGreenFeeRateFor, onCreateGreenFeeRate, onRefresh])

  const handleUpdateGreenFeeRate = useCallback(async (id: string, data: Partial<GreenFeeRate>) => {
    await onUpdateGreenFeeRate(id, data)
    onRefresh?.()
  }, [onUpdateGreenFeeRate, onRefresh])

  const handleDeleteGreenFeeRate = useCallback(async (id: string) => {
    await onDeleteGreenFeeRate(id)
    onRefresh?.()
  }, [onDeleteGreenFeeRate, onRefresh])

  // Cart rate handlers
  const handleAddCartRate = useCallback(async (
    data: Omit<CartRate, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    if (addCartRateFor) {
      await onCreateCartRate(addCartRateFor, data)
      onRefresh?.()
    }
  }, [addCartRateFor, onCreateCartRate, onRefresh])

  const handleUpdateCartRate = useCallback(async (id: string, data: Partial<CartRate>) => {
    await onUpdateCartRate(id, data)
    onRefresh?.()
  }, [onUpdateCartRate, onRefresh])

  const handleDeleteCartRate = useCallback(async (id: string) => {
    await onDeleteCartRate(id)
    onRefresh?.()
  }, [onDeleteCartRate, onRefresh])

  // Caddy rate handlers
  const handleAddCaddyRate = useCallback(async (
    data: Omit<CaddyRate, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    if (addCaddyRateFor) {
      await onCreateCaddyRate(addCaddyRateFor, data)
      onRefresh?.()
    }
  }, [addCaddyRateFor, onCreateCaddyRate, onRefresh])

  const handleUpdateCaddyRate = useCallback(async (id: string, data: Partial<CaddyRate>) => {
    await onUpdateCaddyRate(id, data)
    onRefresh?.()
  }, [onUpdateCaddyRate, onRefresh])

  const handleDeleteCaddyRate = useCallback(async (id: string) => {
    await onDeleteCaddyRate(id)
    onRefresh?.()
  }, [onDeleteCaddyRate, onRefresh])

  const handleDeleteConfig = useCallback(async (id: string) => {
    await onDeleteRateConfig(id)
    onRefresh?.()
  }, [onDeleteRateConfig, onRefresh])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">Rate Configurations</h2>
          <p className="text-sm text-muted-foreground">
            {rateConfigs.length} configuration{rateConfigs.length !== 1 ? 's' : ''} ({activeCount} active)
            {courseName && <span className="ml-1">for {courseName}</span>}
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-xl font-medium shadow-lg shadow-amber-500/20 hover:shadow-xl transition-all duration-300"
        >
          <Plus className="h-4 w-4" />
          Add Configuration
        </button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-6">
          {[1, 2, 3].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : rateConfigs.length === 0 ? (
        <div className="relative overflow-hidden rounded-2xl border bg-card/80 shadow-lg shadow-stone-200/30 dark:shadow-black/20 backdrop-blur-sm">
          <div className="absolute inset-0 bg-gradient-to-br from-muted/50 to-transparent pointer-events-none" />
          <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-stone-200 via-stone-400 to-stone-200" />
          <div className="relative flex flex-col items-center justify-center py-12 sm:py-16 px-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <DollarSign className="h-7 w-7 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-bold tracking-tight text-foreground">
              No rate configurations
            </h3>
            <p className="mt-2 text-sm text-muted-foreground text-center max-w-sm">
              Create your first rate configuration to set up green fees, cart rates, and caddy rates.
            </p>
            <button
              onClick={handleOpenCreate}
              className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-xl font-medium shadow-lg shadow-amber-500/20 hover:shadow-xl transition-all duration-300"
            >
              <Plus className="h-4 w-4" />
              Add Configuration
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {rateConfigs.map((config) => (
            <RateConfigCard
              key={config.id}
              config={config}
              onEdit={() => handleOpenEdit(config)}
              onDelete={() => handleDeleteConfig(config.id)}
              onUpdateGreenFeeRate={handleUpdateGreenFeeRate}
              onDeleteGreenFeeRate={handleDeleteGreenFeeRate}
              onAddGreenFeeRate={() => setAddGreenFeeRateFor(config.id)}
              onUpdateCartRate={handleUpdateCartRate}
              onDeleteCartRate={handleDeleteCartRate}
              onAddCartRate={() => setAddCartRateFor(config.id)}
              onUpdateCaddyRate={handleUpdateCaddyRate}
              onDeleteCaddyRate={handleDeleteCaddyRate}
              onAddCaddyRate={() => setAddCaddyRateFor(config.id)}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <RateConfigModal
        isOpen={isConfigModalOpen}
        onClose={handleCloseConfigModal}
        config={editingConfig}
        courseId={courseId}
        onSave={editingConfig ? handleUpdateConfig : handleCreateConfig}
      />

      <AddGreenFeeRateModal
        isOpen={!!addGreenFeeRateFor}
        onClose={() => setAddGreenFeeRateFor(null)}
        onSave={handleAddGreenFeeRate}
      />

      <AddCartRateModal
        isOpen={!!addCartRateFor}
        onClose={() => setAddCartRateFor(null)}
        onSave={handleAddCartRate}
      />

      <AddCaddyRateModal
        isOpen={!!addCaddyRateFor}
        onClose={() => setAddCaddyRateFor(null)}
        onSave={handleAddCaddyRate}
      />
    </div>
  )
}
