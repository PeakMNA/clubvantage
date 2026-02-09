'use client'

import { useState, useEffect, useMemo } from 'react'
import { Loader2, Check, FileText, Info } from 'lucide-react'
import { Button, cn } from '@clubvantage/ui'
import { Input } from '@clubvantage/ui'
import { Label } from '@clubvantage/ui'
import { Checkbox } from '@clubvantage/ui'
import {
  useClubBillingSettings,
  type StatementDelivery,
  type UpdateClubBillingSettingsInput,
} from '@/hooks/use-billing-settings'

interface StatementConfigSectionProps {
  id: string
}

const DELIVERY_OPTIONS: { value: StatementDelivery; label: string }[] = [
  { value: 'EMAIL', label: 'Email' },
  { value: 'PRINT', label: 'Print' },
  { value: 'PORTAL', label: 'Portal' },
  { value: 'SMS', label: 'SMS' },
  { value: 'EMAIL_AND_PRINT', label: 'Email + Print' },
  { value: 'ALL', label: 'All' },
]

export function StatementConfigSection({ id }: StatementConfigSectionProps) {
  const { settings, isLoading, updateSettings, isUpdating } = useClubBillingSettings()
  const [localSettings, setLocalSettings] = useState<UpdateClubBillingSettingsInput>({})
  const [showSuccess, setShowSuccess] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  // Initialize local settings when remote settings load
  useEffect(() => {
    if (settings) {
      setLocalSettings({
        accountNumberPrefix: settings.accountNumberPrefix,
        accountNumberFormat: settings.accountNumberFormat,
        statementNumberPrefix: settings.statementNumberPrefix,
        defaultStatementDelivery: settings.defaultStatementDelivery,
        defaultPaymentTermsDays: settings.defaultPaymentTermsDays,
        autoCreateProfileOnActivation: settings.autoCreateProfileOnActivation,
        requireZeroBalanceForClosure: settings.requireZeroBalanceForClosure,
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
      console.error('Failed to save statement config:', error)
    }
  }

  // Get display values with fallbacks
  const accountPrefix = localSettings.accountNumberPrefix ?? 'AR'
  const accountFormat = localSettings.accountNumberFormat ?? '{PREFIX}-{SEQ:6}'
  const statementPrefix = localSettings.statementNumberPrefix ?? 'STMT'
  const delivery = localSettings.defaultStatementDelivery ?? 'EMAIL'
  const autoCreate = localSettings.autoCreateProfileOnActivation ?? true
  const requireZeroBalance = localSettings.requireZeroBalanceForClosure ?? true

  // Generate account number preview
  const accountPreview = useMemo(() => {
    return accountFormat
      .replace('{PREFIX}', accountPrefix)
      .replace('{SEQ:6}', '000001')
      .replace('{SEQ:5}', '00001')
      .replace('{SEQ:4}', '0001')
  }, [accountPrefix, accountFormat])

  // Generate statement number preview
  const statementPreview = `${statementPrefix}-26-01-000001`

  if (isLoading) {
    return (
      <section id={id} className="border rounded-xl p-6 space-y-6 scroll-mt-24 shadow-lg shadow-stone-200/30">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
          <span className="ml-2 text-muted-foreground">Loading statement configuration...</span>
        </div>
      </section>
    )
  }

  return (
    <section id={id} className="border rounded-xl p-6 space-y-6 scroll-mt-24 shadow-lg shadow-stone-200/30">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <FileText className="h-5 w-5 text-amber-500" />
          Statement Configuration
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Configure statement numbering, delivery method, and AR profile settings
        </p>
      </div>

      {/* Account Numbering */}
      <div className="space-y-4">
        <h3 className="font-medium">Account Numbering</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label className="text-sm">Prefix</Label>
            <Input
              value={accountPrefix}
              onChange={(e) => updateField('accountNumberPrefix', e.target.value)}
              className="w-24 mt-1"
              maxLength={10}
            />
          </div>
          <div>
            <Label className="text-sm">Format</Label>
            <Input
              value={accountFormat}
              onChange={(e) => updateField('accountNumberFormat', e.target.value)}
              className="w-48 mt-1"
              maxLength={50}
            />
          </div>
          <div className="md:col-span-2">
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Info className="h-3 w-3" />
              Preview: <span className="font-mono">{accountPreview}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Statement Numbering */}
      <div className="space-y-4 pt-4 border-t">
        <h3 className="font-medium">Statement Numbering</h3>
        <div>
          <Label className="text-sm">Prefix</Label>
          <Input
            value={statementPrefix}
            onChange={(e) => updateField('statementNumberPrefix', e.target.value)}
            className="w-24 mt-1"
            maxLength={10}
          />
        </div>
        <p className="text-sm text-muted-foreground flex items-center gap-1">
          <Info className="h-3 w-3" />
          Preview: <span className="font-mono">{statementPreview}</span>
        </p>
      </div>

      {/* Default Delivery Method */}
      <div className="space-y-4 pt-4 border-t">
        <h3 className="font-medium">Default Delivery Method</h3>
        <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {DELIVERY_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => updateField('defaultStatementDelivery', option.value)}
              className={cn(
                'p-3 rounded-lg border-2 transition-all text-center text-sm',
                delivery === option.value
                  ? 'border-amber-500 bg-amber-50 font-medium text-amber-700 shadow-md'
                  : 'border-stone-200 hover:border-stone-300 hover:bg-stone-50 text-stone-700'
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* AR Profile Settings */}
      <div className="space-y-4 pt-4 border-t">
        <h3 className="font-medium">AR Profile Settings</h3>
        <div className="space-y-3">
          <label className="flex items-center gap-2">
            <Checkbox
              checked={autoCreate}
              onCheckedChange={(checked) => updateField('autoCreateProfileOnActivation', checked as boolean)}
            />
            <span className="text-sm">Auto-create AR profile when member becomes ACTIVE</span>
          </label>
          <label className="flex items-center gap-2">
            <Checkbox
              checked={requireZeroBalance}
              onCheckedChange={(checked) => updateField('requireZeroBalanceForClosure', checked as boolean)}
            />
            <span className="text-sm">Require zero balance before closing AR profile</span>
          </label>
        </div>
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
