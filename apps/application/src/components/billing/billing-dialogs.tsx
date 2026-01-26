'use client'

import { useState, useEffect } from 'react'
import { cn } from '@clubvantage/ui'
import { Button } from '@clubvantage/ui'
import {
  AlertTriangle,
  Info,
  CheckCircle,
  Shield,
  Loader2,
  X,
} from 'lucide-react'

type DialogType = 'void-invoice' | 'void-receipt' | 'confirm-payment' | 'override-suspension'

interface DialogBaseProps {
  /** Whether dialog is open */
  isOpen: boolean
  /** Whether action is in progress */
  isLoading?: boolean
  /** Callback when dialog should close */
  onClose: () => void
  /** Additional class names */
  className?: string
}

interface DialogContentProps {
  icon: React.ReactNode
  iconBg: string
  title: string
  children: React.ReactNode
  cancelText?: string
  confirmText: string
  confirmVariant?: 'amber' | 'red' | 'emerald'
  isLoading?: boolean
  isDisabled?: boolean
  onCancel: () => void
  onConfirm: () => void
}

function DialogContent({
  icon,
  iconBg,
  title,
  children,
  cancelText = 'Cancel',
  confirmText,
  confirmVariant = 'amber',
  isLoading = false,
  isDisabled = false,
  onCancel,
  onConfirm,
}: DialogContentProps) {
  const confirmBtnClass = {
    amber: 'bg-gradient-to-br from-amber-500 to-amber-600 text-white',
    red: 'bg-red-500 text-white hover:bg-red-600',
    emerald: 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white',
  }[confirmVariant]

  return (
    <div className="w-full max-w-md rounded-xl bg-card p-6 shadow-xl">
      {/* Header */}
      <div className="mb-4 flex items-center gap-3">
        <div className={cn('rounded-full p-2', iconBg)}>
          {icon}
        </div>
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      </div>

      {/* Body */}
      <div className="mb-6">{children}</div>

      {/* Footer */}
      <div className="flex justify-end gap-3">
        <Button variant="ghost" onClick={onCancel} disabled={isLoading}>
          {cancelText}
        </Button>
        <Button
          onClick={onConfirm}
          disabled={isDisabled || isLoading}
          className={cn(confirmBtnClass, isLoading && 'opacity-75')}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            confirmText
          )}
        </Button>
      </div>
    </div>
  )
}

function DialogWrapper({
  isOpen,
  onClose,
  isLoading,
  children,
  className,
}: DialogBaseProps & { children: React.ReactNode }) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoading) {
        onClose()
      }
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, isLoading, onClose])

  if (!isOpen) return null

  return (
    <div className={cn('fixed inset-0 z-50 flex items-center justify-center', className)}>
      <div
        className="absolute inset-0 bg-black/50"
        onClick={() => !isLoading && onClose()}
      />
      <div className="relative z-10 mx-4">{children}</div>
    </div>
  )
}

// Void Invoice Dialog
interface VoidInvoiceDialogProps extends DialogBaseProps {
  invoiceNumber: string
  memberName: string
  amount: number
  onConfirm: (reason: string) => void
}

export function VoidInvoiceDialog({
  isOpen,
  isLoading = false,
  invoiceNumber,
  memberName,
  amount,
  onClose,
  onConfirm,
  className,
}: VoidInvoiceDialogProps) {
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')

  const handleConfirm = () => {
    if (!reason.trim()) {
      setError('Please provide a reason for voiding')
      return
    }
    setError('')
    onConfirm(reason)
  }

  const formatCurrency = (amt: number) =>
    new Intl.NumberFormat('th-TH').format(amt)

  return (
    <DialogWrapper isOpen={isOpen} onClose={onClose} isLoading={isLoading} className={className}>
      <DialogContent
        icon={<AlertTriangle className="h-5 w-5 text-amber-600" />}
        iconBg="bg-amber-100"
        title={`Void Invoice ${invoiceNumber}?`}
        confirmText="Void Invoice"
        confirmVariant="red"
        isLoading={isLoading}
        isDisabled={!reason.trim()}
        onCancel={onClose}
        onConfirm={handleConfirm}
      >
        <p className="mb-4 text-sm text-muted-foreground">
          This invoice will be cancelled. Member <span className="font-medium">{memberName}</span> will
          have their balance adjusted by <span className="font-medium">฿{formatCurrency(amount)}</span>.
          This action cannot be undone.
        </p>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            Reason for voiding <span className="text-red-500">*</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Enter reason..."
            rows={3}
            className={cn(
              'w-full rounded-lg border px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2',
              error
                ? 'border-red-500 focus:ring-red-500/30'
                : 'border-border focus:border-amber-500 focus:ring-amber-500/30'
            )}
          />
          {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
        </div>
      </DialogContent>
    </DialogWrapper>
  )
}

// Void Receipt Dialog
interface VoidReceiptDialogProps extends DialogBaseProps {
  receiptNumber: string
  memberName: string
  willSuspend?: boolean
  newAgingStatus?: string
  onConfirm: (reason: string) => void
}

export function VoidReceiptDialog({
  isOpen,
  isLoading = false,
  receiptNumber,
  memberName,
  willSuspend = false,
  newAgingStatus,
  onClose,
  onConfirm,
  className,
}: VoidReceiptDialogProps) {
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')

  const handleConfirm = () => {
    if (!reason.trim()) {
      setError('Please provide a reason for voiding')
      return
    }
    setError('')
    onConfirm(reason)
  }

  return (
    <DialogWrapper isOpen={isOpen} onClose={onClose} isLoading={isLoading} className={className}>
      <DialogContent
        icon={<AlertTriangle className="h-5 w-5 text-red-600" />}
        iconBg="bg-red-100"
        title={`Void Receipt ${receiptNumber}?`}
        confirmText="Void Receipt"
        confirmVariant="red"
        isLoading={isLoading}
        isDisabled={!reason.trim()}
        onCancel={onClose}
        onConfirm={handleConfirm}
      >
        <p className="mb-4 text-sm text-muted-foreground">
          This will reverse the payment and restore invoice balances.
        </p>

        {willSuspend && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3">
            <p className="text-sm font-medium text-red-800">
              ⚠️ Member {memberName} will be suspended again
            </p>
          </div>
        )}

        {!willSuspend && newAgingStatus && (
          <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3">
            <p className="text-sm text-amber-800">
              Member aging will change to <span className="font-medium">{newAgingStatus}</span>
            </p>
          </div>
        )}

        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            Reason for voiding <span className="text-red-500">*</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Enter reason..."
            rows={3}
            className={cn(
              'w-full rounded-lg border px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2',
              error
                ? 'border-red-500 focus:ring-red-500/30'
                : 'border-border focus:border-amber-500 focus:ring-amber-500/30'
            )}
          />
          {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
        </div>
      </DialogContent>
    </DialogWrapper>
  )
}

// Confirm Payment Dialog
interface ConfirmPaymentDialogProps extends DialogBaseProps {
  amount: number
  memberName: string
  invoiceCount: number
  willReinstate?: boolean
  remainsSuspended?: boolean
  outstandingAmount?: number
  onConfirm: () => void
}

export function ConfirmPaymentDialog({
  isOpen,
  isLoading = false,
  amount,
  memberName,
  invoiceCount,
  willReinstate = false,
  remainsSuspended = false,
  outstandingAmount,
  onClose,
  onConfirm,
  className,
}: ConfirmPaymentDialogProps) {
  const formatCurrency = (amt: number) =>
    new Intl.NumberFormat('th-TH').format(amt)

  return (
    <DialogWrapper isOpen={isOpen} onClose={onClose} isLoading={isLoading} className={className}>
      <DialogContent
        icon={
          willReinstate ? (
            <CheckCircle className="h-5 w-5 text-emerald-600" />
          ) : (
            <Info className="h-5 w-5 text-blue-600" />
          )
        }
        iconBg={willReinstate ? 'bg-emerald-100' : 'bg-blue-100'}
        title="Confirm Payment"
        confirmText="Save Receipt"
        confirmVariant="amber"
        isLoading={isLoading}
        onCancel={onClose}
        onConfirm={onConfirm}
      >
        <div className="mb-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Amount</span>
            <span className="font-semibold text-foreground">฿{formatCurrency(amount)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Member</span>
            <span className="font-medium text-foreground">{memberName}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Invoices</span>
            <span className="text-foreground">
              {invoiceCount} {invoiceCount === 1 ? 'invoice' : 'invoices'}
            </span>
          </div>
        </div>

        {willReinstate && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-600" />
              <span className="text-sm font-medium text-emerald-800">
                Member will be reinstated
              </span>
            </div>
          </div>
        )}

        {remainsSuspended && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <span className="text-sm text-amber-800">
                Member remains suspended.{' '}
                {outstandingAmount !== undefined && (
                  <span className="font-medium">
                    ฿{formatCurrency(outstandingAmount)} outstanding
                  </span>
                )}
              </span>
            </div>
          </div>
        )}
      </DialogContent>
    </DialogWrapper>
  )
}

// Override Suspension Dialog
type SuspensionDuration = 'until-payment' | '7-days' | '30-days' | 'custom'

interface OverrideSuspensionDialogProps extends DialogBaseProps {
  memberName: string
  outstandingAmount: number
  onConfirm: (duration: SuspensionDuration, customDate: string | null, notes: string) => void
}

export function OverrideSuspensionDialog({
  isOpen,
  isLoading = false,
  memberName,
  outstandingAmount,
  onClose,
  onConfirm,
  className,
}: OverrideSuspensionDialogProps) {
  const [duration, setDuration] = useState<SuspensionDuration>('until-payment')
  const [customDate, setCustomDate] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')

  const handleConfirm = () => {
    if (!notes.trim()) {
      setError('Please provide notes for this override')
      return
    }
    if (duration === 'custom' && !customDate) {
      setError('Please select a date')
      return
    }
    setError('')
    onConfirm(duration, duration === 'custom' ? customDate : null, notes)
  }

  const formatCurrency = (amt: number) =>
    new Intl.NumberFormat('th-TH').format(amt)

  const durationOptions: { id: SuspensionDuration; label: string }[] = [
    { id: 'until-payment', label: 'Until payment received' },
    { id: '7-days', label: 'For 7 days' },
    { id: '30-days', label: 'For 30 days' },
    { id: 'custom', label: 'Custom date' },
  ]

  return (
    <DialogWrapper isOpen={isOpen} onClose={onClose} isLoading={isLoading} className={className}>
      <DialogContent
        icon={<Shield className="h-5 w-5 text-amber-600" />}
        iconBg="bg-amber-100"
        title="Override Suspension"
        confirmText="Override"
        confirmVariant="amber"
        isLoading={isLoading}
        isDisabled={!notes.trim() || (duration === 'custom' && !customDate)}
        onCancel={onClose}
        onConfirm={handleConfirm}
      >
        <p className="mb-4 text-sm text-muted-foreground">
          Member <span className="font-medium">{memberName}</span> has{' '}
          <span className="font-medium">฿{formatCurrency(outstandingAmount)}</span> outstanding (91+
          days). Overriding will allow them to make bookings.
        </p>

        <div className="mb-4">
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            Override Duration
          </label>
          <div className="space-y-2">
            {durationOptions.map((option) => (
              <label
                key={option.id}
                className="flex cursor-pointer items-center gap-2"
              >
                <input
                  type="radio"
                  name="duration"
                  value={option.id}
                  checked={duration === option.id}
                  onChange={() => setDuration(option.id)}
                  className="h-4 w-4 border-border text-amber-500 focus:ring-amber-500/30"
                />
                <span className="text-sm text-foreground">{option.label}</span>
              </label>
            ))}
          </div>
          {duration === 'custom' && (
            <input
              type="date"
              value={customDate}
              onChange={(e) => setCustomDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="mt-2 w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
            />
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            Notes <span className="text-red-500">*</span>
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Reason for override..."
            rows={3}
            className={cn(
              'w-full rounded-lg border px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2',
              error
                ? 'border-red-500 focus:ring-red-500/30'
                : 'border-border focus:border-amber-500 focus:ring-amber-500/30'
            )}
          />
          {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
        </div>
      </DialogContent>
    </DialogWrapper>
  )
}
