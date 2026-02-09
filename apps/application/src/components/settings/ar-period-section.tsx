'use client'

import { useState, useEffect } from 'react'
import { Loader2, Check, FileText, Clock, Info, AlertTriangle } from 'lucide-react'
import { Button, cn } from '@clubvantage/ui'
import { Input } from '@clubvantage/ui'
import { Label } from '@clubvantage/ui'
import { Checkbox } from '@clubvantage/ui'
import {
  useARPeriodSettings,
  useUpdateARPeriodSettings,
  type ARCycleType,
  type ARCloseBehavior,
  type UpdateARPeriodSettingsInput,
} from '@/hooks/use-ar-statements'
import {
  useClubBillingSettings,
  type BillingCycleMode,
  type FinancialPeriodType,
  type UpdateClubBillingSettingsInput,
} from '@/hooks/use-billing-settings'

interface ARPeriodSectionProps {
  id: string
}

const CYCLE_MODE_OPTIONS: { value: BillingCycleMode; label: string; description: string }[] = [
  { value: 'CLUB_CYCLE', label: 'Club Cycle', description: 'All members share the same AR period dates' },
  { value: 'MEMBER_CYCLE', label: 'Member Cycle', description: "Each member's cycle is based on their join date" },
]

const CYCLE_TYPE_OPTIONS: { value: ARCycleType; label: string; description: string }[] = [
  { value: 'CALENDAR_MONTH', label: 'Calendar Month', description: '1st to last day of month' },
  { value: 'ROLLING_30', label: 'Rolling 30 Days', description: '30 days from cycle start' },
  { value: 'CUSTOM', label: 'Custom', description: 'Custom day-of-month cycle' },
]

const CLOSE_BEHAVIOR_OPTIONS: { value: ARCloseBehavior; label: string; description: string }[] = [
  { value: 'MANUAL', label: 'Manual', description: 'Staff manually closes each period' },
  { value: 'AUTO_AFTER_FINAL_RUN', label: 'After Final Run', description: 'Auto-close after final statement run' },
  { value: 'AUTO_ON_CUTOFF', label: 'On Cutoff Date', description: 'Auto-close when cutoff date is reached' },
]

const FINANCIAL_PERIOD_OPTIONS: { value: FinancialPeriodType; label: string; description: string }[] = [
  { value: 'CALENDAR_MONTH', label: 'Calendar Month', description: 'Standard calendar months' },
  { value: 'CUSTOM', label: 'Custom', description: 'Custom financial period dates' },
]

export function ARPeriodSection({ id }: ARPeriodSectionProps) {
  const { settings: arSettings, isLoading: arLoading } = useARPeriodSettings()
  const { updateSettings: updateArSettings, isLoading: arUpdating } = useUpdateARPeriodSettings()
  const { settings: billingSettings, isLoading: billingLoading, updateSettings: updateBillingSettings, isUpdating: billingUpdating } = useClubBillingSettings()

  const [localArSettings, setLocalArSettings] = useState<UpdateARPeriodSettingsInput>({})
  const [localCycleMode, setLocalCycleMode] = useState<Pick<UpdateClubBillingSettingsInput, 'billingCycleMode' | 'clubCycleClosingDay' | 'financialPeriodType'>>({})
  const [showSuccess, setShowSuccess] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [cycleModeChanged, setCycleModeChanged] = useState(false)

  // Initialize AR period settings
  useEffect(() => {
    if (arSettings) {
      setLocalArSettings({
        arCycleType: arSettings.arCycleType,
        arCustomCycleStartDay: arSettings.arCustomCycleStartDay,
        arCutoffDays: arSettings.arCutoffDays,
        arCloseBehavior: arSettings.arCloseBehavior,
        arAutoGenerateNext: arSettings.arAutoGenerateNext,
      })
      setHasChanges(false)
    }
  }, [arSettings])

  // Initialize billing cycle mode settings
  useEffect(() => {
    if (billingSettings) {
      setLocalCycleMode({
        billingCycleMode: billingSettings.billingCycleMode,
        clubCycleClosingDay: billingSettings.clubCycleClosingDay,
        financialPeriodType: billingSettings.financialPeriodType,
      })
    }
  }, [billingSettings])

  const updateArField = <K extends keyof UpdateARPeriodSettingsInput>(
    key: K,
    value: UpdateARPeriodSettingsInput[K]
  ) => {
    setLocalArSettings((prev) => ({ ...prev, [key]: value }))
    setHasChanges(true)
  }

  const updateCycleModeField = <K extends keyof typeof localCycleMode>(
    key: K,
    value: (typeof localCycleMode)[K]
  ) => {
    setLocalCycleMode((prev) => ({ ...prev, [key]: value }))
    setHasChanges(true)
    if (key === 'billingCycleMode') {
      setCycleModeChanged(true)
    }
  }

  const handleSave = async () => {
    try {
      // Save both AR period settings and billing cycle mode in parallel
      await Promise.all([
        updateArSettings(localArSettings),
        updateBillingSettings(localCycleMode),
      ])
      setShowSuccess(true)
      setHasChanges(false)
      setCycleModeChanged(false)
      setTimeout(() => setShowSuccess(false), 2000)
    } catch (error) {
      console.error('Failed to save AR period settings:', error)
    }
  }

  const isLoading = arLoading || billingLoading
  const isUpdating = arUpdating || billingUpdating

  // Get display values with fallbacks
  const cycleMode = localCycleMode.billingCycleMode ?? 'CLUB_CYCLE'
  const clubCycleClosingDay = localCycleMode.clubCycleClosingDay ?? 28
  const financialPeriodType = localCycleMode.financialPeriodType ?? 'CALENDAR_MONTH'
  const cycleType = localArSettings.arCycleType ?? 'CALENDAR_MONTH'
  const customCycleStartDay = localArSettings.arCustomCycleStartDay ?? 1
  const cutoffDays = localArSettings.arCutoffDays ?? 5
  const closeBehavior = localArSettings.arCloseBehavior ?? 'MANUAL'
  const autoGenerateNext = localArSettings.arAutoGenerateNext ?? true

  if (isLoading) {
    return (
      <section id={id} className="border rounded-xl p-6 space-y-6 scroll-mt-24 shadow-lg shadow-stone-200/30 dark:shadow-none">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
          <span className="ml-2 text-muted-foreground">Loading AR period settings...</span>
        </div>
      </section>
    )
  }

  return (
    <section id={id} className="border rounded-xl p-6 space-y-6 scroll-mt-24 shadow-lg shadow-stone-200/30 dark:shadow-none">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <FileText className="h-5 w-5 text-amber-500" />
          AR Statement Periods
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Configure billing cycle mode and how AR statement periods are generated and managed
        </p>
      </div>

      {/* Billing Cycle Mode */}
      <div className="space-y-4">
        <h3 className="font-medium flex items-center gap-2">
          <Clock className="h-4 w-4 text-stone-500 dark:text-stone-400" />
          Billing Cycle Mode
        </h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {CYCLE_MODE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => updateCycleModeField('billingCycleMode', option.value)}
              className={cn(
                'flex flex-col items-start p-4 rounded-lg border-2 transition-all text-left',
                cycleMode === option.value
                  ? 'border-amber-500 bg-amber-50 dark:bg-amber-500/20 shadow-md'
                  : 'border-stone-200 dark:border-stone-700 hover:border-stone-300 dark:hover:border-stone-600 hover:bg-stone-50 dark:hover:bg-stone-800'
              )}
            >
              <span className={cn(
                'font-medium',
                cycleMode === option.value ? 'text-amber-700 dark:text-amber-400' : 'text-stone-900 dark:text-stone-100'
              )}>
                {option.label}
              </span>
              <span className="text-xs text-muted-foreground mt-1">{option.description}</span>
            </button>
          ))}
        </div>

        {/* Warning when cycle mode is changed */}
        {cycleModeChanged && (
          <div className="p-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-lg flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
            <p className="text-sm text-amber-800 dark:text-amber-300">
              Changing billing cycle mode affects all future periods. Existing periods and statements are not affected.
            </p>
          </div>
        )}

        {/* Club Cycle: Closing Day */}
        {cycleMode === 'CLUB_CYCLE' && (
          <div className="ml-4 p-4 bg-stone-50 dark:bg-stone-800 rounded-lg border border-stone-200 dark:border-stone-700">
            <Label className="text-sm font-medium">Closing Day</Label>
            <div className="flex items-center gap-2 mt-2">
              <Input
                type="number"
                min={1}
                max={28}
                value={clubCycleClosingDay}
                onChange={(e) => updateCycleModeField('clubCycleClosingDay', parseInt(e.target.value) || 1)}
                className="w-20"
              />
              <span className="text-sm text-muted-foreground">of each month</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
              <Info className="h-3 w-3" />
              Period: {clubCycleClosingDay + 1 > 28 ? 1 : clubCycleClosingDay + 1}th to {clubCycleClosingDay}th (based on closing day {clubCycleClosingDay}th)
            </p>
          </div>
        )}

        {/* Member Cycle: Financial Period Type */}
        {cycleMode === 'MEMBER_CYCLE' && (
          <div className="ml-4 space-y-3">
            <div className="p-4 bg-stone-50 dark:bg-stone-800 rounded-lg border border-stone-200 dark:border-stone-700">
              <Label className="text-sm font-medium">Financial Period Type</Label>
              <p className="text-xs text-muted-foreground mt-1 mb-3">
                Each member&apos;s AR cycle is computed from their join date. The financial period is for accounting/close checklist purposes only.
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {FINANCIAL_PERIOD_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => updateCycleModeField('financialPeriodType', option.value)}
                    className={cn(
                      'flex flex-col items-start p-3 rounded-lg border transition-all text-left',
                      financialPeriodType === option.value
                        ? 'border-amber-500 bg-amber-50 dark:bg-amber-500/20'
                        : 'border-stone-200 dark:border-stone-700 hover:border-stone-300 dark:hover:border-stone-600'
                    )}
                  >
                    <span className={cn(
                      'text-sm font-medium',
                      financialPeriodType === option.value ? 'text-amber-700 dark:text-amber-400' : 'text-stone-900 dark:text-stone-100'
                    )}>
                      {option.label}
                    </span>
                    <span className="text-xs text-muted-foreground mt-0.5">{option.description}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Statement Period Cycle — only show in Club Cycle mode */}
      {cycleMode === 'CLUB_CYCLE' && (
        <div className="space-y-4 pt-4 border-t">
          <h3 className="font-medium flex items-center gap-2">
            Statement Period Cycle
          </h3>
          <div className="grid gap-3 sm:grid-cols-3">
            {CYCLE_TYPE_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => updateArField('arCycleType', option.value)}
                className={cn(
                  'flex flex-col items-start p-4 rounded-lg border-2 transition-all text-left',
                  cycleType === option.value
                    ? 'border-amber-500 bg-amber-50 dark:bg-amber-500/20 shadow-md'
                    : 'border-stone-200 dark:border-stone-700 hover:border-stone-300 dark:hover:border-stone-600 hover:bg-stone-50 dark:hover:bg-stone-800'
                )}
              >
                <span className={cn(
                  'font-medium',
                  cycleType === option.value ? 'text-amber-700 dark:text-amber-400' : 'text-stone-900 dark:text-stone-100'
                )}>
                  {option.label}
                </span>
                <span className="text-xs text-muted-foreground mt-1">{option.description}</span>
              </button>
            ))}
          </div>

          {/* Custom Cycle Start Day - only show when cycle type is CUSTOM */}
          {cycleType === 'CUSTOM' && (
            <div className="ml-4 p-4 bg-stone-50 dark:bg-stone-800 rounded-lg border border-stone-200 dark:border-stone-700">
              <Label className="text-sm font-medium">Custom Cycle Start Day</Label>
              <div className="flex items-center gap-2 mt-2">
                <Input
                  type="number"
                  min={1}
                  max={28}
                  value={customCycleStartDay}
                  onChange={(e) => updateArField('arCustomCycleStartDay', parseInt(e.target.value) || 1)}
                  className="w-20"
                />
                <span className="text-sm text-muted-foreground">of each month</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                <Info className="h-3 w-3" />
                Days 1-28 are supported to ensure consistency across all months (e.g., 25th to 24th)
              </p>
            </div>
          )}
        </div>
      )}

      {/* Cutoff Days */}
      <div className="space-y-4 pt-4 border-t">
        <h3 className="font-medium">Transaction Cutoff</h3>
        <div>
          <Label className="text-sm">Days after period end to include transactions</Label>
          <div className="flex items-center gap-2 mt-2">
            <Input
              type="number"
              min={0}
              max={15}
              value={cutoffDays}
              onChange={(e) => updateArField('arCutoffDays', parseInt(e.target.value) || 0)}
              className="w-20"
            />
            <span className="text-sm text-muted-foreground">days</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
            <Info className="h-3 w-3" />
            Transactions posted within this many days after period end will be included in the statement
          </p>
        </div>
      </div>

      {/* Close Behavior */}
      <div className="space-y-4 pt-4 border-t">
        <h3 className="font-medium">Period Close Behavior</h3>
        <p className="text-sm text-muted-foreground">
          Choose how AR periods are closed after statements are generated
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          {CLOSE_BEHAVIOR_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => updateArField('arCloseBehavior', option.value)}
              className={cn(
                'flex flex-col items-start p-4 rounded-lg border-2 transition-all text-left',
                closeBehavior === option.value
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/20 shadow-md'
                  : 'border-stone-200 dark:border-stone-700 hover:border-stone-300 dark:hover:border-stone-600 hover:bg-stone-50 dark:hover:bg-stone-800'
              )}
            >
              <span className={cn(
                'font-medium',
                closeBehavior === option.value ? 'text-emerald-700 dark:text-emerald-400' : 'text-stone-900 dark:text-stone-100'
              )}>
                {option.label}
              </span>
              <span className="text-xs text-muted-foreground mt-1">{option.description}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Auto Generate Next Period */}
      <div className="space-y-4 pt-4 border-t">
        <h3 className="font-medium">Period Generation</h3>
        <label className="flex items-center gap-2">
          <Checkbox
            checked={autoGenerateNext}
            onCheckedChange={(checked) => updateArField('arAutoGenerateNext', checked as boolean)}
          />
          <span className="text-sm">Automatically create next period when current period closes</span>
        </label>
        <p className="text-xs text-muted-foreground ml-6 flex items-center gap-1">
          <Info className="h-3 w-3" />
          When enabled, a new period will be automatically created with dates based on the cycle type
        </p>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-4 border-t">
        <Button
          onClick={handleSave}
          disabled={isUpdating || !hasChanges}
          className="bg-gradient-to-br from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:opacity-50"
        >
          {isUpdating ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : showSuccess ? (
            <Check className="h-4 w-4 mr-2" />
          ) : null}
          {showSuccess ? 'Saved' : 'Save Settings'}
        </Button>
      </div>
    </section>
  )
}
