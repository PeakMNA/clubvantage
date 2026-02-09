'use client'

import { useState, useMemo, useCallback } from 'react'
import {
  CheckCircle,
  XCircle,
  MinusCircle,
  Circle,
  ChevronDown,
  ChevronRight,
  Play,
  Loader2,
  Shield,
  AlertTriangle,
  Lock,
  Zap,
  PenLine,
  SkipForward,
  Info,
} from 'lucide-react'
import { Button, Card, CardContent, CardHeader, CardTitle } from '@clubvantage/ui'
import { cn } from '@clubvantage/ui'

import {
  useCloseChecklist,
  useCanClosePeriod,
  useCloseChecklistMutations,
  type CloseChecklist as CloseChecklistType,
  type CloseChecklistStep,
  type CloseChecklistPhase,
  type StepStatus,
  type StepVerification,
} from '@/hooks/use-ar-statements'

export interface CloseChecklistProps {
  periodId: string
  periodLabel?: string
  onPeriodClose?: () => void
}

const PHASE_CONFIG: Record<CloseChecklistPhase, { label: string; description: string }> = {
  PRE_CLOSE: { label: 'Pre-Closing', description: 'Review invoices, reconcile transactions' },
  CUT_OFF: { label: 'Period-End Cut-Off', description: 'Set cut-off, process final transactions' },
  RECEIVABLES: { label: 'Receivables', description: 'Apply payments, settle batches' },
  TAX: { label: 'Tax Compliance', description: 'Invoice sequence, tax rate verification' },
  RECONCILIATION: { label: 'Reconciliation', description: 'AR/GL reconciliation' },
  REPORTING: { label: 'Reporting', description: 'Aging report, GL export' },
  CLOSE: { label: 'Close', description: 'Verify period totals' },
  STATEMENTS: { label: 'Statements', description: 'Generate and distribute statements' },
}

const STATUS_CONFIG: Record<StepStatus, { icon: typeof Circle; color: string; label: string }> = {
  PENDING: { icon: Circle, color: 'text-stone-400', label: 'Pending' },
  PASSED: { icon: CheckCircle, color: 'text-emerald-500', label: 'Passed' },
  FAILED: { icon: XCircle, color: 'text-red-500', label: 'Failed' },
  SKIPPED: { icon: MinusCircle, color: 'text-stone-400', label: 'Skipped' },
  SIGNED_OFF: { icon: CheckCircle, color: 'text-emerald-500', label: 'Signed Off' },
}

const VERIFICATION_ICON: Record<StepVerification, typeof Circle> = {
  MANUAL: PenLine,
  AUTO: Zap,
  SYSTEM_ACTION: Lock,
}

function StepRow({
  step,
  onSignOff,
  onVerify,
  onSkip,
  isSigningOff,
  isVerifying,
  isSkipping,
}: {
  step: CloseChecklistStep
  onSignOff: (stepId: string) => void
  onVerify: (stepId: string) => void
  onSkip: (stepId: string) => void
  isSigningOff: boolean
  isVerifying: boolean
  isSkipping: boolean
}) {
  const [showNotes, setShowNotes] = useState(false)
  const [notes, setNotes] = useState('')
  const [showResult, setShowResult] = useState(false)

  const statusCfg = STATUS_CONFIG[step.status]
  const StatusIcon = statusCfg.icon
  const VerificationIcon = VERIFICATION_ICON[step.verification]

  const isComplete = step.status === 'PASSED' || step.status === 'SIGNED_OFF' || step.status === 'SKIPPED'
  const isPending = step.status === 'PENDING'
  const isFailed = step.status === 'FAILED'

  const handleSignOff = () => {
    if (notes.trim()) {
      onSignOff(step.id)
      setShowNotes(false)
      setNotes('')
    } else {
      onSignOff(step.id)
    }
  }

  return (
    <div className={cn(
      'flex items-start gap-3 px-4 py-3 border-b border-stone-100 dark:border-stone-800 last:border-0',
      isComplete && 'opacity-70',
    )}>
      {/* Status Icon */}
      <StatusIcon className={cn('h-5 w-5 mt-0.5 flex-shrink-0', statusCfg.color)} />

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={cn(
            'font-medium text-sm',
            isComplete ? 'text-stone-500 dark:text-stone-400 line-through' : 'text-stone-900 dark:text-stone-100'
          )}>
            {step.label}
          </span>
          <span className={cn(
            'text-xs px-1.5 py-0.5 rounded',
            step.enforcement === 'REQUIRED'
              ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'
              : 'bg-stone-100 text-stone-500 dark:bg-stone-800 dark:text-stone-400'
          )}>
            {step.enforcement === 'REQUIRED' ? 'Required' : 'Optional'}
          </span>
          <span title={step.verification}>
            <VerificationIcon className="h-3.5 w-3.5 text-stone-400" />
          </span>
        </div>

        {step.description && (
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            {step.description}
          </p>
        )}

        {/* Sign-off notes input */}
        {showNotes && (
          <div className="mt-2 flex items-center gap-2">
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes..."
              className="flex-1 text-sm px-3 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
              onKeyDown={(e) => e.key === 'Enter' && handleSignOff()}
            />
            <Button size="sm" onClick={handleSignOff} disabled={isSigningOff}>
              {isSigningOff ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Confirm'}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setShowNotes(false)}>
              Cancel
            </Button>
          </div>
        )}

        {/* Failed auto-check result */}
        {isFailed && step.autoCheckResult && (
          <div className="mt-2">
            <button
              onClick={() => setShowResult(!showResult)}
              className="text-xs text-red-600 dark:text-red-400 hover:underline flex items-center gap-1"
            >
              <Info className="h-3 w-3" />
              {showResult ? 'Hide details' : 'View failure details'}
            </button>
            {showResult && (
              <pre className="mt-1 text-xs p-2 rounded bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 overflow-x-auto">
                {JSON.stringify(step.autoCheckResult, null, 2)}
              </pre>
            )}
          </div>
        )}

        {/* Signed off info */}
        {step.status === 'SIGNED_OFF' && step.signedOffAt && (
          <p className="text-xs text-stone-400 mt-1">
            Signed off {new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(step.signedOffAt))}
            {step.notes && ` — ${step.notes}`}
          </p>
        )}

        {/* Passed auto-check info */}
        {step.status === 'PASSED' && step.autoCheckResult && (
          <button
            onClick={() => setShowResult(!showResult)}
            className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 mt-1"
          >
            <Info className="h-3 w-3" />
            {showResult ? 'Hide details' : 'View details'}
          </button>
        )}
        {step.status === 'PASSED' && showResult && step.autoCheckResult && (
          <pre className="mt-1 text-xs p-2 rounded bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 overflow-x-auto">
            {JSON.stringify(step.autoCheckResult, null, 2)}
          </pre>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 flex-shrink-0">
        {isPending && step.verification === 'MANUAL' && !showNotes && (
          <Button size="sm" variant="outline" onClick={() => setShowNotes(true)} disabled={isSigningOff}>
            <PenLine className="h-3.5 w-3.5 mr-1" />
            Sign Off
          </Button>
        )}

        {isPending && step.verification === 'AUTO' && (
          <Button size="sm" variant="outline" onClick={() => onVerify(step.id)} disabled={isVerifying}>
            {isVerifying ? (
              <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
            ) : (
              <Zap className="h-3.5 w-3.5 mr-1" />
            )}
            Verify
          </Button>
        )}

        {isPending && step.verification === 'SYSTEM_ACTION' && (
          <Button size="sm" variant="outline" onClick={() => onSignOff(step.id)} disabled={isSigningOff}>
            {isSigningOff ? (
              <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
            ) : (
              <Lock className="h-3.5 w-3.5 mr-1" />
            )}
            Execute
          </Button>
        )}

        {isPending && step.enforcement === 'OPTIONAL' && (
          <Button size="sm" variant="ghost" onClick={() => onSkip(step.id)} disabled={isSkipping}>
            {isSkipping ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <SkipForward className="h-3.5 w-3.5" />
            )}
          </Button>
        )}

        {isFailed && step.verification === 'AUTO' && (
          <Button size="sm" variant="outline" onClick={() => onVerify(step.id)} disabled={isVerifying}>
            {isVerifying ? (
              <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
            ) : (
              <Zap className="h-3.5 w-3.5 mr-1" />
            )}
            Re-verify
          </Button>
        )}
      </div>
    </div>
  )
}

function PhaseAccordion({
  phase,
  steps,
  isExpanded,
  onToggle,
  onSignOff,
  onVerify,
  onSkip,
  isSigningOff,
  isVerifying,
  isSkipping,
}: {
  phase: CloseChecklistPhase
  steps: CloseChecklistStep[]
  isExpanded: boolean
  onToggle: () => void
  onSignOff: (stepId: string) => void
  onVerify: (stepId: string) => void
  onSkip: (stepId: string) => void
  isSigningOff: boolean
  isVerifying: boolean
  isSkipping: boolean
}) {
  const config = PHASE_CONFIG[phase]
  const requiredSteps = steps.filter(s => s.enforcement === 'REQUIRED')
  const completedRequired = requiredSteps.filter(
    s => s.status === 'PASSED' || s.status === 'SIGNED_OFF'
  ).length
  const allComplete = steps.every(
    s => s.status === 'PASSED' || s.status === 'SIGNED_OFF' || s.status === 'SKIPPED'
  )
  const hasFailed = steps.some(s => s.status === 'FAILED')

  return (
    <div className={cn(
      'border rounded-lg overflow-hidden',
      allComplete
        ? 'border-emerald-200 dark:border-emerald-800'
        : hasFailed
          ? 'border-red-200 dark:border-red-800'
          : 'border-stone-200 dark:border-stone-700'
    )}>
      {/* Phase Header */}
      <button
        onClick={onToggle}
        className={cn(
          'w-full flex items-center gap-3 px-4 py-3 transition-colors',
          allComplete
            ? 'bg-emerald-50 dark:bg-emerald-900/20'
            : hasFailed
              ? 'bg-red-50 dark:bg-red-900/20'
              : 'bg-stone-50 dark:bg-stone-800/50 hover:bg-stone-100 dark:hover:bg-stone-800'
        )}
      >
        {isExpanded ? (
          <ChevronDown className="h-4 w-4 text-stone-500 flex-shrink-0" />
        ) : (
          <ChevronRight className="h-4 w-4 text-stone-500 flex-shrink-0" />
        )}

        {allComplete ? (
          <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" />
        ) : hasFailed ? (
          <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />
        ) : (
          <Circle className="h-4 w-4 text-stone-400 flex-shrink-0" />
        )}

        <div className="flex-1 text-left">
          <span className="font-medium text-sm text-stone-900 dark:text-stone-100">
            {config.label}
          </span>
          <span className="text-xs text-stone-500 dark:text-stone-400 ml-2">
            {config.description}
          </span>
        </div>

        <span className={cn(
          'text-xs font-medium px-2 py-0.5 rounded-full',
          allComplete
            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'
            : hasFailed
              ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'
              : 'bg-stone-100 text-stone-600 dark:bg-stone-700 dark:text-stone-300'
        )}>
          {completedRequired}/{requiredSteps.length} required
        </span>
      </button>

      {/* Steps */}
      {isExpanded && (
        <div className="bg-white dark:bg-stone-900">
          {steps.map(step => (
            <StepRow
              key={step.id}
              step={step}
              onSignOff={onSignOff}
              onVerify={onVerify}
              onSkip={onSkip}
              isSigningOff={isSigningOff}
              isVerifying={isVerifying}
              isSkipping={isSkipping}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function CloseChecklist({ periodId, periodLabel, onPeriodClose }: CloseChecklistProps) {
  const { checklist, isLoading, refetch } = useCloseChecklist(periodId)
  const { result: canCloseResult, isLoading: isCheckingClose } = useCanClosePeriod(
    checklist?.id || '',
    !!checklist?.id
  )
  const {
    createChecklist,
    signOffStep,
    runAutoVerification,
    skipStep,
    runAllAutoChecks,
    isCreating,
    isSigningOff,
    isVerifying,
    isSkipping,
    isRunningAllChecks,
  } = useCloseChecklistMutations()

  // Expand the first incomplete phase by default
  const phases = useMemo(() => {
    if (!checklist) return []
    const phaseOrder: CloseChecklistPhase[] = ['PRE_CLOSE', 'CUT_OFF', 'RECEIVABLES', 'TAX', 'RECONCILIATION', 'REPORTING', 'CLOSE', 'STATEMENTS']
    return phaseOrder
      .map(phase => ({
        phase,
        steps: checklist.steps.filter(s => s.phase === phase).sort((a, b) => a.sortOrder - b.sortOrder),
      }))
      .filter(p => p.steps.length > 0)
  }, [checklist])

  const firstIncompletePhase = useMemo(() => {
    return phases.find(p =>
      p.steps.some(s => s.status === 'PENDING' || s.status === 'FAILED')
    )?.phase ?? null
  }, [phases])

  const [expandedPhases, setExpandedPhases] = useState<Set<CloseChecklistPhase>>(new Set())

  // Auto-expand first incomplete phase
  const effectiveExpanded = useMemo(() => {
    if (expandedPhases.size > 0) return expandedPhases
    if (firstIncompletePhase) return new Set([firstIncompletePhase])
    return new Set<CloseChecklistPhase>()
  }, [expandedPhases, firstIncompletePhase])

  const togglePhase = useCallback((phase: CloseChecklistPhase) => {
    setExpandedPhases(prev => {
      const next = new Set(prev)
      // If nothing was manually set yet, start from the auto-expanded state
      if (prev.size === 0 && firstIncompletePhase) {
        next.add(firstIncompletePhase)
      }
      if (next.has(phase)) {
        next.delete(phase)
      } else {
        next.add(phase)
      }
      return next
    })
  }, [firstIncompletePhase])

  // Progress calculation
  const progress = useMemo(() => {
    if (!checklist) return { completed: 0, total: 0, required: 0, completedRequired: 0 }
    const required = checklist.steps.filter(s => s.enforcement === 'REQUIRED')
    const completedRequired = required.filter(s => s.status === 'PASSED' || s.status === 'SIGNED_OFF')
    const allCompleted = checklist.steps.filter(s =>
      s.status === 'PASSED' || s.status === 'SIGNED_OFF' || s.status === 'SKIPPED'
    )
    return {
      completed: allCompleted.length,
      total: checklist.steps.length,
      required: required.length,
      completedRequired: completedRequired.length,
    }
  }, [checklist])

  const handleSignOff = useCallback(async (stepId: string) => {
    await signOffStep(stepId)
    refetch()
  }, [signOffStep, refetch])

  const handleVerify = useCallback(async (stepId: string) => {
    await runAutoVerification(stepId)
    refetch()
  }, [runAutoVerification, refetch])

  const handleSkip = useCallback(async (stepId: string) => {
    await skipStep(stepId)
    refetch()
  }, [skipStep, refetch])

  const handleRunAllChecks = useCallback(async () => {
    if (!checklist) return
    await runAllAutoChecks(checklist.id)
    refetch()
  }, [checklist, runAllAutoChecks, refetch])

  const handleCreateChecklist = useCallback(async () => {
    await createChecklist(periodId)
    refetch()
  }, [createChecklist, periodId, refetch])

  // Loading state
  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center gap-2 text-stone-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading checklist...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  // No checklist yet — offer to create
  if (!checklist) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">
            <Shield className="h-10 w-10 mx-auto mb-3 text-stone-300 dark:text-stone-600" />
            <h3 className="font-medium text-stone-900 dark:text-stone-100 mb-1">
              No close checklist for this period
            </h3>
            <p className="text-sm text-stone-500 dark:text-stone-400 mb-4">
              Create a checklist to track the close process step by step.
            </p>
            <Button onClick={handleCreateChecklist} disabled={isCreating}>
              {isCreating ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Shield className="h-4 w-4 mr-2" />
              )}
              Create Close Checklist
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const progressPct = progress.required > 0
    ? Math.round((progress.completedRequired / progress.required) * 100)
    : 0

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-4 w-4" />
            AR Close Checklist
            {periodLabel && (
              <span className="text-sm font-normal text-stone-500 dark:text-stone-400">
                — {periodLabel}
              </span>
            )}
          </CardTitle>
          <div className="flex items-center gap-3">
            <span className={cn(
              'text-xs px-2 py-0.5 rounded-full font-medium',
              checklist.status === 'COMPLETED'
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'
                : checklist.status === 'IN_PROGRESS'
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400'
                  : 'bg-stone-100 text-stone-600 dark:bg-stone-700 dark:text-stone-300'
            )}>
              {checklist.status.replace('_', ' ')}
            </span>
            <span className="text-xs text-stone-500 dark:text-stone-400">
              {progress.completedRequired}/{progress.required} required
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-3">
          <div className="h-2 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full transition-all duration-500 rounded-full',
                progressPct === 100 ? 'bg-emerald-500' : 'bg-amber-500'
              )}
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pt-0">
        {/* Phase Accordions */}
        {phases.map(({ phase, steps }) => (
          <PhaseAccordion
            key={phase}
            phase={phase}
            steps={steps}
            isExpanded={effectiveExpanded.has(phase)}
            onToggle={() => togglePhase(phase)}
            onSignOff={handleSignOff}
            onVerify={handleVerify}
            onSkip={handleSkip}
            isSigningOff={isSigningOff}
            isVerifying={isVerifying}
            isSkipping={isSkipping}
          />
        ))}

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-stone-200 dark:border-stone-700">
          <Button
            variant="outline"
            onClick={handleRunAllChecks}
            disabled={isRunningAllChecks}
          >
            {isRunningAllChecks ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Play className="h-4 w-4 mr-2" />
            )}
            Run All Auto-Checks
          </Button>

          <div className="flex items-center gap-3">
            {canCloseResult && !canCloseResult.canClose && canCloseResult.blockingSteps.length > 0 && (
              <div className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                <AlertTriangle className="h-3.5 w-3.5" />
                {canCloseResult.blockingSteps.length} blocking step{canCloseResult.blockingSteps.length !== 1 ? 's' : ''}
              </div>
            )}
            <Button
              onClick={onPeriodClose}
              disabled={!canCloseResult?.canClose || isCheckingClose}
            >
              {isCheckingClose ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Lock className="h-4 w-4 mr-2" />
              )}
              Close Period
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
