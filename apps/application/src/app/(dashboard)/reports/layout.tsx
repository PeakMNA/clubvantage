'use client'

import { useState, useCallback } from 'react'
import { RefreshCw } from 'lucide-react'
import { cn } from '@clubvantage/ui'
import { formatDistanceToNow } from 'date-fns'
import { ExportMenu, DateRangePicker } from '@/components/reports'

export default function ReportsLayout({ children }: { children: React.ReactNode }) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date; preset?: string }>({
    start: new Date(new Date().setDate(1)),
    end: new Date(),
    preset: 'this-month',
  })

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setLastUpdated(new Date())
    setIsRefreshing(false)
  }, [])

  const handleExport = useCallback((format: 'csv' | 'pdf' | 'gl') => {
    console.log(`Exporting data as ${format}`)
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-semibold text-foreground">Reports</h1>
            {lastUpdated && (
              <span className="text-sm text-muted-foreground">
                Updated {formatDistanceToNow(lastUpdated, { addSuffix: true })}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className={cn(
                'rounded-lg border border-stone-200 p-2 text-stone-600 transition-colors hover:border-stone-300 hover:text-stone-900 disabled:opacity-50',
                isRefreshing && 'cursor-not-allowed'
              )}
              title="Refresh data"
            >
              <RefreshCw className={cn('h-4 w-4', isRefreshing && 'animate-spin')} />
            </button>
            <DateRangePicker value={dateRange} onChange={setDateRange} />
            <ExportMenu dateRange={dateRange} onExport={handleExport} />
          </div>
        </div>
      </header>
      <main className="px-6 py-6">{children}</main>
    </div>
  )
}
