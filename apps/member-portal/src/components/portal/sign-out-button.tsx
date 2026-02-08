'use client'

import { LogOut } from 'lucide-react'
import { useAuthContext } from '@/components/providers'

export function SignOutButton() {
  const { signOut } = useAuthContext()

  return (
    <button
      onClick={signOut}
      className="w-full py-4 text-left active:opacity-70 transition-opacity"
    >
      <div className="flex items-center gap-3">
        <LogOut className="h-5 w-5 text-red-500" />
        <span className="text-[15px] text-red-600 font-medium">Sign Out</span>
      </div>
    </button>
  )
}
