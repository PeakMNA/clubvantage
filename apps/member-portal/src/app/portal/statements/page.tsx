'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { cn } from '@clubvantage/ui'
import {
  ChevronRight,
  Download,
  FileText,
  Receipt,
  CreditCard,
  Flag,
  ChevronDown,
  Loader2,
} from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { BalanceCard } from '@/components/portal/balance-card'
import { StatusBadge } from '@/components/portal/status-badge'
import { useGetMyInvoicesQuery } from '@clubvantage/api-client'

type TabValue = 'transactions' | 'statements'

// Map invoice status to UI status
function mapInvoiceStatus(status: string): 'outstanding' | 'paid' | 'overdue' {
  switch (status) {
    case 'PAID':
      return 'paid'
    case 'OVERDUE':
      return 'overdue'
    default:
      return 'outstanding'
  }
}

// Transform invoice line items into transactions
interface Transaction {
  id: string
  date: string
  description: string
  amount: number
  type: 'payment' | 'charge'
  category: string
}

// Transform invoice to statement format
interface Statement {
  id: string
  month: string
  date: string
  amount: number
  status: 'outstanding' | 'paid' | 'overdue'
  pdfUrl?: string
}

const transactionIcons: Record<string, typeof Receipt> = {
  Payment: CreditCard,
  Golf: Flag,
  'F&B': Receipt,
  Dues: FileText,
  Balance: FileText,
}

export default function StatementsPage() {
  const [activeTab, setActiveTab] = useState<TabValue>('statements')
  const [expandedStatement, setExpandedStatement] = useState<string | null>(null)

  const { data, isLoading } = useGetMyInvoicesQuery({
    first: 12,
  })

  // Transform invoices to statements
  const statements: Statement[] = useMemo(() => {
    if (!data?.myInvoices?.edges) return []

    return data.myInvoices.edges.map((edge) => {
      const invoice = edge.node
      const invoiceDate = parseISO(invoice.invoiceDate)

      return {
        id: invoice.id,
        month: format(invoiceDate, 'MMMM yyyy'),
        date: invoice.invoiceDate,
        amount: parseFloat(invoice.totalAmount),
        status: mapInvoiceStatus(invoice.status),
        pdfUrl: undefined, // PDF generation would need a separate endpoint
      }
    })
  }, [data])

  // Build transactions from invoice line items
  const transactions: Transaction[] = useMemo(() => {
    if (!data?.myInvoices?.edges) return []

    const txList: Transaction[] = []

    data.myInvoices.edges.forEach((edge) => {
      const invoice = edge.node

      // Add line items as charges
      invoice.lineItems?.forEach((item) => {
        if (item) {
          txList.push({
            id: item.id,
            date: invoice.invoiceDate,
            description: item.description || item.chargeType?.name || 'Charge',
            amount: parseFloat(item.lineTotal),
            type: 'charge',
            category: item.chargeType?.code || 'Dues',
          })
        }
      })

      // Add payment if invoice is paid
      if (invoice.paidDate && parseFloat(invoice.paidAmount) > 0) {
        txList.push({
          id: `payment-${invoice.id}`,
          date: invoice.paidDate,
          description: `Payment - ${invoice.invoiceNumber}`,
          amount: -parseFloat(invoice.paidAmount),
          type: 'payment',
          category: 'Payment',
        })
      }
    })

    // Sort by date descending
    return txList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [data])

  // Calculate total balance from outstanding invoices
  const totalBalance = useMemo(() => {
    return statements
      .filter((s) => s.status !== 'paid')
      .reduce((sum, s) => sum + s.amount, 0)
  }, [statements])

  // Find the next due date
  const nextDueDate = useMemo(() => {
    if (!data?.myInvoices?.edges) return undefined

    const unpaidInvoice = data.myInvoices.edges.find(
      (edge) => edge.node.status !== 'PAID'
    )

    if (unpaidInvoice) {
      return format(parseISO(unpaidInvoice.node.dueDate), 'MMMM d, yyyy')
    }

    return undefined
  }, [data])

  const hasOverdue = statements.some((s) => s.status === 'overdue')

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    )
  }

  return (
    <div className="px-4 py-6">
      {/* Header */}
      <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100 mb-6">
        Statements
      </h1>

      {/* Balance Card */}
      <div className="mb-6">
        <BalanceCard
          balance={totalBalance}
          dueDate={nextDueDate}
          isOverdue={hasOverdue}
          variant="compact"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('transactions')}
          className={cn(
            'flex-1 py-3 px-4 rounded-xl font-medium text-sm transition-all',
            activeTab === 'transactions'
              ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900'
              : 'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400'
          )}
        >
          Transactions
        </button>
        <button
          onClick={() => setActiveTab('statements')}
          className={cn(
            'flex-1 py-3 px-4 rounded-xl font-medium text-sm transition-all',
            activeTab === 'statements'
              ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900'
              : 'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400'
          )}
        >
          Monthly Statements
        </button>
      </div>

      {/* Transactions Tab */}
      {activeTab === 'transactions' && (
        <div className="rounded-2xl bg-card border border-border/60 overflow-hidden">
          {transactions.length === 0 ? (
            <div className="p-8 text-center text-stone-500">
              No transactions found
            </div>
          ) : (
            transactions.map((tx, idx) => {
              const Icon = transactionIcons[tx.category] || Receipt
              const isPayment = tx.type === 'payment'

              return (
                <div
                  key={tx.id}
                  className={cn(
                    'flex items-center gap-3 p-4',
                    idx !== transactions.length - 1 &&
                      'border-b border-border/60'
                  )}
                >
                  <div
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-xl',
                      isPayment
                        ? 'bg-emerald-50 text-emerald-500 dark:bg-emerald-950/30'
                        : 'bg-stone-100 text-stone-500 dark:bg-stone-800'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-stone-900 dark:text-stone-100 truncate">
                      {tx.description}
                    </p>
                    <p className="text-xs text-stone-500">
                      {format(parseISO(tx.date), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <p
                    className={cn(
                      'text-sm font-semibold font-mono',
                      isPayment
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-stone-900 dark:text-stone-100'
                    )}
                  >
                    {isPayment ? '-' : '+'}฿{Math.abs(tx.amount).toLocaleString()}
                  </p>
                </div>
              )
            })
          )}
        </div>
      )}

      {/* Statements Tab */}
      {activeTab === 'statements' && (
        <div className="space-y-3">
          {statements.length === 0 ? (
            <div className="rounded-2xl bg-card border border-border/60 p-8 text-center text-stone-500">
              No statements found
            </div>
          ) : (
            statements.map((statement) => (
              <div
                key={statement.id}
                className="rounded-2xl bg-card border border-border/60 overflow-hidden"
              >
                <button
                  onClick={() =>
                    setExpandedStatement(
                      expandedStatement === statement.id ? null : statement.id
                    )
                  }
                  className="flex items-center justify-between w-full p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-stone-100 dark:bg-stone-800">
                      <FileText className="h-5 w-5 text-stone-500" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-stone-900 dark:text-stone-100">
                        {statement.month}
                      </p>
                      <p className="text-sm text-stone-500 font-mono">
                        ฿{statement.amount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={statement.status} size="sm" />
                    <ChevronDown
                      className={cn(
                        'h-5 w-5 text-stone-400 transition-transform',
                        expandedStatement === statement.id && 'rotate-180'
                      )}
                    />
                  </div>
                </button>

                {expandedStatement === statement.id && (
                  <div className="px-4 pb-4 pt-0 border-t border-border/60">
                    <div className="flex gap-2 mt-4">
                      {statement.pdfUrl && (
                        <a
                          href={statement.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={cn(
                            'flex-1 flex items-center justify-center gap-2 py-3 rounded-xl',
                            'bg-stone-100 text-stone-700 hover:bg-stone-200',
                            'dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700',
                            'font-medium text-sm transition-colors'
                          )}
                        >
                          <Download className="h-4 w-4" />
                          Download PDF
                        </a>
                      )}
                      {statement.status !== 'paid' && (
                        <button
                          className={cn(
                            'flex-1 flex items-center justify-center gap-2 py-3 rounded-xl',
                            'bg-amber-500 text-white hover:bg-amber-600',
                            'font-medium text-sm transition-colors'
                          )}
                        >
                          Pay Now
                        </button>
                      )}
                      {statement.status === 'paid' && !statement.pdfUrl && (
                        <div className="flex-1 flex items-center justify-center py-3 text-sm text-stone-500">
                          Fully paid
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
