'use client'

import { useState, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Plus,
  Search,
  Users,
  Building2,
  Mail,
  Printer,
  Globe,
  Smartphone,
  MoreHorizontal,
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle,
  PauseCircle,
  RefreshCw,
  Eye,
  Edit,
} from 'lucide-react'
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@clubvantage/ui'
import { cn } from '@clubvantage/ui'

import {
  useARProfiles,
  useARStatementMutations,
  useMembersWithoutARProfilesCount,
  useARProfileSync,
  type ARProfile,
  type ARProfileStatus,
  type ARProfileType,
  type StatementDelivery,
} from '@/hooks/use-ar-statements'

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 2,
  }).format(amount)
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date))
}

// Status badge component
function StatusBadge({ status }: { status: ARProfileStatus }) {
  const styles: Record<ARProfileStatus, { bg: string; text: string; icon: typeof CheckCircle }> = {
    ACTIVE: { bg: 'bg-emerald-100 dark:bg-emerald-500/20', text: 'text-emerald-700 dark:text-emerald-400', icon: CheckCircle },
    SUSPENDED: { bg: 'bg-amber-100 dark:bg-amber-500/20', text: 'text-amber-700 dark:text-amber-400', icon: PauseCircle },
    CLOSED: { bg: 'bg-stone-100 dark:bg-stone-500/20', text: 'text-stone-600 dark:text-stone-400', icon: XCircle },
  }

  const style = styles[status] || styles.ACTIVE
  const Icon = style.icon

  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium', style.bg, style.text)}>
      <Icon className="h-3 w-3" />
      {status}
    </span>
  )
}

// Profile type badge
function ProfileTypeBadge({ type }: { type: ARProfileType }) {
  const isMemeber = type === 'MEMBER'
  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
      isMemeber
        ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400'
        : 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400'
    )}>
      {isMemeber ? <Users className="h-3 w-3" /> : <Building2 className="h-3 w-3" />}
      {isMemeber ? 'Member' : 'City Ledger'}
    </span>
  )
}

// Delivery method icons
function DeliveryIcons({ delivery }: { delivery: StatementDelivery }) {
  const methods: Record<string, { icon: typeof Mail; active: boolean }> = {
    email: { icon: Mail, active: ['EMAIL', 'EMAIL_AND_PRINT', 'ALL'].includes(delivery) },
    print: { icon: Printer, active: ['PRINT', 'EMAIL_AND_PRINT', 'ALL'].includes(delivery) },
    portal: { icon: Globe, active: ['PORTAL', 'ALL'].includes(delivery) },
    sms: { icon: Smartphone, active: ['SMS', 'ALL'].includes(delivery) },
  }

  return (
    <div className="flex items-center gap-1.5">
      {Object.entries(methods).map(([key, { icon: Icon, active }]) => (
        <span key={key} title={`${key}: ${active ? 'enabled' : 'disabled'}`}>
          <Icon
            className={cn(
              'h-4 w-4',
              active ? 'text-stone-700 dark:text-stone-300' : 'text-stone-300 dark:text-stone-600'
            )}
          />
        </span>
      ))}
    </div>
  )
}

// Profile row component
function ProfileRow({
  profile,
  onSuspend,
  onReactivate,
  onClose,
  onClick,
}: {
  profile: ARProfile
  onSuspend: () => void
  onReactivate: () => void
  onClose: () => void
  onClick: () => void
}) {
  return (
    <tr
      className="border-b border-stone-100 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800/50 cursor-pointer"
      onClick={onClick}
    >
      {/* Account */}
      <td className="py-3 px-4">
        <div className="font-medium text-stone-900 dark:text-stone-100">
          {profile.accountNumber}
        </div>
        {profile.accountName && (
          <div className="text-xs text-stone-600 dark:text-stone-300">
            {profile.accountName}
          </div>
        )}
        <div className="text-xs text-stone-500 dark:text-stone-400">
          Created {formatDate(profile.createdAt)}
        </div>
      </td>

      {/* Type */}
      <td className="py-3 px-4">
        <ProfileTypeBadge type={profile.profileType} />
      </td>

      {/* Status */}
      <td className="py-3 px-4">
        <StatusBadge status={profile.status} />
        {profile.suspendedReason && (
          <div className="text-xs text-stone-500 mt-1 truncate max-w-[150px]" title={profile.suspendedReason}>
            {profile.suspendedReason}
          </div>
        )}
      </td>

      {/* Balance */}
      <td className="py-3 px-4 text-right">
        <div className={cn(
          'font-medium',
          profile.currentBalance > 0
            ? 'text-stone-900 dark:text-stone-100'
            : profile.currentBalance < 0
            ? 'text-emerald-600 dark:text-emerald-400'
            : 'text-stone-500'
        )}>
          {formatCurrency(profile.currentBalance)}
        </div>
        {profile.creditLimit && (
          <div className="text-xs text-stone-500">
            Limit: {formatCurrency(profile.creditLimit)}
          </div>
        )}
      </td>

      {/* Payment Terms */}
      <td className="py-3 px-4 text-center text-sm text-stone-600 dark:text-stone-400">
        {profile.paymentTermsDays} days
      </td>

      {/* Delivery */}
      <td className="py-3 px-4">
        <DeliveryIcons delivery={profile.statementDelivery} />
      </td>

      {/* Last Statement */}
      <td className="py-3 px-4 text-sm text-stone-600 dark:text-stone-400">
        {profile.lastStatementDate ? (
          <div>
            <div>{formatDate(profile.lastStatementDate)}</div>
            {profile.lastStatementBalance != null && (
              <div className="text-xs">{formatCurrency(profile.lastStatementBalance)}</div>
            )}
          </div>
        ) : (
          <span className="text-stone-400">Never</span>
        )}
      </td>

      {/* Actions */}
      <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/billing/profiles/${profile.id}`}>
                <Eye className="h-4 w-4 mr-2" />
                View
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/billing/profiles/${profile.id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {profile.status === 'ACTIVE' && (
              <DropdownMenuItem onClick={onSuspend}>
                <PauseCircle className="h-4 w-4 mr-2" />
                Suspend
              </DropdownMenuItem>
            )}
            {profile.status === 'SUSPENDED' && (
              <DropdownMenuItem onClick={onReactivate}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Reactivate
              </DropdownMenuItem>
            )}
            {profile.status !== 'CLOSED' && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onClose} className="text-red-600">
                  <XCircle className="h-4 w-4 mr-2" />
                  Close Account
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </tr>
  )
}

export default function ARProfilesPage() {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<ARProfileStatus | 'ALL'>('ALL')
  const [typeFilter, setTypeFilter] = useState<ARProfileType | 'ALL'>('ALL')
  const [syncResult, setSyncResult] = useState<{ created: number; skipped: number; errors: string[] } | null>(null)

  const { profiles, isLoading, refetch } = useARProfiles()
  const {
    suspendARProfile,
    reactivateARProfile,
    closeARProfile,
  } = useARStatementMutations()
  const { count: membersWithoutProfiles, refetch: refetchCount } = useMembersWithoutARProfilesCount()
  const { syncMembers, isSyncingMembers } = useARProfileSync()

  // Filter profiles
  const filteredProfiles = useMemo(() => {
    return profiles.filter(p => {
      // Status filter
      if (statusFilter !== 'ALL' && p.status !== statusFilter) return false
      // Type filter
      if (typeFilter !== 'ALL' && p.profileType !== typeFilter) return false
      // Search filter
      if (search) {
        const searchLower = search.toLowerCase()
        return p.accountNumber.toLowerCase().includes(searchLower)
      }
      return true
    })
  }, [profiles, statusFilter, typeFilter, search])

  // Stats
  const stats = useMemo(() => ({
    total: profiles.length,
    active: profiles.filter(p => p.status === 'ACTIVE').length,
    suspended: profiles.filter(p => p.status === 'SUSPENDED').length,
    totalBalance: profiles.reduce((sum, p) => sum + p.currentBalance, 0),
  }), [profiles])

  const handleSuspend = useCallback(async (id: string) => {
    const reason = window.prompt('Enter suspension reason:')
    if (reason) {
      await suspendARProfile(id, reason)
      refetch()
    }
  }, [suspendARProfile, refetch])

  const handleReactivate = useCallback(async (id: string) => {
    await reactivateARProfile(id)
    refetch()
  }, [reactivateARProfile, refetch])

  const handleClose = useCallback(async (id: string) => {
    const reason = window.prompt('Enter reason for closing this account:')
    if (reason) {
      await closeARProfile(id, reason)
      refetch()
    }
  }, [closeARProfile, refetch])

  const handleSyncMembers = useCallback(async () => {
    setSyncResult(null)
    const result = await syncMembers()
    if (result) {
      setSyncResult(result)
      refetch()
      refetchCount()
    }
  }, [syncMembers, refetch, refetchCount])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-stone-900 dark:text-stone-100">
            AR Profiles
          </h1>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
            Manage accounts receivable profiles for members and city ledgers
          </p>
        </div>
        <div className="flex items-center gap-2">
          {membersWithoutProfiles > 0 && (
            <Button
              variant="outline"
              onClick={handleSyncMembers}
              disabled={isSyncingMembers}
              className="border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-600 dark:text-amber-400 dark:hover:bg-amber-950"
            >
              {isSyncingMembers ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Users className="h-4 w-4 mr-2" />
              )}
              Sync Members ({membersWithoutProfiles})
            </Button>
          )}
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button asChild>
            <Link href="/billing/profiles/new">
              <Plus className="h-4 w-4 mr-2" />
              New Profile
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-stone-900 dark:text-stone-100">
              {stats.total}
            </div>
            <div className="text-sm text-stone-500">Total Profiles</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-emerald-600">
              {stats.active}
            </div>
            <div className="text-sm text-stone-500">Active</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-amber-600">
              {stats.suspended}
            </div>
            <div className="text-sm text-stone-500">Suspended</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className={cn(
              'text-2xl font-bold',
              stats.totalBalance > 0 ? 'text-stone-900 dark:text-stone-100' : 'text-emerald-600'
            )}>
              {formatCurrency(stats.totalBalance)}
            </div>
            <div className="text-sm text-stone-500">Total Outstanding</div>
          </CardContent>
        </Card>
      </div>

      {/* Sync Result Alert */}
      {syncResult && (
        <div className={cn(
          'rounded-lg p-4 flex items-start gap-3',
          syncResult.errors.length > 0
            ? 'bg-amber-50 border border-amber-200 dark:bg-amber-950/30 dark:border-amber-800'
            : 'bg-emerald-50 border border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800'
        )}>
          {syncResult.errors.length > 0 ? (
            <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          ) : (
            <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <p className={cn(
              'font-medium',
              syncResult.errors.length > 0
                ? 'text-amber-800 dark:text-amber-300'
                : 'text-emerald-800 dark:text-emerald-300'
            )}>
              Sync Complete: {syncResult.created} profiles created, {syncResult.skipped} skipped
            </p>
            {syncResult.errors.length > 0 && (
              <ul className="mt-2 text-sm text-amber-700 dark:text-amber-400 list-disc list-inside">
                {syncResult.errors.map((error, i) => (
                  <li key={i}>{error}</li>
                ))}
              </ul>
            )}
          </div>
          <button
            onClick={() => setSyncResult(null)}
            className="text-stone-400 hover:text-stone-600"
          >
            <XCircle className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
              <Input
                placeholder="Search by account number..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ARProfileStatus | 'ALL')}
              className="px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="SUSPENDED">Suspended</option>
              <option value="CLOSED">Closed</option>
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as ARProfileType | 'ALL')}
              className="px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm"
            >
              <option value="ALL">All Types</option>
              <option value="MEMBER">Members</option>
              <option value="CITY_LEDGER">City Ledger</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Profiles Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4" />
            Profiles
            <span className="text-sm font-normal text-stone-500">
              ({filteredProfiles.length})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-stone-400" />
            </div>
          ) : filteredProfiles.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/50">
                    <th className="py-3 px-4 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                      Account
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="py-3 px-4 text-right text-xs font-medium text-stone-500 uppercase tracking-wider">
                      Balance
                    </th>
                    <th className="py-3 px-4 text-center text-xs font-medium text-stone-500 uppercase tracking-wider">
                      Terms
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                      Delivery
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                      Last Statement
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProfiles.map(profile => (
                    <ProfileRow
                      key={profile.id}
                      profile={profile}
                      onClick={() => router.push(`/billing/profiles/${profile.id}`)}
                      onSuspend={() => handleSuspend(profile.id)}
                      onReactivate={() => handleReactivate(profile.id)}
                      onClose={() => handleClose(profile.id)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-stone-300" />
              <p className="text-stone-500 font-medium">No AR profiles found</p>
              <p className="text-sm text-stone-400 mt-1">
                {profiles.length === 0
                  ? 'Create your first AR profile to start generating statements.'
                  : 'No profiles match your current filters.'}
              </p>
              {profiles.length === 0 && (
                <Button className="mt-4" asChild>
                  <Link href="/billing/profiles/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Profile
                  </Link>
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  )
}
