import type { Metadata } from 'next'
import { getFacilities } from '@/lib/data'

export const metadata: Metadata = {
  title: 'Facilities | Member Portal',
}
import { BrowseContent } from './browse-content'

export default async function FacilityBrowsePage() {
  const facilities = await getFacilities()

  return (
    <BrowseContent
      facilities={facilities.map((f) => ({
        id: f.id,
        name: f.name,
        category: f.category,
        description: f.description,
        imageUrl: f.imageUrl,
        capacity: f.capacity,
        amenities: f.amenities as string[],
        memberRate: f.memberRate,
        guestRate: f.guestRate,
        bookingDuration: f.bookingDuration,
        resourceCount: f.resourceCount,
      }))}
    />
  )
}
