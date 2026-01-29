'use client'

import { cn } from '@clubvantage/ui'

interface AuditEntry {
  id: string
  action: string
  timestamp: string
  userName: string
  userRole?: string
  details?: Record<string, unknown>
}

interface BookingHistoryTabProps {
  entries: AuditEntry[]
  isLoading?: boolean
  activeTab: 'details' | 'history'
  onTabChange: (tab: 'details' | 'history') => void
}

const ACTION_DOT_COLORS: Record<string, string> = {
  created: 'bg-emerald-500',
  modified: 'bg-blue-500',
  moved: 'bg-purple-500',
  player_added: 'bg-teal-500',
  player_removed: 'bg-orange-500',
  checked_in: 'bg-emerald-500',
  cancelled: 'bg-red-500',
  no_show: 'bg-red-500',
}

const ACTION_LABELS: Record<string, string> = {
  created: 'Created',
  modified: 'Modified',
  moved: 'Moved',
  player_added: 'Player added',
  player_removed: 'Player removed',
  checked_in: 'Checked in',
  cancelled: 'Cancelled',
  no_show: 'No show',
}

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  }) + ', ' + date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

function formatDetails(action: string, details?: Record<string, unknown>): string | null {
  if (!details) return null

  switch (action) {
    case 'player_added':
      return details.playerName ? `Added: ${details.playerName}${details.playerType ? ` (${details.playerType})` : ''}` : null
    case 'player_removed':
      return details.playerName ? `Removed: ${details.playerName}` : null
    case 'moved':
      if (details.from && details.to) {
        return `From: ${details.from} → To: ${details.to}`
      }
      return null
    case 'modified':
      if (details.field && details.from !== undefined && details.to !== undefined) {
        return `${details.field}: ${details.from} → ${details.to}`
      }
      return null
    default:
      return null
  }
}

function AuditEntryItem({ entry }: { entry: AuditEntry }) {
  const dotColor = ACTION_DOT_COLORS[entry.action] || 'bg-stone-400'
  const actionLabel = ACTION_LABELS[entry.action] || entry.action
  const detailsText = formatDetails(entry.action, entry.details)

  return (
    <div className="border-l-2 border-stone-200 pl-4 py-3 relative">
      <div
        className={cn(
          'absolute left-[-5px] top-4 w-2 h-2 rounded-full',
          dotColor
        )}
      />
      <div className="flex items-start justify-between gap-2">
        <span className="text-sm font-medium text-stone-900">{actionLabel}</span>
        <span className="text-xs text-stone-500 whitespace-nowrap">
          {formatTimestamp(entry.timestamp)}
        </span>
      </div>
      <div className="text-sm text-stone-600">
        by {entry.userName}{entry.userRole ? ` (${entry.userRole})` : ''}
      </div>
      {detailsText && (
        <div className="text-xs text-stone-500 mt-1">{detailsText}</div>
      )}
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-0">
      {[1, 2, 3].map((i) => (
        <div key={i} className="border-l-2 border-stone-200 pl-4 py-3 relative animate-pulse">
          <div className="absolute left-[-5px] top-4 w-2 h-2 rounded-full bg-stone-300" />
          <div className="flex items-start justify-between gap-2">
            <div className="h-4 w-24 bg-stone-200 rounded" />
            <div className="h-3 w-28 bg-stone-200 rounded" />
          </div>
          <div className="h-4 w-36 bg-stone-200 rounded mt-1" />
        </div>
      ))}
    </div>
  )
}

export function BookingHistoryTab({
  entries,
  isLoading,
  activeTab,
  onTabChange,
}: BookingHistoryTabProps) {
  return (
    <div>
      <div className="flex gap-4 border-b border-stone-200">
        <button
          type="button"
          onClick={() => onTabChange('details')}
          className={cn(
            'pb-2 text-sm transition-colors',
            activeTab === 'details'
              ? 'text-stone-900 font-medium border-b-2 border-emerald-500'
              : 'text-stone-500 hover:text-stone-700'
          )}
        >
          Details
        </button>
        <button
          type="button"
          onClick={() => onTabChange('history')}
          className={cn(
            'pb-2 text-sm transition-colors',
            activeTab === 'history'
              ? 'text-stone-900 font-medium border-b-2 border-emerald-500'
              : 'text-stone-500 hover:text-stone-700'
          )}
        >
          History
        </button>
      </div>

      {activeTab === 'history' && (
        <div className="mt-4">
          {isLoading ? (
            <LoadingSkeleton />
          ) : entries.length === 0 ? (
            <p className="text-sm text-stone-500 py-4">No history available</p>
          ) : (
            <div className="space-y-0">
              {entries.map((entry) => (
                <AuditEntryItem key={entry.id} entry={entry} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
