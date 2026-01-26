'use client'

import { useState, useMemo } from 'react'
import {
  Users,
  UserCheck,
  UserX,
  Clock,
  Search,
  Filter,
  Star,
  Phone
} from 'lucide-react'
import { PageHeader, Button, Input } from '@clubvantage/ui'
import { FlightStatusBadge, type FlightStatus } from '@/components/golf/flight-status-badge'
import type { Flight, Player, Caddy } from '@/components/golf/types'
import type { PlayerType } from '@/components/golf/player-type-badge'

// Mock caddy data with extended information
interface ExtendedCaddy extends Caddy {
  phone?: string
  rating?: number
  todayAssignments?: { time: string; flightId: string }[]
  specializations?: string[]
}

const mockCaddies: ExtendedCaddy[] = [
  {
    id: 'caddy-1',
    name: 'Somchai Prasert',
    skillLevel: 'expert',
    status: 'assigned',
    experience: 12,
    currentAssignment: '7:00 AM',
    phone: '081-234-5678',
    rating: 4.9,
    todayAssignments: [{ time: '7:00 AM', flightId: 'f1' }],
    specializations: ['Main Course', 'Tournament Support'],
  },
  {
    id: 'caddy-2',
    name: 'Niran Wongsawat',
    skillLevel: 'advanced',
    status: 'assigned',
    experience: 8,
    currentAssignment: '7:16 AM',
    phone: '082-345-6789',
    rating: 4.7,
    todayAssignments: [{ time: '7:16 AM', flightId: 'f2' }],
  },
  {
    id: 'caddy-3',
    name: 'Prasit Chaiyasit',
    skillLevel: 'intermediate',
    status: 'available',
    experience: 3,
    phone: '083-456-7890',
    rating: 4.5,
    todayAssignments: [],
  },
  {
    id: 'caddy-4',
    name: 'Wichai Khamwan',
    skillLevel: 'advanced',
    status: 'available',
    experience: 6,
    phone: '084-567-8901',
    rating: 4.8,
    todayAssignments: [],
    specializations: ['VIP Service'],
  },
  {
    id: 'caddy-5',
    name: 'Apinya Srisuk',
    skillLevel: 'beginner',
    status: 'available',
    experience: 1,
    notes: 'New hire, training complete',
    phone: '085-678-9012',
    rating: 4.2,
    todayAssignments: [],
  },
  {
    id: 'caddy-6',
    name: 'Tanawat Ruangrit',
    skillLevel: 'intermediate',
    status: 'off-duty',
    experience: 4,
    phone: '086-789-0123',
    rating: 4.4,
  },
]

// Mock upcoming flights needing caddies
const mockUpcomingFlights: Flight[] = [
  {
    id: 'f3',
    time: '8:00 AM',
    date: new Date().toISOString().split('T')[0] as string,
    status: 'booked',
    players: [
      { id: 'p1', name: 'VIP Guest', type: 'guest' as PlayerType },
      { id: 'p2', name: 'Mr. Corporate', type: 'guest' as PlayerType },
      null,
      null,
    ],
    notes: 'VIP group - caddy requested',
  },
  {
    id: 'f4',
    time: '8:08 AM',
    date: new Date().toISOString().split('T')[0] as string,
    status: 'booked',
    players: [
      { id: 'p3', name: 'Sompong K.', type: 'member' as PlayerType, memberId: 'M-0015' },
      { id: 'p4', name: 'Tanawat R.', type: 'member' as PlayerType, memberId: 'M-0018' },
      null,
      null,
    ],
  },
  {
    id: 'f5',
    time: '8:16 AM',
    date: new Date().toISOString().split('T')[0] as string,
    status: 'booked',
    players: [
      { id: 'p5', name: 'Tournament Player', type: 'member' as PlayerType, memberId: 'M-0020' },
      { id: 'p6', name: 'Tournament Player 2', type: 'member' as PlayerType, memberId: 'M-0021' },
      { id: 'p7', name: 'Tournament Player 3', type: 'member' as PlayerType, memberId: 'M-0022' },
      { id: 'p8', name: 'Tournament Player 4', type: 'member' as PlayerType, memberId: 'M-0023' },
    ],
    notes: 'Tournament group - individual caddies requested',
  },
]

type FilterStatus = 'all' | 'available' | 'assigned' | 'off-duty'

export default function CaddyMasterPage() {
  const [caddies, setCaddies] = useState<ExtendedCaddy[]>(mockCaddies)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')
  const [selectedCaddy, setSelectedCaddy] = useState<ExtendedCaddy | null>(null)

  const filteredCaddies = useMemo(() => {
    return caddies.filter(caddy => {
      const matchesSearch = caddy.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesFilter = filterStatus === 'all' || caddy.status === filterStatus
      return matchesSearch && matchesFilter
    })
  }, [caddies, searchQuery, filterStatus])

  const availableCount = useMemo(() =>
    caddies.filter(c => c.status === 'available').length,
    [caddies]
  )

  const assignedCount = useMemo(() =>
    caddies.filter(c => c.status === 'assigned').length,
    [caddies]
  )

  const offDutyCount = useMemo(() =>
    caddies.filter(c => c.status === 'off-duty').length,
    [caddies]
  )

  const handleAssignCaddy = (caddyId: string, flightId: string, time: string) => {
    setCaddies(prev => prev.map(c =>
      c.id === caddyId
        ? {
            ...c,
            status: 'assigned' as const,
            currentAssignment: time,
            todayAssignments: [...(c.todayAssignments || []), { time, flightId }]
          }
        : c
    ))
  }

  const skillLevelColors = {
    beginner: 'bg-stone-100 text-stone-700',
    intermediate: 'bg-blue-100 text-blue-700',
    advanced: 'bg-amber-100 text-amber-700',
    expert: 'bg-emerald-100 text-emerald-700',
  }

  const statusColors = {
    available: 'bg-emerald-500',
    assigned: 'bg-blue-500',
    'off-duty': 'bg-stone-400',
  }

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Caddy Master"
        description="Manage caddy assignments and availability"
        breadcrumbs={[
          { label: 'Golf', href: '/golf' },
          { label: 'Caddy Master' },
        ]}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Users className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <div className="text-2xl font-bold">{caddies.length}</div>
              <div className="text-sm text-muted-foreground">Total Caddies</div>
            </div>
          </div>
        </div>
        <div className="bg-card border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <UserCheck className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <div className="text-2xl font-bold">{availableCount}</div>
              <div className="text-sm text-muted-foreground">Available</div>
            </div>
          </div>
        </div>
        <div className="bg-card border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <Clock className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <div className="text-2xl font-bold">{assignedCount}</div>
              <div className="text-sm text-muted-foreground">On Assignment</div>
            </div>
          </div>
        </div>
        <div className="bg-card border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-stone-500/10 rounded-lg">
              <UserX className="h-5 w-5 text-stone-500" />
            </div>
            <div>
              <div className="text-2xl font-bold">{offDutyCount}</div>
              <div className="text-sm text-muted-foreground">Off Duty</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Caddy List */}
        <div className="lg:col-span-2 bg-card border rounded-xl">
          <div className="p-4 border-b">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search caddies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex border border-border rounded-md overflow-hidden">
                {(['all', 'available', 'assigned', 'off-duty'] as FilterStatus[]).map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-3 py-1.5 text-sm capitalize ${
                      filterStatus === status
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted'
                    }`}
                  >
                    {status === 'off-duty' ? 'Off Duty' : status}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="divide-y max-h-[600px] overflow-y-auto">
            {filteredCaddies.map(caddy => (
              <div
                key={caddy.id}
                className={`p-4 hover:bg-muted/50 cursor-pointer ${selectedCaddy?.id === caddy.id ? 'bg-muted/50' : ''}`}
                onClick={() => setSelectedCaddy(caddy)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${statusColors[caddy.status]}`} />
                    <div>
                      <div className="font-medium">{caddy.name}</div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className={`px-2 py-0.5 rounded text-xs ${skillLevelColors[caddy.skillLevel]}`}>
                          {caddy.skillLevel}
                        </span>
                        <span>{caddy.experience} yrs exp</span>
                        {caddy.rating && (
                          <span className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                            {caddy.rating}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    {caddy.status === 'assigned' && caddy.currentAssignment && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Assigned: </span>
                        <span className="font-medium">{caddy.currentAssignment}</span>
                      </div>
                    )}
                    {caddy.status === 'available' && (
                      <span className="text-sm text-emerald-600 font-medium">Available Now</span>
                    )}
                    {caddy.status === 'off-duty' && (
                      <span className="text-sm text-stone-500">Off Duty</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Flights Needing Caddies */}
        <div className="bg-card border rounded-xl">
          <div className="p-4 border-b">
            <h2 className="font-semibold">Upcoming - Caddy Requested</h2>
          </div>
          <div className="divide-y max-h-[600px] overflow-y-auto">
            {mockUpcomingFlights.map(flight => (
              <div key={flight.id} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">{flight.time}</span>
                  <FlightStatusBadge status={flight.status} />
                </div>
                <div className="text-sm text-muted-foreground mb-2">
                  {flight.players.filter(p => p !== null).length} players
                </div>
                {flight.notes && (
                  <div className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded mb-2">
                    {flight.notes}
                  </div>
                )}
                {flight.caddyId ? (
                  <div className="text-sm text-emerald-600">
                    Caddy assigned
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-1">
                    {caddies
                      .filter(c => c.status === 'available')
                      .slice(0, 3)
                      .map(caddy => (
                        <Button
                          key={caddy.id}
                          variant="outline"
                          size="sm"
                          className="text-xs"
                          onClick={() => handleAssignCaddy(caddy.id, flight.id, flight.time)}
                        >
                          Assign {caddy.name.split(' ')[0]}
                        </Button>
                      ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Selected Caddy Detail */}
      {selectedCaddy && (
        <div className="bg-card border rounded-xl p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold">{selectedCaddy.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-2 py-0.5 rounded text-sm ${skillLevelColors[selectedCaddy.skillLevel]}`}>
                  {selectedCaddy.skillLevel}
                </span>
                <span className="text-muted-foreground">{selectedCaddy.experience} years experience</span>
              </div>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm text-white ${statusColors[selectedCaddy.status]}`}>
              {selectedCaddy.status === 'off-duty' ? 'Off Duty' : selectedCaddy.status}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Contact</h3>
              {selectedCaddy.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{selectedCaddy.phone}</span>
                </div>
              )}
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Rating</h3>
              {selectedCaddy.rating && (
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                  <span className="text-lg font-semibold">{selectedCaddy.rating}</span>
                  <span className="text-muted-foreground">/ 5.0</span>
                </div>
              )}
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Specializations</h3>
              <div className="flex flex-wrap gap-1">
                {selectedCaddy.specializations?.map((spec, idx) => (
                  <span key={idx} className="px-2 py-0.5 bg-muted rounded text-sm">
                    {spec}
                  </span>
                )) || <span className="text-muted-foreground">None specified</span>}
              </div>
            </div>
          </div>

          {selectedCaddy.todayAssignments && selectedCaddy.todayAssignments.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Today&apos;s Assignments</h3>
              <div className="flex flex-wrap gap-2">
                {selectedCaddy.todayAssignments.map((assignment, idx) => (
                  <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 rounded">
                    {assignment.time}
                  </span>
                ))}
              </div>
            </div>
          )}

          {selectedCaddy.notes && (
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Notes</h3>
              <p className="text-sm">{selectedCaddy.notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
