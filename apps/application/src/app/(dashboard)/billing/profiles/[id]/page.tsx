'use client'

import { use, useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Calendar,
  CreditCard,
  FileText,
  Loader2,
  AlertCircle,
  Mail,
  Printer,
  Globe,
  Smartphone,
  Receipt,
  Wallet,
  Clock,
  MapPin,
  Users,
  Building2,
  Check,
  Phone,
  Sparkles,
  MoreHorizontal,
  Edit2,
  Pause,
  Play,
  XCircle,
  TrendingUp,
  ArrowUpRight,
} from 'lucide-react'
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Avatar,
  AvatarFallback,
  AvatarImage,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@clubvantage/ui'
import { cn } from '@clubvantage/ui'

import { useARProfile, useARStatementMutations, type StatementDelivery } from '@/hooks/use-ar-statements'
import { useGetMemberQuery } from '@clubvantage/api-client/hooks'

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
  }).format(amount)
}

function formatDate(date: Date | string | null | undefined): string {
  if (!date) return 'Never'
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date))
}

function formatShortDate(date: Date | string | null | undefined): string {
  if (!date) return '—'
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date))
}

function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

// Delivery method display
const deliveryConfig: Record<StatementDelivery, { icon: typeof Mail; label: string }> = {
  EMAIL: { icon: Mail, label: 'Email' },
  PRINT: { icon: Printer, label: 'Print' },
  EMAIL_AND_PRINT: { icon: Mail, label: 'Email & Print' },
  PORTAL: { icon: Globe, label: 'Portal' },
  SMS: { icon: Smartphone, label: 'SMS' },
  ALL: { icon: Globe, label: 'All Channels' },
}

// Display field component for consistent styling (read-only version of form fields)
function DisplayField({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: React.ReactNode
  icon?: typeof Mail
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-stone-500 dark:text-stone-400">
        {Icon && <Icon className="h-3.5 w-3.5" />}
        {label}
      </div>
      <div className="text-sm font-medium text-stone-900 dark:text-stone-100">
        {value || '—'}
      </div>
    </div>
  )
}

// Stat card component
function StatCard({
  label,
  value,
  subtext,
  icon: Icon,
  trend,
  className,
}: {
  label: string
  value: React.ReactNode
  subtext?: string
  icon: typeof Receipt
  trend?: 'up' | 'down' | 'neutral'
  className?: string
}) {
  return (
    <div className={cn('p-4 rounded-xl bg-stone-50 dark:bg-stone-800/50', className)}>
      <div className="flex items-start justify-between">
        <div className="p-2 rounded-lg bg-white dark:bg-stone-900 shadow-sm">
          <Icon className="h-4 w-4 text-stone-600 dark:text-stone-400" />
        </div>
        {trend && (
          <div className={cn(
            'flex items-center gap-0.5 text-xs font-medium',
            trend === 'up' && 'text-emerald-600',
            trend === 'down' && 'text-red-500',
            trend === 'neutral' && 'text-stone-400'
          )}>
            <TrendingUp className={cn('h-3 w-3', trend === 'down' && 'rotate-180')} />
          </div>
        )}
      </div>
      <div className="mt-3">
        <p className="text-xs font-medium uppercase tracking-wider text-stone-500 dark:text-stone-400">
          {label}
        </p>
        <p className="mt-1 text-xl font-bold text-stone-900 dark:text-stone-100">
          {value}
        </p>
        {subtext && (
          <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">{subtext}</p>
        )}
      </div>
    </div>
  )
}

export default function ARProfileDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { profile, isLoading, error } = useARProfile(id)
  const { suspendARProfile, reactivateARProfile, closeARProfile } = useARStatementMutations()
  const [showCloseDialog, setShowCloseDialog] = useState(false)
  const [isClosing, setIsClosing] = useState(false)

  // Fetch member data if this is a member profile
  const { data: memberData } = useGetMemberQuery(
    { id: profile?.memberId ?? '' },
    { enabled: !!profile?.memberId && profile?.profileType === 'MEMBER' }
  )
  const member = memberData?.member

  const handleSuspend = useCallback(async () => {
    const reason = window.prompt('Enter suspension reason:')
    if (reason) {
      await suspendARProfile(id, reason)
      router.refresh()
    }
  }, [id, suspendARProfile, router])

  const handleReactivate = useCallback(async () => {
    await reactivateARProfile(id)
    router.refresh()
  }, [id, reactivateARProfile, router])

  const handleClose = useCallback(async () => {
    const reason = window.prompt('Enter reason for closing this account:')
    if (reason) {
      setIsClosing(true)
      try {
        await closeARProfile(id, reason)
        setShowCloseDialog(false)
        router.refresh()
      } finally {
        setIsClosing(false)
      }
    }
  }, [id, closeARProfile, router])

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-amber-500/20 animate-ping" />
          <Loader2 className="h-10 w-10 animate-spin text-amber-600" />
        </div>
        <p className="text-sm text-stone-500 dark:text-stone-400 animate-pulse">
          Loading profile...
        </p>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-6">
        <div className="rounded-full bg-red-100 dark:bg-red-500/20 p-4">
          <AlertCircle className="h-10 w-10 text-red-500" />
        </div>
        <div className="text-center">
          <p className="text-lg font-medium text-stone-900 dark:text-stone-100">
            Profile not found
          </p>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
            The AR profile you're looking for doesn't exist or has been removed.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/billing/profiles">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Profiles
          </Link>
        </Button>
      </div>
    )
  }

  const deliveryMethod = deliveryConfig[profile.statementDelivery]
  const isMember = profile.profileType === 'MEMBER'
  const isCityLedger = profile.profileType === 'CITY_LEDGER'
  const displayName = isMember && member
    ? `${member.firstName} ${member.lastName}`
    : profile.accountName || 'City Ledger Account'

  return (
    <div className="space-y-6">
      {/* Back Navigation */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild className="gap-1.5 -ml-2">
          <Link href="/billing/profiles">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Profiles</span>
          </Link>
        </Button>
      </div>

      {/* Desktop Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr,380px] gap-6">
        {/* Main Content Column */}
        <div className="space-y-6">
          {/* Profile Header Card */}
          <Card className="overflow-hidden border-0 shadow-xl">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-stone-50 via-white to-amber-50/50 dark:from-stone-900 dark:via-stone-900 dark:to-amber-900/20" />
            <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }} />

            {/* Top Accent Bar */}
            <div className="h-1.5 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400" />

            <CardContent className="relative p-6 lg:p-8">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  {/* Avatar with type indicator */}
                  <div className="relative shrink-0">
                    <div className={cn(
                      'absolute -inset-1.5 rounded-full blur-sm opacity-60',
                      isMember
                        ? 'bg-gradient-to-br from-blue-300 to-blue-500'
                        : 'bg-gradient-to-br from-purple-300 to-purple-500'
                    )} />
                    <Avatar className="relative h-20 w-20 border-4 border-white dark:border-stone-900 shadow-xl">
                      {isMember && member?.avatarUrl ? (
                        <AvatarImage src={member.avatarUrl} alt={displayName} className="object-cover" />
                      ) : null}
                      <AvatarFallback className={cn(
                        'text-xl font-bold',
                        isMember
                          ? 'bg-gradient-to-br from-blue-50 to-blue-100 text-blue-700 dark:from-blue-900 dark:to-blue-800 dark:text-blue-300'
                          : 'bg-gradient-to-br from-purple-50 to-purple-100 text-purple-700 dark:from-purple-900 dark:to-purple-800 dark:text-purple-300'
                      )}>
                        {isMember ? (
                          member ? getInitials(member.firstName, member.lastName) : <Users className="h-8 w-8" />
                        ) : (
                          <Building2 className="h-8 w-8" />
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <div className={cn(
                      'absolute -bottom-1 -right-1 rounded-full p-1.5 shadow-lg border-2 border-white dark:border-stone-900',
                      isMember ? 'bg-blue-500' : 'bg-purple-500'
                    )}>
                      {isMember ? <Users className="h-3 w-3 text-white" /> : <Building2 className="h-3 w-3 text-white" />}
                    </div>
                  </div>

                  {/* Profile Info */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h1 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
                        {displayName}
                      </h1>
                      <span className={cn(
                        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold',
                        profile.status === 'ACTIVE' && 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400',
                        profile.status === 'SUSPENDED' && 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400',
                        profile.status === 'CLOSED' && 'bg-stone-200 text-stone-600 dark:bg-stone-700 dark:text-stone-400',
                      )}>
                        {profile.status === 'ACTIVE' && <Check className="h-3 w-3" />}
                        {profile.status}
                      </span>
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-stone-500 dark:text-stone-400">
                      <span className="flex items-center gap-1.5 font-mono text-xs bg-stone-100 dark:bg-stone-800 px-2 py-0.5 rounded">
                        <FileText className="h-3 w-3" />
                        {profile.accountNumber}
                      </span>
                      <span className={cn(
                        'flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium',
                        isMember ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400' : 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400'
                      )}>
                        {isMember ? <Users className="h-3 w-3" /> : <Building2 className="h-3 w-3" />}
                        {isMember ? 'Member' : 'City Ledger'}
                      </span>
                      {isMember && member?.membershipType?.name && (
                        <span className="flex items-center gap-1">
                          <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                          {member.membershipType.name}
                        </span>
                      )}
                    </div>

                    {member?.email && (
                      <div className="mt-2 flex items-center gap-1.5 text-sm text-stone-500 dark:text-stone-400">
                        <Mail className="h-3.5 w-3.5" />
                        {member.email}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/billing/profiles/${id}/edit`)}
                    className="gap-1.5"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                    Edit
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon" className="h-9 w-9">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {profile.status === 'ACTIVE' && (
                        <DropdownMenuItem onClick={handleSuspend}>
                          <Pause className="h-4 w-4 mr-2" />
                          Suspend Account
                        </DropdownMenuItem>
                      )}
                      {profile.status === 'SUSPENDED' && (
                        <DropdownMenuItem onClick={handleReactivate}>
                          <Play className="h-4 w-4 mr-2" />
                          Reactivate Account
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => setShowCloseDialog(true)}
                        className="text-red-600 focus:text-red-600"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Close Account
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Type Display */}
          <Card className="overflow-hidden">
            <CardHeader className="border-b border-stone-100 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/30">
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-400">
                Profile Type
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <div className="grid grid-cols-2 gap-4">
                <div
                  className={cn(
                    'relative overflow-hidden rounded-xl border-2 p-4 transition-all',
                    isMember
                      ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-500/10'
                      : 'border-stone-200 dark:border-stone-700 opacity-40'
                  )}
                >
                  {isMember && (
                    <div className="absolute right-3 top-3">
                      <div className="rounded-full bg-blue-500 p-1">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    </div>
                  )}
                  <div className={cn(
                    'rounded-xl p-2.5 inline-flex',
                    isMember
                      ? 'bg-blue-500 text-white'
                      : 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                  )}>
                    <Users className="h-5 w-5" />
                  </div>
                  <div className="mt-3">
                    <div className="font-semibold text-stone-900 dark:text-stone-100">Member</div>
                    <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                      Linked to club member
                    </p>
                  </div>
                </div>

                <div
                  className={cn(
                    'relative overflow-hidden rounded-xl border-2 p-4 transition-all',
                    isCityLedger
                      ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-500/10'
                      : 'border-stone-200 dark:border-stone-700 opacity-40'
                  )}
                >
                  {isCityLedger && (
                    <div className="absolute right-3 top-3">
                      <div className="rounded-full bg-purple-500 p-1">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    </div>
                  )}
                  <div className={cn(
                    'rounded-xl p-2.5 inline-flex',
                    isCityLedger
                      ? 'bg-purple-500 text-white'
                      : 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400'
                  )}>
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div className="mt-3">
                    <div className="font-semibold text-stone-900 dark:text-stone-100">City Ledger</div>
                    <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                      Corporate account
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Member Info (for Member profiles) */}
          {isMember && member && (
            <Card className="overflow-hidden">
              <CardHeader className="border-b border-stone-100 dark:border-stone-800 bg-blue-50/30 dark:bg-blue-900/10">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-400">
                  <Users className="h-4 w-4 text-blue-600" />
                  Linked Member
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100/50 dark:from-blue-500/10 dark:to-blue-500/5 border border-blue-200/50 dark:border-blue-800/50">
                  <Avatar className="h-14 w-14 border-2 border-blue-200 dark:border-blue-700 shadow-md">
                    {member.avatarUrl && (
                      <AvatarImage src={member.avatarUrl} alt={`${member.firstName} ${member.lastName}`} />
                    )}
                    <AvatarFallback className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 font-semibold">
                      {getInitials(member.firstName, member.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-stone-900 dark:text-stone-100">
                      {member.firstName} {member.lastName}
                    </div>
                    <div className="text-sm text-stone-500 dark:text-stone-400 flex items-center gap-2 mt-0.5">
                      <span className="font-mono text-xs">{member.memberId}</span>
                      {member.membershipType?.name && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Sparkles className="h-3 w-3 text-amber-500" />
                            {member.membershipType.name}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <Button variant="outline" size="sm" asChild className="shrink-0">
                    <Link href={`/members/${member.id}`}>
                      View
                      <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Account Information (for City Ledger profiles) */}
          {isCityLedger && (
            <Card className="overflow-hidden">
              <CardHeader className="border-b border-stone-100 dark:border-stone-800 bg-purple-50/30 dark:bg-purple-900/10">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-400">
                  <Building2 className="h-4 w-4 text-purple-600" />
                  Account Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-5">
                <DisplayField
                  label="Account Name"
                  value={profile.accountName}
                  icon={Building2}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <DisplayField
                    label="Contact Email"
                    value={profile.contactEmail}
                    icon={Mail}
                  />
                  <DisplayField
                    label="Contact Phone"
                    value={profile.contactPhone}
                    icon={Phone}
                  />
                </div>
                <DisplayField
                  label="Billing Address"
                  value={profile.billingAddress}
                  icon={MapPin}
                />
              </CardContent>
            </Card>
          )}

          {/* Billing Settings */}
          <Card className="overflow-hidden">
            <CardHeader className="border-b border-stone-100 dark:border-stone-800 bg-amber-50/30 dark:bg-amber-900/10">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-400">
                <CreditCard className="h-4 w-4 text-amber-600" />
                Billing Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <DisplayField
                  label="Statement Delivery"
                  value={deliveryMethod?.label ?? 'Unknown'}
                  icon={Mail}
                />
                <DisplayField
                  label="Payment Terms"
                  value={`${profile.paymentTermsDays} days`}
                  icon={Clock}
                />
                <DisplayField
                  label="Credit Limit"
                  value={profile.creditLimit ? formatCurrency(profile.creditLimit) : 'No limit'}
                  icon={CreditCard}
                />
              </div>
            </CardContent>
          </Card>

          {/* Account Timeline */}
          <Card className="overflow-hidden">
            <CardHeader className="border-b border-stone-100 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/30">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-400">
                <Calendar className="h-4 w-4 text-stone-600" />
                Account Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <DisplayField
                  label="Created"
                  value={formatDate(profile.createdAt)}
                  icon={Calendar}
                />
                <DisplayField
                  label="Last Updated"
                  value={formatDate(profile.updatedAt)}
                  icon={Clock}
                />
                {profile.suspendedAt && (
                  <>
                    <DisplayField
                      label="Suspended"
                      value={formatDate(profile.suspendedAt)}
                      icon={Calendar}
                    />
                    {profile.suspendedReason && (
                      <DisplayField
                        label="Suspension Reason"
                        value={profile.suspendedReason}
                        icon={FileText}
                      />
                    )}
                  </>
                )}
                {profile.closedAt && (
                  <>
                    <DisplayField
                      label="Closed"
                      value={formatDate(profile.closedAt)}
                      icon={Calendar}
                    />
                    {profile.closedReason && (
                      <DisplayField
                        label="Close Reason"
                        value={profile.closedReason}
                        icon={FileText}
                      />
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          {/* Balance Card */}
          <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-br from-amber-500 to-amber-600">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-amber-100">Current Balance</p>
                <div className="p-2 rounded-lg bg-white/20">
                  <Wallet className="h-4 w-4 text-white" />
                </div>
              </div>
              <p className="mt-3 text-4xl font-bold text-white tracking-tight">
                {formatCurrency(profile.currentBalance || 0)}
              </p>
              <p className="mt-1 text-sm text-amber-100">
                {(profile.currentBalance || 0) > 0 ? 'Outstanding' : 'No balance due'}
              </p>
            </CardContent>
          </Card>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              label="Last Statement"
              value={profile.lastStatementDate ? formatShortDate(profile.lastStatementDate) : 'Never'}
              subtext={profile.lastStatementBalance != null ? formatCurrency(profile.lastStatementBalance) : undefined}
              icon={Receipt}
            />
            <StatCard
              label="Last Payment"
              value={profile.lastPaymentDate ? formatShortDate(profile.lastPaymentDate) : 'Never'}
              subtext={profile.lastPaymentAmount != null ? formatCurrency(profile.lastPaymentAmount) : undefined}
              icon={Wallet}
              trend={profile.lastPaymentDate ? 'up' : 'neutral'}
            />
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start h-11" asChild>
                <Link href={`/billing/statements?profile=${id}`}>
                  <Receipt className="h-4 w-4 mr-3 text-stone-500" />
                  View Statements
                  <ArrowUpRight className="h-3.5 w-3.5 ml-auto text-stone-400" />
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start h-11" asChild>
                <Link href={`/billing/payments?profile=${id}`}>
                  <Wallet className="h-4 w-4 mr-3 text-stone-500" />
                  View Payments
                  <ArrowUpRight className="h-3.5 w-3.5 ml-auto text-stone-400" />
                </Link>
              </Button>
              {isMember && profile.memberId && (
                <Button variant="outline" className="w-full justify-start h-11" asChild>
                  <Link href={`/members/${profile.memberId}`}>
                    <Users className="h-4 w-4 mr-3 text-stone-500" />
                    View Member Profile
                    <ArrowUpRight className="h-3.5 w-3.5 ml-auto text-stone-400" />
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Close Account Dialog */}
      <Dialog open={showCloseDialog} onOpenChange={setShowCloseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">Close this AR Profile?</DialogTitle>
            <DialogDescription>
              This will permanently close the account. No more statements can be generated for this profile.
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCloseDialog(false)} disabled={isClosing}>
              Cancel
            </Button>
            <Button onClick={handleClose} disabled={isClosing} className="bg-red-600 hover:bg-red-700 text-white">
              {isClosing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Closing...
                </>
              ) : (
                'Close Account'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
