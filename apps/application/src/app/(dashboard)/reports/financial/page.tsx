'use client'

import { useState } from 'react'
import { FinancialDashboardTab } from '@/components/reports'

export default function FinancialReportsPage() {
  const [isLoading] = useState(false)

  return <FinancialDashboardTab isLoading={isLoading} />
}
