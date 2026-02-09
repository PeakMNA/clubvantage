'use client'

import { useState } from 'react'
import { MembershipAnalyticsTab } from '@/components/reports'

export default function MembershipReportsPage() {
  const [isLoading] = useState(false)

  return (
    <MembershipAnalyticsTab
      isLoading={isLoading}
      onStageClick={(stage) => {
        console.log('Stage clicked:', stage)
      }}
      onTypeClick={(typeId) => {
        console.log('Type clicked:', typeId)
      }}
    />
  )
}
