'use client'

import { useState } from 'react'
import { Loader2, Check, Upload } from 'lucide-react'
import { Button } from '@clubvantage/ui'
import { Input } from '@clubvantage/ui'
import { Label } from '@clubvantage/ui'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@clubvantage/ui'
import { mockBranding } from './mock-data'
import type { Branding } from './types'

interface BrandingSectionProps {
  id: string
}

export function BrandingSection({ id }: BrandingSectionProps) {
  const [branding, setBranding] = useState<Branding>(mockBranding)
  const [isSaving, setIsSaving] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  const updateField = <K extends keyof Branding>(key: K, value: Branding[K]) => {
    setBranding({ ...branding, [key]: value })
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

  return (
    <section id={id} className="border rounded-lg p-6 space-y-6 scroll-mt-24">
      <div>
        <h2 className="text-xl font-semibold">Branding</h2>
        <p className="text-sm text-muted-foreground">Logo, colors, and visual styling</p>
      </div>

      {/* Logo Upload */}
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <Label>Primary Logo (Light Background)</Label>
          <div className="mt-2 border-2 border-dashed rounded-lg p-6 text-center hover:border-amber-500 transition-colors cursor-pointer">
            <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
            <p className="text-sm text-muted-foreground mt-2">Drag & drop or click to upload</p>
            <p className="text-xs text-muted-foreground">PNG or SVG, 400x100px recommended</p>
          </div>
        </div>
        <div>
          <Label>Secondary Logo (Dark Background)</Label>
          <div className="mt-2 border-2 border-dashed rounded-lg p-6 text-center hover:border-amber-500 transition-colors cursor-pointer">
            <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
            <p className="text-sm text-muted-foreground mt-2">Drag & drop or click to upload</p>
            <p className="text-xs text-muted-foreground">Light-colored version for dark backgrounds</p>
          </div>
        </div>
      </div>

      {/* Brand Colors */}
      <div className="space-y-4 pt-4 border-t">
        <h3 className="font-medium">Colors</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <Label>Primary Color</Label>
            <div className="flex items-center gap-2 mt-2">
              <input
                type="color"
                value={branding.primaryColor}
                onChange={(e) => updateField('primaryColor', e.target.value)}
                className="h-10 w-16 rounded border cursor-pointer"
              />
              <Input
                value={branding.primaryColor}
                onChange={(e) => updateField('primaryColor', e.target.value)}
                className="font-mono uppercase"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Buttons, links, accents</p>
          </div>
          <div>
            <Label>Secondary Color</Label>
            <div className="flex items-center gap-2 mt-2">
              <input
                type="color"
                value={branding.secondaryColor}
                onChange={(e) => updateField('secondaryColor', e.target.value)}
                className="h-10 w-16 rounded border cursor-pointer"
              />
              <Input
                value={branding.secondaryColor}
                onChange={(e) => updateField('secondaryColor', e.target.value)}
                className="font-mono uppercase"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Headers, emphasis</p>
          </div>
          <div>
            <Label>Accent Color</Label>
            <div className="flex items-center gap-2 mt-2">
              <input
                type="color"
                value={branding.accentColor}
                onChange={(e) => updateField('accentColor', e.target.value)}
                className="h-10 w-16 rounded border cursor-pointer"
              />
              <Input
                value={branding.accentColor}
                onChange={(e) => updateField('accentColor', e.target.value)}
                className="font-mono uppercase"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Success states, highlights</p>
          </div>
        </div>
      </div>

      {/* Typography */}
      <div className="space-y-4 pt-4 border-t">
        <h3 className="font-medium">Typography</h3>
        <div>
          <Label>Font Family</Label>
          <Select value={branding.fontFamily} onValueChange={(v) => updateField('fontFamily', v)}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Inter">Inter</SelectItem>
              <SelectItem value="Sarabun">Sarabun</SelectItem>
              <SelectItem value="Kanit">Kanit</SelectItem>
              <SelectItem value="Open Sans">Open Sans</SelectItem>
              <SelectItem value="Roboto">Roboto</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Email Styling */}
      <div className="space-y-4 pt-4 border-t">
        <h3 className="font-medium">Email Appearance</h3>
        <div>
          <Label>Header Style</Label>
          <div className="flex gap-4 mt-2">
            {(['logo', 'logo-name', 'text'] as const).map((style) => (
              <label key={style} className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={branding.emailHeaderStyle === style}
                  onChange={() => updateField('emailHeaderStyle', style)}
                  className="h-4 w-4"
                />
                <span className="text-sm capitalize">{style.replace('-', ' + ')}</span>
              </label>
            ))}
          </div>
        </div>
        <div>
          <Label>Footer Text</Label>
          <Input
            value={branding.emailFooter}
            onChange={(e) => updateField('emailFooter', e.target.value)}
          />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <Label>Facebook</Label>
            <Input
              value={branding.socialLinks.facebook || ''}
              onChange={(e) => updateField('socialLinks', { ...branding.socialLinks, facebook: e.target.value })}
              placeholder="https://facebook.com/..."
            />
          </div>
          <div>
            <Label>Instagram</Label>
            <Input
              value={branding.socialLinks.instagram || ''}
              onChange={(e) => updateField('socialLinks', { ...branding.socialLinks, instagram: e.target.value })}
              placeholder="https://instagram.com/..."
            />
          </div>
          <div>
            <Label>Line</Label>
            <Input
              value={branding.socialLinks.line || ''}
              onChange={(e) => updateField('socialLinks', { ...branding.socialLinks, line: e.target.value })}
              placeholder="@yourclub"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-4 border-t">
        <Button variant="outline">Reset to Defaults</Button>
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
