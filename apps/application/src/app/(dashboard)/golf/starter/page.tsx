'use client'

import { useState, useMemo, useEffect } from 'react'
import {
  Flag,
  Clock,
  Users,
  ChevronRight,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Timer,
  MapPin
} from 'lucide-react'
import { PageHeader, Button } from '@clubvantage/ui'
import { FlightStatusBadge, type FlightStatus } from '@/components/golf/flight-status-badge'
import { PlayerTypeBadge, type PlayerType } from '@/components/golf/player-type-badge'
import type { Flight, Player } from '@/components/golf/types'

// Generate realistic starter data
const generateStarterData = () => {
  const now = new Date()
  const baseHour = now.getHours()
  const baseMinute = Math.floor(now.getMinutes() / 8) * 8

  const flights: (Flight & {
    estimatedPosition?: string
    paceStatus?: 'on-time' | 'ahead' | 'behind'
    minutesBehind?: number
  })[] = [
    // Currently on course
    {
      id: 'on-course-1',
      time: formatTime(baseHour, baseMinute - 40),
      date: now.toISOString().split('T')[0] as string,
      status: 'on-course',
      players: [
        { id: 'p1', name: 'Somchai W.', type: 'member' as PlayerType, memberId: 'M-0001', handicap: 12, checkedIn: true },
        { id: 'p2', name: 'Prasert C.', type: 'member' as PlayerType, memberId: 'M-0003', handicap: 8, checkedIn: true },
        { id: 'p3', name: 'Wichai P.', type: 'member' as PlayerType, memberId: 'M-0008', handicap: 15, checkedIn: true },
        { id: 'p4', name: 'Narong T.', type: 'member' as PlayerType, memberId: 'M-0012', handicap: 10, checkedIn: true },
      ],
      estimatedPosition: 'Hole 5',
      paceStatus: 'on-time',
    },
    {
      id: 'on-course-2',
      time: formatTime(baseHour, baseMinute - 32),
      date: now.toISOString().split('T')[0] as string,
      status: 'on-course',
      players: [
        { id: 'p5', name: 'Apinya S.', type: 'member' as PlayerType, memberId: 'M-0005', handicap: 18, checkedIn: true },
        { id: 'p6', name: 'John Smith', type: 'guest' as PlayerType, handicap: 20, checkedIn: true },
        { id: 'p7', name: 'Mike Johnson', type: 'guest' as PlayerType, handicap: 22, checkedIn: true },
        { id: 'p8', name: 'Tom Williams', type: 'guest' as PlayerType, handicap: 25, checkedIn: true },
      ],
      estimatedPosition: 'Hole 4',
      paceStatus: 'behind',
      minutesBehind: 12,
    },
    {
      id: 'on-course-3',
      time: formatTime(baseHour, baseMinute - 24),
      date: now.toISOString().split('T')[0] as string,
      status: 'on-course',
      players: [
        { id: 'p9', name: 'Nisa W.', type: 'member' as PlayerType, memberId: 'M-0002', handicap: 24, checkedIn: true },
        { id: 'p10', name: 'Corporate 1', type: 'guest' as PlayerType, checkedIn: true },
        { id: 'p11', name: 'Corporate 2', type: 'guest' as PlayerType, checkedIn: true },
        { id: 'p12', name: 'Corporate 3', type: 'guest' as PlayerType, checkedIn: true },
      ],
      estimatedPosition: 'Hole 3',
      paceStatus: 'ahead',
    },
    // Checked in - ready to go
    {
      id: 'ready-1',
      time: formatTime(baseHour, baseMinute - 8),
      date: now.toISOString().split('T')[0] as string,
      status: 'checked-in',
      players: [
        { id: 'p13', name: 'Sompong K.', type: 'member' as PlayerType, memberId: 'M-0015', handicap: 6, checkedIn: true },
        { id: 'p14', name: 'Tanawat R.', type: 'member' as PlayerType, memberId: 'M-0018', handicap: 14, checkedIn: true },
        { id: 'p15', name: 'Prayut S.', type: 'member' as PlayerType, memberId: 'M-0020', handicap: 10, checkedIn: true },
        { id: 'p16', name: 'Anucha K.', type: 'member' as PlayerType, memberId: 'M-0022', handicap: 18, checkedIn: true },
      ],
      cartId: 'cart-5',
    },
    // Current - next to send off
    {
      id: 'current-1',
      time: formatTime(baseHour, baseMinute),
      date: now.toISOString().split('T')[0] as string,
      status: 'checked-in',
      players: [
        { id: 'p17', name: 'VIP Guest 1', type: 'guest' as PlayerType, checkedIn: true },
        { id: 'p18', name: 'VIP Guest 2', type: 'guest' as PlayerType, checkedIn: true },
        { id: 'p19', name: 'Sponsor Rep', type: 'guest' as PlayerType, checkedIn: true },
        null,
      ],
      cartId: 'cart-6',
      caddyId: 'caddy-1',
      notes: 'VIP group - special attention',
    },
    // Upcoming
    {
      id: 'upcoming-1',
      time: formatTime(baseHour, baseMinute + 8),
      date: now.toISOString().split('T')[0] as string,
      status: 'booked',
      players: [
        { id: 'p20', name: 'Member A', type: 'member' as PlayerType, memberId: 'M-0025' },
        { id: 'p21', name: 'Member B', type: 'member' as PlayerType, memberId: 'M-0026' },
        null,
        null,
      ],
    },
    {
      id: 'upcoming-2',
      time: formatTime(baseHour, baseMinute + 16),
      date: now.toISOString().split('T')[0] as string,
      status: 'booked',
      players: [
        { id: 'p22', name: 'Tournament Player 1', type: 'member' as PlayerType, memberId: 'M-0030' },
        { id: 'p23', name: 'Tournament Player 2', type: 'member' as PlayerType, memberId: 'M-0031' },
        { id: 'p24', name: 'Tournament Player 3', type: 'member' as PlayerType, memberId: 'M-0032' },
        { id: 'p25', name: 'Tournament Player 4', type: 'member' as PlayerType, memberId: 'M-0033' },
      ],
      notes: 'Tournament group',
    },
  ]

  return flights
}

function formatTime(hour: number, minute: number): string {
  // Handle minute overflow/underflow
  while (minute < 0) {
    minute += 60
    hour--
  }
  while (minute >= 60) {
    minute -= 60
    hour++
  }

  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
  const ampm = hour >= 12 ? 'PM' : 'AM'
  return `${displayHour}:${minute.toString().padStart(2, '0')} ${ampm}`
}

type ExtendedFlight = Flight & {
  estimatedPosition?: string
  paceStatus?: 'on-time' | 'ahead' | 'behind'
  minutesBehind?: number
}

export default function StarterPage() {
  const [flights, setFlights] = useState<ExtendedFlight[]>([])
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    setFlights(generateStarterData())

    // Update time every minute
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)

    return () => clearInterval(interval)
  }, [])

  const onCourseFlights = useMemo(() =>
    flights.filter(f => f.status === 'on-course'),
    [flights]
  )

  const nextUp = useMemo(() =>
    flights.find(f => f.status === 'checked-in'),
    [flights]
  )

  const upcoming = useMemo(() =>
    flights.filter(f => f.status === 'booked' || (f.status === 'checked-in' && f.id !== nextUp?.id)),
    [flights, nextUp]
  )

  const handleRefresh = () => {
    setFlights(generateStarterData())
    setCurrentTime(new Date())
  }

  const handleSendOff = (flightId: string) => {
    setFlights(prev => prev.map(f =>
      f.id === flightId
        ? { ...f, status: 'on-course' as FlightStatus, estimatedPosition: 'Hole 1', paceStatus: 'on-time' as const }
        : f
    ))
  }

  const paceStatusColors = {
    'on-time': 'bg-emerald-100 text-emerald-700',
    'ahead': 'bg-blue-100 text-blue-700',
    'behind': 'bg-red-100 text-red-700',
  }

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Starter Station"
        description="Manage tee-off flow and pace of play"
        breadcrumbs={[
          { label: 'Golf', href: '/golf' },
          { label: 'Starter' },
        ]}
        actions={
          <div className="flex items-center gap-4">
            <div className="text-lg font-mono bg-card border rounded-lg px-4 py-2">
              <Clock className="inline-block mr-2 h-5 w-5 text-muted-foreground" />
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
            <Button variant="outline" onClick={handleRefresh}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        }
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <Flag className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <div className="text-2xl font-bold">{onCourseFlights.length}</div>
              <div className="text-sm text-muted-foreground">On Course</div>
            </div>
          </div>
        </div>
        <div className="bg-card border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <Timer className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <div className="text-2xl font-bold">
                {onCourseFlights.filter(f => f.paceStatus === 'behind').length}
              </div>
              <div className="text-sm text-muted-foreground">Behind Pace</div>
            </div>
          </div>
        </div>
        <div className="bg-card border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <div className="text-2xl font-bold">
                {flights.filter(f => f.status === 'checked-in').length}
              </div>
              <div className="text-sm text-muted-foreground">Ready to Go</div>
            </div>
          </div>
        </div>
        <div className="bg-card border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-stone-500/10 rounded-lg">
              <Users className="h-5 w-5 text-stone-500" />
            </div>
            <div>
              <div className="text-2xl font-bold">
                {flights.reduce((acc, f) => acc + f.players.filter(p => p !== null).length, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Total Players</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Next Up - Large Card */}
        <div className="lg:col-span-2">
          {nextUp ? (
            <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-sm opacity-80">NEXT UP</div>
                  <div className="text-3xl font-bold">{nextUp.time}</div>
                </div>
                <Button
                  size="lg"
                  className="bg-white text-amber-600 hover:bg-white/90"
                  onClick={() => handleSendOff(nextUp.id)}
                >
                  Send Off
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {nextUp.players.map((player, idx) => (
                  <div key={idx} className="bg-white/20 rounded-lg p-3">
                    {player ? (
                      <>
                        <div className="font-medium">{player.name}</div>
                        <div className="text-sm opacity-80">
                          {player.type === 'member' ? player.memberId : 'Guest'}
                          {player.handicap && ` • HCP ${player.handicap}`}
                        </div>
                      </>
                    ) : (
                      <div className="text-white/60">Empty Slot</div>
                    )}
                  </div>
                ))}
              </div>

              {nextUp.notes && (
                <div className="bg-white/20 rounded-lg px-4 py-2 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  <span>{nextUp.notes}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-card border rounded-xl p-6 text-center">
              <div className="text-muted-foreground">No flights ready to send off</div>
            </div>
          )}

          {/* On Course Flights */}
          <div className="mt-6 bg-card border rounded-xl">
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flag className="h-5 w-5 text-emerald-500" />
                <h2 className="font-semibold">Currently On Course</h2>
              </div>
              <span className="text-sm text-muted-foreground">{onCourseFlights.length} flights</span>
            </div>
            <div className="divide-y">
              {onCourseFlights.map(flight => (
                <div key={flight.id} className="p-4 hover:bg-muted/50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="font-semibold">{flight.time}</span>
                      {flight.estimatedPosition && (
                        <span className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          {flight.estimatedPosition}
                        </span>
                      )}
                    </div>
                    {flight.paceStatus && (
                      <span className={`px-2 py-1 rounded text-xs font-medium ${paceStatusColors[flight.paceStatus]}`}>
                        {flight.paceStatus === 'on-time' && 'On Time'}
                        {flight.paceStatus === 'ahead' && 'Ahead of Pace'}
                        {flight.paceStatus === 'behind' && `${flight.minutesBehind}min Behind`}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {flight.players.filter(p => p !== null).map((player, idx) => (
                      <span key={idx} className="text-sm bg-muted px-2 py-1 rounded">
                        {(player as Player).name}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Upcoming Flights */}
        <div className="bg-card border rounded-xl">
          <div className="p-4 border-b">
            <h2 className="font-semibold">Upcoming</h2>
          </div>
          <div className="divide-y max-h-[600px] overflow-y-auto">
            {upcoming.map(flight => (
              <div key={flight.id} className="p-4 hover:bg-muted/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">{flight.time}</span>
                  <FlightStatusBadge status={flight.status} />
                </div>
                <div className="space-y-1 text-sm">
                  {flight.players.map((player, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      {player ? (
                        <>
                          <PlayerTypeBadge type={player.type} />
                          <span>{player.name}</span>
                        </>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </div>
                  ))}
                </div>
                {flight.notes && (
                  <div className="mt-2 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
                    {flight.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
