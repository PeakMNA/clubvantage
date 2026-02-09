'use client'

import { useState } from 'react'
import { CollectionPerformanceTab } from '@/components/reports'

export default function CollectionsReportsPage() {
  const [isLoading] = useState(false)
  const [showComparison, setShowComparison] = useState(false)

  return (
    <CollectionPerformanceTab
      isLoading={isLoading}
      showComparison={showComparison}
      onShowComparisonChange={setShowComparison}
    />
  )
}
