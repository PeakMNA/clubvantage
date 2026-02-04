'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { cn } from '@clubvantage/ui'
import { Input } from '@clubvantage/ui'
import {
  Search,
  Loader2,
  X,
  Building2,
  User,
  Users,
  Briefcase,
  Home,
  Package,
  HelpCircle,
} from 'lucide-react'
import { AgingBadge, type AgingStatus } from './aging-badge'

export type ArAccountType = 'MEMBER' | 'CITY_LEDGER'

export type CityLedgerSubType = 'CORPORATE' | 'HOUSE' | 'VENDOR' | 'OTHER'

export interface ArAccountSearchResult {
  id: string
  accountType: ArAccountType
  accountNumber: string
  accountName: string
  subType?: string // Membership type for members, CityLedgerType for city ledger
  outstandingBalance: number
  creditBalance: number
  invoiceCount: number
  agingStatus?: AgingStatus
  photoUrl?: string
  dependentCount?: number
}

interface ArAccountSearchProps {
  /** Callback when an account is selected */
  onSelect: (account: ArAccountSearchResult) => void
  /** Callback when selection is cleared */
  onClear: () => void
  /** Currently selected account */
  selectedAccount?: ArAccountSearchResult | null
  /** Loading state for search */
  isLoading?: boolean
  /** Placeholder text */
  placeholder?: string
  /** Search results */
  searchResults?: ArAccountSearchResult[]
  /** Callback when search query changes */
  onSearch?: (query: string) => void
  /** Additional class names */
  className?: string
  /** Debounce delay in ms */
  debounceMs?: number
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function getCityLedgerIcon(subType?: string) {
  switch (subType) {
    case 'CORPORATE':
      return <Briefcase className="h-3.5 w-3.5" />
    case 'HOUSE':
      return <Home className="h-3.5 w-3.5" />
    case 'VENDOR':
      return <Package className="h-3.5 w-3.5" />
    default:
      return <HelpCircle className="h-3.5 w-3.5" />
  }
}

function getCityLedgerLabel(subType?: string): string {
  switch (subType) {
    case 'CORPORATE':
      return 'Corporate'
    case 'HOUSE':
      return 'House'
    case 'VENDOR':
      return 'Vendor'
    case 'OTHER':
      return 'Other'
    default:
      return 'City Ledger'
  }
}

function AccountTypeBadge({ account }: { account: ArAccountSearchResult }) {
  if (account.accountType === 'MEMBER') {
    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-blue-100 px-1.5 py-0.5 text-xs font-medium text-blue-700">
        <User className="h-3 w-3" />
        M
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-purple-100 px-1.5 py-0.5 text-xs font-medium text-purple-700">
      {getCityLedgerIcon(account.subType)}
      {getCityLedgerLabel(account.subType).charAt(0)}
    </span>
  )
}

function AccountSearchResultItem({
  account,
  onSelect,
  isSelected,
}: {
  account: ArAccountSearchResult
  onSelect: () => void
  isSelected: boolean
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'flex w-full items-center gap-3 px-4 py-3 text-left transition-colors',
        isSelected ? 'bg-amber-50' : 'hover:bg-muted'
      )}
    >
      {/* Avatar */}
      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-muted flex items-center justify-center">
        {account.photoUrl ? (
          <img
            src={account.photoUrl}
            alt={account.accountName}
            className="h-full w-full object-cover"
          />
        ) : account.accountType === 'MEMBER' ? (
          <User className="h-5 w-5 text-muted-foreground" />
        ) : (
          <Building2 className="h-5 w-5 text-muted-foreground" />
        )}
      </div>

      {/* Account info */}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        {/* Row 1: Name + Type Badge + Aging */}
        <div className="flex items-center gap-2">
          <AccountTypeBadge account={account} />
          <span className="truncate font-medium text-foreground">
            {account.accountName}
          </span>
          {account.agingStatus && account.agingStatus !== 'current' && (
            <AgingBadge status={account.agingStatus} />
          )}
        </div>

        {/* Row 2: Account number + subtype */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="font-mono">{account.accountNumber}</span>
          {account.subType && (
            <>
              <span>·</span>
              <span>{account.subType}</span>
            </>
          )}
          {account.dependentCount !== undefined && account.dependentCount > 0 && (
            <>
              <span>·</span>
              <span className="inline-flex items-center gap-1">
                <Users className="h-3 w-3" />
                {account.dependentCount}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Right: Balances */}
      <div className="flex shrink-0 flex-col items-end text-sm">
        {account.outstandingBalance > 0 && (
          <span className="font-medium text-red-600">
            {formatCurrency(account.outstandingBalance)} due
          </span>
        )}
        {account.creditBalance > 0 && (
          <span className="text-emerald-600">
            {formatCurrency(account.creditBalance)} credit
          </span>
        )}
        {account.invoiceCount > 0 && (
          <span className="text-muted-foreground">
            {account.invoiceCount} invoice{account.invoiceCount !== 1 ? 's' : ''}
          </span>
        )}
      </div>
    </button>
  )
}

function SelectedAccountCard({
  account,
  onClear,
}: {
  account: ArAccountSearchResult
  onClear: () => void
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl border bg-muted p-4">
      {/* Avatar */}
      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-card flex items-center justify-center">
        {account.photoUrl ? (
          <img
            src={account.photoUrl}
            alt={account.accountName}
            className="h-full w-full object-cover"
          />
        ) : account.accountType === 'MEMBER' ? (
          <User className="h-6 w-6 text-muted-foreground" />
        ) : (
          <Building2 className="h-6 w-6 text-muted-foreground" />
        )}
      </div>

      {/* Info */}
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-center gap-2">
          <AccountTypeBadge account={account} />
          <span className="truncate font-semibold text-foreground">
            {account.accountName}
          </span>
          {account.agingStatus && <AgingBadge status={account.agingStatus} />}
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="font-mono">{account.accountNumber}</span>
          {account.subType && (
            <>
              <span>·</span>
              <span>{account.subType}</span>
            </>
          )}
        </div>
      </div>

      {/* Balances & Clear */}
      <div className="flex shrink-0 items-center gap-4">
        <div className="flex flex-col items-end text-sm">
          {account.outstandingBalance > 0 && (
            <span className="font-medium text-red-600">
              {formatCurrency(account.outstandingBalance)} outstanding
            </span>
          )}
          {account.creditBalance > 0 && (
            <span className="text-emerald-600">
              {formatCurrency(account.creditBalance)} credit
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={onClear}
          className="rounded-full p-1.5 text-muted-foreground hover:bg-card hover:text-foreground"
          aria-label="Clear selection"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

export function ArAccountSearch({
  onSelect,
  onClear,
  selectedAccount,
  isLoading = false,
  placeholder = 'Search members or accounts...',
  searchResults = [],
  onSearch,
  className,
  debounceMs = 300,
}: ArAccountSearchProps) {
  const [query, setQuery] = useState('')
  const [showResults, setShowResults] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<NodeJS.Timeout>(undefined)

  // Debounced search
  const handleQueryChange = useCallback(
    (value: string) => {
      setQuery(value)
      setShowResults(true)
      setSelectedIndex(-1)

      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }

      if (value.length >= 2) {
        debounceRef.current = setTimeout(() => {
          onSearch?.(value)
        }, debounceMs)
      }
    },
    [onSearch, debounceMs]
  )

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!showResults || searchResults.length === 0) return

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex((prev) =>
            prev < searchResults.length - 1 ? prev + 1 : prev
          )
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1))
          break
        case 'Enter':
          e.preventDefault()
          if (selectedIndex >= 0 && selectedIndex < searchResults.length) {
            const selectedResult = searchResults[selectedIndex]
            if (selectedResult) {
              handleSelect(selectedResult)
            }
          }
          break
        case 'Escape':
          e.preventDefault()
          setShowResults(false)
          inputRef.current?.blur()
          break
      }
    },
    [showResults, searchResults, selectedIndex]
  )

  const handleSelect = useCallback(
    (account: ArAccountSearchResult) => {
      onSelect(account)
      setQuery('')
      setShowResults(false)
      setSelectedIndex(-1)
    },
    [onSelect]
  )

  const handleClear = useCallback(() => {
    onClear()
    setQuery('')
    inputRef.current?.focus()
  }, [onClear])

  // Close results on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        resultsRef.current &&
        !resultsRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowResults(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Show selected account card if one is selected
  if (selectedAccount) {
    return (
      <SelectedAccountCard account={selectedAccount} onClear={handleClear} />
    )
  }

  return (
    <div className={cn('relative', className)}>
      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length >= 2 && setShowResults(true)}
          placeholder={placeholder}
          className="pl-9 pr-9"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        )}
      </div>

      {/* Results dropdown */}
      {showResults && query.length >= 2 && (
        <div
          ref={resultsRef}
          className="absolute z-20 mt-1 w-full rounded-lg border bg-card shadow-lg max-h-80 overflow-y-auto"
        >
          {searchResults.length === 0 ? (
            <div className="px-4 py-8 text-center text-muted-foreground">
              {isLoading ? 'Searching...' : 'No accounts found'}
            </div>
          ) : (
            <div className="divide-y">
              {searchResults.map((account, index) => (
                <AccountSearchResultItem
                  key={`${account.accountType}-${account.id}`}
                  account={account}
                  onSelect={() => handleSelect(account)}
                  isSelected={index === selectedIndex}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
