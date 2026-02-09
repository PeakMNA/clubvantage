'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Copy,
  Check,
  Sparkles,
  Users,
  Building2,
  CheckCircle,
  PauseCircle,
  XCircle,
  Edit,
  MoreVertical,
  Mail,
  Phone,
  FileText,
  CreditCard,
} from 'lucide-react'
import { cn } from '@clubvantage/ui'
import { Avatar, AvatarFallback, AvatarImage } from '@clubvantage/ui'
import { Button } from '@clubvantage/ui'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@clubvantage/ui'
import type { ARProfile, ARProfileStatus } from '@/hooks/use-ar-statements'

interface MemberInfo {
  id: string
  firstName: string
  lastName: string
  memberNumber: string
  email?: string
  phone?: string
  photoUrl?: string
  membershipTypeName?: string
}

interface ARProfileHeaderProps {
  profile: ARProfile
  member?: MemberInfo | null
  onEdit?: () => void
  onSuspend?: () => void
  onReactivate?: () => void
  onClose?: () => void
  className?: string
}

function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

function getBalanceColor(balance: number, status: ARProfileStatus): string {
  if (balance <= 0) return 'text-emerald-600'
  if (status === 'SUSPENDED') return 'text-red-600'
  if (balance > 50000) return 'text-red-600'
  return 'text-amber-600'
}

const statusConfig: Record<ARProfileStatus, { bg: string; text: string; icon: typeof CheckCircle; label: string }> = {
  ACTIVE: {
    bg: 'bg-emerald-100 dark:bg-emerald-500/20',
    text: 'text-emerald-700 dark:text-emerald-400',
    icon: CheckCircle,
    label: 'Active'
  },
  SUSPENDED: {
    bg: 'bg-amber-100 dark:bg-amber-500/20',
    text: 'text-amber-700 dark:text-amber-400',
    icon: PauseCircle,
    label: 'Suspended'
  },
  CLOSED: {
    bg: 'bg-stone-100 dark:bg-stone-500/20',
    text: 'text-stone-600 dark:text-stone-400',
    icon: XCircle,
    label: 'Closed'
  },
}

export function ARProfileHeader({
  profile,
  member,
  onEdit,
  onSuspend,
  onReactivate,
  onClose,
  className,
}: ARProfileHeaderProps) {
  const [copied, setCopied] = useState(false)
  const isMemberProfile = profile.profileType === 'MEMBER'
  const isClosed = profile.status === 'CLOSED'
  const isSuspended = profile.status === 'SUSPENDED'
  const statusStyle = statusConfig[profile.status]
  const StatusIcon = statusStyle.icon

  const displayName = isMemberProfile && member
    ? `${member.firstName} ${member.lastName}`
    : profile.accountName || 'City Ledger Account'

  const displayInitials = isMemberProfile && member
    ? getInitials(member.firstName, member.lastName)
    : profile.accountName?.substring(0, 2).toUpperCase() || 'CL'

  const handleCopyAccountNumber = async () => {
    await navigator.clipboard.writeText(profile.accountNumber)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border bg-card shadow-xl backdrop-blur-sm',
        isClosed && 'opacity-70',
        className
      )}
    >
      {/* Gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-stone-50/80 via-transparent to-amber-50/30 dark:from-stone-900/50 dark:to-amber-900/10" />

      {/* Top accent line - amber for billing context */}
      <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400" />

      <div className="relative flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:justify-between sm:p-6 lg:p-8">
        {/* Left Section: Avatar + Identity */}
        <div className="flex items-start gap-4 sm:gap-5">
          {/* Avatar with type indicator */}
          <div className="group relative shrink-0">
            <div className={cn(
              'absolute -inset-1 rounded-full opacity-75',
              isMemberProfile
                ? 'bg-gradient-to-br from-blue-200 to-blue-400 dark:from-blue-800 dark:to-blue-600'
                : 'bg-gradient-to-br from-purple-200 to-purple-400 dark:from-purple-800 dark:to-purple-600'
            )} />
            <Avatar className="relative h-18 w-18 border-2 border-card shadow-lg sm:h-24 sm:w-24">
              {isMemberProfile && member?.photoUrl ? (
                <AvatarImage
                  src={member.photoUrl}
                  alt={displayName}
                  className="object-cover"
                />
              ) : null}
              <AvatarFallback className={cn(
                'text-xl font-semibold sm:text-2xl',
                isMemberProfile
                  ? 'bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700 dark:from-blue-900 dark:to-blue-800 dark:text-blue-300'
                  : 'bg-gradient-to-br from-purple-100 to-purple-200 text-purple-700 dark:from-purple-900 dark:to-purple-800 dark:text-purple-300'
              )}>
                {isMemberProfile ? (
                  member ? displayInitials : <Users className="h-8 w-8" />
                ) : (
                  <Building2 className="h-8 w-8" />
                )}
              </AvatarFallback>
            </Avatar>
            {/* Type indicator badge */}
            <div className={cn(
              'absolute -bottom-1 -right-1 rounded-full p-1.5 shadow-md',
              isMemberProfile
                ? 'bg-blue-500 text-white'
                : 'bg-purple-500 text-white'
            )}>
              {isMemberProfile ? <Users className="h-3 w-3" /> : <Building2 className="h-3 w-3" />}
            </div>
          </div>

          {/* Identity Info */}
          <div className="min-w-0 flex-1 pt-1">
            {/* Name/Account */}
            <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl lg:text-3xl">
              {displayName}
            </h1>

            {/* Account # with copy + Status */}
            <div className="mt-2 flex flex-wrap items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-1.5 rounded-lg bg-stone-100/80 dark:bg-stone-800/80 px-2.5 py-1 backdrop-blur-sm">
                <FileText className="h-3 w-3 text-stone-500" />
                <span className="font-mono text-xs font-medium text-stone-600 dark:text-stone-400 sm:text-sm">
                  {profile.accountNumber}
                </span>
                <button
                  type="button"
                  onClick={handleCopyAccountNumber}
                  className="rounded p-0.5 text-stone-400 transition-colors hover:bg-stone-200 dark:hover:bg-stone-700 hover:text-stone-600"
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
              <span className={cn(
                'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
                statusStyle.bg, statusStyle.text
              )}>
                <StatusIcon className="h-3.5 w-3.5" />
                {statusStyle.label}
              </span>
            </div>

            {/* Profile Type + Member Info */}
            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-stone-600 dark:text-stone-400">
              <span className={cn(
                'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium',
                isMemberProfile
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400'
                  : 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400'
              )}>
                {isMemberProfile ? <Users className="h-3 w-3" /> : <Building2 className="h-3 w-3" />}
                {isMemberProfile ? 'Member' : 'City Ledger'}
              </span>

              {isMemberProfile && member?.membershipTypeName && (
                <span className="flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                  <span className="font-medium">{member.membershipTypeName}</span>
                </span>
              )}
            </div>

            {/* Contact Info (for City Ledger or Member) */}
            <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-stone-500 dark:text-stone-400">
              {(isMemberProfile ? member?.email : profile.contactEmail) && (
                <span className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" />
                  {isMemberProfile ? member?.email : profile.contactEmail}
                </span>
              )}
              {(isMemberProfile ? member?.phone : profile.contactPhone) && (
                <span className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5" />
                  {isMemberProfile ? member?.phone : profile.contactPhone}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Section: Balance + Actions */}
        <div className="flex flex-col gap-4 sm:items-end">
          {/* Balance Card - Hero Element */}
          <div className="rounded-xl bg-gradient-to-br from-stone-100 to-stone-50 dark:from-stone-800 dark:to-stone-900 p-4 shadow-inner sm:min-w-[180px]">
            <p className="text-xs font-medium uppercase tracking-wider text-stone-500 dark:text-stone-400 sm:text-right">
              Current Balance
            </p>
            <div
              className={cn(
                'mt-1 text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl sm:text-right',
                getBalanceColor(profile.currentBalance, profile.status)
              )}
            >
              {formatCurrency(profile.currentBalance)}
            </div>
            {profile.creditLimit && (
              <div className="mt-1 flex items-center gap-1 text-xs text-stone-500 dark:text-stone-400 sm:justify-end">
                <CreditCard className="h-3 w-3" />
                Limit: {formatCurrency(profile.creditLimit)}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onEdit}
              disabled={isClosed}
              className="bg-card/80 shadow-sm backdrop-blur-sm transition-all hover:bg-card hover:shadow-md"
            >
              <Edit className="h-4 w-4 mr-1.5" />
              Edit
            </Button>

            {/* Status Actions */}
            {profile.status === 'ACTIVE' && (
              <Button
                variant="outline"
                size="sm"
                onClick={onSuspend}
                className="bg-card/80 shadow-sm backdrop-blur-sm transition-all hover:bg-amber-50 hover:text-amber-700 hover:border-amber-300 hover:shadow-md"
              >
                <PauseCircle className="h-4 w-4 mr-1.5" />
                Suspend
              </Button>
            )}
            {profile.status === 'SUSPENDED' && (
              <Button
                variant="outline"
                size="sm"
                onClick={onReactivate}
                className="bg-card/80 shadow-sm backdrop-blur-sm transition-all hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 hover:shadow-md"
              >
                <CheckCircle className="h-4 w-4 mr-1.5" />
                Reactivate
              </Button>
            )}

            {/* More Actions */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 bg-card/80 shadow-sm backdrop-blur-sm transition-all hover:bg-card hover:shadow-md"
                  disabled={isClosed}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="backdrop-blur-sm">
                <DropdownMenuItem className="cursor-pointer">
                  View Statements
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  View Payments
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {profile.status !== 'CLOSED' && (
                  <DropdownMenuItem
                    className="cursor-pointer text-red-600 focus:text-red-600"
                    onClick={onClose}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Close Account
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Status Indicators */}
          {isSuspended && profile.suspendedReason && (
            <div className="rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-800 px-3 py-2 text-xs font-medium text-amber-700 dark:text-amber-400">
              Suspended: {profile.suspendedReason}
            </div>
          )}
          {isClosed && (
            <div className="rounded-lg bg-stone-100 dark:bg-stone-800 px-3 py-2 text-xs font-medium text-stone-500 dark:text-stone-400">
              Account Closed {profile.closedReason && `- ${profile.closedReason}`}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
