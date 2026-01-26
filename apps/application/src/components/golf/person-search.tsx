'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { cn } from '@clubvantage/ui'
import { Search, X, Loader2, UserPlus } from 'lucide-react'
import { PlayerTypeBadge, type PlayerType } from './player-type-badge'

interface Person {
  id: string
  name: string
  type: PlayerType
  phone?: string
  email?: string
  memberId?: string
}

interface PersonSearchProps {
  onSelect: (person: Person) => void
  onWalkup: () => void
  placeholder?: string
  className?: string
  searchFn?: (query: string) => Promise<Person[]>
}

// Mock search function - replace with actual API call
async function defaultSearchFn(query: string): Promise<Person[]> {
  await new Promise((resolve) => setTimeout(resolve, 300)) // Simulate network delay

  const mockData: Person[] = [
    { id: '1', name: 'John Smith', type: 'member', phone: '081-234-5678', memberId: 'M-0001' },
    { id: '2', name: 'Jane Doe', type: 'member', email: 'jane@example.com', memberId: 'M-0002' },
    { id: '3', name: 'Mike Johnson', type: 'guest', phone: '082-345-6789' },
    { id: '4', name: 'Sarah Wilson', type: 'dependent', memberId: 'D-0001' },
    { id: '5', name: 'Tom Brown', type: 'member', phone: '083-456-7890', memberId: 'M-0003' },
  ]

  const lowerQuery = query.toLowerCase()
  return mockData.filter(
    (p) =>
      p.name.toLowerCase().includes(lowerQuery) ||
      p.phone?.includes(query) ||
      p.email?.toLowerCase().includes(lowerQuery) ||
      p.memberId?.toLowerCase().includes(lowerQuery)
  )
}

export function PersonSearch({
  onSelect,
  onWalkup,
  placeholder = 'Search by phone, name, email, or member #',
  className,
  searchFn = defaultSearchFn,
}: PersonSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Person[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)

  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Debounced search
  const performSearch = useCallback(
    async (searchQuery: string) => {
      if (searchQuery.length < 2) {
        setResults([])
        setIsOpen(false)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const searchResults = await searchFn(searchQuery)
        setResults(searchResults)
        setIsOpen(true)
        setHighlightedIndex(-1)
      } catch (err) {
        setError('Search failed. Try again.')
        setResults([])
      } finally {
        setIsLoading(false)
      }
    },
    [searchFn]
  )

  // Handle input change with debounce
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    searchTimeoutRef.current = setTimeout(() => {
      performSearch(query)
    }, 300)

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [query, performSearch])

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return

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
        setIsOpen(false)
        break
    }
  }

  const handleSelect = (person: Person) => {
    onSelect(person)
    setQuery('')
    setIsOpen(false)
    setResults([])
  }

  const handleWalkup = () => {
    onWalkup()
    setQuery('')
    setIsOpen(false)
    setResults([])
  }

  const clearQuery = () => {
    setQuery('')
    setResults([])
    setIsOpen(false)
    inputRef.current?.focus()
  }

  return (
    <div className={cn('relative', className)}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          placeholder={placeholder}
          className="w-full h-11 pl-10 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
        {query && (
          <button
            onClick={clearQuery}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        )}
      </div>

      {/* Results Dropdown */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-1 bg-card rounded-md shadow-lg border z-50 max-h-[300px] overflow-y-auto"
        >
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="p-4 text-center text-sm text-red-600">{error}</div>
          ) : results.length > 0 ? (
            <div className="py-1">
              {results.map((person, index) => (
                <button
                  key={person.id}
                  onClick={() => handleSelect(person)}
                  className={cn(
                    'w-full px-4 py-3 text-left hover:bg-primary/10 flex items-center gap-3 transition-colors',
                    highlightedIndex === index && 'bg-primary/10'
                  )}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">{person.name}</span>
                      <PlayerTypeBadge type={person.type} />
                    </div>
                    <div className="text-sm text-muted-foreground truncate">
                      {person.phone || person.email}
                      {person.memberId && ` • ${person.memberId}`}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center">
              <p className="text-sm text-muted-foreground mb-3">No matches found</p>
              <button
                onClick={handleWalkup}
                className="inline-flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 rounded-md text-sm font-medium transition-colors"
              >
                <UserPlus className="h-4 w-4" />
                Add as Walk-up
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
