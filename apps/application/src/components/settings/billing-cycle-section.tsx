'use client'

import { useState, useEffect } from 'react'
import { Loader2, Check, Calendar, Clock, Receipt, AlertCircle, Info } from 'lucide-react'
import { Button, cn } from '@clubvantage/ui'
import { Input } from '@clubvantage/ui'
import { Label } from '@clubvantage/ui'
import { Checkbox } from '@clubvantage/ui'
import {
  useClubBillingSettings,
  type BillingFrequency,
  type BillingTiming,
  type BillingAlignment,
  type LateFeeType,
  type ProrationMethod,
  type UpdateClubBillingSettingsInput,
} from '@/hooks/use-billing-settings'

interface BillingCycleSectionProps {
  id: string
}

const FREQUENCY_OPTIONS: { value: BillingFrequency; label: string; description: string }[] = [
  { value: 'MONTHLY', label: 'Monthly', description: 'Bill every month' },
  { value: 'QUARTERLY', label: 'Quarterly', description: 'Bill every 3 months' },
  { value: 'SEMI_ANNUAL', label: 'Semi-Annual', description: 'Bill every 6 months' },
  { value: 'ANNUAL', label: 'Annual', description: 'Bill once per year' },
]

const TIMING_OPTIONS: { value: BillingTiming; label: string; description: string }[] = [
  { value: 'ADVANCE', label: 'In Advance', description: 'Bill at the start of each period' },
  { value: 'ARREARS', label: 'In Arrears', description: 'Bill at the end of each period' },
]

const ALIGNMENT_OPTIONS: { value: BillingAlignment; label: string; description: string }[] = [
  { value: 'CALENDAR', label: 'Calendar', description: 'Align to calendar months (1st of month)' },
  { value: 'ANNIVERSARY', label: 'Anniversary', description: 'Based on member join date' },
  { value: 'CUSTOM', label: 'Custom', description: 'Use custom billing day' },
]

const LATE_FEE_TYPE_OPTIONS: { value: LateFeeType; label: string }[] = [
  { value: 'PERCENTAGE', label: 'Percentage' },
  { value: 'FIXED', label: 'Fixed Amount' },
  { value: 'TIERED', label: 'Tiered' },
]

const PRORATION_OPTIONS: { value: ProrationMethod; label: string; description: string }[] = [
  { value: 'DAILY', label: 'Daily', description: 'Prorate by exact days' },
  { value: 'HALF_MONTH', label: 'Half Month', description: 'Round to half-month increments' },
  { value: 'FULL_MONTH', label: 'Full Month', description: 'Round to full months' },
  { value: 'NONE', label: 'None', description: 'No proration applied' },
]

export function BillingCycleSection({ id }: BillingCycleSectionProps) {
  const { settings, isLoading, updateSettings, isUpdating } = useClubBillingSettings()
  const [localSettings, setLocalSettings] = useState<UpdateClubBillingSettingsInput>({})
  const [showSuccess, setShowSuccess] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  // Initialize local settings when remote settings load
  useEffect(() => {
    if (settings) {
      setLocalSettings({
        defaultFrequency: settings.defaultFrequency,
        defaultTiming: settings.defaultTiming,
        defaultAlignment: settings.defaultAlignment,
        defaultBillingDay: settings.defaultBillingDay,
        invoiceGenerationLead: settings.invoiceGenerationLead,
        invoiceDueDays: settings.invoiceDueDays,
        gracePeriodDays: settings.gracePeriodDays,
        lateFeeType: settings.lateFeeType,
        lateFeeAmount: settings.lateFeeAmount,
        lateFeePercentage: settings.lateFeePercentage,
        maxLateFee: settings.maxLateFee,
        autoApplyLateFee: settings.autoApplyLateFee,
        prorateNewMembers: settings.prorateNewMembers,
        prorateChanges: settings.prorateChanges,
        prorationMethod: settings.prorationMethod,
      })
      setHasChanges(false)
    }
  }, [settings])

  const updateField = <K extends keyof UpdateClubBillingSettingsInput>(
    key: K,
    value: UpdateClubBillingSettingsInput[K]
  ) => {
    setLocalSettings((prev) => ({ ...prev, [key]: value }))
    setHasChanges(true)
  }

  const handleSave = async () => {
    try {
      await updateSettings(localSettings)
      setShowSuccess(true)
      setHasChanges(false)
      setTimeout(() => setShowSuccess(false), 2000)
    } catch (error) {
      console.error('Failed to save billing settings:', error)
    }
  }

  // Get display values with fallbacks
  const frequency = localSettings.defaultFrequency ?? 'MONTHLY'
  const timing = localSettings.defaultTiming ?? 'ADVANCE'
  const alignment = localSettings.defaultAlignment ?? 'CALENDAR'
  const billingDay = localSettings.defaultBillingDay ?? 1
  const invoiceGenerationLead = localSettings.invoiceGenerationLead ?? 5
  const invoiceDueDays = localSettings.invoiceDueDays ?? 15
  const gracePeriodDays = localSettings.gracePeriodDays ?? 15
  const lateFeeType = localSettings.lateFeeType ?? 'PERCENTAGE'
  const lateFeeAmount = localSettings.lateFeeAmount ?? 0
  const lateFeePercentage = localSettings.lateFeePercentage ?? 1.5
  const maxLateFee = localSettings.maxLateFee ?? null
  const autoApplyLateFee = localSettings.autoApplyLateFee ?? false
  const prorateNewMembers = localSettings.prorateNewMembers ?? true
  const prorateChanges = localSettings.prorateChanges ?? true
  const prorationMethod = localSettings.prorationMethod ?? 'DAILY'

  if (isLoading) {
    return (
      <section id={id} className="border rounded-xl p-6 space-y-6 scroll-mt-24 shadow-lg shadow-stone-200/30 dark:shadow-none">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
          <span className="ml-2 text-muted-foreground">Loading billing settings...</span>
        </div>
      </section>
    )
  }

  return (
    <section id={id} className="border rounded-xl p-6 space-y-6 scroll-mt-24 shadow-lg shadow-stone-200/30 dark:shadow-none">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Calendar className="h-5 w-5 text-amber-500" />
          Billing Cycle Configuration
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Configure default billing frequency, timing, and cycle settings for all members
        </p>
      </div>

      {/* Billing Frequency */}
      <div className="space-y-4">
        <h3 className="font-medium flex items-center gap-2">
          <Clock className="h-4 w-4 text-stone-500 dark:text-stone-400" />
          Billing Frequency
        </h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {FREQUENCY_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => updateField('defaultFrequency', option.value)}
              className={cn(
                'flex flex-col items-start p-4 rounded-lg border-2 transition-all text-left',
                frequency === option.value
                  ? 'border-amber-500 bg-amber-50 dark:bg-amber-500/20 shadow-md'
                  : 'border-stone-200 dark:border-stone-700 hover:border-stone-300 dark:hover:border-stone-600 hover:bg-stone-50 dark:hover:bg-stone-800'
              )}
            >
              <span className={cn(
                'font-medium',
                frequency === option.value ? 'text-amber-700 dark:text-amber-400' : 'text-stone-900 dark:text-stone-100'
              )}>
                {option.label}
              </span>
              <span className="text-xs text-muted-foreground mt-1">{option.description}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Billing Timing */}
      <div className="space-y-4 pt-4 border-t">
        <h3 className="font-medium">Billing Timing</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {TIMING_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => updateField('defaultTiming', option.value)}
              className={cn(
                'flex flex-col items-start p-4 rounded-lg border-2 transition-all text-left',
                timing === option.value
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/20 shadow-md'
                  : 'border-stone-200 dark:border-stone-700 hover:border-stone-300 dark:hover:border-stone-600 hover:bg-stone-50 dark:hover:bg-stone-800'
              )}
            >
              <span className={cn(
                'font-medium',
                timing === option.value ? 'text-emerald-700 dark:text-emerald-400' : 'text-stone-900 dark:text-stone-100'
              )}>
                {option.label}
              </span>
              <span className="text-xs text-muted-foreground mt-1">{option.description}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Cycle Alignment */}
      <div className="space-y-4 pt-4 border-t">
        <h3 className="font-medium">Cycle Alignment</h3>
        <div className="grid gap-3 sm:grid-cols-3">
          {ALIGNMENT_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => updateField('defaultAlignment', option.value)}
              className={cn(
                'flex flex-col items-start p-4 rounded-lg border-2 transition-all text-left',
                alignment === option.value
                  ? 'border-amber-500 bg-amber-50 dark:bg-amber-500/20 shadow-md'
                  : 'border-stone-200 dark:border-stone-700 hover:border-stone-300 dark:hover:border-stone-600 hover:bg-stone-50 dark:hover:bg-stone-800'
              )}
            >
              <span className={cn(
                'font-medium',
                alignment === option.value ? 'text-amber-700 dark:text-amber-400' : 'text-stone-900 dark:text-stone-100'
              )}>
                {option.label}
              </span>
              <span className="text-xs text-muted-foreground mt-1">{option.description}</span>
            </button>
          ))}
        </div>

        {/* Custom Billing Day - only show when alignment is CUSTOM */}
        {alignment === 'CUSTOM' && (
          <div className="ml-4 p-4 bg-stone-50 dark:bg-stone-800 rounded-lg border border-stone-200 dark:border-stone-700">
            <Label className="text-sm font-medium">Custom Billing Day</Label>
            <div className="flex items-center gap-2 mt-2">
              <Input
                type="number"
                min={1}
                max={28}
                value={billingDay}
                onChange={(e) => updateField('defaultBillingDay', parseInt(e.target.value) || 1)}
                className="w-20"
              />
              <span className="text-sm text-muted-foreground">of each billing period</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
              <Info className="h-3 w-3" />
              Days 1-28 are supported to ensure consistency across all months
            </p>
          </div>
        )}
      </div>

      {/* Invoice Generation Settings */}
      <div className="space-y-4 pt-4 border-t">
        <h3 className="font-medium flex items-center gap-2">
          <Receipt className="h-4 w-4 text-stone-500 dark:text-stone-400" />
          Invoice Generation
        </h3>
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <Label className="text-sm">Generation Lead Time</Label>
            <div className="flex items-center gap-2 mt-1">
              <Input
                type="number"
                min={0}
                max={30}
                value={invoiceGenerationLead}
                onChange={(e) => updateField('invoiceGenerationLead', parseInt(e.target.value) || 0)}
                className="w-20"
              />
              <span className="text-sm text-muted-foreground">days before</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Days before billing date to generate invoice</p>
          </div>
          <div>
            <Label className="text-sm">Payment Due</Label>
            <div className="flex items-center gap-2 mt-1">
              <Input
                type="number"
                min={0}
                max={90}
                value={invoiceDueDays}
                onChange={(e) => updateField('invoiceDueDays', parseInt(e.target.value) || 0)}
                className="w-20"
              />
              <span className="text-sm text-muted-foreground">days after</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Days after invoice date until due</p>
          </div>
          <div>
            <Label className="text-sm">Grace Period</Label>
            <div className="flex items-center gap-2 mt-1">
              <Input
                type="number"
                min={0}
                max={60}
                value={gracePeriodDays}
                onChange={(e) => updateField('gracePeriodDays', parseInt(e.target.value) || 0)}
                className="w-20"
              />
              <span className="text-sm text-muted-foreground">days</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Additional days before late fees apply</p>
          </div>
        </div>
      </div>

      {/* Late Fee Configuration */}
      <div className="space-y-4 pt-4 border-t">
        <h3 className="font-medium flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-stone-500 dark:text-stone-400" />
          Late Fees
        </h3>
        <label className="flex items-center gap-2">
          <Checkbox
            checked={autoApplyLateFee}
            onCheckedChange={(checked) => updateField('autoApplyLateFee', checked as boolean)}
          />
          <span className="text-sm">Automatically apply late fees after grace period</span>
        </label>

        {autoApplyLateFee && (
          <div className="ml-6 space-y-4 p-4 bg-stone-50 dark:bg-stone-800 rounded-lg border border-stone-200 dark:border-stone-700">
            {/* Fee Type Selection */}
            <div className="flex gap-4">
              {LATE_FEE_TYPE_OPTIONS.map((option) => (
                <label key={option.value} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="lateFeeType"
                    checked={lateFeeType === option.value}
                    onChange={() => updateField('lateFeeType', option.value)}
                    className="h-4 w-4 text-amber-500 focus:ring-amber-500"
                  />
                  <span className="text-sm">{option.label}</span>
                </label>
              ))}
            </div>

            {/* Fee Amount based on type */}
            <div className="grid gap-4 sm:grid-cols-2">
              {lateFeeType === 'PERCENTAGE' && (
                <div>
                  <Label className="text-sm">Percentage Rate</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      type="number"
                      step="0.1"
                      min={0}
                      max={25}
                      value={lateFeePercentage}
                      onChange={(e) => updateField('lateFeePercentage', parseFloat(e.target.value) || 0)}
                      className="w-24"
                    />
                    <span className="text-sm text-muted-foreground">% per month</span>
                  </div>
                </div>
              )}
              {lateFeeType === 'FIXED' && (
                <div>
                  <Label className="text-sm">Fixed Amount</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      type="number"
                      min={0}
                      value={lateFeeAmount ?? 0}
                      onChange={(e) => updateField('lateFeeAmount', parseFloat(e.target.value) || 0)}
                      className="w-24"
                    />
                    <span className="text-sm text-muted-foreground">THB</span>
                  </div>
                </div>
              )}
              {lateFeeType === 'TIERED' && (
                <div className="sm:col-span-2">
                  <p className="text-sm text-muted-foreground">
                    Tiered late fees allow different rates based on how overdue the balance is.
                    Configure tiers in the advanced settings.
                  </p>
                </div>
              )}
            </div>

            {/* Maximum Late Fee Cap */}
            <div className="flex items-center gap-2">
              <Checkbox
                checked={maxLateFee !== null}
                onCheckedChange={(checked) => updateField('maxLateFee', checked ? 5000 : null)}
              />
              <span className="text-sm">Cap total late fees at</span>
              {maxLateFee !== null && (
                <>
                  <Input
                    type="number"
                    min={0}
                    value={maxLateFee}
                    onChange={(e) => updateField('maxLateFee', parseFloat(e.target.value) || 0)}
                    className="w-24"
                  />
                  <span className="text-sm text-muted-foreground">THB</span>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Proration Settings */}
      <div className="space-y-4 pt-4 border-t">
        <h3 className="font-medium">Proration Settings</h3>
        <div className="space-y-3">
          <label className="flex items-center gap-2">
            <Checkbox
              checked={prorateNewMembers}
              onCheckedChange={(checked) => updateField('prorateNewMembers', checked as boolean)}
            />
            <span className="text-sm">Prorate first billing period for new members</span>
          </label>
          <label className="flex items-center gap-2">
            <Checkbox
              checked={prorateChanges}
              onCheckedChange={(checked) => updateField('prorateChanges', checked as boolean)}
            />
            <span className="text-sm">Prorate mid-cycle membership changes</span>
          </label>
        </div>

        {(prorateNewMembers || prorateChanges) && (
          <div className="ml-6">
            <Label className="text-sm font-medium">Proration Method</Label>
            <div className="grid gap-2 mt-2 sm:grid-cols-2 lg:grid-cols-4">
              {PRORATION_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => updateField('prorationMethod', option.value)}
                  className={cn(
                    'flex flex-col items-start p-3 rounded-lg border transition-all text-left',
                    prorationMethod === option.value
                      ? 'border-amber-500 bg-amber-50 dark:bg-amber-500/20'
                      : 'border-stone-200 dark:border-stone-700 hover:border-stone-300 dark:hover:border-stone-600 hover:bg-stone-50 dark:hover:bg-stone-800'
                  )}
                >
                  <span className={cn(
                    'text-sm font-medium',
                    prorationMethod === option.value ? 'text-amber-700 dark:text-amber-400' : 'text-stone-900 dark:text-stone-100'
                  )}>
                    {option.label}
                  </span>
                  <span className="text-xs text-muted-foreground mt-0.5">{option.description}</span>
                </button>
              ))}
            </div>
          </div>
        )}
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
