'use client'

import { useMemo } from 'react'
import { cn } from '@clubvantage/ui'
import { Button } from '@clubvantage/ui'
import {
  CheckCircle,
  Clock,
  AlertCircle,
  Ban,
  Loader2,
  CreditCard,
} from 'lucide-react'
import type { ArrangementListItem } from '@/hooks/use-payment-arrangements'

type ArrangementStatus = 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'DEFAULTED'
type InstallmentStatus = 'PENDING' | 'PAID' | 'OVERDUE' | 'WAIVED'

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('th-TH', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function ArrangementStatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; bgClass: string; textClass: string }> = {
    DRAFT: { label: 'Draft', bgClass: 'bg-stone-100', textClass: 'text-stone-600' },
    ACTIVE: { label: 'Active', bgClass: 'bg-blue-100', textClass: 'text-blue-700' },
    COMPLETED: { label: 'Completed', bgClass: 'bg-emerald-100', textClass: 'text-emerald-700' },
    CANCELLED: { label: 'Cancelled', bgClass: 'bg-red-100', textClass: 'text-red-700' },
    DEFAULTED: { label: 'Defaulted', bgClass: 'bg-red-100', textClass: 'text-red-700' },
  }

  const entry = config[status] ?? config.DRAFT!
  const { label, bgClass, textClass } = entry!

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        bgClass,
        textClass
      )}
    >
      {label}
    </span>
  )
}

function InstallmentStatusIcon({ status }: { status: string }) {
  switch (status) {
    case 'PAID':
      return <CheckCircle className="h-4 w-4 text-emerald-500" />
    case 'OVERDUE':
      return <AlertCircle className="h-4 w-4 text-red-500" />
    case 'WAIVED':
      return <Ban className="h-4 w-4 text-stone-400" />
    default:
      return <Clock className="h-4 w-4 text-stone-400" />
  }
}

function InstallmentStatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; bgClass: string; textClass: string }> = {
    PENDING: { label: 'Pending', bgClass: 'bg-stone-100', textClass: 'text-stone-600' },
    PAID: { label: 'Paid', bgClass: 'bg-emerald-100', textClass: 'text-emerald-700' },
    OVERDUE: { label: 'Overdue', bgClass: 'bg-red-100', textClass: 'text-red-700' },
    WAIVED: { label: 'Waived', bgClass: 'bg-stone-100', textClass: 'text-stone-500' },
  }

  const entry = config[status] ?? config.PENDING!
  const { label, bgClass, textClass } = entry!

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
        bgClass,
        textClass
      )}
    >
      {label}
    </span>
  )
}

export interface ArrangementDetailProps {
  arrangement: ArrangementListItem
  onActivate?: (id: string) => void
  onCancel?: (id: string) => void
  onRecordPayment?: (installmentId: string) => void
  isActivating?: boolean
  isCancelling?: boolean
  isRecording?: boolean
  className?: string
}

export function ArrangementDetail({
  arrangement,
  onActivate,
  onCancel,
  onRecordPayment,
  isActivating = false,
  isCancelling = false,
  isRecording = false,
  className,
}: ArrangementDetailProps) {
  const progressPercentage = useMemo(() => {
    if (arrangement.totalAmount <= 0) return 0
    return Math.round((arrangement.paidAmount / arrangement.totalAmount) * 100)
  }, [arrangement.totalAmount, arrangement.paidAmount])

  const nextDueInstallment = useMemo(() => {
    return arrangement.installments.find(
      (inst) => inst.status === 'PENDING' || inst.status === 'OVERDUE'
    )
  }, [arrangement.installments])

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold">{arrangement.arrangementNumber}</h3>
            <ArrangementStatusBadge status={arrangement.status} />
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {arrangement.memberName}
          </p>
        </div>
        <div className="flex gap-2">
          {arrangement.status === 'DRAFT' && onActivate && (
            <Button
              size="sm"
              onClick={() => onActivate(arrangement.id)}
              disabled={isActivating}
              className="bg-gradient-to-br from-amber-500 to-amber-600 text-white"
            >
              {isActivating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Activate
            </Button>
          )}
          {(arrangement.status === 'DRAFT' || arrangement.status === 'ACTIVE') && onCancel && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onCancel(arrangement.id)}
              disabled={isCancelling}
              className="text-red-600 hover:text-red-700"
            >
              {isCancelling && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Cancel
            </Button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="rounded-lg border border-border bg-card p-3">
          <p className="text-xs text-muted-foreground">Total Amount</p>
          <p className="text-lg font-semibold">฿{formatCurrency(arrangement.totalAmount)}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-3">
          <p className="text-xs text-muted-foreground">Paid</p>
          <p className="text-lg font-semibold text-emerald-600">฿{formatCurrency(arrangement.paidAmount)}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-3">
          <p className="text-xs text-muted-foreground">Remaining</p>
          <p className="text-lg font-semibold text-amber-600">฿{formatCurrency(arrangement.remainingAmount)}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-3">
          <p className="text-xs text-muted-foreground">Frequency</p>
          <p className="text-lg font-semibold capitalize">{arrangement.frequency.toLowerCase()}</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Payment Progress</span>
          <span className="font-medium">{progressPercentage}%</span>
        </div>
        <div className="h-2 rounded-full bg-stone-100">
          <div
            className="h-2 rounded-full bg-gradient-to-r from-amber-500 to-emerald-500 transition-all"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{formatDate(arrangement.startDate)}</span>
          <span>{formatDate(arrangement.endDate)}</span>
        </div>
      </div>

      {/* Installment Schedule */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold">Installment Schedule</h4>
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 border-b border-border bg-muted/50 px-4 py-2.5 text-xs font-medium uppercase text-muted-foreground">
            <div className="col-span-1">#</div>
            <div className="col-span-2">Due Date</div>
            <div className="col-span-2 text-right">Amount</div>
            <div className="col-span-2 text-right">Paid</div>
            <div className="col-span-2 text-center">Status</div>
            <div className="col-span-3"></div>
          </div>

          {/* Installment Rows */}
          <div className="divide-y divide-border">
            {arrangement.installments.map((inst) => {
              const isPending = inst.status === 'PENDING' || inst.status === 'OVERDUE'
              const isNext = nextDueInstallment?.id === inst.id

              return (
                <div
                  key={inst.id}
                  className={cn(
                    'grid grid-cols-12 gap-4 items-center px-4 py-3 transition-colors',
                    isNext && 'bg-amber-50/50',
                    inst.status === 'PAID' && 'opacity-75'
                  )}
                >
                  <div className="col-span-1 flex items-center gap-2">
                    <InstallmentStatusIcon status={inst.status} />
                    <span className="text-sm font-medium">{inst.installmentNo}</span>
                  </div>
                  <div className="col-span-2 text-sm">
                    {formatDate(inst.dueDate)}
                  </div>
                  <div className="col-span-2 text-sm text-right font-medium">
                    ฿{formatCurrency(inst.amount)}
                  </div>
                  <div className="col-span-2 text-sm text-right">
                    {inst.paidAmount > 0 ? (
                      <span className="text-emerald-600">฿{formatCurrency(inst.paidAmount)}</span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </div>
                  <div className="col-span-2 text-center">
                    <InstallmentStatusBadge status={inst.status} />
                  </div>
                  <div className="col-span-3 flex justify-end">
                    {isPending && arrangement.status === 'ACTIVE' && onRecordPayment && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onRecordPayment(inst.id)}
                        disabled={isRecording}
                      >
                        {isRecording && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                        <CreditCard className="mr-1.5 h-3.5 w-3.5" />
                        Record Payment
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
