'use client'

import { useState, useEffect } from 'react'
import { cn, Button } from '@clubvantage/ui'
import { AlertCircle, ArrowLeft, Grid, List, RefreshCw, Search } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ServiceCard } from '@/components/portal/bookings'
import type { PortalService, ServiceCategory } from '@/lib/types'
import { fetchServices } from '../../bookings/actions'

const serviceCategories: { value: ServiceCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'spa', label: 'Spa' },
  { value: 'fitness', label: 'Fitness' },
  { value: 'wellness', label: 'Wellness' },
  { value: 'sports', label: 'Sports' },
]

export default function ServicesListPage() {
  const searchParams = useSearchParams()
  const initialCategory = searchParams.get('category') as ServiceCategory | null

  const [services, setServices] = useState<PortalService[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<ServiceCategory | 'all'>(initialCategory || 'all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const loadServices = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await fetchServices({
        category: categoryFilter === 'all' ? undefined : categoryFilter,
        search: searchQuery || undefined,
      })
      setServices(data)
    } catch (err) {
      console.error('Failed to load services:', err)
      setError('Unable to load services. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadServices()
  }, [categoryFilter, searchQuery])

  const handleSelectService = (service: PortalService) => {
    window.location.href = `/portal/book/services/${service.id}`
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
        <h1 className="text-xl font-bold text-foreground">Services</h1>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search services..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-xl border border-border bg-card py-3 pl-10 pr-4 text-sm placeholder:text-muted-foreground focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20"
        />
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {serviceCategories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategoryFilter(cat.value)}
              className={cn(
                'whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
                categoryFilter === cat.value
                  ? 'bg-amber-500 text-white'
                  : 'bg-muted text-muted-foreground hover:bg-amber-100 hover:text-amber-700'
              )}
            >
              {cat.label}
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
            onClick={loadServices}
            className="border-red-300 text-red-700 hover:bg-red-100 dark:border-red-500/50 dark:text-red-400 dark:hover:bg-red-500/20"
          >
            <RefreshCw className="mr-1.5 h-4 w-4" />
            Try Again
          </Button>
        </div>
      ) : services.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center">
          <p className="mb-1 font-medium text-foreground">No services found</p>
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
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onSelect={handleSelectService}
            />
          ))}
        </div>
      )}
    </div>
  )
}
