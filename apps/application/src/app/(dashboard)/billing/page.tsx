'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Wand2 } from 'lucide-react'
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
} from '@/components/billing/dynamic-tabs'

// Type-only imports for data structures
import type {
  InvoiceRegisterItem,
  InvoiceRegisterSummary,
} from '@/components/billing/invoice-register'
import type {
  ReceiptRegisterItem,
  ReceiptRegisterSummary,
  ReceiptAllocation,
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

import { useInvoices } from '@/hooks/use-billing'

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

// Mock aging data
const mockAgingBuckets: AgingBucket[] = [
  { id: 'current', label: 'Current', memberCount: 45, totalAmount: 800000, percentage: 58 },
  { id: '30', label: '1-30 Days', memberCount: 18, totalAmount: 250000, percentage: 18 },
  { id: '60', label: '31-60 Days', memberCount: 12, totalAmount: 150000, percentage: 11 },
  { id: '90', label: '61-90 Days', memberCount: 5, totalAmount: 50000, percentage: 4 },
  { id: 'suspended', label: '91+ Days', memberCount: 3, totalAmount: 120000, percentage: 9 },
]

const mockAgingMembers: AgingMember[] = [
  {
    id: 'M005',
    name: 'Robert Wilson',
    membershipType: 'Golf Premium',
    balance: 120000,
    oldestInvoiceDate: new Date('2023-09-15'),
    daysOutstanding: 125,
    status: 'suspended',
  },
  {
    id: 'M003',
    name: 'Michael Chen',
    membershipType: 'Golf Standard',
    balance: 55000,
    oldestInvoiceDate: new Date('2023-11-01'),
    daysOutstanding: 78,
    status: '90',
  },
]

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

export default function BillingPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<BillingTab>('invoices')
  const [currentPage, setCurrentPage] = useState(1)

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
    'wht-certificates': mockWhtCertificates.filter((c) => c.status === 'pending').length,
    aging: agingMembers.length,
  }

  const handleNewReceipt = () => {
    router.push('/billing/receipts/new')
  }

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
            onCreateInvoice={() => console.log('Create invoice')}
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

  return (
    <BillingTabsLayout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      tabBadges={tabBadges}
      actions={
        activeTab === 'invoices' ? (
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Wand2 className="mr-2 h-4 w-4" />
              Generate Monthly
            </Button>
            <Button size="sm" className="bg-gradient-to-br from-amber-500 to-amber-600 text-white">
              <Plus className="mr-2 h-4 w-4" />
              New Invoice
            </Button>
          </div>
        ) : activeTab === 'receipts' ? (
          <Button
            size="sm"
            onClick={handleNewReceipt}
            className="bg-gradient-to-br from-amber-500 to-amber-600 text-white"
          >
            <Plus className="mr-2 h-4 w-4" />
            Record Payment
          </Button>
        ) : null
      }
    >
      {renderTabContent()}
    </BillingTabsLayout>
  )
}
