'use client'

import { Lock, Wrench } from 'lucide-react'
import { cn, Button } from '@clubvantage/ui'

interface BlockElementProps {
  block: {
    id: string
    type: 'STARTER' | 'MAINTENANCE'
    reason: string
    createdBy?: string
    createdByName?: string
    createdAt?: string
    recurring?: boolean
    recurrencePattern?: string
    recurrenceEndDate?: string
  }
  onRelease: (blockId: string) => void
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function formatRecurrencePattern(pattern: string): string {
  const patterns: Record<string, string> = {
    daily: 'Daily',
    weekly: 'Weekly',
    monthly: 'Monthly',
    weekdays: 'Weekdays',
    weekends: 'Weekends',
  }
  return patterns[pattern.toLowerCase()] || pattern
}

export function BlockElement({ block, onRelease }: BlockElementProps) {
  const isStarter = block.type === 'STARTER'
  const isMaintenance = block.type === 'MAINTENANCE'

  const Icon = isStarter ? Lock : Wrench

  return (
    <div
      className={cn(
        'min-h-[48px] rounded-lg border p-3',
        isStarter && 'border-gray-300 bg-gray-100',
        isMaintenance && 'border-amber-200 bg-amber-50'
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2">
          <Icon
            className={cn(
              'mt-0.5 h-4 w-4 flex-shrink-0',
              isStarter && 'text-gray-700',
              isMaintenance && 'text-amber-800'
            )}
          />
          <div className="flex flex-col gap-1">
            <span
              className={cn(
                'text-sm font-medium',
                isStarter && 'text-gray-700',
                isMaintenance && 'text-amber-800'
              )}
            >
              {block.reason}
            </span>
            <div className="flex flex-col gap-0.5">
              {block.createdByName && (
                <span className="text-xs text-muted-foreground">
                  Blocked by {block.createdByName}
                </span>
              )}
              {block.createdAt && (
                <span className="text-xs text-muted-foreground">
                  {formatDate(block.createdAt)}
                </span>
              )}
              {isMaintenance && block.recurring && (
                <span className="text-xs text-muted-foreground">
                  {block.recurrencePattern && formatRecurrencePattern(block.recurrencePattern)}
                  {block.recurrenceEndDate && ` until ${formatDate(block.recurrenceEndDate)}`}
                </span>
              )}
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRelease(block.id)}
          className={cn(
            'h-7 px-2 text-xs',
            isStarter && 'text-gray-600 hover:bg-gray-200 hover:text-gray-800',
            isMaintenance && 'text-amber-700 hover:bg-amber-100 hover:text-amber-900'
          )}
        >
          Release
        </Button>
      </div>
    </div>
  )
}
