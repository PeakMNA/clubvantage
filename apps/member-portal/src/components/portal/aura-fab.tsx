'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@clubvantage/ui'
import { Sparkles } from 'lucide-react'

const HIDDEN_PATHS = ['/portal/aura']
const BOTTOM_CTA_PREFIXES = [
  '/portal/book/',
  '/portal/bookings/',
  '/portal/golf/book',
  '/portal/golf/review',
  '/portal/golf/bookings/',
  '/portal/events/',
  '/portal/statements/',
  '/portal/profile/edit',
  '/portal/profile/preferences',
]

export function AuraFab() {
  const pathname = usePathname()

  if (HIDDEN_PATHS.includes(pathname)) return null

  // Move FAB higher on pages that have a fixed bottom action bar
  const hasBottomCta = BOTTOM_CTA_PREFIXES.some((p) => pathname.startsWith(p))

  return (
    <Link
      href="/portal/aura"
      className={cn(
        'fixed right-5 z-[60] flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-xl shadow-amber-500/25 active:scale-90 transition-all duration-200 hover:shadow-amber-500/40 md:hidden',
        hasBottomCta ? 'bottom-44' : 'bottom-24'
      )}
      aria-label="Chat with Aura"
    >
      <Sparkles className="h-5 w-5" />
    </Link>
  )
}
