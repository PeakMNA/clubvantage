'use server'

import { prisma, getMemberId } from '@/lib/db'

export interface DependentData {
  id: string
  firstName: string
  lastName: string
  relationship: string
  dateOfBirth: string | null
  email: string
  phone: string
  isActive: boolean
}

export async function getDependents(): Promise<DependentData[]> {
  const memberId = await getMemberId()
  const dependents = await prisma.dependent.findMany({
    where: { memberId },
    orderBy: { createdAt: 'asc' },
  })

  return dependents.map((d) => ({
    id: d.id,
    firstName: d.firstName,
    lastName: d.lastName,
    relationship: d.relationship,
    dateOfBirth: d.dateOfBirth?.toISOString().split('T')[0] ?? null,
    email: d.email ?? '',
    phone: d.phone ?? '',
    isActive: d.isActive,
  }))
}

export async function addDependent(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const memberId = await getMemberId()

  const firstName = formData.get('firstName') as string
  const lastName = formData.get('lastName') as string
  const relationship = formData.get('relationship') as string

  if (!firstName?.trim() || !lastName?.trim() || !relationship?.trim()) {
    return { success: false, error: 'Name and relationship are required' }
  }

  const email = formData.get('email') as string
  const phone = formData.get('phone') as string
  const dateOfBirth = formData.get('dateOfBirth') as string

  await prisma.dependent.create({
    data: {
      memberId,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      relationship: relationship.trim(),
      email: email?.trim() || null,
      phone: phone?.trim() || null,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
    },
  })

  return { success: true }
}

export async function removeDependent(dependentId: string): Promise<{ success: boolean; error?: string }> {
  const memberId = await getMemberId()

  // Verify ownership
  const dependent = await prisma.dependent.findFirst({
    where: { id: dependentId, memberId },
  })

  if (!dependent) {
    return { success: false, error: 'Dependent not found' }
  }

  await prisma.dependent.update({
    where: { id: dependentId },
    data: { isActive: false },
  })

  return { success: true }
}
