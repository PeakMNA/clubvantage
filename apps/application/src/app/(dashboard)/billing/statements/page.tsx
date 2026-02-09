'use client'

import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Calendar, Play, FileText, ChevronRight, RefreshCw, Loader2, Pencil, AlertTriangle, Users, History, TrendingUp, Shield } from 'lucide-react'
import { Button, Card, CardContent, CardHeader, CardTitle } from '@clubvantage/ui'
import { cn } from '@clubvantage/ui'

import { PeriodStatusBadge } from '@/components/billing/period-status-badge'
import { RunStatusBadge } from '@/components/billing/run-status-badge'
import { CreatePeriodModal, type CreatePeriodFormData } from '@/components/billing/create-period-modal'
import { EditPeriodModal, type UpdatePeriodFormData } from '@/components/billing/edit-period-modal'
import { AgingSummaryCard, AgingDistributionBar, type AgingSummaryData } from '@/components/billing/aging-summary-card'
import { PeriodInitWizard, type InitWizardResult } from '@/components/billing/period-init-wizard'
import { CloseChecklist } from '@/components/billing/close-checklist'
import { ReopenPeriodModal } from '@/components/billing/reopen-period-modal'
import {
  useStatementPeriods,
  useStatementRunsByPeriod,
  useStatementsByRun,
  useARStatementMutations,
  type StatementPeriod,
  type StatementRun,
  type ARStatement,
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

// Calculate aging summary from statements
function calculateAgingSummary(statements: ARStatement[]): AgingSummaryData | null {
  if (statements.length === 0) return null

  let current = 0, days1To30 = 0, days31To60 = 0, days61To90 = 0, days90Plus = 0
  let currentCount = 0, days1To30Count = 0, days31To60Count = 0, days61To90Count = 0, days90PlusCount = 0

  for (const s of statements) {
    current += s.agingCurrent
    days1To30 += s.aging1to30
    days31To60 += s.aging31to60
    days61To90 += s.aging61to90
    days90Plus += s.aging90Plus

    if (s.agingCurrent > 0) currentCount++
    if (s.aging1to30 > 0) days1To30Count++
    if (s.aging31to60 > 0) days31To60Count++
    if (s.aging61to90 > 0) days61To90Count++
    if (s.aging90Plus > 0) days90PlusCount++
  }

  const total = current + days1To30 + days31To60 + days61To90 + days90Plus
  if (total === 0) return null

  return {
    totalOutstanding: total,
    current: {
      label: 'Current',
      amount: current,
      memberCount: currentCount,
      percentage: (current / total) * 100,
    },
    days1To30: {
      label: '1-30 Days',
      amount: days1To30,
      memberCount: days1To30Count,
      percentage: (days1To30 / total) * 100,
    },
    days31To60: {
      label: '31-60 Days',
      amount: days31To60,
      memberCount: days31To60Count,
      percentage: (days31To60 / total) * 100,
    },
    days61To90: {
      label: '61-90 Days',
      amount: days61To90,
      memberCount: days61To90Count,
      percentage: (days61To90 / total) * 100,
    },
    days90Plus: {
      label: '90+ Days',
      amount: days90Plus,
      memberCount: days90PlusCount,
      percentage: (days90Plus / total) * 100,
    },
    membersAtRisk: days90PlusCount,
  }
}

// Period Card Component
function PeriodCard({
  period,
  isSelected,
  onClick,
}: {
  period: StatementPeriod
  isSelected: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left p-4 rounded-lg border transition-colors',
        isSelected
          ? 'border-amber-500 bg-amber-50 dark:bg-amber-500/10'
          : 'border-stone-200 dark:border-stone-700 hover:border-stone-300 dark:hover:border-stone-600'
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="font-medium text-stone-900 dark:text-stone-100">
              {period.periodLabel}
            </span>
            {period.isCatchUp && (
              <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400">
                <History className="h-3 w-3" />
                Catch-up
              </span>
            )}
            <PeriodStatusBadge status={period.status} />
          </div>
          <div className="text-sm text-stone-500 dark:text-stone-400">
            {formatDate(period.periodStart)} - {formatDate(period.periodEnd)}
          </div>
        </div>
        <ChevronRight className={cn(
          'h-5 w-5 text-stone-400 transition-transform',
          isSelected && 'rotate-90'
        )} />
      </div>

      {period.status === 'CLOSED' && period.totalClosingBalance !== undefined && period.totalClosingBalance !== null && (
        <div className="mt-3 pt-3 border-t border-stone-200 dark:border-stone-700 grid grid-cols-2 gap-2 text-sm">
          <div>
            <div className="text-stone-500 dark:text-stone-400">Statements</div>
            <div className="font-medium text-stone-900 dark:text-stone-100">
              {period.totalStatements?.toLocaleString() ?? '-'}
            </div>
          </div>
          <div>
            <div className="text-stone-500 dark:text-stone-400">Total Balance</div>
            <div className="font-medium text-stone-900 dark:text-stone-100">
              {formatCurrency(period.totalClosingBalance)}
            </div>
          </div>
        </div>
      )}
    </button>
  )
}

// Run Row Component with Aging
function RunRow({
  run,
  onViewStatements,
  agingSummary,
}: {
  run: StatementRun
  onViewStatements: () => void
  agingSummary?: AgingSummaryData | null
}) {
  const progress = run.totalProfiles > 0
    ? Math.round((run.processedCount / run.totalProfiles) * 100)
    : 0

  const hasNoProfiles = run.totalProfiles === 0

  return (
    <div className="p-4 border-b border-stone-100 dark:border-stone-800 last:border-0">
      <div className="flex items-center gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-stone-900 dark:text-stone-100">
              Run #{run.runNumber}
            </span>
            <span className={cn(
              'text-xs px-2 py-0.5 rounded-full font-medium',
              run.runType === 'FINAL'
                ? 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400'
                : 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400'
            )}>
              {run.runType}
            </span>
            <RunStatusBadge status={run.status} />
          </div>
          <div className="text-sm text-stone-500 dark:text-stone-400">
            {run.startedAt && formatDateTime(run.startedAt)}
            {run.completedAt && run.startedAt && ` • Completed in ${Math.round((new Date(run.completedAt).getTime() - new Date(run.startedAt).getTime()) / 1000)}s`}
          </div>
        </div>

        <div className="text-right text-sm">
          {hasNoProfiles ? (
            <div className="text-amber-600 dark:text-amber-400 font-medium">
              No eligible profiles
            </div>
          ) : (
            <>
              <div className="text-stone-900 dark:text-stone-100 font-medium">
                {run.generatedCount.toLocaleString()} / {run.totalProfiles.toLocaleString()}
              </div>
              <div className="text-stone-500 dark:text-stone-400">
                {run.skippedCount > 0 && `${run.skippedCount} skipped`}
                {run.errorCount > 0 && ` • ${run.errorCount} errors`}
              </div>
            </>
          )}
        </div>

        {run.status === 'IN_PROGRESS' && (
          <div className="w-24">
            <div className="h-2 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="text-xs text-stone-500 text-center mt-1">{progress}%</div>
          </div>
        )}

        {run.status === 'COMPLETED' && (
          <Button variant="outline" size="sm" onClick={onViewStatements}>
            <FileText className="h-4 w-4 mr-1" />
            View
          </Button>
        )}
      </div>

      {/* Aging distribution bar for completed runs */}
      {run.status === 'COMPLETED' && agingSummary && (
        <div className="mt-3 pt-3 border-t border-stone-100 dark:border-stone-800">
          <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 mb-2">
            <span>Aging Distribution</span>
            <span className="font-medium text-stone-700 dark:text-stone-300">
              {formatCurrency(agingSummary.totalOutstanding)}
            </span>
          </div>
          <AgingDistributionBar data={agingSummary} height="h-1.5" />
        </div>
      )}
    </div>
  )
}

export default function StatementsPage() {
  const router = useRouter()
  const [selectedPeriodId, setSelectedPeriodId] = useState<string | null>(null)
  const [showCreatePeriodModal, setShowCreatePeriodModal] = useState(false)
  const [showEditPeriodModal, setShowEditPeriodModal] = useState(false)
  const [showReopenModal, setShowReopenModal] = useState(false)
  const [showInitWizard, setShowInitWizard] = useState(false)
  const [isInitializing, setIsInitializing] = useState(false)

  // Fetch periods and runs from API
  const { periods, isLoading: periodsLoading, refetch: refetchPeriods } = useStatementPeriods()
  const { runs, isLoading: runsLoading, refetch: refetchRuns } = useStatementRunsByPeriod(
    selectedPeriodId || '',
    !!selectedPeriodId
  )

  // Find the latest completed FINAL run for aging summary
  const latestFinalRun = useMemo(() => {
    return runs.find(r => r.runType === 'FINAL' && r.status === 'COMPLETED')
  }, [runs])

  // Fetch statements for the latest final run to calculate aging
  const { statements: finalRunStatements } = useStatementsByRun(
    latestFinalRun?.id || '',
    !!latestFinalRun?.id
  )

  // Calculate aging summary from statements
  const periodAgingSummary = useMemo(() => {
    return calculateAgingSummary(finalRunStatements)
  }, [finalRunStatements])

  // Check if any run is in progress or pending
  const hasActiveRun = useMemo(() => {
    return runs.some(run => run.status === 'IN_PROGRESS' || run.status === 'PENDING')
  }, [runs])

  // Auto-poll when a run is in progress
  const pollingRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Clear any existing interval
    if (pollingRef.current) {
      clearInterval(pollingRef.current)
      pollingRef.current = null
    }

    // Start polling if there's an active run
    if (hasActiveRun && selectedPeriodId) {
      pollingRef.current = setInterval(() => {
        refetchRuns()
      }, 1500) // Poll every 1.5 seconds
    }

    // Cleanup on unmount or when dependencies change
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current)
        pollingRef.current = null
      }
    }
  }, [hasActiveRun, selectedPeriodId, refetchRuns])

  // Mutations
  const {
    createStatementPeriod,
    updateStatementPeriod,
    startStatementRun,
    closeStatementPeriod,
    reopenStatementPeriod,
    isCreatingPeriod,
    isUpdatingPeriod,
    isStartingRun,
    isClosingPeriod,
    isReopeningPeriod,
  } = useARStatementMutations()

  // Select first period if none selected
  const selectedPeriod = useMemo(() => {
    if (!selectedPeriodId && periods.length > 0) {
      setSelectedPeriodId(periods[0]!.id)
    }
    return periods.find(p => p.id === selectedPeriodId) ?? null
  }, [periods, selectedPeriodId])

  // Existing periods for duplicate check
  const existingPeriods = useMemo(
    () => periods.map(p => ({ periodYear: p.periodYear, periodNumber: p.periodNumber, isCatchUp: p.isCatchUp })),
    [periods]
  )

  // Check if a catch-up period already exists
  const hasCatchUpPeriod = useMemo(
    () => periods.some(p => p.isCatchUp),
    [periods]
  )

  // Check if runs exist but have no profiles (setup issue)
  const hasNoProfilesWarning = useMemo(() => {
    if (runs.length === 0) return false
    // Check if the most recent run had 0 profiles
    const latestRun = runs[0]
    return latestRun && latestRun.totalProfiles === 0
  }, [runs])

  // Handle create period
  const handleCreatePeriod = useCallback(
    async (data: CreatePeriodFormData) => {
      await createStatementPeriod(data)
      refetchPeriods()
    },
    [createStatementPeriod, refetchPeriods]
  )

  // Handle update period
  const handleUpdatePeriod = useCallback(
    async (data: UpdatePeriodFormData) => {
      if (!selectedPeriodId) return
      await updateStatementPeriod(selectedPeriodId, data)
      refetchPeriods()
    },
    [selectedPeriodId, updateStatementPeriod, refetchPeriods]
  )

  // Handle run preview
  const handleRunPreview = useCallback(async () => {
    if (!selectedPeriodId) return
    await startStatementRun({
      statementPeriodId: selectedPeriodId,
      runType: 'PREVIEW',
    })
    refetchRuns()
  }, [selectedPeriodId, startStatementRun, refetchRuns])

  // Handle run final
  const handleRunFinal = useCallback(async () => {
    if (!selectedPeriodId) return
    await startStatementRun({
      statementPeriodId: selectedPeriodId,
      runType: 'FINAL',
    })
    refetchRuns()
  }, [selectedPeriodId, startStatementRun, refetchRuns])

  // Handle close period
  const handleClosePeriod = useCallback(async () => {
    if (!selectedPeriodId) return
    await closeStatementPeriod(selectedPeriodId)
    refetchPeriods()
  }, [selectedPeriodId, closeStatementPeriod, refetchPeriods])

  // Handle reopen period
  const handleReopenPeriod = useCallback(async () => {
    if (!selectedPeriodId) return
    await reopenStatementPeriod(selectedPeriodId, 'Reopened for adjustments')
    refetchPeriods()
  }, [selectedPeriodId, reopenStatementPeriod, refetchPeriods])

  // Handle refresh
  const handleRefresh = useCallback(() => {
    refetchPeriods()
    if (selectedPeriodId) {
      refetchRuns()
    }
  }, [refetchPeriods, refetchRuns, selectedPeriodId])

  // Handle new period click - show wizard if no periods exist
  const handleNewPeriodClick = useCallback(() => {
    if (periods.length === 0) {
      setShowInitWizard(true)
    } else {
      setShowCreatePeriodModal(true)
    }
  }, [periods.length])

  // Handle initialization wizard completion
  const handleInitWizardComplete = useCallback(
    async (result: InitWizardResult) => {
      setIsInitializing(true)
      try {
        if (result.initializationType === 'catchup' && result.catchUpStartDate && result.catchUpEndDate) {
          // Create catch-up period first
          const catchUpEnd = new Date(result.catchUpEndDate)
          const cutoffDate = new Date(catchUpEnd)
          cutoffDate.setDate(cutoffDate.getDate() + 7)

          await createStatementPeriod({
            periodYear: catchUpEnd.getFullYear(),
            periodNumber: 0, // Special number for catch-up
            periodLabel: result.catchUpLabel || 'Historical Catch-up',
            periodStart: result.catchUpStartDate,
            periodEnd: result.catchUpEndDate,
            cutoffDate: cutoffDate.toISOString().split('T')[0] || '',
            isCatchUp: true,
          })
        }

        // Create first regular period
        const year = result.initializationType === 'fresh'
          ? result.periodYear!
          : result.firstPeriodYear!
        const month = result.initializationType === 'fresh'
          ? result.periodMonth!
          : result.firstPeriodMonth!

        const periodStart = new Date(year, month - 1, 1)
        const periodEnd = new Date(year, month, 0) // Last day of month
        const cutoffDate = new Date(periodEnd)
        cutoffDate.setDate(cutoffDate.getDate() + 7)

        const monthNames = [
          'January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December',
        ]

        await createStatementPeriod({
          periodYear: year,
          periodNumber: month,
          periodLabel: `${monthNames[month - 1]} ${year}`,
          periodStart: periodStart.toISOString().split('T')[0] || '',
          periodEnd: periodEnd.toISOString().split('T')[0] || '',
          cutoffDate: cutoffDate.toISOString().split('T')[0] || '',
        })

        refetchPeriods()
        setShowInitWizard(false)
      } catch (error) {
        console.error('Failed to initialize periods:', error)
      } finally {
        setIsInitializing(false)
      }
    },
    [createStatementPeriod, refetchPeriods]
  )

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-stone-900 dark:text-stone-100">
            AR Statements
          </h1>
          <p className="text-stone-500 dark:text-stone-400 mt-1">
            Manage billing periods and generate member statements
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleRefresh} disabled={periodsLoading}>
            <RefreshCw className={cn('h-4 w-4 mr-2', periodsLoading && 'animate-spin')} />
            Refresh
          </Button>
          <Button onClick={handleNewPeriodClick}>
            <Plus className="h-4 w-4 mr-2" />
            New Period
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-12 gap-6">
        {/* Periods List */}
        <div className="col-span-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Statement Periods
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {periodsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-stone-400" />
                </div>
              ) : periods.length > 0 ? (
                periods.map(period => (
                  <PeriodCard
                    key={period.id}
                    period={period}
                    isSelected={period.id === selectedPeriodId}
                    onClick={() => setSelectedPeriodId(period.id)}
                  />
                ))
              ) : (
                <div className="text-center py-8 text-stone-500">
                  No statement periods found.
                  <br />
                  Create your first period to get started.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Period Detail & Runs */}
        <div className="col-span-8">
          {selectedPeriod ? (
            <div className="space-y-6">
              {/* Period Summary Card */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">
                      {selectedPeriod.periodLabel}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      {(selectedPeriod.status === 'OPEN' || selectedPeriod.status === 'REOPENED') && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowEditPeriodModal(true)}
                        >
                          <Pencil className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      )}
                      {selectedPeriod.isCatchUp && (
                        <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400">
                          <History className="h-3 w-3" />
                          Catch-up
                        </span>
                      )}
                      <PeriodStatusBadge status={selectedPeriod.status} />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-stone-500 dark:text-stone-400 mb-1">Period</div>
                      <div className="font-medium text-stone-900 dark:text-stone-100">
                        {formatDate(selectedPeriod.periodStart)} - {formatDate(selectedPeriod.periodEnd)}
                      </div>
                    </div>
                    <div>
                      <div className="text-stone-500 dark:text-stone-400 mb-1">Cutoff Date</div>
                      <div className="font-medium text-stone-900 dark:text-stone-100">
                        {formatDate(selectedPeriod.cutoffDate)}
                      </div>
                    </div>
                    <div>
                      <div className="text-stone-500 dark:text-stone-400 mb-1">Profiles</div>
                      <div className="font-medium text-stone-900 dark:text-stone-100">
                        {selectedPeriod.totalProfiles?.toLocaleString() ?? '-'}
                      </div>
                    </div>
                    <div>
                      <div className="text-stone-500 dark:text-stone-400 mb-1">Statements</div>
                      <div className="font-medium text-stone-900 dark:text-stone-100">
                        {selectedPeriod.totalStatements?.toLocaleString() ?? '-'}
                      </div>
                    </div>
                  </div>

                  {/* Warning: No AR Profiles */}
                  {hasNoProfilesWarning && (selectedPeriod.status === 'OPEN' || selectedPeriod.status === 'REOPENED') && (
                    <div className="mt-4 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                            No AR profiles found
                          </p>
                          <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                            Statement runs completed with 0 profiles. Make sure AR profiles are set up for members before generating statements.
                          </p>
                          <a
                            href="/billing/invoices"
                            className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-100 mt-2"
                          >
                            <Users className="h-3.5 w-3.5" />
                            Go to Invoices & Payments
                          </a>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Aging Summary for periods with completed final run */}
                  {periodAgingSummary && (
                    <div className="mt-4">
                      <AgingSummaryCard
                        data={periodAgingSummary}
                        title="Period Aging Summary"
                        showTrend={false}
                        compact
                      />
                    </div>
                  )}

                  {(selectedPeriod.status === 'OPEN' || selectedPeriod.status === 'REOPENED') && (
                    <div className="flex items-center gap-3 mt-4 pt-4 border-t border-stone-200 dark:border-stone-700">
                      <Button onClick={handleRunPreview} disabled={isStartingRun}>
                        {isStartingRun ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Play className="h-4 w-4 mr-2" />
                        )}
                        Run Preview
                      </Button>
                      <Button variant="outline" onClick={handleRunFinal} disabled={isStartingRun}>
                        {isStartingRun ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Play className="h-4 w-4 mr-2" />
                        )}
                        Run Final & Close
                      </Button>
                    </div>
                  )}

                  {selectedPeriod.status === 'CLOSED' && (
                    <div className="flex items-center gap-3 mt-4 pt-4 border-t border-stone-200 dark:border-stone-700">
                      <Button variant="outline" onClick={() => setShowReopenModal(true)}>
                        Reopen Period
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Close Checklist — shown for OPEN or REOPENED periods */}
              {(selectedPeriod.status === 'OPEN' || selectedPeriod.status === 'REOPENED') && (
                <CloseChecklist
                  periodId={selectedPeriod.id}
                  periodLabel={selectedPeriod.periodLabel}
                  onPeriodClose={handleClosePeriod}
                />
              )}

              {/* Statement Runs */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Statement Runs
                    </CardTitle>
                    {hasActiveRun && (
                      <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                        </span>
                        Processing...
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {runsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-stone-400" />
                    </div>
                  ) : runs.length > 0 ? (
                    <div>
                      {runs.map(run => (
                        <RunRow
                          key={run.id}
                          run={run}
                          onViewStatements={() => router.push(`/billing/statements/runs/${run.id}`)}
                          agingSummary={run.id === latestFinalRun?.id ? periodAgingSummary : undefined}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-stone-500">
                      No statement runs yet.
                      <br />
                      Click &quot;Run Preview&quot; to generate statements.
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="py-12">
                <div className="text-center text-stone-500">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Select a statement period to view details and runs</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Create Period Modal */}
      <CreatePeriodModal
        open={showCreatePeriodModal}
        onOpenChange={setShowCreatePeriodModal}
        onSubmit={handleCreatePeriod}
        isSubmitting={isCreatingPeriod}
        existingPeriods={existingPeriods}
        hasCatchUpPeriod={hasCatchUpPeriod}
      />

      {/* Edit Period Modal */}
      <EditPeriodModal
        open={showEditPeriodModal}
        onOpenChange={setShowEditPeriodModal}
        onSubmit={handleUpdatePeriod}
        period={selectedPeriod}
        isSubmitting={isUpdatingPeriod}
      />

      {/* Period Initialization Wizard */}
      <PeriodInitWizard
        open={showInitWizard}
        onOpenChange={setShowInitWizard}
        onComplete={handleInitWizardComplete}
        hasExistingData={false}
        existingProfileCount={0}
        isSubmitting={isInitializing}
      />

      {/* Reopen Period Modal */}
      {selectedPeriod && (
        <ReopenPeriodModal
          open={showReopenModal}
          onOpenChange={setShowReopenModal}
          periodLabel={selectedPeriod.periodLabel}
          onSubmit={async (reason) => {
            if (!selectedPeriodId) return
            await reopenStatementPeriod(selectedPeriodId, reason)
            refetchPeriods()
          }}
          isSubmitting={isReopeningPeriod}
        />
      )}
    </div>
  )
}
