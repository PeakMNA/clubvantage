import type { Metadata } from 'next'
import { getPreferences } from './actions'
import { PreferencesContent } from './preferences-content'

export const metadata: Metadata = {
  title: 'Preferences | Member Portal',
}

export default async function PreferencesPage() {
  const prefs = await getPreferences()
  return <PreferencesContent initial={prefs} />
}
