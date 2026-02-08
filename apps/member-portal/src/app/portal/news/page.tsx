import type { Metadata } from 'next'
import { getAnnouncements } from '@/lib/data/news'
import { NewsContent } from './news-content'

export const metadata: Metadata = {
  title: 'News | Member Portal',
}

export default async function NewsPage() {
  const announcements = await getAnnouncements()
  return <NewsContent announcements={announcements} />
}
