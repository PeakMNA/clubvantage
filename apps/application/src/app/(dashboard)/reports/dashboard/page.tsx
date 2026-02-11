'use client'

import { useMemo } from 'react'
import { useReportsDashboard } from '@/hooks/use-reports'
import { formatThbCurrency } from '@/lib/api-transformers'
import { ManagerDashboardTab } from '@/components/reports'

export default function ReportsDashboardPage() {
  const { data, isLoading } = useReportsDashboard()

  const kpis = useMemo(() => {
    const dashboard = data?.reportsDashboard
    if (!dashboard) return undefined

    const { financial, members, bookings } = dashboard
    return [
      {
        label: 'Revenue MTD',
        value: formatThbCurrency(financial?.thisMonthRevenue ?? 0),
        trend: financial?.revenueGrowth != null
          ? {
              value: Math.abs(financial.revenueGrowth),
              direction: (financial.revenueGrowth >= 0 ? 'up' : 'down') as 'up' | 'down',
              label: 'vs last month',
            }
          : undefined,
        href: '/reports?tab=financial',
      },
      {
        label: 'Outstanding A/R',
        value: formatThbCurrency(financial?.totalOutstanding ?? 0),
        href: '/reports?tab=receivables',
      },
      {
        label: 'Active Members',
        value: members?.active?.toLocaleString() ?? '0',
        trend: members?.growth != null
          ? {
              value: Math.abs(members.growth),
              direction: (members.growth >= 0 ? 'up' : 'down') as 'up' | 'down',
              label: 'vs last month',
            }
          : undefined,
        href: '/reports?tab=membership',
      },
      {
        label: 'Upcoming Bookings',
        value: bookings?.upcoming?.toLocaleString() ?? '0',
      },
    ]
  }, [data])

  return (
    <ManagerDashboardTab
      kpis={kpis}
      isLoading={isLoading}
      onAlertClick={(alertId) => {
        console.log('Alert clicked:', alertId)
      }}
    />
  )
}
