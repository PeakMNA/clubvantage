'use client'

import { useState, useEffect } from 'react'
import {
  Loader2,
  Check,
  Calendar,
  Clock,
  AlertCircle,
  Info,
  X,
  User,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  cn,
} from '@clubvantage/ui'
import { Button } from '@clubvantage/ui'
import { Input } from '@clubvantage/ui'
import { Label } from '@clubvantage/ui'
import { Checkbox } from '@clubvantage/ui'
import {
  useMemberBillingProfile,
  useClubBillingSettings,
  useBillingPeriodPreview,
  type BillingFrequency,
  type BillingTiming,
  type BillingAlignment,
  type UpdateMemberBillingProfileInput,
} from '@/hooks/use-billing-settings'

interface MemberBillingProfileModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  memberId: string
  memberName: string
  memberNumber?: string
}

const FREQUENCY_OPTIONS: { value: BillingFrequency; label: string }[] = [
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'QUARTERLY', label: 'Quarterly' },
  { value: 'SEMI_ANNUAL', label: 'Semi-Annual' },
  { value: 'ANNUAL', label: 'Annual' },
]

const TIMING_OPTIONS: { value: BillingTiming; label: string }[] = [
  { value: 'ADVANCE', label: 'In Advance' },
  { value: 'ARREARS', label: 'In Arrears' },
]

const ALIGNMENT_OPTIONS: { value: BillingAlignment; label: string }[] = [
  { value: 'CALENDAR', label: 'Calendar' },
  { value: 'ANNIVERSARY', label: 'Anniversary' },
  { value: 'CUSTOM', label: 'Custom Day' },
]

export function MemberBillingProfileModal({
  open,
  onOpenChange,
  memberId,
  memberName,
  memberNumber,
}: MemberBillingProfileModalProps) {
  const {
    profile,
    isLoading: isLoadingProfile,
    updateProfile,
    isUpdating,
  } = useMemberBillingProfile(memberId)
  const { settings: clubSettings, isLoading: isLoadingClubSettings } =
    useClubBillingSettings()
  const { preview, isLoading: isLoadingPreview } = useBillingPeriodPreview(memberId)

  const [localProfile, setLocalProfile] = useState<UpdateMemberBillingProfileInput>({})
  const [useClubDefaults, setUseClubDefaults] = useState(true)
  const [showSuccess, setShowSuccess] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [error, setError] = useState<string>()

  // Initialize local profile when data loads
  useEffect(() => {
    if (profile) {
      setLocalProfile({
        billingFrequency: profile.billingFrequency,
        billingTiming: profile.billingTiming,
        billingAlignment: profile.billingAlignment,
        billingDay: profile.billingDay,
        customDueDays: profile.customDueDays,
        customGracePeriod: profile.customGracePeriod,
        lateFeeExempt: profile.lateFeeExempt,
        autoPayEnabled: profile.autoPayEnabled,
      })
      // Determine if using club defaults (simplified check)
      setUseClubDefaults(
        !profile.customDueDays &&
          !profile.customGracePeriod &&
          profile.billingFrequency === clubSettings?.defaultFrequency
      )
      setHasChanges(false)
    }
  }, [profile, clubSettings])

  const updateField = <K extends keyof UpdateMemberBillingProfileInput>(
    key: K,
    value: UpdateMemberBillingProfileInput[K]
  ) => {
    setLocalProfile((prev) => ({ ...prev, [key]: value }))
    setHasChanges(true)
  }

  const handleSave = async () => {
    setError(undefined)
    try {
      await updateProfile(localProfile)
      setShowSuccess(true)
      setHasChanges(false)
      setTimeout(() => {
        setShowSuccess(false)
        onOpenChange(false)
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save billing profile')
    }
  }

  const handleClose = () => {
    if (!isUpdating) {
      onOpenChange(false)
    }
  }

  // Get display values with fallbacks to club defaults
  const frequency = localProfile.billingFrequency ?? clubSettings?.defaultFrequency ?? 'MONTHLY'
  const timing = localProfile.billingTiming ?? clubSettings?.defaultTiming ?? 'ADVANCE'
  const alignment = localProfile.billingAlignment ?? clubSettings?.defaultAlignment ?? 'CALENDAR'
  const billingDay = localProfile.billingDay ?? clubSettings?.defaultBillingDay ?? 1
  const customDueDays = localProfile.customDueDays
  const customGracePeriod = localProfile.customGracePeriod
  const lateFeeExempt = localProfile.lateFeeExempt ?? false
  const autoPayEnabled = localProfile.autoPayEnabled ?? false

  const isLoading = isLoadingProfile || isLoadingClubSettings

  // Format date for display
  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-amber-500" />
            Member Billing Profile
          </DialogTitle>
        </DialogHeader>

        {/* Member Info Header */}
        <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-lg border border-stone-200">
          <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
            <User className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <p className="font-medium text-stone-900">{memberName}</p>
            {memberNumber && (
              <p className="text-sm text-stone-500">Member #{memberNumber}</p>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
            <span className="ml-2 text-muted-foreground">Loading billing profile...</span>
          </div>
        ) : (
          <div className="space-y-6 mt-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            {/* Current Billing Status */}
            {profile && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                  <p className="text-xs font-medium text-emerald-600 uppercase tracking-wide">
                    Next Billing Date
                  </p>
                  <p className="text-lg font-semibold text-emerald-700 mt-1">
                    {formatDate(profile.nextBillingDate)}
                  </p>
                </div>
                <div className="p-4 bg-stone-50 rounded-lg border border-stone-200">
                  <p className="text-xs font-medium text-stone-500 uppercase tracking-wide">
                    Last Billed
                  </p>
                  <p className="text-lg font-semibold text-stone-700 mt-1">
                    {formatDate(profile.lastBillingDate)}
                  </p>
                </div>
              </div>
            )}

            {/* Billing Frequency */}
            <div className="space-y-3">
              <h3 className="font-medium flex items-center gap-2">
                <Clock className="h-4 w-4 text-stone-500" />
                Billing Frequency
              </h3>
              <div className="grid gap-2 grid-cols-2 sm:grid-cols-4">
                {FREQUENCY_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => updateField('billingFrequency', option.value)}
                    className={cn(
                      'p-3 rounded-lg border-2 transition-all text-sm font-medium',
                      frequency === option.value
                        ? 'border-amber-500 bg-amber-50 text-amber-700'
                        : 'border-stone-200 hover:border-stone-300 hover:bg-stone-50 text-stone-700'
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Billing Timing */}
            <div className="space-y-3">
              <h3 className="font-medium">Billing Timing</h3>
              <div className="grid gap-2 grid-cols-2">
                {TIMING_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => updateField('billingTiming', option.value)}
                    className={cn(
                      'p-3 rounded-lg border-2 transition-all text-sm font-medium',
                      timing === option.value
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                        : 'border-stone-200 hover:border-stone-300 hover:bg-stone-50 text-stone-700'
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Cycle Alignment */}
            <div className="space-y-3">
              <h3 className="font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4 text-stone-500" />
                Cycle Alignment
              </h3>
              <div className="grid gap-2 grid-cols-3">
                {ALIGNMENT_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => updateField('billingAlignment', option.value)}
                    className={cn(
                      'p-3 rounded-lg border-2 transition-all text-sm font-medium',
                      alignment === option.value
                        ? 'border-amber-500 bg-amber-50 text-amber-700'
                        : 'border-stone-200 hover:border-stone-300 hover:bg-stone-50 text-stone-700'
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              {alignment === 'CUSTOM' && (
                <div className="p-3 bg-stone-50 rounded-lg border border-stone-200">
                  <Label className="text-sm font-medium">Custom Billing Day</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      type="number"
                      min={1}
                      max={28}
                      value={billingDay}
                      onChange={(e) => updateField('billingDay', parseInt(e.target.value) || 1)}
                      className="w-20"
                    />
                    <span className="text-sm text-muted-foreground">of each period</span>
                  </div>
                </div>
              )}
            </div>

            {/* Custom Payment Terms */}
            <div className="space-y-3 pt-4 border-t">
              <h3 className="font-medium">Custom Payment Terms</h3>
              <p className="text-sm text-muted-foreground">
                Override club defaults for this member only
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label className="text-sm">Custom Due Days</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Checkbox
                      checked={customDueDays !== null && customDueDays !== undefined}
                      onCheckedChange={(checked) =>
                        updateField('customDueDays', checked ? (clubSettings?.invoiceDueDays ?? 15) : null)
                      }
                    />
                    {customDueDays !== null && customDueDays !== undefined && (
                      <>
                        <Input
                          type="number"
                          min={0}
                          max={90}
                          value={customDueDays}
                          onChange={(e) =>
                            updateField('customDueDays', parseInt(e.target.value) || 0)
                          }
                          className="w-20"
                        />
                        <span className="text-sm text-muted-foreground">days</span>
                      </>
                    )}
                    {(customDueDays === null || customDueDays === undefined) && (
                      <span className="text-sm text-muted-foreground">
                        Use club default ({clubSettings?.invoiceDueDays ?? 15} days)
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <Label className="text-sm">Custom Grace Period</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Checkbox
                      checked={customGracePeriod !== null && customGracePeriod !== undefined}
                      onCheckedChange={(checked) =>
                        updateField('customGracePeriod', checked ? (clubSettings?.gracePeriodDays ?? 15) : null)
                      }
                    />
                    {customGracePeriod !== null && customGracePeriod !== undefined && (
                      <>
                        <Input
                          type="number"
                          min={0}
                          max={60}
                          value={customGracePeriod}
                          onChange={(e) =>
                            updateField('customGracePeriod', parseInt(e.target.value) || 0)
                          }
                          className="w-20"
                        />
                        <span className="text-sm text-muted-foreground">days</span>
                      </>
                    )}
                    {(customGracePeriod === null || customGracePeriod === undefined) && (
                      <span className="text-sm text-muted-foreground">
                        Use club default ({clubSettings?.gracePeriodDays ?? 15} days)
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Special Settings */}
            <div className="space-y-3 pt-4 border-t">
              <h3 className="font-medium">Special Settings</h3>
              <div className="space-y-3">
                <label className="flex items-center gap-2">
                  <Checkbox
                    checked={lateFeeExempt}
                    onCheckedChange={(checked) => updateField('lateFeeExempt', checked as boolean)}
                  />
                  <span className="text-sm">Exempt from late fees</span>
                </label>
                <label className="flex items-center gap-2">
                  <Checkbox
                    checked={autoPayEnabled}
                    onCheckedChange={(checked) => updateField('autoPayEnabled', checked as boolean)}
                  />
                  <span className="text-sm">Enable auto-pay</span>
                </label>
                {autoPayEnabled && (
                  <p className="ml-6 text-xs text-muted-foreground flex items-center gap-1">
                    <Info className="h-3 w-3" />
                    Auto-pay requires a saved payment method
                  </p>
                )}
              </div>
            </div>

            {/* Preview Card */}
            {preview && !isLoadingPreview && (
              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                <h4 className="text-sm font-medium text-amber-800 mb-2">
                  Next Billing Preview
                </h4>
                <div className="grid gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-amber-700">Period</span>
                    <span className="font-medium text-amber-900">
                      {formatDate(preview.periodStart)} - {formatDate(preview.periodEnd)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-amber-700">Due Date</span>
                    <span className="font-medium text-amber-900">
                      {formatDate(preview.dueDate)}
                    </span>
                  </div>
                  {preview.proratedAmount !== null && (
                    <div className="flex justify-between">
                      <span className="text-amber-700">Prorated Amount</span>
                      <span className="font-medium text-amber-900">
                        ฿{preview.proratedAmount.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        <DialogFooter className="mt-6 flex gap-2">
          <Button variant="outline" onClick={handleClose} disabled={isUpdating}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isUpdating || !hasChanges || isLoading}
            className="bg-gradient-to-br from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:opacity-50"
          >
            {isUpdating ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : showSuccess ? (
              <Check className="h-4 w-4 mr-2" />
            ) : null}
            {showSuccess ? 'Saved!' : 'Save Profile'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
