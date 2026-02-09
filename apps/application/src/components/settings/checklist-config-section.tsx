'use client'

import { useState, useEffect, useCallback } from 'react'
import { Loader2, Check, ClipboardCheck, ChevronDown, ChevronRight } from 'lucide-react'
import { Button, cn } from '@clubvantage/ui'
import {
  useClubBillingSettings,
  type UpdateClubBillingSettingsInput,
} from '@/hooks/use-billing-settings'

interface ChecklistConfigSectionProps {
  id: string
}

interface ChecklistStep {
  stepKey: string
  phase: string
  label: string
  description: string
  enforcement: 'REQUIRED' | 'OPTIONAL'
  verification: 'MANUAL' | 'AUTO' | 'SYSTEM_ACTION'
  sortOrder: number
}

const ENFORCEMENT_OPTIONS = [
  { value: 'REQUIRED', label: 'Required' },
  { value: 'OPTIONAL', label: 'Optional' },
] as const

const DEFAULT_TEMPLATE: ChecklistStep[] = [
  // Phase 1: Pre-Closing
  { stepKey: 'review_invoices', phase: 'Pre-Closing', label: 'Review all member invoices', description: 'Verify all invoices are correct and accounted for', enforcement: 'REQUIRED', verification: 'MANUAL', sortOrder: 1 },
  { stepKey: 'reconcile_pos', phase: 'Pre-Closing', label: 'Reconcile POS transactions', description: 'Match POS transactions to member accounts', enforcement: 'REQUIRED', verification: 'MANUAL', sortOrder: 2 },
  { stepKey: 'follow_up_disputed', phase: 'Pre-Closing', label: 'Follow up on disputed charges', description: 'Resolve any open disputes before closing', enforcement: 'OPTIONAL', verification: 'MANUAL', sortOrder: 3 },
  { stepKey: 'send_reminders', phase: 'Pre-Closing', label: 'Send final payment reminders', description: 'Notify members with outstanding balances', enforcement: 'OPTIONAL', verification: 'MANUAL', sortOrder: 4 },
  // Phase 2: Period-End Cut-Off
  { stepKey: 'set_cutoff', phase: 'Period-End Cut-Off', label: 'Set transaction cut-off time', description: 'Define the deadline for including transactions', enforcement: 'REQUIRED', verification: 'MANUAL', sortOrder: 5 },
  { stepKey: 'process_final', phase: 'Period-End Cut-Off', label: 'Process final transactions', description: 'Process any pending transactions before cut-off', enforcement: 'REQUIRED', verification: 'MANUAL', sortOrder: 6 },
  { stepKey: 'lock_posting', phase: 'Period-End Cut-Off', label: 'Lock transaction posting', description: 'Prevent new transactions from being posted', enforcement: 'REQUIRED', verification: 'SYSTEM_ACTION', sortOrder: 7 },
  // Phase 3: Statement Generation
  { stepKey: 'generate_statements', phase: 'Statement Generation', label: 'Generate member statements', description: 'Run the statement generation process', enforcement: 'REQUIRED', verification: 'SYSTEM_ACTION', sortOrder: 8 },
  { stepKey: 'review_statements', phase: 'Statement Generation', label: 'Review generated statements', description: 'Verify statement accuracy before distribution', enforcement: 'REQUIRED', verification: 'MANUAL', sortOrder: 9 },
  { stepKey: 'distribute_statements', phase: 'Statement Generation', label: 'Distribute statements to members', description: 'Send statements via configured delivery methods', enforcement: 'REQUIRED', verification: 'SYSTEM_ACTION', sortOrder: 10 },
  // Phase 4: Post-Close
  { stepKey: 'verify_totals', phase: 'Post-Close', label: 'Verify period totals', description: 'Confirm opening/closing balances match', enforcement: 'REQUIRED', verification: 'MANUAL', sortOrder: 11 },
  { stepKey: 'export_gl', phase: 'Post-Close', label: 'Export to General Ledger', description: 'Send period totals to GL system', enforcement: 'OPTIONAL', verification: 'SYSTEM_ACTION', sortOrder: 12 },
]

// Group steps by phase
function groupByPhase(steps: ChecklistStep[]): Map<string, ChecklistStep[]> {
  const map = new Map<string, ChecklistStep[]>()
  for (const step of steps) {
    const existing = map.get(step.phase) || []
    existing.push(step)
    map.set(step.phase, existing)
  }
  return map
}

export function ChecklistConfigSection({ id }: ChecklistConfigSectionProps) {
  const { settings, isLoading, updateSettings, isUpdating } = useClubBillingSettings()
  const [steps, setSteps] = useState<ChecklistStep[]>(DEFAULT_TEMPLATE)
  const [showSuccess, setShowSuccess] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [collapsedPhases, setCollapsedPhases] = useState<Set<string>>(new Set())

  // Initialize from settings
  useEffect(() => {
    if (settings) {
      const template = settings.closeChecklistTemplate as ChecklistStep[]
      if (template && template.length > 0) {
        setSteps(template)
      } else {
        setSteps(DEFAULT_TEMPLATE)
      }
      setHasChanges(false)
    }
  }, [settings])

  const updateStepEnforcement = useCallback((stepKey: string, enforcement: ChecklistStep['enforcement']) => {
    setSteps(prev => prev.map(s => s.stepKey === stepKey ? { ...s, enforcement } : s))
    setHasChanges(true)
  }, [])

  const togglePhase = useCallback((phase: string) => {
    setCollapsedPhases(prev => {
      const next = new Set(prev)
      if (next.has(phase)) {
        next.delete(phase)
      } else {
        next.add(phase)
      }
      return next
    })
  }, [])

  const handleSave = async () => {
    try {
      const input: UpdateClubBillingSettingsInput = {
        closeChecklistTemplate: steps,
      }
      await updateSettings(input)
      setShowSuccess(true)
      setHasChanges(false)
      setTimeout(() => setShowSuccess(false), 2000)
    } catch (error) {
      console.error('Failed to save checklist config:', error)
    }
  }

  const handleResetToDefaults = () => {
    setSteps(DEFAULT_TEMPLATE)
    setHasChanges(true)
  }

  const phaseGroups = groupByPhase(steps)

  if (isLoading) {
    return (
      <section id={id} className="border rounded-xl p-6 space-y-6 scroll-mt-24 shadow-lg shadow-stone-200/30">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
          <span className="ml-2 text-muted-foreground">Loading checklist configuration...</span>
        </div>
      </section>
    )
  }

  return (
    <section id={id} className="border rounded-xl p-6 space-y-6 scroll-mt-24 shadow-lg shadow-stone-200/30">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-amber-500" />
            Close Checklist Configuration
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Configure required and optional steps for AR period close
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleResetToDefaults}
          className="text-xs"
        >
          Reset to Defaults
        </Button>
      </div>

      {/* Phases */}
      <div className="space-y-3">
        {Array.from(phaseGroups.entries()).map(([phase, phaseSteps]) => {
          const isCollapsed = collapsedPhases.has(phase)
          const requiredCount = phaseSteps.filter(s => s.enforcement === 'REQUIRED').length

          return (
            <div key={phase} className="border rounded-lg overflow-hidden">
              {/* Phase Header */}
              <button
                type="button"
                onClick={() => togglePhase(phase)}
                className="w-full flex items-center gap-2 px-4 py-3 bg-stone-50 hover:bg-stone-100 transition-colors text-left"
              >
                {isCollapsed ? (
                  <ChevronRight className="h-4 w-4 text-stone-500" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-stone-500" />
                )}
                <span className="font-medium text-sm">{phase}</span>
                <span className="text-xs text-muted-foreground ml-auto">
                  {requiredCount} required, {phaseSteps.length - requiredCount} optional
                </span>
              </button>

              {/* Phase Steps */}
              {!isCollapsed && (
                <div className="divide-y">
                  {phaseSteps.map((step) => (
                    <div key={step.stepKey} className="flex items-center gap-4 px-4 py-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{step.label}</p>
                        <p className="text-xs text-muted-foreground truncate">{step.description}</p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {step.verification === 'SYSTEM_ACTION' && (
                          <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded mr-2">Auto</span>
                        )}
                        <select
                          value={step.enforcement}
                          onChange={(e) => updateStepEnforcement(step.stepKey, e.target.value as ChecklistStep['enforcement'])}
                          className={cn(
                            'text-xs rounded-md border px-2 py-1 cursor-pointer',
                            step.enforcement === 'REQUIRED'
                              ? 'border-amber-300 bg-amber-50 text-amber-700'
                              : 'border-stone-200 bg-white text-stone-600'
                          )}
                        >
                          {ENFORCEMENT_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
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
