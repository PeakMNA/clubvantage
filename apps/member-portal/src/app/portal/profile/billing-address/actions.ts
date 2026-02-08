'use server'

import { prisma, getMemberId } from '@/lib/db'

export interface BillingAddressData {
  id: string | null
  addressLine1: string
  addressLine2: string
  subDistrict: string
  district: string
  province: string
  postalCode: string
  country: string
}

export async function getBillingAddress(): Promise<BillingAddressData> {
  const memberId = await getMemberId()

  const address = await prisma.memberAddress.findFirst({
    where: {
      memberId,
      type: { in: ['BILLING', 'BOTH'] },
      isPrimary: true,
    },
  })

  // Fallback to any billing address
  const fallback = address ?? await prisma.memberAddress.findFirst({
    where: {
      memberId,
      type: { in: ['BILLING', 'BOTH'] },
    },
  })

  if (!fallback) {
    return {
      id: null,
      addressLine1: '',
      addressLine2: '',
      subDistrict: '',
      district: '',
      province: '',
      postalCode: '',
      country: 'Thailand',
    }
  }

  return {
    id: fallback.id,
    addressLine1: fallback.addressLine1,
    addressLine2: fallback.addressLine2 ?? '',
    subDistrict: fallback.subDistrict,
    district: fallback.district,
    province: fallback.province,
    postalCode: fallback.postalCode,
    country: fallback.country,
  }
}

export async function updateBillingAddress(
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  const memberId = await getMemberId()

  const id = formData.get('id') as string | null
  const addressLine1 = (formData.get('addressLine1') as string)?.trim()
  const addressLine2 = (formData.get('addressLine2') as string)?.trim()
  const subDistrict = (formData.get('subDistrict') as string)?.trim()
  const district = (formData.get('district') as string)?.trim()
  const province = (formData.get('province') as string)?.trim()
  const postalCode = (formData.get('postalCode') as string)?.trim()
  const country = (formData.get('country') as string)?.trim() || 'Thailand'

  if (!addressLine1 || !subDistrict || !district || !province || !postalCode) {
    return { success: false, error: 'Please fill in all required fields' }
  }

  const data = {
    addressLine1,
    addressLine2: addressLine2 || null,
    subDistrict,
    district,
    province,
    postalCode,
    country,
    type: 'BILLING' as const,
    isPrimary: true,
    label: 'Billing',
  }

  if (id) {
    await prisma.memberAddress.update({
      where: { id },
      data,
    })
  } else {
    await prisma.memberAddress.create({
      data: {
        ...data,
        memberId,
      },
    })
  }

  return { success: true }
}
