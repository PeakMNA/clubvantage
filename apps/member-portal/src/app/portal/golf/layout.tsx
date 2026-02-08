import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Golf | Member Portal',
}

export default function GolfLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
