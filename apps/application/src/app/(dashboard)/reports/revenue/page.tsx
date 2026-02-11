'use client'

import { useCallback, useMemo, useState } from 'react'
import { useReportsFinancial, useDateRange } from '@/hooks/use-reports'
import { RevenueReportsTab, ExportMenu } from '@/components/reports'
import { exportToCsv } from '@/lib/export-utils'

export default function RevenueReportsPage() {
  const { startDate, endDate } = useDateRange()
  const { data, isLoading } = useReportsFinancial(startDate, endDate)
  const [showComparison, setShowComparison] = useState(false)

  const transformed = useMemo(() => {
    const report = data?.reportsFinancial
    if (!report) return {}

    const { invoices, byChargeType } = report

    const totalRevenue = invoices.totalInvoiced
    const collected = invoices.totalCollected
    const outstanding = invoices.totalOutstanding

    const growth =
      totalRevenue > 0 && collected > 0
        ? ((collected - totalRevenue) / totalRevenue) * 100
        : 0

    const chargeEntries: { chargeTypeId: string; _sum: { lineTotal: number } }[] =
      Array.isArray(byChargeType) ? byChargeType : []

    const breakdownData = chargeEntries
      .sort((a, b) => (b._sum.lineTotal ?? 0) - (a._sum.lineTotal ?? 0))
      .map((entry, idx) => ({
        id: entry.chargeTypeId ?? `item-${idx}`,
        name: entry.chargeTypeId ?? 'Unknown',
        revenue: entry._sum.lineTotal ?? 0,
        percentOfTotal: totalRevenue > 0
          ? Math.round(((entry._sum.lineTotal ?? 0) / totalRevenue) * 100)
          : 0,
        vsLast: 0,
      }))

    return { totalRevenue, collected, outstanding, growth, breakdownData }
  }, [data])

  const handleExport = useCallback(
    (format: string) => {
      if (format === 'csv' && transformed.breakdownData) {
        exportToCsv('revenue-breakdown', ['Name', 'Revenue', '% of Total', 'vs Last'],
          transformed.breakdownData.map((b) => [b.name, b.revenue, b.percentOfTotal, b.vsLast]))
      }
    },
    [transformed.breakdownData],
  )

  return (
    <>
      <ExportMenu
        dateRange={{ start: new Date(startDate), end: new Date(endDate) }}
        onExport={handleExport}
        className="mb-4"
      />
      <RevenueReportsTab
        totalRevenue={transformed.totalRevenue}
        collected={transformed.collected}
        outstanding={transformed.outstanding}
        growth={transformed.growth}
        breakdownData={transformed.breakdownData}
        isLoading={isLoading}
        showComparison={showComparison}
        onShowComparisonChange={setShowComparison}
      />
    </>
  )
}
