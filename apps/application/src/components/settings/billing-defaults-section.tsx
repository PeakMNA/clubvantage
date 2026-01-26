'use client'

import { useState } from 'react'
import { Loader2, Check } from 'lucide-react'
import { Button } from '@clubvantage/ui'
import { Input } from '@clubvantage/ui'
import { Label } from '@clubvantage/ui'
import { Checkbox } from '@clubvantage/ui'
import { mockBillingDefaults } from './mock-data'
import type { BillingDefaults } from './types'

interface BillingDefaultsSectionProps {
  id: string
}

export function BillingDefaultsSection({ id }: BillingDefaultsSectionProps) {
  const [defaults, setDefaults] = useState<BillingDefaults>(mockBillingDefaults)
  const [isSaving, setIsSaving] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  const updateField = <K extends keyof BillingDefaults>(key: K, value: BillingDefaults[K]) => {
    setDefaults({ ...defaults, [key]: value })
    setHasChanges(true)
  }

  const handleSave = async () => {
    setIsSaving(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsSaving(false)
    setShowSuccess(true)
    setHasChanges(false)
    setTimeout(() => setShowSuccess(false), 2000)
  }

  const invoicePreview = `${defaults.invoicePrefix}2024-${String(defaults.invoiceStartNumber).padStart(4, '0')}`

  return (
    <section id={id} className="border rounded-lg p-6 space-y-6 scroll-mt-24">
      <div>
        <h2 className="text-xl font-semibold">Billing Defaults</h2>
        <p className="text-sm text-muted-foreground">Configure payment terms, taxes, and fee policies</p>
      </div>

      {/* Payment Terms */}
      <div className="space-y-4">
        <h3 className="font-medium">Payment Terms</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label>Days Until Due</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={defaults.paymentTerms}
                onChange={(e) => updateField('paymentTerms', parseInt(e.target.value) || 0)}
                className="w-24"
              />
              <span className="text-sm text-muted-foreground">days</span>
            </div>
          </div>
          <div>
            <Label>Grace Period</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={defaults.gracePeriod}
                onChange={(e) => updateField('gracePeriod', parseInt(e.target.value) || 0)}
                className="w-24"
              />
              <span className="text-sm text-muted-foreground">days</span>
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Settings */}
      <div className="space-y-4 pt-4 border-t">
        <h3 className="font-medium">Invoice Settings</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label>Invoice Prefix</Label>
            <Input
              value={defaults.invoicePrefix}
              onChange={(e) => updateField('invoicePrefix', e.target.value)}
              className="w-32"
            />
          </div>
          <div>
            <Label>Starting Number</Label>
            <Input
              type="number"
              value={defaults.invoiceStartNumber}
              onChange={(e) => updateField('invoiceStartNumber', parseInt(e.target.value) || 1)}
              className="w-32"
            />
          </div>
          <div className="md:col-span-2">
            <p className="text-sm text-muted-foreground">
              Preview: <span className="font-mono">{invoicePreview}</span>
            </p>
          </div>
          <div>
            <Label>Auto-generation Day</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={1}
                max={28}
                value={defaults.autoGenerationDay}
                onChange={(e) => updateField('autoGenerationDay', parseInt(e.target.value) || 1)}
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
            <Label>Default VAT Rate</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={defaults.vatRate}
                onChange={(e) => updateField('vatRate', parseFloat(e.target.value) || 0)}
                className="w-20"
              />
              <span className="text-sm text-muted-foreground">%</span>
            </div>
          </div>
          <div>
            <Label>Tax Method</Label>
            <div className="flex gap-4 mt-2">
              {(['addon', 'included', 'exempt'] as const).map((method) => (
                <label key={method} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="taxMethod"
                    checked={defaults.taxMethod === method}
                    onChange={() => updateField('taxMethod', method)}
                    className="h-4 w-4"
                  />
                  <span className="text-sm capitalize">{method}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <Checkbox
              checked={defaults.whtEnabled}
              onCheckedChange={(checked) => updateField('whtEnabled', checked as boolean)}
            />
            <span className="text-sm">Enable WHT for applicable members</span>
          </label>
          {defaults.whtEnabled && (
            <div className="ml-6 flex items-center gap-3">
              <span className="text-sm text-muted-foreground">WHT Rates:</span>
              {[1, 2, 3, 5].map((rate) => (
                <label key={rate} className="flex items-center gap-1">
                  <Checkbox
                    checked={defaults.whtRates.includes(rate)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        updateField('whtRates', [...defaults.whtRates, rate].sort())
                      } else {
                        updateField('whtRates', defaults.whtRates.filter((r) => r !== rate))
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

      {/* Late Fee Configuration */}
      <div className="space-y-4 pt-4 border-t">
        <h3 className="font-medium">Late Fees</h3>
        <label className="flex items-center gap-2">
          <Checkbox
            checked={defaults.lateFeeEnabled}
            onCheckedChange={(checked) => updateField('lateFeeEnabled', checked as boolean)}
          />
          <span className="text-sm">Apply late fees automatically</span>
        </label>
        {defaults.lateFeeEnabled && (
          <div className="ml-6 space-y-4">
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="lateFeeType"
                  checked={defaults.lateFeeType === 'percentage'}
                  onChange={() => updateField('lateFeeType', 'percentage')}
                  className="h-4 w-4"
                />
                <span className="text-sm">Percentage</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="lateFeeType"
                  checked={defaults.lateFeeType === 'fixed'}
                  onChange={() => updateField('lateFeeType', 'fixed')}
                  className="h-4 w-4"
                />
                <span className="text-sm">Fixed Amount</span>
              </label>
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                step="0.1"
                value={defaults.lateFeeAmount}
                onChange={(e) => updateField('lateFeeAmount', parseFloat(e.target.value) || 0)}
                className="w-24"
              />
              <span className="text-sm text-muted-foreground">
                {defaults.lateFeeType === 'percentage' ? '% per month' : 'THB'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={!!defaults.lateFeeCap}
                onCheckedChange={(checked) => updateField('lateFeeCap', checked ? 25 : undefined)}
              />
              <span className="text-sm">Cap total late fees at</span>
              {defaults.lateFeeCap && (
                <>
                  <Input
                    type="number"
                    value={defaults.lateFeeCap}
                    onChange={(e) => updateField('lateFeeCap', parseInt(e.target.value) || 0)}
                    className="w-20"
                  />
                  <span className="text-sm text-muted-foreground">%</span>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Auto-Suspension */}
      <div className="space-y-4 pt-4 border-t">
        <h3 className="font-medium">Auto-Suspension</h3>
        <label className="flex items-center gap-2">
          <Checkbox
            checked={defaults.autoSuspendEnabled}
            onCheckedChange={(checked) => updateField('autoSuspendEnabled', checked as boolean)}
          />
          <span className="text-sm">Automatically suspend members with overdue balances</span>
        </label>
        {defaults.autoSuspendEnabled && (
          <div className="ml-6 flex items-center gap-2">
            <span className="text-sm">Suspend after</span>
            <Input
              type="number"
              value={defaults.autoSuspendDays}
              onChange={(e) => updateField('autoSuspendDays', parseInt(e.target.value) || 0)}
              className="w-20"
            />
            <span className="text-sm text-muted-foreground">days overdue</span>
          </div>
        )}
      </div>

      <div className="flex justify-end pt-4 border-t">
        <Button
          onClick={handleSave}
          disabled={isSaving || !hasChanges}
          className="bg-gradient-to-br from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : showSuccess ? <Check className="h-4 w-4 mr-2" /> : null}
          {showSuccess ? 'Saved' : 'Save Section'}
        </Button>
      </div>
    </section>
  )
}
