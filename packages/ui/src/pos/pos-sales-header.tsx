'use client'

import * as React from 'react'
import { cn } from '../lib/utils'
import { Search, UserPlus, Plus } from 'lucide-react'
import { Button } from '../primitives/button'
import { formatDistanceToNow } from 'date-fns'

// ============================================================================
// Types
// ============================================================================

export interface POSSalesHeaderProps {
  ticketNumber?: string
  member?: { id: string; name: string; memberNumber?: string } | null
  staffName?: string
  outletName?: string
  startedAt?: Date
  onMemberLookup?: () => void
  onNewTicket?: () => void
  className?: string
}

// ============================================================================
// Helper Functions
// ============================================================================

function formatRelativeTime(date: Date): string {
  return formatDistanceToNow(date, { addSuffix: false })
    .replace(' minutes', 'm')
    .replace(' minute', 'm')
    .replace(' hours', 'h')
    .replace(' hour', 'h')
    .replace(' seconds', 's')
    .replace(' second', 's')
    .replace('less than a', '<1')
    .replace('about ', '')
}

// ============================================================================
// Main Component
// ============================================================================

export function POSSalesHeader({
  ticketNumber,
  member,
  staffName,
  outletName,
  startedAt,
  onMemberLookup,
  onNewTicket,
  className,
}: POSSalesHeaderProps) {
  // Update relative time every minute
  const [relativeTime, setRelativeTime] = React.useState<string | null>(
    startedAt ? formatRelativeTime(startedAt) : null
  )

  React.useEffect(() => {
    if (!startedAt) {
      setRelativeTime(null)
      return
    }

    setRelativeTime(formatRelativeTime(startedAt))

    const interval = setInterval(() => {
      setRelativeTime(formatRelativeTime(startedAt))
    }, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [startedAt])

  // Build the info line parts
  const infoParts: string[] = []

  if (member) {
    const memberInfo = member.memberNumber
      ? `${member.name} (${member.memberNumber})`
      : member.name
    infoParts.push(memberInfo)
  } else {
    infoParts.push('Guest')
  }

  if (outletName) {
    infoParts.push(outletName)
  }

  if (relativeTime) {
    infoParts.push(`${relativeTime} ago`)
  }

  return (
    <div
      className={cn(
        'flex items-start justify-between gap-4 px-4 py-3 bg-stone-100',
        className
      )}
    >
      {/* Left: Ticket info */}
      <div className="flex-1 min-w-0">
        {/* Ticket number */}
        <div className="flex items-center gap-2">
          {ticketNumber ? (
            <span className="font-bold text-stone-900 text-sm">
              #{ticketNumber}
            </span>
          ) : (
            <span className="text-stone-500 text-sm italic">No ticket</span>
          )}
          {staffName && (
            <span className="text-xs text-stone-500">by {staffName}</span>
          )}
        </div>

        {/* Member/outlet/time info */}
        <div className="flex items-center gap-1.5 mt-0.5 text-xs text-stone-600">
          {member ? (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded font-medium">
              {member.memberNumber || 'M'}
              <span className="text-blue-600">{member.name}</span>
            </span>
          ) : (
            <span className="inline-flex items-center px-1.5 py-0.5 bg-stone-200 text-stone-600 rounded font-medium">
              Guest
            </span>
          )}
          {outletName && (
            <>
              <span className="text-stone-400">•</span>
              <span>{outletName}</span>
            </>
          )}
          {relativeTime && (
            <>
              <span className="text-stone-400">•</span>
              <span>{relativeTime} ago</span>
            </>
          )}
        </div>
      </div>

      {/* Right: Action buttons */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <Button
          variant="outline"
          size="sm"
          onClick={onMemberLookup}
          className="gap-1.5 h-8"
          aria-label="Member lookup"
        >
          <Search className="h-3.5 w-3.5" />
          <UserPlus className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="default"
          size="sm"
          onClick={onNewTicket}
          className="gap-1.5 h-8"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>New</span>
        </Button>
      </div>
    </div>
  )
}
