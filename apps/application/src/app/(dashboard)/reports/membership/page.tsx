'use client'

import { useMemo } from 'react'
import { useReportsMembership } from '@/hooks/use-reports'
import { MembershipAnalyticsTab } from '@/components/reports'

const LIFECYCLE_COLORS: Record<string, string> = {
  PROSPECT: '#94a3b8',
  LEAD: '#60a5fa',
  APPLICANT: '#f59e0b',
  ACTIVE: '#10b981',
  SUSPENDED: '#ef4444',
  LAPSED: '#f97316',
  RESIGNED: '#6b7280',
  TERMINATED: '#374151',
  REACTIVATED: '#8b5cf6',
}

export default function MembershipReportsPage() {
  const { data, isLoading } = useReportsMembership()

  const transformed = useMemo(() => {
    const report = data?.reportsMembership
    if (!report) return {}

    const statusEntries: { status: string; _count: number }[] =
      Array.isArray(report.byStatus) ? report.byStatus : []
    const typeEntries: { membershipTypeId: string; _count: number }[] =
      Array.isArray(report.byType) ? report.byType : []

    const totalActive = statusEntries
      .filter((e) => e.status === 'ACTIVE' || e.status === 'REACTIVATED')
      .reduce((sum, e) => sum + e._count, 0)

    const newThisPeriod = statusEntries.find((e) => e.status === 'APPLICANT')?._count ?? 0

    const currentlySuspended = statusEntries.find((e) => e.status === 'SUSPENDED')?._count ?? 0

    const totalMembers = statusEntries.reduce((sum, e) => sum + e._count, 0)

    const typeBreakdown = typeEntries.map((entry) => ({
      id: entry.membershipTypeId,
      type: entry.membershipTypeId,
      count: entry._count,
      percentOfTotal: totalMembers > 0
        ? Math.round((entry._count / totalMembers) * 100)
        : 0,
      revenueContribution: 0,
    }))

    const lifecycleStages = statusEntries.map((entry) => ({
      name: entry.status,
      count: entry._count,
      color: LIFECYCLE_COLORS[entry.status] ?? '#94a3b8',
    }))

    return {
      totalActive,
      newThisPeriod,
      currentlySuspended,
      typeBreakdown,
      lifecycleStages,
    }
  }, [data])

  return (
    <MembershipAnalyticsTab
      totalActive={transformed.totalActive}
      newThisPeriod={transformed.newThisPeriod}
      currentlySuspended={transformed.currentlySuspended}
      typeBreakdown={transformed.typeBreakdown}
      lifecycleStages={transformed.lifecycleStages}
      isLoading={isLoading}
      onStageClick={(stage) => {
        console.log('Stage clicked:', stage)
      }}
      onTypeClick={(typeId) => {
        console.log('Type clicked:', typeId)
      }}
    />
  )
}
