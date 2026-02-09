'use client'

import { use, useState, useCallback, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Save,
  Loader2,
  AlertCircle,
  Users,
  Building2,
  CreditCard,
  Mail,
  Phone,
  MapPin,
  Clock,
  FileText,
  Sparkles,
  Check,
  Info,
} from 'lucide-react'
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@clubvantage/ui'
import { cn } from '@clubvantage/ui'

import {
  useARProfile,
  useARStatementMutations,
  type StatementDelivery,
} from '@/hooks/use-ar-statements'
import { useGetMemberQuery } from '@clubvantage/api-client/hooks'

const DELIVERY_OPTIONS: { value: StatementDelivery; label: string; description: string }[] = [
  { value: 'EMAIL', label: 'Email', description: 'Send statements via email' },
  { value: 'PRINT', label: 'Print', description: 'Print physical statements' },
  { value: 'EMAIL_AND_PRINT', label: 'Email & Print', description: 'Both email and print' },
  { value: 'PORTAL', label: 'Portal', description: 'Available in member portal' },
  { value: 'SMS', label: 'SMS', description: 'Send notification via SMS' },
  { value: 'ALL', label: 'All Channels', description: 'Use all delivery methods' },
]

function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
  }).format(amount)
}

// Styled form field component
function FormField({
  label,
  required,
  helper,
  icon: Icon,
  children,
}: {
  label: string
  required?: boolean
  helper?: string
  icon?: typeof Mail
  children: React.ReactNode
}) {
  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2 text-sm font-medium text-stone-700 dark:text-stone-300">
        {Icon && <Icon className="h-4 w-4 text-stone-400" />}
        {label}
        {required && <span className="text-red-500">*</span>}
      </Label>
      {children}
      {helper && (
        <p className="text-xs text-stone-500 dark:text-stone-400">{helper}</p>
      )}
    </div>
  )
}

// Sidebar info card
function InfoCard({
  title,
  value,
  icon: Icon,
}: {
  title: string
  value: React.ReactNode
  icon: typeof Info
}) {
  return (
    <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/50">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-white dark:bg-stone-900 shadow-sm">
          <Icon className="h-4 w-4 text-stone-600 dark:text-stone-400" />
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-stone-500 dark:text-stone-400">{title}</p>
          <p className="mt-1 text-sm font-medium text-stone-900 dark:text-stone-100">{value}</p>
        </div>
      </div>
    </div>
  )
}

export default function EditARProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { profile, isLoading, error } = useARProfile(id)
  const { updateARProfile, isUpdatingProfile } = useARStatementMutations()

  // Fetch member data if this is a member profile
  const { data: memberData } = useGetMemberQuery(
    { id: profile?.memberId ?? '' },
    { enabled: !!profile?.memberId && profile?.profileType === 'MEMBER' }
  )
  const member = memberData?.member

  // Form state
  const [accountName, setAccountName] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [billingAddress, setBillingAddress] = useState('')
  const [statementDelivery, setStatementDelivery] = useState<StatementDelivery>('EMAIL')
  const [paymentTermsDays, setPaymentTermsDays] = useState(30)
  const [creditLimit, setCreditLimit] = useState<string>('')
  const [formError, setFormError] = useState<string>()

  // Initialize form with profile data
  useEffect(() => {
    if (profile) {
      setAccountName(profile.accountName || '')
      setContactEmail(profile.contactEmail || '')
      setContactPhone(profile.contactPhone || '')
      setBillingAddress(profile.billingAddress || '')
      setStatementDelivery(profile.statementDelivery)
      setPaymentTermsDays(profile.paymentTermsDays)
      setCreditLimit(profile.creditLimit ? profile.creditLimit.toString() : '')
    }
  }, [profile])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(undefined)

    // Validation for city ledger
    if (profile?.profileType === 'CITY_LEDGER' && !accountName.trim()) {
      setFormError('Account name is required')
      return
    }

    try {
      await updateARProfile(id, {
        statementDelivery,
        paymentTermsDays,
        creditLimit: creditLimit ? parseFloat(creditLimit) : undefined,
        accountName: profile?.profileType === 'CITY_LEDGER' ? accountName.trim() : undefined,
        contactEmail: profile?.profileType === 'CITY_LEDGER' && contactEmail ? contactEmail.trim() : undefined,
        contactPhone: profile?.profileType === 'CITY_LEDGER' && contactPhone ? contactPhone.trim() : undefined,
        billingAddress: profile?.profileType === 'CITY_LEDGER' && billingAddress ? billingAddress.trim() : undefined,
      })
      router.push(`/billing/profiles/${id}`)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to update profile')
    }
  }, [id, profile, accountName, contactEmail, contactPhone, billingAddress, statementDelivery, paymentTermsDays, creditLimit, updateARProfile, router])

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
          <Link href={`/billing/profiles/${id}`}>
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Profile</span>
          </Link>
        </Button>
      </div>

      {/* Desktop Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr,340px] gap-6">
        {/* Main Content Column */}
        <div className="space-y-6">
          {/* Header Card */}
          <Card className="overflow-hidden border-0 shadow-xl">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-stone-50 via-white to-amber-50/50 dark:from-stone-900 dark:via-stone-900 dark:to-amber-900/20" />
            <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }} />

            {/* Top Accent Bar */}
            <div className="h-1.5 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400" />

            <CardContent className="relative p-6 lg:p-8">
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="relative shrink-0">
                  <div className={cn(
                    'absolute -inset-1.5 rounded-full blur-sm opacity-60',
                    isMember
                      ? 'bg-gradient-to-br from-blue-300 to-blue-500'
                      : 'bg-gradient-to-br from-purple-300 to-purple-500'
                  )} />
                  <Avatar className="relative h-16 w-16 border-4 border-white dark:border-stone-900 shadow-xl">
                    {isMember && member?.avatarUrl ? (
                      <AvatarImage src={member.avatarUrl} alt={displayName} className="object-cover" />
                    ) : null}
                    <AvatarFallback className={cn(
                      'text-lg font-bold',
                      isMember
                        ? 'bg-gradient-to-br from-blue-50 to-blue-100 text-blue-700 dark:from-blue-900 dark:to-blue-800 dark:text-blue-300'
                        : 'bg-gradient-to-br from-purple-50 to-purple-100 text-purple-700 dark:from-purple-900 dark:to-purple-800 dark:text-purple-300'
                    )}>
                      {isMember ? (
                        member ? getInitials(member.firstName, member.lastName) : <Users className="h-6 w-6" />
                      ) : (
                        <Building2 className="h-6 w-6" />
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div className={cn(
                    'absolute -bottom-1 -right-1 rounded-full p-1 shadow-lg border-2 border-white dark:border-stone-900',
                    isMember ? 'bg-blue-500' : 'bg-purple-500'
                  )}>
                    {isMember ? <Users className="h-2.5 w-2.5 text-white" /> : <Building2 className="h-2.5 w-2.5 text-white" />}
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
                    Edit Profile
                  </h1>
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-stone-500 dark:text-stone-400">
                    <span className="font-semibold text-stone-700 dark:text-stone-300">{displayName}</span>
                    <span className="flex items-center gap-1.5 font-mono text-xs bg-stone-100 dark:bg-stone-800 px-2 py-0.5 rounded">
                      <FileText className="h-3 w-3" />
                      {profile.accountNumber}
                    </span>
                    {isMember && member?.membershipType?.name && (
                      <span className="flex items-center gap-1">
                        <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                        {member.membershipType.name}
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
                    Update billing settings and account information
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Type Display (Read-only) */}
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
                <p className="mt-3 text-xs text-stone-500 dark:text-stone-400 italic">
                  Profile type cannot be changed after creation.
                </p>
              </CardContent>
            </Card>

            {/* Member Info (Read-only for Member profiles) */}
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
                  </div>
                  <p className="mt-3 text-xs text-stone-500 dark:text-stone-400 italic">
                    Member link cannot be changed. Create a new profile to link to a different member.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* City Ledger Account Info */}
            {isCityLedger && (
              <Card className="overflow-hidden">
                <CardHeader className="border-b border-stone-100 dark:border-stone-800 bg-purple-50/30 dark:bg-purple-900/10">
                  <CardTitle className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-400">
                    <Building2 className="h-4 w-4 text-purple-600" />
                    Account Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5 space-y-5">
                  <FormField label="Account Name" required icon={Building2}>
                    <Input
                      placeholder="Company or organization name"
                      value={accountName}
                      onChange={(e) => setAccountName(e.target.value)}
                      className="h-11 bg-white dark:bg-stone-900"
                      required
                    />
                  </FormField>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <FormField label="Contact Email" icon={Mail}>
                      <Input
                        type="email"
                        placeholder="billing@company.com"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        className="h-11 bg-white dark:bg-stone-900"
                      />
                    </FormField>

                    <FormField label="Contact Phone" icon={Phone}>
                      <Input
                        type="tel"
                        placeholder="+66 2 XXX XXXX"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        className="h-11 bg-white dark:bg-stone-900"
                      />
                    </FormField>
                  </div>

                  <FormField label="Billing Address" icon={MapPin}>
                    <Input
                      placeholder="Full billing address"
                      value={billingAddress}
                      onChange={(e) => setBillingAddress(e.target.value)}
                      className="h-11 bg-white dark:bg-stone-900"
                    />
                  </FormField>
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
              <CardContent className="p-5 space-y-5">
                <FormField label="Statement Delivery" icon={Mail}>
                  <Select value={statementDelivery} onValueChange={(v) => setStatementDelivery(v as StatementDelivery)}>
                    <SelectTrigger className="h-11 bg-white dark:bg-stone-900">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DELIVERY_OPTIONS.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          <div>
                            <div className="font-medium">{option.label}</div>
                            <div className="text-xs text-stone-500">{option.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <FormField
                    label="Payment Terms (Days)"
                    icon={Clock}
                    helper="Days until payment is due (1-90)"
                  >
                    <Input
                      type="number"
                      min={1}
                      max={90}
                      value={paymentTermsDays}
                      onChange={(e) => setPaymentTermsDays(parseInt(e.target.value) || 30)}
                      className="h-11 bg-white dark:bg-stone-900"
                    />
                  </FormField>

                  <FormField
                    label="Credit Limit"
                    icon={CreditCard}
                    helper="Leave empty for no limit"
                  >
                    <Input
                      type="number"
                      min={0}
                      step={100}
                      placeholder="No limit"
                      value={creditLimit}
                      onChange={(e) => setCreditLimit(e.target.value)}
                      className="h-11 bg-white dark:bg-stone-900"
                    />
                  </FormField>
                </div>
              </CardContent>
            </Card>

            {/* Error */}
            {formError && (
              <div className="flex items-center gap-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-800 p-4">
                <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
                <p className="text-sm text-red-700 dark:text-red-400">{formError}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <Button
                type="submit"
                disabled={isUpdatingProfile}
                className="bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-500/20 h-11 px-6"
              >
                {isUpdatingProfile ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
              <Button type="button" variant="outline" asChild className="h-11">
                <Link href={`/billing/profiles/${id}`}>
                  Cancel
                </Link>
              </Button>
            </div>
          </form>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          {/* Current Status */}
          <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-stone-50 to-stone-100/50 dark:from-stone-800 dark:to-stone-800/50">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className={cn(
                  'p-2 rounded-lg shadow-md',
                  profile.status === 'ACTIVE' && 'bg-emerald-500',
                  profile.status === 'SUSPENDED' && 'bg-red-500',
                  profile.status === 'CLOSED' && 'bg-stone-500',
                )}>
                  <Check className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-stone-500 dark:text-stone-400">Status</p>
                  <p className={cn(
                    'font-semibold',
                    profile.status === 'ACTIVE' && 'text-emerald-600',
                    profile.status === 'SUSPENDED' && 'text-red-600',
                    profile.status === 'CLOSED' && 'text-stone-600',
                  )}>
                    {profile.status}
                  </p>
                </div>
              </div>
              {profile.status !== 'ACTIVE' && (
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Account status can be changed from the profile view page.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Info Cards */}
          <div className="space-y-3">
            <InfoCard
              icon={FileText}
              title="Account Number"
              value={profile.accountNumber}
            />
            <InfoCard
              icon={CreditCard}
              title="Current Balance"
              value={formatCurrency(profile.currentBalance || 0)}
            />
            {profile.lastStatementDate && (
              <InfoCard
                icon={Mail}
                title="Last Statement"
                value={new Date(profile.lastStatementDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              />
            )}
          </div>

          {/* Tips */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-2 text-xs text-stone-600 dark:text-stone-400">
                <Check className="h-3.5 w-3.5 text-emerald-500 mt-0.5 shrink-0" />
                <span>Profile type and member link cannot be changed</span>
              </div>
              <div className="flex items-start gap-2 text-xs text-stone-600 dark:text-stone-400">
                <Check className="h-3.5 w-3.5 text-emerald-500 mt-0.5 shrink-0" />
                <span>Changes to billing settings take effect immediately</span>
              </div>
              <div className="flex items-start gap-2 text-xs text-stone-600 dark:text-stone-400">
                <Check className="h-3.5 w-3.5 text-emerald-500 mt-0.5 shrink-0" />
                <span>Status changes require going to the profile view</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
