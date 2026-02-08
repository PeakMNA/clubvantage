import type { Metadata } from 'next'
import { getClubInfo } from './actions'
import { ContactContent } from './contact-content'

export const metadata: Metadata = {
  title: 'Contact Club | Member Portal',
}

export default async function ContactPage() {
  const club = await getClubInfo()
  return <ContactContent club={club} />
}
