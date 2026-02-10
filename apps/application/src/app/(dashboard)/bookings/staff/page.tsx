'use client'

import { useMemo } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { StaffTab } from '@/components/bookings/tabs'
import {
  createStaffMember,
  updateStaffMember,
  deleteStaffMember,
} from '../actions'
import { useGetBookingStaffQuery } from '@clubvantage/api-client'
import type { CreateStaffMemberInput, UpdateStaffMemberInput } from '@clubvantage/api-client'

export default function BookingsStaffPage() {
  const queryClient = useQueryClient()

  const { data, isLoading } = useGetBookingStaffQuery()

  const staff = useMemo(() => {
    if (!data?.bookingStaff) return undefined

    const roleMap: Record<string, 'therapist' | 'trainer' | 'instructor' | 'coach'> = {
      THERAPIST: 'therapist',
      TRAINER: 'trainer',
      INSTRUCTOR: 'instructor',
      COACH: 'coach',
    }

    return data.bookingStaff.map((s) => ({
      id: s.id,
      name: `${s.firstName} ${s.lastName}`,
      photoUrl: s.photoUrl ?? undefined,
      role: roleMap[s.role?.toUpperCase() ?? ''] || 'therapist',
      status: s.isActive ? ('available' as const) : ('off_duty' as const),
      specialties: s.capabilities ?? [],
      services: [] as string[],
      schedule: {
        startTime: '9:00 AM',
        endTime: '6:00 PM',
        bookingsToday: 0,
        hoursBooked: 0,
        hoursAvailable: 8,
      },
    }))
  }, [data])

  return (
    <div className="p-4 sm:p-6">
      <StaffTab
        staff={staff}
        isLoading={isLoading}
        onViewSchedule={(id) => console.log('View staff schedule:', id)}
        onSetAvailability={(id) => console.log('Set availability:', id)}
        onCreateStaff={async (data) => {
          const input: CreateStaffMemberInput = {
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email || undefined,
            phone: data.phone || undefined,
            avatarUrl: data.avatarUrl || undefined,
            userId: data.userId || undefined,
            defaultFacilityId: data.defaultFacilityId || undefined,
            isActive: data.isActive,
            capabilities: data.capabilities.length > 0 ? data.capabilities.map((c) => ({
              capability: c.capability,
              level: c.level,
            })) : undefined,
            certifications: data.certifications.length > 0 ? data.certifications.map((c) => ({
              name: c.name,
              expiresAt: c.expiresAt,
            })) : undefined,
            workingHours: data.workingHours.map((h) => ({
              dayOfWeek: h.dayOfWeek,
              isOpen: h.isOpen,
              openTime: h.openTime || undefined,
              closeTime: h.closeTime || undefined,
            })),
          }
          const result = await createStaffMember(input)
          if (result.success) {
            toast.success('Staff member created successfully')
            queryClient.invalidateQueries({ queryKey: ['GetBookingStaff'] })
          } else {
            toast.error(result.error || 'Failed to create staff member')
            throw new Error(result.error)
          }
        }}
        onUpdateStaff={async (data) => {
          if (!data.id) return
          const input: UpdateStaffMemberInput = {
            id: data.id,
            firstName: data.firstName || undefined,
            lastName: data.lastName || undefined,
            email: data.email || undefined,
            phone: data.phone || undefined,
            avatarUrl: data.avatarUrl || undefined,
            userId: data.userId || undefined,
            defaultFacilityId: data.defaultFacilityId || undefined,
            isActive: data.isActive,
            capabilities: data.capabilities.length > 0 ? data.capabilities.map((c) => ({
              capability: c.capability,
              level: c.level,
            })) : undefined,
            certifications: data.certifications.length > 0 ? data.certifications.map((c) => ({
              name: c.name,
              expiresAt: c.expiresAt,
            })) : undefined,
            workingHours: data.workingHours.map((h) => ({
              dayOfWeek: h.dayOfWeek,
              isOpen: h.isOpen,
              openTime: h.openTime || undefined,
              closeTime: h.closeTime || undefined,
            })),
          }
          const result = await updateStaffMember(input)
          if (result.success) {
            toast.success('Staff member updated successfully')
            queryClient.invalidateQueries({ queryKey: ['GetBookingStaff'] })
          } else {
            toast.error(result.error || 'Failed to update staff member')
            throw new Error(result.error)
          }
        }}
        onDeleteStaff={async (id) => {
          const result = await deleteStaffMember(id)
          if (result.success) {
            toast.success('Staff member deleted successfully')
            queryClient.invalidateQueries({ queryKey: ['GetBookingStaff'] })
          } else {
            toast.error(result.error || 'Failed to delete staff member')
            throw new Error(result.error)
          }
        }}
      />
    </div>
  )
}
