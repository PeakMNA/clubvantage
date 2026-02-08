import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getScorecardById } from '@/lib/data/scorecards'
import { ScorecardDetailContent } from './scorecard-detail-content'

export const metadata: Metadata = {
  title: 'Scorecard Detail | Member Portal',
}

export default async function ScorecardDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const scorecard = await getScorecardById(id)

  if (!scorecard) {
    notFound()
  }

  return <ScorecardDetailContent scorecard={scorecard} />
}
