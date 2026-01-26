'use client'

import { useState, useCallback, useMemo } from 'react'
import { cn } from '@clubvantage/ui'
import { Button } from '@clubvantage/ui'
import { Input } from '@clubvantage/ui'
import {
  ChevronDown,
  Search,
  Upload,
  Loader2,
  X,
} from 'lucide-react'
import { AllocationTableRow, type AllocationInvoice } from './allocation-table-row'
import { MemberSelectionCard, type MemberSelectionData } from './member-selection-card'
import { SettlementSummary, type SettlementSummaryData } from './settlement-summary'
import { type AgingStatus } from './aging-badge'

export type PaymentMethod = 'cash' | 'card' | 'transfer' | 'check'

export interface ReceiptFormData {
  amount: number
  paymentMethod: PaymentMethod
  reference: string
  date: string
  outlet: string
  whtIncluded: boolean
  whtAmount: number
  whtRate: string
  whtCertificateNumber: string
  whtCertificateDate: string
  memberId: string | null
  allocations: Record<string, number>
}

export interface MemberSearchResult {
  id: string
  name: string
  memberNumber: string
  membershipType: string
  photoUrl?: string
  agingStatus: AgingStatus
  creditBalance: number
}

interface ReceiptFormProps {
  /** Initial form data for edit mode */
  initialData?: Partial<ReceiptFormData>
  /** Available outlets */
  outlets: { id: string; name: string }[]
  /** Currently selected member (if any) */
  selectedMember?: MemberSelectionData | null
  /** Pending invoices for the selected member */
  pendingInvoices: AllocationInvoice[]
  /** Member search results */
  memberSearchResults?: MemberSearchResult[]
  /** Loading states */
  isSearching?: boolean
  isSubmitting?: boolean
  isLoadingInvoices?: boolean
  /** Edit mode */
  isEditMode?: boolean
  /** Callback when member search is triggered */
  onMemberSearch?: (query: string) => void
  /** Callback when member is selected */
  onMemberSelect?: (memberId: string) => void
  /** Callback when member selection is cleared */
  onMemberClear?: () => void
  /** Callback when form is submitted */
  onSubmit?: (data: ReceiptFormData) => void
  /** Callback when form is cancelled */
  onCancel?: () => void
  /** Callback to apply credit */
  onApplyCredit?: () => void
  /** Additional class names */
  className?: string
}

const WHT_RATES = ['1%', '2%', '3%', '5%', '10%', '15%']

const PAYMENT_METHODS: { id: PaymentMethod; label: string }[] = [
  { id: 'cash', label: 'Cash' },
  { id: 'card', label: 'Card' },
  { id: 'transfer', label: 'Transfer' },
  { id: 'check', label: 'Check' },
]

function formatCurrencyInput(value: string): string {
  const cleaned = value.replace(/[^0-9]/g, '')
  const number = parseInt(cleaned, 10)
  if (isNaN(number)) return ''
  return new Intl.NumberFormat('th-TH').format(number)
}

function parseCurrencyInput(value: string): number {
  const cleaned = value.replace(/[^0-9]/g, '')
  const number = parseInt(cleaned, 10)
  return isNaN(number) ? 0 : number
}

export function ReceiptForm({
  initialData,
  outlets,
  selectedMember,
  pendingInvoices,
  memberSearchResults = [],
  isSearching = false,
  isSubmitting = false,
  isLoadingInvoices = false,
  isEditMode = false,
  onMemberSearch,
  onMemberSelect,
  onMemberClear,
  onSubmit,
  onCancel,
  onApplyCredit,
  className,
}: ReceiptFormProps) {
  // Form state
  const [amount, setAmount] = useState<string>(
    initialData?.amount ? formatCurrencyInput(String(initialData.amount)) : ''
  )
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    initialData?.paymentMethod || 'cash'
  )
  const [reference, setReference] = useState(initialData?.reference || '')
  const [date, setDate] = useState<string>(() => {
    if (initialData?.date) return initialData.date
    return new Date().toISOString().slice(0, 10)
  })
  const [outlet, setOutlet] = useState(initialData?.outlet || outlets[0]?.id || '')

  // WHT state
  const [whtIncluded, setWhtIncluded] = useState(initialData?.whtIncluded || false)
  const [whtAmount, setWhtAmount] = useState<string>(
    initialData?.whtAmount ? formatCurrencyInput(String(initialData.whtAmount)) : ''
  )
  const [whtRate, setWhtRate] = useState(initialData?.whtRate || '3%')
  const [whtCertificateNumber, setWhtCertificateNumber] = useState(
    initialData?.whtCertificateNumber || ''
  )
  const [whtCertificateDate, setWhtCertificateDate] = useState(
    initialData?.whtCertificateDate || ''
  )

  // Member search state
  const [memberSearchQuery, setMemberSearchQuery] = useState('')
  const [showSearchResults, setShowSearchResults] = useState(false)

  // Allocation state
  const [selectedInvoices, setSelectedInvoices] = useState<Set<string>>(new Set())
  const [allocations, setAllocations] = useState<Record<string, number>>(
    initialData?.allocations || {}
  )

  // Calculated values
  const cashAmount = parseCurrencyInput(amount)
  const whtAmountValue = whtIncluded ? parseCurrencyInput(whtAmount) : 0
  const totalSettlement = cashAmount + whtAmountValue
  const totalAllocated = useMemo(
    () => Object.values(allocations).reduce((sum, val) => sum + val, 0),
    [allocations]
  )

  // Settlement summary data
  const settlementData: SettlementSummaryData = useMemo(() => {
    const data: SettlementSummaryData = {
      cashAmount,
      whtAmount: whtAmountValue,
      allocatedAmount: totalAllocated,
    }

    // Check if this would result in reinstatement
    if (selectedMember?.agingStatus === 'suspended') {
      const outstandingAfter = pendingInvoices.reduce((sum, inv) => {
        const allocated = allocations[inv.id] || 0
        return sum + (inv.balance - allocated)
      }, 0)

      const has91PlusOutstanding = pendingInvoices.some(
        (inv) => inv.agingStatus === 'suspended' && (inv.balance - (allocations[inv.id] || 0)) > 0
      )

      if (has91PlusOutstanding) {
        data.statusChange = {
          type: 'still-suspended',
          outstandingAmount: outstandingAfter,
        }
      } else {
        data.statusChange = {
          type: 'reinstatement',
        }
      }
    }

    return data
  }, [cashAmount, whtAmountValue, totalAllocated, selectedMember, pendingInvoices, allocations])

  // Debounced member search
  const handleMemberSearchChange = useCallback(
    (value: string) => {
      setMemberSearchQuery(value)
      setShowSearchResults(true)
      if (value.length >= 2) {
        onMemberSearch?.(value)
      }
    },
    [onMemberSearch]
  )

  const handleMemberSelect = (memberId: string) => {
    onMemberSelect?.(memberId)
    setMemberSearchQuery('')
    setShowSearchResults(false)
    // Reset allocations when member changes
    setSelectedInvoices(new Set())
    setAllocations({})
  }

  const handleMemberClear = () => {
    onMemberClear?.()
    setSelectedInvoices(new Set())
    setAllocations({})
  }

  const handleInvoiceSelectionChange = (invoiceId: string, selected: boolean) => {
    const newSelected = new Set(selectedInvoices)
    if (selected) {
      newSelected.add(invoiceId)
      // Auto-fill with balance
      const invoice = pendingInvoices.find((inv) => inv.id === invoiceId)
      if (invoice) {
        setAllocations((prev) => ({ ...prev, [invoiceId]: invoice.balance }))
      }
    } else {
      newSelected.delete(invoiceId)
      setAllocations((prev) => {
        const next = { ...prev }
        delete next[invoiceId]
        return next
      })
    }
    setSelectedInvoices(newSelected)
  }

  const handleAllocationChange = (invoiceId: string, amount: number) => {
    setAllocations((prev) => ({ ...prev, [invoiceId]: amount }))
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = new Set(pendingInvoices.map((inv) => inv.id))
      setSelectedInvoices(allIds)
      const newAllocations: Record<string, number> = {}
      pendingInvoices.forEach((inv) => {
        newAllocations[inv.id] = inv.balance
      })
      setAllocations(newAllocations)
    } else {
      setSelectedInvoices(new Set())
      setAllocations({})
    }
  }

  const handleSubmit = () => {
    const formData: ReceiptFormData = {
      amount: cashAmount,
      paymentMethod,
      reference,
      date,
      outlet,
      whtIncluded,
      whtAmount: whtAmountValue,
      whtRate,
      whtCertificateNumber,
      whtCertificateDate,
      memberId: selectedMember?.id || null,
      allocations,
    }
    onSubmit?.(formData)
  }

  const isValid = cashAmount > 0 && selectedMember && totalAllocated > 0

  return (
    <div className={cn('flex flex-col gap-6', className)}>
      {/* Section 1: Payment Details */}
      <section className="rounded-xl border border bg-card p-4 sm:p-6">
        <h2 className="mb-4 text-base sm:text-lg font-semibold text-foreground">Payment Details</h2>
        <div className="grid gap-4">
          {/* Amount */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Amount
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-xl sm:text-2xl text-muted-foreground">
                ฿
              </span>
              <input
                type="text"
                inputMode="numeric"
                value={amount}
                onChange={(e) => setAmount(formatCurrencyInput(e.target.value))}
                placeholder="0"
                className="w-full rounded-lg border border-border py-2.5 sm:py-3 pl-8 sm:pl-10 pr-4 text-right text-xl sm:text-2xl font-semibold transition-colors focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
              />
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Payment Method
            </label>
            <div className="grid grid-cols-2 sm:flex gap-2 sm:gap-3">
              {PAYMENT_METHODS.map((method) => (
                <label
                  key={method.id}
                  className={cn(
                    'flex cursor-pointer items-center justify-center gap-2 rounded-lg border px-3 sm:px-4 py-2 transition-colors',
                    paymentMethod === method.id
                      ? 'border-amber-500 bg-amber-50 text-amber-700'
                      : 'border hover:border-border'
                  )}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method.id}
                    checked={paymentMethod === method.id}
                    onChange={() => setPaymentMethod(method.id)}
                    className="sr-only"
                  />
                  <span className="text-sm font-medium">{method.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Reference & Date row */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Reference # */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Reference # (Optional)
              </label>
              <Input
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="e.g., Check number, transfer ref"
              />
            </div>

            {/* Date */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Date
              </label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          {/* Outlet */}
          <div className="sm:w-1/2">
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Outlet
            </label>
            <select
              value={outlet}
              onChange={(e) => setOutlet(e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm transition-colors focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
            >
              {outlets.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Section 2: WHT Split (Collapsible) */}
      <section className="rounded-xl border border bg-card">
        <button
          onClick={() => setWhtIncluded(!whtIncluded)}
          className="flex w-full items-center justify-between p-3 sm:p-4"
        >
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={whtIncluded}
              onChange={(e) => {
                e.stopPropagation()
                setWhtIncluded(e.target.checked)
              }}
              className="h-4 w-4 rounded border-border text-amber-500 focus:ring-amber-500/30"
            />
            <span className="font-medium text-sm sm:text-base text-foreground">Include WHT Certificate</span>
          </div>
          <ChevronDown
            className={cn(
              'h-5 w-5 text-muted-foreground transition-transform',
              whtIncluded && 'rotate-180'
            )}
          />
        </button>
        {whtIncluded && (
          <div className="border-t border p-4 sm:p-6">
            <div className="grid gap-4">
              {/* WHT Amount & Rate row */}
              <div className="grid gap-4 sm:grid-cols-2">
                {/* WHT Amount */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    WHT Amount
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      ฿
                    </span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={whtAmount}
                      onChange={(e) => setWhtAmount(formatCurrencyInput(e.target.value))}
                      placeholder="0"
                      className="w-full rounded-lg border border-border py-2 pl-7 pr-3 text-right text-sm transition-colors focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                    />
                  </div>
                </div>

                {/* WHT Rate */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    WHT Rate
                  </label>
                  <select
                    value={whtRate}
                    onChange={(e) => setWhtRate(e.target.value)}
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm transition-colors focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                  >
                    {WHT_RATES.map((rate) => (
                      <option key={rate} value={rate}>
                        {rate}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Certificate # & Date row */}
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Certificate # */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    Certificate #
                  </label>
                  <Input
                    value={whtCertificateNumber}
                    onChange={(e) => setWhtCertificateNumber(e.target.value)}
                    placeholder="WHT certificate number"
                  />
                </div>

                {/* Certificate Date */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    Certificate Date
                  </label>
                  <Input
                    type="date"
                    value={whtCertificateDate}
                    onChange={(e) => setWhtCertificateDate(e.target.value)}
                  />
                </div>
              </div>

              {/* Document Upload */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Upload Certificate
                </label>
                <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-border p-4 sm:p-6 transition-colors hover:border-stone-400">
                  <div className="text-center">
                    <Upload className="mx-auto h-6 sm:h-8 w-6 sm:w-8 text-muted-foreground" />
                    <p className="mt-2 text-xs sm:text-sm text-muted-foreground">
                      Drag and drop certificate, or{' '}
                      <button type="button" className="text-amber-600 hover:underline">
                        browse
                      </button>
                    </p>
                  </div>
                </div>
              </div>

              {/* Combined Total */}
              <div>
                <div className="flex items-center justify-between rounded-lg bg-muted p-3">
                  <span className="text-sm font-medium text-foreground">Combined Total</span>
                  <span className="text-base sm:text-lg font-semibold text-foreground">
                    ฿{new Intl.NumberFormat('th-TH').format(totalSettlement)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Section 3: Member Selection */}
      <section className="rounded-xl border border bg-card p-4 sm:p-6">
        <h2 className="mb-4 text-base sm:text-lg font-semibold text-foreground">Member</h2>
        {selectedMember ? (
          <div className="space-y-3">
            <MemberSelectionCard
              member={selectedMember}
              onApplyCredit={onApplyCredit}
            />
            <button
              onClick={handleMemberClear}
              className="text-sm text-amber-600 hover:underline"
            >
              Change member
            </button>
          </div>
        ) : (
          <div className="relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={memberSearchQuery}
                onChange={(e) => handleMemberSearchChange(e.target.value)}
                placeholder="Search by name, member #, or phone"
                className="pl-9"
              />
              {isSearching && (
                <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
              )}
            </div>
            {showSearchResults && memberSearchResults.length > 0 && (
              <div className="absolute z-10 mt-1 w-full rounded-lg border border bg-card shadow-lg">
                {memberSearchResults.map((result) => (
                  <button
                    key={result.id}
                    onClick={() => handleMemberSelect(result.id)}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-muted"
                  >
                    <div className="h-8 w-8 rounded-full bg-muted" />
                    <div>
                      <div className="font-medium text-foreground">{result.name}</div>
                      <div className="text-sm text-muted-foreground">{result.memberNumber}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {/* Section 4: Invoice Allocation */}
      {selectedMember && (
        <section className="rounded-xl border border bg-card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border p-3 sm:p-4">
            <h2 className="text-base sm:text-lg font-semibold text-foreground">Invoice Allocation</h2>
            <span className="text-xs sm:text-sm text-muted-foreground">Oldest invoices selected first (FIFO)</span>
          </div>
          {isLoadingInvoices ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : pendingInvoices.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              No pending invoices for this member
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border bg-muted">
                  <tr>
                    <th className="w-12 p-3">
                      <input
                        type="checkbox"
                        checked={selectedInvoices.size === pendingInvoices.length}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="h-[18px] w-[18px] rounded border-border text-amber-500 focus:ring-amber-500/30"
                      />
                    </th>
                    <th className="p-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Invoice #
                    </th>
                    <th className="p-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Date
                    </th>
                    <th className="p-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Due
                    </th>
                    <th className="p-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Amount
                    </th>
                    <th className="p-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Balance
                    </th>
                    <th className="p-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Aging
                    </th>
                    <th className="p-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Allocate
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pendingInvoices.map((invoice) => (
                    <AllocationTableRow
                      key={invoice.id}
                      invoice={invoice}
                      isSelected={selectedInvoices.has(invoice.id)}
                      allocationAmount={allocations[invoice.id] || 0}
                      onSelectionChange={(selected) =>
                        handleInvoiceSelectionChange(invoice.id, selected)
                      }
                      onAllocationChange={(amount) =>
                        handleAllocationChange(invoice.id, amount)
                      }
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* Section 5: Settlement Summary (Sticky) */}
      <div className="sticky bottom-4">
        <SettlementSummary data={settlementData} />
      </div>

      {/* Footer */}
      <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 border-t border pt-4">
        <Button variant="ghost" onClick={onCancel} className="w-full sm:w-auto">
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!isValid || isSubmitting}
          className="w-full sm:w-auto bg-gradient-to-br from-amber-500 to-amber-600 text-white disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            `Save Receipt`
          )}
        </Button>
      </div>
    </div>
  )
}
