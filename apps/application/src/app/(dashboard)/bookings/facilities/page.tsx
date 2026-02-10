'use client'

import { useMemo } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { FacilitiesTab } from '@/components/bookings/tabs'
import {
  createFacility,
  updateFacility,
  deleteFacility,
} from '../actions'
import { useGetFacilitiesQuery } from '@clubvantage/api-client'
import type { CreateFacilityInput, UpdateFacilityInput, ResourceTypeEnum } from '@clubvantage/api-client'

export default function BookingsFacilitiesPage() {
  const queryClient = useQueryClient()

  const { data, isLoading } = useGetFacilitiesQuery()

  const facilities = useMemo(() => {
    if (!data?.facilities) return undefined

    const typeMap: Record<string, 'court' | 'spa' | 'studio' | 'pool' | 'room'> = {
      COURT: 'court',
      SPA: 'spa',
      STUDIO: 'studio',
      POOL: 'pool',
      ROOM: 'room',
    }

    return data.facilities.map((f) => ({
      id: f.id,
      name: f.name,
      type: typeMap[f.type] || 'room',
      location: f.location ?? '',
      status: f.isActive ? ('available' as const) : ('closed' as const),
      schedule: {
        openTime: '6:00 AM',
        closeTime: '9:00 PM',
        bookingsToday: 0,
        capacityToday: f.capacity ?? 1,
      },
    }))
  }, [data])

  return (
    <div className="p-4 sm:p-6">
      <FacilitiesTab
        facilities={facilities}
        isLoading={isLoading}
        onViewSchedule={(id) => console.log('View schedule:', id)}
        onToggleStatus={(id) => console.log('Toggle status:', id)}
        onSetMaintenance={(id) => console.log('Set maintenance:', id)}
        onCreateFacility={async (data) => {
          const typeMap: Record<string, ResourceTypeEnum> = {
            court: 'COURT' as ResourceTypeEnum,
            spa: 'SPA' as ResourceTypeEnum,
            studio: 'STUDIO' as ResourceTypeEnum,
            pool: 'POOL' as ResourceTypeEnum,
            room: 'ROOM' as ResourceTypeEnum,
          }
          const input: CreateFacilityInput = {
            name: data.name,
            type: typeMap[data.type] || ('ROOM' as ResourceTypeEnum),
            location: data.location,
            capacity: data.capacity,
            description: data.description || undefined,
            features: data.features.length > 0 ? data.features : undefined,
            operatingHours: data.operatingHours.map((h) => ({
              dayOfWeek: h.dayOfWeek,
              isOpen: h.isOpen,
              openTime: h.openTime || undefined,
              closeTime: h.closeTime || undefined,
            })),
            isActive: data.isActive,
          }
          const result = await createFacility(input)
          if (result.success) {
            toast.success('Facility created successfully')
            queryClient.invalidateQueries({ queryKey: ['GetFacilities'] })
          } else {
            toast.error(result.error || 'Failed to create facility')
            throw new Error(result.error)
          }
        }}
        onUpdateFacility={async (data) => {
          if (!data.id) return
          const typeMap: Record<string, ResourceTypeEnum> = {
            court: 'COURT' as ResourceTypeEnum,
            spa: 'SPA' as ResourceTypeEnum,
            studio: 'STUDIO' as ResourceTypeEnum,
            pool: 'POOL' as ResourceTypeEnum,
            room: 'ROOM' as ResourceTypeEnum,
          }
          const input: UpdateFacilityInput = {
            id: data.id,
            name: data.name || undefined,
            type: data.type ? typeMap[data.type] : undefined,
            location: data.location || undefined,
            capacity: data.capacity || undefined,
            description: data.description || undefined,
            features: data.features.length > 0 ? data.features : undefined,
            operatingHours: data.operatingHours.map((h) => ({
              dayOfWeek: h.dayOfWeek,
              isOpen: h.isOpen,
              openTime: h.openTime || undefined,
              closeTime: h.closeTime || undefined,
            })),
            isActive: data.isActive,
          }
          const result = await updateFacility(input)
          if (result.success) {
            toast.success('Facility updated successfully')
            queryClient.invalidateQueries({ queryKey: ['GetFacilities'] })
          } else {
            toast.error(result.error || 'Failed to update facility')
            throw new Error(result.error)
          }
        }}
        onDeleteFacility={async (id) => {
          const result = await deleteFacility(id)
          if (result.success) {
            toast.success('Facility deleted successfully')
            queryClient.invalidateQueries({ queryKey: ['GetFacilities'] })
          } else {
            toast.error(result.error || 'Failed to delete facility')
            throw new Error(result.error)
          }
        }}
      />
    </div>
  )
}
