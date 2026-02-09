'use client'

import { useState, useCallback } from 'react'
import { Loader2, Users, Building2, Search } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@clubvantage/ui'
import { Button } from '@clubvantage/ui'
import { Input } from '@clubvantage/ui'
import { Label } from '@clubvantage/ui'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@clubvantage/ui'
import { cn } from '@clubvantage/ui'

import {
  useARStatementMutations,
  type ARProfileType,
  type StatementDelivery,
} from '@/hooks/use-ar-statements'
import { useGetMembersQuery } from '@clubvantage/api-client/hooks'

interface CreateARProfileModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

const DELIVERY_OPTIONS: { value: StatementDelivery; label: string; description: string }[] = [
  { value: 'EMAIL', label: 'Email', description: 'Send statements via email' },
  { value: 'PRINT', label: 'Print', description: 'Print physical statements' },
  { value: 'EMAIL_AND_PRINT', label: 'Email & Print', description: 'Both email and print' },
  { value: 'PORTAL', label: 'Portal', description: 'Available in member portal' },
  { value: 'SMS', label: 'SMS', description: 'Send notification via SMS' },
  { value: 'ALL', label: 'All Channels', description: 'Use all delivery methods' },
]

export function CreateARProfileModal({
  open,
  onOpenChange,
  onSuccess,
}: CreateARProfileModalProps) {
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
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { createARProfile } = useARStatementMutations()

  // Fetch members for selection
  const { data: membersData, isLoading: membersLoading } = useGetMembersQuery(
    { search: memberSearch, first: 20 },
    { enabled: profileType === 'MEMBER' && memberSearch.length >= 2 }
  )
  const members = membersData?.members?.edges?.map(e => e.node) ?? []

  // Reset form when modal opens
  const handleOpenChange = useCallback((newOpen: boolean) => {
    if (newOpen) {
      setProfileType('MEMBER')
      setMemberId('')
      setMemberSearch('')
      setAccountName('')
      setContactEmail('')
      setContactPhone('')
      setBillingAddress('')
      setStatementDelivery('EMAIL')
      setPaymentTermsDays(30)
      setCreditLimit('')
      setError(undefined)
    }
    onOpenChange(newOpen)
  }, [onOpenChange])

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

    setIsSubmitting(true)
    try {
      await createARProfile({
        profileType,
        memberId: profileType === 'MEMBER' ? memberId : undefined,
        // City Ledger standalone fields
        accountName: profileType === 'CITY_LEDGER' ? accountName.trim() : undefined,
        contactEmail: profileType === 'CITY_LEDGER' && contactEmail ? contactEmail.trim() : undefined,
        contactPhone: profileType === 'CITY_LEDGER' && contactPhone ? contactPhone.trim() : undefined,
        billingAddress: profileType === 'CITY_LEDGER' && billingAddress ? billingAddress.trim() : undefined,
        statementDelivery,
        paymentTermsDays,
        creditLimit: creditLimit ? parseFloat(creditLimit) : undefined,
      })
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create profile')
    } finally {
      setIsSubmitting(false)
    }
  }, [profileType, memberId, accountName, contactEmail, contactPhone, billingAddress, statementDelivery, paymentTermsDays, creditLimit, createARProfile, onSuccess])

  const selectedMember = members.find(m => m.id === memberId)

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {profileType === 'MEMBER' ? <Users className="h-5 w-5" /> : <Building2 className="h-5 w-5" />}
            Create AR Profile
          </DialogTitle>
          <DialogDescription>
            Create a new accounts receivable profile for statement generation.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Profile Type Toggle */}
          <div className="space-y-2">
            <Label>Profile Type</Label>
            <div className="flex rounded-lg bg-stone-100 dark:bg-stone-800 p-1">
              <button
                type="button"
                onClick={() => {
                  setProfileType('MEMBER')
                  setMemberId('')
                  setAccountName('')
                }}
                className={cn(
                  'flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors flex items-center justify-center gap-2',
                  profileType === 'MEMBER'
                    ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-sm'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                )}
              >
                <Users className="h-4 w-4" />
                Member
              </button>
              <button
                type="button"
                onClick={() => {
                  setProfileType('CITY_LEDGER')
                  setMemberId('')
                  setMemberSearch('')
                }}
                className={cn(
                  'flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors flex items-center justify-center gap-2',
                  profileType === 'CITY_LEDGER'
                    ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-sm'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                )}
              >
                <Building2 className="h-4 w-4" />
                City Ledger
              </button>
            </div>
          </div>

          {/* Member Selection */}
          {profileType === 'MEMBER' && (
            <div className="space-y-2">
              <Label>Select Member</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                <Input
                  placeholder="Search members by name or number..."
                  value={memberSearch}
                  onChange={(e) => {
                    setMemberSearch(e.target.value)
                    setMemberId('')
                  }}
                  className="pl-9"
                />
              </div>

              {/* Search Results */}
              {memberSearch.length >= 2 && (
                <div className="border border-stone-200 dark:border-stone-700 rounded-lg max-h-48 overflow-y-auto">
                  {membersLoading ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-5 w-5 animate-spin text-stone-400" />
                    </div>
                  ) : members.length > 0 ? (
                    members.map(member => (
                      <button
                        key={member.id}
                        type="button"
                        onClick={() => {
                          setMemberId(member.id)
                          setMemberSearch(`${member.firstName} ${member.lastName}`)
                        }}
                        className={cn(
                          'w-full text-left px-3 py-2 text-sm hover:bg-stone-50 dark:hover:bg-stone-800 border-b border-stone-100 dark:border-stone-800 last:border-0',
                          memberId === member.id && 'bg-amber-50 dark:bg-amber-500/10'
                        )}
                      >
                        <div className="font-medium text-stone-900 dark:text-stone-100">
                          {member.firstName} {member.lastName}
                        </div>
                        <div className="text-xs text-stone-500">
                          {member.memberId} • {member.membershipType?.name}
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="px-3 py-4 text-sm text-stone-500 text-center">
                      No members found
                    </div>
                  )}
                </div>
              )}

              {/* Selected Member */}
              {selectedMember && (
                <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-800">
                  <div className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
                    Selected: {selectedMember.firstName} {selectedMember.lastName}
                  </div>
                  <div className="text-xs text-emerald-600 dark:text-emerald-400">
                    {selectedMember.memberId}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* City Ledger Account Info */}
          {profileType === 'CITY_LEDGER' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Account Name *</Label>
                <Input
                  placeholder="Company or organization name"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Contact Email</Label>
                <Input
                  type="email"
                  placeholder="billing@company.com"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Contact Phone</Label>
                <Input
                  type="tel"
                  placeholder="+66 2 XXX XXXX"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Billing Address</Label>
                <Input
                  placeholder="Full billing address"
                  value={billingAddress}
                  onChange={(e) => setBillingAddress(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Statement Delivery */}
          <div className="space-y-2">
            <Label>Statement Delivery</Label>
            <Select value={statementDelivery} onValueChange={(v) => setStatementDelivery(v as StatementDelivery)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DELIVERY_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    <div>
                      <div>{option.label}</div>
                      <div className="text-xs text-stone-500">{option.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Payment Terms */}
          <div className="space-y-2">
            <Label>Payment Terms (Days)</Label>
            <Input
              type="number"
              min={1}
              max={90}
              value={paymentTermsDays}
              onChange={(e) => setPaymentTermsDays(parseInt(e.target.value) || 30)}
            />
            <p className="text-xs text-stone-500">
              Number of days until payment is due after statement date (1-90)
            </p>
          </div>

          {/* Credit Limit */}
          <div className="space-y-2">
            <Label>Credit Limit (Optional)</Label>
            <Input
              type="number"
              min={0}
              step={100}
              placeholder="No limit"
              value={creditLimit}
              onChange={(e) => setCreditLimit(e.target.value)}
            />
            <p className="text-xs text-stone-500">
              Leave empty for no credit limit
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 p-3 rounded-lg">
              {error}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Profile'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
