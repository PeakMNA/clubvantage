'use client'

import { useState, useCallback, useMemo } from 'react'
import { Plus, Trash2, Loader2, Users, CheckCircle, XCircle } from 'lucide-react'
import { cn } from '@clubvantage/ui'
import { Button } from '@clubvantage/ui'
import { Input } from '@clubvantage/ui'
import { Label } from '@clubvantage/ui'
import { MemberCombobox, type MemberOption } from '@clubvantage/ui'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@clubvantage/ui'
import { type ChargeType } from './invoice-line-item-row'

interface LineItemData {
  id: string
  chargeTypeId: string
  description: string
  quantity: number
  unitPrice: number
  taxRate: number
}

export interface BatchInvoiceFormData {
  memberIds: string[]
  invoiceDate: string
  dueDate: string
  billingPeriod?: string
  lineItems: Array<{
    chargeTypeId: string
    description: string
    quantity: number
    unitPrice: number
    taxRate: number
  }>
  notes?: string
  sendEmail: boolean
}

export interface BatchInvoiceResult {
  createdCount: number
  failedCount: number
  errors: Array<{ memberId: string; error: string }>
}

interface BatchInvoiceModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  members: MemberOption[]
  chargeTypes: ChargeType[]
  isLoadingMembers?: boolean
  onMemberSearch?: (query: string) => void
  onSubmit: (data: BatchInvoiceFormData) => Promise<BatchInvoiceResult | void>
  isSubmitting?: boolean
}

function formatDateForInput(date: Date): string {
  return date.toISOString().split('T')[0] || ''
}

export function BatchInvoiceModal({
  open,
  onOpenChange,
  members,
  chargeTypes,
  isLoadingMembers = false,
  onMemberSearch,
  onSubmit,
  isSubmitting = false,
}: BatchInvoiceModalProps) {
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([])
  const [invoiceDate, setInvoiceDate] = useState(formatDateForInput(new Date()))
  const [dueDate, setDueDate] = useState(
    formatDateForInput(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))
  )
  const [billingPeriod, setBillingPeriod] = useState('')
  const [notes, setNotes] = useState('')
  const [sendEmail, setSendEmail] = useState(false)
  const [lineItems, setLineItems] = useState<LineItemData[]>([
    { id: crypto.randomUUID(), chargeTypeId: '', description: '', quantity: 1, unitPrice: 0, taxRate: 0 },
  ])
  const [result, setResult] = useState<BatchInvoiceResult | null>(null)
  const [error, setError] = useState<string>()

  const addLineItem = () => {
    setLineItems((prev) => [
      ...prev,
      { id: crypto.randomUUID(), chargeTypeId: '', description: '', quantity: 1, unitPrice: 0, taxRate: 0 },
    ])
  }

  const removeLineItem = (id: string) => {
    setLineItems((prev) => prev.filter((item) => item.id !== id))
  }

  const updateLineItem = (id: string, field: keyof LineItemData, value: any) => {
    setLineItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item
        const updated = { ...item, [field]: value }
        if (field === 'chargeTypeId') {
          const ct = chargeTypes.find((c) => c.id === value)
          if (ct) {
            updated.description = ct.name
            updated.unitPrice = ct.defaultPrice || 0
            updated.taxRate = ct.taxRate || 0
          }
        }
        return updated
      })
    )
  }

  const addMember = (memberId: string) => {
    if (!selectedMemberIds.includes(memberId)) {
      setSelectedMemberIds((prev) => [...prev, memberId])
    }
  }

  const removeMember = (memberId: string) => {
    setSelectedMemberIds((prev) => prev.filter((id) => id !== memberId))
  }

  const selectAllActive = () => {
    setSelectedMemberIds(members.map((m) => m.id))
  }

  const subtotal = useMemo(() => {
    return lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
  }, [lineItems])

  const handleSubmit = async () => {
    if (selectedMemberIds.length === 0 || lineItems.length === 0) return
    setError(undefined)
    setResult(null)

    try {
      const res = await onSubmit({
        memberIds: selectedMemberIds,
        invoiceDate,
        dueDate,
        billingPeriod: billingPeriod || undefined,
        lineItems: lineItems.map(({ chargeTypeId, description, quantity, unitPrice, taxRate }) => ({
          chargeTypeId,
          description,
          quantity,
          unitPrice,
          taxRate,
        })),
        notes: notes || undefined,
        sendEmail,
      })
      if (res) {
        setResult(res)
      } else {
        onOpenChange(false)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create batch invoices')
    }
  }

  const resetForm = () => {
    setSelectedMemberIds([])
    setLineItems([
      { id: crypto.randomUUID(), chargeTypeId: '', description: '', quantity: 1, unitPrice: 0, taxRate: 0 },
    ])
    setResult(null)
    setError(undefined)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        if (!val) resetForm()
        onOpenChange(val)
      }}
    >
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Generate Batch Invoices</DialogTitle>
        </DialogHeader>

        {result ? (
          <div className="space-y-4">
            <div className="flex items-center gap-4 rounded-lg border border-border p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
                <span className="font-medium">{result.createdCount} invoices created</span>
              </div>
              {result.failedCount > 0 && (
                <div className="flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-red-600" />
                  <span className="font-medium text-red-600">{result.failedCount} failed</span>
                </div>
              )}
            </div>
            {result.errors.length > 0 && (
              <div className="space-y-1">
                <p className="text-sm font-medium text-red-600">Errors:</p>
                {result.errors.map((err, i) => (
                  <p key={i} className="text-sm text-muted-foreground">
                    Member {err.memberId}: {err.error}
                  </p>
                ))}
              </div>
            )}
            <DialogFooter>
              <Button
                onClick={() => {
                  resetForm()
                  onOpenChange(false)
                }}
              >
                Done
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Member Selection */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Members ({selectedMemberIds.length} selected)</Label>
                <Button variant="outline" size="sm" onClick={selectAllActive}>
                  <Users className="mr-1 h-3 w-3" />
                  Select All Active
                </Button>
              </div>
              <MemberCombobox
                members={members}
                isLoading={isLoadingMembers}
                onSearch={onMemberSearch}
                onValueChange={(id) => id && addMember(id)}
                placeholder="Search and add members..."
              />
              {selectedMemberIds.length > 0 && (
                <div className="flex flex-wrap gap-2 rounded-lg border border-border p-2">
                  {selectedMemberIds.map((id) => {
                    const member = members.find((m) => m.id === id)
                    return (
                      <span
                        key={id}
                        className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-2.5 py-0.5 text-xs"
                      >
                        {member ? `${member.firstName} ${member.lastName}` : id}
                        <button
                          onClick={() => removeMember(id)}
                          className="ml-1 text-stone-400 hover:text-stone-600"
                        >
                          &times;
                        </button>
                      </span>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Dates */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="batch-invoice-date">Invoice Date</Label>
                <Input
                  id="batch-invoice-date"
                  type="date"
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="batch-due-date">Due Date</Label>
                <Input
                  id="batch-due-date"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="batch-period">Billing Period</Label>
                <Input
                  id="batch-period"
                  placeholder="e.g., Jan 2024"
                  value={billingPeriod}
                  onChange={(e) => setBillingPeriod(e.target.value)}
                />
              </div>
            </div>

            {/* Line Items Template */}
            <div className="space-y-2">
              <Label>Line Items (applied to all members)</Label>
              <div className="space-y-2">
                {lineItems.map((item) => (
                  <div key={item.id} className="grid grid-cols-12 gap-2 items-end">
                    <div className="col-span-4">
                      <select
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                        value={item.chargeTypeId}
                        onChange={(e) => updateLineItem(item.id, 'chargeTypeId', e.target.value)}
                      >
                        <option value="">Select charge type...</option>
                        {chargeTypes.map((ct) => (
                          <option key={ct.id} value={ct.id}>
                            {ct.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-3">
                      <Input
                        placeholder="Description"
                        value={item.description}
                        onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                      />
                    </div>
                    <div className="col-span-1">
                      <Input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) => updateLineItem(item.id, 'quantity', parseFloat(e.target.value) || 1)}
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) => updateLineItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="col-span-1">
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        value={item.taxRate}
                        onChange={(e) => updateLineItem(item.id, 'taxRate', parseFloat(e.target.value) || 0)}
                        placeholder="%"
                      />
                    </div>
                    <div className="col-span-1">
                      {lineItems.length > 1 && (
                        <Button variant="ghost" size="sm" onClick={() => removeLineItem(item.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" size="sm" onClick={addLineItem}>
                <Plus className="mr-1 h-3 w-3" />
                Add Line Item
              </Button>
            </div>

            {/* Summary */}
            <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
              <span className="text-sm text-muted-foreground">
                Per-member subtotal: ฿{new Intl.NumberFormat('th-TH').format(subtotal)}
              </span>
              <span className="text-sm font-medium">
                Total: ฿{new Intl.NumberFormat('th-TH').format(subtotal * selectedMemberIds.length)}{' '}
                ({selectedMemberIds.length} members)
              </span>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="batch-notes">Notes (optional)</Label>
              <Input
                id="batch-notes"
                placeholder="Notes for all invoices..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || selectedMemberIds.length === 0 || lineItems.length === 0}
                className="bg-gradient-to-br from-amber-500 to-amber-600 text-white"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating {selectedMemberIds.length} invoices...
                  </>
                ) : (
                  <>Generate {selectedMemberIds.length} Invoices</>
                )}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
