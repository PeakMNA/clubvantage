'use client'

import { useState } from 'react'
import { Loader2, Check } from 'lucide-react'
import { Button } from '@clubvantage/ui'
import { Label } from '@clubvantage/ui'
import { Checkbox } from '@clubvantage/ui'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@clubvantage/ui'
import { mockLocalization, currencies, dateFormats } from './mock-data'
import type { Localization } from './types'

interface LocalizationSectionProps {
  id: string
}

export function LocalizationSection({ id }: LocalizationSectionProps) {
  const [settings, setSettings] = useState<Localization>(mockLocalization)
  const [isSaving, setIsSaving] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  const updateField = <K extends keyof Localization>(key: K, value: Localization[K]) => {
    setSettings({ ...settings, [key]: value })
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

  const isThailand = settings.region === 'TH'

  return (
    <section id={id} className="border rounded-lg p-6 space-y-6 scroll-mt-24">
      <div>
        <h2 className="text-xl font-semibold">Localization</h2>
        <p className="text-sm text-muted-foreground">Language, currency, and regional settings</p>
      </div>

      {/* Language & Region */}
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label>Language</Label>
          <Select value={settings.language} onValueChange={(v) => updateField('language', v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">🇺🇸 English</SelectItem>
              <SelectItem value="th">🇹🇭 ไทย (Thai)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Region</Label>
          <Select value={settings.region} onValueChange={(v) => updateField('region', v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TH">Thailand</SelectItem>
              <SelectItem value="SG">Singapore</SelectItem>
              <SelectItem value="HK">Hong Kong</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Currency */}
      <div className="space-y-4 pt-4 border-t">
        <h3 className="font-medium">Currency Settings</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label>Base Currency</Label>
            <Select value={settings.baseCurrency} onValueChange={(v) => updateField('baseCurrency', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((c) => (
                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Symbol Position</Label>
            <div className="flex gap-4 mt-2">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={settings.currencySymbolPosition === 'before'}
                  onChange={() => updateField('currencySymbolPosition', 'before')}
                  className="h-4 w-4"
                />
                <span className="text-sm">Before (฿1,234)</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={settings.currencySymbolPosition === 'after'}
                  onChange={() => updateField('currencySymbolPosition', 'after')}
                  className="h-4 w-4"
                />
                <span className="text-sm">After (1,234฿)</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Date & Time */}
      <div className="space-y-4 pt-4 border-t">
        <h3 className="font-medium">Date & Time Format</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label>Date Format</Label>
            <Select value={settings.dateFormat} onValueChange={(v) => updateField('dateFormat', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {dateFormats.map((f) => (
                  <SelectItem key={f.value} value={f.value}>
                    {f.label} ({f.example})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Time Format</Label>
            <div className="flex gap-4 mt-2">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={settings.timeFormat === '24'}
                  onChange={() => updateField('timeFormat', '24')}
                  className="h-4 w-4"
                />
                <span className="text-sm">24-hour (14:30)</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={settings.timeFormat === '12'}
                  onChange={() => updateField('timeFormat', '12')}
                  className="h-4 w-4"
                />
                <span className="text-sm">12-hour (2:30 PM)</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Thai-specific Settings */}
      {isThailand && (
        <div className="space-y-4 pt-4 border-t">
          <h3 className="font-medium">Thai Settings</h3>
          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <Checkbox
                checked={settings.useThaiAddressFormat}
                onCheckedChange={(checked) => updateField('useThaiAddressFormat', checked as boolean)}
              />
              <span className="text-sm">Use Thai address format (district, province, postal)</span>
            </label>
            <label className="flex items-center gap-2">
              <Checkbox
                checked={settings.showBuddhistEra}
                onCheckedChange={(checked) => updateField('showBuddhistEra', checked as boolean)}
              />
              <span className="text-sm">Show Buddhist Era year (พ.ศ.)</span>
            </label>
            <label className="flex items-center gap-2">
              <Checkbox
                checked={settings.validateThaiNationalId}
                onCheckedChange={(checked) => updateField('validateThaiNationalId', checked as boolean)}
              />
              <span className="text-sm">Validate Thai National ID format (13 digits)</span>
            </label>
          </div>
        </div>
      )}

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
