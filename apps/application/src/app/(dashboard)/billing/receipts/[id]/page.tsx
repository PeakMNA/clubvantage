'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@clubvantage/ui'
import {
  ArrowLeft,
  Printer,
  FileText,
  Calendar,
  CreditCard,
  Building,
  MoreHorizontal,
  XCircle,
  CheckCircle,
  Loader2,
} from 'lucide-react'
import { VoidReceiptDialog } from '@/components/billing/billing-dialogs'
import { useGetPaymentQuery } from '@clubvantage/api-client/hooks'

const methodLabels: Record<string, string> = {
  CASH: 'Cash',
  CREDIT_CARD: 'Credit Card',
  BANK_TRANSFER: 'Bank Transfer',
  CHECK: 'Cheque',
  QR_PROMPTPAY: 'QR PromptPay',
  DIRECT_DEBIT: 'Direct Debit',
}

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

function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function ReceiptDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [showVoidDialog, setShowVoidDialog] = useState(false)
  const [isVoiding, setIsVoiding] = useState(false)

  const id = params.id as string
  const { data, isLoading, error } = useGetPaymentQuery(
    { id },
    { enabled: !!id }
  )

  const payment = data?.payment

  const handleVoid = (_reason: string) => {
    setIsVoiding(true)
    // TODO: Replace with real API call
    setTimeout(() => {
      setIsVoiding(false)
      setShowVoidDialog(false)
      router.push('/billing')
    }, 1500)
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !payment) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Receipt not found</p>
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>
      </div>
    )
  }

  const amount = parseFloat(payment.amount || '0')
  const methodLabel = methodLabels[payment.method] || payment.method
  const memberName = payment.member
    ? `${payment.member.firstName} ${payment.member.lastName}`
    : 'Unknown'

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-border bg-card px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-semibold text-foreground">{payment.receiptNumber}</h1>
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">
                  {payment.status === 'void' ? 'Voided' : 'Completed'}
                </span>
              </div>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Received {formatDate(payment.paymentDate)} · {methodLabel}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
            <Button variant="outline" size="sm">
              <FileText className="mr-2 h-4 w-4" />
              Download
            </Button>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-4xl space-y-6">
          {/* Receipt Card */}
          <div className="rounded-xl border border-border bg-card shadow-sm">
            {/* Receipt Header */}
            <div className="border-b border-border p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Club Vantage</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    123 Golf Course Road, Bangkok 10110
                    <br />
                    Tax ID: 0105556012345
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-2xl font-bold text-foreground">{payment.receiptNumber}</p>
                  <p className="mt-1 text-sm text-muted-foreground">Receipt Date: {formatDate(payment.paymentDate)}</p>
                </div>
              </div>
            </div>

            {/* Receipt Details */}
            <div className="grid grid-cols-2 gap-6 border-b border-border p-6">
              {/* Received From */}
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Received From
                </p>
                {payment.member ? (
                  <>
                    <Link
                      href={`/members/${payment.member.id}`}
                      className="text-lg font-medium text-foreground hover:text-amber-600 hover:underline dark:hover:text-amber-400"
                    >
                      {memberName}
                    </Link>
                    <p className="text-sm text-muted-foreground">Member #{payment.member.memberId}</p>
                  </>
                ) : (
                  <p className="text-lg font-medium text-foreground">Unknown</p>
                )}
              </div>

              {/* Payment Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground/60" />
                  <span className="text-muted-foreground">Date:</span>
                  <span className="font-medium text-foreground">{formatDate(payment.paymentDate)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CreditCard className="h-4 w-4 text-muted-foreground/60" />
                  <span className="text-muted-foreground">Method:</span>
                  <span className="font-medium text-foreground">{methodLabel}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Building className="h-4 w-4 text-muted-foreground/60" />
                  <span className="text-muted-foreground">Outlet:</span>
                  <span className="font-medium text-foreground">Main Office</span>
                </div>
                {payment.referenceNumber && (
                  <div className="flex items-center gap-2 text-sm">
                    <FileText className="h-4 w-4 text-muted-foreground/60" />
                    <span className="text-muted-foreground">Reference:</span>
                    <span className="font-mono text-foreground">{payment.referenceNumber}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Amount Summary */}
            <div className="p-6">
              <div className="rounded-lg bg-muted p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Amount Received</p>
                    <p className="mt-1 text-3xl font-bold text-foreground">
                      ฿{formatCurrency(amount)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Allocations */}
            {payment.allocations && payment.allocations.length > 0 && (
              <div className="border-t border-border p-6">
                <h3 className="mb-4 text-sm font-medium text-foreground">Invoice Allocations</h3>
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      <th className="pb-3">Invoice</th>
                      <th className="pb-3 text-right">Allocated</th>
                      <th className="pb-3 text-right">Balance After</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payment.allocations.map((alloc) => {
                      const allocAmount = parseFloat(alloc.amount || '0')
                      const balanceAfter = parseFloat(alloc.balanceAfter || '0')
                      return (
                        <tr key={alloc.id} className="border-b border-border/50 last:border-b-0">
                          <td className="py-3">
                            <Link
                              href={`/billing/invoices/${alloc.invoiceId}`}
                              className="font-mono text-sm text-foreground hover:text-amber-600 hover:underline dark:hover:text-amber-400"
                            >
                              {alloc.invoiceNumber}
                            </Link>
                          </td>
                          <td className="py-3 text-right text-sm font-medium text-emerald-600 dark:text-emerald-400">
                            ฿{formatCurrency(allocAmount)}
                          </td>
                          <td className="py-3 text-right text-sm">
                            {balanceAfter > 0 ? (
                              <span className="text-amber-600 dark:text-amber-400">฿{formatCurrency(balanceAfter)}</span>
                            ) : (
                              <span className="flex items-center justify-end gap-1 text-emerald-600 dark:text-emerald-400">
                                <CheckCircle className="h-3.5 w-3.5" />
                                Paid
                              </span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Notes */}
            {payment.notes && (
              <div className="border-t border-border p-6">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Notes</p>
                <p className="mt-2 text-sm text-muted-foreground">{payment.notes}</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-foreground">Actions</h3>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" size="sm">
                <FileText className="mr-2 h-4 w-4" />
                Download PDF
              </Button>
              {payment.status !== 'void' && (
                <Button
                  variant="outline"
                  size="sm"
                  className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-500/10"
                  onClick={() => setShowVoidDialog(true)}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Void Receipt
                </Button>
              )}
            </div>
          </div>

          {/* Audit Log */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-foreground">Activity</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 rounded-full bg-emerald-100 p-1.5 dark:bg-emerald-500/20">
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm text-foreground">Receipt created</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDateTime(payment.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Void Dialog */}
      <VoidReceiptDialog
        isOpen={showVoidDialog}
        isLoading={isVoiding}
        receiptNumber={payment.receiptNumber}
        memberName={memberName}
        willSuspend={false}
        onClose={() => setShowVoidDialog(false)}
        onConfirm={handleVoid}
      />
    </div>
  )
}
