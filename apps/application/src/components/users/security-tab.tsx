'use client'

import { useState } from 'react'
import { Loader2, Check } from 'lucide-react'
import { Button } from '@clubvantage/ui'
import { Input } from '@clubvantage/ui'
import { Label } from '@clubvantage/ui'
import { Checkbox } from '@clubvantage/ui'
import {
  defaultPasswordPolicy,
  defaultSessionPolicy,
  defaultTwoFactorPolicy,
  defaultLockoutPolicy,
} from './mock-data'
import type {
  PasswordPolicy,
  SessionPolicy,
  TwoFactorPolicy,
  LockoutPolicy,
} from './types'

interface PolicyCardProps {
  title: string
  children: React.ReactNode
  onSave: () => Promise<void>
  hasChanges: boolean
}

function PolicyCard({ title, children, onSave, hasChanges }: PolicyCardProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    await onSave()
    setIsSaving(false)
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 2000)
  }

  return (
    <div className="border rounded-lg p-6 space-y-4">
      <h3 className="font-semibold text-lg">{title}</h3>
      {children}
      <div className="flex justify-end pt-2">
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
          {showSuccess ? 'Saved' : 'Save Policy'}
        </Button>
      </div>
    </div>
  )
}

export function SecurityTab() {
  const [passwordPolicy, setPasswordPolicy] = useState<PasswordPolicy>(defaultPasswordPolicy)
  const [sessionPolicy, setSessionPolicy] = useState<SessionPolicy>(defaultSessionPolicy)
  const [twoFactorPolicy, setTwoFactorPolicy] = useState<TwoFactorPolicy>(defaultTwoFactorPolicy)
  const [lockoutPolicy, setLockoutPolicy] = useState<LockoutPolicy>(defaultLockoutPolicy)

  // Track changes
  const [passwordChanged, setPasswordChanged] = useState(false)
  const [sessionChanged, setSessionChanged] = useState(false)
  const [twoFactorChanged, setTwoFactorChanged] = useState(false)
  const [lockoutChanged, setLockoutChanged] = useState(false)

  const saveMock = async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Password Policy */}
      <PolicyCard
        title="Password Policy"
        hasChanges={passwordChanged}
        onSave={async () => {
          await saveMock()
          setPasswordChanged(false)
        }}
      >
        <div className="space-y-6">
          <div className="space-y-3">
            <Label>Minimum Length: {passwordPolicy.minLength} characters</Label>
            <input
              type="range"
              value={passwordPolicy.minLength}
              onChange={(e) => {
                setPasswordPolicy({ ...passwordPolicy, minLength: parseInt(e.target.value) })
                setPasswordChanged(true)
              }}
              min={8}
              max={32}
              step={1}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
            <p className="text-xs text-muted-foreground">Range: 8-32 characters</p>
          </div>

          <div className="space-y-3">
            <Label>Complexity Requirements</Label>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex items-center gap-2">
                <Checkbox
                  checked={passwordPolicy.requireUppercase}
                  onCheckedChange={(checked) => {
                    setPasswordPolicy({
                      ...passwordPolicy,
                      requireUppercase: checked as boolean,
                    })
                    setPasswordChanged(true)
                  }}
                />
                <span className="text-sm">Uppercase letter</span>
              </label>
              <label className="flex items-center gap-2">
                <Checkbox
                  checked={passwordPolicy.requireLowercase}
                  onCheckedChange={(checked) => {
                    setPasswordPolicy({
                      ...passwordPolicy,
                      requireLowercase: checked as boolean,
                    })
                    setPasswordChanged(true)
                  }}
                />
                <span className="text-sm">Lowercase letter</span>
              </label>
              <label className="flex items-center gap-2">
                <Checkbox
                  checked={passwordPolicy.requireNumber}
                  onCheckedChange={(checked) => {
                    setPasswordPolicy({
                      ...passwordPolicy,
                      requireNumber: checked as boolean,
                    })
                    setPasswordChanged(true)
                  }}
                />
                <span className="text-sm">Number</span>
              </label>
              <label className="flex items-center gap-2">
                <Checkbox
                  checked={passwordPolicy.requireSpecialChar}
                  onCheckedChange={(checked) => {
                    setPasswordPolicy({
                      ...passwordPolicy,
                      requireSpecialChar: checked as boolean,
                    })
                    setPasswordChanged(true)
                  }}
                />
                <span className="text-sm">Special character</span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="expiration">Password Expiration (days)</Label>
              <Input
                id="expiration"
                type="number"
                value={passwordPolicy.expirationDays}
                onChange={(e) => {
                  setPasswordPolicy({
                    ...passwordPolicy,
                    expirationDays: parseInt(e.target.value) || 0,
                  })
                  setPasswordChanged(true)
                }}
                min={0}
              />
              <p className="text-xs text-muted-foreground mt-1">0 = never expire</p>
            </div>
            <div>
              <Label htmlFor="history">Password History</Label>
              <Input
                id="history"
                type="number"
                value={passwordPolicy.historyCount}
                onChange={(e) => {
                  setPasswordPolicy({
                    ...passwordPolicy,
                    historyCount: parseInt(e.target.value) || 0,
                  })
                  setPasswordChanged(true)
                }}
                min={0}
                max={24}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Prevent reuse of recent passwords
              </p>
            </div>
          </div>
        </div>
      </PolicyCard>

      {/* Session Policy */}
      <PolicyCard
        title="Session Policy"
        hasChanges={sessionChanged}
        onSave={async () => {
          await saveMock()
          setSessionChanged(false)
        }}
      >
        <div className="space-y-6">
          <div className="space-y-3">
            <Label>
              Idle Timeout: {sessionPolicy.idleTimeoutMinutes} minutes
            </Label>
            <input
              type="range"
              value={sessionPolicy.idleTimeoutMinutes}
              onChange={(e) => {
                setSessionPolicy({ ...sessionPolicy, idleTimeoutMinutes: parseInt(e.target.value) })
                setSessionChanged(true)
              }}
              min={5}
              max={120}
              step={5}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
            <p className="text-xs text-muted-foreground">Range: 5-120 minutes</p>
          </div>

          <div>
            <Label htmlFor="maxSessions">Max Concurrent Sessions</Label>
            <Input
              id="maxSessions"
              type="number"
              value={sessionPolicy.maxConcurrentSessions}
              onChange={(e) => {
                setSessionPolicy({
                  ...sessionPolicy,
                  maxConcurrentSessions: parseInt(e.target.value) || 1,
                })
                setSessionChanged(true)
              }}
              min={1}
              max={10}
              className="w-32"
            />
            <p className="text-xs text-muted-foreground mt-1">per user</p>
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-2">
              <Checkbox
                checked={sessionPolicy.allowRememberDevice}
                onCheckedChange={(checked) => {
                  setSessionPolicy({
                    ...sessionPolicy,
                    allowRememberDevice: checked as boolean,
                  })
                  setSessionChanged(true)
                }}
              />
              <span className="text-sm">Allow "Remember me" option on login</span>
            </label>
            {sessionPolicy.allowRememberDevice && (
              <div className="ml-6">
                <Label htmlFor="rememberDays">Remember device for</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="rememberDays"
                    type="number"
                    value={sessionPolicy.rememberDeviceDays}
                    onChange={(e) => {
                      setSessionPolicy({
                        ...sessionPolicy,
                        rememberDeviceDays: parseInt(e.target.value) || 7,
                      })
                      setSessionChanged(true)
                    }}
                    min={1}
                    max={90}
                    className="w-20"
                  />
                  <span className="text-sm text-muted-foreground">days</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </PolicyCard>

      {/* Two-Factor Authentication */}
      <PolicyCard
        title="Two-Factor Authentication"
        hasChanges={twoFactorChanged}
        onSave={async () => {
          await saveMock()
          setTwoFactorChanged(false)
        }}
      >
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Label>Enable 2FA</Label>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="twoFactor"
                  checked={twoFactorPolicy.enabled}
                  onChange={() => {
                    setTwoFactorPolicy({ ...twoFactorPolicy, enabled: true })
                    setTwoFactorChanged(true)
                  }}
                  className="h-4 w-4"
                />
                <span className="text-sm">On</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="twoFactor"
                  checked={!twoFactorPolicy.enabled}
                  onChange={() => {
                    setTwoFactorPolicy({
                      ...twoFactorPolicy,
                      enabled: false,
                      required: false,
                    })
                    setTwoFactorChanged(true)
                  }}
                  className="h-4 w-4"
                />
                <span className="text-sm">Off</span>
              </label>
            </div>
          </div>

          {twoFactorPolicy.enabled && (
            <>
              <label className="flex items-center gap-2">
                <Checkbox
                  checked={twoFactorPolicy.required}
                  onCheckedChange={(checked) => {
                    setTwoFactorPolicy({
                      ...twoFactorPolicy,
                      required: checked as boolean,
                    })
                    setTwoFactorChanged(true)
                  }}
                />
                <span className="text-sm">Make 2FA mandatory for all users</span>
              </label>

              <div className="space-y-2">
                <Label>Allowed Methods</Label>
                <label className="flex items-center gap-2">
                  <Checkbox
                    checked={twoFactorPolicy.allowAuthenticator}
                    onCheckedChange={(checked) => {
                      setTwoFactorPolicy({
                        ...twoFactorPolicy,
                        allowAuthenticator: checked as boolean,
                      })
                      setTwoFactorChanged(true)
                    }}
                  />
                  <span className="text-sm">Authenticator App (TOTP)</span>
                </label>
                <label className="flex items-center gap-2">
                  <Checkbox
                    checked={twoFactorPolicy.allowSms}
                    onCheckedChange={(checked) => {
                      setTwoFactorPolicy({
                        ...twoFactorPolicy,
                        allowSms: checked as boolean,
                      })
                      setTwoFactorChanged(true)
                    }}
                  />
                  <span className="text-sm">
                    SMS{' '}
                    <span className="text-muted-foreground">
                      (additional charges may apply)
                    </span>
                  </span>
                </label>
              </div>
            </>
          )}
        </div>
      </PolicyCard>

      {/* Account Lockout */}
      <PolicyCard
        title="Account Lockout"
        hasChanges={lockoutChanged}
        onSave={async () => {
          await saveMock()
          setLockoutChanged(false)
        }}
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="failedAttempts">Failed Attempts Threshold</Label>
            <div className="flex items-center gap-2">
              <Input
                id="failedAttempts"
                type="number"
                value={lockoutPolicy.failedAttemptsThreshold}
                onChange={(e) => {
                  setLockoutPolicy({
                    ...lockoutPolicy,
                    failedAttemptsThreshold: parseInt(e.target.value) || 3,
                  })
                  setLockoutChanged(true)
                }}
                min={3}
                max={10}
                className="w-20"
              />
              <span className="text-sm text-muted-foreground">attempts</span>
            </div>
          </div>

          <div>
            <Label htmlFor="lockoutDuration">Lockout Duration</Label>
            <div className="flex items-center gap-2">
              <Input
                id="lockoutDuration"
                type="number"
                value={lockoutPolicy.lockoutDurationMinutes}
                onChange={(e) => {
                  setLockoutPolicy({
                    ...lockoutPolicy,
                    lockoutDurationMinutes: parseInt(e.target.value) || 15,
                  })
                  setLockoutChanged(true)
                }}
                min={5}
                max={1440}
                className="w-20"
              />
              <span className="text-sm text-muted-foreground">minutes</span>
            </div>
          </div>

          <label className="flex items-center gap-2">
            <Checkbox
              checked={lockoutPolicy.autoUnlock}
              onCheckedChange={(checked) => {
                setLockoutPolicy({
                  ...lockoutPolicy,
                  autoUnlock: checked as boolean,
                })
                setLockoutChanged(true)
              }}
            />
            <span className="text-sm">Auto-unlock after duration</span>
          </label>
          {!lockoutPolicy.autoUnlock && (
            <p className="text-xs text-muted-foreground ml-6">
              Admin must manually unlock locked accounts
            </p>
          )}
        </div>
      </PolicyCard>
    </div>
  )
}
