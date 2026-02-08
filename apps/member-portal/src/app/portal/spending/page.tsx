import type { Metadata } from 'next'
import { getSpendingSummary } from '@/lib/data/spending'
import { SpendingContent } from './spending-content'

export const metadata: Metadata = {
  title: 'Spending | Member Portal',
}

export default async function SpendingPage() {
  const summary = await getSpendingSummary()
  return <SpendingContent summary={summary} />
}
