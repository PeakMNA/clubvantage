'use client'

import { useState, useEffect } from 'react'
import { cn, Button } from '@clubvantage/ui'
import { AlertCircle, ArrowLeft, Grid, List, RefreshCw, Search } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { FacilityCard } from '@/components/portal/bookings'
import type { PortalFacility, FacilityType } from '@/lib/types'
import { fetchFacilities } from '../../bookings/actions'

const facilityTypes: { value: FacilityType | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'court', label: 'Courts' },
  { value: 'pool', label: 'Pool' },
  { value: 'spa', label: 'Spa' },
  { value: 'studio', label: 'Studio' },
  { value: 'room', label: 'Rooms' },
]

export default function FacilitiesListPage() {
  const searchParams = useSearchParams()
  const initialType = searchParams.get('type') as FacilityType | null

  const [facilities, setFacilities] = useState<PortalFacility[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<FacilityType | 'all'>(initialType || 'all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const loadFacilities = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await fetchFacilities({
        type: typeFilter === 'all' ? undefined : typeFilter,
        search: searchQuery || undefined,
      })
      setFacilities(data)
    } catch (err) {
      console.error('Failed to load facilities:', err)
      setError('Unable to load facilities. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadFacilities()
  }, [typeFilter, searchQuery])

  const handleSelectFacility = (facility: PortalFacility) => {
    window.location.href = `/portal/book/facilities/${facility.id}`
  }

  return (
    <div className="flex flex-col gap-4 p-4 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/portal/book">
          <button className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </button>
        </Link>
        <h1 className="text-xl font-bold text-foreground">Facilities</h1>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search facilities..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-xl border border-border bg-card py-3 pl-10 pr-4 text-sm placeholder:text-muted-foreground focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20"
        />
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {facilityTypes.map((type) => (
            <button
              key={type.value}
              onClick={() => setTypeFilter(type.value)}
              className={cn(
                'whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
                typeFilter === type.value
                  ? 'bg-amber-500 text-white'
                  : 'bg-muted text-muted-foreground hover:bg-amber-100 hover:text-amber-700'
              )}
            >
              {type.label}
            </button>
          ))}
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setViewMode('grid')}
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-lg transition-colors',
              viewMode === 'grid'
                ? 'bg-muted text-foreground'
                : 'text-muted-foreground hover:bg-muted'
            )}
          >
            <Grid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-lg transition-colors',
              viewMode === 'list'
                ? 'bg-muted text-foreground'
                : 'text-muted-foreground hover:bg-muted'
            )}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent" />
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-500/30 dark:bg-red-500/10">
          <AlertCircle className="mx-auto mb-3 h-10 w-10 text-red-500" />
          <p className="mb-1 font-medium text-red-700 dark:text-red-400">Something went wrong</p>
          <p className="mb-4 text-sm text-red-600 dark:text-red-300">{error}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={loadFacilities}
            className="border-red-300 text-red-700 hover:bg-red-100 dark:border-red-500/50 dark:text-red-400 dark:hover:bg-red-500/20"
          >
            <RefreshCw className="mr-1.5 h-4 w-4" />
            Try Again
          </Button>
        </div>
      ) : facilities.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center">
          <p className="mb-1 font-medium text-foreground">No facilities found</p>
          <p className="text-sm text-muted-foreground">
            Try adjusting your search or filters
          </p>
        </div>
      ) : (
        <div
          className={cn(
            viewMode === 'grid'
              ? 'grid grid-cols-1 gap-4 sm:grid-cols-2'
              : 'flex flex-col gap-3'
          )}
        >
          {facilities.map((facility) => (
            <FacilityCard
              key={facility.id}
              facility={facility}
              onSelect={handleSelectFacility}
            />
          ))}
        </div>
      )}
    </div>
  )
}
