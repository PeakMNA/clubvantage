'use client'

import { useMemo } from 'react'
import { Users, CreditCard, UserPlus } from 'lucide-react'
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
              value: Math.round(Math.abs(financial.revenueGrowth) * 10) / 10,
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
              value: Math.round(Math.abs(members.growth) * 10) / 10,
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

  const alerts = useMemo(() => {
    const dashboard = data?.reportsDashboard
    if (!dashboard) return undefined

    const { financial, members } = dashboard
    const items: {
      id: string
      type: 'warning' | 'action' | 'info' | 'success'
      title: string
      description: string
      href?: string
      actionLabel?: string
    }[] = []

    if ((financial?.totalOutstanding ?? 0) > 100000) {
      items.push({
        id: 'high-ar',
        type: 'warning',
        title: 'High Outstanding Receivables',
        description: `${formatThbCurrency(financial?.totalOutstanding ?? 0)} in outstanding balances requires attention.`,
        href: '/reports?tab=receivables',
        actionLabel: 'View A/R',
      })
    }

    if ((financial?.revenueGrowth ?? 0) < -10) {
      items.push({
        id: 'revenue-decline',
        type: 'action',
        title: 'Revenue Decline Detected',
        description: `Revenue is down ${Math.abs(financial?.revenueGrowth ?? 0).toFixed(1)}% compared to last month.`,
        href: '/reports?tab=financial',
        actionLabel: 'View Details',
      })
    }

    if ((members?.newThisMonth ?? 0) > 0) {
      items.push({
        id: 'new-members',
        type: 'info',
        title: 'New Member Applications',
        description: `${members?.newThisMonth} new member applications this month.`,
        href: '/reports?tab=membership',
      })
    }

    if ((financial?.revenueGrowth ?? 0) > 10) {
      items.push({
        id: 'revenue-growth',
        type: 'success',
        title: 'Strong Revenue Growth',
        description: `Revenue is up ${financial?.revenueGrowth?.toFixed(1)}% compared to last month.`,
        href: '/reports?tab=financial',
      })
    }

    return items.length > 0 ? items : undefined
  }, [data])

  const quickStats = useMemo(() => {
    const dashboard = data?.reportsDashboard
    if (!dashboard) return undefined

    const { financial, members } = dashboard
    return [
      { label: 'Total Members', value: members?.total?.toLocaleString() ?? '0', icon: Users },
      { label: 'Revenue MTD', value: formatThbCurrency(financial?.thisMonthRevenue ?? 0), icon: CreditCard },
      { label: 'New This Month', value: members?.newThisMonth?.toLocaleString() ?? '0', icon: UserPlus },
    ]
  }, [data])

  return (
    <ManagerDashboardTab
      kpis={kpis}
      alerts={alerts}
      quickStats={quickStats}
      isLoading={isLoading}
      onAlertClick={(alertId) => {
        console.log('Alert clicked:', alertId)
      }}
    />
  )
}
