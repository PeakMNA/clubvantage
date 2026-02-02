'use client'

import { useState, useCallback, useMemo } from 'react'
import { Calendar, Download, Mail, Loader2, FileText, X } from 'lucide-react'
import { cn } from '@clubvantage/ui'
import { Button } from '@clubvantage/ui'
import { Input } from '@clubvantage/ui'
import { Label } from '@clubvantage/ui'
import { MemberCombobox, type MemberOption } from '@clubvantage/ui'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@clubvantage/ui'
import {
  MemberStatement,
  type StatementTransaction,
  type StatementMember,
} from './member-statement'

export interface StatementFormData {
  memberId: string
  periodStart: string
  periodEnd: string
}

interface StatementModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  members: MemberOption[]
  isLoadingMembers?: boolean
  onMemberSearch?: (query: string) => void
  /** Callback to fetch statement data */
  onFetchStatement: (data: StatementFormData) => Promise<{
    member: StatementMember
    openingBalance: number
    closingBalance: number
    transactions: StatementTransaction[]
  }>
  /** Callback when downloading PDF */
  onDownload?: (data: StatementFormData) => Promise<void>
  /** Callback when emailing statement */
  onEmail?: (data: StatementFormData) => Promise<void>
  isSubmitting?: boolean
}

// Date helper functions
function formatDateForInput(date: Date): string {
  return date.toISOString().split('T')[0] || ''
}

function getFirstDayOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function getLastDayOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0)
}

// Preset period options
type PeriodPreset = 'this-month' | 'last-month' | 'last-3-months' | 'last-6-months' | 'ytd' | 'custom'

const periodPresets: { id: PeriodPreset; label: string }[] = [
  { id: 'this-month', label: 'This Month' },
  { id: 'last-month', label: 'Last Month' },
  { id: 'last-3-months', label: 'Last 3 Months' },
  { id: 'last-6-months', label: 'Last 6 Months' },
  { id: 'ytd', label: 'Year to Date' },
  { id: 'custom', label: 'Custom Range' },
]

function getPresetDates(preset: PeriodPreset): { start: Date; end: Date } {
  const now = new Date()

  switch (preset) {
    case 'this-month':
      return {
        start: getFirstDayOfMonth(now),
        end: now,
      }
    case 'last-month': {
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      return {
        start: getFirstDayOfMonth(lastMonth),
        end: getLastDayOfMonth(lastMonth),
      }
    }
    case 'last-3-months':
      return {
        start: new Date(now.getFullYear(), now.getMonth() - 3, 1),
        end: now,
      }
    case 'last-6-months':
      return {
        start: new Date(now.getFullYear(), now.getMonth() - 6, 1),
        end: now,
      }
    case 'ytd':
      return {
        start: new Date(now.getFullYear(), 0, 1),
        end: now,
      }
    case 'custom':
    default:
      return {
        start: getFirstDayOfMonth(now),
        end: now,
      }
  }
}

export function StatementModal({
  open,
  onOpenChange,
  members,
  isLoadingMembers = false,
  onMemberSearch,
  onFetchStatement,
  onDownload,
  onEmail,
  isSubmitting = false,
}: StatementModalProps) {
  const [memberId, setMemberId] = useState<string>()
  const [periodPreset, setPeriodPreset] = useState<PeriodPreset>('this-month')
  const [periodStart, setPeriodStart] = useState(
    formatDateForInput(getPresetDates('this-month').start)
  )
  const [periodEnd, setPeriodEnd] = useState(
    formatDateForInput(getPresetDates('this-month').end)
  )
  const [error, setError] = useState<string>()
  const [isLoadingStatement, setIsLoadingStatement] = useState(false)
  const [statementData, setStatementData] = useState<{
    member: StatementMember
    openingBalance: number
    closingBalance: number
    transactions: StatementTransaction[]
  } | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  // Get selected member info
  const selectedMember = useMemo(
    () => members.find((m) => m.id === memberId),
    [members, memberId]
  )

  const handlePresetChange = (preset: PeriodPreset) => {
    setPeriodPreset(preset)
    if (preset !== 'custom') {
      const dates = getPresetDates(preset)
      setPeriodStart(formatDateForInput(dates.start))
      setPeriodEnd(formatDateForInput(dates.end))
    }
  }

  const resetForm = () => {
    setMemberId(undefined)
    setPeriodPreset('this-month')
    const dates = getPresetDates('this-month')
    setPeriodStart(formatDateForInput(dates.start))
    setPeriodEnd(formatDateForInput(dates.end))
    setError(undefined)
    setStatementData(null)
    setShowPreview(false)
  }

  const handleClose = () => {
    if (!isSubmitting && !isLoadingStatement) {
      resetForm()
      onOpenChange(false)
    }
  }

  const handleGenerateStatement = useCallback(async () => {
    setError(undefined)

    if (!memberId) {
      setError('Please select a member')
      return
    }

    if (!periodStart || !periodEnd) {
      setError('Please select a date range')
      return
    }

    if (new Date(periodStart) > new Date(periodEnd)) {
      setError('Start date must be before end date')
      return
    }

    setIsLoadingStatement(true)
    try {
      const data = await onFetchStatement({
        memberId,
        periodStart,
        periodEnd,
      })
      setStatementData(data)
      setShowPreview(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate statement')
    } finally {
      setIsLoadingStatement(false)
    }
  }, [memberId, periodStart, periodEnd, onFetchStatement])

  const handleDownload = async () => {
    if (!memberId) return
    try {
      await onDownload?.({ memberId, periodStart, periodEnd })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download statement')
    }
  }

  const handleEmail = async () => {
    if (!memberId) return
    try {
      await onEmail?.({ memberId, periodStart, periodEnd })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to email statement')
    }
  }

  const handleBack = () => {
    setShowPreview(false)
    setStatementData(null)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className={cn('max-h-[90vh] overflow-y-auto', showPreview ? 'max-w-5xl' : 'max-w-lg')}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {showPreview ? 'Statement Preview' : 'Generate Member Statement'}
          </DialogTitle>
        </DialogHeader>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {!showPreview ? (
          // Form View
          <div className="space-y-6 py-4">
            {/* Member Selection */}
            <div className="space-y-2">
              <Label>Member *</Label>
              <MemberCombobox
                members={members}
                value={memberId}
                onValueChange={setMemberId}
                onSearch={onMemberSearch}
                isLoading={isLoadingMembers}
                placeholder="Search and select member..."
              />
            </div>

            {/* Period Presets */}
            <div className="space-y-2">
              <Label>Statement Period</Label>
              <div className="flex flex-wrap gap-2">
                {periodPresets.map((preset) => (
                  <Button
                    key={preset.id}
                    type="button"
                    variant={periodPreset === preset.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handlePresetChange(preset.id)}
                    className={
                      periodPreset === preset.id
                        ? 'bg-gradient-to-br from-amber-500 to-amber-600 text-white'
                        : ''
                    }
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Custom Date Range */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>From Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="date"
                    value={periodStart}
                    onChange={(e) => {
                      setPeriodStart(e.target.value)
                      setPeriodPreset('custom')
                    }}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>To Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="date"
                    value={periodEnd}
                    onChange={(e) => {
                      setPeriodEnd(e.target.value)
                      setPeriodPreset('custom')
                    }}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            {/* Selected Member Info */}
            {selectedMember && (
              <div className="rounded-lg border border-border bg-muted/50 p-4">
                <p className="text-sm font-medium">{selectedMember.firstName} {selectedMember.lastName}</p>
                <p className="text-xs text-muted-foreground">
                  {selectedMember.memberId} • {selectedMember.email || 'No email'}
                </p>
              </div>
            )}
          </div>
        ) : (
          // Preview View
          <div className="py-4">
            {statementData && (
              <MemberStatement
                member={statementData.member}
                periodStart={new Date(periodStart)}
                periodEnd={new Date(periodEnd)}
                openingBalance={statementData.openingBalance}
                closingBalance={statementData.closingBalance}
                transactions={statementData.transactions}
                isLoading={false}
                onDownload={onDownload ? handleDownload : undefined}
                onEmail={onEmail ? handleEmail : undefined}
              />
            )}
          </div>
        )}

        <DialogFooter className="flex gap-2">
          {showPreview ? (
            <>
              <Button variant="outline" onClick={handleBack} disabled={isSubmitting}>
                Back
              </Button>
              <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
                Close
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={handleClose} disabled={isLoadingStatement}>
                Cancel
              </Button>
              <Button
                onClick={handleGenerateStatement}
                disabled={isLoadingStatement || !memberId}
                className="bg-gradient-to-br from-amber-500 to-amber-600 text-white"
              >
                {isLoadingStatement ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <FileText className="h-4 w-4 mr-2" />
                )}
                Generate Statement
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
