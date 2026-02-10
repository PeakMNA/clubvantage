'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Building2, Sparkles, Users, List } from 'lucide-react'
import { cn, PageHeader } from '@clubvantage/ui'
import { BookingProvider } from '@/components/bookings'

const tabs = [
  { id: 'facility', label: 'Facility', href: '/bookings/facility', icon: Building2 },
  { id: 'service', label: 'Service', href: '/bookings/service', icon: Sparkles },
  { id: 'staff', label: 'Staff', href: '/bookings/staff', icon: Users },
  { id: 'bookings', label: 'Bookings', href: '/bookings/list', icon: List },
] as const

function BookingsLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // Determine active tab from URL
  const activeTabId = tabs.find(t => pathname.startsWith(t.href))?.id ?? 'facility'

  return (
    <div className="flex h-full flex-col">
      <div className="shrink-0 p-6 pb-0">
        <PageHeader
          title="Bookings"
          description="Manage facility bookings and service appointments"
          breadcrumbs={[{ label: 'Bookings' }]}
        />
      </div>

      {/* Tab Navigation */}
      <div className="shrink-0 border-b border-border px-6">
        <nav
          className="flex gap-1 overflow-x-auto scrollbar-hide sm:gap-2"
          role="tablist"
          aria-label="Bookings tabs"
        >
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = tab.id === activeTabId

            return (
              <Link
                key={tab.id}
                href={tab.href}
                role="tab"
                aria-selected={isActive}
                className={cn(
                  'group relative flex items-center gap-1.5 whitespace-nowrap px-3 py-3 text-sm font-medium transition-all duration-200 sm:gap-2 sm:px-4',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40 focus-visible:ring-offset-2',
                  isActive
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Icon
                  className={cn(
                    'h-4 w-4 shrink-0 transition-colors duration-200',
                    isActive
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-muted-foreground group-hover:text-foreground'
                  )}
                />
                <span>{tab.label}</span>
                <span
                  className={cn(
                    'absolute inset-x-0 -bottom-px h-0.5 rounded-full transition-all duration-200',
                    isActive
                      ? 'bg-amber-500'
                      : 'bg-transparent group-hover:bg-muted'
                  )}
                />
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  )
}

export default function BookingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <BookingProvider>
      <BookingsLayoutContent>{children}</BookingsLayoutContent>
    </BookingProvider>
  )
}
