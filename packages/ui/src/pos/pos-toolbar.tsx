'use client'

import * as React from 'react'
import { cn } from '../lib/utils'
import {
  Search,
  User,
  Plus,
  Pause,
  LayoutGrid,
  ArrowRightLeft,
  Merge,
  Split,
  CircleDot,
  UtensilsCrossed,
  UserPlus,
  UserMinus,
  UserCheck,
  Users,
  CreditCard,
} from 'lucide-react'
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
  // F&B Table operation callbacks
  onOpenTable?: () => void
  onFloorPlan?: () => void
  onTransferTable?: () => void
  onMergeTables?: () => void
  onSplitCheck?: () => void
  onTableStatus?: () => void
  // Member operation callbacks
  onAttachMember?: () => void
  onDetachMember?: () => void
  onMemberInfo?: () => void
  onChargeToMember?: () => void
  // Categories for center zone
  categories?: { id: string; name: string }[]
  activeCategory?: string
  // Search state
  searchQuery?: string
  // Current table info (for F&B mode)
  currentTable?: { id: string; name: string } | null
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
      const category = categories[newIndex]
      if (category) {
        onChange?.(category.id)
      }
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
      className="gap-1.5"
    >
      <Plus className="h-4 w-4" />
      <span>New</span>
    </Button>
  )
}

// ============================================================================
// F&B Table Operation Sub-components
// ============================================================================

interface OpenTableButtonProps {
  onClick?: () => void
  currentTable?: { id: string; name: string } | null
}

function OpenTableButton({ onClick, currentTable }: OpenTableButtonProps) {
  return (
    <Button
      variant={currentTable ? 'default' : 'outline'}
      size="sm"
      onClick={onClick}
      className="gap-2"
    >
      <UtensilsCrossed className="h-4 w-4" />
      <span>{currentTable ? currentTable.name : 'Open Table'}</span>
    </Button>
  )
}

interface FloorPlanButtonProps {
  onClick?: () => void
}

function FloorPlanButton({ onClick }: FloorPlanButtonProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      className="gap-2"
    >
      <LayoutGrid className="h-4 w-4" />
      <span>Floor Plan</span>
    </Button>
  )
}

interface TransferTableButtonProps {
  onClick?: () => void
}

function TransferTableButton({ onClick }: TransferTableButtonProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      className="gap-2"
    >
      <ArrowRightLeft className="h-4 w-4" />
      <span>Transfer</span>
    </Button>
  )
}

interface MergeTablesButtonProps {
  onClick?: () => void
}

function MergeTablesButton({ onClick }: MergeTablesButtonProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      className="gap-2"
    >
      <Merge className="h-4 w-4" />
      <span>Merge</span>
    </Button>
  )
}

interface SplitCheckButtonProps {
  onClick?: () => void
}

function SplitCheckButton({ onClick }: SplitCheckButtonProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      className="gap-2"
    >
      <Split className="h-4 w-4" />
      <span>Split Check</span>
    </Button>
  )
}

interface TableStatusButtonProps {
  onClick?: () => void
}

function TableStatusButton({ onClick }: TableStatusButtonProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      className="gap-2"
    >
      <CircleDot className="h-4 w-4" />
      <span>Status</span>
    </Button>
  )
}

// ============================================================================
// Member Operation Sub-components
// ============================================================================

interface AttachMemberButtonProps {
  onClick?: () => void
}

function AttachMemberButton({ onClick }: AttachMemberButtonProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      className="gap-2"
    >
      <UserPlus className="h-4 w-4" />
      <span>Attach Member</span>
    </Button>
  )
}

interface DetachMemberButtonProps {
  onClick?: () => void
}

function DetachMemberButton({ onClick }: DetachMemberButtonProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      className="gap-2"
    >
      <UserMinus className="h-4 w-4" />
      <span>Detach Member</span>
    </Button>
  )
}

interface MemberInfoButtonProps {
  onClick?: () => void
}

function MemberInfoButton({ onClick }: MemberInfoButtonProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      className="gap-2"
    >
      <UserCheck className="h-4 w-4" />
      <span>Member Info</span>
    </Button>
  )
}

interface ChargeToMemberButtonProps {
  onClick?: () => void
}

function ChargeToMemberButton({ onClick }: ChargeToMemberButtonProps) {
  return (
    <Button
      variant="default"
      size="sm"
      onClick={onClick}
      className="gap-2"
    >
      <CreditCard className="h-4 w-4" />
      <span>Charge to Member</span>
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
  onOpenTable,
  onFloorPlan,
  onTransferTable,
  onMergeTables,
  onSplitCheck,
  onTableStatus,
  onAttachMember,
  onDetachMember,
  onMemberInfo,
  onChargeToMember,
  categories = [],
  activeCategory,
  searchQuery = '',
  currentTable,
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
      // F&B Table Operations
      case 'openTable':
        return <OpenTableButton key={itemId} onClick={onOpenTable} currentTable={currentTable} />
      case 'floorPlan':
        return <FloorPlanButton key={itemId} onClick={onFloorPlan} />
      case 'transferTable':
        return <TransferTableButton key={itemId} onClick={onTransferTable} />
      case 'mergeTables':
        return <MergeTablesButton key={itemId} onClick={onMergeTables} />
      case 'splitCheck':
        return <SplitCheckButton key={itemId} onClick={onSplitCheck} />
      case 'tableStatus':
        return <TableStatusButton key={itemId} onClick={onTableStatus} />
      // Member Operations
      case 'attachMember':
        return <AttachMemberButton key={itemId} onClick={onAttachMember} />
      case 'detachMember':
        return <DetachMemberButton key={itemId} onClick={onDetachMember} />
      case 'memberInfo':
        return <MemberInfoButton key={itemId} onClick={onMemberInfo} />
      case 'chargeToMember':
        return <ChargeToMemberButton key={itemId} onClick={onChargeToMember} />
      default:
        return null
    }
  }

  const zones = toolbarConfig?.zones || { left: ['search'], center: [], right: [] }

  return (
    <div
      className={cn(
        'flex items-center gap-4 px-4 py-2 border-b border-stone-200 bg-white',
        className
      )}
    >
      {/* Left zone - fixed width */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {zones.left?.map(renderItem)}
      </div>

      {/* Center zone - flexible, can shrink and scroll */}
      <div className="flex-1 min-w-0 overflow-x-auto">
        <div className="flex items-center gap-2 justify-center">
          {zones.center?.map(renderItem)}
        </div>
      </div>

      {/* Right zone - fixed width */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {zones.right?.map(renderItem)}
      </div>
    </div>
  )
}

// Export sub-components for individual use if needed
export {
  SearchInput,
  MemberLookupButton,
  CategoryTabs,
  HoldButton,
  NewTicketButton,
  // F&B Table Operations
  OpenTableButton,
  FloorPlanButton,
  TransferTableButton,
  MergeTablesButton,
  SplitCheckButton,
  TableStatusButton,
  // Member Operations
  AttachMemberButton,
  DetachMemberButton,
  MemberInfoButton,
  ChargeToMemberButton,
}
