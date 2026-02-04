'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { Search, X, Loader2, UserPlus, User, Users } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@clubvantage/ui'
import { cn } from '@clubvantage/ui'

// GraphQL query for searching members and dependents
const SEARCH_PERSONS_QUERY = `
  query SearchPersons($search: String, $first: Int) {
    members(search: $search, first: $first) {
      edges {
        node {
          id
          memberId
          firstName
          lastName
          email
          phone
          dependents {
            id
            firstName
            lastName
            relationship
          }
        }
      }
    }
  }
`

export type PersonType = 'member' | 'guest' | 'dependent'

export interface SelectedPerson {
  id: string
  name: string
  type: PersonType
  phone?: string
  email?: string
  memberNumber?: string
  parentMemberId?: string // For dependents
}

interface MemberLookupModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (person: SelectedPerson) => void
  title?: string
}

export function MemberLookupModal({
  isOpen,
  onClose,
  onSelect,
  title = 'Find Member or Guest',
}: MemberLookupModalProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SelectedPerson[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const [showGuestForm, setShowGuestForm] = useState(false)
  const [guestName, setGuestName] = useState('')
  const [guestPhone, setGuestPhone] = useState('')

  const inputRef = useRef<HTMLInputElement>(null)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
    } else {
      // Reset state when modal closes
      setQuery('')
      setResults([])
      setError(null)
      setShowGuestForm(false)
      setGuestName('')
      setGuestPhone('')
    }
  }, [isOpen])

  // Search function using GraphQL API
  const searchPersons = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResults([])
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const response = await fetch(`${apiUrl}/graphql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          query: SEARCH_PERSONS_QUERY,
          variables: { search: searchQuery, first: 10 },
        }),
      })

      const data = await response.json()

      if (data.errors) {
        console.error('GraphQL errors:', data.errors)
        setError('Search failed. Please try again.')
        setResults([])
        return
      }

      const persons: SelectedPerson[] = []

      // Process members and their dependents
      for (const { node } of data.data.members.edges) {
        // Add member
        persons.push({
          id: node.id,
          name: `${node.firstName} ${node.lastName}`,
          type: 'member',
          phone: node.phone || undefined,
          email: node.email || undefined,
          memberNumber: node.memberId,
        })

        // Add dependents
        if (node.dependents) {
          for (const dep of node.dependents) {
            persons.push({
              id: dep.id,
              name: `${dep.firstName} ${dep.lastName}`,
              type: 'dependent',
              memberNumber: `${node.memberId} (${dep.relationship})`,
              parentMemberId: node.id,
            })
          }
        }
      }

      setResults(persons)
      setHighlightedIndex(-1)
    } catch (err) {
      console.error('Failed to search:', err)
      setError('Search failed. Please try again.')
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    searchTimeoutRef.current = setTimeout(() => {
      searchPersons(query)
    }, 300)

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [query, searchPersons])

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (results.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlightedIndex((prev) =>
          prev < results.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1))
        break
      case 'Enter':
        e.preventDefault()
        if (highlightedIndex >= 0 && results[highlightedIndex]) {
          handleSelect(results[highlightedIndex])
        }
        break
      case 'Escape':
        e.preventDefault()
        onClose()
        break
    }
  }

  const handleSelect = (person: SelectedPerson) => {
    onSelect(person)
    onClose()
  }

  const handleAddGuest = () => {
    if (!guestName.trim()) return

    const guest: SelectedPerson = {
      id: `guest-${Date.now()}`,
      name: guestName.trim(),
      type: 'guest',
      phone: guestPhone.trim() || undefined,
    }

    onSelect(guest)
    onClose()
  }

  const getTypeIcon = (type: PersonType) => {
    switch (type) {
      case 'member':
        return <User className="h-4 w-4" />
      case 'dependent':
        return <Users className="h-4 w-4" />
      case 'guest':
        return <UserPlus className="h-4 w-4" />
    }
  }

  const getTypeBadgeClass = (type: PersonType) => {
    switch (type) {
      case 'member':
        return 'bg-blue-500 text-white'
      case 'dependent':
        return 'bg-teal-500 text-white'
      case 'guest':
        return 'bg-amber-500 text-white'
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        {!showGuestForm ? (
          <div className="space-y-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search by name, phone, or member #"
                className="w-full h-11 pl-10 pr-10 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-stone-100 rounded"
                >
                  <X className="h-4 w-4 text-stone-400" />
                </button>
              )}
            </div>

            {/* Results */}
            <div className="min-h-[200px] max-h-[300px] overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-stone-400" />
                </div>
              ) : error ? (
                <div className="text-center py-8 text-red-600 text-sm">
                  {error}
                </div>
              ) : results.length > 0 ? (
                <div className="space-y-1">
                  {results.map((person, index) => (
                    <button
                      key={person.id}
                      onClick={() => handleSelect(person)}
                      className={cn(
                        'w-full px-3 py-3 text-left rounded-lg transition-colors flex items-center gap-3',
                        highlightedIndex === index
                          ? 'bg-amber-50'
                          : 'hover:bg-stone-50'
                      )}
                    >
                      <div
                        className={cn(
                          'flex items-center justify-center w-8 h-8 rounded-full',
                          getTypeBadgeClass(person.type)
                        )}
                      >
                        {getTypeIcon(person.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-stone-900 truncate">
                          {person.name}
                        </div>
                        <div className="text-sm text-stone-500 truncate">
                          {person.memberNumber && (
                            <span>{person.memberNumber}</span>
                          )}
                          {person.phone && (
                            <span>
                              {person.memberNumber && ' • '}
                              {person.phone}
                            </span>
                          )}
                          {person.email && !person.phone && (
                            <span>
                              {person.memberNumber && ' • '}
                              {person.email}
                            </span>
                          )}
                        </div>
                      </div>
                      <span
                        className={cn(
                          'px-2 py-1 text-xs font-medium rounded-full capitalize',
                          getTypeBadgeClass(person.type)
                        )}
                      >
                        {person.type}
                      </span>
                    </button>
                  ))}
                </div>
              ) : query.length >= 2 ? (
                <div className="text-center py-8">
                  <p className="text-stone-500 mb-4">No results found</p>
                  <button
                    onClick={() => setShowGuestForm(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
                  >
                    <UserPlus className="h-4 w-4" />
                    Add as Guest
                  </button>
                </div>
              ) : (
                <div className="text-center py-8 text-stone-400">
                  <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Type at least 2 characters to search</p>
                </div>
              )}
            </div>

            {/* Add Guest Button (when there are results) */}
            {results.length > 0 && (
              <div className="pt-2 border-t border-stone-200">
                <button
                  onClick={() => setShowGuestForm(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 text-stone-600 hover:bg-stone-50 rounded-lg transition-colors"
                >
                  <UserPlus className="h-4 w-4" />
                  Add as Guest Instead
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Guest Form */
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Guest Name *
              </label>
              <input
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="Enter guest name"
                className="w-full h-11 px-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Phone (optional)
              </label>
              <input
                type="tel"
                value={guestPhone}
                onChange={(e) => setGuestPhone(e.target.value)}
                placeholder="Enter phone number"
                className="w-full h-11 px-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowGuestForm(false)}
                className="flex-1 px-4 py-2 border border-stone-200 text-stone-700 rounded-lg hover:bg-stone-50 transition-colors"
              >
                Back to Search
              </button>
              <button
                onClick={handleAddGuest}
                disabled={!guestName.trim()}
                className="flex-1 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Add Guest
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
