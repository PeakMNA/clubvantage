import { BottomNav } from '@/components/portal/bottom-nav'
import { AuraFab } from '@/components/portal/aura-fab'

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-stone-50">
      <main className="pb-36 md:pb-6">
        {children}
      </main>
      <AuraFab />
      <BottomNav />
    </div>
  )
}
