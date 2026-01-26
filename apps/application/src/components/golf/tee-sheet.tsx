'use client';

import { useState, useMemo } from 'react';
import { User, Users, Clock, MoreHorizontal, Plus } from 'lucide-react';
import {
  cn,
  Button,
  Badge,
  Avatar,
  AvatarFallback,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@clubvantage/ui';

interface Player {
  id: string;
  name: string;
  memberId?: string;
  isGuest?: boolean;
  handicap?: number;
}

interface TeeTime {
  id: string;
  time: string;
  players: Player[];
  status: 'open' | 'partial' | 'full' | 'blocked';
  notes?: string;
}

interface TeeSheetProps {
  date: Date;
  course: string;
}

// Generate tee times from 6:00 AM to 5:30 PM with 8-minute intervals
function generateTeeTimes(): TeeTime[] {
  const times: TeeTime[] = [];
  const startHour = 6;
  const endHour = 17;
  const interval = 8; // minutes

  let id = 1;
  for (let hour = startHour; hour <= endHour; hour++) {
    for (let minute = 0; minute < 60; minute += interval) {
      if (hour === endHour && minute > 30) break;

      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      times.push({
        id: `tt-${id++}`,
        time,
        players: [],
        status: 'open',
      });
    }
  }

  return times;
}

// Mock data - add some bookings
const mockTeeTimes = generateTeeTimes().map((tt) => {
  // Add some mock bookings
  if (tt.time === '07:00') {
    return {
      ...tt,
      status: 'full' as const,
      players: [
        { id: 'p1', name: 'Somchai W.', memberId: 'M-0001', handicap: 12 },
        { id: 'p2', name: 'Prasert C.', memberId: 'M-0003', handicap: 8 },
        { id: 'p3', name: 'Wichai P.', memberId: 'M-0008', handicap: 15 },
        { id: 'p4', name: 'Narong T.', memberId: 'M-0012', handicap: 10 },
      ],
    };
  }
  if (tt.time === '07:08') {
    return {
      ...tt,
      status: 'partial' as const,
      players: [
        { id: 'p5', name: 'Apinya S.', memberId: 'M-0005', handicap: 18 },
        { id: 'p6', name: 'Guest - John', isGuest: true, handicap: 20 },
      ],
    };
  }
  if (tt.time === '08:00') {
    return {
      ...tt,
      status: 'full' as const,
      players: [
        { id: 'p7', name: 'Nisa W.', memberId: 'M-0002', handicap: 24 },
        { id: 'p8', name: 'Corporate Group', isGuest: true },
        { id: 'p9', name: 'Corporate Group', isGuest: true },
        { id: 'p10', name: 'Corporate Group', isGuest: true },
      ],
      notes: 'Corporate event - ABC Company',
    };
  }
  if (tt.time === '09:00') {
    return {
      ...tt,
      status: 'partial' as const,
      players: [
        { id: 'p11', name: 'Sompong K.', memberId: 'M-0015', handicap: 6 },
      ],
    };
  }
  if (tt.time === '12:00') {
    return {
      ...tt,
      status: 'blocked' as const,
      notes: 'Course maintenance',
    };
  }
  if (tt.time === '12:08') {
    return {
      ...tt,
      status: 'blocked' as const,
      notes: 'Course maintenance',
    };
  }
  return tt;
});

function formatTime(time: string) {
  const [hours = '0', minutes = '00'] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return `${displayHour}:${minutes} ${ampm}`;
}

function getStatusColor(status: TeeTime['status']) {
  switch (status) {
    case 'full':
      return 'bg-primary/10 border-primary/30';
    case 'partial':
      return 'bg-amber-50 border-amber-200';
    case 'blocked':
      return 'bg-muted border-muted';
    case 'open':
    default:
      return 'bg-background hover:bg-muted/50';
  }
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function PlayerSlot({ player, index }: { player?: Player; index: number }) {
  if (!player) {
    return (
      <div className="w-full h-10 border border-dashed rounded-md flex items-center justify-center text-muted-foreground text-xs hover:bg-muted/50 cursor-pointer transition-colors">
        <Plus className="h-3 w-3 mr-1" />
        Add Player
      </div>
    );
  }

  return (
    <div
      className={cn(
        'w-full h-10 px-2 flex items-center gap-2 rounded-md text-sm cursor-pointer hover:opacity-80 transition-opacity',
        player.isGuest
          ? 'bg-muted/50 border border-dashed'
          : 'bg-primary/10 border border-primary/20'
      )}
    >
      <Avatar className="h-6 w-6 text-[10px]">
        <AvatarFallback className={player.isGuest ? 'bg-muted' : 'bg-primary/20'}>
          {player.isGuest ? 'G' : getInitials(player.name)}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="truncate text-xs font-medium">{player.name}</p>
        {player.memberId && (
          <p className="text-[10px] text-muted-foreground">{player.memberId}</p>
        )}
      </div>
      {player.handicap !== undefined && (
        <span className="text-[10px] text-muted-foreground">
          HC {player.handicap}
        </span>
      )}
    </div>
  );
}

function TeeTimeRow({ teeTime }: { teeTime: TeeTime }) {
  const emptySlots = 4 - teeTime.players.length;
  const slots = [
    ...teeTime.players,
    ...Array(emptySlots).fill(undefined),
  ];

  return (
    <div
      className={cn(
        'grid grid-cols-[80px_1fr_1fr_1fr_1fr_40px] gap-2 p-2 border rounded-lg transition-colors',
        getStatusColor(teeTime.status)
      )}
    >
      {/* Time */}
      <div className="flex items-center">
        <div className="text-center">
          <p className="text-sm font-medium">{formatTime(teeTime.time)}</p>
          {teeTime.status === 'blocked' && (
            <Badge variant="secondary" className="text-[10px] mt-1">
              Blocked
            </Badge>
          )}
        </div>
      </div>

      {/* Player slots */}
      {teeTime.status === 'blocked' ? (
        <div className="col-span-4 flex items-center justify-center text-sm text-muted-foreground">
          {teeTime.notes || 'Not available'}
        </div>
      ) : (
        slots.map((player, index) => (
          <PlayerSlot key={index} player={player} index={index} />
        ))
      )}

      {/* Actions */}
      <div className="flex items-center justify-center">
        {teeTime.status !== 'blocked' && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Users className="mr-2 h-4 w-4" />
                Add Group
              </DropdownMenuItem>
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Add Single
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Clock className="mr-2 h-4 w-4" />
                Block Time
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}

export function TeeSheet({ date, course }: TeeSheetProps) {
  const [filter, setFilter] = useState<'all' | 'available' | 'booked'>('all');

  const filteredTeeTimes = useMemo(() => {
    switch (filter) {
      case 'available':
        return mockTeeTimes.filter(
          (tt) => tt.status === 'open' || tt.status === 'partial'
        );
      case 'booked':
        return mockTeeTimes.filter(
          (tt) => tt.status === 'full' || tt.status === 'partial'
        );
      default:
        return mockTeeTimes;
    }
  }, [filter]);

  // Group tee times by hour for better readability
  const groupedTeeTimes = useMemo(() => {
    const groups: Record<string, TeeTime[]> = {};
    filteredTeeTimes.forEach((tt) => {
      const hour = tt.time.split(':')[0] ?? '00';
      if (!groups[hour]) {
        groups[hour] = [];
      }
      groups[hour]?.push(tt);
    });
    return groups;
  }, [filteredTeeTimes]);

  // Summary stats
  const stats = useMemo(() => {
    const total = mockTeeTimes.filter((tt) => tt.status !== 'blocked').length;
    const booked = mockTeeTimes.filter(
      (tt) => tt.status === 'full' || tt.status === 'partial'
    ).length;
    const players = mockTeeTimes.reduce(
      (acc, tt) => acc + tt.players.length,
      0
    );
    return { total, booked, available: total - booked, players };
  }, []);

  return (
    <div className="space-y-4">
      {/* Stats Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6 text-sm">
          <div>
            <span className="text-muted-foreground">Total Times:</span>{' '}
            <span className="font-medium">{stats.total}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Booked:</span>{' '}
            <span className="font-medium text-primary">{stats.booked}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Available:</span>{' '}
            <span className="font-medium text-green-600">{stats.available}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Players:</span>{' '}
            <span className="font-medium">{stats.players}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Show:</span>
          <select
            className="h-8 rounded-md border border-input bg-background px-2 text-sm"
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'all' | 'available' | 'booked')}
          >
            <option value="all">All Times</option>
            <option value="available">Available</option>
            <option value="booked">Booked</option>
          </select>
        </div>
      </div>

      {/* Tee Sheet Grid */}
      <div className="border rounded-lg overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[80px_1fr_1fr_1fr_1fr_40px] gap-2 p-2 bg-muted/50 border-b text-sm font-medium">
          <div>Time</div>
          <div>Player 1</div>
          <div>Player 2</div>
          <div>Player 3</div>
          <div>Player 4</div>
          <div></div>
        </div>

        {/* Tee Times */}
        <div className="max-h-[600px] overflow-auto">
          {Object.entries(groupedTeeTimes).map(([hour, times]) => (
            <div key={hour} className="border-b last:border-b-0">
              {times.map((teeTime) => (
                <div key={teeTime.id} className="p-1">
                  <TeeTimeRow teeTime={teeTime} />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded border bg-background" />
          <span>Open</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded border bg-amber-50 border-amber-200" />
          <span>Partial</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded border bg-primary/10 border-primary/30" />
          <span>Full</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded border bg-muted" />
          <span>Blocked</span>
        </div>
      </div>
    </div>
  );
}
