'use client'

/**
 * Service Tab — POS-style panel with service cards.
 * Select service → staff schedule → facility → confirm.
 * TODO: Wire POS panel, staff schedule, booking creation sheet.
 */
export default function BookingsServicePage() {
  return (
    <div className="flex h-full flex-col gap-4 p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Service Bookings</h2>
        <p className="text-sm text-muted-foreground">POS-style service panel — coming next</p>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="flex h-32 animate-pulse flex-col items-center justify-center rounded-xl border border-border bg-muted/30"
          >
            <div className="mb-2 h-8 w-8 rounded-lg bg-muted" />
            <div className="h-3 w-16 rounded bg-muted" />
            <div className="mt-1 h-2 w-12 rounded bg-muted" />
          </div>
        ))}
      </div>
    </div>
  )
}
