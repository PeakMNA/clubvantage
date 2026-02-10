'use client'

/**
 * Bookings Tab — view all bookings with multiple view modes.
 * Views: Cards, List, Day, Week, Month.
 * TODO: Wire multi-view with real data, filters, pagination.
 */
export default function BookingsListPage() {
  return (
    <div className="flex h-full flex-col gap-4 p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">All Bookings</h2>
        <p className="text-sm text-muted-foreground">Multi-view bookings list — coming next</p>
      </div>
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex animate-pulse items-center gap-4 rounded-lg border border-border bg-card p-4"
          >
            <div className="h-10 w-10 rounded-full bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-48 rounded bg-muted" />
              <div className="h-3 w-32 rounded bg-muted" />
            </div>
            <div className="h-6 w-20 rounded-full bg-muted" />
          </div>
        ))}
      </div>
    </div>
  )
}
