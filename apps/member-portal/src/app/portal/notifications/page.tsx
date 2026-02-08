import type { Metadata } from 'next'
import { getNotifications } from '@/lib/data'
import { NotificationsContent } from './notifications-content'

export const metadata: Metadata = {
  title: 'Notifications | Member Portal',
}

export default async function NotificationsPage() {
  const notifications = await getNotifications()

  return <NotificationsContent notifications={notifications} />
}
