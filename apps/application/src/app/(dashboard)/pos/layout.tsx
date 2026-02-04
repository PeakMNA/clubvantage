'use client'

import { ReactNode } from 'react'

interface POSLayoutProps {
  children: ReactNode
}

/**
 * POS Section Layout
 *
 * Full-height layout for POS pages that fills the available space
 * within the dashboard main content area.
 */
export default function POSLayout({ children }: POSLayoutProps) {
  return (
    <div className="h-full w-full overflow-hidden">
      {children}
    </div>
  )
}
