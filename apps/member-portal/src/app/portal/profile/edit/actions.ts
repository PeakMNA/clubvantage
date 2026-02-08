'use server'

import { prisma, getMemberId } from '@/lib/db'

export async function updateProfile(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const memberId = await getMemberId()

  const firstName = formData.get('firstName') as string
  const lastName = formData.get('lastName') as string
  const email = formData.get('email') as string
  const phone = formData.get('phone') as string
  const address = formData.get('address') as string
  const emergencyContact = formData.get('emergencyContact') as string
  const emergencyPhone = formData.get('emergencyPhone') as string

  if (!firstName?.trim() || !lastName?.trim()) {
    return { success: false, error: 'First and last name are required' }
  }

  await prisma.member.update({
    where: { id: memberId },
    data: {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email?.trim() || null,
      phone: phone?.trim() || null,
      address: address?.trim() || null,
      emergencyContact: emergencyContact?.trim() || null,
      emergencyPhone: emergencyPhone?.trim() || null,
    },
  })

  return { success: true }
}

export async function getEditableProfile() {
  const memberId = await getMemberId()
  const member = await prisma.member.findUnique({
    where: { id: memberId },
    select: {
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      dateOfBirth: true,
      address: true,
      emergencyContact: true,
      emergencyPhone: true,
      memberId: true,
      membershipType: { select: { name: true } },
    },
  })

  if (!member) throw new Error('Member not found')

  return {
    firstName: member.firstName,
    lastName: member.lastName,
    email: member.email ?? '',
    phone: member.phone ?? '',
    dateOfBirth: member.dateOfBirth?.toISOString().split('T')[0] ?? '',
    address: member.address ?? '',
    emergencyContact: member.emergencyContact ?? '',
    emergencyPhone: member.emergencyPhone ?? '',
    memberId: member.memberId,
    membershipType: member.membershipType.name,
  }
}
