'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Save,
  Loader2,
  Users,
  Building2,
  Search,
  AlertCircle,
  CreditCard,
  Mail,
  Phone,
  MapPin,
  Clock,
  Check,
  Sparkles,
  Info,
  HelpCircle,
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
  useARStatementMutations,
  type ARProfileType,
  type StatementDelivery,
} from '@/hooks/use-ar-statements'
import { useGetMembersQuery } from '@clubvantage/api-client/hooks'

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
  description,
  icon: Icon,
}: {
  title: string
  description: string
  icon: typeof Info
}) {
  return (
    <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-white dark:bg-stone-900 shadow-sm">
          <Icon className="h-4 w-4 text-amber-600" />
        </div>
        <div>
          <p className="text-sm font-medium text-stone-900 dark:text-stone-100">{title}</p>
          <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">{description}</p>
        </div>
      </div>
    </div>
  )
}

export default function NewARProfilePage() {
  const router = useRouter()
  const { createARProfile, isCreatingProfile } = useARStatementMutations()

  // Form state
  const [profileType, setProfileType] = useState<ARProfileType>('MEMBER')
  const [memberId, setMemberId] = useState<string>('')
  const [memberSearch, setMemberSearch] = useState('')
  // City Ledger standalone account fields
  const [accountName, setAccountName] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [billingAddress, setBillingAddress] = useState('')
  // Common fields
  const [statementDelivery, setStatementDelivery] = useState<StatementDelivery>('EMAIL')
  const [paymentTermsDays, setPaymentTermsDays] = useState(30)
  const [creditLimit, setCreditLimit] = useState<string>('')
  const [error, setError] = useState<string>()

  // Fetch members for selection
  const { data: membersData, isLoading: membersLoading } = useGetMembersQuery(
    { search: memberSearch, first: 20 },
    { enabled: profileType === 'MEMBER' && memberSearch.length >= 2 }
  )
  const members = membersData?.members?.edges?.map(e => e.node) ?? []

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setError(undefined)

    // Validation
    if (profileType === 'MEMBER' && !memberId) {
      setError('Please select a member')
      return
    }
    if (profileType === 'CITY_LEDGER' && !accountName.trim()) {
      setError('Please enter an account name')
      return
    }

    try {
      const result = await createARProfile({
        profileType,
        memberId: profileType === 'MEMBER' ? memberId : undefined,
        accountName: profileType === 'CITY_LEDGER' ? accountName.trim() : undefined,
        contactEmail: profileType === 'CITY_LEDGER' && contactEmail ? contactEmail.trim() : undefined,
        contactPhone: profileType === 'CITY_LEDGER' && contactPhone ? contactPhone.trim() : undefined,
        billingAddress: profileType === 'CITY_LEDGER' && billingAddress ? billingAddress.trim() : undefined,
        statementDelivery,
        paymentTermsDays,
        creditLimit: creditLimit ? parseFloat(creditLimit) : undefined,
      })
      // Navigate to the new profile
      if (result?.createARProfile?.id) {
        router.push(`/billing/profiles/${result.createARProfile.id}`)
      } else {
        router.push('/billing/profiles')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create profile')
    }
  }, [profileType, memberId, accountName, contactEmail, contactPhone, billingAddress, statementDelivery, paymentTermsDays, creditLimit, createARProfile, router])

  const selectedMember = members.find(m => m.id === memberId)

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
                <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900 dark:to-amber-800 shadow-lg">
                  <CreditCard className="h-8 w-8 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
                    New AR Profile
                  </h1>
                  <p className="mt-1 text-sm text-stone-500 dark:text-stone-400 max-w-lg">
                    Create a new accounts receivable profile for statement generation and billing management.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Type Selection */}
            <Card className="overflow-hidden">
              <CardHeader className="border-b border-stone-100 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/30">
                <CardTitle className="text-sm font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-400">
                  Profile Type
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setProfileType('MEMBER')
                      setMemberId('')
                      setAccountName('')
                    }}
                    className={cn(
                      'relative overflow-hidden rounded-xl border-2 p-5 text-left transition-all hover:shadow-md',
                      profileType === 'MEMBER'
                        ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-500/10 shadow-md'
                        : 'border-stone-200 dark:border-stone-700 hover:border-blue-300 hover:bg-blue-50/30 dark:hover:bg-blue-500/5'
                    )}
                  >
                    {profileType === 'MEMBER' && (
                      <div className="absolute right-3 top-3">
                        <div className="rounded-full bg-blue-500 p-1">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                      </div>
                    )}
                    <div className={cn(
                      'rounded-xl p-3 inline-flex',
                      profileType === 'MEMBER'
                        ? 'bg-blue-500 text-white'
                        : 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                    )}>
                      <Users className="h-6 w-6" />
                    </div>
                    <div className="mt-4">
                      <div className="font-semibold text-stone-900 dark:text-stone-100">Member</div>
                      <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                        Link to an existing club member for billing
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setProfileType('CITY_LEDGER')
                      setMemberId('')
                      setMemberSearch('')
                    }}
                    className={cn(
                      'relative overflow-hidden rounded-xl border-2 p-5 text-left transition-all hover:shadow-md',
                      profileType === 'CITY_LEDGER'
                        ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-500/10 shadow-md'
                        : 'border-stone-200 dark:border-stone-700 hover:border-purple-300 hover:bg-purple-50/30 dark:hover:bg-purple-500/5'
                    )}
                  >
                    {profileType === 'CITY_LEDGER' && (
                      <div className="absolute right-3 top-3">
                        <div className="rounded-full bg-purple-500 p-1">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                      </div>
                    )}
                    <div className={cn(
                      'rounded-xl p-3 inline-flex',
                      profileType === 'CITY_LEDGER'
                        ? 'bg-purple-500 text-white'
                        : 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400'
                    )}>
                      <Building2 className="h-6 w-6" />
                    </div>
                    <div className="mt-4">
                      <div className="font-semibold text-stone-900 dark:text-stone-100">City Ledger</div>
                      <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                        Corporate or external account without membership
                      </p>
                    </div>
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Member Selection */}
            {profileType === 'MEMBER' && (
              <Card className="overflow-hidden">
                <CardHeader className="border-b border-stone-100 dark:border-stone-800 bg-blue-50/30 dark:bg-blue-900/10">
                  <CardTitle className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-400">
                    <Users className="h-4 w-4 text-blue-600" />
                    Select Member
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5 space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                    <Input
                      placeholder="Search members by name or number..."
                      value={memberSearch}
                      onChange={(e) => {
                        setMemberSearch(e.target.value)
                        setMemberId('')
                      }}
                      className="pl-10 h-11 bg-white dark:bg-stone-900"
                    />
                  </div>

                  {/* Search Results */}
                  {memberSearch.length >= 2 && (
                    <div className="border border-stone-200 dark:border-stone-700 rounded-xl overflow-hidden max-h-72 overflow-y-auto">
                      {membersLoading ? (
                        <div className="flex items-center justify-center py-10">
                          <Loader2 className="h-6 w-6 animate-spin text-stone-400" />
                        </div>
                      ) : members.length > 0 ? (
                        <div className="divide-y divide-stone-100 dark:divide-stone-800">
                          {members.map(member => (
                            <button
                              key={member.id}
                              type="button"
                              onClick={() => {
                                setMemberId(member.id)
                                setMemberSearch(`${member.firstName} ${member.lastName}`)
                              }}
                              className={cn(
                                'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors',
                                memberId === member.id
                                  ? 'bg-blue-50 dark:bg-blue-500/10'
                                  : 'hover:bg-stone-50 dark:hover:bg-stone-800/50'
                              )}
                            >
                              <Avatar className="h-10 w-10 border">
                                {member.avatarUrl && (
                                  <AvatarImage src={member.avatarUrl} alt={`${member.firstName} ${member.lastName}`} />
                                )}
                                <AvatarFallback className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 text-sm">
                                  {getInitials(member.firstName, member.lastName)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-stone-900 dark:text-stone-100">
                                  {member.firstName} {member.lastName}
                                </div>
                                <div className="text-xs text-stone-500 flex items-center gap-2">
                                  <span className="font-mono">{member.memberId}</span>
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
                              {memberId === member.id && (
                                <Check className="h-5 w-5 text-blue-600 shrink-0" />
                              )}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="px-4 py-10 text-center">
                          <Users className="h-10 w-10 mx-auto text-stone-300 dark:text-stone-600" />
                          <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
                            No members found matching "{memberSearch}"
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Selected Member Display */}
                  {selectedMember && (
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-emerald-100/50 dark:from-emerald-500/10 dark:to-emerald-500/5 border border-emerald-200/50 dark:border-emerald-800/50">
                      <Avatar className="h-12 w-12 border-2 border-emerald-300 shadow-md">
                        {selectedMember.avatarUrl && (
                          <AvatarImage src={selectedMember.avatarUrl} alt={`${selectedMember.firstName} ${selectedMember.lastName}`} />
                        )}
                        <AvatarFallback className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
                          {getInitials(selectedMember.firstName, selectedMember.lastName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="font-semibold text-emerald-900 dark:text-emerald-100">
                          {selectedMember.firstName} {selectedMember.lastName}
                        </div>
                        <div className="text-xs text-emerald-700 dark:text-emerald-400 font-mono">
                          {selectedMember.memberId}
                        </div>
                      </div>
                      <div className="p-2 rounded-full bg-emerald-500">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* City Ledger Account Info */}
            {profileType === 'CITY_LEDGER' && (
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
            {error && (
              <div className="flex items-center gap-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-800 p-4">
                <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
                <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <Button
                type="submit"
                disabled={isCreatingProfile}
                className="bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-500/20 h-11 px-6"
              >
                {isCreatingProfile ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Create Profile
                  </>
                )}
              </Button>
              <Button type="button" variant="outline" asChild className="h-11">
                <Link href="/billing/profiles">
                  Cancel
                </Link>
              </Button>
            </div>
          </form>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          {/* Help Card */}
          <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-900/30 dark:to-amber-900/10">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-amber-500 shadow-md">
                  <HelpCircle className="h-4 w-4 text-white" />
                </div>
                <h3 className="font-semibold text-stone-900 dark:text-stone-100">Quick Guide</h3>
              </div>
              <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                AR Profiles enable statement generation and payment tracking. Choose a profile type to get started.
              </p>
            </CardContent>
          </Card>

          {/* Info Cards */}
          <div className="space-y-3">
            <InfoCard
              icon={Users}
              title="Member Profile"
              description="Links to an existing member record. Billing is associated with their membership."
            />
            <InfoCard
              icon={Building2}
              title="City Ledger"
              description="Standalone account for corporations or non-members requiring billing."
            />
            <InfoCard
              icon={Mail}
              title="Statement Delivery"
              description="Configure how statements are delivered. Can be changed later."
            />
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
                <span>Payment terms default to 30 days</span>
              </div>
              <div className="flex items-start gap-2 text-xs text-stone-600 dark:text-stone-400">
                <Check className="h-3.5 w-3.5 text-emerald-500 mt-0.5 shrink-0" />
                <span>Credit limits can be set to prevent over-charging</span>
              </div>
              <div className="flex items-start gap-2 text-xs text-stone-600 dark:text-stone-400">
                <Check className="h-3.5 w-3.5 text-emerald-500 mt-0.5 shrink-0" />
                <span>Email delivery is recommended for most accounts</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
