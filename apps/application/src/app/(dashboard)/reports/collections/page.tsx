'use client'

import { useCallback, useMemo, useState } from 'react'
import { useReportsCollections, useDateRange } from '@/hooks/use-reports'
import { CollectionPerformanceTab, ExportMenu } from '@/components/reports'
import { exportToCsv } from '@/lib/export-utils'

export default function CollectionsReportsPage() {
  const { startDate, endDate } = useDateRange()
  const { data, isLoading } = useReportsCollections(startDate, endDate)
  const [showComparison, setShowComparison] = useState(false)

  const transformed = useMemo(() => {
    const metrics = data?.reportsCollections
    if (!metrics) return {}

    return {
      collectionRate: metrics.collectionRate,
      avgDaysToPay: metrics.avgDaysToPay,
      collectedThisPeriod: metrics.collectedThisPeriod,
      vsLastPeriod: metrics.vsLastPeriod ?? undefined,
      paymentMethods: metrics.paymentMethods.map((pm) => ({
        name: pm.name,
        value: pm.value,
      })),
    }
  }, [data])

  const handleExport = useCallback(
    (format: string) => {
      if (format === 'csv' && transformed.paymentMethods) {
        exportToCsv('collection-payment-methods', ['Payment Method', 'Amount'],
          transformed.paymentMethods.map((pm) => [pm.name, pm.value]))
      }
    },
    [transformed.paymentMethods],
  )

  return (
    <>
      <ExportMenu
        dateRange={{ start: new Date(startDate), end: new Date(endDate) }}
        onExport={handleExport}
        className="mb-4"
      />
      <CollectionPerformanceTab
        collectionRate={transformed.collectionRate}
        avgDaysToPay={transformed.avgDaysToPay}
        collectedThisPeriod={transformed.collectedThisPeriod}
        vsLastPeriod={transformed.vsLastPeriod}
        paymentMethods={transformed.paymentMethods}
        isLoading={isLoading}
        showComparison={showComparison}
        onShowComparisonChange={setShowComparison}
      />
    </>
  )
}
