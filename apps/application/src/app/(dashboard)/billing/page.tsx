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
  DynamicStatementRegister as StatementRegister,
} from '@/components/billing/dynamic-tabs'

// Modal imports
import { InvoiceCreateModal, type InvoiceFormData } from '@/components/billing/invoice-create-modal'
import { BatchInvoiceModal, type BatchInvoiceFormData, type BatchInvoiceResult } from '@/components/billing/batch-invoice-modal'
import { type ChargeType } from '@/components/billing/invoice-line-item-row'
import { PaymentArrangementModal, type PaymentArrangementFormData } from '@/components/billing/payment-arrangement-modal'
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

import { useInvoices, usePayments, useGenerateStatement, useCreditNotes, useCreditNoteMutations } from '@/hooks/use-billing'
import { usePaymentArrangementMutations } from '@/hooks/use-payment-arrangements'
import {
  ApproveCreditNoteDialog,
  VoidCreditNoteDialog,
  ApplyCreditNoteToInvoiceDialog,
} from '@/components/billing/credit-note-action-dialogs'
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
    status: 'SENT',
    agingStatus: 'CURRENT',
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
    status: 'PARTIALLY_PAID',
    agingStatus: 'DAYS_30',
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
    status: 'OVERDUE',
    agingStatus: 'DAYS_90',
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
    status: 'PAID',
    agingStatus: 'CURRENT',
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
    status: 'OVERDUE',
    agingStatus: 'SUSPENDED',
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

// Mock credit note data removed — now using real API data via useCreditNotes()

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
  { id: 'M001', name: 'John Smith', memberNumber: 'M001', membershipType: 'Golf Premium', agingStatus: 'CURRENT', creditBalance: 0 },
  { id: 'M002', name: 'Sarah Johnson', memberNumber: 'M002', membershipType: 'Golf Standard', agingStatus: 'DAYS_30', creditBalance: 0 },
  { id: 'M003', name: 'Michael Chen', memberNumber: 'M003', membershipType: 'Golf Premium', agingStatus: 'DAYS_90', creditBalance: 0 },
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
  const [receiptPage, setReceiptPage] = useState(1)

  // Modal states
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [isCreditNoteModalOpen, setIsCreditNoteModalOpen] = useState(false)
  const [isStatementModalOpen, setIsStatementModalOpen] = useState(false)
  const [isBatchInvoiceModalOpen, setIsBatchInvoiceModalOpen] = useState(false)
  const [isArrangementModalOpen, setIsArrangementModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Credit note action dialog states
  const [approveDialogOpen, setApproveDialogOpen] = useState(false)
  const [voidDialogOpen, setVoidDialogOpen] = useState(false)
  const [applyToInvoiceDialogOpen, setApplyToInvoiceDialogOpen] = useState(false)
  const [selectedCreditNote, setSelectedCreditNote] = useState<{
    id: string
    creditNoteNumber: string
    totalAmount: number
    appliedAmount: number
    memberId: string
  } | null>(null)

  // Fetch invoices from API
  const {
    invoices: apiInvoices,
    summary: apiSummary,
    totalCount: apiTotalCount,
    totalPages: apiTotalPages,
    isLoading: isInvoicesLoading,
  } = useInvoices({ page: currentPage, pageSize: 20 })

  // Fetch receipts/payments from API
  const {
    receipts,
    summary: receiptSummary,
    totalCount: receiptTotalCount,
    totalPages: receiptTotalPages,
    isLoading: isReceiptsLoading,
  } = usePayments({ page: receiptPage, pageSize: 20 })

  // Statement generation hook
  const { generateStatement, isLoading: statementLoading } = useGenerateStatement()

  // Credit notes from API
  const [creditNotePage, setCreditNotePage] = useState(1)
  const {
    creditNotes,
    summary: creditNoteSummary,
    totalCount: creditNoteTotalCount,
    totalPages: creditNoteTotalPages,
    isLoading: isCreditNotesLoading,
  } = useCreditNotes({ page: creditNotePage, pageSize: 20 })

  // Credit note mutations
  const {
    createCreditNote,
    approveCreditNote,
    applyCreditNoteToBalance,
    applyCreditNoteToInvoice,
    voidCreditNote,
    isCreating: isCreditNoteCreating,
    isApproving: isCreditNoteApproving,
    isApplyingToInvoice: isCreditNoteApplyingToInvoice,
    isVoiding: isCreditNoteVoiding,
  } = useCreditNoteMutations()

  // Payment arrangement mutations
  const {
    createArrangement,
    isCreating: isArrangementCreating,
  } = usePaymentArrangementMutations()

  // Fetch member invoices for apply-to-invoice dialog
  const { invoices: memberInvoicesForCreditNote } = useInvoices({
    memberId: selectedCreditNote?.memberId,
    enabled: !!selectedCreditNote?.memberId && applyToInvoiceDialogOpen,
  })

  // Use API data if available, fall back to mock data
  const invoices = apiInvoices.length > 0 ? apiInvoices : mockInvoices
  const invoiceSummary = apiInvoices.length > 0 ? apiSummary : mockInvoiceSummary
  const invoiceTotalCount = apiInvoices.length > 0 ? apiTotalCount : mockInvoices.length
  const invoiceTotalPages = apiInvoices.length > 0 ? apiTotalPages : 1

  // Calculate aging members from invoices
  const agingMembers = useMemo((): AgingMember[] => {
    const overdueInvoices = invoices.filter(
      (inv) => inv.agingStatus === 'DAYS_90' || inv.agingStatus === 'SUSPENDED'
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
      CURRENT: { count: 0, amount: 0 },
      DAYS_30: { count: 0, amount: 0 },
      DAYS_60: { count: 0, amount: 0 },
      DAYS_90: { count: 0, amount: 0 },
      SUSPENDED: { count: 0, amount: 0 },
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
      { id: 'CURRENT', label: 'Current', memberCount: buckets.CURRENT.count, totalAmount: buckets.CURRENT.amount, percentage: totalAmount > 0 ? Math.round((buckets.CURRENT.amount / totalAmount) * 100) : 0 },
      { id: 'DAYS_30', label: '1-30 Days', memberCount: buckets.DAYS_30.count, totalAmount: buckets.DAYS_30.amount, percentage: totalAmount > 0 ? Math.round((buckets.DAYS_30.amount / totalAmount) * 100) : 0 },
      { id: 'DAYS_60', label: '31-60 Days', memberCount: buckets.DAYS_60.count, totalAmount: buckets.DAYS_60.amount, percentage: totalAmount > 0 ? Math.round((buckets.DAYS_60.amount / totalAmount) * 100) : 0 },
      { id: 'DAYS_90', label: '61-90 Days', memberCount: buckets.DAYS_90.count, totalAmount: buckets.DAYS_90.amount, percentage: totalAmount > 0 ? Math.round((buckets.DAYS_90.amount / totalAmount) * 100) : 0 },
      { id: 'SUSPENDED', label: '91+ Days', memberCount: buckets.SUSPENDED.count, totalAmount: buckets.SUSPENDED.amount, percentage: totalAmount > 0 ? Math.round((buckets.SUSPENDED.amount / totalAmount) * 100) : 0 },
    ]
  }, [invoices])

  const tabBadges: Partial<Record<BillingTab, number>> = {
    invoices: invoiceTotalCount,
    receipts: receiptTotalCount,
    'credit-notes': creditNotes.filter((c) => c.status === 'pending_approval').length,
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
    const statement = await generateStatement(
      data.memberId,
      new Date(data.periodStart),
      new Date(data.periodEnd)
    )

    if (!statement) {
      throw new Error('Failed to generate statement')
    }

    return {
      member: {
        id: statement.member.id,
        name: statement.member.name,
        memberNumber: statement.member.memberNumber,
        membershipType: statement.member.membershipType,
        email: statement.member.email ?? undefined,
        address: statement.member.address ?? undefined,
      },
      openingBalance: statement.openingBalance,
      closingBalance: statement.closingBalance,
      transactions: statement.transactions.map((tx) => ({
        id: tx.id,
        date: tx.date,
        type: tx.type as 'INVOICE' | 'PAYMENT' | 'CREDIT' | 'ADJUSTMENT',
        description: tx.description,
        reference: tx.invoiceNumber ?? undefined,
        debit: tx.debit,
        credit: tx.credit,
        runningBalance: tx.runningBalance,
      })),
    }
  }, [generateStatement])

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
    await createCreditNote({
      memberId: data.memberId,
      type: (data.type || 'ADJUSTMENT').toUpperCase(),
      reason: (data.reason || 'OTHER').toUpperCase().replace(/ /g, '_'),
      reasonDetail: data.description,
      lineItems: [
        {
          description: data.description || 'Credit note',
          quantity: 1,
          unitPrice: data.amount,
        },
      ],
    })
    setIsCreditNoteModalOpen(false)
  }, [createCreditNote])

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

    const agingStatus = memberInvoices[0]?.agingStatus || 'CURRENT'

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
            receipts={receipts}
            summary={receiptSummary}
            outlets={['Main Office', 'Pro Shop', 'Restaurant', 'Fitness Center']}
            currentPage={receiptPage}
            totalPages={receiptTotalPages}
            totalCount={receiptTotalCount}
            pageSize={20}
            isLoading={isReceiptsLoading}
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
            onPageChange={setReceiptPage}
          />
        )
      case 'credit-notes':
        return (
          <CreditNoteList
            creditNotes={creditNotes}
            summary={creditNoteSummary}
            currentPage={creditNotePage}
            totalPages={creditNoteTotalPages}
            totalCount={creditNoteTotalCount}
            pageSize={20}
            isLoading={isCreditNotesLoading}
            onCreateCreditNote={handleNewCreditNote}
            onPageChange={setCreditNotePage}
            onRowAction={(action, id) => {
              const cn = creditNotes.find((c) => c.id === id)
              if (action === 'view') {
                router.push(`/billing/credit-notes/${id}`)
              } else if (action === 'approve' && cn) {
                setSelectedCreditNote({
                  id: cn.id,
                  creditNoteNumber: cn.creditNoteNumber,
                  totalAmount: cn.totalAmount,
                  appliedAmount: cn.appliedAmount,
                  memberId: cn.memberId,
                })
                setApproveDialogOpen(true)
              } else if (action === 'apply-balance' && cn) {
                applyCreditNoteToBalance(cn.id)
              } else if (action === 'apply-invoice' && cn) {
                setSelectedCreditNote({
                  id: cn.id,
                  creditNoteNumber: cn.creditNoteNumber,
                  totalAmount: cn.totalAmount,
                  appliedAmount: cn.appliedAmount,
                  memberId: cn.memberId,
                })
                setApplyToInvoiceDialogOpen(true)
              } else if (action === 'void' && cn) {
                setSelectedCreditNote({
                  id: cn.id,
                  creditNoteNumber: cn.creditNoteNumber,
                  totalAmount: cn.totalAmount,
                  appliedAmount: cn.appliedAmount,
                  memberId: cn.memberId,
                })
                setVoidDialogOpen(true)
              }
            }}
          />
        )
      case 'statements':
        return (
          <StatementRegister
            onGenerateStatement={handleGenerateStatement}
          />
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
                setIsArrangementModalOpen(true)
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
            <Button variant="outline" size="sm" onClick={() => setIsBatchInvoiceModalOpen(true)}>
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

      {/* Batch Invoice Modal */}
      <BatchInvoiceModal
        open={isBatchInvoiceModalOpen}
        onOpenChange={setIsBatchInvoiceModalOpen}
        members={mockMemberOptions}
        chargeTypes={mockChargeTypes}
        isLoadingMembers={false}
        onMemberSearch={(query) => console.log('Search members:', query)}
        onSubmit={async (data) => {
          console.log('Creating batch invoices:', data)
          // TODO: Wire to useCreateBatchInvoicesMutation when codegen runs
          await new Promise((resolve) => setTimeout(resolve, 1500))
          return { createdCount: data.memberIds.length, failedCount: 0, errors: [] }
        }}
        isSubmitting={isSubmitting}
      />

      {/* Payment Arrangement Modal */}
      <PaymentArrangementModal
        open={isArrangementModalOpen}
        onOpenChange={setIsArrangementModalOpen}
        members={mockMemberOptions}
        isLoadingMembers={false}
        onMemberSearch={(query) => console.log('Search members:', query)}
        onMemberSelect={async (memberId) => {
          const memberInvoices = mockInvoices
            .filter((inv) => inv.memberId === memberId && inv.balance > 0)
            .map((inv) => ({
              id: inv.id,
              invoiceNumber: inv.invoiceNumber,
              balance: inv.balance,
              dueDate: inv.dueDate instanceof Date ? inv.dueDate : new Date(inv.dueDate),
            }))
          return memberInvoices
        }}
        onSubmit={async (data) => {
          await createArrangement({
            memberId: data.memberId,
            invoiceIds: data.invoiceIds,
            installmentCount: data.installmentCount,
            frequency: data.frequency,
            startDate: data.startDate,
            notes: data.notes,
          })
        }}
        isSubmitting={isArrangementCreating}
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

      {/* Credit Note Action Dialogs */}
      {selectedCreditNote && (
        <>
          <ApproveCreditNoteDialog
            open={approveDialogOpen}
            onOpenChange={setApproveDialogOpen}
            creditNoteNumber={selectedCreditNote.creditNoteNumber}
            amount={selectedCreditNote.totalAmount}
            onConfirm={async () => { await approveCreditNote(selectedCreditNote.id) }}
            isSubmitting={isCreditNoteApproving}
          />
          <VoidCreditNoteDialog
            open={voidDialogOpen}
            onOpenChange={setVoidDialogOpen}
            creditNoteNumber={selectedCreditNote.creditNoteNumber}
            onConfirm={async (reason) => { await voidCreditNote(selectedCreditNote.id, reason) }}
            isSubmitting={isCreditNoteVoiding}
          />
          <ApplyCreditNoteToInvoiceDialog
            open={applyToInvoiceDialogOpen}
            onOpenChange={setApplyToInvoiceDialogOpen}
            creditNoteNumber={selectedCreditNote.creditNoteNumber}
            availableAmount={selectedCreditNote.totalAmount - selectedCreditNote.appliedAmount}
            invoices={memberInvoicesForCreditNote
              .filter((inv) => inv.balance > 0)
              .map((inv) => ({
                id: inv.id,
                invoiceNumber: inv.invoiceNumber,
                balance: inv.balance,
              }))}
            onConfirm={async (invoiceId, amount) => {
              await applyCreditNoteToInvoice(selectedCreditNote.id, invoiceId, amount)
            }}
            isSubmitting={isCreditNoteApplyingToInvoice}
          />
        </>
      )}
    </>
  )
}
