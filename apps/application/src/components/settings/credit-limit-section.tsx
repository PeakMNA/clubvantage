'use client'

import { useState, useEffect } from 'react'
import { Loader2, Check, Shield, Info } from 'lucide-react'
import { Button } from '@clubvantage/ui'
import { Input } from '@clubvantage/ui'
import { Label } from '@clubvantage/ui'
import { Checkbox } from '@clubvantage/ui'
import {
  useClubBillingSettings,
  type UpdateClubBillingSettingsInput,
} from '@/hooks/use-billing-settings'

interface CreditLimitSectionProps {
  id: string
}

export function CreditLimitSection({ id }: CreditLimitSectionProps) {
  const { settings, isLoading, updateSettings, isUpdating } = useClubBillingSettings()
  const [localSettings, setLocalSettings] = useState<UpdateClubBillingSettingsInput>({})
  const [showSuccess, setShowSuccess] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [unlimitedCredit, setUnlimitedCredit] = useState(true)

  // Initialize local settings when remote settings load
  useEffect(() => {
    if (settings) {
      setLocalSettings({
        defaultCreditLimit: settings.defaultCreditLimit,
        creditAlertThreshold: settings.creditAlertThreshold,
        creditBlockThreshold: settings.creditBlockThreshold,
        sendCreditAlertToMember: settings.sendCreditAlertToMember,
        sendCreditAlertToStaff: settings.sendCreditAlertToStaff,
        allowManagerCreditOverride: settings.allowManagerCreditOverride,
        creditOverrideMaxAmount: settings.creditOverrideMaxAmount,
        autoSuspendOnCreditExceeded: settings.autoSuspendOnCreditExceeded,
      })
      setUnlimitedCredit(settings.defaultCreditLimit === null)
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
      console.error('Failed to save credit limit settings:', error)
    }
  }

  // Get display values with fallbacks
  const defaultCreditLimit = localSettings.defaultCreditLimit ?? null
  const alertThreshold = localSettings.creditAlertThreshold ?? 80
  const blockThreshold = localSettings.creditBlockThreshold ?? 100
  const sendToMember = localSettings.sendCreditAlertToMember ?? true
  const sendToStaff = localSettings.sendCreditAlertToStaff ?? true
  const allowOverride = localSettings.allowManagerCreditOverride ?? true
  const overrideMaxAmount = localSettings.creditOverrideMaxAmount ?? null
  const autoSuspend = localSettings.autoSuspendOnCreditExceeded ?? false

  if (isLoading) {
    return (
      <section id={id} className="border rounded-xl p-6 space-y-6 scroll-mt-24 shadow-lg shadow-stone-200/30">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
          <span className="ml-2 text-muted-foreground">Loading credit limit settings...</span>
        </div>
      </section>
    )
  }

  return (
    <section id={id} className="border rounded-xl p-6 space-y-6 scroll-mt-24 shadow-lg shadow-stone-200/30">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Shield className="h-5 w-5 text-amber-500" />
          Credit Limit Management
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Configure default credit limits, alerts, and override policies
        </p>
      </div>

      {/* Default Credit Limit */}
      <div className="space-y-4">
        <h3 className="font-medium">Default Credit Limit</h3>
        <label className="flex items-center gap-2">
          <Checkbox
            checked={unlimitedCredit}
            onCheckedChange={(checked) => {
              setUnlimitedCredit(checked as boolean)
              if (checked) {
                updateField('defaultCreditLimit', null)
              } else {
                updateField('defaultCreditLimit', 50000)
              }
            }}
          />
          <span className="text-sm">No limit (unlimited)</span>
        </label>
        {!unlimitedCredit && (
          <div className="ml-6">
            <Label className="text-sm">Default Limit Amount</Label>
            <div className="flex items-center gap-2 mt-1">
              <Input
                type="number"
                min={0}
                value={defaultCreditLimit ?? 0}
                onChange={(e) => updateField('defaultCreditLimit', parseFloat(e.target.value) || 0)}
                className="w-36"
              />
              <span className="text-sm text-muted-foreground">THB</span>
            </div>
          </div>
        )}
      </div>

      {/* Alert & Block Thresholds */}
      <div className="space-y-4 pt-4 border-t">
        <h3 className="font-medium">Alert & Block Thresholds</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label className="text-sm">Alert at</Label>
            <div className="flex items-center gap-2 mt-1">
              <Input
                type="number"
                min={0}
                max={100}
                value={alertThreshold}
                onChange={(e) => updateField('creditAlertThreshold', parseInt(e.target.value) || 0)}
                className="w-20"
              />
              <span className="text-sm text-muted-foreground">% of credit limit</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Triggers notification when balance reaches this percentage</p>
          </div>
          <div>
            <Label className="text-sm">Block at</Label>
            <div className="flex items-center gap-2 mt-1">
              <Input
                type="number"
                min={0}
                max={200}
                value={blockThreshold}
                onChange={(e) => updateField('creditBlockThreshold', parseInt(e.target.value) || 0)}
                className="w-20"
              />
              <span className="text-sm text-muted-foreground">% of credit limit</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Prevents new charges when balance reaches this percentage</p>
          </div>
        </div>
        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <Checkbox
              checked={sendToMember}
              onCheckedChange={(checked) => updateField('sendCreditAlertToMember', checked as boolean)}
            />
            <span className="text-sm">Send credit alert to member</span>
          </label>
          <label className="flex items-center gap-2">
            <Checkbox
              checked={sendToStaff}
              onCheckedChange={(checked) => updateField('sendCreditAlertToStaff', checked as boolean)}
            />
            <span className="text-sm">Send credit alert to staff</span>
          </label>
        </div>
      </div>

      {/* Manager Override */}
      <div className="space-y-4 pt-4 border-t">
        <h3 className="font-medium">Manager Override</h3>
        <label className="flex items-center gap-2">
          <Checkbox
            checked={allowOverride}
            onCheckedChange={(checked) => updateField('allowManagerCreditOverride', checked as boolean)}
          />
          <span className="text-sm">Allow manager to override credit limit block</span>
        </label>
        {allowOverride && (
          <div className="ml-6">
            <Label className="text-sm">Maximum override increase</Label>
            <div className="flex items-center gap-2 mt-1">
              <Input
                type="number"
                min={0}
                value={overrideMaxAmount ?? 0}
                onChange={(e) => {
                  const val = parseFloat(e.target.value)
                  updateField('creditOverrideMaxAmount', val || null)
                }}
                className="w-36"
                placeholder="No maximum"
              />
              <span className="text-sm text-muted-foreground">THB</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <Info className="h-3 w-3" />
              Leave at 0 for no maximum override limit
            </p>
          </div>
        )}
      </div>

      {/* Auto-Suspension */}
      <div className="space-y-4 pt-4 border-t">
        <h3 className="font-medium">Credit Suspension</h3>
        <label className="flex items-center gap-2">
          <Checkbox
            checked={autoSuspend}
            onCheckedChange={(checked) => updateField('autoSuspendOnCreditExceeded', checked as boolean)}
          />
          <span className="text-sm">Auto-suspend AR profile when credit exceeded for 30+ days</span>
        </label>
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
