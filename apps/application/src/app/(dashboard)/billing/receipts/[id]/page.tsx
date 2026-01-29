'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@clubvantage/ui'
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
  Award,
} from 'lucide-react'
// Direct imports to optimize bundle size (avoid barrel imports)
import { VoidReceiptDialog } from '@/components/billing/billing-dialogs'
import { WhtStatusBadge, type WhtStatus } from '@/components/billing/wht-status-badge'

// Mock receipt detail data
const getMockReceipt = (id: string) => ({
  id,
  receiptNumber: `RCP-2024-000${id}`,
  member: {
    id: 'M002',
    memberNumber: 'M002',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    phone: '+66 81 987 6543',
  },
  date: new Date('2024-01-18'),
  amount: 20000,
  method: 'transfer' as const,
  reference: 'TRF-20240118-001',
  outlet: 'Main Office',
  receivedBy: 'Admin User',
  wht: {
    amount: 600,
    rate: '3%',
    certificateNumber: 'WHT-2024-0001',
    status: 'pending' as WhtStatus,
  },
  allocations: [
    {
      invoiceId: '2',
      invoiceNumber: 'INV-2024-0002',
      invoiceDate: new Date('2024-01-10'),
      originalAmount: 32000,
      previousPaid: 0,
      allocatedAmount: 20000,
      remainingBalance: 12000,
    },
  ],
  notes: 'Bank transfer received - Ref: TRF-20240118-001',
  createdAt: new Date('2024-01-18T10:30:00'),
})

const methodLabels = {
  cash: 'Cash',
  transfer: 'Bank Transfer',
  'credit-card': 'Credit Card',
  cheque: 'Cheque',
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('th-TH', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function formatDateTime(date: Date): string {
  return date.toLocaleString('en-GB', {
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

  const receipt = getMockReceipt(params.id as string)

  const handleVoid = (_reason: string) => {
    setIsVoiding(true)
    // TODO: Replace with real API call
    setTimeout(() => {
      setIsVoiding(false)
      setShowVoidDialog(false)
      router.push('/billing')
    }, 1500)
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-stone-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-semibold text-stone-900">{receipt.receiptNumber}</h1>
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                  Completed
                </span>
              </div>
              <p className="mt-0.5 text-sm text-stone-500">
                Received {formatDate(receipt.date)} · {methodLabels[receipt.method]}
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
          <div className="rounded-xl border border-stone-200 bg-white shadow-sm">
            {/* Receipt Header */}
            <div className="border-b border-stone-200 p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-stone-900">Club Vantage</h2>
                  <p className="mt-1 text-sm text-stone-500">
                    123 Golf Course Road, Bangkok 10110
                    <br />
                    Tax ID: 0105556012345
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-2xl font-bold text-stone-900">{receipt.receiptNumber}</p>
                  <p className="mt-1 text-sm text-stone-500">Receipt Date: {formatDate(receipt.date)}</p>
                </div>
              </div>
            </div>

            {/* Receipt Details */}
            <div className="grid grid-cols-2 gap-6 border-b border-stone-200 p-6">
              {/* Received From */}
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wider text-stone-500">
                  Received From
                </p>
                <Link
                  href={`/members/${receipt.member.id}`}
                  className="text-lg font-medium text-stone-900 hover:text-amber-600 hover:underline"
                >
                  {receipt.member.name}
                </Link>
                <p className="text-sm text-stone-500">Member #{receipt.member.memberNumber}</p>
                <p className="text-sm text-stone-500">{receipt.member.email}</p>
              </div>

              {/* Payment Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-stone-400" />
                  <span className="text-stone-500">Date:</span>
                  <span className="font-medium text-stone-900">{formatDate(receipt.date)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CreditCard className="h-4 w-4 text-stone-400" />
                  <span className="text-stone-500">Method:</span>
                  <span className="font-medium text-stone-900">{methodLabels[receipt.method]}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Building className="h-4 w-4 text-stone-400" />
                  <span className="text-stone-500">Outlet:</span>
                  <span className="font-medium text-stone-900">{receipt.outlet}</span>
                </div>
                {receipt.reference && (
                  <div className="flex items-center gap-2 text-sm">
                    <FileText className="h-4 w-4 text-stone-400" />
                    <span className="text-stone-500">Reference:</span>
                    <span className="font-mono text-stone-900">{receipt.reference}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Amount Summary */}
            <div className="p-6">
              <div className="rounded-lg bg-stone-50 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-stone-500">Amount Received</p>
                    <p className="mt-1 text-3xl font-bold text-stone-900">
                      ฿{formatCurrency(receipt.amount)}
                    </p>
                  </div>
                  {receipt.wht && (
                    <div className="text-right">
                      <p className="text-sm text-stone-500">WHT Deducted ({receipt.wht.rate})</p>
                      <p className="mt-1 text-xl font-semibold text-amber-600">
                        ฿{formatCurrency(receipt.wht.amount)}
                      </p>
                    </div>
                  )}
                </div>
                {receipt.wht && (
                  <div className="mt-4 border-t border-stone-200 pt-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-stone-500">Cash Received</span>
                      <span className="font-medium text-stone-900">
                        ฿{formatCurrency(receipt.amount - receipt.wht.amount)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Allocations */}
            <div className="border-t border-stone-200 p-6">
              <h3 className="mb-4 text-sm font-medium text-stone-900">Invoice Allocations</h3>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-stone-200 text-left text-xs font-medium uppercase tracking-wider text-stone-500">
                    <th className="pb-3">Invoice</th>
                    <th className="pb-3 text-right">Original</th>
                    <th className="pb-3 text-right">Allocated</th>
                    <th className="pb-3 text-right">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {receipt.allocations.map((alloc) => (
                    <tr key={alloc.invoiceId} className="border-b border-stone-100 last:border-b-0">
                      <td className="py-3">
                        <Link
                          href={`/billing/invoices/${alloc.invoiceId}`}
                          className="font-mono text-sm text-stone-900 hover:text-amber-600 hover:underline"
                        >
                          {alloc.invoiceNumber}
                        </Link>
                        <p className="text-xs text-stone-500">{formatDate(alloc.invoiceDate)}</p>
                      </td>
                      <td className="py-3 text-right text-sm text-stone-600">
                        ฿{formatCurrency(alloc.originalAmount)}
                      </td>
                      <td className="py-3 text-right text-sm font-medium text-emerald-600">
                        ฿{formatCurrency(alloc.allocatedAmount)}
                      </td>
                      <td className="py-3 text-right text-sm text-stone-900">
                        {alloc.remainingBalance > 0 ? (
                          <span className="text-amber-600">฿{formatCurrency(alloc.remainingBalance)}</span>
                        ) : (
                          <span className="flex items-center justify-end gap-1 text-emerald-600">
                            <CheckCircle className="h-3.5 w-3.5" />
                            Paid
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Notes */}
            {receipt.notes && (
              <div className="border-t border-stone-200 p-6">
                <p className="text-xs font-medium uppercase tracking-wider text-stone-500">Notes</p>
                <p className="mt-2 text-sm text-stone-600">{receipt.notes}</p>
              </div>
            )}
          </div>

          {/* WHT Certificate */}
          {receipt.wht && (
            <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-amber-100 p-2">
                    <Award className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-stone-900">WHT Certificate</h3>
                    <p className="text-sm text-stone-500">{receipt.wht.certificateNumber}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <WhtStatusBadge status={receipt.wht.status} />
                  <Button variant="outline" size="sm">
                    View Certificate
                  </Button>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-4 rounded-lg bg-stone-50 p-4">
                <div>
                  <p className="text-xs text-stone-500">Amount</p>
                  <p className="mt-0.5 font-semibold text-stone-900">
                    ฿{formatCurrency(receipt.wht.amount)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-stone-500">Rate</p>
                  <p className="mt-0.5 font-semibold text-stone-900">{receipt.wht.rate}</p>
                </div>
                <div>
                  <p className="text-xs text-stone-500">Status</p>
                  <p className="mt-0.5 font-semibold text-amber-600">Pending Verification</p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-stone-900">Actions</h3>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" size="sm">
                <FileText className="mr-2 h-4 w-4" />
                Download PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-red-200 text-red-600 hover:bg-red-50"
                onClick={() => setShowVoidDialog(true)}
              >
                <XCircle className="mr-2 h-4 w-4" />
                Void Receipt
              </Button>
            </div>
          </div>

          {/* Audit Log */}
          <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-stone-900">Activity</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 rounded-full bg-emerald-100 p-1.5">
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-stone-900">Receipt created</p>
                  <p className="text-xs text-stone-500">
                    {formatDateTime(receipt.createdAt)} · {receipt.receivedBy}
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
        receiptNumber={receipt.receiptNumber}
        memberName={receipt.member.name}
        willSuspend={false}
        onClose={() => setShowVoidDialog(false)}
        onConfirm={handleVoid}
      />
    </div>
  )
}
