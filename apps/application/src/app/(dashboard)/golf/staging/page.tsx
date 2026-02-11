'use client'

import { useState, useMemo, useEffect } from 'react'
import {
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ChevronRight,
  MapPin
} from 'lucide-react'
import { PageHeader, Button } from '@clubvantage/ui'
import { FlightStatusBadge, type FlightStatus } from '@/components/golf/flight-status-badge'
import { PlayerTypeBadge, type PlayerType } from '@/components/golf/player-type-badge'
import type { Flight, Player, Cart, Caddy } from '@/components/golf/types'

// Mock data for staging area
const generateStagingData = () => {
  const now = new Date()
  const currentHour = now.getHours()
  const currentMinute = now.getMinutes()

  const flights: Flight[] = [
    {
      id: 'staging-1',
      time: `${currentHour}:${(currentMinute - 15).toString().padStart(2, '0')} AM`,
      date: now.toISOString().split('T')[0] as string,
      status: 'CHECKED_IN',
      players: [
        { id: 'p1', name: 'Somchai W.', type: 'member' as PlayerType, memberId: 'M-0001', handicap: 12, checkedIn: true },
        { id: 'p2', name: 'Prasert C.', type: 'member' as PlayerType, memberId: 'M-0003', handicap: 8, checkedIn: true },
        { id: 'p3', name: 'Wichai P.', type: 'member' as PlayerType, memberId: 'M-0008', handicap: 15, checkedIn: true },
        { id: 'p4', name: 'Narong T.', type: 'member' as PlayerType, memberId: 'M-0012', handicap: 10, checkedIn: true },
      ],
      cartId: 'cart-1',
      caddyId: 'caddy-1',
    },
    {
      id: 'staging-2',
      time: `${currentHour}:${currentMinute.toString().padStart(2, '0')} AM`,
      date: now.toISOString().split('T')[0] as string,
      status: 'CHECKED_IN',
      players: [
        { id: 'p5', name: 'Apinya S.', type: 'member' as PlayerType, memberId: 'M-0005', handicap: 18, checkedIn: true },
        { id: 'p6', name: 'John Smith', type: 'guest' as PlayerType, handicap: 20, checkedIn: true },
        { id: 'p7', name: 'Mike Johnson', type: 'guest' as PlayerType, handicap: 22, checkedIn: true },
        null,
      ],
      cartId: 'cart-2',
    },
    {
      id: 'staging-3',
      time: `${currentHour}:${(currentMinute + 8).toString().padStart(2, '0')} AM`,
      date: now.toISOString().split('T')[0] as string,
      status: 'BOOKED',
      players: [
        { id: 'p8', name: 'Nisa W.', type: 'member' as PlayerType, memberId: 'M-0002', handicap: 24 },
        { id: 'p9', name: 'Corporate Guest 1', type: 'guest' as PlayerType },
        { id: 'p10', name: 'Corporate Guest 2', type: 'guest' as PlayerType },
        { id: 'p11', name: 'Corporate Guest 3', type: 'guest' as PlayerType },
      ],
    },
    {
      id: 'staging-4',
      time: `${currentHour}:${(currentMinute + 16).toString().padStart(2, '0')} AM`,
      date: now.toISOString().split('T')[0] as string,
      status: 'BOOKED',
      players: [
        { id: 'p12', name: 'Sompong K.', type: 'member' as PlayerType, memberId: 'M-0015', handicap: 6 },
        { id: 'p13', name: 'Tanawat R.', type: 'member' as PlayerType, memberId: 'M-0018', handicap: 14 },
        null,
        null,
      ],
    },
  ]

  return flights
}

const mockCarts: Cart[] = [
  { id: 'cart-1', number: '01', type: '2-seater', status: 'IN_USE', currentAssignment: '7:00 AM' },
  { id: 'cart-2', number: '02', type: '2-seater', status: 'IN_USE', currentAssignment: '7:08 AM' },
  { id: 'cart-3', number: '03', type: '4-seater', status: 'AVAILABLE' },
  { id: 'cart-4', number: '04', type: '4-seater', status: 'AVAILABLE' },
]

const mockCaddies: Caddy[] = [
  { id: 'caddy-1', name: 'Somchai Prasert', skillLevel: 'expert', status: 'ASSIGNED', experience: 12, currentAssignment: '7:00 AM' },
  { id: 'caddy-2', name: 'Niran Wongsawat', skillLevel: 'advanced', status: 'AVAILABLE', experience: 8 },
  { id: 'caddy-3', name: 'Prasit Chaiyasit', skillLevel: 'intermediate', status: 'AVAILABLE', experience: 3 },
]

export default function StagingPage() {
  const [flights, setFlights] = useState<Flight[]>([])
  const [lastRefresh, setLastRefresh] = useState(new Date())

  useEffect(() => {
    setFlights(generateStagingData())
  }, [])

  const readyToGo = useMemo(() =>
    flights.filter(f => f.status === 'CHECKED_IN'),
    [flights]
  )

  const waitingForCheckIn = useMemo(() =>
    flights.filter(f => f.status === 'BOOKED'),
    [flights]
  )

  const handleRefresh = () => {
    setFlights(generateStagingData())
    setLastRefresh(new Date())
  }

  const handleSendOff = (flightId: string) => {
    setFlights(prev => prev.map(f =>
      f.id === flightId ? { ...f, status: 'STARTED' as FlightStatus } : f
    ))
  }

  const getCart = (cartId?: string) => mockCarts.find(c => c.id === cartId)
  const getCaddy = (caddyId?: string) => mockCaddies.find(c => c.id === caddyId)

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Staging Area"
        description="Manage flights ready to go out and waiting for check-in"
        breadcrumbs={[
          { label: 'Golf', href: '/golf' },
          { label: 'Staging Area' },
        ]}
        actions={
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        }
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <div className="text-2xl font-bold">{readyToGo.length}</div>
              <div className="text-sm text-muted-foreground">Ready to Go</div>
            </div>
          </div>
        </div>
        <div className="bg-card border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <Clock className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <div className="text-2xl font-bold">{waitingForCheckIn.length}</div>
              <div className="text-sm text-muted-foreground">Awaiting Check-in</div>
            </div>
          </div>
        </div>
        <div className="bg-card border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Users className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <div className="text-2xl font-bold">
                {flights.reduce((acc, f) => acc + f.players.filter(p => p !== null).length, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Total Players</div>
            </div>
          </div>
        </div>
        <div className="bg-card border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-stone-500/10 rounded-lg">
              <MapPin className="h-5 w-5 text-stone-500" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Last Updated</div>
              <div className="text-sm font-medium">{lastRefresh.toLocaleTimeString()}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ready to Go Section */}
        <div className="bg-card border rounded-xl">
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              <h2 className="font-semibold">Ready to Send Off</h2>
            </div>
            <span className="text-sm text-muted-foreground">{readyToGo.length} flights</span>
          </div>
          <div className="divide-y">
            {readyToGo.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                No flights ready to go
              </div>
            ) : (
              readyToGo.map(flight => (
                <div key={flight.id} className="p-4 hover:bg-muted/50">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-semibold">{flight.time}</span>
                      <FlightStatusBadge status={flight.status} />
                    </div>
                    <Button size="sm" onClick={() => handleSendOff(flight.id)}>
                      Send Off
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {flight.players.map((player, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        {player ? (
                          <>
                            <PlayerTypeBadge type={player.type} />
                            <span>{player.name}</span>
                            {player.handicap && (
                              <span className="text-muted-foreground">({player.handicap})</span>
                            )}
                          </>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {flight.cartId && (
                      <span>Cart: #{getCart(flight.cartId)?.number}</span>
                    )}
                    {flight.caddyId && (
                      <span>Caddy: {getCaddy(flight.caddyId)?.name}</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Waiting for Check-in Section */}
        <div className="bg-card border rounded-xl">
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              <h2 className="font-semibold">Awaiting Check-in</h2>
            </div>
            <span className="text-sm text-muted-foreground">{waitingForCheckIn.length} flights</span>
          </div>
          <div className="divide-y">
            {waitingForCheckIn.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                No flights waiting for check-in
              </div>
            ) : (
              waitingForCheckIn.map(flight => (
                <div key={flight.id} className="p-4 hover:bg-muted/50">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-semibold">{flight.time}</span>
                      <FlightStatusBadge status={flight.status} />
                    </div>
                    <Button variant="outline" size="sm">
                      Check In
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {flight.players.map((player, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        {player ? (
                          <>
                            <PlayerTypeBadge type={player.type} />
                            <span>{player.name}</span>
                          </>
                        ) : (
                          <span className="text-muted-foreground">Empty slot</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
