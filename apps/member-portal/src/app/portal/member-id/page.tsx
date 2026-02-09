import type { Metadata } from 'next'
import { getMemberProfile } from '@/lib/data'
import { getClubInfo } from '@/app/portal/contact/actions'

export const metadata: Metadata = {
  title: 'Member ID | Member Portal',
}
import { MemberIdContent } from './member-id-content'

export default async function MemberIdPage() {
  const [member, club] = await Promise.all([getMemberProfile(), getClubInfo()])

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
      clubName={club.name}
    />
  )
}
