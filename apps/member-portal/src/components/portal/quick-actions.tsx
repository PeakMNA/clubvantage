'use client'

import Link from 'next/link'
import { cn } from '@clubvantage/ui'
import { CreditCard, FileText, Flag, QrCode, Sparkles, type LucideIcon } from 'lucide-react'

interface QuickAction {
  href: string
  icon: LucideIcon
  label: string
  disabled?: boolean
}

const defaultActions: QuickAction[] = [
  { href: '/portal/statements', icon: CreditCard, label: 'Pay Now' },
  { href: '/portal/statements', icon: FileText, label: 'Statements' },
  { href: '/portal/golf', icon: Flag, label: 'Book Golf' },
  { href: '/portal/book', icon: Sparkles, label: 'Book' },
  { href: '/portal/member-id', icon: QrCode, label: 'Member ID' },
]

interface QuickActionsProps {
  actions?: QuickAction[]
  suspended?: boolean
}

export function QuickActions({
  actions = defaultActions,
  suspended = false,
}: QuickActionsProps) {
  return (
    <div className="grid grid-cols-5 gap-2 sm:gap-3">
      {actions.map((action) => {
        const Icon = action.icon
        const isDisabled = suspended && action.label !== 'Pay Now'

        if (isDisabled) {
          return (
            <div
              key={action.label}
              className="flex flex-col items-center gap-1.5 opacity-50 cursor-not-allowed"
            >
              <div className="flex h-12 w-12 md:h-14 md:w-14 items-center justify-center rounded-xl bg-stone-100 dark:bg-stone-800">
                <Icon className="h-5 w-5 md:h-6 md:w-6 text-stone-400" />
              </div>
              <span className="text-[11px] md:text-xs text-stone-400 text-center">
                {action.label}
              </span>
            </div>
          )
        }

        return (
          <Link
            key={action.label}
            href={action.href}
            className="flex flex-col items-center gap-1.5 group cursor-pointer"
          >
            <div
              className={cn(
                'flex h-12 w-12 md:h-14 md:w-14 items-center justify-center rounded-xl',
                'bg-white/80 backdrop-blur-sm border border-stone-100',
                'group-hover:shadow-md group-hover:shadow-stone-200/50',
                'group-active:scale-95',
                'transition-all duration-200'
              )}
            >
              <Icon className="h-5 w-5 md:h-6 md:w-6 text-amber-600 group-hover:text-amber-700 transition-colors" />
            </div>
            <span className="text-[11px] md:text-xs text-stone-600 dark:text-stone-400 text-center group-hover:text-stone-900 dark:group-hover:text-stone-200 transition-colors">
              {action.label}
            </span>
          </Link>
        )
      })}
    </div>
  )
}
