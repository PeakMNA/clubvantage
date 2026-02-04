'use client'

import { useState, useMemo } from 'react'
import { Plus, Calendar, Play, FileText, ChevronRight, RefreshCw } from 'lucide-react'
import { Button, Card, CardContent, CardHeader, CardTitle } from '@clubvantage/ui'
import { cn } from '@clubvantage/ui'

import { PeriodStatusBadge } from '@/components/billing/period-status-badge'
import { RunStatusBadge } from '@/components/billing/run-status-badge'
import {
  useStatementPeriods,
  useStatementRunsByPeriod,
  useCurrentStatementPeriod,
  type StatementPeriod,
  type StatementRun,
  type PeriodStatus,
} from '@/hooks/use-ar-statements'

// Mock data for development (will be replaced with actual API data)
const mockPeriods: StatementPeriod[] = [
  {
    id: '1',
    periodYear: 2026,
    periodNumber: 2,
    periodLabel: 'February 2026',
    periodStart: new Date('2026-02-01'),
    periodEnd: new Date('2026-02-28'),
    cutoffDate: new Date('2026-03-05'),
    status: 'OPEN',
    totalProfiles: 245,
    totalStatements: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    periodYear: 2026,
    periodNumber: 1,
    periodLabel: 'January 2026',
    periodStart: new Date('2026-01-01'),
    periodEnd: new Date('2026-01-31'),
    cutoffDate: new Date('2026-02-05'),
    status: 'CLOSED',
    closedAt: new Date('2026-02-06'),
    totalProfiles: 243,
    totalStatements: 238,
    totalClosingBalance: 1245678.50,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    periodYear: 2025,
    periodNumber: 12,
    periodLabel: 'December 2025',
    periodStart: new Date('2025-12-01'),
    periodEnd: new Date('2025-12-31'),
    cutoffDate: new Date('2026-01-05'),
    status: 'CLOSED',
    closedAt: new Date('2026-01-07'),
    totalProfiles: 241,
    totalStatements: 235,
    totalClosingBalance: 1198432.25,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

const mockRuns: StatementRun[] = [
  {
    id: 'run-1',
    statementPeriodId: '1',
    runType: 'PREVIEW',
    runNumber: 1,
    status: 'COMPLETED',
    startedAt: new Date('2026-02-04T10:00:00'),
    completedAt: new Date('2026-02-04T10:05:32'),
    totalProfiles: 245,
    processedCount: 245,
    generatedCount: 238,
    skippedCount: 7,
    errorCount: 0,
    totalOpeningBalance: 1198432.25,
    totalDebits: 156789.00,
    totalCredits: 98765.00,
    totalClosingBalance: 1256456.25,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

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
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-stone-900 dark:text-stone-100">
              {period.periodLabel}
            </span>
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

      {period.status === 'CLOSED' && period.totalClosingBalance !== undefined && (
        <div className="mt-3 pt-3 border-t border-stone-200 dark:border-stone-700 grid grid-cols-2 gap-2 text-sm">
          <div>
            <div className="text-stone-500 dark:text-stone-400">Statements</div>
            <div className="font-medium text-stone-900 dark:text-stone-100">
              {period.totalStatements?.toLocaleString()}
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

// Run Row Component
function RunRow({ run, onViewStatements }: { run: StatementRun; onViewStatements: () => void }) {
  const progress = run.totalProfiles > 0
    ? Math.round((run.processedCount / run.totalProfiles) * 100)
    : 0

  return (
    <div className="flex items-center gap-4 p-4 border-b border-stone-100 dark:border-stone-800 last:border-0">
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
          {run.completedAt && ` • Completed in ${Math.round((new Date(run.completedAt).getTime() - new Date(run.startedAt!).getTime()) / 1000)}s`}
        </div>
      </div>

      <div className="text-right text-sm">
        <div className="text-stone-900 dark:text-stone-100 font-medium">
          {run.generatedCount.toLocaleString()} / {run.totalProfiles.toLocaleString()}
        </div>
        <div className="text-stone-500 dark:text-stone-400">
          {run.skippedCount > 0 && `${run.skippedCount} skipped`}
          {run.errorCount > 0 && ` • ${run.errorCount} errors`}
        </div>
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
  )
}

export default function StatementsPage() {
  const [selectedPeriodId, setSelectedPeriodId] = useState<string | null>(mockPeriods[0]?.id || null)
  const [showCreatePeriodModal, setShowCreatePeriodModal] = useState(false)

  // Use hooks (will return mock/empty data until API is connected)
  const { periods: apiPeriods, isLoading: periodsLoading } = useStatementPeriods()
  const { runs: apiRuns, isLoading: runsLoading } = useStatementRunsByPeriod(selectedPeriodId || '', !!selectedPeriodId)

  // Use mock data for now
  const periods = mockPeriods
  const runs = selectedPeriodId ? mockRuns.filter(r => r.statementPeriodId === selectedPeriodId) : []

  const selectedPeriod = useMemo(
    () => periods.find(p => p.id === selectedPeriodId),
    [periods, selectedPeriodId]
  )

  const currentYear = new Date().getFullYear()
  const yearOptions = [currentYear, currentYear - 1, currentYear - 2]

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
          <Button variant="outline" onClick={() => {}}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setShowCreatePeriodModal(true)}>
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
              {periods.map(period => (
                <PeriodCard
                  key={period.id}
                  period={period}
                  isSelected={period.id === selectedPeriodId}
                  onClick={() => setSelectedPeriodId(period.id)}
                />
              ))}
              {periods.length === 0 && (
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
                    <PeriodStatusBadge status={selectedPeriod.status} />
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
                        {selectedPeriod.totalProfiles?.toLocaleString() || '-'}
                      </div>
                    </div>
                    <div>
                      <div className="text-stone-500 dark:text-stone-400 mb-1">Statements</div>
                      <div className="font-medium text-stone-900 dark:text-stone-100">
                        {selectedPeriod.totalStatements?.toLocaleString() || '-'}
                      </div>
                    </div>
                  </div>

                  {selectedPeriod.status === 'OPEN' && (
                    <div className="flex items-center gap-3 mt-4 pt-4 border-t border-stone-200 dark:border-stone-700">
                      <Button onClick={() => {}}>
                        <Play className="h-4 w-4 mr-2" />
                        Run Preview
                      </Button>
                      <Button variant="outline" onClick={() => {}}>
                        <Play className="h-4 w-4 mr-2" />
                        Run Final & Close
                      </Button>
                    </div>
                  )}

                  {selectedPeriod.status === 'CLOSED' && (
                    <div className="flex items-center gap-3 mt-4 pt-4 border-t border-stone-200 dark:border-stone-700">
                      <Button variant="outline" onClick={() => {}}>
                        Reopen Period
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Statement Runs */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Statement Runs
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {runs.length > 0 ? (
                    <div>
                      {runs.map(run => (
                        <RunRow
                          key={run.id}
                          run={run}
                          onViewStatements={() => {}}
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
    </div>
  )
}
