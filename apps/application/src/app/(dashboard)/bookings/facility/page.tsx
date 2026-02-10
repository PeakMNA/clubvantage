'use client'

import { CalendarDayViewSkeleton } from '@/components/bookings'

/**
 * Facility Tab — calendar grid by facility type.
 * Click empty slot → new booking, occupied → booking detail.
 * TODO: Wire real calendar grid with facility type sub-tabs.
 */
export default function BookingsFacilityPage() {
  return (
    <div className="flex h-full flex-col gap-4 p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Facility Bookings</h2>
        <p className="text-sm text-muted-foreground">Calendar grid by facility type — coming next</p>
      </div>
      <CalendarDayViewSkeleton resourceCount={4} className="flex-1" />
    </div>
  )
}
