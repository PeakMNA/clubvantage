'use client'

import { useState } from 'react'
import { RevenueReportsTab } from '@/components/reports'

export default function RevenueReportsPage() {
  const [isLoading] = useState(false)
  const [showComparison, setShowComparison] = useState(false)

  return (
    <RevenueReportsTab
      isLoading={isLoading}
      showComparison={showComparison}
      onShowComparisonChange={setShowComparison}
    />
  )
}
