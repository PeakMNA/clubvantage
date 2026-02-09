'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@clubvantage/ui'
import { Button } from '@clubvantage/ui'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@clubvantage/ui'
import {
  ChevronDown,
  FileText,
  Mail,
  Printer,
  Smartphone,
  Globe,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  MoreVertical,
  Download,
  Send,
  RefreshCw,
  ExternalLink,
  Loader2,
} from 'lucide-react'

import {
  useStatementPeriods,
  useStatementRunsByPeriod,
  useStatementsByRun,
  type ARStatement,
  type DeliveryStatus,
  type StatementPeriod,
} from '@/hooks/use-ar-statements'
import { useClubBillingSettings } from '@/hooks/use-billing-settings'

export interface StatementRegisterProps {
  className?: string
  onGenerateStatement?: () => void
}

// ==================== Helpers ====================

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('th-TH', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date))
}

function getMemberInfo(statement: ARStatement): {
  name: string
  accountNumber: string
  memberNumber?: string
  email?: string
  profileType?: string
} {
  const snapshot = statement.profileSnapshot as any

  if (snapshot?.name) {
    return {
      name: snapshot.name,
      accountNumber: snapshot.accountNumber || '-',
      memberNumber: snapshot.memberNumber,
      email: snapshot.email,
      profileType: snapshot.profileType,
    }
  }

  return {
    name: 'Unknown',
    accountNumber: snapshot?.accountNumber || '-',
  }
}

// ==================== Sub-components ====================

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

function SummaryMetric({
  label,
  value,
  colorClass,
  isCount,
}: {
  label: string
  value: number
  colorClass?: string
  isCount?: boolean
}) {
  return (
    <div className="flex flex-1 flex-col items-center border-r border-border px-4 py-2 last:border-r-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={cn('text-2xl font-semibold', colorClass || 'text-foreground')}>
        {isCount ? value : `฿${formatCurrency(value)}`}
      </span>
    </div>
  )
}

function TableSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 rounded-lg bg-card p-4"
        >
          <div className="h-4 w-32 animate-pulse rounded bg-muted" />
          <div className="h-4 w-20 animate-pulse rounded bg-muted" />
          <div className="h-4 w-20 animate-pulse rounded bg-muted" />
          <div className="h-4 w-20 animate-pulse rounded bg-muted" />
          <div className="h-4 w-16 animate-pulse rounded bg-muted" />
          <div className="ml-auto h-4 w-20 animate-pulse rounded bg-muted" />
          <div className="h-4 w-16 animate-pulse rounded bg-muted" />
          <div className="h-4 w-8 animate-pulse rounded bg-muted" />
        </div>
      ))}
    </div>
  )
}

function EmptyState({ onGenerateStatement }: { onGenerateStatement?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="mb-4 rounded-full bg-muted p-4">
        <FileText className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="mb-2 text-lg font-medium text-foreground">No statements found</h3>
      <p className="mb-4 max-w-md text-center text-sm text-muted-foreground">
        No statements have been generated for this period yet. Go to AR Statements to generate statements.
      </p>
      <div className="flex gap-2">
        {onGenerateStatement && (
          <Button onClick={onGenerateStatement} className="bg-gradient-to-br from-amber-500 to-amber-600 text-white">
            <FileText className="mr-2 h-4 w-4" />
            Generate Statement
          </Button>
        )}
        <Button variant="outline" asChild>
          <a href="/billing/statements">
            <ExternalLink className="mr-2 h-4 w-4" />
            AR Statements
          </a>
        </Button>
      </div>
    </div>
  )
}

function ErrorState({ error, onRetry }: { error: string; onRetry?: () => void }) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4">
      <div className="flex items-center gap-3">
        <XCircle className="h-5 w-5 text-red-500" />
        <span className="text-sm text-red-800">{error}</span>
        {onRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="ml-auto border-red-300 text-red-700 hover:bg-red-100"
          >
            <RefreshCw className="mr-1.5 h-4 w-4" />
            Retry
          </Button>
        )}
      </div>
    </div>
  )
}

// ==================== Main Component ====================

export function StatementRegister({ className, onGenerateStatement }: StatementRegisterProps) {
  const router = useRouter()
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>('')

  // Fetch billing cycle mode
  const { settings: billingSettings } = useClubBillingSettings()
  const isMemberCycle = billingSettings?.billingCycleMode === 'MEMBER_CYCLE'

  // Step 1: Fetch all periods
  const {
    periods,
    isLoading: periodsLoading,
    error: periodsError,
    refetch: refetchPeriods,
  } = useStatementPeriods()

  // Sort periods by periodStart descending to find most recent
  const sortedPeriods = useMemo(() => {
    return [...periods].sort(
      (a, b) => new Date(b.periodStart).getTime() - new Date(a.periodStart).getTime()
    )
  }, [periods])

  // Auto-select the most recent CLOSED period (or first period if none closed)
  const effectivePeriodId = useMemo(() => {
    if (selectedPeriodId) return selectedPeriodId
    const closedPeriod = sortedPeriods.find((p) => p.status === 'CLOSED')
    return closedPeriod?.id || sortedPeriods[0]?.id || ''
  }, [selectedPeriodId, sortedPeriods])

  const selectedPeriod = useMemo(() => {
    return periods.find((p) => p.id === effectivePeriodId) || null
  }, [periods, effectivePeriodId])

  // Step 2: Fetch runs for selected period
  const {
    runs,
    isLoading: runsLoading,
    error: runsError,
  } = useStatementRunsByPeriod(effectivePeriodId, !!effectivePeriodId)

  // Filter to completed FINAL runs, take the latest one
  const latestFinalRun = useMemo(() => {
    const finalRuns = runs
      .filter((r) => r.runType === 'FINAL' && r.status === 'COMPLETED')
      .sort((a, b) => new Date(b.completedAt || b.createdAt).getTime() - new Date(a.completedAt || a.createdAt).getTime())
    return finalRuns[0] || null
  }, [runs])

  // Step 3: Fetch statements for the latest final run
  const {
    statements: rawStatements,
    isLoading: statementsLoading,
    error: statementsError,
    refetch: refetchStatements,
  } = useStatementsByRun(latestFinalRun?.id || '', !!latestFinalRun?.id)

  // Sort statements: Member Cycle sorts by member name, Club Cycle by periodStart ascending
  const statements = useMemo(() => {
    if (isMemberCycle) {
      return [...rawStatements].sort((a, b) => {
        const nameA = getMemberInfo(a).name.toLowerCase()
        const nameB = getMemberInfo(b).name.toLowerCase()
        return nameA.localeCompare(nameB)
      })
    }
    return [...rawStatements].sort(
      (a, b) => new Date(a.periodStart).getTime() - new Date(b.periodStart).getTime()
    )
  }, [rawStatements, isMemberCycle])

  // Summary calculations
  const summary = useMemo(() => {
    return {
      totalStatements: statements.length,
      totalOpeningBalance: statements.reduce((sum, s) => sum + s.openingBalance, 0),
      totalClosingBalance: statements.reduce((sum, s) => sum + s.closingBalance, 0),
      totalOverdue: statements.reduce(
        (sum, s) => sum + s.aging61to90 + s.aging90Plus,
        0
      ),
    }
  }, [statements])

  const isLoading = periodsLoading || runsLoading || statementsLoading
  const error = (periodsError as any)?.message || (runsError as any)?.message || (statementsError as any)?.message

  return (
    <div className={cn('space-y-4', className)}>
      {/* Period filter */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-muted-foreground">
            {isMemberCycle ? 'Financial Period:' : 'Period:'}
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="min-w-[200px] justify-between" disabled={periodsLoading}>
                {periodsLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading...
                  </span>
                ) : selectedPeriod ? (
                  <span>{selectedPeriod.periodLabel}</span>
                ) : (
                  <span className="text-muted-foreground">Select period</span>
                )}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[250px]">
              {sortedPeriods.map((period) => (
                <DropdownMenuItem
                  key={period.id}
                  onClick={() => setSelectedPeriodId(period.id)}
                  className={cn(
                    effectivePeriodId === period.id && 'bg-amber-50 dark:bg-amber-500/10'
                  )}
                >
                  <div className="flex items-center justify-between w-full">
                    <span>{period.periodLabel}</span>
                    <span
                      className={cn(
                        'text-xs px-1.5 py-0.5 rounded',
                        period.status === 'CLOSED'
                          ? 'bg-stone-100 text-stone-600 dark:bg-stone-700 dark:text-stone-300'
                          : period.status === 'OPEN'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'
                      )}
                    >
                      {period.status}
                    </span>
                  </div>
                </DropdownMenuItem>
              ))}
              {sortedPeriods.length === 0 && !periodsLoading && (
                <DropdownMenuItem disabled>No periods available</DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          {latestFinalRun && (
            <span className="text-xs text-muted-foreground">
              Run #{latestFinalRun.runNumber} &middot; {statements.length} statements
            </span>
          )}
        </div>
      </div>

      {/* Summary bar */}
      {!isLoading && !error && statements.length > 0 && (
        <div className="flex rounded-xl border border-border bg-muted/50 p-2">
          <SummaryMetric label="Total Statements" value={summary.totalStatements} isCount />
          <SummaryMetric label="Opening Balance" value={summary.totalOpeningBalance} />
          <SummaryMetric label="Closing Balance" value={summary.totalClosingBalance} />
          <SummaryMetric
            label="Overdue (60+)"
            value={summary.totalOverdue}
            colorClass={summary.totalOverdue > 0 ? 'text-red-600' : undefined}
          />
        </div>
      )}

      {/* Error state */}
      {error && (
        <ErrorState
          error={error}
          onRetry={() => {
            refetchPeriods()
            refetchStatements()
          }}
        />
      )}

      {/* Loading state */}
      {isLoading && <TableSkeleton />}

      {/* Empty state */}
      {!isLoading && !error && statements.length === 0 && (
        <EmptyState onGenerateStatement={onGenerateStatement} />
      )}

      {/* Data table */}
      {!isLoading && !error && statements.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <table className="w-full">
            <thead className="border-b border-border bg-muted/50">
              <tr>
                <th className="p-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Member Name
                </th>
                <th className="p-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Account #
                </th>
                <th className="p-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Statement Period
                </th>
                <th className="p-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Due Date
                </th>
                <th className="p-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Opening Bal
                </th>
                <th className="p-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Debits
                </th>
                <th className="p-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Credits
                </th>
                <th className="p-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Closing Bal
                </th>
                <th className="p-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Delivery
                </th>
                <th className="w-12 p-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {statements.map((statement) => {
                const memberInfo = getMemberInfo(statement)
                return (
                  <tr
                    key={statement.id}
                    className="cursor-pointer transition-colors hover:bg-muted/50"
                    onClick={() => {
                      if (latestFinalRun) {
                        router.push(`/billing/statements/runs/${latestFinalRun.id}`)
                      }
                    }}
                  >
                    <td className="p-3">
                      <div className="font-medium text-sm text-foreground">{memberInfo.name}</div>
                      {memberInfo.profileType && (
                        <span
                          className={cn(
                            'text-xs px-1.5 py-0.5 rounded',
                            memberInfo.profileType === 'MEMBER'
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400'
                              : 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400'
                          )}
                        >
                          {memberInfo.profileType}
                        </span>
                      )}
                    </td>
                    <td className="p-3 font-mono text-sm text-muted-foreground">
                      {memberInfo.accountNumber}
                    </td>
                    <td className="p-3 text-sm text-muted-foreground whitespace-nowrap">
                      {formatDate(statement.periodStart)} — {formatDate(statement.periodEnd)}
                    </td>
                    <td className="p-3 text-sm text-muted-foreground">
                      {formatDate(statement.dueDate)}
                    </td>
                    <td className="p-3 text-right text-sm text-muted-foreground">
                      ฿{formatCurrency(statement.openingBalance)}
                    </td>
                    <td className="p-3 text-right text-sm text-red-600 dark:text-red-400">
                      {statement.totalDebits > 0 ? `฿${formatCurrency(statement.totalDebits)}` : '-'}
                    </td>
                    <td className="p-3 text-right text-sm text-emerald-600 dark:text-emerald-400">
                      {statement.totalCredits > 0 ? `฿${formatCurrency(statement.totalCredits)}` : '-'}
                    </td>
                    <td className={cn(
                      'p-3 text-right text-sm font-medium',
                      statement.closingBalance > 0
                        ? 'text-foreground'
                        : 'text-emerald-600 dark:text-emerald-400'
                    )}>
                      ฿{formatCurrency(statement.closingBalance)}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1.5">
                        <DeliveryStatusIcon status={statement.emailStatus} channel="email" />
                        <DeliveryStatusIcon status={statement.printStatus} channel="print" />
                        <DeliveryStatusIcon status={statement.portalStatus} channel="portal" />
                        <DeliveryStatusIcon status={statement.smsStatus} channel="sms" />
                      </div>
                    </td>
                    <td className="p-3" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="rounded p-1 hover:bg-muted">
                            <MoreVertical className="h-4 w-4 text-muted-foreground" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              if (latestFinalRun) {
                                router.push(`/billing/statements/runs/${latestFinalRun.id}`)
                              }
                            }}
                          >
                            <FileText className="mr-2 h-4 w-4" />
                            View
                          </DropdownMenuItem>
                          {statement.pdfUrl && (
                            <DropdownMenuItem asChild>
                              <a href={statement.pdfUrl} target="_blank" rel="noopener noreferrer">
                                <Download className="mr-2 h-4 w-4" />
                                Download PDF
                              </a>
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem>
                            <Send className="mr-2 h-4 w-4" />
                            Resend
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
