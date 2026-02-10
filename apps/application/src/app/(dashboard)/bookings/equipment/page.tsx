'use client'

import { EquipmentTab } from '@/components/bookings/tabs'

export default function BookingsEquipmentPage() {
  return (
    <div className="p-4 sm:p-6">
      <EquipmentTab
        onViewDetails={(id) => console.log('View equipment details:', id)}
        onCheckOut={(id) => console.log('Check out equipment:', id)}
        onCheckIn={(id) => console.log('Check in equipment:', id)}
        onSetMaintenance={(id) => console.log('Set maintenance:', id)}
      />
    </div>
  )
}
