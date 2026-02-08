import type { Metadata } from 'next'
import { getEditableProfile } from './actions'
import { EditProfileForm } from './edit-profile-form'

export const metadata: Metadata = {
  title: 'Edit Profile | Member Portal',
}

export default async function EditProfilePage() {
  const profile = await getEditableProfile()
  return <EditProfileForm profile={profile} />
}
