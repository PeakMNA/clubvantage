import type { Metadata } from 'next'
import { getScorecards, getScorecardStats } from '@/lib/data/scorecards'
import { ScorecardListContent } from './scorecard-list-content'

export const metadata: Metadata = {
  title: 'Scorecards | Member Portal',
}

export default async function ScorecardListPage() {
  const [scorecards, stats] = await Promise.all([
    getScorecards(),
    getScorecardStats(),
  ])
  return <ScorecardListContent scorecards={scorecards} stats={stats} />
}
