'use client'

import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { PageHeader, Button } from '@clubvantage/ui'
import { useSearchCaddiesQuery } from '@clubvantage/api-client'
import { CaddiesTab } from '@/components/golf/caddies-tab'
import {
  DynamicCaddyModal as CaddyModal,
  DynamicCaddyScheduleModal as CaddyScheduleModal,
} from '@/components/golf/dynamic-modals'
import type { Caddy } from '@/components/golf/types'

export default function GolfCaddiesPage() {
  const [caddies, setCaddies] = useState<Caddy[]>([])
  const [showCaddyModal, setShowCaddyModal] = useState(false)
  const [editingCaddy, setEditingCaddy] = useState<Caddy | null>(null)
  const [showCaddyScheduleModal, setShowCaddyScheduleModal] = useState(false)
  const [scheduleCaddy, setScheduleCaddy] = useState<Caddy | null>(null)

  // Fetch caddies from API
  const { data: caddiesData } = useSearchCaddiesQuery({}, {
    staleTime: 5 * 60 * 1000,
  })

  // Update caddies when API data is available
  useEffect(() => {
    if (caddiesData?.searchCaddies && caddiesData.searchCaddies.length > 0) {
      const apiCaddies: Caddy[] = caddiesData.searchCaddies.map((c) => ({
        id: c.id,
        name: `${c.firstName} ${c.lastName}`,
        skillLevel: 'intermediate' as const,
        status: c.isActive ? 'AVAILABLE' as const : 'OFF_DUTY' as const,
        experience: 5,
      }))
      setCaddies(apiCaddies)
    }
  }, [caddiesData])

  const handleSaveCaddy = async (data: Omit<Caddy, 'id'>) => {
    if (editingCaddy) {
      setCaddies(caddies.map(c => c.id === editingCaddy.id ? { ...data, id: editingCaddy.id } : c))
    } else {
      setCaddies([...caddies, { ...data, id: `caddy-${Date.now()}` }])
    }
  }

  const handleDeleteCaddy = async () => {
    if (editingCaddy) {
      setCaddies(caddies.filter(c => c.id !== editingCaddy.id))
    }
  }

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Golf Management"
        description="Manage caddies"
        breadcrumbs={[{ label: 'Golf' }, { label: 'Caddies' }]}
        actions={
          <Button onClick={() => { setEditingCaddy(null); setShowCaddyModal(true) }}>
            <Plus className="mr-2 h-4 w-4" />
            Add Caddy
          </Button>
        }
      />

      <CaddiesTab
        caddies={caddies}
        onAddCaddy={() => {
          setEditingCaddy(null)
          setShowCaddyModal(true)
        }}
        onEditCaddy={(caddy: Caddy) => {
          setEditingCaddy(caddy)
          setShowCaddyModal(true)
        }}
        onViewSchedule={(caddy: Caddy) => {
          setScheduleCaddy(caddy)
          setShowCaddyScheduleModal(true)
        }}
      />

      <CaddyModal
        isOpen={showCaddyModal}
        onClose={() => {
          setShowCaddyModal(false)
          setEditingCaddy(null)
        }}
        caddy={editingCaddy}
        onSave={handleSaveCaddy}
        onDelete={editingCaddy ? handleDeleteCaddy : undefined}
      />

      {scheduleCaddy && (
        <CaddyScheduleModal
          isOpen={showCaddyScheduleModal}
          onClose={() => {
            setShowCaddyScheduleModal(false)
            setScheduleCaddy(null)
          }}
          caddy={scheduleCaddy}
          assignments={[]}
          onViewFlight={(flightId) => {
            window.location.href = `/golf/tee-sheet`
          }}
        />
      )}
    </div>
  )
}
