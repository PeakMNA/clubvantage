'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Loader2, FileText, Receipt, Lock, AlertCircle } from 'lucide-react'

interface SharedEntity {
  entityType: 'INVOICE' | 'RECEIPT' | 'STATEMENT'
  entity: any
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function InvoiceView({ invoice }: { invoice: any }) {
  return (
    <div className="space-y-6">
      {/* Club Header */}
      {invoice.club && (
        <div className="text-center border-b pb-4">
          <h2 className="text-xl font-bold">{invoice.club.name}</h2>
          {invoice.club.address && (
            <p className="text-sm text-gray-500 mt-1">{invoice.club.address}</p>
          )}
        </div>
      )}

      {/* Invoice Info */}
      <div className="flex justify-between">
        <div>
          <p className="text-sm text-gray-500">Invoice Number</p>
          <p className="font-semibold">{invoice.invoiceNumber}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Date</p>
          <p className="font-semibold">{formatDate(invoice.invoiceDate ?? invoice.createdAt)}</p>
        </div>
      </div>

      <div className="flex justify-between">
        <div>
          <p className="text-sm text-gray-500">Bill To</p>
          <p className="font-semibold">
            {invoice.member?.firstName} {invoice.member?.lastName}
          </p>
          <p className="text-sm text-gray-500">ID: {invoice.member?.memberId}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Due Date</p>
          <p className="font-semibold">{formatDate(invoice.dueDate)}</p>
        </div>
      </div>

      {/* Line Items */}
      {invoice.lineItems && invoice.lineItems.length > 0 && (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-2">Description</th>
                <th className="text-right px-4 py-2">Qty</th>
                <th className="text-right px-4 py-2">Unit Price</th>
                <th className="text-right px-4 py-2">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {invoice.lineItems.map((item: any, i: number) => (
                <tr key={i}>
                  <td className="px-4 py-2">{item.description}</td>
                  <td className="px-4 py-2 text-right">{item.quantity}</td>
                  <td className="px-4 py-2 text-right">
                    ฿{formatCurrency(Number(item.unitPrice))}
                  </td>
                  <td className="px-4 py-2 text-right">
                    ฿{formatCurrency(Number(item.amount ?? item.unitPrice * item.quantity))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Totals */}
      <div className="flex justify-end">
        <div className="w-64 space-y-1">
          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span>฿{formatCurrency(Number(invoice.subtotalAmount ?? invoice.totalAmount))}</span>
          </div>
          {invoice.taxAmount > 0 && (
            <div className="flex justify-between text-sm">
              <span>Tax</span>
              <span>฿{formatCurrency(Number(invoice.taxAmount))}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-lg border-t pt-1">
            <span>Total</span>
            <span>฿{formatCurrency(Number(invoice.totalAmount))}</span>
          </div>
          {invoice.balanceDue !== undefined && invoice.balanceDue !== invoice.totalAmount && (
            <div className="flex justify-between text-amber-600 font-semibold">
              <span>Balance Due</span>
              <span>฿{formatCurrency(Number(invoice.balanceDue))}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ReceiptView({ receipt }: { receipt: any }) {
  return (
    <div className="space-y-6">
      {/* Club Header */}
      {receipt.club && (
        <div className="text-center border-b pb-4">
          <h2 className="text-xl font-bold">{receipt.club.name}</h2>
          {receipt.club.address && (
            <p className="text-sm text-gray-500 mt-1">{receipt.club.address}</p>
          )}
        </div>
      )}

      {/* Receipt Info */}
      <div className="flex justify-between">
        <div>
          <p className="text-sm text-gray-500">Receipt Number</p>
          <p className="font-semibold">{receipt.receiptNumber}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Date</p>
          <p className="font-semibold">{formatDate(receipt.paymentDate ?? receipt.createdAt)}</p>
        </div>
      </div>

      <div>
        <p className="text-sm text-gray-500">Received From</p>
        <p className="font-semibold">
          {receipt.member?.firstName} {receipt.member?.lastName}
        </p>
        <p className="text-sm text-gray-500">ID: {receipt.member?.memberId}</p>
      </div>

      {/* Payment Details */}
      <div className="border rounded-lg p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Payment Method</span>
          <span className="font-medium capitalize">{receipt.paymentMethod?.toLowerCase()}</span>
        </div>
        {receipt.referenceNumber && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Reference</span>
            <span className="font-medium">{receipt.referenceNumber}</span>
          </div>
        )}
      </div>

      {/* Allocated Invoices */}
      {receipt.allocations && receipt.allocations.length > 0 && (
        <div>
          <p className="text-sm font-medium mb-2">Applied to Invoices</p>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-2">Invoice</th>
                  <th className="text-right px-4 py-2">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {receipt.allocations.map((alloc: any, i: number) => (
                  <tr key={i}>
                    <td className="px-4 py-2">
                      {alloc.invoice?.invoiceNumber ?? alloc.invoiceId}
                    </td>
                    <td className="px-4 py-2 text-right">
                      ฿{formatCurrency(Number(alloc.amount))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Total */}
      <div className="flex justify-end">
        <div className="w-64">
          <div className="flex justify-between font-bold text-lg border-t pt-2">
            <span>Total Paid</span>
            <span>฿{formatCurrency(Number(receipt.amount))}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ShareViewerPage() {
  const { token } = useParams<{ token: string }>()
  const [data, setData] = useState<SharedEntity | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [needsPassword, setNeedsPassword] = useState(false)
  const [password, setPassword] = useState('')

  const fetchData = async (pwd?: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api'
      const params = pwd ? `?password=${encodeURIComponent(pwd)}` : ''
      const res = await fetch(`${apiUrl}/v1/share/${token}${params}`)

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        if (res.status === 400 && body.message?.includes('password')) {
          setNeedsPassword(true)
          return
        }
        throw new Error(body.message || 'Failed to load shared document')
      }

      const result = await res.json()
      setData(result)
      setNeedsPassword(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (token) {
      fetchData()
    }
  }, [token])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-amber-500 mx-auto" />
          <p className="mt-3 text-gray-500">Loading document...</p>
        </div>
      </div>
    )
  }

  if (needsPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-sm w-full mx-4 bg-white rounded-xl shadow-lg p-6 space-y-4">
          <div className="text-center">
            <Lock className="h-10 w-10 text-amber-500 mx-auto" />
            <h2 className="text-lg font-semibold mt-3">Password Protected</h2>
            <p className="text-sm text-gray-500 mt-1">
              This document requires a password to view.
            </p>
          </div>
          <div>
            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchData(password)}
              className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <button
            onClick={() => fetchData(password)}
            className="w-full rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 px-4 py-2 text-sm font-medium text-white"
          >
            View Document
          </button>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-sm w-full mx-4 bg-white rounded-xl shadow-lg p-6 text-center">
          <AlertCircle className="h-10 w-10 text-red-500 mx-auto" />
          <h2 className="text-lg font-semibold mt-3">Unable to Load</h2>
          <p className="text-sm text-gray-500 mt-1">{error}</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-sm w-full mx-4 bg-white rounded-xl shadow-lg p-6 text-center">
          <AlertCircle className="h-10 w-10 text-gray-400 mx-auto" />
          <h2 className="text-lg font-semibold mt-3">Not Found</h2>
          <p className="text-sm text-gray-500 mt-1">
            This link may have expired or been revoked.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Document Header */}
        <div className="flex items-center gap-2 mb-4 text-gray-500">
          {data.entityType === 'INVOICE' ? (
            <FileText className="h-5 w-5" />
          ) : (
            <Receipt className="h-5 w-5" />
          )}
          <span className="text-sm font-medium">
            Shared {data.entityType === 'INVOICE' ? 'Invoice' : 'Receipt'}
          </span>
        </div>

        {/* Document Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
          {data.entityType === 'INVOICE' && <InvoiceView invoice={data.entity} />}
          {data.entityType === 'RECEIPT' && <ReceiptView receipt={data.entity} />}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-6">
          Powered by ClubVantage
        </p>
      </div>
    </div>
  )
}
