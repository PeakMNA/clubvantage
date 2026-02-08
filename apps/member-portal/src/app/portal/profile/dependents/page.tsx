import type { Metadata } from 'next'
import { getDependents } from './actions'
import { DependentsContent } from './dependents-content'

export const metadata: Metadata = {
  title: 'Dependents | Member Portal',
}

export default async function DependentsPage() {
  const dependents = await getDependents()
  return <DependentsContent dependents={dependents} />
}
