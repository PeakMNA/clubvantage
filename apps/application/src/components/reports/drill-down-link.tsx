'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { cn } from '@clubvantage/ui'

interface DrillDownLinkProps {
  children: React.ReactNode
  href: string
  destination?: string
  showArrow?: boolean
  className?: string
  onClick?: () => void
}

export function DrillDownLink({
  children,
  href,
  destination,
  showArrow = false,
  className,
  onClick,
}: DrillDownLinkProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1 text-amber-600 underline decoration-amber-300 transition-colors hover:decoration-amber-500',
        className
      )}
      title={destination ? `Opens in ${destination}` : undefined}
    >
      <span>{children}</span>
      {showArrow && <ArrowRight className="h-3 w-3" />}
    </Link>
  )
}
