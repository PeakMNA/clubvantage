'use client'

import { useState } from 'react'
import { Button } from '@clubvantage/ui'
import { Input } from '@clubvantage/ui'
import { Label } from '@clubvantage/ui'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@clubvantage/ui'
import { Loader2 } from 'lucide-react'

// Approve Credit Note Dialog
interface ApproveCreditNoteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  creditNoteNumber: string
  amount: number
  onConfirm: () => Promise<void>
  isSubmitting?: boolean
}

export function ApproveCreditNoteDialog({
  open,
  onOpenChange,
  creditNoteNumber,
  amount,
  onConfirm,
  isSubmitting = false,
}: ApproveCreditNoteDialogProps) {
  const handleConfirm = async () => {
    await onConfirm()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Approve Credit Note</DialogTitle>
          <DialogDescription>
            Approve credit note {creditNoteNumber} for ฿
            {new Intl.NumberFormat('th-TH').format(amount)}?
          </DialogDescription>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Once approved, this credit note can be applied to the member&apos;s balance or
          specific invoices.
        </p>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="bg-gradient-to-br from-amber-500 to-amber-600 text-white"
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Approve
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Void Credit Note Dialog
interface VoidCreditNoteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  creditNoteNumber: string
  onConfirm: (reason: string) => Promise<void>
  isSubmitting?: boolean
}

export function VoidCreditNoteDialog({
  open,
  onOpenChange,
  creditNoteNumber,
  onConfirm,
  isSubmitting = false,
}: VoidCreditNoteDialogProps) {
  const [reason, setReason] = useState('')

  const handleConfirm = async () => {
    if (!reason.trim()) return
    await onConfirm(reason)
    setReason('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Void Credit Note</DialogTitle>
          <DialogDescription>
            Void credit note {creditNoteNumber}? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="void-reason">Reason for voiding</Label>
          <Input
            id="void-reason"
            placeholder="Enter reason..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isSubmitting || !reason.trim()}
            variant="destructive"
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Void Credit Note
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Apply Credit Note to Invoice Dialog
interface ApplyCreditNoteToInvoiceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  creditNoteNumber: string
  availableAmount: number
  invoices: Array<{
    id: string
    invoiceNumber: string
    balance: number
  }>
  onConfirm: (invoiceId: string, amount: number) => Promise<void>
  isSubmitting?: boolean
}

export function ApplyCreditNoteToInvoiceDialog({
  open,
  onOpenChange,
  creditNoteNumber,
  availableAmount,
  invoices,
  onConfirm,
  isSubmitting = false,
}: ApplyCreditNoteToInvoiceDialogProps) {
  const [selectedInvoiceId, setSelectedInvoiceId] = useState('')
  const [amount, setAmount] = useState('')

  const selectedInvoice = invoices.find((inv) => inv.id === selectedInvoiceId)
  const maxAmount = selectedInvoice
    ? Math.min(availableAmount, selectedInvoice.balance)
    : availableAmount

  const handleConfirm = async () => {
    const parsedAmount = parseFloat(amount)
    if (!selectedInvoiceId || isNaN(parsedAmount) || parsedAmount <= 0) return
    await onConfirm(selectedInvoiceId, parsedAmount)
    setSelectedInvoiceId('')
    setAmount('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Apply Credit Note to Invoice</DialogTitle>
          <DialogDescription>
            Apply {creditNoteNumber} (available: ฿
            {new Intl.NumberFormat('th-TH').format(availableAmount)}) to an invoice.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="invoice-select">Select Invoice</Label>
            <select
              id="invoice-select"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              value={selectedInvoiceId}
              onChange={(e) => {
                setSelectedInvoiceId(e.target.value)
                const inv = invoices.find((i) => i.id === e.target.value)
                if (inv) {
                  setAmount(Math.min(availableAmount, inv.balance).toString())
                }
              }}
            >
              <option value="">Select an invoice...</option>
              {invoices.map((inv) => (
                <option key={inv.id} value={inv.id}>
                  {inv.invoiceNumber} — Balance: ฿
                  {new Intl.NumberFormat('th-TH').format(inv.balance)}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="apply-amount">Amount to Apply</Label>
            <Input
              id="apply-amount"
              type="number"
              min={0}
              max={maxAmount}
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
            />
            {selectedInvoice && (
              <p className="text-xs text-muted-foreground">
                Max: ฿{new Intl.NumberFormat('th-TH').format(maxAmount)}
              </p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={
              isSubmitting ||
              !selectedInvoiceId ||
              !amount ||
              parseFloat(amount) <= 0 ||
              parseFloat(amount) > maxAmount
            }
            className="bg-gradient-to-br from-amber-500 to-amber-600 text-white"
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Apply to Invoice
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
