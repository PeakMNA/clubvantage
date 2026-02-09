'use client'

import { useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft,
  FileText,
  Download,
  Mail,
  Printer,
  Smartphone,
  Globe,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Loader2,
  X,
  User,
  Calendar,
  CreditCard,
  Receipt,
  Eye,
} from 'lucide-react'
import { Button, Card, CardContent, CardHeader, CardTitle } from '@clubvantage/ui'
import { cn } from '@clubvantage/ui'

import { RunStatusBadge } from '@/components/billing/run-status-badge'
import {
  useStatementRun,
  useStatementsByRun,
  type ARStatement,
  type DeliveryStatus,
  type ARStatementTransaction,
} from '@/hooks/use-ar-statements'

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 2,
  }).format(amount)
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date))
}

function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(date))
}

// Delivery status icon component
function DeliveryStatusIcon({ status, channel }: { status: DeliveryStatus; channel: string }) {
  const icons: Record<string, typeof Mail> = {
    email: Mail,
    print: Printer,
    sms: Smartphone,
    portal: Globe,
  }
  const Icon = icons[channel] || Mail

  const statusStyles: Record<DeliveryStatus, { color: string; StatusIcon: typeof CheckCircle }> = {
    PENDING: { color: 'text-stone-400', StatusIcon: Clock },
    SENT: { color: 'text-blue-500', StatusIcon: CheckCircle },
    DELIVERED: { color: 'text-emerald-500', StatusIcon: CheckCircle },
    FAILED: { color: 'text-red-500', StatusIcon: XCircle },
    NOT_APPLICABLE: { color: 'text-stone-300', StatusIcon: AlertCircle },
  }

  const { color, StatusIcon } = statusStyles[status] || statusStyles.PENDING

  return (
    <div className={cn('relative', color)} title={`${channel}: ${status}`}>
      <Icon className="h-4 w-4" />
      <StatusIcon className="h-2.5 w-2.5 absolute -bottom-0.5 -right-0.5 bg-white dark:bg-stone-900 rounded-full" />
    </div>
  )
}

// Extract member info from profile snapshot
function getMemberInfo(statement: ARStatement): {
  name: string
  accountNumber: string
  memberNumber?: string
  email?: string
  phone?: string
  profileType?: string
} {
  const snapshot = statement.profileSnapshot as any

  // Profile snapshot stores name directly on the object
  if (snapshot?.name) {
    return {
      name: snapshot.name,
      accountNumber: snapshot.accountNumber || '-',
      memberNumber: snapshot.memberNumber,
      email: snapshot.email,
      phone: snapshot.phone,
      profileType: snapshot.profileType,
    }
  }

  // Fallback for any other structure
  return {
    name: 'Unknown',
    accountNumber: snapshot?.accountNumber || '-',
  }
}

// Statement Detail Modal
function StatementDetailModal({
  statement,
  onClose,
}: {
  statement: ARStatement | null
  onClose: () => void
}) {
  if (!statement) return null

  const memberInfo = getMemberInfo(statement)
  const totalAging = statement.aging1to30 + statement.aging31to60 + statement.aging61to90 + statement.aging90Plus

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-stone-900 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 dark:border-stone-700 bg-gradient-to-r from-amber-50 to-amber-100/50 dark:from-amber-900/20 dark:to-amber-800/10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-amber-500 flex items-center justify-center text-white font-semibold">
              {memberInfo.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
                {memberInfo.name}
              </h2>
              <div className="text-sm text-stone-500 dark:text-stone-400 flex items-center gap-2">
                {memberInfo.memberNumber && <span>{memberInfo.memberNumber}</span>}
                <span className="text-stone-300">•</span>
                <span>{memberInfo.accountNumber}</span>
                {memberInfo.profileType && (
                  <>
                    <span className="text-stone-300">•</span>
                    <span className={cn(
                      'text-xs px-1.5 py-0.5 rounded',
                      memberInfo.profileType === 'MEMBER'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400'
                        : 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400'
                    )}>
                      {memberInfo.profileType}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-stone-200/50 dark:hover:bg-stone-700/50 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-stone-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {/* Period & Due Date */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 rounded-lg bg-stone-50 dark:bg-stone-800/50">
              <div className="flex items-center gap-2 text-stone-500 dark:text-stone-400 text-sm mb-1">
                <Calendar className="h-4 w-4" />
                Statement Period
              </div>
              <div className="font-medium text-stone-900 dark:text-stone-100">
                {formatDate(statement.periodStart)} - {formatDate(statement.periodEnd)}
              </div>
            </div>
            <div className="p-4 rounded-lg bg-stone-50 dark:bg-stone-800/50">
              <div className="flex items-center gap-2 text-stone-500 dark:text-stone-400 text-sm mb-1">
                <Clock className="h-4 w-4" />
                Payment Due
              </div>
              <div className="font-medium text-stone-900 dark:text-stone-100">
                {formatDate(statement.dueDate)}
              </div>
            </div>
          </div>

          {/* Balance Summary */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Balance Summary
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-lg border border-stone-200 dark:border-stone-700">
                <div className="text-sm text-stone-500 dark:text-stone-400">Opening Balance</div>
                <div className="text-xl font-semibold text-stone-900 dark:text-stone-100">
                  {formatCurrency(statement.openingBalance)}
                </div>
              </div>
              <div className="p-4 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/30">
                <div className="text-sm text-stone-500 dark:text-stone-400">Net Activity</div>
                <div className="text-xl font-semibold text-stone-900 dark:text-stone-100">
                  {formatCurrency(statement.closingBalance - statement.openingBalance)}
                </div>
              </div>
              <div className={cn(
                'p-4 rounded-lg border-2',
                statement.closingBalance > 0
                  ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20'
                  : 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
              )}>
                <div className="text-sm text-stone-500 dark:text-stone-400">Closing Balance</div>
                <div className={cn(
                  'text-xl font-bold',
                  statement.closingBalance > 0
                    ? 'text-amber-700 dark:text-amber-400'
                    : 'text-emerald-700 dark:text-emerald-400'
                )}>
                  {formatCurrency(statement.closingBalance)}
                </div>
              </div>
            </div>
          </div>

          {/* Aging Breakdown */}
          {totalAging > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Receipt className="h-4 w-4" />
                Aging Breakdown
              </h3>
              <div className="grid grid-cols-4 gap-3">
                <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                  <div className="text-xs text-emerald-600 dark:text-emerald-400">Current</div>
                  <div className="text-lg font-semibold text-emerald-700 dark:text-emerald-300">
                    {formatCurrency(statement.agingCurrent)}
                  </div>
                </div>
                <div className={cn(
                  'p-3 rounded-lg border',
                  statement.aging1to30 > 0
                    ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
                    : 'bg-stone-50 dark:bg-stone-800/50 border-stone-200 dark:border-stone-700'
                )}>
                  <div className={cn('text-xs', statement.aging1to30 > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-stone-500')}>
                    1-30 Days
                  </div>
                  <div className={cn('text-lg font-semibold', statement.aging1to30 > 0 ? 'text-amber-700 dark:text-amber-300' : 'text-stone-400')}>
                    {formatCurrency(statement.aging1to30)}
                  </div>
                </div>
                <div className={cn(
                  'p-3 rounded-lg border',
                  statement.aging31to60 > 0
                    ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
                    : 'bg-stone-50 dark:bg-stone-800/50 border-stone-200 dark:border-stone-700'
                )}>
                  <div className={cn('text-xs', statement.aging31to60 > 0 ? 'text-orange-600 dark:text-orange-400' : 'text-stone-500')}>
                    31-60 Days
                  </div>
                  <div className={cn('text-lg font-semibold', statement.aging31to60 > 0 ? 'text-orange-700 dark:text-orange-300' : 'text-stone-400')}>
                    {formatCurrency(statement.aging31to60)}
                  </div>
                </div>
                <div className={cn(
                  'p-3 rounded-lg border',
                  (statement.aging61to90 + statement.aging90Plus) > 0
                    ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                    : 'bg-stone-50 dark:bg-stone-800/50 border-stone-200 dark:border-stone-700'
                )}>
                  <div className={cn('text-xs', (statement.aging61to90 + statement.aging90Plus) > 0 ? 'text-red-600 dark:text-red-400' : 'text-stone-500')}>
                    60+ Days
                  </div>
                  <div className={cn('text-lg font-semibold', (statement.aging61to90 + statement.aging90Plus) > 0 ? 'text-red-700 dark:text-red-300' : 'text-stone-400')}>
                    {formatCurrency(statement.aging61to90 + statement.aging90Plus)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Transactions */}
          {statement.transactions && statement.transactions.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Receipt className="h-4 w-4" />
                Transactions ({statement.transactionCount})
              </h3>
              <div className="border border-stone-200 dark:border-stone-700 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-stone-50 dark:bg-stone-800/50 border-b border-stone-200 dark:border-stone-700">
                      <th className="py-2 px-3 text-left text-xs font-medium text-stone-500 uppercase">Date</th>
                      <th className="py-2 px-3 text-left text-xs font-medium text-stone-500 uppercase">Description</th>
                      <th className="py-2 px-3 text-right text-xs font-medium text-stone-500 uppercase">Amount</th>
                      <th className="py-2 px-3 text-right text-xs font-medium text-stone-500 uppercase">Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {statement.transactions.map((tx: ARStatementTransaction, idx: number) => (
                      <tr
                        key={tx.id || idx}
                        className="border-b border-stone-100 dark:border-stone-800 last:border-0"
                      >
                        <td className="py-2 px-3 text-stone-600 dark:text-stone-400">
                          {formatDate(new Date(tx.date))}
                        </td>
                        <td className="py-2 px-3">
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              'text-xs px-1.5 py-0.5 rounded font-medium',
                              tx.type === 'INVOICE'
                                ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'
                                : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'
                            )}>
                              {tx.type === 'INVOICE' ? 'INV' : 'PMT'}
                            </span>
                            <span className="text-stone-900 dark:text-stone-100">{tx.description}</span>
                          </div>
                          {tx.invoiceNumber && (
                            <div className="text-xs text-stone-400 mt-0.5">{tx.invoiceNumber}</div>
                          )}
                          {tx.referenceNumber && (
                            <div className="text-xs text-stone-400 mt-0.5">Ref: {tx.referenceNumber}</div>
                          )}
                        </td>
                        <td className={cn(
                          'py-2 px-3 text-right font-medium',
                          tx.type === 'INVOICE'
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-emerald-600 dark:text-emerald-400'
                        )}>
                          {tx.type === 'INVOICE' ? '+' : '-'}{formatCurrency(tx.amount)}
                        </td>
                        <td className="py-2 px-3 text-right text-stone-600 dark:text-stone-400">
                          {formatCurrency(tx.runningBalance)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* No Transactions Message */}
          {(!statement.transactions || statement.transactions.length === 0) && (
            <div className="mb-6 p-4 rounded-lg bg-stone-50 dark:bg-stone-800/50 text-center">
              <Receipt className="h-8 w-8 mx-auto text-stone-300 dark:text-stone-600 mb-2" />
              <p className="text-sm text-stone-500 dark:text-stone-400">
                No transactions in this period
              </p>
              <p className="text-xs text-stone-400 dark:text-stone-500 mt-1">
                Balance carried forward from previous period
              </p>
            </div>
          )}

          {/* Delivery Status */}
          <div>
            <h3 className="text-sm font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Delivery Status
            </h3>
            <div className="grid grid-cols-4 gap-3">
              <DeliveryStatusCard
                channel="Email"
                icon={Mail}
                status={statement.emailStatus}
                sentAt={statement.emailSentAt}
                deliveredAt={statement.emailDeliveredAt}
              />
              <DeliveryStatusCard
                channel="Print"
                icon={Printer}
                status={statement.printStatus}
                sentAt={statement.printedAt}
              />
              <DeliveryStatusCard
                channel="Portal"
                icon={Globe}
                status={statement.portalStatus}
                sentAt={statement.portalPublishedAt}
                deliveredAt={statement.portalViewedAt}
              />
              <DeliveryStatusCard
                channel="SMS"
                icon={Smartphone}
                status={statement.smsStatus}
                sentAt={statement.smsSentAt}
                deliveredAt={statement.smsDeliveredAt}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-stone-200 dark:border-stone-700 flex items-center justify-between bg-stone-50 dark:bg-stone-800/50">
          <div className="text-sm text-stone-500">
            Statement ID: <span className="font-mono text-xs">{statement.id.slice(0, 8)}</span>
          </div>
          <div className="flex items-center gap-2">
            {statement.pdfUrl && (
              <Button variant="outline" size="sm" asChild>
                <a href={statement.pdfUrl} target="_blank" rel="noopener noreferrer">
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </a>
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Delivery status card for modal
function DeliveryStatusCard({
  channel,
  icon: Icon,
  status,
  sentAt,
  deliveredAt,
}: {
  channel: string
  icon: typeof Mail
  status: DeliveryStatus
  sentAt?: Date | null
  deliveredAt?: Date | null
}) {
  const statusConfig: Record<DeliveryStatus, { bg: string; text: string; label: string }> = {
    PENDING: { bg: 'bg-stone-100 dark:bg-stone-800', text: 'text-stone-500', label: 'Pending' },
    SENT: { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-600 dark:text-blue-400', label: 'Sent' },
    DELIVERED: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-600 dark:text-emerald-400', label: 'Delivered' },
    FAILED: { bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-600 dark:text-red-400', label: 'Failed' },
    NOT_APPLICABLE: { bg: 'bg-stone-50 dark:bg-stone-800/50', text: 'text-stone-400', label: 'N/A' },
  }

  const config = statusConfig[status] || statusConfig.PENDING

  return (
    <div className={cn('p-3 rounded-lg', config.bg)}>
      <div className="flex items-center gap-2 mb-1">
        <Icon className={cn('h-4 w-4', config.text)} />
        <span className="text-xs font-medium text-stone-600 dark:text-stone-300">{channel}</span>
      </div>
      <div className={cn('text-sm font-medium', config.text)}>{config.label}</div>
      {sentAt && (
        <div className="text-xs text-stone-400 mt-1">
          {formatDateTime(sentAt)}
        </div>
      )}
    </div>
  )
}

// Statement row component
function StatementRow({ statement, onClick }: { statement: ARStatement; onClick: () => void }) {
  const { name, accountNumber, memberNumber } = getMemberInfo(statement)
  const hasAging = statement.aging1to30 > 0 || statement.aging31to60 > 0 ||
                   statement.aging61to90 > 0 || statement.aging90Plus > 0

  return (
    <tr
      className="border-b border-stone-100 dark:border-stone-800 hover:bg-amber-50 dark:hover:bg-amber-900/10 cursor-pointer transition-colors"
      onClick={onClick}
    >
      {/* Member Info */}
      <td className="py-3 px-4">
        <div className="flex items-center gap-2">
          <div className="font-medium text-stone-900 dark:text-stone-100">{name}</div>
          <Eye className="h-3.5 w-3.5 text-stone-400 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <div className="text-xs text-stone-500 dark:text-stone-400">
          {memberNumber && <span className="mr-2">{memberNumber}</span>}
          <span>{accountNumber}</span>
        </div>
      </td>

      {/* Statement Period */}
      <td className="py-3 px-4 text-sm text-stone-500 dark:text-stone-400 whitespace-nowrap">
        {formatDate(statement.periodStart)} — {formatDate(statement.periodEnd)}
      </td>

      {/* Balances */}
      <td className="py-3 px-4 text-right">
        <div className="text-sm text-stone-500 dark:text-stone-400">
          {formatCurrency(statement.openingBalance)}
        </div>
      </td>
      <td className="py-3 px-4 text-right">
        <div className={cn(
          'font-medium',
          statement.closingBalance > 0
            ? 'text-stone-900 dark:text-stone-100'
            : 'text-emerald-600 dark:text-emerald-400'
        )}>
          {formatCurrency(statement.closingBalance)}
        </div>
      </td>

      {/* Aging */}
      <td className="py-3 px-4">
        {hasAging ? (
          <div className="flex items-center gap-1 text-xs">
            {statement.aging1to30 > 0 && (
              <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400">
                30d: {formatCurrency(statement.aging1to30)}
              </span>
            )}
            {statement.aging31to60 > 0 && (
              <span className="px-1.5 py-0.5 rounded bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400">
                60d: {formatCurrency(statement.aging31to60)}
              </span>
            )}
            {(statement.aging61to90 > 0 || statement.aging90Plus > 0) && (
              <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400">
                90d+: {formatCurrency(statement.aging61to90 + statement.aging90Plus)}
              </span>
            )}
          </div>
        ) : (
          <span className="text-xs text-stone-400">Current</span>
        )}
      </td>

      {/* Due Date */}
      <td className="py-3 px-4 text-sm text-stone-600 dark:text-stone-400">
        {formatDate(statement.dueDate)}
      </td>

      {/* Delivery Status */}
      <td className="py-3 px-4">
        <div className="flex items-center gap-2">
          <DeliveryStatusIcon status={statement.emailStatus} channel="email" />
          <DeliveryStatusIcon status={statement.printStatus} channel="print" />
          <DeliveryStatusIcon status={statement.portalStatus} channel="portal" />
          <DeliveryStatusIcon status={statement.smsStatus} channel="sms" />
        </div>
      </td>

      {/* Actions */}
      <td className="py-3 px-4">
        {statement.pdfUrl ? (
          <Button variant="ghost" size="sm" asChild>
            <a href={statement.pdfUrl} target="_blank" rel="noopener noreferrer">
              <Download className="h-4 w-4" />
            </a>
          </Button>
        ) : (
          <span className="text-xs text-stone-400">No PDF</span>
        )}
      </td>
    </tr>
  )
}

export default function RunDetailPage() {
  const params = useParams()
  const router = useRouter()
  const runId = params.runId as string
  const [selectedStatement, setSelectedStatement] = useState<ARStatement | null>(null)

  const { run, isLoading: runLoading } = useStatementRun(runId)
  const { statements, isLoading: statementsLoading } = useStatementsByRun(runId)

  // Calculate totals
  const totals = useMemo(() => {
    if (!statements.length) return null
    return {
      totalStatements: statements.length,
      totalClosingBalance: statements.reduce((sum, s) => sum + s.closingBalance, 0),
      totalOverdue: statements.reduce((sum, s) =>
        sum + s.aging1to30 + s.aging31to60 + s.aging61to90 + s.aging90Plus, 0
      ),
    }
  }, [statements])

  const isLoading = runLoading || statementsLoading

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-stone-400" />
      </div>
    )
  }

  if (!run) {
    return (
      <div className="text-center py-12">
        <p className="text-stone-500">Run not found</p>
        <Button variant="outline" className="mt-4" onClick={() => router.back()}>
          Go Back
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <div>
            <h1 className="text-xl font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Run #{run.runNumber}
              <span className={cn(
                'text-xs px-2 py-0.5 rounded-full font-medium',
                run.runType === 'FINAL'
                  ? 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400'
                  : 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400'
              )}>
                {run.runType}
              </span>
              <RunStatusBadge status={run.status} />
            </h1>
            <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
              {run.startedAt && formatDateTime(run.startedAt)}
              {run.completedAt && run.startedAt &&
                ` • Completed in ${Math.round((new Date(run.completedAt).getTime() - new Date(run.startedAt).getTime()) / 1000)}s`
              }
            </p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-stone-900 dark:text-stone-100">
              {run.generatedCount}
            </div>
            <div className="text-sm text-stone-500 dark:text-stone-400">
              Statements Generated
            </div>
            {run.skippedCount > 0 && (
              <div className="text-xs text-amber-600 mt-1">
                {run.skippedCount} skipped
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-stone-900 dark:text-stone-100">
              {formatCurrency(run.totalClosingBalance)}
            </div>
            <div className="text-sm text-stone-500 dark:text-stone-400">
              Total Balance
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {formatCurrency(run.totalCredits)}
            </div>
            <div className="text-sm text-stone-500 dark:text-stone-400">
              Total Credits
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {formatCurrency(run.totalDebits)}
            </div>
            <div className="text-sm text-stone-500 dark:text-stone-400">
              Total Debits
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Statements Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Individual Statements
              <span className="text-sm font-normal text-stone-500">
                ({statements.length})
              </span>
            </CardTitle>
            <p className="text-xs text-stone-400">Click a row to view details</p>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {statements.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/50">
                    <th className="py-3 px-4 text-left text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                      Member / Account
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                      Statement Period
                    </th>
                    <th className="py-3 px-4 text-right text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                      Opening
                    </th>
                    <th className="py-3 px-4 text-right text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                      Closing
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                      Aging
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                      Due Date
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                      Delivery
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                      PDF
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {statements.map(statement => (
                    <StatementRow
                      key={statement.id}
                      statement={statement}
                      onClick={() => setSelectedStatement(statement)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-stone-500">
              <FileText className="h-12 w-12 mx-auto mb-4 text-stone-300" />
              <p>No statements in this run</p>
              <p className="text-sm mt-1">
                This could mean no AR profiles were eligible for statements.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statement Detail Modal */}
      <StatementDetailModal
        statement={selectedStatement}
        onClose={() => setSelectedStatement(null)}
      />
    </div>
  )
}
