import type { Metadata } from 'next'
import { getDirectoryMembers } from '@/lib/data/directory'
import { DirectoryContent } from './directory-content'

export const metadata: Metadata = {
  title: 'Directory | Member Portal',
}

export default async function DirectoryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const members = await getDirectoryMembers(q)
  return <DirectoryContent members={members} initialSearch={q ?? ''} />
}
