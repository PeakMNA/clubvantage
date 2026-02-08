'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Settings, Bell, LogOut, User, ChevronDown } from 'lucide-react'
import { cn } from '@clubvantage/ui'
import { Logo, LogoIcon } from '@/components/brand'

interface PortalHeaderProps {
  memberName?: string
  memberPhoto?: string
  showOfflineIndicator?: boolean
  onLogout?: () => void
}

export function PortalHeader({
  memberName = 'Member',
  memberPhoto,
  showOfflineIndicator = false,
  onLogout,
}: PortalHeaderProps) {
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const initials = memberName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-sm border-b border-border">
      <div className="flex items-center justify-between h-14 px-4">
        {/* Logo */}
        <Link href="/portal" className="flex items-center gap-2">
          <LogoIcon size={36} />
          <span className="font-semibold text-foreground hidden sm:block">
            ClubVantage
          </span>
        </Link>

        {/* Offline indicator */}
        {showOfflineIndicator && (
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-stone-800 text-white text-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            Offline
          </div>
        )}

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <Link
            href="/portal/notifications"
            className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-muted transition-colors"
          >
            <Bell className="h-5 w-5 text-stone-500" />
          </Link>

          {/* Settings */}
          <Link
            href="/portal/settings"
            className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-muted transition-colors"
          >
            <Settings className="h-5 w-5 text-stone-500" />
          </Link>

          {/* Member Avatar with Dropdown */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-full',
                'bg-stone-200 text-stone-600 text-sm font-medium',
                'hover:ring-2 hover:ring-emerald-500/50 transition-all'
              )}
            >
              {memberPhoto ? (
                <img
                  src={memberPhoto}
                  alt={memberName}
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                initials
              )}
            </button>

            {/* Dropdown Menu */}
            {userMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setUserMenuOpen(false)}
                />
                <div className="absolute right-0 top-full mt-2 z-50 w-56 rounded-lg bg-card shadow-lg border border-border py-1">
                  <div className="px-4 py-3 border-b border-border">
                    <p className="text-sm font-medium text-foreground">{memberName}</p>
                    <p className="text-xs text-muted-foreground">Club Member</p>
                  </div>
                  <div className="py-1">
                    <Link
                      href="/portal/profile"
                      className="flex w-full items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-muted"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <User className="h-4 w-4" />
                      <span>My Profile</span>
                    </Link>
                    <Link
                      href="/portal/settings"
                      className="flex w-full items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-muted"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <Settings className="h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </div>
                  <div className="border-t border-border py-1">
                    <button
                      className="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                      onClick={() => {
                        setUserMenuOpen(false)
                        onLogout?.()
                      }}
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign out</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
