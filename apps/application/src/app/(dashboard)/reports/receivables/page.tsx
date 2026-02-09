'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AccountsReceivableTab } from '@/components/reports'

export default function ReceivablesReportsPage() {
  const router = useRouter()
  const [isLoading] = useState(false)

  return (
    <AccountsReceivableTab
      isLoading={isLoading}
      canOverrideSuspension={true}
      onMemberClick={(memberId) => {
        router.push(`/members/${memberId}`)
      }}
      onSendReminder={(memberId) => {
        console.log('Send reminder to:', memberId)
      }}
      onOverrideSuspension={(memberId) => {
        console.log('Override suspension for:', memberId)
      }}
    />
  )
}
