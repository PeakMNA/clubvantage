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
import { useGetStaffMembersQuery } from '@clubvantage/api-client'
import type { CreateStaffMemberInput, UpdateStaffMemberInput } from '@clubvantage/api-client/types'
import type { StaffFormData } from '@/components/bookings/staff-modal'

export default function ManageStaffPage() {
  const queryClient = useQueryClient()

  const { data, isLoading } = useGetStaffMembersQuery()

  const staff = useMemo(() => {
    if (!data?.staffMembers) return undefined

    const todayIndex = String(new Date().getDay())

    return data.staffMembers.map((s) => {
      const todayHours = s.workingHours?.find((h) => h.dayOfWeek === todayIndex)
      const isWorkingToday = todayHours?.isOpen ?? false

      const formatTime = (time?: string | null) => {
        if (!time) return '-'
        const [h, m] = time.split(':')
        const hour = parseInt(h!, 10)
        const ampm = hour >= 12 ? 'PM' : 'AM'
        const h12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
        return `${h12}:${m} ${ampm}`
      }

      const totalHours = isWorkingToday && todayHours?.openTime && todayHours?.closeTime
        ? (() => {
            const [oh, om] = todayHours.openTime!.split(':').map(Number)
            const [ch, cm] = todayHours.closeTime!.split(':').map(Number)
            return ((ch! * 60 + cm!) - (oh! * 60 + om!)) / 60
          })()
        : 0

      return {
        id: s.id,
        name: `${s.firstName} ${s.lastName}`.trim(),
        photoUrl: s.photoUrl ?? undefined,
        role: 'therapist' as const,
        status: s.isActive
          ? (isWorkingToday ? 'available' as const : 'off_duty' as const)
          : ('off_duty' as const),
        specialties: s.capabilities ?? [],
        services: [] as string[],
        schedule: {
          startTime: isWorkingToday ? formatTime(todayHours?.openTime) : '-',
          endTime: isWorkingToday ? formatTime(todayHours?.closeTime) : '-',
          bookingsToday: 0,
          hoursBooked: 0,
          hoursAvailable: totalHours,
        },
        phone: s.phone ?? undefined,
        email: s.email ?? undefined,
        detailedCapabilities: s.detailedCapabilities?.map((c) => ({
          capability: c.capability,
          level: c.level,
        })),
        certifications: s.certifications?.map((c) => ({
          id: c.id,
          name: c.name,
          expiresAt: c.expiresAt ?? undefined,
          status: c.status,
        })),
        workingHours: s.workingHours?.map((h) => ({
          dayOfWeek: h.dayOfWeek,
          isOpen: h.isOpen,
          openTime: h.openTime ?? undefined,
          closeTime: h.closeTime ?? undefined,
        })),
        defaultFacilityId: s.defaultFacilityId ?? undefined,
      }
    })
  }, [data])

  const handleCreateStaff = async (formData: StaffFormData) => {
    const input: CreateStaffMemberInput = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email || undefined,
      phone: formData.phone || undefined,
      avatarUrl: formData.avatarUrl || undefined,
      userId: formData.userId || undefined,
      defaultFacilityId: formData.defaultFacilityId || undefined,
      isActive: formData.isActive,
      capabilities: formData.capabilities.length > 0
        ? formData.capabilities.map((c) => ({
            capability: c.capability,
            level: c.level,
          }))
        : undefined,
      certifications: formData.certifications.length > 0
        ? formData.certifications.map((c) => ({
            name: c.name,
            expiresAt: c.expiresAt || '',
          }))
        : undefined,
      workingHours: formData.workingHours.length > 0
        ? formData.workingHours.map((h) => ({
            dayOfWeek: h.dayOfWeek,
            isOpen: h.isOpen,
            openTime: h.openTime || undefined,
            closeTime: h.closeTime || undefined,
          }))
        : undefined,
    }
    const result = await createStaffMember(input)
    if (result.success) {
      toast.success('Staff member created successfully')
      queryClient.invalidateQueries({ queryKey: ['GetStaffMembers'] })
    } else {
      toast.error(result.error || 'Failed to create staff member')
      throw new Error(result.error)
    }
  }

  const handleUpdateStaff = async (formData: StaffFormData) => {
    if (!formData.id) return
    const input: UpdateStaffMemberInput = {
      id: formData.id,
      firstName: formData.firstName || undefined,
      lastName: formData.lastName || undefined,
      email: formData.email || undefined,
      phone: formData.phone || undefined,
      avatarUrl: formData.avatarUrl || undefined,
      userId: formData.userId || undefined,
      defaultFacilityId: formData.defaultFacilityId || undefined,
      isActive: formData.isActive,
      capabilities: formData.capabilities.map((c) => ({
        capability: c.capability,
        level: c.level,
      })),
      certifications: formData.certifications.map((c) => ({
        name: c.name,
        expiresAt: c.expiresAt || '',
      })),
      workingHours: formData.workingHours.map((h) => ({
        dayOfWeek: h.dayOfWeek,
        isOpen: h.isOpen,
        openTime: h.openTime || undefined,
        closeTime: h.closeTime || undefined,
      })),
    }
    const result = await updateStaffMember(input)
    if (result.success) {
      toast.success('Staff member updated successfully')
      queryClient.invalidateQueries({ queryKey: ['GetStaffMembers'] })
    } else {
      toast.error(result.error || 'Failed to update staff member')
      throw new Error(result.error)
    }
  }

  const handleDeleteStaff = async (staffId: string) => {
    const result = await deleteStaffMember(staffId)
    if (result.success) {
      toast.success('Staff member deleted successfully')
      queryClient.invalidateQueries({ queryKey: ['GetStaffMembers'] })
    } else {
      toast.error(result.error || 'Failed to delete staff member')
      throw new Error(result.error)
    }
  }

  return (
    <div className="h-full">
      <StaffTab
        staff={staff ?? []}
        isLoading={isLoading}
        onViewSchedule={(id) => console.log('View schedule:', id)}
        onSetAvailability={(id) => console.log('Set availability:', id)}
        onCreateStaff={handleCreateStaff}
        onUpdateStaff={handleUpdateStaff}
        onDeleteStaff={handleDeleteStaff}
      />
    </div>
  )
}
