import type { Metadata } from 'next'
import { getMemberProfile } from '@/lib/data'

export const metadata: Metadata = {
  title: 'Member ID | Member Portal',
}
import { MemberIdContent } from './member-id-content'

export default async function MemberIdPage() {
  const member = await getMemberProfile()

  return (
    <MemberIdContent
      member={{
        id: member.memberId,
        name: `${member.firstName} ${member.lastName}`.toUpperCase(),
        type: member.membershipType,
        memberSince: String(member.joinDate.getFullYear()),
        dependentCount: member.dependentCount,
        status: member.status,
      }}
    />
  )
}
