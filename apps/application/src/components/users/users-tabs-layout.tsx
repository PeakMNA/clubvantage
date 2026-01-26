'use client'

import { ReactNode } from 'react'
import { Users, Shield, Key, Lock, Activity } from 'lucide-react'
import { cn } from '@clubvantage/ui'
import type { UserTab } from './types'

interface UsersTabsLayoutProps {
  activeTab: UserTab
  onTabChange: (tab: UserTab) => void
  children: ReactNode
  actions?: ReactNode
}

const tabs: Array<{
  id: UserTab
  label: string
  icon: typeof Users
}> = [
  { id: 'users', label: 'Users', icon: Users },
  { id: 'roles', label: 'Roles', icon: Shield },
  { id: 'permissions', label: 'Permissions', icon: Key },
  { id: 'security', label: 'Security', icon: Lock },
  { id: 'activity', label: 'Activity', icon: Activity },
]

export function UsersTabsLayout({
  activeTab,
  onTabChange,
  children,
  actions,
}: UsersTabsLayoutProps) {
  return (
    <div className="flex flex-col">
      {/* Sticky Header with Title and Actions */}
      <div className="sticky top-0 z-10 bg-background border-b">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
            <p className="text-sm text-muted-foreground">
              Manage user accounts, roles, and permissions
            </p>
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 px-6 border-t bg-muted/30">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors relative',
                  'hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  isActive
                    ? 'text-amber-600'
                    : 'text-muted-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 p-6">{children}</div>
    </div>
  )
}
