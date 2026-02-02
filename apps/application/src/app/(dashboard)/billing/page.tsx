'use client'

import { useState, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Wand2, FileText } from 'lucide-react'
import { Button } from '@clubvantage/ui'

// Direct imports to optimize bundle size (avoid barrel imports)
import { BillingTabsLayout, type BillingTab } from '@/components/billing/billing-tabs-layout'
import { type AgingStatus } from '@/components/billing/aging-badge'

// Dynamic imports for tab content - only loaded when tab is selected
import {
  DynamicInvoiceRegister as InvoiceRegister,
  DynamicReceiptRegister as ReceiptRegister,
  DynamicWhtCertificatesTab as WhtCertificatesTab,
  DynamicAgingDashboardTab as AgingDashboardTab,
  DynamicCreditNoteList as CreditNoteList,
} from '@/components/billing/dynamic-tabs'

// Modal imports
import { InvoiceCreateModal, type InvoiceFormData } from '@/components/billing/invoice-create-modal'
import { type ChargeType } from '@/components/billing/invoice-line-item-row'
import { PaymentRecordModal } from '@/components/billing/payment-record-modal'
import { CreditNoteModal, type CreditNoteFormData } from '@/components/billing/credit-note-modal'
import { StatementModal, type StatementFormData } from '@/components/billing/statement-modal'
import { type StatementTransaction, type StatementMember } from '@/components/billing/member-statement'
import { type MemberSelectionData } from '@/components/billing/member-selection-card'
import { type AllocationInvoice } from '@/components/billing/allocation-table-row'
import { type MemberSearchResult } from '@/components/billing/receipt-form'

// Type-only imports for data structures
import type {
  InvoiceRegisterItem,
  InvoiceRegisterSummary,
} from '@/components/billing/invoice-register'
import type {
  ReceiptRegisterItem,
  ReceiptRegisterSummary,
} from '@/components/billing/receipt-register'
import type {
  WhtCertificateItem,
  WhtCertificatesSummary,
} from '@/components/billing/wht-certificates-tab'
import type {
  AgingBucket,
  AgingMember,
  ReinstatedMember,
} from '@/components/billing/aging-dashboard-tab'
import type {
  CreditNoteListItem,
  CreditNoteSummary,
  CreditNoteStatus as ListCreditNoteStatus,
  CreditNoteType as ListCreditNoteType,
} from '@/components/billing/credit-note-list'

import { useInvoices } from '@/hooks/use-billing'
import { type MemberOption } from '@clubvantage/ui'

// Fallback mock invoice data (used when API unavailable)
const mockInvoices: InvoiceRegisterItem[] = [
  {
    id: '1',
    invoiceNumber: 'INV-2024-0001',
    memberId: 'M001',
    memberName: 'John Smith',
    date: new Date('2024-01-15'),
    dueDate: new Date('2024-02-15'),
    amount: 45000,
    balance: 45000,
    status: 'sent',
    agingStatus: 'current',
  },
  {
    id: '2',
    invoiceNumber: 'INV-2024-0002',
    memberId: 'M002',
    memberName: 'Sarah Johnson',
    date: new Date('2024-01-10'),
    dueDate: new Date('2024-02-10'),
    amount: 32000,
    balance: 12000,
    status: 'partial',
    agingStatus: '30',
  },
  {
    id: '3',
    invoiceNumber: 'INV-2024-0003',
    memberId: 'M003',
    memberName: 'Michael Chen',
    date: new Date('2023-11-01'),
    dueDate: new Date('2023-12-01'),
    amount: 55000,
    balance: 55000,
    status: 'overdue',
    agingStatus: '90',
  },
  {
    id: '4',
    invoiceNumber: 'INV-2024-0004',
    memberId: 'M004',
    memberName: 'Emily Davis',
    date: new Date('2024-01-20'),
    dueDate: new Date('2024-02-20'),
    amount: 28000,
    balance: 0,
    status: 'paid',
    agingStatus: 'current',
  },
  {
    id: '5',
    invoiceNumber: 'INV-2024-0005',
    memberId: 'M005',
    memberName: 'Robert Wilson',
    date: new Date('2023-09-15'),
    dueDate: new Date('2023-10-15'),
    amount: 120000,
    balance: 120000,
    status: 'overdue',
    agingStatus: 'suspended',
  },
]

const mockInvoiceSummary: InvoiceRegisterSummary = {
  totalInvoiced: 4580000,
  outstanding: 1250000,
  current: 800000,
  days30to60: 250000,
  days61to90: 80000,
  days91Plus: 120000,
}

// Mock receipt data
const mockReceipts: ReceiptRegisterItem[] = [
  {
    id: '1',
    receiptNumber: 'RCP-2024-0001',
    memberId: 'M002',
    memberName: 'Sarah Johnson',
    date: new Date('2024-01-18'),
    amount: 20000,
    method: 'transfer',
    outlet: 'Main Office',
    whtAmount: 600,
    status: 'completed',
    allocations: [
      {
        invoiceId: '2',
        invoiceNumber: 'INV-2024-0002',
        amountAllocated: 20000,
        balanceAfter: 12000,
      },
    ],
  },
  {
    id: '2',
    receiptNumber: 'RCP-2024-0002',
    memberId: 'M004',
    memberName: 'Emily Davis',
    date: new Date('2024-01-20'),
    amount: 28000,
    method: 'card',
    outlet: 'Pro Shop',
    status: 'completed',
    allocations: [
      {
        invoiceId: '4',
        invoiceNumber: 'INV-2024-0004',
        amountAllocated: 28000,
        balanceAfter: 0,
      },
    ],
  },
]

const mockReceiptSummary: ReceiptRegisterSummary = {
  totalReceipts: 89,
  cashReceived: 1850000,
  whtReceived: 55500,
  invoicesSettled: 67,
  depositsToCredit: 12500,
}

// Mock WHT data
const mockWhtCertificates: WhtCertificateItem[] = [
  {
    id: '1',
    certificateNumber: 'WHT-2024-0001',
    memberId: 'M002',
    memberName: 'Sarah Johnson',
    receiptId: '1',
    receiptNumber: 'RCP-2024-0001',
    amount: 600,
    rate: '3%',
    date: new Date('2024-01-18'),
    status: 'pending',
  },
  {
    id: '2',
    certificateNumber: 'WHT-2024-0002',
    memberId: 'M006',
    memberName: 'Lisa Thompson',
    receiptId: '3',
    receiptNumber: 'RCP-2024-0003',
    amount: 1500,
    rate: '3%',
    date: new Date('2024-01-15'),
    status: 'verified',
    verifiedBy: 'Admin User',
    verifiedAt: new Date('2024-01-16'),
  },
]

const mockWhtSummary: WhtCertificatesSummary = {
  pending: 12,
  verified: 45,
  totalAmount: 55500,
}

// Mock credit note data
const mockCreditNotes: CreditNoteListItem[] = [
  {
    id: '1',
    creditNoteNumber: 'CN-2024-000001',
    memberId: 'M002',
    memberName: 'Sarah Johnson',
    issueDate: new Date('2024-01-20'),
    type: 'adjustment',
    reason: 'Billing error correction',
    totalAmount: 5000,
    appliedAmount: 5000,
    status: 'applied',
  },
  {
    id: '2',
    creditNoteNumber: 'CN-2024-000002',
    memberId: 'M003',
    memberName: 'Michael Chen',
    issueDate: new Date('2024-01-22'),
    type: 'courtesy',
    reason: 'Service compensation',
    totalAmount: 15000,
    appliedAmount: 0,
    status: 'pending_approval',
  },
  {
    id: '3',
    creditNoteNumber: 'CN-2024-000003',
    memberId: 'M005',
    memberName: 'Robert Wilson',
    issueDate: new Date('2024-01-25'),
    type: 'promo',
    reason: 'New year promotion',
    totalAmount: 10000,
    appliedAmount: 3000,
    status: 'partially_applied',
  },
]

const mockCreditNoteSummary: CreditNoteSummary = {
  totalIssued: 150000,
  pendingApproval: 15000,
  applied: 85000,
  availableBalance: 50000,
}

const mockReinstatedMembers: ReinstatedMember[] = [
  {
    id: 'M007',
    name: 'David Brown',
    clearedDate: new Date('2024-01-10'),
    previousBalance: 85000,
    receiptId: 'R007',
    receiptNumber: 'RCP-2024-0010',
  },
]

// Mock charge types for invoice creation
const mockChargeTypes: ChargeType[] = [
  { id: 'ct1', code: 'DUES', name: 'Monthly Dues', defaultPrice: 15000, taxable: true, taxRate: 7 },
  { id: 'ct2', code: 'F&B', name: 'Food & Beverage', defaultPrice: 0, taxable: true, taxRate: 7 },
  { id: 'ct3', code: 'GOLF', name: 'Green Fees', defaultPrice: 3500, taxable: true, taxRate: 7 },
  { id: 'ct4', code: 'CART', name: 'Cart Rental', defaultPrice: 800, taxable: true, taxRate: 7 },
  { id: 'ct5', code: 'CADDY', name: 'Caddy Fee', defaultPrice: 500, taxable: false, taxRate: 0 },
]

// Mock member options for combobox
const mockMemberOptions: MemberOption[] = [
  { id: 'M001', memberId: 'M001', firstName: 'John', lastName: 'Smith', email: 'john@example.com' },
  { id: 'M002', memberId: 'M002', firstName: 'Sarah', lastName: 'Johnson', email: 'sarah@example.com' },
  { id: 'M003', memberId: 'M003', firstName: 'Michael', lastName: 'Chen', email: 'michael@example.com' },
  { id: 'M004', memberId: 'M004', firstName: 'Emily', lastName: 'Davis', email: 'emily@example.com' },
  { id: 'M005', memberId: 'M005', firstName: 'Robert', lastName: 'Wilson', email: 'robert@example.com' },
]

// Mock member search results
const mockMemberSearchResults: MemberSearchResult[] = [
  { id: 'M001', name: 'John Smith', memberNumber: 'M001', membershipType: 'Golf Premium', agingStatus: 'current', creditBalance: 0 },
  { id: 'M002', name: 'Sarah Johnson', memberNumber: 'M002', membershipType: 'Golf Standard', agingStatus: '30', creditBalance: 0 },
  { id: 'M003', name: 'Michael Chen', memberNumber: 'M003', membershipType: 'Golf Premium', agingStatus: '90', creditBalance: 0 },
]

// Mock outlets for payment
const mockOutlets = [
  { id: 'o1', name: 'Main Office' },
  { id: 'o2', name: 'Pro Shop' },
  { id: 'o3', name: 'Restaurant' },
  { id: 'o4', name: 'Fitness Center' },
]

export default function BillingPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<BillingTab>('invoices')
  const [currentPage, setCurrentPage] = useState(1)

  // Modal states
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [isCreditNoteModalOpen, setIsCreditNoteModalOpen] = useState(false)
  const [isStatementModalOpen, setIsStatementModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch invoices from API
  const {
    invoices: apiInvoices,
    summary: apiSummary,
    totalCount: apiTotalCount,
    totalPages: apiTotalPages,
    isLoading: isInvoicesLoading,
  } = useInvoices({ page: currentPage, pageSize: 20 })

  // Use API data if available, fall back to mock data
  const invoices = apiInvoices.length > 0 ? apiInvoices : mockInvoices
  const invoiceSummary = apiInvoices.length > 0 ? apiSummary : mockInvoiceSummary
  const invoiceTotalCount = apiInvoices.length > 0 ? apiTotalCount : mockInvoices.length
  const invoiceTotalPages = apiInvoices.length > 0 ? apiTotalPages : 1

  // Calculate aging members from invoices
  const agingMembers = useMemo((): AgingMember[] => {
    const overdueInvoices = invoices.filter(
      (inv) => inv.agingStatus === '90' || inv.agingStatus === 'suspended'
    )
    return overdueInvoices.map((inv) => {
      const dueDate = inv.dueDate instanceof Date ? inv.dueDate : new Date(inv.dueDate)
      return {
        id: inv.memberId,
        name: inv.memberName,
        membershipType: 'Member',
        balance: inv.balance,
        oldestInvoiceDate: dueDate,
        daysOutstanding: Math.floor(
          (new Date().getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)
        ),
        status: inv.agingStatus as AgingStatus,
      }
    })
  }, [invoices])

  // Calculate aging buckets from invoices
  const agingBuckets = useMemo((): AgingBucket[] => {
    const buckets = {
      current: { count: 0, amount: 0 },
      '30': { count: 0, amount: 0 },
      '60': { count: 0, amount: 0 },
      '90': { count: 0, amount: 0 },
      suspended: { count: 0, amount: 0 },
    }

    invoices.forEach((inv) => {
      if (inv.balance > 0) {
        const key = inv.agingStatus as keyof typeof buckets
        if (buckets[key]) {
          buckets[key].count++
          buckets[key].amount += inv.balance
        }
      }
    })

    const totalAmount = Object.values(buckets).reduce((sum, b) => sum + b.amount, 0)

    return [
      { id: 'current', label: 'Current', memberCount: buckets.current.count, totalAmount: buckets.current.amount, percentage: totalAmount > 0 ? Math.round((buckets.current.amount / totalAmount) * 100) : 0 },
      { id: '30', label: '1-30 Days', memberCount: buckets['30'].count, totalAmount: buckets['30'].amount, percentage: totalAmount > 0 ? Math.round((buckets['30'].amount / totalAmount) * 100) : 0 },
      { id: '60', label: '31-60 Days', memberCount: buckets['60'].count, totalAmount: buckets['60'].amount, percentage: totalAmount > 0 ? Math.round((buckets['60'].amount / totalAmount) * 100) : 0 },
      { id: '90', label: '61-90 Days', memberCount: buckets['90'].count, totalAmount: buckets['90'].amount, percentage: totalAmount > 0 ? Math.round((buckets['90'].amount / totalAmount) * 100) : 0 },
      { id: 'suspended', label: '91+ Days', memberCount: buckets.suspended.count, totalAmount: buckets.suspended.amount, percentage: totalAmount > 0 ? Math.round((buckets.suspended.amount / totalAmount) * 100) : 0 },
    ]
  }, [invoices])

  const tabBadges: Partial<Record<BillingTab, number>> = {
    invoices: invoiceTotalCount,
    receipts: mockReceipts.length,
    'credit-notes': mockCreditNotes.filter((c) => c.status === 'pending_approval').length,
    'wht-certificates': mockWhtCertificates.filter((c) => c.status === 'pending').length,
    aging: agingMembers.length,
  }

  // Modal handlers
  const handleNewReceipt = () => {
    setIsPaymentModalOpen(true)
  }

  const handleNewInvoice = () => {
    setIsInvoiceModalOpen(true)
  }

  const handleNewCreditNote = () => {
    setIsCreditNoteModalOpen(true)
  }

  const handleGenerateStatement = () => {
    setIsStatementModalOpen(true)
  }

  const handleFetchStatement = useCallback(async (data: StatementFormData): Promise<{
    member: StatementMember
    openingBalance: number
    closingBalance: number
    transactions: StatementTransaction[]
  }> => {
    // Mock statement data - TODO: replace with actual API call
    const memberData = mockMemberOptions.find((m) => m.id === data.memberId)
    const memberInvoices = mockInvoices.filter((inv) => inv.memberId === data.memberId)

    // Generate mock transactions from invoices
    const transactions: StatementTransaction[] = memberInvoices.map((inv) => ({
      id: inv.id,
      date: inv.date,
      type: 'INVOICE' as const,
      description: `Invoice ${inv.invoiceNumber}`,
      reference: inv.invoiceNumber,
      debit: inv.amount,
      runningBalance: inv.balance,
    }))

    return {
      member: {
        id: data.memberId,
        name: memberData ? `${memberData.firstName} ${memberData.lastName}` : 'Unknown',
        memberNumber: memberData?.memberId || data.memberId,
        membershipType: 'Golf Premium',
        email: memberData?.email,
      },
      openingBalance: 0,
      closingBalance: transactions.reduce((sum, t) => sum + (t.debit || 0) - (t.credit || 0), 0),
      transactions,
    }
  }, [])

  const handleInvoiceSubmit = useCallback(async (data: InvoiceFormData) => {
    setIsSubmitting(true)
    try {
      // TODO: Call GraphQL mutation
      console.log('Creating invoice:', data)
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setIsInvoiceModalOpen(false)
    } finally {
      setIsSubmitting(false)
    }
  }, [])

  const handlePaymentSubmit = useCallback(async (data: unknown) => {
    setIsSubmitting(true)
    try {
      // TODO: Call GraphQL mutation
      console.log('Recording payment:', data)
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setIsPaymentModalOpen(false)
    } finally {
      setIsSubmitting(false)
    }
  }, [])

  const handleCreditNoteSubmit = useCallback(async (data: CreditNoteFormData) => {
    setIsSubmitting(true)
    try {
      // TODO: Call GraphQL mutation
      console.log('Creating credit note:', data)
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setIsCreditNoteModalOpen(false)
    } finally {
      setIsSubmitting(false)
    }
  }, [])

  const handleMemberSelect = useCallback(async (memberId: string): Promise<{
    member: MemberSelectionData
    invoices: AllocationInvoice[]
  }> => {
    // Mock member selection - return member data and their pending invoices
    const memberData = mockMemberOptions.find((m) => m.id === memberId)
    const memberInvoices = mockInvoices
      .filter((inv) => inv.memberId === memberId && inv.balance > 0)
      .map((inv) => ({
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        date: inv.date instanceof Date ? inv.date : new Date(inv.date),
        dueDate: inv.dueDate instanceof Date ? inv.dueDate : new Date(inv.dueDate),
        amount: inv.amount,
        balance: inv.balance,
        agingStatus: inv.agingStatus,
      }))

    const agingStatus = memberInvoices[0]?.agingStatus || 'current'

    return {
      member: {
        id: memberId,
        name: memberData ? `${memberData.firstName} ${memberData.lastName}` : 'Unknown',
        memberNumber: memberData?.memberId || memberId,
        membershipType: 'Golf Premium',
        agingStatus: agingStatus as AgingStatus,
        creditBalance: 0,
      },
      invoices: memberInvoices,
    }
  }, [])

  const renderTabContent = () => {
    switch (activeTab) {
      case 'invoices':
        return (
          <InvoiceRegister
            invoices={invoices}
            summary={invoiceSummary}
            currentPage={currentPage}
            totalPages={invoiceTotalPages}
            totalCount={invoiceTotalCount}
            pageSize={20}
            isLoading={isInvoicesLoading}
            onCreateInvoice={handleNewInvoice}
            onRowAction={(action, id) => {
              if (action === 'view') {
                router.push(`/billing/invoices/${id}`)
              }
            }}
            onPageChange={setCurrentPage}
          />
        )
      case 'receipts':
        return (
          <ReceiptRegister
            receipts={mockReceipts}
            summary={mockReceiptSummary}
            outlets={['Main Office', 'Pro Shop', 'Restaurant', 'Fitness Center']}
            currentPage={1}
            totalPages={5}
            totalCount={89}
            pageSize={20}
            isLoading={false}
            onCreateReceipt={handleNewReceipt}
            onRowAction={(action, id) => {
              if (action === 'view') {
                router.push(`/billing/receipts/${id}`)
              } else if (action === 'download') {
                console.log('Download receipt PDF:', id)
              } else if (action === 'void') {
                console.log('Void receipt:', id)
              }
            }}
          />
        )
      case 'credit-notes':
        return (
          <CreditNoteList
            creditNotes={mockCreditNotes}
            summary={mockCreditNoteSummary}
            currentPage={1}
            totalPages={1}
            totalCount={mockCreditNotes.length}
            pageSize={20}
            isLoading={false}
            onCreateCreditNote={handleNewCreditNote}
            onRowAction={(action, id) => {
              if (action === 'view') {
                router.push(`/billing/credit-notes/${id}`)
              } else if (action === 'approve') {
                console.log('Approve credit note:', id)
              } else if (action === 'apply-balance') {
                console.log('Apply to balance:', id)
              } else if (action === 'apply-invoice') {
                console.log('Apply to invoice:', id)
              } else if (action === 'void') {
                console.log('Void credit note:', id)
              }
            }}
          />
        )
      case 'statements':
        return (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <FileText className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">Member Statements</h3>
            <p className="text-sm text-muted-foreground max-w-md mb-6">
              Generate account statements for members showing their transaction history,
              invoices, payments, and running balance for any date range.
            </p>
            <Button
              onClick={handleGenerateStatement}
              className="bg-gradient-to-br from-amber-500 to-amber-600 text-white"
            >
              <FileText className="mr-2 h-4 w-4" />
              Generate Statement
            </Button>
          </div>
        )
      case 'wht-certificates':
        return (
          <WhtCertificatesTab
            certificates={mockWhtCertificates}
            summary={mockWhtSummary}
            currentPage={1}
            totalPages={3}
            totalCount={57}
            pageSize={20}
            isLoading={false}
            onCertificateClick={(id) => console.log('View certificate:', id)}
            onBulkVerify={(ids) => console.log('Bulk verify:', ids)}
            onRowAction={(action, id) => {
              if (action === 'view') {
                console.log('View WHT certificate:', id)
              } else if (action === 'verify') {
                console.log('Verify WHT certificate:', id)
              } else if (action === 'reject') {
                console.log('Reject WHT certificate:', id)
              } else if (action === 'download') {
                console.log('Download WHT certificate PDF:', id)
              }
            }}
          />
        )
      case 'aging':
        return (
          <AgingDashboardTab
            buckets={agingBuckets}
            members={agingMembers}
            reinstatedMembers={mockReinstatedMembers}
            currentPage={1}
            totalPages={1}
            totalCount={agingMembers.length}
            pageSize={20}
            isLoading={isInvoicesLoading}
            canOverrideSuspension={true}
            onMemberAction={(action, id) => {
              if (action === 'view-member') {
                router.push(`/members/${id}`)
              } else if (action === 'send-reminder') {
                console.log('Send reminder to member:', id)
              } else if (action === 'create-arrangement') {
                console.log('Create payment arrangement for member:', id)
              } else if (action === 'override-suspension') {
                console.log('Override suspension for member:', id)
              }
            }}
          />
        )
      default:
        return null
    }
  }

  // Render action buttons based on active tab
  const renderActions = () => {
    switch (activeTab) {
      case 'invoices':
        return (
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Wand2 className="mr-2 h-4 w-4" />
              Generate Monthly
            </Button>
            <Button
              size="sm"
              className="bg-gradient-to-br from-amber-500 to-amber-600 text-white"
              onClick={handleNewInvoice}
            >
              <Plus className="mr-2 h-4 w-4" />
              New Invoice
            </Button>
          </div>
        )
      case 'receipts':
        return (
          <Button
            size="sm"
            onClick={handleNewReceipt}
            className="bg-gradient-to-br from-amber-500 to-amber-600 text-white"
          >
            <Plus className="mr-2 h-4 w-4" />
            Record Payment
          </Button>
        )
      case 'credit-notes':
        return (
          <Button
            size="sm"
            onClick={handleNewCreditNote}
            className="bg-gradient-to-br from-amber-500 to-amber-600 text-white"
          >
            <FileText className="mr-2 h-4 w-4" />
            New Credit Note
          </Button>
        )
      case 'statements':
        return (
          <Button
            size="sm"
            onClick={handleGenerateStatement}
            className="bg-gradient-to-br from-amber-500 to-amber-600 text-white"
          >
            <FileText className="mr-2 h-4 w-4" />
            Generate Statement
          </Button>
        )
      default:
        return null
    }
  }

  return (
    <>
      <BillingTabsLayout
        activeTab={activeTab}
        onTabChange={setActiveTab}
        tabBadges={tabBadges}
        actions={renderActions()}
      >
        {renderTabContent()}
      </BillingTabsLayout>

      {/* Invoice Create Modal */}
      <InvoiceCreateModal
        open={isInvoiceModalOpen}
        onOpenChange={setIsInvoiceModalOpen}
        members={mockMemberOptions}
        chargeTypes={mockChargeTypes}
        isLoadingMembers={false}
        onMemberSearch={(query) => console.log('Search members:', query)}
        onSubmit={handleInvoiceSubmit}
        isSubmitting={isSubmitting}
      />

      {/* Payment Record Modal */}
      <PaymentRecordModal
        open={isPaymentModalOpen}
        onOpenChange={setIsPaymentModalOpen}
        onMemberSearch={(query) => console.log('Search members:', query)}
        memberSearchResults={mockMemberSearchResults}
        isSearchingMembers={false}
        onMemberSelect={handleMemberSelect}
        outlets={mockOutlets}
        onSubmit={handlePaymentSubmit}
        isSubmitting={isSubmitting}
      />

      {/* Credit Note Modal */}
      <CreditNoteModal
        open={isCreditNoteModalOpen}
        onOpenChange={setIsCreditNoteModalOpen}
        members={mockMemberOptions}
        isLoadingMembers={false}
        onMemberSearch={(query) => console.log('Search members:', query)}
        onSubmit={handleCreditNoteSubmit}
        isSubmitting={isSubmitting}
      />

      {/* Statement Modal */}
      <StatementModal
        open={isStatementModalOpen}
        onOpenChange={setIsStatementModalOpen}
        members={mockMemberOptions}
        isLoadingMembers={false}
        onMemberSearch={(query) => console.log('Search members:', query)}
        onFetchStatement={handleFetchStatement}
        onDownload={async (data) => {
          console.log('Download statement PDF:', data)
          // TODO: Implement PDF generation
        }}
        onEmail={async (data) => {
          console.log('Email statement:', data)
          // TODO: Implement email sending
        }}
        isSubmitting={isSubmitting}
      />
    </>
  )
}
