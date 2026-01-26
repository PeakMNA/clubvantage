'use client'

import { useState, ReactNode } from 'react'
import { cn } from '@clubvantage/ui'
import { Calendar, MapPin, Car, Users, Settings, ChevronRight } from 'lucide-react'

export type GolfTab = 'tee-sheet' | 'courses' | 'carts' | 'caddies' | 'settings'

interface GolfTabsLayoutProps {
  /** Controlled active tab - if provided, component is controlled */
  activeTab?: GolfTab
  /** Callback when tab changes - required for controlled mode */
  onTabChange?: (tab: GolfTab) => void
  /** Default tab for uncontrolled mode */
  defaultTab?: GolfTab
  children?: ReactNode
  renderContent?: (activeTab: GolfTab) => ReactNode
}

const tabs: Array<{
  id: GolfTab
  label: string
  shortLabel: string
  icon: typeof Calendar
  description: string
}> = [
  { id: 'tee-sheet', label: 'Tee Sheet', shortLabel: 'Tee Sheet', icon: Calendar, description: 'Manage tee times' },
  { id: 'courses', label: 'Courses', shortLabel: 'Courses', icon: MapPin, description: 'Course settings' },
  { id: 'carts', label: 'Carts', shortLabel: 'Carts', icon: Car, description: 'Fleet management' },
  { id: 'caddies', label: 'Caddies', shortLabel: 'Caddies', icon: Users, description: 'Caddy roster' },
  { id: 'settings', label: 'Settings', shortLabel: 'Settings', icon: Settings, description: 'Preferences' },
]

export function GolfTabsLayout({
  activeTab: controlledActiveTab,
  onTabChange,
  defaultTab = 'tee-sheet',
  children,
  renderContent
}: GolfTabsLayoutProps) {
  const [internalActiveTab, setInternalActiveTab] = useState<GolfTab>(defaultTab)

  // Support both controlled and uncontrolled modes
  const isControlled = controlledActiveTab !== undefined
  const activeTab = isControlled ? controlledActiveTab : internalActiveTab

  const setActiveTab = (tab: GolfTab) => {
    if (isControlled) {
      onTabChange?.(tab)
    } else {
      setInternalActiveTab(tab)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      const nextIndex = (index + 1) % tabs.length
      const nextTab = tabs[nextIndex]
      if (nextTab) setActiveTab(nextTab.id)
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      const prevIndex = (index - 1 + tabs.length) % tabs.length
      const prevTab = tabs[prevIndex]
      if (prevTab) setActiveTab(prevTab.id)
    }
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Tab Navigation */}
      <div className="relative shrink-0">
        {/* Desktop & Tablet: Horizontal Tab Bar */}
        <div className="relative overflow-hidden rounded-xl sm:rounded-2xl border border-border/60 bg-card/80 shadow-lg shadow-stone-200/30 dark:shadow-black/20 backdrop-blur-sm">
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-stone-50/50 dark:from-stone-800/30 to-transparent pointer-events-none" />

          {/* Decorative accent line */}
          <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-amber-300 via-amber-500 to-amber-300" />

          {/* Tab container with horizontal scroll on mobile */}
          <div className="relative p-1.5 sm:p-2">
            <nav
              className="flex gap-1 overflow-x-auto scrollbar-hide"
              role="tablist"
              aria-label="Golf management tabs"
            >
              {tabs.map((tab, index) => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id

                return (
                  <button
                    key={tab.id}
                    role="tab"
                    aria-selected={isActive}
                    aria-controls={`panel-${tab.id}`}
                    id={`tab-${tab.id}`}
                    tabIndex={isActive ? 0 : -1}
                    onClick={() => setActiveTab(tab.id)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    className={cn(
                      'group relative flex items-center gap-1.5 sm:gap-2.5 px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-300',
                      'focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40 focus-visible:ring-offset-2',
                      isActive
                        ? 'bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/25'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/80'
                    )}
                  >
                    {/* Icon container */}
                    <span className={cn(
                      'flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-md sm:rounded-lg transition-all duration-300 shrink-0',
                      isActive
                        ? 'bg-white/20'
                        : 'bg-muted group-hover:bg-muted/80'
                    )}>
                      <Icon className={cn(
                        'h-3 w-3 sm:h-4 sm:w-4 transition-colors duration-300',
                        isActive ? 'text-white' : 'text-muted-foreground group-hover:text-foreground'
                      )} />
                    </span>

                    {/* Label */}
                    <span className="hidden xs:inline sm:inline">
                      {tab.shortLabel}
                    </span>

                    {/* Hover arrow indicator for desktop */}
                    <ChevronRight className={cn(
                      'hidden lg:block h-3.5 w-3.5 transition-all duration-300',
                      isActive
                        ? 'opacity-100 translate-x-0 text-white/80'
                        : 'opacity-0 -translate-x-1 group-hover:opacity-50 group-hover:translate-x-0'
                    )} />
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Fade edges for scroll indication on mobile */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-3 bg-gradient-to-r from-background/80 to-transparent sm:hidden rounded-l-xl" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-3 bg-gradient-to-l from-background/80 to-transparent sm:hidden rounded-r-xl" />
      </div>

      {/* Content Area */}
      <div
        className="flex-1 overflow-auto mt-4 sm:mt-6"
        role="tabpanel"
        id={`panel-${activeTab}`}
        aria-labelledby={`tab-${activeTab}`}
      >
        {renderContent ? renderContent(activeTab) : children}
      </div>
    </div>
  )
}

export function useGolfTab() {
  const [activeTab, setActiveTab] = useState<GolfTab>('tee-sheet')
  return { activeTab, setActiveTab }
}
