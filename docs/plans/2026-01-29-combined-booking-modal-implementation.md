# Combined Booking Modal Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Create a single `BookingModal` component that replaces both `BookingDetailModal` and `UnifiedBookingModal` with inline editing.

**Architecture:** One modal component with `mode: 'new' | 'existing'` prop. Existing bookings open pre-populated and inline-editable. Change detection enables Save button when dirty. Footer splits workflow actions (left) from edit actions (right).

**Tech Stack:** React, TypeScript, Tailwind CSS, Radix UI primitives via @clubvantage/ui

---

## Task 1: Extract Shared Subcomponents

**Goal:** Move reusable subcomponents from `unified-booking-modal.tsx` to separate files so they can be imported by the new `BookingModal`.

**Files:**
- Create: `apps/application/src/components/golf/add-player-flow.tsx`
- Create: `apps/application/src/components/golf/booking-notes.tsx`
- Create: `apps/application/src/components/golf/golfer-count-selector.tsx`
- Create: `apps/application/src/components/golf/hole-selector.tsx`
- Modify: `apps/application/src/components/golf/unified-booking-modal.tsx` (import from new files)

### Step 1: Create add-player-flow.tsx

Extract `AddPlayerFlow`, `PlayerTypeButton`, `MemberSearch`, `GuestForm`, `DependentSearch`, `WalkupForm` from unified-booking-modal.tsx.

```tsx
// apps/application/src/components/golf/add-player-flow.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { cn } from '@clubvantage/ui'
import {
  Loader2,
  X,
  ChevronUp,
  Search,
  User,
  Users,
  UserPlus,
  Phone,
  Mail,
} from 'lucide-react'
import { PlayerTypeBadge, type PlayerType } from './player-type-badge'

// === Types ===

export interface PlayerData {
  id: string
  name: string
  type: PlayerType
  memberId?: string
  phone?: string
  email?: string
  sponsoringMemberId?: string
}

type PlayerTypeOption = 'member' | 'guest' | 'dependent' | 'walkup'
type AddPlayerStep = 'type-select' | 'member-search' | 'guest-form' | 'dependent-search' | 'walkup-form'

// === Subcomponents ===

interface PlayerTypeButtonProps {
  type: PlayerTypeOption
  label: string
  icon: React.ReactNode
  selected: boolean
  onClick: () => void
}

function PlayerTypeButton({ type, label, icon, selected, onClick }: PlayerTypeButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-colors',
        selected
          ? 'border-amber-500 bg-amber-50 dark:bg-amber-500/10'
          : 'border-stone-200 dark:border-stone-700 hover:border-amber-400'
      )}
    >
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </button>
  )
}

interface MemberSearchProps {
  onSelect: (person: PlayerData) => void
  onBack: () => void
  searchFn?: (query: string) => Promise<PlayerData[]>
}

function MemberSearch({ onSelect, onBack, searchFn }: MemberSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<PlayerData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    if (query.length < 2) {
      setResults([])
      return
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setIsLoading(true)
      try {
        if (searchFn) {
          const data = await searchFn(query)
          setResults(data)
        } else {
          await new Promise((r) => setTimeout(r, 300))
          const mockResults: PlayerData[] = [
            { id: '1', name: 'John Smith', type: 'member' as const, memberId: 'M-0001' },
            { id: '2', name: 'Jane Doe', type: 'member' as const, memberId: 'M-0002' },
          ].filter((p) => p.name.toLowerCase().includes(query.toLowerCase()))
          setResults(mockResults)
        }
      } finally {
        setIsLoading(false)
      }
    }, 300)

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [query, searchFn])

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onBack}
          className="p-2 hover:bg-muted rounded-lg transition-colors"
        >
          <ChevronUp className="h-4 w-4" />
        </button>
        <span className="font-medium">Search Member</span>
      </div>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or member ID..."
          className="w-full h-10 pl-10 pr-4 border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
      </div>
      <div className="max-h-[200px] overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : results.length > 0 ? (
          <div className="space-y-1">
            {results.map((person) => (
              <button
                key={person.id}
                type="button"
                onClick={() => onSelect(person)}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors text-left"
              >
                <User className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate">{person.name}</span>
                    <PlayerTypeBadge type={person.type} size="xs" />
                  </div>
                  {person.memberId && (
                    <span className="text-xs text-muted-foreground">{person.memberId}</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        ) : query.length >= 2 ? (
          <p className="text-center text-sm text-muted-foreground py-8">No members found</p>
        ) : (
          <p className="text-center text-sm text-muted-foreground py-8">
            Type at least 2 characters to search
          </p>
        )}
      </div>
    </div>
  )
}

interface GuestFormProps {
  onSubmit: (data: PlayerData) => void
  onBack: () => void
  bookerName: string
  requireContact: boolean
}

function GuestForm({ onSubmit, onBack, bookerName, requireContact }: GuestFormProps) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')

  const canSubmit = name.trim() && (!requireContact || phone.trim() || email.trim())

  const handleSubmit = () => {
    if (!canSubmit) return
    onSubmit({
      id: `guest-${Date.now()}`,
      name: name.trim(),
      type: 'guest',
      phone: phone.trim() || undefined,
      email: email.trim() || undefined,
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onBack}
          className="p-2 hover:bg-muted rounded-lg transition-colors"
        >
          <ChevronUp className="h-4 w-4" />
        </button>
        <span className="font-medium">Add Guest</span>
      </div>

      <div className="p-3 bg-muted/50 rounded-lg">
        <span className="text-sm text-muted-foreground">Guest of </span>
        <span className="text-sm font-medium">{bookerName}</span>
      </div>

      <div>
        <label className="block text-sm text-muted-foreground mb-1">
          Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Guest name"
          className="w-full h-10 px-3 border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm text-muted-foreground mb-1">
            Phone {requireContact && <span className="text-red-500">*</span>}
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Optional"
              className="w-full h-10 pl-10 pr-3 border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm text-muted-foreground mb-1">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Optional"
              className="w-full h-10 pl-10 pr-3 border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!canSubmit}
        className="w-full py-2 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Add Guest
      </button>
    </div>
  )
}

interface DependentSearchProps {
  onSelect: (person: PlayerData) => void
  onBack: () => void
  bookingMemberId?: string
}

function DependentSearch({ onSelect, onBack, bookingMemberId }: DependentSearchProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [dependents, setDependents] = useState<PlayerData[]>([])

  useEffect(() => {
    const timer = setTimeout(() => {
      setDependents([
        { id: 'd1', name: 'Tommy Smith Jr.', type: 'dependent', memberId: 'D-0001' },
        { id: 'd2', name: 'Sarah Smith', type: 'dependent', memberId: 'D-0002' },
      ])
      setIsLoading(false)
    }, 300)
    return () => clearTimeout(timer)
  }, [bookingMemberId])

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onBack}
          className="p-2 hover:bg-muted rounded-lg transition-colors"
        >
          <ChevronUp className="h-4 w-4" />
        </button>
        <span className="font-medium">Select Dependent</span>
      </div>

      <div className="max-h-[200px] overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : dependents.length > 0 ? (
          <div className="space-y-1">
            {dependents.map((person) => (
              <button
                key={person.id}
                type="button"
                onClick={() => onSelect(person)}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors text-left"
              >
                <User className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate">{person.name}</span>
                    <PlayerTypeBadge type="dependent" size="xs" />
                  </div>
                  {person.memberId && (
                    <span className="text-xs text-muted-foreground">{person.memberId}</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        ) : (
          <p className="text-center text-sm text-muted-foreground py-8">No dependents found</p>
        )}
      </div>
    </div>
  )
}

interface WalkupFormProps {
  onSubmit: (data: PlayerData) => void
  onBack: () => void
}

function WalkupForm({ onSubmit, onBack }: WalkupFormProps) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')

  const canSubmit = name.trim() && phone.trim()

  const handleSubmit = () => {
    if (!canSubmit) return
    onSubmit({
      id: `walkup-${Date.now()}`,
      name: name.trim(),
      type: 'walkup',
      phone: phone.trim(),
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onBack}
          className="p-2 hover:bg-muted rounded-lg transition-colors"
        >
          <ChevronUp className="h-4 w-4" />
        </button>
        <span className="font-medium">Add Walk-up</span>
      </div>

      <div>
        <label className="block text-sm text-muted-foreground mb-1">
          Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Walk-up name"
          className="w-full h-10 px-3 border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
      </div>

      <div>
        <label className="block text-sm text-muted-foreground mb-1">
          Phone <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Required for contact"
            className="w-full h-10 pl-10 pr-3 border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!canSubmit}
        className="w-full py-2 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Add Walk-up
      </button>
    </div>
  )
}

// === Main Component ===

export interface AddPlayerFlowProps {
  position: number
  onAdd: (player: PlayerData) => void
  onCancel: () => void
  bookerName: string
  bookingMemberId?: string
  requireGuestContact: boolean
  searchMemberFn?: (query: string) => Promise<PlayerData[]>
}

export function AddPlayerFlow({
  position,
  onAdd,
  onCancel,
  bookerName,
  bookingMemberId,
  requireGuestContact,
  searchMemberFn,
}: AddPlayerFlowProps) {
  const [step, setStep] = useState<AddPlayerStep>('type-select')
  const [selectedType, setSelectedType] = useState<PlayerTypeOption | null>(null)

  const handleTypeSelect = (type: PlayerTypeOption) => {
    setSelectedType(type)
    switch (type) {
      case 'member':
        setStep('member-search')
        break
      case 'guest':
        setStep('guest-form')
        break
      case 'dependent':
        setStep('dependent-search')
        break
      case 'walkup':
        setStep('walkup-form')
        break
    }
  }

  const handleBack = () => {
    setStep('type-select')
    setSelectedType(null)
  }

  const handleSelect = (player: PlayerData) => {
    onAdd(player)
  }

  return (
    <div className="p-4 border rounded-xl bg-card">
      {step === 'type-select' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              Add Player to Position {position}
            </span>
            <button
              type="button"
              onClick={onCancel}
              className="p-1 hover:bg-muted rounded transition-colors"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
          <div className="grid grid-cols-4 gap-2">
            <PlayerTypeButton
              type="member"
              label="Member"
              icon={<User className="h-5 w-5 text-blue-500" />}
              selected={selectedType === 'member'}
              onClick={() => handleTypeSelect('member')}
            />
            <PlayerTypeButton
              type="guest"
              label="Guest"
              icon={<UserPlus className="h-5 w-5 text-amber-500" />}
              selected={selectedType === 'guest'}
              onClick={() => handleTypeSelect('guest')}
            />
            <PlayerTypeButton
              type="dependent"
              label="Dependent"
              icon={<Users className="h-5 w-5 text-teal-500" />}
              selected={selectedType === 'dependent'}
              onClick={() => handleTypeSelect('dependent')}
            />
            <PlayerTypeButton
              type="walkup"
              label="Walk-up"
              icon={<User className="h-5 w-5 text-stone-500" />}
              selected={selectedType === 'walkup'}
              onClick={() => handleTypeSelect('walkup')}
            />
          </div>
        </div>
      )}

      {step === 'member-search' && (
        <MemberSearch onSelect={handleSelect} onBack={handleBack} searchFn={searchMemberFn} />
      )}

      {step === 'guest-form' && (
        <GuestForm
          onSubmit={handleSelect}
          onBack={handleBack}
          bookerName={bookerName}
          requireContact={requireGuestContact}
        />
      )}

      {step === 'dependent-search' && (
        <DependentSearch
          onSelect={handleSelect}
          onBack={handleBack}
          bookingMemberId={bookingMemberId}
        />
      )}

      {step === 'walkup-form' && <WalkupForm onSubmit={handleSelect} onBack={handleBack} />}
    </div>
  )
}
```

### Step 2: Create booking-notes.tsx

```tsx
// apps/application/src/components/golf/booking-notes.tsx
'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

export interface BookingNotesProps {
  value: string
  onChange: (value: string) => void
}

export function BookingNotes({ value, onChange }: BookingNotesProps) {
  const [isExpanded, setIsExpanded] = useState(!!value)

  return (
    <div className="rounded-xl border border-stone-200 overflow-hidden bg-gradient-to-b from-white to-stone-50/50">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-stone-50 transition-colors"
      >
        <span className="text-sm font-semibold text-stone-700">Booking Notes</span>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4 text-stone-400" />
        ) : (
          <ChevronDown className="h-4 w-4 text-stone-400" />
        )}
      </button>
      {isExpanded && (
        <div className="px-4 pb-4">
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Special requests, group name, occasion..."
            rows={3}
            className="w-full px-3 py-2.5 border border-stone-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none placeholder:text-stone-400"
          />
        </div>
      )}
    </div>
  )
}
```

### Step 3: Create golfer-count-selector.tsx

```tsx
// apps/application/src/components/golf/golfer-count-selector.tsx
'use client'

import { cn } from '@clubvantage/ui'

export interface GolferCountSelectorProps {
  value: number
  onChange: (count: number) => void
}

export function GolferCountSelector({ value, onChange }: GolferCountSelectorProps) {
  return (
    <div className="space-y-2.5">
      <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500">
        Golfers
      </label>
      <div className="flex gap-2">
        {[1, 2, 3, 4].map((num) => (
          <button
            key={num}
            type="button"
            onClick={() => onChange(num)}
            className={cn(
              'flex-1 py-3 text-lg font-bold rounded-xl border-2 transition-all',
              value === num
                ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/25'
                : 'border-stone-200 bg-white text-stone-700 hover:border-emerald-300 hover:bg-emerald-50'
            )}
          >
            {num}
          </button>
        ))}
      </div>
    </div>
  )
}
```

### Step 4: Create hole-selector.tsx

```tsx
// apps/application/src/components/golf/hole-selector.tsx
'use client'

import { cn } from '@clubvantage/ui'

export interface HoleSelectorProps {
  value: 9 | 18
  onChange: (holes: 9 | 18) => void
}

export function HoleSelector({ value, onChange }: HoleSelectorProps) {
  return (
    <div className="space-y-2.5">
      <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500">
        Holes
      </label>
      <div className="flex gap-2">
        {([9, 18] as const).map((num) => (
          <button
            key={num}
            type="button"
            onClick={() => onChange(num)}
            className={cn(
              'flex-1 py-3 text-lg font-bold rounded-xl border-2 transition-all',
              value === num
                ? 'bg-amber-500 text-white border-amber-500 shadow-lg shadow-amber-500/25'
                : 'border-stone-200 bg-white text-stone-700 hover:border-amber-300 hover:bg-amber-50'
            )}
          >
            {num}
          </button>
        ))}
      </div>
    </div>
  )
}
```

### Step 5: Verify extractions compile

Run: `cd /Users/peak/development/vantage/clubvantage && pnpm typecheck`
Expected: No errors related to new files

### Step 6: Commit extracted components

```bash
git add apps/application/src/components/golf/add-player-flow.tsx \
        apps/application/src/components/golf/booking-notes.tsx \
        apps/application/src/components/golf/golfer-count-selector.tsx \
        apps/application/src/components/golf/hole-selector.tsx
git commit -m "refactor(golf): extract booking modal subcomponents

Extract reusable components from unified-booking-modal:
- AddPlayerFlow: player type selection and search/forms
- BookingNotes: collapsible notes textarea
- GolferCountSelector: 1-4 button group
- HoleSelector: 9/18 button group

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 2: Create BookingModal Component

**Goal:** Create the new combined modal component with inline editing support.

**Files:**
- Create: `apps/application/src/components/golf/booking-modal.tsx`

### Step 1: Create booking-modal.tsx

```tsx
// apps/application/src/components/golf/booking-modal.tsx
'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { cn } from '@clubvantage/ui'
import {
  Loader2,
  AlertCircle,
  X,
  User,
  Calendar,
  Clock,
  MapPin,
} from 'lucide-react'
import { Modal } from './modal'
import { FlightStatusBadge } from './flight-status-badge'
import { PlayerSlot, type CaddyValue, type CartValue, type RentalValue } from './player-slot'
import { type CaddyPickerCaddy } from './caddy-picker'
import { AddPlayerFlow, type PlayerData } from './add-player-flow'
import { BookingNotes } from './booking-notes'
import { GolferCountSelector } from './golfer-count-selector'
import { HoleSelector } from './hole-selector'
import type { Booking, BookingStatus, BookingPlayer } from './types'
import type { PlayerType } from './player-type-badge'

// ============================================================================
// Types
// ============================================================================

interface PlayerSlotData {
  player: PlayerData | null
  caddyRequest: CaddyValue
  cartRequest: CartValue
  rentalRequest: RentalValue
}

interface ClubSettings {
  cartPolicy: 'OPTIONAL' | 'REQUIRED'
  rentalPolicy: 'OPTIONAL' | 'REQUIRED'
  maxGuestsPerMember: number
  requireGuestContact: boolean
}

interface PlayerPayload {
  position: number
  playerType: 'MEMBER' | 'GUEST' | 'DEPENDENT' | 'WALK_UP'
  memberId?: string
  guestName?: string
  guestPhone?: string
  guestEmail?: string
  sponsoringMemberId?: string
  caddyRequest: 'NONE' | 'REQUEST' | string
  cartRequest: 'NONE' | 'REQUEST'
  rentalRequest: 'NONE' | 'REQUEST'
}

interface BookingPayload {
  courseId: string
  teeDate: string
  teeTime: string
  holes: 9 | 18
  startingHole: 1 | 10
  players: PlayerPayload[]
  notes?: string
}

export interface BookingModalProps {
  isOpen: boolean
  onClose: () => void
  mode: 'new' | 'existing'

  // Context (required)
  courseId: string
  courseName: string
  date: Date
  time: string
  startingHole?: 1 | 10

  // Existing booking (required when mode='existing')
  booking?: Booking | null

  // Data
  availableCaddies: CaddyPickerCaddy[]
  clubSettings: ClubSettings

  // Search
  onSearchMembers?: (query: string) => Promise<PlayerData[]>

  // Callbacks
  onSave: (payload: BookingPayload) => Promise<void>
  onCheckIn?: () => Promise<void>
  onCancel?: (reason?: string) => Promise<void>
  onMove?: () => void
  onCopy?: () => void
  onMarkOnCourse?: () => Promise<void>
  onMarkFinished?: () => Promise<void>
  onSettle?: () => void
}

// ============================================================================
// Helper Functions
// ============================================================================

function formatTime(time: string): string {
  const [hours, minutes] = time.split(':')
  const hour = parseInt(hours || '0', 10)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
  return `${displayHour}:${minutes} ${ampm}`
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }) + ' at ' + date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

function playerTypeToPayloadType(type: PlayerType): 'MEMBER' | 'GUEST' | 'DEPENDENT' | 'WALK_UP' {
  switch (type) {
    case 'member': return 'MEMBER'
    case 'guest': return 'GUEST'
    case 'dependent': return 'DEPENDENT'
    case 'walkup': return 'WALK_UP'
  }
}

function bookingPlayerToSlotData(player: BookingPlayer, clubSettings: ClubSettings): PlayerSlotData {
  return {
    player: {
      id: player.memberUuid || player.playerId,
      name: player.name,
      type: player.playerType.toLowerCase() as PlayerType,
      memberId: player.memberId,
    },
    caddyRequest: (player.caddyRequest as CaddyValue) || 'NONE',
    cartRequest: (player.cartRequest as CartValue) || (clubSettings.cartPolicy === 'REQUIRED' ? 'REQUEST' : 'NONE'),
    rentalRequest: (player.rentalRequest as RentalValue) || (clubSettings.rentalPolicy === 'REQUIRED' ? 'REQUEST' : 'NONE'),
  }
}

function getEmptySlot(clubSettings: ClubSettings): PlayerSlotData {
  return {
    player: null,
    caddyRequest: 'NONE',
    cartRequest: clubSettings.cartPolicy === 'REQUIRED' ? 'REQUEST' : 'NONE',
    rentalRequest: clubSettings.rentalPolicy === 'REQUIRED' ? 'REQUEST' : 'NONE',
  }
}

function getInitialSlots(booking: Booking | null | undefined, clubSettings: ClubSettings): PlayerSlotData[] {
  if (booking?.players) {
    const slots: PlayerSlotData[] = Array(4).fill(null).map(() => getEmptySlot(clubSettings))
    booking.players.forEach((p) => {
      const index = p.position - 1
      if (index >= 0 && index < 4) {
        slots[index] = bookingPlayerToSlotData(p, clubSettings)
      }
    })
    return slots
  }
  return Array(4).fill(null).map(() => getEmptySlot(clubSettings))
}

function mapBookingStatusToFlightStatus(status: BookingStatus): 'booked' | 'checked-in' | 'on-course' | 'finished' | 'no-show' | 'cancelled' {
  switch (status) {
    case 'booked': return 'booked'
    case 'checked-in': return 'checked-in'
    case 'on-course': return 'on-course'
    case 'completed': return 'finished'
    case 'no-show': return 'no-show'
    case 'cancelled': return 'cancelled'
    default: return 'booked'
  }
}

// ============================================================================
// Booked By Section
// ============================================================================

interface BookedBySectionProps {
  bookerName: string
  bookerMemberId?: string
  createdAt: string
}

function BookedBySection({ bookerName, bookerMemberId, createdAt }: BookedBySectionProps) {
  return (
    <div>
      <h3 className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-stone-500">
        Booked By
      </h3>
      <div className="rounded-xl border border-stone-200 bg-gradient-to-b from-white to-stone-50/50 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
              <User className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <span className="font-semibold text-stone-900">{bookerName}</span>
              {bookerMemberId && (
                <span className="ml-2 text-sm text-stone-500">({bookerMemberId})</span>
              )}
              <div className="text-xs text-stone-500">
                Created {formatTimestamp(createdAt)}
              </div>
            </div>
          </div>
          <button className="rounded-lg bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-100">
            View Profile
          </button>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// Workflow Actions
// ============================================================================

interface WorkflowActionsProps {
  status: BookingStatus
  isProcessing: boolean
  processingAction?: string
  onCheckIn?: () => Promise<void>
  onMarkOnCourse?: () => Promise<void>
  onMarkFinished?: () => Promise<void>
  onSettle?: () => void
  onMove?: () => void
  onCopy?: () => void
  onCancel?: () => void
}

function WorkflowActions({
  status,
  isProcessing,
  processingAction,
  onCheckIn,
  onMarkOnCourse,
  onMarkFinished,
  onSettle,
  onMove,
  onCopy,
  onCancel,
}: WorkflowActionsProps) {
  const isProcessingThis = (action: string) => isProcessing && processingAction === action

  if (status === 'cancelled') {
    return null
  }

  return (
    <div className="flex items-center gap-2">
      {/* Cancel - always visible, red, pushed left */}
      {onCancel && status !== 'completed' && (
        <button
          type="button"
          onClick={onCancel}
          disabled={isProcessing}
          className="px-3 py-2 text-red-600 border border-red-200 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors disabled:opacity-50 mr-auto"
        >
          Cancel Booking
        </button>
      )}

      {/* Status-dependent actions */}
      {status === 'booked' && (
        <>
          {onCheckIn && (
            <button
              type="button"
              onClick={onCheckIn}
              disabled={isProcessing}
              className="px-3 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isProcessingThis('checkIn') && <Loader2 className="h-4 w-4 animate-spin" />}
              Check In
            </button>
          )}
          {onMove && (
            <button
              type="button"
              onClick={onMove}
              disabled={isProcessing}
              className="px-3 py-2 border border-stone-200 rounded-lg text-sm font-medium hover:bg-stone-50 transition-colors disabled:opacity-50"
            >
              Move
            </button>
          )}
          {onCopy && (
            <button
              type="button"
              onClick={onCopy}
              disabled={isProcessing}
              className="px-3 py-2 border border-stone-200 rounded-lg text-sm font-medium hover:bg-stone-50 transition-colors disabled:opacity-50"
            >
              Copy
            </button>
          )}
        </>
      )}

      {status === 'checked-in' && (
        <>
          {onMarkOnCourse && (
            <button
              type="button"
              onClick={onMarkOnCourse}
              disabled={isProcessing}
              className="px-3 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isProcessingThis('markOnCourse') && <Loader2 className="h-4 w-4 animate-spin" />}
              Mark On Course
            </button>
          )}
          {onSettle && (
            <button
              type="button"
              onClick={onSettle}
              disabled={isProcessing}
              className="px-3 py-2 border border-stone-200 rounded-lg text-sm font-medium hover:bg-stone-50 transition-colors disabled:opacity-50"
            >
              Settle
            </button>
          )}
        </>
      )}

      {status === 'on-course' && (
        <>
          {onMarkFinished && (
            <button
              type="button"
              onClick={onMarkFinished}
              disabled={isProcessing}
              className="px-3 py-2 bg-stone-600 text-white rounded-lg text-sm font-medium hover:bg-stone-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isProcessingThis('markFinished') && <Loader2 className="h-4 w-4 animate-spin" />}
              Mark Finished
            </button>
          )}
          {onSettle && (
            <button
              type="button"
              onClick={onSettle}
              disabled={isProcessing}
              className="px-3 py-2 border border-stone-200 rounded-lg text-sm font-medium hover:bg-stone-50 transition-colors disabled:opacity-50"
            >
              Settle
            </button>
          )}
        </>
      )}

      {status === 'completed' && onSettle && (
        <button
          type="button"
          onClick={onSettle}
          disabled={isProcessing}
          className="px-3 py-2 border border-stone-200 rounded-lg text-sm font-medium hover:bg-stone-50 transition-colors disabled:opacity-50"
        >
          View Receipt
        </button>
      )}
    </div>
  )
}

// ============================================================================
// Main Component
// ============================================================================

export function BookingModal({
  isOpen,
  onClose,
  mode,
  courseId,
  courseName,
  date,
  time,
  startingHole = 1,
  booking,
  availableCaddies,
  clubSettings,
  onSearchMembers,
  onSave,
  onCheckIn,
  onCancel,
  onMove,
  onCopy,
  onMarkOnCourse,
  onMarkFinished,
  onSettle,
}: BookingModalProps) {
  // Form state
  const [golferCount, setGolferCount] = useState(1)
  const [holes, setHoles] = useState<9 | 18>(booking?.holes ?? 18)
  const [slots, setSlots] = useState<PlayerSlotData[]>(() => getInitialSlots(booking, clubSettings))
  const [notes, setNotes] = useState(booking?.notes || '')
  const [addingPlayerPosition, setAddingPlayerPosition] = useState<number | null>(null)

  // Original state for change detection
  const [originalState, setOriginalState] = useState<string>('')

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [processingAction, setProcessingAction] = useState<string | undefined>()
  const [error, setError] = useState<string | null>(null)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      const initialSlots = getInitialSlots(booking, clubSettings)
      const initialHoles = booking?.holes ?? 18
      const initialNotes = booking?.notes || ''

      setSlots(initialSlots)
      setHoles(initialHoles)
      setNotes(initialNotes)
      setAddingPlayerPosition(null)
      setError(null)
      setShowCancelConfirm(false)

      if (mode === 'existing' && booking) {
        setGolferCount(booking.playerCount || initialSlots.filter(s => s.player).length)
        // Capture original state for change detection
        setOriginalState(JSON.stringify({ slots: initialSlots, holes: initialHoles, notes: initialNotes }))
      } else {
        setGolferCount(1)
        setOriginalState('')
      }
    }
  }, [isOpen, mode, booking, clubSettings])

  // Computed values
  const filledSlots = slots.filter((s) => s.player !== null).length
  const bookerName = slots[0]?.player?.name || 'Unknown'
  const bookingMemberId = slots[0]?.player?.memberId

  // Change detection
  const hasUnsavedChanges = useMemo(() => {
    if (mode === 'new') return filledSlots > 0
    if (!originalState) return false
    const currentState = JSON.stringify({ slots, holes, notes })
    return currentState !== originalState
  }, [mode, originalState, slots, holes, notes, filledSlots])

  // Handlers
  const handleGolferCountChange = (count: number) => {
    setGolferCount(count)
    setSlots((prev) =>
      prev.map((slot, i) => {
        if (i >= count && slot.player) {
          return getEmptySlot(clubSettings)
        }
        return slot
      })
    )
  }

  const handleAddPlayer = (position: number, player: PlayerData) => {
    setSlots((prev) => {
      const newSlots = [...prev]
      const existingSlot = newSlots[position]
      if (existingSlot) {
        newSlots[position] = {
          player,
          caddyRequest: existingSlot.caddyRequest,
          cartRequest: existingSlot.cartRequest,
          rentalRequest: existingSlot.rentalRequest,
        }
      }
      return newSlots
    })
    setAddingPlayerPosition(null)
  }

  const handleRemovePlayer = (position: number) => {
    setSlots((prev) => {
      const newSlots = [...prev]
      newSlots[position] = getEmptySlot(clubSettings)
      return newSlots
    })
  }

  const handleCaddyChange = (position: number, value: CaddyValue) => {
    setSlots((prev) => {
      const newSlots = [...prev]
      const slot = newSlots[position]
      if (slot) {
        newSlots[position] = { ...slot, caddyRequest: value }
      }
      return newSlots
    })
  }

  const handleCartChange = (position: number, value: CartValue) => {
    setSlots((prev) => {
      const newSlots = [...prev]
      const slot = newSlots[position]
      if (slot) {
        newSlots[position] = { ...slot, cartRequest: value }
      }
      return newSlots
    })
  }

  const handleRentalChange = (position: number, value: RentalValue) => {
    setSlots((prev) => {
      const newSlots = [...prev]
      const slot = newSlots[position]
      if (slot) {
        newSlots[position] = { ...slot, rentalRequest: value }
      }
      return newSlots
    })
  }

  const handleDiscard = () => {
    if (mode === 'existing' && booking) {
      const initialSlots = getInitialSlots(booking, clubSettings)
      setSlots(initialSlots)
      setHoles(booking.holes ?? 18)
      setNotes(booking.notes || '')
    }
  }

  const handleSave = async () => {
    setIsSubmitting(true)
    setError(null)

    try {
      const players: PlayerPayload[] = []
      const effectiveCount = mode === 'new' ? golferCount : 4

      slots.forEach((slot, i) => {
        if (i >= effectiveCount) return
        if (!slot.player && mode === 'new' && i >= golferCount) return

        if (slot.player) {
          players.push({
            position: i + 1,
            playerType: playerTypeToPayloadType(slot.player.type),
            memberId: slot.player.type === 'member' || slot.player.type === 'dependent'
              ? slot.player.id
              : undefined,
            guestName: slot.player.type === 'guest' || slot.player.type === 'walkup'
              ? slot.player.name
              : undefined,
            guestPhone: slot.player.phone,
            guestEmail: slot.player.email,
            sponsoringMemberId: slot.player.type === 'guest' ? slot.player.sponsoringMemberId || bookingMemberId : undefined,
            caddyRequest: slot.caddyRequest,
            cartRequest: slot.cartRequest,
            rentalRequest: slot.rentalRequest,
          })
        } else if (mode === 'new' && i < golferCount) {
          // Empty slot in new booking - create placeholder
          players.push({
            position: i + 1,
            playerType: 'GUEST',
            guestName: 'Guest',
            sponsoringMemberId: bookingMemberId,
            caddyRequest: slot.caddyRequest,
            cartRequest: slot.cartRequest,
            rentalRequest: slot.rentalRequest,
          })
        }
      })

      const payload: BookingPayload = {
        courseId,
        teeDate: date.toISOString().split('T')[0] || '',
        teeTime: time,
        holes,
        startingHole,
        players,
        notes: notes.trim() || undefined,
      }

      await onSave(payload)

      // Update original state after successful save
      if (mode === 'existing') {
        setOriginalState(JSON.stringify({ slots, holes, notes }))
      } else {
        onClose()
      }
    } catch (err) {
      setError('Failed to save booking. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (hasUnsavedChanges) {
      // Could show confirmation dialog
      const confirmed = window.confirm('You have unsaved changes. Discard?')
      if (!confirmed) return
    }
    onClose()
  }

  const handleCancelBooking = async () => {
    if (!onCancel) return
    setProcessingAction('cancel')
    try {
      await onCancel()
      onClose()
    } catch (err) {
      setError('Failed to cancel booking.')
    } finally {
      setProcessingAction(undefined)
    }
  }

  // Slot state helper
  const getSlotState = (index: number): 'filled' | 'empty' | 'available' => {
    if (slots[index]?.player) return 'filled'
    if (mode === 'new' && index < golferCount) return 'empty'
    if (mode === 'existing') return 'empty' // All 4 slots editable in existing mode
    return 'available'
  }

  // Validation
  const canSave = filledSlots > 0

  // Header subtitle
  const holeIndicator = startingHole === 10 ? ' · Hole 10 Start' : ''
  const subtitle = `${formatTime(time)} · ${courseName} · ${formatDate(date)}${holeIndicator}`

  // Footer
  const footer = (
    <div className="flex items-center w-full">
      {/* Left side: workflow actions (existing only) */}
      {mode === 'existing' && booking && (
        <WorkflowActions
          status={booking.status}
          isProcessing={isSubmitting || !!processingAction}
          processingAction={processingAction}
          onCheckIn={onCheckIn ? async () => {
            setProcessingAction('checkIn')
            try {
              await onCheckIn()
            } finally {
              setProcessingAction(undefined)
            }
          } : undefined}
          onMarkOnCourse={onMarkOnCourse ? async () => {
            setProcessingAction('markOnCourse')
            try {
              await onMarkOnCourse()
            } finally {
              setProcessingAction(undefined)
            }
          } : undefined}
          onMarkFinished={onMarkFinished ? async () => {
            setProcessingAction('markFinished')
            try {
              await onMarkFinished()
            } finally {
              setProcessingAction(undefined)
            }
          } : undefined}
          onSettle={onSettle}
          onMove={onMove}
          onCopy={onCopy}
          onCancel={() => handleCancelBooking()}
        />
      )}

      {/* Right side: edit actions */}
      <div className="flex items-center gap-2 ml-auto">
        {mode === 'new' ? (
          <>
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-4 py-2 border border-stone-200 rounded-lg font-medium hover:bg-stone-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!canSave || isSubmitting}
              className="px-4 py-2 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Confirm Booking
            </button>
          </>
        ) : hasUnsavedChanges ? (
          <>
            <button
              type="button"
              onClick={handleDiscard}
              disabled={isSubmitting}
              className="px-4 py-2 border border-stone-200 rounded-lg font-medium hover:bg-stone-50 transition-colors"
            >
              Discard
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!canSave || isSubmitting}
              className="px-4 py-2 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Save Changes
            </button>
          </>
        ) : null}
      </div>
    </div>
  )

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={mode === 'new' ? 'New Booking' : `Booking #${booking?.bookingNumber || ''}`}
      subtitle={
        <div className="flex items-center gap-3 mt-2">
          {mode === 'existing' && booking && (
            <FlightStatusBadge status={mapBookingStatusToFlightStatus(booking.status)} size="sm" />
          )}
          <div className="flex items-center gap-1.5 text-sm text-stone-600">
            <Clock className="h-3.5 w-3.5 text-stone-400" />
            <span>{formatTime(time)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-stone-600">
            <MapPin className="h-3.5 w-3.5 text-stone-400" />
            <span>{courseName}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-stone-600">
            <Calendar className="h-3.5 w-3.5 text-stone-400" />
            <span>{formatDate(date)}</span>
          </div>
        </div>
      }
      footer={footer}
      size="lg"
    >
      <div className="space-y-6">
        {/* Error Banner */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Golfer Count + Holes (new) or just Holes (existing) */}
        {mode === 'new' ? (
          <div className="grid grid-cols-2 gap-4">
            <GolferCountSelector value={golferCount} onChange={handleGolferCountChange} />
            <HoleSelector value={holes} onChange={setHoles} />
          </div>
        ) : (
          <HoleSelector value={holes} onChange={setHoles} />
        )}

        {/* Players Section */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500">
            Players {mode === 'new' && `(${filledSlots}/${golferCount})`}
          </label>

          <div className="space-y-2">
            {slots.map((slot, index) => {
              const state = getSlotState(index)
              const isAddingThisPosition = addingPlayerPosition === index

              if (isAddingThisPosition) {
                return (
                  <AddPlayerFlow
                    key={index}
                    position={index + 1}
                    onAdd={(player) => handleAddPlayer(index, player)}
                    onCancel={() => setAddingPlayerPosition(null)}
                    bookerName={bookerName}
                    bookingMemberId={bookingMemberId}
                    requireGuestContact={clubSettings.requireGuestContact}
                    searchMemberFn={onSearchMembers}
                  />
                )
              }

              // Skip "available" slots in existing mode (show all 4)
              if (state === 'available' && mode === 'new') {
                return (
                  <PlayerSlot
                    key={index}
                    position={index + 1}
                    player={null}
                    caddyValue={slot.caddyRequest}
                    cartValue={slot.cartRequest}
                    rentalValue={slot.rentalRequest}
                    onCaddyChange={(v) => handleCaddyChange(index, v)}
                    onCartChange={(v) => handleCartChange(index, v)}
                    onRentalChange={(v) => handleRentalChange(index, v)}
                    onAddPlayer={() => setAddingPlayerPosition(index)}
                    onRemovePlayer={() => handleRemovePlayer(index)}
                    availableCaddies={availableCaddies}
                    cartPolicy={clubSettings.cartPolicy}
                    rentalPolicy={clubSettings.rentalPolicy}
                    state="available"
                    disabled={isSubmitting}
                  />
                )
              }

              return (
                <PlayerSlot
                  key={index}
                  position={index + 1}
                  player={slot.player ? {
                    id: slot.player.id,
                    name: slot.player.name,
                    type: slot.player.type,
                    memberId: slot.player.memberId,
                  } : null}
                  caddyValue={slot.caddyRequest}
                  cartValue={slot.cartRequest}
                  rentalValue={slot.rentalRequest}
                  onCaddyChange={(v) => handleCaddyChange(index, v)}
                  onCartChange={(v) => handleCartChange(index, v)}
                  onRentalChange={(v) => handleRentalChange(index, v)}
                  onAddPlayer={() => setAddingPlayerPosition(index)}
                  onRemovePlayer={() => handleRemovePlayer(index)}
                  availableCaddies={availableCaddies}
                  cartPolicy={clubSettings.cartPolicy}
                  rentalPolicy={clubSettings.rentalPolicy}
                  state={state}
                  disabled={isSubmitting}
                />
              )
            })}
          </div>
        </div>

        {/* Booked By (existing only) */}
        {mode === 'existing' && booking && (
          <BookedBySection
            bookerName={booking.bookerName}
            bookerMemberId={booking.bookerMemberId}
            createdAt={booking.createdAt}
          />
        )}

        {/* Booking Notes */}
        <BookingNotes value={notes} onChange={setNotes} />
      </div>
    </Modal>
  )
}

export type { BookingPayload, PlayerPayload, ClubSettings }
```

### Step 2: Verify component compiles

Run: `cd /Users/peak/development/vantage/clubvantage && pnpm typecheck`
Expected: No errors related to booking-modal.tsx

### Step 3: Commit new component

```bash
git add apps/application/src/components/golf/booking-modal.tsx
git commit -m "feat(golf): add combined BookingModal component

Single modal for both new and existing bookings with:
- Inline editing (no mode switch)
- Change detection with Save/Discard buttons
- Split footer: workflow actions left, edit actions right
- Reuses PlayerSlot, AddPlayerFlow, and other extracted components

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 3: Update Golf Page to Use BookingModal

**Goal:** Replace BookingDetailModal and UnifiedBookingModal with the new BookingModal.

**Files:**
- Modify: `apps/application/src/app/(dashboard)/golf/page.tsx`

### Step 1: Update imports

Remove:
```tsx
import { BookingDetailModal } from '@/components/golf/booking-detail-modal'
// and dynamic import of UnifiedBookingModal
```

Add:
```tsx
import { BookingModal } from '@/components/golf/booking-modal'
```

### Step 2: Simplify state

Remove:
- `isBookingDetailOpen` / `setIsBookingDetailOpen`
- `isUnifiedBookingModalOpen` / `setIsUnifiedBookingModalOpen`
- `unifiedBookingMode` / `setUnifiedBookingMode`
- `unifiedBookingSlot` / `setUnifiedBookingSlot`
- `unifiedBookingExisting` / `setUnifiedBookingExisting`

Add:
- `isBookingModalOpen` / `setIsBookingModalOpen`
- `bookingModalMode` / `setBookingModalMode: 'new' | 'existing'`
- `bookingModalSlot` / `setBookingModalSlot: { time: string; flightId?: string }`

### Step 3: Update handlers

Replace `openUnifiedBookingNew` and `openUnifiedBookingEdit` with single `openBookingModal`:

```tsx
const openBookingModal = (mode: 'new' | 'existing', time: string, flightId?: string) => {
  setBookingModalMode(mode)
  setBookingModalSlot({ time, flightId })
  setIsBookingModalOpen(true)
}
```

### Step 4: Replace both modals with single BookingModal

Remove the `<BookingDetailModal>` and `<UnifiedBookingModal>` JSX blocks.

Add:
```tsx
<BookingModal
  isOpen={isBookingModalOpen}
  onClose={() => {
    setIsBookingModalOpen(false)
    setSelectedBooking(null)
  }}
  mode={bookingModalMode}
  courseId={selectedCourse || ''}
  courseName={courses.find(c => c.id === selectedCourse)?.name || ''}
  date={currentDate}
  time={bookingModalSlot?.time || ''}
  startingHole={1}
  booking={selectedBooking}
  availableCaddies={mockCaddies}
  clubSettings={mockClubSettings}
  onSearchMembers={searchMembers}
  onSave={async (payload) => {
    if (bookingModalMode === 'new') {
      await bookTeeTime(payload)
    } else if (selectedBooking) {
      await updateGolfBooking(selectedBooking.id, payload)
    }
    refetchTeeSheet()
  }}
  onCheckIn={selectedBooking ? async () => {
    await checkIn(selectedBooking.id)
    refetchTeeSheet()
  } : undefined}
  onCancel={selectedBooking ? async (reason) => {
    await cancelTeeTime(selectedBooking.id, reason || 'Cancelled by staff')
    refetchTeeSheet()
  } : undefined}
  onMove={selectedBooking ? () => {
    placementMode.startMove({
      id: selectedBooking.id,
      bookingNumber: selectedBooking.bookingNumber,
      playerNames: selectedBooking.players.map(p => p.name),
      playerCount: selectedBooking.playerCount,
      sourceTeeTime: selectedBooking.teeTime,
      sourceDate: selectedBooking.teeDate,
    })
    setIsBookingModalOpen(false)
    setActiveTab('tee-sheet')
  } : undefined}
  onCopy={selectedBooking ? () => {
    placementMode.startCopy({
      id: selectedBooking.id,
      bookingNumber: selectedBooking.bookingNumber,
      playerNames: selectedBooking.players.map(p => p.name),
      playerCount: selectedBooking.playerCount,
      sourceTeeTime: selectedBooking.teeTime,
      sourceDate: selectedBooking.teeDate,
    })
    setIsBookingModalOpen(false)
    setActiveTab('tee-sheet')
  } : undefined}
  onSettle={selectedBooking ? () => {
    const flight = flights.find(f => f.id === selectedBooking.flightId)
    if (flight) {
      setSelectedFlight(flight)
      setShowSettlementModal(true)
      setIsBookingModalOpen(false)
    }
  } : undefined}
/>
```

### Step 5: Update all callers

Find all places that:
- Set `isBookingDetailOpen(true)` → use `openBookingModal('existing', ...)`
- Set `isUnifiedBookingModalOpen(true)` with mode='new' → use `openBookingModal('new', ...)`
- Set `isUnifiedBookingModalOpen(true)` with mode='edit' → use `openBookingModal('existing', ...)`

### Step 6: Verify page compiles

Run: `cd /Users/peak/development/vantage/clubvantage && pnpm typecheck`
Expected: No errors

### Step 7: Test manually

Run: `cd /Users/peak/development/vantage/clubvantage && pnpm dev`

Test:
1. Click empty slot → New Booking modal opens
2. Add players, save → Booking created
3. Click existing booking chip → Modal opens with booking data
4. Edit player options, save → Changes saved
5. Check In, Move, Copy, Cancel buttons work

### Step 8: Commit integration

```bash
git add apps/application/src/app/(dashboard)/golf/page.tsx
git commit -m "feat(golf): integrate BookingModal into golf page

Replace BookingDetailModal and UnifiedBookingModal with single
BookingModal component. Simplifies state management and provides
unified view/edit experience.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 4: Delete Old Components

**Goal:** Remove the replaced components.

**Files:**
- Delete: `apps/application/src/components/golf/booking-detail-modal.tsx`
- Delete: `apps/application/src/components/golf/unified-booking-modal.tsx`
- Delete: `apps/application/src/components/golf/booking-players-section.tsx`
- Modify: `apps/application/src/components/golf/dynamic-modals.tsx` (remove UnifiedBookingModal)

### Step 1: Update dynamic-modals.tsx

Remove the dynamic import and export for UnifiedBookingModal.

### Step 2: Delete old files

```bash
rm apps/application/src/components/golf/booking-detail-modal.tsx
rm apps/application/src/components/golf/unified-booking-modal.tsx
rm apps/application/src/components/golf/booking-players-section.tsx
```

### Step 3: Verify no broken imports

Run: `cd /Users/peak/development/vantage/clubvantage && pnpm typecheck`
Expected: No errors

### Step 4: Commit cleanup

```bash
git add -A
git commit -m "chore(golf): remove replaced booking modal components

Delete BookingDetailModal, UnifiedBookingModal, and BookingPlayersSection
now that BookingModal handles all booking view/edit functionality.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 5: Update unified-booking-modal imports

**Goal:** Update unified-booking-modal.tsx to use extracted components (if keeping for reference) or ensure clean deletion.

Since we're deleting unified-booking-modal.tsx, skip this task.

---

## Summary

| Task | Description | Files |
|------|-------------|-------|
| 1 | Extract shared subcomponents | 4 new files |
| 2 | Create BookingModal | 1 new file |
| 3 | Update golf page | 1 modified file |
| 4 | Delete old components | 3 deleted, 1 modified |

Total: ~5 commits, ~1200 lines of new code, ~1500 lines removed (net reduction).
