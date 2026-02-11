'use client'

import { useState, useMemo } from 'react'
import { Loader2 } from 'lucide-react'
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

interface OutstandingInvoice {
  id: string
  invoiceNumber: string
  balance: number
  dueDate: Date
}

export interface PaymentArrangementFormData {
  memberId: string
  invoiceIds: string[]
  installmentCount: number
  frequency: string
  startDate: string
  notes?: string
}

interface PaymentArrangementModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  members: MemberOption[]
  isLoadingMembers?: boolean
  onMemberSearch?: (query: string) => void
  onMemberSelect?: (memberId: string) => Promise<OutstandingInvoice[]>
  onSubmit: (data: PaymentArrangementFormData) => Promise<void>
  isSubmitting?: boolean
}

function formatDateForInput(date: Date): string {
  return date.toISOString().split('T')[0] || ''
}

export function PaymentArrangementModal({
  open,
  onOpenChange,
  members,
  isLoadingMembers = false,
  onMemberSearch,
  onMemberSelect,
  onSubmit,
  isSubmitting = false,
}: PaymentArrangementModalProps) {
  const [memberId, setMemberId] = useState<string>()
  const [invoices, setInvoices] = useState<OutstandingInvoice[]>([])
  const [selectedInvoiceIds, setSelectedInvoiceIds] = useState<string[]>([])
  const [installmentCount, setInstallmentCount] = useState(4)
  const [frequency, setFrequency] = useState('MONTHLY')
  const [startDate, setStartDate] = useState(formatDateForInput(new Date()))
  const [notes, setNotes] = useState('')
  const [isLoadingInvoices, setIsLoadingInvoices] = useState(false)

  const handleMemberChange = async (id: string | undefined) => {
    if (!id) return
    setMemberId(id)
    setSelectedInvoiceIds([])
    if (onMemberSelect) {
      setIsLoadingInvoices(true)
      try {
        const memberInvoices = await onMemberSelect(id)
        setInvoices(memberInvoices)
        setSelectedInvoiceIds(memberInvoices.map((inv) => inv.id))
      } finally {
        setIsLoadingInvoices(false)
      }
    }
  }

  const toggleInvoice = (invoiceId: string) => {
    setSelectedInvoiceIds((prev) =>
      prev.includes(invoiceId)
        ? prev.filter((id) => id !== invoiceId)
        : [...prev, invoiceId]
    )
  }

  const totalAmount = useMemo(() => {
    return invoices
      .filter((inv) => selectedInvoiceIds.includes(inv.id))
      .reduce((sum, inv) => sum + inv.balance, 0)
  }, [invoices, selectedInvoiceIds])

  const installmentAmount = useMemo(() => {
    if (installmentCount <= 0) return 0
    return Math.floor((totalAmount / installmentCount) * 100) / 100
  }, [totalAmount, installmentCount])

  const handleSubmit = async () => {
    if (!memberId || selectedInvoiceIds.length === 0) return
    await onSubmit({
      memberId,
      invoiceIds: selectedInvoiceIds,
      installmentCount,
      frequency,
      startDate,
      notes: notes || undefined,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Payment Arrangement</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Member */}
          <div className="space-y-2">
            <Label>Member</Label>
            <MemberCombobox
              members={members}
              value={memberId}
              onValueChange={handleMemberChange}
              onSearch={onMemberSearch}
              isLoading={isLoadingMembers}
              placeholder="Select member..."
            />
          </div>

          {/* Outstanding Invoices */}
          {memberId && (
            <div className="space-y-2">
              <Label>Outstanding Invoices</Label>
              {isLoadingInvoices ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground p-3 border rounded-lg">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading invoices...
                </div>
              ) : invoices.length === 0 ? (
                <p className="text-sm text-muted-foreground p-3 border rounded-lg">
                  No outstanding invoices for this member.
                </p>
              ) : (
                <div className="space-y-1 max-h-40 overflow-y-auto border rounded-lg p-2">
                  {invoices.map((inv) => (
                    <label
                      key={inv.id}
                      className="flex items-center gap-3 p-2 rounded hover:bg-muted/50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedInvoiceIds.includes(inv.id)}
                        onChange={() => toggleInvoice(inv.id)}
                        className="rounded border-border"
                      />
                      <span className="flex-1 text-sm">{inv.invoiceNumber}</span>
                      <span className="text-sm font-medium">
                        ฿{new Intl.NumberFormat('th-TH').format(inv.balance)}
                      </span>
                    </label>
                  ))}
                </div>
              )}
              {selectedInvoiceIds.length > 0 && (
                <p className="text-sm font-medium text-right">
                  Total: ฿{new Intl.NumberFormat('th-TH').format(totalAmount)}
                </p>
              )}
            </div>
          )}

          {/* Schedule */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="installments">Installments</Label>
              <Input
                id="installments"
                type="number"
                min={2}
                max={24}
                value={installmentCount}
                onChange={(e) => setInstallmentCount(parseInt(e.target.value) || 2)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="frequency">Frequency</Label>
              <select
                id="frequency"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
              >
                <option value="WEEKLY">Weekly</option>
                <option value="BIWEEKLY">Bi-weekly</option>
                <option value="MONTHLY">Monthly</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="start-date">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
          </div>

          {/* Preview */}
          {totalAmount > 0 && installmentCount > 0 && (
            <div className="rounded-lg border border-border bg-muted/50 p-3 space-y-1">
              <p className="text-sm font-medium">Schedule Preview</p>
              <p className="text-sm text-muted-foreground">
                {installmentCount} {frequency.toLowerCase()} payments of ฿
                {new Intl.NumberFormat('th-TH').format(installmentAmount)} each
              </p>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="arrangement-notes">Notes (optional)</Label>
            <Input
              id="arrangement-notes"
              placeholder="Internal notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !memberId || selectedInvoiceIds.length === 0}
            className="bg-gradient-to-br from-amber-500 to-amber-600 text-white"
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Arrangement
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
