'use client'

import { useState, useEffect } from 'react'
import { Loader2, Check } from 'lucide-react'
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
import { mockClubProfile, timezones, thaiProvinces } from './mock-data'
import type { ClubProfile } from './types'

interface ClubProfileSectionProps {
  id: string
  initialProfile?: ClubProfile
  isLoading?: boolean
  onSave?: (profile: ClubProfile) => Promise<void>
  isSaving?: boolean
}

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

export function ClubProfileSection({
  id,
  initialProfile,
  isLoading: externalIsLoading,
  onSave: externalOnSave,
  isSaving: externalIsSaving,
}: ClubProfileSectionProps) {
  const [profile, setProfile] = useState<ClubProfile>(initialProfile ?? mockClubProfile)
  const [isSavingLocal, setIsSavingLocal] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  const isSaving = externalIsSaving ?? isSavingLocal

  // Sync with external profile when it loads
  useEffect(() => {
    if (initialProfile) {
      setProfile(initialProfile)
      setHasChanges(false)
    }
  }, [initialProfile])

  const updateField = <K extends keyof ClubProfile>(key: K, value: ClubProfile[K]) => {
    setProfile({ ...profile, [key]: value })
    setHasChanges(true)
  }

  const handleSave = async () => {
    if (externalOnSave) {
      try {
        await externalOnSave(profile)
        setShowSuccess(true)
        setHasChanges(false)
        setTimeout(() => setShowSuccess(false), 2000)
      } catch {
        // Error handled by parent
      }
    } else {
      setIsSavingLocal(true)
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setIsSavingLocal(false)
      setShowSuccess(true)
      setHasChanges(false)
      setTimeout(() => setShowSuccess(false), 2000)
    }
  }

  if (externalIsLoading) {
    return (
      <section id={id} className="border rounded-lg p-6 space-y-6 scroll-mt-24">
        <div>
          <h2 className="text-xl font-semibold">Club Profile</h2>
          <p className="text-sm text-muted-foreground">Basic information about your club</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-20 bg-muted animate-pulse rounded" />
              <div className="h-10 w-full bg-muted animate-pulse rounded-md" />
            </div>
          ))}
        </div>
      </section>
    )
  }

  return (
    <section id={id} className="border rounded-lg p-6 space-y-6 scroll-mt-24">
      <div>
        <h2 className="text-xl font-semibold">Club Profile</h2>
        <p className="text-sm text-muted-foreground">Basic information about your club</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="clubName">Club Name</Label>
          <Input
            id="clubName"
            value={profile.clubName}
            onChange={(e) => updateField('clubName', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="legalName">Legal Name</Label>
          <Input
            id="legalName"
            value={profile.legalName}
            onChange={(e) => updateField('legalName', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="taxId">Tax ID</Label>
          <Input
            id="taxId"
            value={profile.taxId}
            onChange={(e) => updateField('taxId', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            type="tel"
            value={profile.phone}
            onChange={(e) => updateField('phone', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={profile.email}
            onChange={(e) => updateField('email', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            type="url"
            value={profile.website || ''}
            onChange={(e) => updateField('website', e.target.value)}
          />
        </div>
      </div>

      <div className="pt-4 border-t">
        <h3 className="font-medium mb-4">Address</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <Label htmlFor="address1">Address Line 1</Label>
            <Input
              id="address1"
              value={profile.address1}
              onChange={(e) => updateField('address1', e.target.value)}
            />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="address2">Address Line 2</Label>
            <Input
              id="address2"
              value={profile.address2 || ''}
              onChange={(e) => updateField('address2', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              value={profile.city}
              onChange={(e) => updateField('city', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="province">Province</Label>
            <Select value={profile.province} onValueChange={(v) => updateField('province', v)}>
              <SelectTrigger id="province">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {thaiProvinces.map((province) => (
                  <SelectItem key={province} value={province}>
                    {province}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="postalCode">Postal Code</Label>
            <Input
              id="postalCode"
              value={profile.postalCode}
              onChange={(e) => updateField('postalCode', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="country">Country</Label>
            <Input id="country" value={profile.country} disabled />
          </div>
        </div>
      </div>

      <div className="pt-4 border-t">
        <h3 className="font-medium mb-4">Regional Settings</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="timezone">Timezone</Label>
            <Select value={profile.timezone} onValueChange={(v) => updateField('timezone', v)}>
              <SelectTrigger id="timezone">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {timezones.map((tz) => (
                  <SelectItem key={tz.value} value={tz.value}>
                    {tz.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="fiscalYear">Fiscal Year Start</Label>
            <Select
              value={String(profile.fiscalYearStart)}
              onValueChange={(v) => updateField('fiscalYearStart', parseInt(v))}
            >
              <SelectTrigger id="fiscalYear">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {months.map((month, index) => (
                  <SelectItem key={index} value={String(index + 1)}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t">
        <Button
          onClick={handleSave}
          disabled={isSaving || !hasChanges}
          className="bg-gradient-to-br from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:opacity-50"
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : showSuccess ? (
            <Check className="h-4 w-4 mr-2" />
          ) : null}
          {showSuccess ? 'Saved' : 'Save Section'}
        </Button>
      </div>
    </section>
  )
}
