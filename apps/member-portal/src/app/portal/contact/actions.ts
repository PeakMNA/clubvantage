'use server'

import { cache } from 'react'
import { prisma, getClubId } from '@/lib/db'

export const getClubInfo = cache(async () => {
  const clubId = await getClubId()
  const club = await prisma.club.findUnique({
    where: { id: clubId },
    select: {
      name: true,
      address: true,
      phone: true,
      email: true,
      website: true,
    },
  })

  if (!club) throw new Error('Club not found')

  return {
    name: club.name,
    address: club.address,
    phone: club.phone,
    email: club.email,
    website: club.website,
  }
})
