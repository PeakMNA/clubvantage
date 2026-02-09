'use client'

import { Plus } from 'lucide-react'
import { PageHeader, Button } from '@clubvantage/ui'
import {
  BookingProvider,
  useBooking,
  CreateBookingModal,
} from '@/components/bookings'

function BookingsLayoutContent({ children }: { children: React.ReactNode }) {
  const { openWizard } = useBooking()

  return (
    <div className="flex h-full flex-col">
      <div className="shrink-0 p-6 pb-0">
        <PageHeader
          title="Bookings"
          description="Manage facility bookings and service appointments"
          breadcrumbs={[{ label: 'Bookings' }]}
          actions={
            <Button onClick={() => openWizard(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Booking
            </Button>
          }
        />
      </div>

      <div className="flex-1 overflow-hidden px-6 pb-6">
        {children}
      </div>

      <CreateBookingModal />
    </div>
  )
}

export default function BookingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <BookingProvider>
      <BookingsLayoutContent>{children}</BookingsLayoutContent>
    </BookingProvider>
  )
}
