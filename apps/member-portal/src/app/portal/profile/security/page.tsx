import type { Metadata } from 'next'
import { SecurityContent } from './security-content'

export const metadata: Metadata = {
  title: 'Privacy & Security | Member Portal',
}

export default function SecurityPage() {
  return <SecurityContent />
}
