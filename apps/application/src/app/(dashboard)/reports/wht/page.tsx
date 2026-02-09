'use client'

import { useState } from 'react'
import { WhtReconciliationTab } from '@/components/reports'

export default function WhtReportsPage() {
  const [isLoading] = useState(false)

  return (
    <WhtReconciliationTab
      isLoading={isLoading}
      onVerify={(certificateId) => {
        console.log('Verify certificate:', certificateId)
      }}
      onReject={(certificateId) => {
        console.log('Reject certificate:', certificateId)
      }}
      onViewDocument={(certificateId) => {
        console.log('View document:', certificateId)
      }}
    />
  )
}
