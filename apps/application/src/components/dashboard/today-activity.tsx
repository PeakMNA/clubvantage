'use client';

import { Calendar, Flag, Users, CreditCard } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Badge } from '@clubvantage/ui';

interface Activity {
  id: string;
  type: 'booking' | 'golf' | 'payment' | 'member';
  title: string;
  time: string;
  status: 'upcoming' | 'in_progress' | 'completed';
  details?: string;
}

// Mock data
const activities: Activity[] = [
  {
    id: '1',
    type: 'golf',
    title: 'Tee Time - Somchai P.',
    time: '06:30',
    status: 'completed',
    details: '4 players, Main Course',
  },
  {
    id: '2',
    type: 'booking',
    title: 'Tennis Court 1',
    time: '07:00',
    status: 'completed',
    details: 'Nattaya W. + 1 guest',
  },
  {
    id: '3',
    type: 'golf',
    title: 'Tee Time - John D.',
    time: '08:15',
    status: 'in_progress',
    details: '3 players, Main Course',
  },
  {
    id: '4',
    type: 'booking',
    title: 'Pool Reservation',
    time: '09:00',
    status: 'upcoming',
    details: 'Corporate Event - 20 pax',
  },
  {
    id: '5',
    type: 'payment',
    title: 'Payment Received',
    time: '10:30',
    status: 'upcoming',
    details: '฿45,000 - M-1023',
  },
];

const typeIcons = {
  booking: Calendar,
  golf: Flag,
  payment: CreditCard,
  member: Users,
};

const statusColors = {
  upcoming: 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-400',
  in_progress: 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-400',
  completed: 'bg-stone-100 text-stone-700 dark:bg-stone-500/20 dark:text-stone-400',
};

export function TodayActivity() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Today's Activity</CardTitle>
        <span className="text-sm text-muted-foreground">
          {activities.length} activities
        </span>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-[400px] overflow-y-auto">
          {activities.map((activity) => {
            const Icon = typeIcons[activity.type];
            return (
              <div
                key={activity.id}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
                  <Icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium truncate">{activity.title}</p>
                    <span className="text-sm text-muted-foreground shrink-0">
                      {activity.time}
                    </span>
                  </div>
                  {activity.details && (
                    <p className="text-sm text-muted-foreground truncate">
                      {activity.details}
                    </p>
                  )}
                </div>
                <Badge
                  variant="secondary"
                  className={statusColors[activity.status]}
                >
                  {activity.status.replace('_', ' ')}
                </Badge>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
