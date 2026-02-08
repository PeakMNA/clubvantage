import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getDirectoryMember } from '@/lib/data/directory'
import { MemberProfileContent } from './member-profile-content'

export const metadata: Metadata = {
  title: 'Member Profile | Member Portal',
}

export default async function MemberProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const member = await getDirectoryMember(id)

  if (!member) {
    notFound()
  }

  return <MemberProfileContent member={member} />
}
