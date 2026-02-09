'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { cn } from '@clubvantage/ui'
import { Search, X, Star, ChevronDown, Users } from 'lucide-react'

type SkillLevel = 'beginner' | 'intermediate' | 'advanced'
type CaddyStatus = 'AVAILABLE' | 'ASSIGNED' | 'OFF_DUTY'

interface Caddy {
  id: string
  caddyNumber: string
  firstName: string
  lastName: string
  skillLevel: SkillLevel
  status: CaddyStatus
}

interface CaddyPickerProps {
  value: 'NONE' | 'REQUEST' | string // string = caddyId
  onChange: (value: 'NONE' | 'REQUEST' | string) => void
  availableCaddies: Caddy[]
  disabled?: boolean
  className?: string
  triggerClassName?: string // Custom trigger styling
}

const SKILL_STARS: Record<SkillLevel, number> = {
  beginner: 1,
  intermediate: 2,
  advanced: 3,
}

function SkillStars({ level }: { level: SkillLevel }) {
  const count = SKILL_STARS[level]
  return (
    <span className="inline-flex text-amber-500">
      {[...Array(count)].map((_, i) => (
        <Star key={i} className="h-3 w-3 fill-current" />
      ))}
    </span>
  )
}

function formatCaddyName(caddy: Caddy): string {
  // Format: "#12 Somchai P."
  const lastName = caddy.lastName.charAt(0) + '.'
  return `#${caddy.caddyNumber} ${caddy.firstName} ${lastName}`
}

export function CaddyPicker({
  value,
  onChange,
  availableCaddies,
  disabled = false,
  className,
  triggerClassName,
}: CaddyPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Filter caddies based on search query (by name or number)
  const filteredCaddies = useMemo(() => {
    if (!searchQuery.trim()) {
      return availableCaddies
    }
    const query = searchQuery.toLowerCase().trim()
    return availableCaddies.filter((caddy) => {
      const fullName = `${caddy.firstName} ${caddy.lastName}`.toLowerCase()
      const caddyNumber = caddy.caddyNumber.toLowerCase()
      return fullName.includes(query) || caddyNumber.includes(query)
    })
  }, [availableCaddies, searchQuery])

  // Get selected caddy if value is a caddyId
  const selectedCaddy = useMemo(() => {
    if (value === 'NONE' || value === 'REQUEST') return null
    return availableCaddies.find((c) => c.id === value) || null
  }, [value, availableCaddies])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
        setSearchQuery('')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Focus input when dropdown opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const handleToggle = () => {
    if (disabled) return
    setIsOpen(!isOpen)
    if (!isOpen) {
      setSearchQuery('')
    }
  }

  const handleSelect = (newValue: 'NONE' | 'REQUEST' | string) => {
    onChange(newValue)
    setIsOpen(false)
    setSearchQuery('')
  }

  const getDisplayValue = () => {
    if (value === 'NONE') return 'No Caddy'
    if (value === 'REQUEST') return 'Requested'
    if (selectedCaddy) return formatCaddyName(selectedCaddy)
    return 'Select caddy...'
  }

  const isActive = value !== 'NONE'

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={triggerClassName || cn(
          'w-full h-10 px-3 border rounded-lg bg-background text-left flex items-center justify-between',
          'focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent',
          'transition-colors',
          disabled
            ? 'opacity-50 cursor-not-allowed bg-muted'
            : 'hover:border-stone-400',
          isOpen && 'ring-2 ring-amber-500 border-transparent'
        )}
      >
        {/* Icon for custom trigger style */}
        {triggerClassName && (
          <div className={cn(
            'flex h-6 w-6 items-center justify-center rounded-md transition-colors',
            isActive ? 'bg-emerald-100 dark:bg-emerald-500/20' : 'bg-stone-200 dark:bg-stone-700'
          )}>
            <Users className={cn('h-3.5 w-3.5', isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-stone-500 dark:text-stone-400')} />
          </div>
        )}
        <span
          className={cn(
            'truncate flex-1',
            !triggerClassName && (value === 'NONE' || (!selectedCaddy && value !== 'REQUEST')
              ? 'text-muted-foreground'
              : 'text-foreground')
          )}
        >
          {getDisplayValue()}
        </span>
        <ChevronDown
          className={cn(
            'h-4 w-4 text-muted-foreground transition-transform flex-shrink-0 ml-2',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-stone-200 dark:border-stone-700 rounded-xl shadow-lg z-50 overflow-hidden min-w-[280px]">
          {/* Search Input */}
          <div className="p-2 border-b border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or number..."
                className="w-full h-9 pl-9 pr-8 text-sm border border-stone-200 dark:border-stone-600 rounded-lg bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-stone-100 dark:hover:bg-stone-700 rounded"
                >
                  <X className="h-3 w-3 text-muted-foreground" />
                </button>
              )}
            </div>
          </div>

          {/* Options */}
          <div className="max-h-[280px] overflow-y-auto">
            {/* None Option */}
            <button
              type="button"
              onClick={() => handleSelect('NONE')}
              className={cn(
                'w-full px-4 py-2.5 text-left flex items-center gap-3 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors',
                value === 'NONE' && 'bg-emerald-50 dark:bg-emerald-500/10'
              )}
            >
              <div
                className={cn(
                  'w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0',
                  value === 'NONE'
                    ? 'border-emerald-500'
                    : 'border-stone-300 dark:border-stone-600'
                )}
              >
                {value === 'NONE' && (
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                )}
              </div>
              <span className="text-sm font-medium text-stone-900 dark:text-stone-100">No Caddy</span>
            </button>

            {/* Request Caddy Option */}
            <button
              type="button"
              onClick={() => handleSelect('REQUEST')}
              className={cn(
                'w-full px-4 py-2.5 text-left flex items-center gap-3 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors',
                value === 'REQUEST' && 'bg-emerald-50 dark:bg-emerald-500/10'
              )}
            >
              <div
                className={cn(
                  'w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0',
                  value === 'REQUEST'
                    ? 'border-emerald-500'
                    : 'border-stone-300 dark:border-stone-600'
                )}
              >
                {value === 'REQUEST' && (
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                )}
              </div>
              <div>
                <span className="text-sm font-medium text-stone-900 dark:text-stone-100">Request Caddy</span>
                <span className="text-xs text-stone-500 dark:text-stone-400 ml-1">
                  (staff assigns)
                </span>
              </div>
            </button>

            {/* Divider */}
            <div className="border-t border-stone-200 dark:border-stone-700 my-1" />

            {/* Available Caddies Label */}
            <div className="px-4 py-1.5 bg-stone-50 dark:bg-stone-800">
              <span className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                Available Caddies
              </span>
            </div>

            {/* Caddy List */}
            {filteredCaddies.length === 0 ? (
              <div className="px-4 py-6 text-center">
                <p className="text-sm text-stone-500 dark:text-stone-400">
                  {searchQuery
                    ? 'No caddies match your search'
                    : 'No caddies available'}
                </p>
              </div>
            ) : (
              filteredCaddies.map((caddy) => {
                const isSelected = value === caddy.id
                const isAvailable = caddy.status === 'AVAILABLE'

                return (
                  <button
                    key={caddy.id}
                    type="button"
                    onClick={() => handleSelect(caddy.id)}
                    disabled={!isAvailable}
                    className={cn(
                      'w-full px-4 py-2.5 text-left flex items-center gap-3 transition-colors',
                      isAvailable
                        ? 'hover:bg-stone-50 dark:hover:bg-stone-800'
                        : 'opacity-50 cursor-not-allowed',
                      isSelected && 'bg-emerald-50 dark:bg-emerald-500/10'
                    )}
                  >
                    <div
                      className={cn(
                        'w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0',
                        isSelected
                          ? 'border-emerald-500'
                          : 'border-stone-300 dark:border-stone-600'
                      )}
                    >
                      {isSelected && (
                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium truncate text-stone-900 dark:text-stone-100">
                          {formatCaddyName(caddy)}
                        </span>
                        <SkillStars level={caddy.skillLevel} />
                      </div>
                      {!isAvailable && (
                        <span className="text-xs text-stone-500 dark:text-stone-400">
                          {caddy.status === 'ASSIGNED'
                            ? 'Currently assigned'
                            : 'Off duty'}
                        </span>
                      )}
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export type { CaddyPickerProps, Caddy as CaddyPickerCaddy, SkillLevel, CaddyStatus }
