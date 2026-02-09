'use client'

import { useSearchParams } from 'next/navigation'
import { ActivityTab } from '@/components/users'

export default function UsersActivityPage() {
  const searchParams = useSearchParams()
  const userIdFilter = searchParams.get('userId') || undefined

  return <ActivityTab userIdFilter={userIdFilter} />
}
