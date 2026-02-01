'use client'

import * as React from 'react'
import { cn } from '../lib/utils'
import { Search, User, Plus, Pause } from 'lucide-react'
import { Input } from '../primitives/input'
import { Button } from '../primitives/button'

// ============================================================================
// Types
// ============================================================================

export interface POSToolbarProps {
  className?: string
  toolbarConfig?: {
    zones?: {
      left?: string[]
      center?: string[]
      right?: string[]
    }
  }
  // Callbacks for toolbar actions
  onSearch?: (query: string) => void
  onMemberLookup?: () => void
  onCategoryChange?: (category: string) => void
  onNewTicket?: () => void
  onHoldTicket?: () => void
  // Categories for center zone
  categories?: { id: string; name: string }[]
  activeCategory?: string
  // Search state
  searchQuery?: string
}

// ============================================================================
// Sub-components
// ============================================================================

interface SearchInputProps {
  value?: string
  onChange?: (query: string) => void
}

function SearchInput({ value = '', onChange }: SearchInputProps) {
  const [localValue, setLocalValue] = React.useState(value)

  React.useEffect(() => {
    setLocalValue(value)
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setLocalValue(newValue)
    onChange?.(newValue)
  }

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
      <Input
        type="search"
        placeholder="Search items..."
        value={localValue}
        onChange={handleChange}
        className="pl-10 w-64 h-9 bg-stone-50 border-stone-200 focus:bg-white"
        aria-label="Search items"
      />
    </div>
  )
}

interface MemberLookupButtonProps {
  onClick?: () => void
}

function MemberLookupButton({ onClick }: MemberLookupButtonProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      className="gap-2"
    >
      <User className="h-4 w-4" />
      <span>Member Lookup</span>
    </Button>
  )
}

interface CategoryTabsProps {
  categories: { id: string; name: string }[]
  active?: string
  onChange?: (category: string) => void
}

function CategoryTabs({ categories, active, onChange }: CategoryTabsProps) {
  const [focusedIndex, setFocusedIndex] = React.useState(
    categories.findIndex((cat) => cat.id === active)
  )

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    let newIndex = index

    if (e.key === 'ArrowLeft') {
      e.preventDefault()
      newIndex = index === 0 ? categories.length - 1 : index - 1
    } else if (e.key === 'ArrowRight') {
      e.preventDefault()
      newIndex = index === categories.length - 1 ? 0 : index + 1
    }

    if (newIndex !== index) {
      setFocusedIndex(newIndex)
      onChange?.(categories[newIndex].id)
    }
  }

  if (categories.length === 0) {
    return null
  }

  return (
    <div
      className="flex items-center gap-1 bg-stone-100 rounded-lg p-1"
      role="tablist"
    >
      {categories.map((category, index) => (
        <button
          key={category.id}
          onClick={() => onChange?.(category.id)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          role="tab"
          aria-selected={active === category.id}
          tabIndex={active === category.id ? 0 : -1}
          className={cn(
            'px-4 py-1.5 text-sm font-medium rounded-md transition-all duration-200',
            active === category.id
              ? 'bg-white text-stone-900 shadow-sm'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
          )}
        >
          {category.name}
        </button>
      ))}
    </div>
  )
}

interface HoldButtonProps {
  onClick?: () => void
}

function HoldButton({ onClick }: HoldButtonProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      className="gap-2"
    >
      <Pause className="h-4 w-4" />
      <span>Hold</span>
    </Button>
  )
}

interface NewTicketButtonProps {
  onClick?: () => void
}

function NewTicketButton({ onClick }: NewTicketButtonProps) {
  return (
    <Button
      variant="default"
      size="sm"
      onClick={onClick}
      className="gap-2"
    >
      <Plus className="h-4 w-4" />
      <span>New Ticket</span>
    </Button>
  )
}

// ============================================================================
// Main Component
// ============================================================================

export function POSToolbar({
  className,
  toolbarConfig,
  onSearch,
  onMemberLookup,
  onCategoryChange,
  onNewTicket,
  onHoldTicket,
  categories = [],
  activeCategory,
  searchQuery = '',
}: POSToolbarProps) {
  // Render items based on zone config
  const renderItem = (itemId: string) => {
    switch (itemId) {
      case 'search':
        return <SearchInput key={itemId} value={searchQuery} onChange={onSearch} />
      case 'memberLookup':
        return <MemberLookupButton key={itemId} onClick={onMemberLookup} />
      case 'categoryTabs':
        return (
          <CategoryTabs
            key={itemId}
            categories={categories}
            active={activeCategory}
            onChange={onCategoryChange}
          />
        )
      case 'holdTicket':
        return <HoldButton key={itemId} onClick={onHoldTicket} />
      case 'newTicket':
        return <NewTicketButton key={itemId} onClick={onNewTicket} />
      default:
        return null
    }
  }

  const zones = toolbarConfig?.zones || { left: ['search'], center: [], right: [] }

  return (
    <div
      className={cn(
        'flex items-center justify-between gap-4 px-4 py-2 border-b border-stone-200 bg-white',
        className
      )}
    >
      {/* Left zone */}
      <div className="flex items-center gap-2">
        {zones.left?.map(renderItem)}
      </div>

      {/* Center zone */}
      <div className="flex items-center gap-2">
        {zones.center?.map(renderItem)}
      </div>

      {/* Right zone */}
      <div className="flex items-center gap-2">
        {zones.right?.map(renderItem)}
      </div>
    </div>
  )
}

// Export sub-components for individual use if needed
export { SearchInput, MemberLookupButton, CategoryTabs, HoldButton, NewTicketButton }
