'use client'

/**
 * Staff Tab — staff schedule view for booking.
 * See all staff with their day schedule, click open slot to book.
 * Flow: Pick staff + time → pick service → pick facility → confirm.
 * TODO: Wire staff schedule, service picker, booking creation sheet.
 */
export default function BookingsStaffPage() {
  return (
    <div className="flex h-full flex-col gap-4 p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Staff Schedule</h2>
        <p className="text-sm text-muted-foreground">Staff schedule with booking — coming next</p>
      </div>
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex animate-pulse items-start gap-4 rounded-lg border border-border bg-card p-4"
          >
            <div className="h-12 w-12 shrink-0 rounded-full bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 rounded bg-muted" />
              <div className="h-3 w-24 rounded bg-muted" />
              <div className="mt-2 flex gap-1">
                {Array.from({ length: 8 }).map((_, j) => (
                  <div key={j} className="h-8 w-16 rounded bg-muted/50" />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
