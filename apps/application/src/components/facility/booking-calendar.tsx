'use client';

import { useState, useMemo } from 'react';
import { cn } from '@clubvantage/ui';

interface Booking {
  id: string;
  resourceId: string;
  memberName: string;
  memberId: string;
  startTime: string;
  endTime: string;
  status: 'confirmed' | 'pending' | 'cancelled';
}

interface Resource {
  id: string;
  name: string;
  type: string;
}

interface BookingCalendarProps {
  date: Date;
  resourceType: string;
}

// Mock resources by type
const resourcesByType: Record<string, Resource[]> = {
  tennis: [
    { id: 'tc-1', name: 'Tennis Court 1', type: 'tennis' },
    { id: 'tc-2', name: 'Tennis Court 2', type: 'tennis' },
    { id: 'tc-3', name: 'Tennis Court 3', type: 'tennis' },
    { id: 'tc-4', name: 'Tennis Court 4', type: 'tennis' },
  ],
  pool: [
    { id: 'pl-1', name: 'Lane 1', type: 'pool' },
    { id: 'pl-2', name: 'Lane 2', type: 'pool' },
    { id: 'pl-3', name: 'Lane 3', type: 'pool' },
    { id: 'pl-4', name: 'Lane 4', type: 'pool' },
    { id: 'pl-5', name: 'Lane 5', type: 'pool' },
    { id: 'pl-6', name: 'Lane 6', type: 'pool' },
  ],
  gym: [
    { id: 'gym-1', name: 'Personal Training Room 1', type: 'gym' },
    { id: 'gym-2', name: 'Personal Training Room 2', type: 'gym' },
    { id: 'gym-3', name: 'Group Fitness Studio', type: 'gym' },
  ],
};

// Mock bookings
const mockBookings: Booking[] = [
  {
    id: '1',
    resourceId: 'tc-1',
    memberName: 'Somchai W.',
    memberId: 'M-0001',
    startTime: '09:00',
    endTime: '10:00',
    status: 'confirmed',
  },
  {
    id: '2',
    resourceId: 'tc-1',
    memberName: 'Prasert C.',
    memberId: 'M-0003',
    startTime: '14:00',
    endTime: '15:00',
    status: 'confirmed',
  },
  {
    id: '3',
    resourceId: 'tc-2',
    memberName: 'Nisa W.',
    memberId: 'M-0002',
    startTime: '10:00',
    endTime: '11:00',
    status: 'pending',
  },
  {
    id: '4',
    resourceId: 'tc-3',
    memberName: 'Apinya S.',
    memberId: 'M-0005',
    startTime: '16:00',
    endTime: '18:00',
    status: 'confirmed',
  },
  {
    id: '5',
    resourceId: 'pl-1',
    memberName: 'Wichai P.',
    memberId: 'M-0008',
    startTime: '07:00',
    endTime: '08:00',
    status: 'confirmed',
  },
  {
    id: '6',
    resourceId: 'pl-2',
    memberName: 'Narong T.',
    memberId: 'M-0012',
    startTime: '08:00',
    endTime: '09:00',
    status: 'confirmed',
  },
];

// Generate time slots (6 AM to 10 PM)
const timeSlots = Array.from({ length: 17 }, (_, i) => {
  const hour = i + 6;
  return {
    time: `${hour.toString().padStart(2, '0')}:00`,
    label: `${hour > 12 ? hour - 12 : hour}:00 ${hour >= 12 ? 'PM' : 'AM'}`,
  };
});

function getBookingStyle(booking: Booking) {
  const startHour = parseInt(booking.startTime.split(':')[0] ?? '0');
  const endHour = parseInt(booking.endTime.split(':')[0] ?? '0');
  const duration = endHour - startHour;
  const topOffset = (startHour - 6) * 48; // 48px per hour
  const height = duration * 48;

  return {
    top: `${topOffset}px`,
    height: `${height}px`,
  };
}

function getStatusColor(status: Booking['status']) {
  switch (status) {
    case 'confirmed':
      return 'bg-primary/90 text-primary-foreground';
    case 'pending':
      return 'bg-amber-500/90 text-white';
    case 'cancelled':
      return 'bg-muted text-muted-foreground line-through';
    default:
      return 'bg-muted';
  }
}

export function BookingCalendar({ date, resourceType }: BookingCalendarProps) {
  const [selectedSlot, setSelectedSlot] = useState<{
    resourceId: string;
    time: string;
  } | null>(null);

  const resources = resourcesByType[resourceType] ?? resourcesByType.tennis ?? [];

  const bookingsByResource = useMemo(() => {
    const map: Record<string, Booking[]> = {};
    mockBookings
      .filter((b) => resources.some((r) => r.id === b.resourceId))
      .forEach((booking) => {
        if (!map[booking.resourceId]) {
          map[booking.resourceId] = [];
        }
        map[booking.resourceId]?.push(booking);
      });
    return map;
  }, [resources]);

  const handleSlotClick = (resourceId: string, time: string) => {
    setSelectedSlot({ resourceId, time });
    // Here you would open a booking dialog
    console.log('Create booking:', { resourceId, time, date });
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Header with resource names */}
      <div className="flex border-b bg-muted/50">
        <div className="w-20 flex-shrink-0 p-2 border-r font-medium text-sm text-muted-foreground">
          Time
        </div>
        {resources.map((resource) => (
          <div
            key={resource.id}
            className="flex-1 min-w-[120px] p-2 border-r last:border-r-0 font-medium text-sm text-center"
          >
            {resource.name}
          </div>
        ))}
      </div>

      {/* Time grid */}
      <div className="flex overflow-auto max-h-[600px]">
        {/* Time column */}
        <div className="w-20 flex-shrink-0 border-r">
          {timeSlots.map((slot) => (
            <div
              key={slot.time}
              className="h-12 border-b text-xs text-muted-foreground p-1 text-right pr-2"
            >
              {slot.label}
            </div>
          ))}
        </div>

        {/* Resource columns */}
        {resources.map((resource) => (
          <div
            key={resource.id}
            className="flex-1 min-w-[120px] border-r last:border-r-0 relative"
          >
            {/* Time slot grid */}
            {timeSlots.map((slot) => (
              <div
                key={slot.time}
                className={cn(
                  'h-12 border-b cursor-pointer hover:bg-muted/50 transition-colors',
                  selectedSlot?.resourceId === resource.id &&
                    selectedSlot?.time === slot.time &&
                    'bg-primary/10'
                )}
                onClick={() => handleSlotClick(resource.id, slot.time)}
              />
            ))}

            {/* Bookings overlay */}
            {bookingsByResource[resource.id]?.map((booking) => (
              <div
                key={booking.id}
                className={cn(
                  'absolute left-1 right-1 rounded-md px-2 py-1 text-xs cursor-pointer hover:opacity-90 transition-opacity overflow-hidden',
                  getStatusColor(booking.status)
                )}
                style={getBookingStyle(booking)}
                onClick={(e) => {
                  e.stopPropagation();
                  console.log('View booking:', booking);
                }}
              >
                <p className="font-medium truncate">{booking.memberName}</p>
                <p className="opacity-80 truncate">
                  {booking.startTime} - {booking.endTime}
                </p>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 p-2 border-t bg-muted/30 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-primary" />
          <span>Confirmed</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-amber-500" />
          <span>Pending</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-muted border" />
          <span>Available</span>
        </div>
      </div>
    </div>
  );
}
