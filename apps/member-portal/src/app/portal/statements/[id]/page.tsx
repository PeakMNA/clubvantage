import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getStatementById } from '@/lib/data'
import { StatementDetailContent } from './statement-detail-content'

export const metadata: Metadata = {
  title: 'Statement Detail | Member Portal',
}

export default async function StatementDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const statement = await getStatementById(id)

  if (!statement) {
    notFound()
  }

  return <StatementDetailContent statement={statement} />
}
