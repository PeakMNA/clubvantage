'use client'

import { useState, useMemo } from 'react'
import { cn } from '@clubvantage/ui'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Button,
  Input,
  Label,
} from '@clubvantage/ui'
import {
  Calendar,
  ChevronRight,
  ChevronLeft,
  History,
  Sparkles,
  FileText,
  Check,
  AlertCircle,
  Loader2,
} from 'lucide-react'

export interface PeriodInitWizardProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onComplete: (data: InitWizardResult) => Promise<void>
  hasExistingData?: boolean
  existingProfileCount?: number
  isSubmitting?: boolean
}

export interface InitWizardResult {
  initializationType: 'fresh' | 'catchup'
  // For fresh start
  periodYear?: number
  periodMonth?: number
  // For catch-up
  catchUpStartDate?: string
  catchUpEndDate?: string
  catchUpLabel?: string
  // First regular period after catch-up
  firstPeriodYear?: number
  firstPeriodMonth?: number
}

type WizardStep = 'welcome' | 'init-type' | 'fresh-setup' | 'catchup-setup' | 'confirm'

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

function StepIndicator({ steps, currentStep }: { steps: string[]; currentStep: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-6">
      {steps.map((_, idx) => (
        <div
          key={idx}
          className={cn(
            'w-2 h-2 rounded-full transition-colors',
            idx === currentStep
              ? 'bg-amber-500'
              : idx < currentStep
                ? 'bg-emerald-500'
                : 'bg-stone-200 dark:bg-stone-700'
          )}
        />
      ))}
    </div>
  )
}

export function PeriodInitWizard({
  open,
  onOpenChange,
  onComplete,
  hasExistingData = false,
  existingProfileCount = 0,
  isSubmitting = false,
}: PeriodInitWizardProps) {
  const [step, setStep] = useState<WizardStep>('welcome')
  const [initType, setInitType] = useState<'fresh' | 'catchup' | null>(null)

  // Fresh start form state
  const currentDate = new Date()
  const [freshYear, setFreshYear] = useState(currentDate.getFullYear())
  const [freshMonth, setFreshMonth] = useState(currentDate.getMonth() + 1)

  // Catch-up form state
  const defaultCatchUpStart = new Date(currentDate.getFullYear(), 0, 1) // Jan 1st
  const defaultCatchUpEnd = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0) // End of last month
  const [catchUpStartDate, setCatchUpStartDate] = useState(
    defaultCatchUpStart.toISOString().split('T')[0] ?? ''
  )
  const [catchUpEndDate, setCatchUpEndDate] = useState(
    defaultCatchUpEnd.toISOString().split('T')[0] ?? ''
  )
  const [catchUpLabel, setCatchUpLabel] = useState('Historical Catch-up Period')
  const [firstRegularYear, setFirstRegularYear] = useState(currentDate.getFullYear())
  const [firstRegularMonth, setFirstRegularMonth] = useState(currentDate.getMonth() + 1)

  const steps = useMemo(() => {
    const base = ['welcome', 'init-type']
    if (initType === 'fresh') {
      return [...base, 'fresh-setup', 'confirm']
    } else if (initType === 'catchup') {
      return [...base, 'catchup-setup', 'confirm']
    }
    return base
  }, [initType])

  const currentStepIndex = steps.indexOf(step)

  const handleNext = () => {
    const nextIndex = currentStepIndex + 1
    if (nextIndex < steps.length) {
      setStep(steps[nextIndex] as WizardStep)
    }
  }

  const handleBack = () => {
    const prevIndex = currentStepIndex - 1
    if (prevIndex >= 0) {
      setStep(steps[prevIndex] as WizardStep)
    }
  }

  const handleComplete = async () => {
    const result: InitWizardResult = {
      initializationType: initType!,
    }

    if (initType === 'fresh') {
      result.periodYear = freshYear
      result.periodMonth = freshMonth
    } else if (initType === 'catchup') {
      result.catchUpStartDate = catchUpStartDate
      result.catchUpEndDate = catchUpEndDate
      result.catchUpLabel = catchUpLabel
      result.firstPeriodYear = firstRegularYear
      result.firstPeriodMonth = firstRegularMonth
    }

    await onComplete(result)
  }

  const renderStep = () => {
    switch (step) {
      case 'welcome':
        return (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="h-8 w-8 text-amber-600 dark:text-amber-400" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Welcome to AR Statements</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Let's set up your statement periods. This wizard will guide you through the
              initialization process to get your billing cycles configured correctly.
            </p>
            {hasExistingData && existingProfileCount > 0 && (
              <div className="mt-6 p-4 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div className="text-left">
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-200">
                      Existing AR data detected
                    </p>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                      We found {existingProfileCount.toLocaleString()} AR profiles with balances.
                      You can create a catch-up period to consolidate historical data.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )

      case 'init-type':
        return (
          <div className="py-4">
            <h2 className="text-lg font-semibold mb-1 text-center">Choose Setup Type</h2>
            <p className="text-sm text-muted-foreground mb-6 text-center">
              How would you like to initialize your statement periods?
            </p>
            <div className="grid gap-4">
              <button
                type="button"
                onClick={() => {
                  setInitType('fresh')
                  handleNext()
                }}
                className={cn(
                  'flex items-start gap-4 p-4 rounded-lg border-2 text-left transition-colors',
                  'hover:border-amber-500 hover:bg-amber-50/50 dark:hover:bg-amber-500/10',
                  initType === 'fresh'
                    ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-500/10'
                    : 'border-stone-200 dark:border-stone-700'
                )}
              >
                <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <Calendar className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-medium">Fresh Start</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Start with a new billing period. Best for clubs just beginning to use AR statements
                    or starting a new fiscal year.
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 text-stone-400 mt-2 flex-shrink-0" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setInitType('catchup')
                  handleNext()
                }}
                className={cn(
                  'flex items-start gap-4 p-4 rounded-lg border-2 text-left transition-colors',
                  'hover:border-amber-500 hover:bg-amber-50/50 dark:hover:bg-amber-500/10',
                  initType === 'catchup'
                    ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-500/10'
                    : 'border-stone-200 dark:border-stone-700'
                )}
              >
                <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <History className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="font-medium">Catch-up Period</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Create a catch-up period for historical data before starting regular billing cycles.
                    Consolidates all prior balances.
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 text-stone-400 mt-2 flex-shrink-0" />
              </button>
            </div>
          </div>
        )

      case 'fresh-setup':
        return (
          <div className="py-4">
            <h2 className="text-lg font-semibold mb-1 text-center">Configure First Period</h2>
            <p className="text-sm text-muted-foreground mb-6 text-center">
              Select when your first billing period should start
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fresh-year">Year</Label>
                <Input
                  id="fresh-year"
                  type="number"
                  min={2020}
                  max={2030}
                  value={freshYear}
                  onChange={(e) => setFreshYear(parseInt(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="fresh-month">Month</Label>
                <select
                  id="fresh-month"
                  value={freshMonth}
                  onChange={(e) => setFreshMonth(parseInt(e.target.value))}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                >
                  {MONTHS.map((month, idx) => (
                    <option key={month} value={idx + 1}>
                      {month}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-4 p-3 rounded-lg bg-stone-50 dark:bg-stone-800/50">
              <div className="flex items-center gap-2 text-sm">
                <FileText className="h-4 w-4 text-stone-500" />
                <span>
                  First period: <strong>{MONTHS[freshMonth - 1]} {freshYear}</strong>
                </span>
              </div>
            </div>
          </div>
        )

      case 'catchup-setup':
        return (
          <div className="py-4">
            <h2 className="text-lg font-semibold mb-1 text-center">Configure Catch-up Period</h2>
            <p className="text-sm text-muted-foreground mb-6 text-center">
              Define the historical period to consolidate all prior balances
            </p>
            <div className="space-y-4">
              <div>
                <Label htmlFor="catchup-label">Period Label</Label>
                <Input
                  id="catchup-label"
                  value={catchUpLabel}
                  onChange={(e) => setCatchUpLabel(e.target.value)}
                  placeholder="e.g., Historical Catch-up Period"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="catchup-start">Start Date</Label>
                  <Input
                    id="catchup-start"
                    type="date"
                    value={catchUpStartDate}
                    onChange={(e) => setCatchUpStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="catchup-end">End Date</Label>
                  <Input
                    id="catchup-end"
                    type="date"
                    value={catchUpEndDate}
                    onChange={(e) => setCatchUpEndDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="pt-4 border-t">
                <Label className="text-sm font-medium mb-3 block">
                  First Regular Period (after catch-up)
                </Label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="first-regular-year" className="text-xs text-muted-foreground">
                      Year
                    </Label>
                    <Input
                      id="first-regular-year"
                      type="number"
                      min={2020}
                      max={2030}
                      value={firstRegularYear}
                      onChange={(e) => setFirstRegularYear(parseInt(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="first-regular-month" className="text-xs text-muted-foreground">
                      Month
                    </Label>
                    <select
                      id="first-regular-month"
                      value={firstRegularMonth}
                      onChange={(e) => setFirstRegularMonth(parseInt(e.target.value))}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background"
                    >
                      {MONTHS.map((month, idx) => (
                        <option key={month} value={idx + 1}>
                          {month}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case 'confirm':
        return (
          <div className="py-4">
            <h2 className="text-lg font-semibold mb-1 text-center">Confirm Setup</h2>
            <p className="text-sm text-muted-foreground mb-6 text-center">
              Review your configuration before creating periods
            </p>

            <div className="space-y-3">
              {initType === 'fresh' ? (
                <div className="p-4 rounded-lg border bg-emerald-50/50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    <span className="font-medium text-emerald-900 dark:text-emerald-200">
                      Fresh Start
                    </span>
                  </div>
                  <p className="text-sm text-emerald-800 dark:text-emerald-300">
                    First period: <strong>{MONTHS[freshMonth - 1]} {freshYear}</strong>
                  </p>
                </div>
              ) : (
                <>
                  <div className="p-4 rounded-lg border bg-purple-50/50 dark:bg-purple-500/10 border-purple-200 dark:border-purple-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <History className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      <span className="font-medium text-purple-900 dark:text-purple-200">
                        Catch-up Period
                      </span>
                    </div>
                    <p className="text-sm text-purple-800 dark:text-purple-300">
                      <strong>{catchUpLabel}</strong><br />
                      {new Date(catchUpStartDate).toLocaleDateString()} -{' '}
                      {new Date(catchUpEndDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg border bg-stone-50 dark:bg-stone-800/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-5 w-5 text-stone-500" />
                      <span className="font-medium">Then</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Regular periods starting: <strong>{MONTHS[firstRegularMonth - 1]} {firstRegularYear}</strong>
                    </p>
                  </div>
                </>
              )}
            </div>

            <div className="mt-6 p-3 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20">
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5" />
                <p className="text-sm text-amber-800 dark:text-amber-300">
                  After setup, you can generate statements and close periods as normal.
                  The system will auto-generate subsequent periods based on your billing cycle settings.
                </p>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-amber-500" />
            Period Initialization
          </DialogTitle>
        </DialogHeader>

        <StepIndicator steps={steps} currentStep={currentStepIndex} />

        {renderStep()}

        <DialogFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStepIndex === 0 || isSubmitting}
            className={cn(currentStepIndex === 0 && 'invisible')}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>

          {step === 'confirm' ? (
            <Button onClick={handleComplete} disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Check className="h-4 w-4 mr-2" />
              )}
              Complete Setup
            </Button>
          ) : step === 'welcome' ? (
            <Button onClick={handleNext}>
              Get Started
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : step === 'init-type' ? (
            <div /> // Selection happens via card clicks
          ) : (
            <Button onClick={handleNext}>
              Continue
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
