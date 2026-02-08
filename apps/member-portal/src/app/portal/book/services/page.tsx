import type { Metadata } from 'next'
import { Suspense } from 'react'
import ServicesListPage from './services-content'

export const metadata: Metadata = {
  title: 'Browse Services | Member Portal',
}

export default function Page() {
  return (
    <Suspense>
      <ServicesListPage />
    </Suspense>
  )
}
