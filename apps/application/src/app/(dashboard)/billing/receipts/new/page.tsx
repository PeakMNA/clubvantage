'use client'

import { useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@clubvantage/ui'
import { ArrowLeft } from 'lucide-react'
// Direct imports to optimize bundle size (avoid barrel imports)
import { ReceiptForm, type ReceiptFormData, type MemberSearchResult } from '@/components/billing/receipt-form'
import { ConfirmPaymentDialog } from '@/components/billing/billing-dialogs'
import { type AgingStatus } from '@/components/billing/aging-badge'
import { type MemberSelectionData } from '@/components/billing/member-selection-card'
import { type AllocationInvoice } from '@/components/billing/allocation-table-row'

// Mock member search
const mockMembers: MemberSearchResult[] = [
  {
    id: 'M001',
    memberNumber: 'M001',
    name: 'John Smith',
    membershipType: 'Golf Premium',
    agingStatus: 'CURRENT',
    creditBalance: 0,
  },
  {
    id: 'M002',
    memberNumber: 'M002',
    name: 'Sarah Johnson',
    membershipType: 'Golf Standard',
    agingStatus: 'DAYS_30',
    creditBalance: 0,
  },
  {
    id: 'M003',
    memberNumber: 'M003',
    name: 'Michael Chen',
    membershipType: 'Golf Standard',
    agingStatus: 'DAYS_90',
    creditBalance: 0,
  },
  {
    id: 'M005',
    memberNumber: 'M005',
    name: 'Robert Wilson',
    membershipType: 'Golf Premium',
    agingStatus: 'SUSPENDED',
    creditBalance: 0,
  },
]

// Mock invoices for allocation
const getMockInvoices = (memberId: string): AllocationInvoice[] => {
  const invoicesByMember: Record<string, AllocationInvoice[]> = {
    M001: [
      {
        id: '1',
        invoiceNumber: 'INV-2024-0001',
        date: new Date('2024-01-15'),
        dueDate: new Date('2024-02-15'),
        amount: 45000,
        balance: 45000,
        agingStatus: 'CURRENT',
      },
    ],
    M002: [
      {
        id: '2',
        invoiceNumber: 'INV-2024-0002',
        date: new Date('2024-01-10'),
        dueDate: new Date('2024-02-10'),
        amount: 32000,
        balance: 12000,
        agingStatus: 'DAYS_30',
      },
    ],
    M003: [
      {
        id: '3',
        invoiceNumber: 'INV-2024-0003',
        date: new Date('2023-11-01'),
        dueDate: new Date('2023-12-01'),
        amount: 55000,
        balance: 55000,
        agingStatus: 'DAYS_90',
      },
    ],
    M005: [
      {
        id: '5',
        invoiceNumber: 'INV-2024-0005',
        date: new Date('2023-09-15'),
        dueDate: new Date('2023-10-15'),
        amount: 120000,
        balance: 120000,
        agingStatus: 'SUSPENDED',
      },
    ],
  }
  return invoicesByMember[memberId] || []
}

// Get member selection data for selected member
const getMemberSelectionData = (memberId: string): MemberSelectionData | null => {
  const member = mockMembers.find((m) => m.id === memberId)
  if (!member) return null

  return {
    id: member.id,
    name: member.name,
    memberNumber: member.memberNumber,
    membershipType: member.membershipType,
    photoUrl: member.photoUrl,
    agingStatus: member.agingStatus,
    creditBalance: member.creditBalance,
  }
}

// Get outstanding balance for a member from their invoices
const getOutstandingBalance = (memberId: string): number => {
  const invoices = getMockInvoices(memberId)
  return invoices.reduce((sum, inv) => sum + inv.balance, 0)
}

export default function NewReceiptPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preselectedMemberId = searchParams.get('memberId')

  const [isLoading, setIsLoading] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [pendingData, setPendingData] = useState<ReceiptFormData | null>(null)
  const [selectedMember, setSelectedMember] = useState<MemberSelectionData | null>(
    preselectedMemberId ? getMemberSelectionData(preselectedMemberId) : null
  )
  const [pendingInvoices, setPendingInvoices] = useState<AllocationInvoice[]>(
    preselectedMemberId ? getMockInvoices(preselectedMemberId) : []
  )
  const [memberSearchResults, setMemberSearchResults] = useState<MemberSearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)

  const handleMemberSearch = useCallback((query: string) => {
    if (!query.trim()) {
      setMemberSearchResults([])
      return
    }

    setIsSearching(true)
    // Simulate API delay
    setTimeout(() => {
      const lowerQuery = query.toLowerCase()
      const results = mockMembers.filter(
        (m) =>
          m.name.toLowerCase().includes(lowerQuery) ||
          m.memberNumber.toLowerCase().includes(lowerQuery)
      )
      setMemberSearchResults(results)
      setIsSearching(false)
    }, 300)
  }, [])

  const handleMemberSelect = useCallback((memberId: string) => {
    const memberData = getMemberSelectionData(memberId)
    setSelectedMember(memberData)
    setPendingInvoices(getMockInvoices(memberId))
    setMemberSearchResults([])
  }, [])

  const handleMemberClear = useCallback(() => {
    setSelectedMember(null)
    setPendingInvoices([])
  }, [])

  const handleSubmit = (data: ReceiptFormData) => {
    setPendingData(data)
    setShowConfirmDialog(true)
  }

  const handleConfirm = () => {
    if (!pendingData) return

    setIsLoading(true)
    // TODO: Replace with real API call
    setTimeout(() => {
      setIsLoading(false)
      setShowConfirmDialog(false)
      router.push('/billing')
    }, 1500)
  }

  const handleCancel = () => {
    router.back()
  }

  // Calculate dialog data
  const totalAllocated = pendingData
    ? Object.values(pendingData.allocations).reduce((sum, amount) => sum + amount, 0)
    : 0
  const memberOutstanding = selectedMember ? getOutstandingBalance(selectedMember.id) : 0
  const isSuspended = selectedMember?.agingStatus === 'SUSPENDED'
  const willReinstate = isSuspended && totalAllocated >= memberOutstanding
  const remainsSuspended = isSuspended && !willReinstate
  const outstandingAfter = memberOutstanding - totalAllocated

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-stone-200 bg-white px-6 py-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold text-stone-900">Record Payment</h1>
            <p className="mt-0.5 text-sm text-stone-500">
              Create a new receipt and allocate to outstanding invoices
            </p>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="flex-1 overflow-auto">
        <ReceiptForm
          outlets={[
            { id: 'main', name: 'Main Office' },
            { id: 'proshop', name: 'Pro Shop' },
            { id: 'restaurant', name: 'Restaurant' },
            { id: 'fitness', name: 'Fitness Center' },
          ]}
          selectedMember={selectedMember}
          pendingInvoices={pendingInvoices}
          memberSearchResults={memberSearchResults}
          isSearching={isSearching}
          isSubmitting={isLoading}
          onMemberSearch={handleMemberSearch}
          onMemberSelect={handleMemberSelect}
          onMemberClear={handleMemberClear}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </div>

      {/* Confirm Dialog */}
      {pendingData && selectedMember && (
        <ConfirmPaymentDialog
          isOpen={showConfirmDialog}
          isLoading={isLoading}
          amount={pendingData.amount}
          memberName={selectedMember.name}
          invoiceCount={Object.values(pendingData.allocations).filter((a) => a > 0).length}
          willReinstate={willReinstate}
          remainsSuspended={remainsSuspended}
          outstandingAmount={outstandingAfter > 0 ? outstandingAfter : undefined}
          onClose={() => setShowConfirmDialog(false)}
          onConfirm={handleConfirm}
        />
      )}
    </div>
  )
}
