'use client'

import { useMemo } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ServicesTab } from '@/components/bookings/tabs'
import {
  createService,
  updateService,
  deleteService,
} from '../actions'
import { useGetServicesQuery } from '@clubvantage/api-client'
import type { CreateServiceInput, UpdateServiceInput } from '@clubvantage/api-client'

export default function BookingsServicesPage() {
  const queryClient = useQueryClient()

  const { data, isLoading } = useGetServicesQuery()

  const services = useMemo(() => {
    if (!data?.services) return undefined

    const categoryMap: Record<string, 'spa' | 'fitness' | 'sports' | 'wellness'> = {
      SPA: 'spa',
      FITNESS: 'fitness',
      SPORTS: 'sports',
      WELLNESS: 'wellness',
    }

    return data.services.map((s) => ({
      id: s.id,
      name: s.name,
      category: categoryMap[s.category] || 'wellness',
      description: s.description ?? '',
      duration: s.durationMinutes,
      pricing: { basePrice: s.basePrice },
      status: s.isActive ? ('active' as const) : ('inactive' as const),
      bookingsThisWeek: 0,
      requiresStaff: true,
    }))
  }, [data])

  return (
    <div className="p-4 sm:p-6">
      <ServicesTab
        services={services}
        isLoading={isLoading}
        onViewDetails={(id) => console.log('View service details:', id)}
        onToggleStatus={(id) => console.log('Toggle service status:', id)}
        onEditService={(id) => console.log('Edit service:', id)}
        onCreateService={async (data) => {
          const input: CreateServiceInput = {
            name: data.name,
            category: data.category,
            description: data.description || undefined,
            durationMinutes: data.durationMinutes,
            bufferMinutes: data.bufferMinutes || undefined,
            basePrice: data.basePrice,
            isActive: data.isActive,
            maxParticipants: data.maxParticipants || undefined,
            requiredCapabilities: data.requiredCapabilities.length > 0 ? data.requiredCapabilities : undefined,
            requiredFacilityFeatures: data.requiredFacilityFeatures.length > 0 ? data.requiredFacilityFeatures : undefined,
            tierDiscounts: data.tierDiscounts.length > 0 ? data.tierDiscounts.map((t) => ({
              tierName: t.tierName,
              discountPercent: t.discountPercent,
            })) : undefined,
            variations: data.variations.length > 0 ? data.variations.map((v) => ({
              name: v.name,
              priceModifier: v.priceModifier,
              priceType: v.priceType === 'add' ? 'add' : 'multiply',
            })) : undefined,
          }
          const result = await createService(input)
          if (result.success) {
            toast.success('Service created successfully')
            queryClient.invalidateQueries({ queryKey: ['GetServices'] })
          } else {
            toast.error(result.error || 'Failed to create service')
            throw new Error(result.error)
          }
        }}
        onUpdateService={async (data) => {
          if (!data.id) return
          const input: UpdateServiceInput = {
            id: data.id,
            name: data.name || undefined,
            category: data.category || undefined,
            description: data.description || undefined,
            durationMinutes: data.durationMinutes || undefined,
            bufferMinutes: data.bufferMinutes || undefined,
            basePrice: data.basePrice || undefined,
            isActive: data.isActive,
            maxParticipants: data.maxParticipants || undefined,
            requiredCapabilities: data.requiredCapabilities.length > 0 ? data.requiredCapabilities : undefined,
            requiredFacilityFeatures: data.requiredFacilityFeatures.length > 0 ? data.requiredFacilityFeatures : undefined,
            tierDiscounts: data.tierDiscounts.length > 0 ? data.tierDiscounts.map((t) => ({
              tierName: t.tierName,
              discountPercent: t.discountPercent,
            })) : undefined,
            variations: data.variations.length > 0 ? data.variations.map((v) => ({
              name: v.name,
              priceModifier: v.priceModifier,
              priceType: v.priceType === 'add' ? 'add' : 'multiply',
            })) : undefined,
          }
          const result = await updateService(input)
          if (result.success) {
            toast.success('Service updated successfully')
            queryClient.invalidateQueries({ queryKey: ['GetServices'] })
          } else {
            toast.error(result.error || 'Failed to update service')
            throw new Error(result.error)
          }
        }}
        onDeleteService={async (id) => {
          const result = await deleteService(id)
          if (result.success) {
            toast.success('Service deleted successfully')
            queryClient.invalidateQueries({ queryKey: ['GetServices'] })
          } else {
            toast.error(result.error || 'Failed to delete service')
            throw new Error(result.error)
          }
        }}
      />
    </div>
  )
}
