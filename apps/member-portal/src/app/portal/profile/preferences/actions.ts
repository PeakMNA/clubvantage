'use server'

import { prisma, getMemberId } from '@/lib/db'

export interface PreferencesData {
  emailPromotions: boolean
  smsPromotions: boolean
  pushNotifications: boolean
  unsubscribedCategories: string[]
}

const CATEGORIES = ['billing', 'bookings', 'golf', 'events', 'dining', 'club'] as const

export async function getPreferences(): Promise<PreferencesData> {
  const memberId = await getMemberId()
  const prefs = await prisma.memberCommunicationPrefs.findUnique({
    where: { memberId },
  })

  return {
    emailPromotions: prefs?.emailPromotions ?? true,
    smsPromotions: prefs?.smsPromotions ?? false,
    pushNotifications: prefs?.pushNotifications ?? true,
    unsubscribedCategories: prefs?.unsubscribedCategories ?? [],
  }
}

export async function updatePreferences(formData: FormData): Promise<{ success: boolean }> {
  const memberId = await getMemberId()

  const emailPromotions = formData.get('emailPromotions') === 'true'
  const smsPromotions = formData.get('smsPromotions') === 'true'
  const pushNotifications = formData.get('pushNotifications') === 'true'

  // Collect unsubscribed categories
  const unsubscribedCategories: string[] = []
  for (const cat of CATEGORIES) {
    if (formData.get(`cat_${cat}`) !== 'true') {
      unsubscribedCategories.push(cat)
    }
  }

  await prisma.memberCommunicationPrefs.upsert({
    where: { memberId },
    update: {
      emailPromotions,
      smsPromotions,
      pushNotifications,
      unsubscribedCategories,
    },
    create: {
      memberId,
      emailPromotions,
      smsPromotions,
      pushNotifications,
      unsubscribedCategories,
    },
  })

  return { success: true }
}
