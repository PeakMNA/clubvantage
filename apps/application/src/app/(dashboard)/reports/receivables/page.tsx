'use client'

import { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useReportsARAging } from '@/hooks/use-reports'
import { AccountsReceivableTab } from '@/components/reports'

export default function ReceivablesReportsPage() {
  const router = useRouter()
  const { data, isLoading } = useReportsARAging()

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

  return (
    <AccountsReceivableTab
      agingBuckets={agingBuckets}
      isLoading={isLoading}
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
  )
}
