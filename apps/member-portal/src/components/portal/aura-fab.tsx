'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Sparkles } from 'lucide-react'

export function AuraFab() {
  const pathname = usePathname()

  // Don't show on the Aura page itself
  if (pathname === '/portal/aura') return null

  return (
    <Link
      href="/portal/aura"
      className="fixed right-5 bottom-24 z-[60] flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-xl shadow-amber-500/25 active:scale-90 transition-all duration-200 hover:shadow-amber-500/40 md:hidden"
      aria-label="Chat with Aura"
    >
      <Sparkles className="h-5 w-5" />
    </Link>
  )
}
