import type { Metadata } from 'next'
import { Suspense } from 'react'
import FacilitiesListPage from './facilities-content'

export const metadata: Metadata = {
  title: 'Browse Facilities | Member Portal',
}

export default function Page() {
  return (
    <Suspense>
      <FacilitiesListPage />
    </Suspense>
  )
}
