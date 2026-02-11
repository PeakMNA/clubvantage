'use client'

import { useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useReportsARAging, useReportsARAgingMembers } from '@/hooks/use-reports'
import { AccountsReceivableTab, ExportMenu } from '@/components/reports'
import { exportToCsv } from '@/lib/export-utils'

export default function ReceivablesReportsPage() {
  const router = useRouter()
  const { data, isLoading: bucketsLoading } = useReportsARAging()
  const { data: membersData, isLoading: membersLoading } = useReportsARAgingMembers()

  const agingBuckets = useMemo(() => {
    const aging = data?.reportsARAging
    if (!aging) return undefined

    const buckets = [
      { status: 'CURRENT' as const, label: 'Current (0-30)', ...aging.current },
      { status: 'DAYS_30' as const, label: '1-30 Days', ...aging.days1to30 },
      { status: 'DAYS_60' as const, label: '31-60 Days', ...aging.days31to60 },
      { status: 'DAYS_90' as const, label: '61-90 Days', amount: 0, count: 0 },
      { status: 'SUSPENDED' as const, label: '91+ Suspended', ...aging.days90Plus },
    ]

    const totalAmount = buckets.reduce((sum, b) => sum + (b.amount ?? 0), 0)
    return buckets.map((b) => ({
      status: b.status,
      label: b.label,
      amount: b.amount ?? 0,
      count: b.count ?? 0,
      percentage: totalAmount > 0 ? Math.round(((b.amount ?? 0) / totalAmount) * 100) : 0,
    }))
  }, [data])

  const members = useMemo(() => {
    const raw = membersData?.reportsARAgingMembers
    if (!raw) return undefined

    return raw.map((m) => ({
      id: m.id,
      name: m.name,
      membershipNumber: m.membershipNumber,
      invoiceCount: m.invoiceCount,
      totalDue: m.totalDue,
      oldestInvoice: new Date(m.oldestInvoice),
      daysOverdue: m.daysOverdue,
      status: m.status as 'CURRENT' | 'DAYS_30' | 'DAYS_60' | 'DAYS_90' | 'SUSPENDED',
    }))
  }, [membersData])

  const suspendedCount = members?.filter((m) => m.status === 'SUSPENDED').length
  const suspendedTotal = members
    ?.filter((m) => m.status === 'SUSPENDED')
    .reduce((sum, m) => sum + m.totalDue, 0)

  const handleExport = useCallback(
    (format: string) => {
      if (format === 'csv' && members) {
        exportToCsv('ar-aging-members',
          ['Name', 'Membership #', 'Invoices', 'Total Due', 'Days Overdue', 'Status'],
          members.map((m) => [
            m.name, m.membershipNumber, m.invoiceCount,
            m.totalDue, m.daysOverdue, m.status,
          ]))
      }
    },
    [members],
  )

  const dateRange = useMemo(() => {
    const now = new Date()
    const start = new Date(now.getFullYear(), now.getMonth(), 1)
    return { start, end: now }
  }, [])

  return (
    <>
      <ExportMenu
        dateRange={dateRange}
        onExport={handleExport}
        className="mb-4"
      />
      <AccountsReceivableTab
        agingBuckets={agingBuckets}
        members={members}
        suspendedCount={suspendedCount}
        suspendedTotal={suspendedTotal}
        isLoading={bucketsLoading || membersLoading}
        canOverrideSuspension={true}
        onMemberClick={(memberId) => {
          router.push(`/members/${memberId}`)
        }}
        onSendReminder={(memberId) => {
          console.log('Send reminder to:', memberId)
        }}
        onOverrideSuspension={(memberId) => {
          console.log('Override suspension for:', memberId)
        }}
      />
    </>
  )
}
