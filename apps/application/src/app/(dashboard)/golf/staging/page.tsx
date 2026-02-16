'use client'

import { useState, useMemo, useCallback } from 'react'
import {
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ChevronRight,
  MapPin,
  Loader2
} from 'lucide-react'
import { PageHeader, Button } from '@clubvantage/ui'
import { FlightStatusBadge } from '@/components/golf/flight-status-badge'
import { PlayerTypeBadge } from '@/components/golf/player-type-badge'
import {
  useGetTeeSheetQuery,
  useCheckInFlightMutation,
} from '@clubvantage/api-client'
import { useCourses, useGolfMutations } from '@/hooks/use-golf'
import { useQueryClient } from '@tanstack/react-query'

export default function StagingPage() {
  const [lastRefresh, setLastRefresh] = useState(new Date())
  const queryClient = useQueryClient()

  // Get first course
  const { courses, isLoading: coursesLoading } = useCourses()
  const firstCourseId = courses[0]?.id

  // Fetch today's tee sheet
  const todayStr = useMemo(() => new Date().toISOString(), [])
  const { data: teeSheetData, isLoading: teeSheetLoading, refetch } = useGetTeeSheetQuery(
    { courseId: firstCourseId || '', date: todayStr },
    { enabled: !!firstCourseId, staleTime: 15 * 1000 }
  )

  // Mutations
  const checkInMutation = useCheckInFlightMutation()
  const { checkIn: checkInTeeTime } = useGolfMutations()

  // Separate flights into checked-in (ready to go) and booked (waiting)
  const { readyToGo, waitingForCheckIn } = useMemo(() => {
    if (!teeSheetData?.teeSheet) return { readyToGo: [], waitingForCheckIn: [] }

    const now = new Date()
    // Only show flights in the next 2 hours
    const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000)

    const relevantSlots = teeSheetData.teeSheet.filter(slot => {
      if (!slot.booking) return false
      const status = slot.booking.status
      return status === 'CHECKED_IN' || status === 'CONFIRMED'
    })

    return {
      readyToGo: relevantSlots.filter(s => s.booking?.status === 'CHECKED_IN'),
      waitingForCheckIn: relevantSlots.filter(s => s.booking?.status === 'CONFIRMED'),
    }
  }, [teeSheetData])

  const totalPlayers = useMemo(() => {
    const allSlots = [...readyToGo, ...waitingForCheckIn]
    return allSlots.reduce((acc, s) =>
      acc + (s.booking?.players?.length || 0), 0
    )
  }, [readyToGo, waitingForCheckIn])

  const handleRefresh = useCallback(() => {
    refetch()
    setLastRefresh(new Date())
  }, [refetch])

  const handleSendOff = useCallback(async (bookingId: string) => {
    // "Send off" marks the flight as started by checking in
    // In the staging context, this confirms the group is heading to the first tee
    try {
      await checkInTeeTime(bookingId)
      queryClient.invalidateQueries({ queryKey: ['GetTeeSheet'] })
    } catch (err) {
      console.error('Failed to send off flight:', err)
    }
  }, [checkInTeeTime, queryClient])

  const handleCheckIn = useCallback(async (bookingId: string) => {
    try {
      await checkInMutation.mutateAsync({
        input: { teeTimeId: bookingId, players: [] }
      })
      queryClient.invalidateQueries({ queryKey: ['GetTeeSheet'] })
    } catch (err) {
      console.error('Failed to check in flight:', err)
    }
  }, [checkInMutation, queryClient])

  const getPlayerName = (player: any) => {
    if (player.member) {
      return `${player.member.firstName} ${player.member.lastName}`
    }
    return player.guestName || 'Guest'
  }

  const getPlayerType = (player: any) => {
    return player.playerType?.toLowerCase() || 'guest'
  }

  const isLoading = coursesLoading || teeSheetLoading

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

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
              <div className="text-2xl font-bold">{totalPlayers}</div>
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
              readyToGo.map(slot => (
                <div key={slot.booking!.id} className="p-4 hover:bg-muted/50">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-semibold">{slot.time}</span>
                      <FlightStatusBadge status={slot.booking!.status as any} />
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleSendOff(slot.booking!.id)}
                    >
                      Send Off
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {slot.booking!.players?.map((player, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <PlayerTypeBadge type={getPlayerType(player)} />
                        <span>{getPlayerName(player)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {slot.booking!.players?.some(p => p.cartType && p.cartType !== 'WALKING') && (
                      <span>Cart requested</span>
                    )}
                    {slot.booking!.players?.some(p => p.caddy) && (
                      <span>Caddy: {slot.booking!.players.find(p => p.caddy)?.caddy?.firstName}</span>
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
              waitingForCheckIn.map(slot => (
                <div key={slot.booking!.id} className="p-4 hover:bg-muted/50">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-semibold">{slot.time}</span>
                      <FlightStatusBadge status={slot.booking!.status as any} />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={checkInMutation.isPending}
                      onClick={() => handleCheckIn(slot.booking!.id)}
                    >
                      Check In
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {slot.booking!.players?.map((player, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <PlayerTypeBadge type={getPlayerType(player)} />
                        <span>{getPlayerName(player)}</span>
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
