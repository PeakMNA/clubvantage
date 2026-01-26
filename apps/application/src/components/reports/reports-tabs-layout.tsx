'use client'

import { RefreshCw } from 'lucide-react'
import { cn } from '@clubvantage/ui'
import { formatDistanceToNow } from 'date-fns'

export type ReportsTab = 'dashboard' | 'financial' | 'revenue' | 'receivables' | 'wht' | 'collections' | 'membership'

interface TabConfig {
  id: ReportsTab
  label: string
  badge?: number
}

const defaultTabs: TabConfig[] = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'financial', label: 'Financial' },
  { id: 'revenue', label: 'Revenue' },
  { id: 'receivables', label: 'Receivables' },
  { id: 'wht', label: 'WHT' },
  { id: 'collections', label: 'Collections' },
  { id: 'membership', label: 'Membership' },
]

interface ReportsTabsLayoutProps {
  activeTab: ReportsTab
  onTabChange: (tab: ReportsTab) => void
  tabBadges?: Partial<Record<ReportsTab, number>>
  actions?: React.ReactNode
  children: React.ReactNode
  lastUpdated?: Date
  onRefresh?: () => void
  isRefreshing?: boolean
  className?: string
}

export function ReportsTabsLayout({
  activeTab,
  onTabChange,
  tabBadges,
  actions,
  children,
  lastUpdated,
  onRefresh,
  isRefreshing,
  className,
}: ReportsTabsLayoutProps) {
  const tabs = defaultTabs.map((tab) => ({
    ...tab,
    badge: tabBadges?.[tab.id],
  }))

  return (
    <div className={cn('min-h-screen bg-background', className)}>
      {/* Page Header */}
      <header className="border-b border-border bg-card px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-semibold text-foreground">Reports</h1>
            {lastUpdated && (
              <span className="text-sm text-muted-foreground">
                Updated {formatDistanceToNow(lastUpdated, { addSuffix: true })}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={isRefreshing}
                className={cn(
                  'rounded-lg border border-stone-200 p-2 text-stone-600 transition-colors hover:border-stone-300 hover:text-stone-900 disabled:opacity-50',
                  isRefreshing && 'cursor-not-allowed'
                )}
                title="Refresh data"
              >
                <RefreshCw className={cn('h-4 w-4', isRefreshing && 'animate-spin')} />
              </button>
            )}
            {actions && <div className="flex items-center gap-3">{actions}</div>}
          </div>
        </div>
      </header>

      {/* Sticky Tab Bar */}
      <nav className="sticky top-0 z-10 border-b border-border bg-card">
        <div className="px-6">
          <div className="-mb-px flex gap-6 overflow-x-auto">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={cn(
                    'relative flex shrink-0 items-center gap-2 border-b-2 py-3 text-sm font-medium transition-colors',
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
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'
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
      <main className="px-6 py-6">{children}</main>
    </div>
  )
}
