'use client'

import { cn } from '@clubvantage/ui'

export type BillingTab = 'invoices' | 'receipts' | 'wht-certificates' | 'aging'

interface TabConfig {
  id: BillingTab
  label: string
  badge?: number
}

const defaultTabs: TabConfig[] = [
  { id: 'invoices', label: 'Invoices' },
  { id: 'receipts', label: 'Receipts' },
  { id: 'wht-certificates', label: 'WHT Certificates' },
  { id: 'aging', label: 'Aging' },
]

interface BillingTabsLayoutProps {
  /** Currently active tab */
  activeTab: BillingTab
  /** Callback when tab changes */
  onTabChange: (tab: BillingTab) => void
  /** Badge counts for each tab (optional) */
  tabBadges?: Partial<Record<BillingTab, number>>
  /** Action buttons to render in header (optional) */
  actions?: React.ReactNode
  /** Tab content */
  children: React.ReactNode
  /** Additional class names for the container */
  className?: string
}

export function BillingTabsLayout({
  activeTab,
  onTabChange,
  tabBadges,
  actions,
  children,
  className,
}: BillingTabsLayoutProps) {
  const tabs = defaultTabs.map((tab) => ({
    ...tab,
    badge: tabBadges?.[tab.id],
  }))

  return (
    <div className={cn('min-h-screen bg-background', className)}>
      {/* Page Header */}
      <header className="border-b border-border bg-card px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-foreground">Billing</h1>
          {actions && <div className="flex items-center gap-3">{actions}</div>}
        </div>
      </header>

      {/* Sticky Tab Bar */}
      <nav className="sticky top-0 z-10 border-b border-border bg-card">
        <div className="px-6">
          <div className="-mb-px flex gap-8">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={cn(
                    'relative flex items-center gap-2 border-b-2 py-3 text-sm font-medium transition-colors',
                    isActive
                      ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  )}
                >
                  {tab.label}
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span
                      className={cn(
                        'inline-flex min-w-[20px] items-center justify-center rounded-full px-1.5 py-0.5 text-xs font-medium',
                        isActive
                          ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400'
                          : 'bg-muted text-muted-foreground'
                      )}
                    >
                      {tab.badge > 99 ? '99+' : tab.badge}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </nav>

      {/* Content Area */}
      <main className="px-6 py-4">{children}</main>
    </div>
  )
}
