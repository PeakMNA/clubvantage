'use client'

import { useCallback, useMemo } from 'react'
import { useReportsFinancial, useDateRange } from '@/hooks/use-reports'
import { FinancialDashboardTab, ExportMenu } from '@/components/reports'
import { exportToCsv } from '@/lib/export-utils'

export default function FinancialReportsPage() {
  const { startDate, endDate } = useDateRange()
  const { data, isLoading } = useReportsFinancial(startDate, endDate)

  const transformed = useMemo(() => {
    const report = data?.reportsFinancial
    if (!report) return {}

    const { invoices, byChargeType } = report

    const chargeEntries: { chargeTypeId: string; _sum: { lineTotal: number } }[] =
      Array.isArray(byChargeType) ? byChargeType : []

    const totalInvoiced = invoices.totalInvoiced
    const sorted = [...chargeEntries].sort(
      (a, b) => (b._sum.lineTotal ?? 0) - (a._sum.lineTotal ?? 0),
    )

    const topEntry = sorted[0]
    const topRevenueCenter = topEntry
      ? { name: topEntry.chargeTypeId, revenue: topEntry._sum.lineTotal ?? 0 }
      : undefined

    const periodGrowth =
      invoices.totalCollected > 0 && totalInvoiced > 0
        ? ((invoices.totalCollected - totalInvoiced) / totalInvoiced) * 100
        : 0

    const revenueCenters = sorted.map((entry, idx) => ({
      id: entry.chargeTypeId ?? `center-${idx}`,
      name: entry.chargeTypeId ?? 'Unknown',
      revenue: entry._sum.lineTotal ?? 0,
      percentOfTotal: totalInvoiced > 0
        ? Math.round(((entry._sum.lineTotal ?? 0) / totalInvoiced) * 100)
        : 0,
      vsLastPeriod: 0,
      trend: [] as number[],
    }))

    const profitCenters = sorted.map((entry, idx) => ({
      id: entry.chargeTypeId ?? `profit-${idx}`,
      name: entry.chargeTypeId ?? 'Unknown',
      revenue: entry._sum.lineTotal ?? 0,
      costs: 0,
      margin: 100,
    }))

    return {
      totalRevenue: totalInvoiced,
      topRevenueCenter,
      periodGrowth,
      revenueCenters,
      profitCenters,
    }
  }, [data])

  const handleExport = useCallback(
    (format: string) => {
      if (format === 'csv' && transformed.revenueCenters) {
        exportToCsv('financial-revenue-centers', ['Name', 'Revenue', '% of Total'],
          transformed.revenueCenters.map((c) => [c.name, c.revenue, c.percentOfTotal]))
      }
    },
    [transformed.revenueCenters],
  )

  return (
    <>
      <ExportMenu
        dateRange={{ start: new Date(startDate), end: new Date(endDate) }}
        onExport={handleExport}
        className="mb-4"
      />
      <FinancialDashboardTab
        totalRevenue={transformed.totalRevenue}
        topRevenueCenter={transformed.topRevenueCenter}
        periodGrowth={transformed.periodGrowth}
        revenueCenters={transformed.revenueCenters}
        profitCenters={transformed.profitCenters}
        isLoading={isLoading}
        onCenterClick={(centerId) => {
          console.log('Center clicked:', centerId)
        }}
      />
    </>
  )
}
