'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@clubvantage/api-client'
import { PortalHeader } from '@/components/portal/portal-header'
import { BottomNav } from '@/components/portal/bottom-nav'
import { SuspensionBanner } from '@/components/portal/suspension-banner'

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { user, signOut, isLoading } = useAuth()

  const handleLogout = async () => {
    await signOut()
    router.push('/login')
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-stone-50 dark:bg-stone-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
      </div>
    )
  }

  const memberName = user ? `${user.firstName} ${user.lastName}` : 'Member'
  const isSuspended = false // This would come from member data in real app
  const daysOverdue = 0

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-900">
      {/* Suspension Banner - shown when account is overdue */}
      {isSuspended && (
        <SuspensionBanner daysOverdue={daysOverdue} />
      )}

      {/* Header */}
      <PortalHeader
        memberName={memberName}
        memberPhoto={user?.avatarUrl ?? undefined}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <main className="pb-20 md:pb-6">
        {children}
      </main>

      {/* Bottom Navigation (Mobile) */}
      <BottomNav />
    </div>
  )
}
