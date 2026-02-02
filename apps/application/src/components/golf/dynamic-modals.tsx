'use client'

import dynamic from 'next/dynamic'
import { Loader2 } from 'lucide-react'

// Loading fallback for modals
function ModalLoadingFallback() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="flex items-center gap-3 rounded-lg bg-white p-4 shadow-lg">
        <Loader2 className="h-5 w-5 animate-spin text-amber-500" />
        <span className="text-sm text-stone-600">Loading...</span>
      </div>
    </div>
  )
}

// Dynamic imports for golf modals - only load when needed
export const DynamicBookTeeTimeModal = dynamic(
  () => import('./book-tee-time-modal').then((mod) => mod.BookTeeTimeModal),
  { loading: () => <ModalLoadingFallback />, ssr: false }
)

export const DynamicSettlementModal = dynamic(
  () => import('./settlement-modal').then((mod) => mod.SettlementModal),
  { loading: () => <ModalLoadingFallback />, ssr: false }
)

export const DynamicCourseModal = dynamic(
  () => import('./course-modal').then((mod) => mod.CourseModal),
  { loading: () => <ModalLoadingFallback />, ssr: false }
)

export const DynamicCartModal = dynamic(
  () => import('./cart-modal').then((mod) => mod.CartModal),
  { loading: () => <ModalLoadingFallback />, ssr: false }
)

export const DynamicCartMaintenanceModal = dynamic(
  () => import('./cart-maintenance-modal').then((mod) => mod.CartMaintenanceModal),
  { loading: () => <ModalLoadingFallback />, ssr: false }
)

export const DynamicCaddyModal = dynamic(
  () => import('./caddy-modal').then((mod) => mod.CaddyModal),
  { loading: () => <ModalLoadingFallback />, ssr: false }
)

export const DynamicCaddyScheduleModal = dynamic(
  () => import('./caddy-schedule-modal').then((mod) => mod.CaddyScheduleModal),
  { loading: () => <ModalLoadingFallback />, ssr: false }
)
