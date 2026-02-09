'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@clubvantage/ui'
import { Button } from '@clubvantage/ui'
import {
  ArrowLeft,
  Printer,
  Send,
  MoreHorizontal,
  FileText,
  Calendar,
  User,
  Building,
  CreditCard,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from 'lucide-react'
// Direct imports to optimize bundle size (avoid barrel imports)
import { InvoiceStatusBadge, type InvoiceStatus } from '@/components/billing/invoice-status-badge'
import { AgingBadge, type AgingStatus } from '@/components/billing/aging-badge'
import { VoidInvoiceDialog } from '@/components/billing/billing-dialogs'

// Mock invoice detail data
const getMockInvoice = (id: string) => ({
  id,
  invoiceNumber: `INV-2024-000${id}`,
  status: 'sent' as InvoiceStatus,
  agingStatus: 'CURRENT' as AgingStatus,
  member: {
    id: 'M001',
    memberNumber: 'M001',
    name: 'John Smith',
    email: 'john.smith@email.com',
    phone: '+66 81 234 5678',
  },
  issueDate: new Date('2024-01-15'),
  dueDate: new Date('2024-02-15'),
  periodStart: new Date('2024-01-01'),
  periodEnd: new Date('2024-01-31'),
  lineItems: [
    { id: '1', description: 'Monthly Membership Fee', quantity: 1, unitPrice: 35000, total: 35000 },
    { id: '2', description: 'F&B Minimum Spend', quantity: 1, unitPrice: 5000, total: 5000 },
    { id: '3', description: 'Locker Fee', quantity: 1, unitPrice: 2500, total: 2500 },
    { id: '4', description: 'Golf Cart Usage (5 rounds)', quantity: 5, unitPrice: 500, total: 2500 },
  ],
  subtotal: 45000,
  vat: 0,
  total: 45000,
  balance: 45000,
  payments: [],
  notes: 'Monthly charges for January 2024',
  createdAt: new Date('2024-01-10'),
  createdBy: 'System (Auto-generated)',
})

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

export default function InvoiceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [showVoidDialog, setShowVoidDialog] = useState(false)
  const [isVoiding, setIsVoiding] = useState(false)

  const invoice = getMockInvoice(params.id as string)

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
                <h1 className="text-xl font-semibold text-stone-900">{invoice.invoiceNumber}</h1>
                <InvoiceStatusBadge status={invoice.status} />
                <AgingBadge status={invoice.agingStatus} />
              </div>
              <p className="mt-0.5 text-sm text-stone-500">
                Issued {formatDate(invoice.issueDate)} · Due {formatDate(invoice.dueDate)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
            <Button variant="outline" size="sm">
              <Send className="mr-2 h-4 w-4" />
              Send
            </Button>
            {invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
              <Button
                size="sm"
                className="bg-gradient-to-br from-amber-500 to-amber-600 text-white"
                onClick={() => router.push('/billing/receipts/new?memberId=' + invoice.member.id)}
              >
                <CreditCard className="mr-2 h-4 w-4" />
                Record Payment
              </Button>
            )}
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-4xl space-y-6">
          {/* Invoice Card */}
          <div className="rounded-xl border border-stone-200 bg-white shadow-sm">
            {/* Invoice Header */}
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
                  <p className="font-mono text-2xl font-bold text-stone-900">{invoice.invoiceNumber}</p>
                  <p className="mt-1 text-sm text-stone-500">
                    Period: {formatDate(invoice.periodStart)} - {formatDate(invoice.periodEnd)}
                  </p>
                </div>
              </div>
            </div>

            {/* Bill To */}
            <div className="border-b border-stone-200 p-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wider text-stone-500">Bill To</p>
                  <Link
                    href={`/members/${invoice.member.id}`}
                    className="text-lg font-medium text-stone-900 hover:text-amber-600 hover:underline"
                  >
                    {invoice.member.name}
                  </Link>
                  <p className="text-sm text-stone-500">Member #{invoice.member.memberNumber}</p>
                  <p className="text-sm text-stone-500">{invoice.member.email}</p>
                  <p className="text-sm text-stone-500">{invoice.member.phone}</p>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-stone-400" />
                    <span className="text-stone-500">Issue Date:</span>
                    <span className="font-medium text-stone-900">{formatDate(invoice.issueDate)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-stone-400" />
                    <span className="text-stone-500">Due Date:</span>
                    <span className="font-medium text-stone-900">{formatDate(invoice.dueDate)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Line Items */}
            <div className="p-6">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-stone-200 text-left text-xs font-medium uppercase tracking-wider text-stone-500">
                    <th className="pb-3">Description</th>
                    <th className="pb-3 text-right">Qty</th>
                    <th className="pb-3 text-right">Unit Price</th>
                    <th className="pb-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.lineItems.map((item) => (
                    <tr key={item.id} className="border-b border-stone-100 last:border-b-0">
                      <td className="py-3 text-sm text-stone-900">{item.description}</td>
                      <td className="py-3 text-right text-sm text-stone-600">{item.quantity}</td>
                      <td className="py-3 text-right text-sm text-stone-600">
                        ฿{formatCurrency(item.unitPrice)}
                      </td>
                      <td className="py-3 text-right text-sm font-medium text-stone-900">
                        ฿{formatCurrency(item.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals */}
              <div className="mt-6 flex justify-end">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-stone-500">Subtotal</span>
                    <span className="text-stone-900">฿{formatCurrency(invoice.subtotal)}</span>
                  </div>
                  {invoice.vat > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-stone-500">VAT (7%)</span>
                      <span className="text-stone-900">฿{formatCurrency(invoice.vat)}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-stone-200 pt-2 text-base font-semibold">
                    <span className="text-stone-900">Total</span>
                    <span className="text-stone-900">฿{formatCurrency(invoice.total)}</span>
                  </div>
                  {invoice.balance !== invoice.total && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-stone-500">Paid</span>
                        <span className="text-emerald-600">
                          -฿{formatCurrency(invoice.total - invoice.balance)}
                        </span>
                      </div>
                      <div className="flex justify-between border-t border-stone-200 pt-2 text-lg font-bold">
                        <span className="text-stone-900">Balance Due</span>
                        <span className="text-amber-600">฿{formatCurrency(invoice.balance)}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Notes */}
            {invoice.notes && (
              <div className="border-t border-stone-200 p-6">
                <p className="text-xs font-medium uppercase tracking-wider text-stone-500">Notes</p>
                <p className="mt-2 text-sm text-stone-600">{invoice.notes}</p>
              </div>
            )}
          </div>

          {/* Payment History */}
          <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-stone-900">Payment History</h3>
            {invoice.payments.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-center">
                <FileText className="h-12 w-12 text-stone-300" />
                <p className="mt-3 text-sm text-stone-500">No payments recorded yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Payment rows would go here */}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-stone-900">Actions</h3>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" size="sm">
                <Send className="mr-2 h-4 w-4" />
                Send Reminder
              </Button>
              <Button variant="outline" size="sm">
                <FileText className="mr-2 h-4 w-4" />
                Download PDF
              </Button>
              {invoice.status !== 'cancelled' && invoice.status !== 'paid' && (
                <Button
                  variant="outline"
                  size="sm"
                  className="border-red-200 text-red-600 hover:bg-red-50"
                  onClick={() => setShowVoidDialog(true)}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Void Invoice
                </Button>
              )}
            </div>
          </div>

          {/* Audit Log */}
          <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-stone-900">Activity</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 rounded-full bg-stone-100 p-1.5">
                  <FileText className="h-3.5 w-3.5 text-stone-500" />
                </div>
                <div>
                  <p className="text-sm text-stone-900">Invoice created</p>
                  <p className="text-xs text-stone-500">
                    {formatDate(invoice.createdAt)} · {invoice.createdBy}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Void Dialog */}
      <VoidInvoiceDialog
        isOpen={showVoidDialog}
        isLoading={isVoiding}
        invoiceNumber={invoice.invoiceNumber}
        memberName={invoice.member.name}
        amount={invoice.balance}
        onClose={() => setShowVoidDialog(false)}
        onConfirm={handleVoid}
      />
    </div>
  )
}
