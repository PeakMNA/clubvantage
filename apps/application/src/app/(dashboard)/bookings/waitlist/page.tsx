'use client'

import { useMemo } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { WaitlistTab } from '@/components/bookings/tabs'
import {
  useGetWaitlistQuery,
  useSendWaitlistOfferMutation,
  useRemoveFromWaitlistMutation,
} from '@clubvantage/api-client'

/** Map API WaitlistStatus enum to component lowercase status */
const statusMap: Record<string, 'waiting' | 'notified' | 'converted' | 'expired' | 'cancelled'> = {
  WAITING: 'waiting',
  OFFER_SENT: 'notified',
  ACCEPTED: 'converted',
  DECLINED: 'cancelled',
  EXPIRED: 'expired',
}

export default function BookingsWaitlistPage() {
  const queryClient = useQueryClient()

  const { data, isLoading } = useGetWaitlistQuery()

  const sendOffer = useSendWaitlistOfferMutation()
  const removeEntry = useRemoveFromWaitlistMutation()

  const entries = useMemo(() => {
    if (!data?.waitlist?.edges) return undefined

    return data.waitlist.edges.map(({ node }) => ({
      id: node.id,
      member: {
        id: node.member.id,
        name: `${node.member.firstName} ${node.member.lastName}`,
        photoUrl: node.member.photoUrl ?? undefined,
        memberNumber: node.member.memberId,
      },
      serviceType: (node.serviceName ? 'service' : 'facility') as 'service' | 'facility',
      serviceName: node.serviceName || node.facilityName || 'Unknown',
      preferredDate: new Date(node.requestedDate),
      preferredTimeRange: node.requestedTime,
      position: node.position,
      status: statusMap[node.status] || 'waiting',
      createdAt: new Date(node.createdAt),
      expiresAt: node.offerExpiresAt ? new Date(node.offerExpiresAt) : undefined,
      notes: node.notes ?? undefined,
    }))
  }, [data])

  return (
    <div className="p-4 sm:p-6">
      <WaitlistTab
        entries={entries}
        isLoading={isLoading}
        onNotify={async (id) => {
          try {
            const result = await sendOffer.mutateAsync({
              input: { entryId: id },
            })
            if (result.sendWaitlistOffer.success) {
              toast.success('Waitlist offer sent successfully')
              queryClient.invalidateQueries({ queryKey: ['GetWaitlist'] })
            } else {
              toast.error(result.sendWaitlistOffer.error || 'Failed to send offer')
            }
          } catch {
            toast.error('Failed to send waitlist offer')
          }
        }}
        onConvert={(id) => {
          console.log('Convert:', id)
        }}
        onRemove={async (id) => {
          try {
            const result = await removeEntry.mutateAsync({
              input: { entryId: id },
            })
            if (result.removeFromWaitlist.success) {
              toast.success('Removed from waitlist')
              queryClient.invalidateQueries({ queryKey: ['GetWaitlist'] })
            } else {
              toast.error(result.removeFromWaitlist.error || 'Failed to remove from waitlist')
            }
          } catch {
            toast.error('Failed to remove from waitlist')
          }
        }}
      />
    </div>
  )
}
