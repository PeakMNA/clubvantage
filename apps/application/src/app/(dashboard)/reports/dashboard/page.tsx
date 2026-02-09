'use client'

import { useState } from 'react'
import { ManagerDashboardTab } from '@/components/reports'

export default function ReportsDashboardPage() {
  const [isLoading] = useState(false)

  return (
    <ManagerDashboardTab
      isLoading={isLoading}
      onAlertClick={(alertId) => {
        console.log('Alert clicked:', alertId)
      }}
    />
  )
}
