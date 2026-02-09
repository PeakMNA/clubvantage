'use client'

import { useState, useEffect } from 'react'
import { Loader2, Check, Receipt, Info } from 'lucide-react'
import { Button } from '@clubvantage/ui'
import { Input } from '@clubvantage/ui'
import { Label } from '@clubvantage/ui'
import { Checkbox } from '@clubvantage/ui'
import {
  useClubBillingSettings,
  type TaxMethod,
  type UpdateClubBillingSettingsInput,
} from '@/hooks/use-billing-settings'

interface BillingDefaultsSectionProps {
  id: string
}

const TAX_METHOD_OPTIONS: { value: TaxMethod; label: string; description: string }[] = [
  { value: 'ADDON', label: 'Add-on', description: 'Tax added on top of price' },
  { value: 'INCLUDED', label: 'Included', description: 'Tax included in price' },
  { value: 'EXEMPT', label: 'Exempt', description: 'No tax applied' },
]

export function BillingDefaultsSection({ id }: BillingDefaultsSectionProps) {
  const { settings, isLoading, updateSettings, isUpdating } = useClubBillingSettings()
  const [localSettings, setLocalSettings] = useState<UpdateClubBillingSettingsInput>({})
  const [showSuccess, setShowSuccess] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  // Initialize local settings when remote settings load
  useEffect(() => {
    if (settings) {
      setLocalSettings({
        defaultPaymentTermsDays: settings.defaultPaymentTermsDays,
        invoicePrefix: settings.invoicePrefix,
        invoiceStartNumber: settings.invoiceStartNumber,
        invoiceAutoGenerationDay: settings.invoiceAutoGenerationDay,
        defaultVatRate: settings.defaultVatRate,
        taxMethod: settings.taxMethod,
        whtEnabled: settings.whtEnabled,
        whtRates: settings.whtRates,
        autoSuspendEnabled: settings.autoSuspendEnabled,
        autoSuspendDays: settings.autoSuspendDays,
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
      console.error('Failed to save billing defaults:', error)
    }
  }

  // Get display values with fallbacks
  const paymentTermsDays = localSettings.defaultPaymentTermsDays ?? 30
  const invoicePrefix = localSettings.invoicePrefix ?? 'INV-'
  const invoiceStartNumber = localSettings.invoiceStartNumber ?? 1001
  const autoGenerationDay = localSettings.invoiceAutoGenerationDay ?? 1
  const vatRate = localSettings.defaultVatRate ?? 7
  const taxMethod = localSettings.taxMethod ?? 'INCLUDED'
  const whtEnabled = localSettings.whtEnabled ?? false
  const whtRates = localSettings.whtRates ?? []
  const autoSuspendEnabled = localSettings.autoSuspendEnabled ?? false
  const autoSuspendDays = localSettings.autoSuspendDays ?? 91

  const invoicePreview = `${invoicePrefix}2026-${String(invoiceStartNumber).padStart(4, '0')}`

  if (isLoading) {
    return (
      <section id={id} className="border rounded-xl p-6 space-y-6 scroll-mt-24 shadow-lg shadow-stone-200/30">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
          <span className="ml-2 text-muted-foreground">Loading billing defaults...</span>
        </div>
      </section>
    )
  }

  return (
    <section id={id} className="border rounded-xl p-6 space-y-6 scroll-mt-24 shadow-lg shadow-stone-200/30">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Receipt className="h-5 w-5 text-amber-500" />
          Billing Defaults
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Configure payment terms, invoice numbering, taxes, and auto-suspension policies
        </p>
      </div>

      {/* Payment Terms */}
      <div className="space-y-4">
        <h3 className="font-medium">Payment Terms</h3>
        <div>
          <Label className="text-sm">Days Until Due</Label>
          <div className="flex items-center gap-2 mt-1">
            <Input
              type="number"
              min={1}
              max={90}
              value={paymentTermsDays}
              onChange={(e) => updateField('defaultPaymentTermsDays', parseInt(e.target.value) || 1)}
              className="w-24"
            />
            <span className="text-sm text-muted-foreground">days from statement date</span>
          </div>
        </div>
      </div>

      {/* Invoice Settings */}
      <div className="space-y-4 pt-4 border-t">
        <h3 className="font-medium">Invoice Settings</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label className="text-sm">Invoice Prefix</Label>
            <Input
              value={invoicePrefix}
              onChange={(e) => updateField('invoicePrefix', e.target.value)}
              className="w-32 mt-1"
              maxLength={20}
            />
          </div>
          <div>
            <Label className="text-sm">Starting Number</Label>
            <Input
              type="number"
              min={1}
              value={invoiceStartNumber}
              onChange={(e) => updateField('invoiceStartNumber', parseInt(e.target.value) || 1)}
              className="w-32 mt-1"
            />
          </div>
          <div className="md:col-span-2">
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Info className="h-3 w-3" />
              Preview: <span className="font-mono">{invoicePreview}</span>
            </p>
          </div>
          <div>
            <Label className="text-sm">Auto-generation Day</Label>
            <div className="flex items-center gap-2 mt-1">
              <Input
                type="number"
                min={1}
                max={28}
                value={autoGenerationDay}
                onChange={(e) => updateField('invoiceAutoGenerationDay', parseInt(e.target.value) || 1)}
                className="w-20"
              />
              <span className="text-sm text-muted-foreground">of each month</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tax Configuration */}
      <div className="space-y-4 pt-4 border-t">
        <h3 className="font-medium">Tax Configuration</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label className="text-sm">Default VAT Rate</Label>
            <div className="flex items-center gap-2 mt-1">
              <Input
                type="number"
                step="0.01"
                min={0}
                max={100}
                value={vatRate}
                onChange={(e) => updateField('defaultVatRate', parseFloat(e.target.value) || 0)}
                className="w-24"
              />
              <span className="text-sm text-muted-foreground">%</span>
            </div>
          </div>
          <div>
            <Label className="text-sm">Tax Method</Label>
            <div className="flex gap-4 mt-2">
              {TAX_METHOD_OPTIONS.map((option) => (
                <label key={option.value} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="taxMethod"
                    checked={taxMethod === option.value}
                    onChange={() => updateField('taxMethod', option.value)}
                    className="h-4 w-4 text-amber-500 focus:ring-amber-500"
                  />
                  <span className="text-sm">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <Checkbox
              checked={whtEnabled}
              onCheckedChange={(checked) => updateField('whtEnabled', checked as boolean)}
            />
            <span className="text-sm">Enable WHT for applicable members</span>
          </label>
          {whtEnabled && (
            <div className="ml-6 flex items-center gap-3">
              <span className="text-sm text-muted-foreground">WHT Rates:</span>
              {[1, 2, 3, 5].map((rate) => (
                <label key={rate} className="flex items-center gap-1">
                  <Checkbox
                    checked={whtRates.includes(rate)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        updateField('whtRates', [...whtRates, rate].sort((a, b) => a - b))
                      } else {
                        updateField('whtRates', whtRates.filter((r) => r !== rate))
                      }
                    }}
                  />
                  <span className="text-sm">{rate}%</span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Auto-Suspension */}
      <div className="space-y-4 pt-4 border-t">
        <h3 className="font-medium">Auto-Suspension</h3>
        <label className="flex items-center gap-2">
          <Checkbox
            checked={autoSuspendEnabled}
            onCheckedChange={(checked) => updateField('autoSuspendEnabled', checked as boolean)}
          />
          <span className="text-sm">Automatically suspend members with overdue balances</span>
        </label>
        {autoSuspendEnabled && (
          <div className="ml-6 flex items-center gap-2">
            <span className="text-sm">Suspend after</span>
            <Input
              type="number"
              min={1}
              value={autoSuspendDays}
              onChange={(e) => updateField('autoSuspendDays', parseInt(e.target.value) || 1)}
              className="w-20"
            />
            <span className="text-sm text-muted-foreground">days overdue</span>
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
