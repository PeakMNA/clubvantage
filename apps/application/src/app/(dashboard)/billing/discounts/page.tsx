'use client'

import { useState, useCallback } from 'react'
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@clubvantage/ui'
import { Button } from '@clubvantage/ui'
import { Input } from '@clubvantage/ui'
import { Label } from '@clubvantage/ui'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@clubvantage/ui'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@clubvantage/ui'
import { MoreVertical, Loader2 } from 'lucide-react'
import { useDiscounts, useDiscountMutations, type DiscountListItem } from '@/hooks/use-discounts'

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('th-TH').format(amount)
}

function formatDate(date: Date | null): string {
  if (!date) return '—'
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

interface DiscountFormData {
  name: string
  code: string
  type: string
  value: number
  scope: string
  validFrom: string
  validTo: string
  usageLimit: string
  requiresApproval: boolean
}

const defaultFormData: DiscountFormData = {
  name: '',
  code: '',
  type: 'PERCENTAGE',
  value: 0,
  scope: 'INVOICE',
  validFrom: '',
  validTo: '',
  usageLimit: '',
  requiresApproval: false,
}

export default function DiscountsPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const { discounts, totalCount, totalPages, isLoading } = useDiscounts({
    page,
    pageSize: 20,
    search: search || undefined,
  })
  const { createDiscount, updateDiscount, deleteDiscount, isCreating, isUpdating, isDeleting } =
    useDiscountMutations()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingDiscount, setEditingDiscount] = useState<DiscountListItem | null>(null)
  const [formData, setFormData] = useState<DiscountFormData>(defaultFormData)

  const openCreate = () => {
    setEditingDiscount(null)
    setFormData(defaultFormData)
    setIsModalOpen(true)
  }

  const openEdit = (discount: DiscountListItem) => {
    setEditingDiscount(discount)
    setFormData({
      name: discount.name,
      code: discount.code || '',
      type: discount.type,
      value: discount.value,
      scope: discount.scope,
      validFrom: discount.validFrom ? discount.validFrom.toISOString().split('T')[0] ?? '' : '',
      validTo: discount.validTo ? discount.validTo.toISOString().split('T')[0] ?? '' : '',
      usageLimit: discount.usageLimit?.toString() || '',
      requiresApproval: discount.requiresApproval,
    })
    setIsModalOpen(true)
  }

  const handleSubmit = useCallback(async () => {
    if (editingDiscount) {
      await updateDiscount(editingDiscount.id, {
        name: formData.name,
        code: formData.code || undefined,
        type: formData.type,
        value: formData.value,
        scope: formData.scope,
        validFrom: formData.validFrom ? new Date(formData.validFrom) : undefined,
        validTo: formData.validTo ? new Date(formData.validTo) : undefined,
        usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : undefined,
        requiresApproval: formData.requiresApproval,
      })
    } else {
      await createDiscount({
        name: formData.name,
        code: formData.code || undefined,
        type: formData.type,
        value: formData.value,
        scope: formData.scope,
        validFrom: formData.validFrom ? new Date(formData.validFrom) : undefined,
        validTo: formData.validTo ? new Date(formData.validTo) : undefined,
        usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : undefined,
        requiresApproval: formData.requiresApproval,
      })
    }
    setIsModalOpen(false)
  }, [editingDiscount, formData, createDiscount, updateDiscount])

  const handleToggleActive = useCallback(
    async (discount: DiscountListItem) => {
      await updateDiscount(discount.id, { isActive: !discount.isActive })
    },
    [updateDiscount]
  )

  const handleDelete = useCallback(
    async (id: string) => {
      await deleteDiscount(id)
    },
    [deleteDiscount]
  )

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/billing">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-1 h-4 w-4" />
              Billing
            </Button>
          </Link>
          <h1 className="text-2xl font-semibold">Promotional Discounts</h1>
        </div>
        <Button
          size="sm"
          onClick={openCreate}
          className="bg-gradient-to-br from-amber-500 to-amber-600 text-white"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Discount
        </Button>
      </div>

      {/* Search */}
      <div className="max-w-sm">
        <Input
          placeholder="Search discounts..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
        />
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="grid grid-cols-12 gap-4 border-b border-border bg-muted/50 px-4 py-3 text-xs font-medium uppercase text-muted-foreground">
          <div className="col-span-2">Name</div>
          <div className="col-span-1">Code</div>
          <div className="col-span-1">Type</div>
          <div className="col-span-1 text-right">Value</div>
          <div className="col-span-1">Scope</div>
          <div className="col-span-2">Usage</div>
          <div className="col-span-2">Valid Period</div>
          <div className="col-span-1 text-center">Active</div>
          <div className="col-span-1"></div>
        </div>

        {isLoading ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex gap-4">
                <div className="h-4 w-32 animate-pulse rounded bg-muted" />
                <div className="h-4 w-16 animate-pulse rounded bg-muted" />
                <div className="h-4 w-20 animate-pulse rounded bg-muted" />
              </div>
            ))}
          </div>
        ) : discounts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <p className="text-lg font-medium">No discounts found</p>
            <p className="text-sm">Create your first discount to get started.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {discounts.map((discount) => (
              <div
                key={discount.id}
                className="grid grid-cols-12 gap-4 items-center px-4 py-3 hover:bg-muted/50 transition-colors"
              >
                <div className="col-span-2 font-medium text-sm">{discount.name}</div>
                <div className="col-span-1 text-xs text-muted-foreground font-mono">
                  {discount.code || '—'}
                </div>
                <div className="col-span-1">
                  <span className="inline-flex items-center rounded-full bg-stone-100 px-2 py-0.5 text-xs">
                    {discount.type === 'PERCENTAGE' ? '%' : '฿'}
                  </span>
                </div>
                <div className="col-span-1 text-right text-sm font-medium">
                  {discount.type === 'PERCENTAGE'
                    ? `${discount.value}%`
                    : `฿${formatCurrency(discount.value)}`}
                </div>
                <div className="col-span-1 text-xs text-muted-foreground">{discount.scope}</div>
                <div className="col-span-2 text-xs text-muted-foreground">
                  {discount.usageCount}
                  {discount.usageLimit ? ` / ${discount.usageLimit}` : ' uses'}
                </div>
                <div className="col-span-2 text-xs text-muted-foreground">
                  {discount.validFrom || discount.validTo
                    ? `${formatDate(discount.validFrom)} — ${formatDate(discount.validTo)}`
                    : 'No expiry'}
                </div>
                <div className="col-span-1 text-center">
                  <button
                    onClick={() => handleToggleActive(discount)}
                    className="text-stone-400 hover:text-stone-600"
                  >
                    {discount.isActive ? (
                      <ToggleRight className="h-5 w-5 text-emerald-600" />
                    ) : (
                      <ToggleLeft className="h-5 w-5 text-stone-400" />
                    )}
                  </button>
                </div>
                <div className="col-span-1 flex justify-end">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEdit(discount)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(discount.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingDiscount ? 'Edit Discount' : 'Create Discount'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="discount-name">Name</Label>
                <Input
                  id="discount-name"
                  value={formData.name}
                  onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                  placeholder="e.g., New Year Promo"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="discount-code">Code (optional)</Label>
                <Input
                  id="discount-code"
                  value={formData.code}
                  onChange={(e) => setFormData((p) => ({ ...p, code: e.target.value.toUpperCase() }))}
                  placeholder="e.g., NY2024"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="discount-type">Type</Label>
                <select
                  id="discount-type"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  value={formData.type}
                  onChange={(e) => setFormData((p) => ({ ...p, type: e.target.value }))}
                >
                  <option value="PERCENTAGE">Percentage</option>
                  <option value="FIXED_AMOUNT">Fixed Amount</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="discount-value">
                  Value {formData.type === 'PERCENTAGE' ? '(%)' : '(฿)'}
                </Label>
                <Input
                  id="discount-value"
                  type="number"
                  min={0}
                  step="0.01"
                  value={formData.value}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, value: parseFloat(e.target.value) || 0 }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="discount-scope">Scope</Label>
                <select
                  id="discount-scope"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  value={formData.scope}
                  onChange={(e) => setFormData((p) => ({ ...p, scope: e.target.value }))}
                >
                  <option value="INVOICE">Invoice</option>
                  <option value="LINE_ITEM">Line Item</option>
                  <option value="TRANSACTION">Transaction</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="discount-from">Valid From</Label>
                <Input
                  id="discount-from"
                  type="date"
                  value={formData.validFrom}
                  onChange={(e) => setFormData((p) => ({ ...p, validFrom: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="discount-to">Valid To</Label>
                <Input
                  id="discount-to"
                  type="date"
                  value={formData.validTo}
                  onChange={(e) => setFormData((p) => ({ ...p, validTo: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="discount-limit">Usage Limit</Label>
                <Input
                  id="discount-limit"
                  type="number"
                  min={0}
                  value={formData.usageLimit}
                  onChange={(e) => setFormData((p) => ({ ...p, usageLimit: e.target.value }))}
                  placeholder="Unlimited"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="requires-approval"
                checked={formData.requiresApproval}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, requiresApproval: e.target.checked }))
                }
                className="rounded border-border"
              />
              <Label htmlFor="requires-approval" className="cursor-pointer">
                Requires approval before applying
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isCreating || isUpdating || !formData.name}
              className="bg-gradient-to-br from-amber-500 to-amber-600 text-white"
            >
              {(isCreating || isUpdating) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingDiscount ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
