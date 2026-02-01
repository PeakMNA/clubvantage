'use client'

import { cn } from '../lib/utils'
import * as LucideIcons from 'lucide-react'
import { LockKeyhole } from 'lucide-react'

export interface POSButtonProps {
  buttonId: string
  label: string
  icon?: string // lucide icon name
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'neutral'
  size?: 'small' | 'medium' | 'large'
  enabled?: boolean
  requiresApproval?: boolean
  shortcut?: string
  span?: number
  onClick?: () => void
  className?: string
  style?: React.CSSProperties
}

// Color variants mapping
const colorVariants = {
  primary: 'bg-amber-500 hover:bg-amber-600 text-white',
  success: 'bg-emerald-500 hover:bg-emerald-600 text-white',
  warning: 'bg-yellow-500 hover:bg-yellow-600 text-white',
  danger: 'bg-red-500 hover:bg-red-600 text-white',
  neutral: 'bg-stone-200 hover:bg-stone-300 text-stone-700',
}

const sizeVariants = {
  small: 'h-8 text-xs px-2',
  medium: 'h-10 text-sm px-3',
  large: 'h-12 text-base px-4',
}

export function POSButton({
  buttonId,
  label,
  icon,
  color = 'neutral',
  size = 'medium',
  enabled = true,
  requiresApproval = false,
  shortcut,
  span,
  onClick,
  className,
  style,
}: POSButtonProps) {
  // Get icon component
  const IconComponent = icon ? (LucideIcons as any)[icon] : null

  return (
    <button
      type="button"
      disabled={!enabled}
      onClick={onClick}
      className={cn(
        'relative flex items-center justify-center gap-2 rounded-lg font-medium transition-colors',
        colorVariants[color],
        sizeVariants[size],
        !enabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      style={style}
      title={shortcut ? `${label} (${shortcut})` : label}
    >
      {IconComponent && <IconComponent className="h-4 w-4" />}
      <span>{label}</span>

      {/* Approval indicator */}
      {requiresApproval && (
        <LockKeyhole className="absolute top-1 right-1 h-3 w-3 opacity-60" />
      )}

      {/* Shortcut badge */}
      {shortcut && (
        <span className="absolute bottom-0.5 right-1 text-[10px] opacity-60">
          {shortcut}
        </span>
      )}
    </button>
  )
}
