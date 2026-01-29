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

// Dynamic imports for member modals - only load when needed
export const DynamicAddMemberModal = dynamic(
  () => import('./add-member-modal').then((mod) => mod.AddMemberModal),
  { loading: () => <ModalLoadingFallback />, ssr: false }
)

export const DynamicDependentModal = dynamic(
  () => import('./dependent-modal').then((mod) => mod.DependentModal),
  { loading: () => <ModalLoadingFallback />, ssr: false }
)

export const DynamicChargeModal = dynamic(
  () => import('./charge-modal').then((mod) => mod.ChargeModal),
  { loading: () => <ModalLoadingFallback />, ssr: false }
)
