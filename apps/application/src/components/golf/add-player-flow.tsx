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
          aria-label="Go back"
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
          aria-label="Go back"
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
          aria-label="Go back"
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
          aria-label="Go back"
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
