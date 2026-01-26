'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@clubvantage/ui'
import { Home, QrCode, Flag, Calendar, FileText, User } from 'lucide-react'

const navItems = [
  { href: '/portal', icon: Home, label: 'Home' },
  { href: '/portal/member-id', icon: QrCode, label: 'ID' },
  { href: '/portal/golf', icon: Flag, label: 'Golf' },
  { href: '/portal/bookings', icon: Calendar, label: 'Bookings' },
  { href: '/portal/profile', icon: User, label: 'Profile' },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border pb-safe md:hidden">
      <div className="flex items-center justify-around h-14">
        {navItems.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== '/portal' && pathname.startsWith(item.href))
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center w-full h-full gap-0.5 transition-colors',
                isActive
                  ? 'text-amber-500'
                  : 'text-stone-400 hover:text-stone-600'
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
