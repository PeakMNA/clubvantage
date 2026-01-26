'use client'

import { useState, useRef, useEffect } from 'react'
import { X, ChevronDown, Filter } from 'lucide-react'
import { cn } from '@clubvantage/ui'

interface FilterOption {
  value: string
  label: string
}

interface FilterConfig {
  id: string
  label: string
  type: 'toggle' | 'select'
  options?: FilterOption[]
}

interface FilterBarProps {
  filters: FilterConfig[]
  activeFilters: Record<string, string | boolean>
  onFilterChange: (filters: Record<string, string | boolean>) => void
  onClearAll?: () => void
  className?: string
}

function FilterChip({
  filter,
  isActive,
  value,
  onToggle,
  onSelect,
}: {
  filter: FilterConfig
  isActive: boolean
  value?: string | boolean
  onToggle: () => void
  onSelect: (value: string) => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (filter.type === 'toggle') {
    return (
      <button
        onClick={onToggle}
        className={cn(
          'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-colors',
          isActive
            ? 'bg-amber-100 border border-amber-200 text-amber-700'
            : 'bg-white border border-stone-200 text-stone-600 hover:border-stone-300'
        )}
      >
        {filter.label}
        {isActive && (
          <X className="h-3 w-3" onClick={(e) => { e.stopPropagation(); onToggle(); }} />
        )}
      </button>
    )
  }

  // Select type
  const selectedOption = filter.options?.find((opt) => opt.value === value)

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-colors',
          isActive
            ? 'bg-amber-100 border border-amber-200 text-amber-700'
            : 'bg-white border border-stone-200 text-stone-600 hover:border-stone-300'
        )}
      >
        {selectedOption?.label || filter.label}
        <ChevronDown className={cn('h-3 w-3 transition-transform', isOpen && 'rotate-180')} />
      </button>

      {isOpen && filter.options && (
        <div className="absolute left-0 top-full z-20 mt-1 min-w-[150px] rounded-lg border border-stone-200 bg-white py-1 shadow-lg">
          {filter.options.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onSelect(option.value)
                setIsOpen(false)
              }}
              className={cn(
                'w-full px-3 py-2 text-left text-sm transition-colors hover:bg-stone-50',
                value === option.value && 'bg-amber-50 text-amber-700'
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export function FilterBar({
  filters,
  activeFilters,
  onFilterChange,
  onClearAll,
  className,
}: FilterBarProps) {
  const hasActiveFilters = Object.values(activeFilters).some(
    (v) => v !== false && v !== '' && v !== undefined
  )

  const handleToggle = (filterId: string) => {
    const newFilters = { ...activeFilters }
    newFilters[filterId] = !newFilters[filterId]
    onFilterChange(newFilters)
  }

  const handleSelect = (filterId: string, value: string) => {
    const newFilters = { ...activeFilters }
    newFilters[filterId] = value
    onFilterChange(newFilters)
  }

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      <Filter className="h-4 w-4 text-stone-400" />
      {filters.map((filter) => (
        <FilterChip
          key={filter.id}
          filter={filter}
          isActive={
            filter.type === 'toggle'
              ? !!activeFilters[filter.id]
              : !!activeFilters[filter.id] && activeFilters[filter.id] !== ''
          }
          value={activeFilters[filter.id]}
          onToggle={() => handleToggle(filter.id)}
          onSelect={(value) => handleSelect(filter.id, value)}
        />
      ))}
      {hasActiveFilters && onClearAll && (
        <button
          onClick={onClearAll}
          className="text-sm text-stone-500 underline hover:text-stone-700"
        >
          Clear all
        </button>
      )}
    </div>
  )
}
