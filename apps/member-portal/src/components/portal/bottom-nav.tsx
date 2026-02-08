'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@clubvantage/ui'
import { Home, QrCode, Flag, Calendar, User } from 'lucide-react'
import { useFeatureFlags } from '@/lib/features'

// Hide nav on focused booking/form flows where a bottom CTA owns the screen
const FLOW_PREFIXES = [
  '/portal/book/',
  '/portal/golf/book',
  '/portal/golf/review',
]

export function BottomNav() {
  const pathname = usePathname()
  const features = useFeatureFlags()

  const isInFlow = FLOW_PREFIXES.some((p) => pathname.startsWith(p))
  if (isInFlow) return null

  const navItems = [
    { href: '/portal', icon: Home, label: 'Home', enabled: true },
    { href: '/portal/golf', icon: Flag, label: 'Golf', enabled: features.golf.enabled },
    { href: '/portal/bookings', icon: Calendar, label: 'Bookings', enabled: features.bookings.enabled },
    { href: '/portal/member-id', icon: QrCode, label: 'ID', enabled: features.portal.memberIdQr },
    { href: '/portal/profile', icon: User, label: 'Profile', enabled: true },
  ]

  const visibleItems = navItems.filter((item) => item.enabled)

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-safe md:hidden">
      <div className="mb-1 mx-auto max-w-md rounded-2xl bg-white/95 backdrop-blur-xl shadow-lg shadow-stone-900/8 border border-stone-100/80">
        <div className="flex items-center justify-around h-14">
          {visibleItems.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== '/portal' && pathname.startsWith(item.href))
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 w-16 h-full transition-all duration-200',
                  isActive
                    ? 'text-amber-500'
                    : 'text-stone-400 active:text-stone-600'
                )}
              >
                <div
                  className={cn(
                    'flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200',
                    isActive && 'bg-amber-50'
                  )}
                >
                  <Icon
                    className={cn(
                      'h-5 w-5 transition-all duration-200',
                      isActive && 'scale-110'
                    )}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                </div>
                <span
                  className={cn(
                    'text-[10px] leading-none transition-all duration-200',
                    isActive ? 'font-semibold' : 'font-medium'
                  )}
                >
                  {item.label}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
