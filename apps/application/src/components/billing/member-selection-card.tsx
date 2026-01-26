'use client'

import Link from 'next/link'
import { cn } from '@clubvantage/ui'
import { Button } from '@clubvantage/ui'
import { User } from 'lucide-react'
import { AgingBadge, type AgingStatus } from './aging-badge'

export interface MemberSelectionData {
  /** Member ID for navigation */
  id: string
  /** Member's full name */
  name: string
  /** Member number (e.g., M-0001) */
  memberNumber: string
  /** Membership type display name */
  membershipType: string
  /** Photo URL (optional) */
  photoUrl?: string
  /** Current aging status */
  agingStatus: AgingStatus
  /** Available credit balance in THB */
  creditBalance: number
}

interface MemberSelectionCardProps {
  /** Member data to display */
  member: MemberSelectionData
  /** Callback when Apply Credit button is clicked */
  onApplyCredit?: () => void
  /** Whether the card is in loading state */
  isLoading?: boolean
  /** Additional class names */
  className?: string
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function MemberSelectionCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex items-center gap-4 rounded-xl border border bg-muted p-4',
        className
      )}
    >
      {/* Photo skeleton */}
      <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-muted" />

      {/* Center section skeleton */}
      <div className="flex flex-1 flex-col gap-1.5">
        <div className="h-4 w-32 animate-pulse rounded bg-muted" />
        <div className="h-3 w-20 animate-pulse rounded bg-muted" />
        <div className="h-5 w-24 animate-pulse rounded-full bg-muted" />
      </div>

      {/* Right section skeleton */}
      <div className="flex flex-col items-end gap-2">
        <div className="h-4 w-28 animate-pulse rounded bg-muted" />
        <div className="h-8 w-24 animate-pulse rounded-lg bg-muted" />
      </div>
    </div>
  )
}

export function MemberSelectionCard({
  member,
  onApplyCredit,
  isLoading = false,
  className,
}: MemberSelectionCardProps) {
  if (isLoading) {
    return <MemberSelectionCardSkeleton className={className} />
  }

  const hasCredit = member.creditBalance > 0

  return (
    <div
      className={cn(
        'flex items-center gap-4 rounded-xl border border bg-muted p-4',
        className
      )}
    >
      {/* Left section: Photo */}
      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-muted">
        {member.photoUrl ? (
          <img
            src={member.photoUrl}
            alt={member.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
            <User className="h-5 w-5" />
          </div>
        )}
      </div>

      {/* Center section: Member info */}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        {/* Row 1: Name + Aging Badge */}
        <div className="flex items-center gap-2">
          <Link
            href={`/members/${member.id}`}
            className="truncate font-semibold text-foreground hover:text-amber-600 hover:underline"
          >
            {member.name}
          </Link>
          <AgingBadge status={member.agingStatus} />
        </div>

        {/* Row 2: Member number */}
        <span className="font-mono text-sm text-muted-foreground">
          {member.memberNumber}
        </span>

        {/* Row 3: Membership type badge */}
        <span className="inline-flex w-fit items-center rounded-full border border-border bg-card px-2 py-0.5 text-xs font-medium text-muted-foreground">
          {member.membershipType}
        </span>
      </div>

      {/* Right section: Credit balance */}
      {hasCredit && (
        <div className="flex shrink-0 flex-col items-end gap-2">
          <span className="text-sm font-medium text-emerald-600">
            {formatCurrency(member.creditBalance)} available credit
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={onApplyCredit}
            className="border-emerald-300 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-400"
          >
            Apply Credit
          </Button>
        </div>
      )}
    </div>
  )
}
