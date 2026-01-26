'use client'

import { useState, useEffect } from 'react'
import { cn, Button, Badge } from '@clubvantage/ui'
import { AlertCircle, ArrowLeft, RefreshCw, Search } from 'lucide-react'
import Link from 'next/link'
import { BrowseCategories } from '@/components/portal/bookings'
import type { BookingCategory } from '@/lib/types'
import { fetchCategories } from '../bookings/actions'

export default function BrowseBookPage() {
  const [categories, setCategories] = useState<BookingCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const loadCategories = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await fetchCategories()
      setCategories(data)
    } catch (err) {
      console.error('Failed to load categories:', err)
      setError('Unable to load booking categories. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadCategories()
  }, [])

  const handleSelectCategory = (category: BookingCategory) => {
    if (category.type === 'facility') {
      const typeParam = category.facilityTypes?.[0] || ''
      window.location.href = `/portal/book/facilities${typeParam ? `?type=${typeParam}` : ''}`
    } else {
      const catParam = category.serviceCategories?.[0] || ''
      window.location.href = `/portal/book/services${catParam ? `?category=${catParam}` : ''}`
    }
  }

  return (
    <div className="flex flex-col gap-6 p-4 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/portal">
          <button className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </button>
        </Link>
        <h1 className="text-xl font-bold text-foreground">Browse & Book</h1>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search facilities and services..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-xl border border-border bg-card py-3 pl-10 pr-4 text-sm placeholder:text-muted-foreground focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20"
        />
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <Link href="/portal/book/facilities">
          <Button variant="outline" size="sm" className="whitespace-nowrap">
            All Facilities
          </Button>
        </Link>
        <Link href="/portal/book/services">
          <Button variant="outline" size="sm" className="whitespace-nowrap">
            All Services
          </Button>
        </Link>
        <Link href="/portal/golf/book">
          <Button variant="outline" size="sm" className="whitespace-nowrap">
            Golf Tee Times
          </Button>
        </Link>
      </div>

      {/* Categories Grid */}
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
            onClick={loadCategories}
            className="border-red-300 text-red-700 hover:bg-red-100 dark:border-red-500/50 dark:text-red-400 dark:hover:bg-red-500/20"
          >
            <RefreshCw className="mr-1.5 h-4 w-4" />
            Try Again
          </Button>
        </div>
      ) : (
        <BrowseCategories
          categories={categories}
          onSelectCategory={handleSelectCategory}
        />
      )}

      {/* Popular This Week */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">Popular This Week</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Link href="/portal/book/facilities/fac-1">
            <div className="rounded-xl border border-border bg-card p-4 transition-all hover:border-amber-300 hover:shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                  <span className="text-lg">🎾</span>
                </div>
                <div>
                  <p className="font-medium text-foreground">Tennis Court 1</p>
                  <p className="text-xs text-muted-foreground">Sports Complex</p>
                </div>
              </div>
            </div>
          </Link>
          <Link href="/portal/book/services/svc-1">
            <div className="rounded-xl border border-border bg-card p-4 transition-all hover:border-amber-300 hover:shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-pink-100 text-pink-600">
                  <span className="text-lg">💆</span>
                </div>
                <div>
                  <p className="font-medium text-foreground">Thai Massage</p>
                  <p className="text-xs text-muted-foreground">60 min session</p>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
