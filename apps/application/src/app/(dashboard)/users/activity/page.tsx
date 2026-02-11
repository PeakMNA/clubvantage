'use client'

import { useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { useUserActivityLog } from '@/hooks/use-users'
import { transformActivityEntry } from '@/lib/api-transformers'
import { ActivityTab } from '@/components/users'

export default function UsersActivityPage() {
  const searchParams = useSearchParams()
  const userIdFilter = searchParams.get('userId') || undefined

  const { data, isLoading } = useUserActivityLog({ limit: 200 })

  const entries = useMemo(() => {
    const apiEntries = data?.userActivityLog?.data
    if (!apiEntries || apiEntries.length === 0) return undefined
    return apiEntries.map(transformActivityEntry)
  }, [data])

  return (
    <ActivityTab
      userIdFilter={userIdFilter}
      entries={entries}
      isLoading={isLoading}
    />
  )
}
