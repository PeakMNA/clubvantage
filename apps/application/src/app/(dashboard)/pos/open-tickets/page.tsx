import { Search, Filter, Clock, AlertTriangle, User, MapPin, RefreshCw } from 'lucide-react'
import { Button, Card, CardContent, CardHeader, CardTitle } from '@clubvantage/ui'

// Mock open ticket data
const mockOpenTickets = [
  {
    id: 'TKT-2024-0089',
    createdAt: '2024-01-28 14:45',
    outlet: 'Main Restaurant',
    table: 'Table 12',
    member: 'Michael Chen',
    memberNumber: 'M033',
    items: 4,
    subtotal: 3200,
    elapsedMinutes: 15,
    staff: 'Mike T.',
    status: 'active',
  },
  {
    id: 'TKT-2024-0088',
    createdAt: '2024-01-28 14:30',
    outlet: 'Poolside Bar',
    table: 'Cabana 3',
    member: 'Sarah Johnson',
    memberNumber: 'M067',
    items: 2,
    subtotal: 850,
    elapsedMinutes: 30,
    staff: 'Anna K.',
    status: 'active',
  },
  {
    id: 'TKT-2024-0087',
    createdAt: '2024-01-28 14:00',
    outlet: 'Main Restaurant',
    table: 'Patio 5',
    member: 'Robert Wilson',
    memberNumber: 'M108',
    items: 6,
    subtotal: 4500,
    elapsedMinutes: 60,
    staff: 'Mike T.',
    status: 'warning',
  },
  {
    id: 'TKT-2024-0085',
    createdAt: '2024-01-28 13:15',
    outlet: 'Main Restaurant',
    table: 'VIP Room 1',
    member: 'David Lee',
    memberNumber: 'M023',
    items: 12,
    subtotal: 15800,
    elapsedMinutes: 105,
    staff: 'Mike T.',
    status: 'warning',
  },
]

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
  }).format(amount)
}

function formatElapsedTime(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`
  }
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours}h ${mins}m`
}

function ElapsedBadge({ minutes }: { minutes: number }) {
  let className = 'bg-stone-100 text-stone-600'
  if (minutes >= 60) {
    className = 'bg-red-100 text-red-700'
  } else if (minutes >= 30) {
    className = 'bg-amber-100 text-amber-700'
  }
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${className}`}>
      <Clock className="h-3 w-3" />
      {formatElapsedTime(minutes)}
    </span>
  )
}

export default function POSOpenTicketsPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-stone-900">Open Tickets</h1>
          <p className="text-sm text-stone-500 mt-1">
            Manage incomplete transactions and active tabs
          </p>
        </div>
        <Button variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-stone-900">{mockOpenTickets.length}</div>
            <p className="text-sm text-stone-500">Open Tickets</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-amber-600">
              {formatCurrency(mockOpenTickets.reduce((sum, t) => sum + t.subtotal, 0))}
            </div>
            <p className="text-sm text-stone-500">Pending Amount</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-stone-900">
              {mockOpenTickets.reduce((sum, t) => sum + t.items, 0)}
            </div>
            <p className="text-sm text-stone-500">Total Items</p>
          </CardContent>
        </Card>
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <div className="text-2xl font-bold text-amber-600">
                {mockOpenTickets.filter((t) => t.elapsedMinutes >= 60).length}
              </div>
            </div>
            <p className="text-sm text-amber-700">Over 1 Hour</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
              <input
                type="text"
                placeholder="Search by ticket ID, member, or table..."
                className="w-full pl-9 pr-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              All Outlets
            </Button>
            <Button variant="outline" className="gap-2">
              <Clock className="h-4 w-4" />
              All Time
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Open Tickets Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {mockOpenTickets.map((ticket) => (
          <Card
            key={ticket.id}
            className={`hover:shadow-md transition-shadow ${
              ticket.status === 'warning' ? 'border-amber-200' : ''
            }`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-medium text-stone-900">
                      {ticket.id}
                    </span>
                    <ElapsedBadge minutes={ticket.elapsedMinutes} />
                  </div>
                  <p className="text-sm text-stone-500 mt-1">{ticket.outlet}</p>
                </div>
                {ticket.status === 'warning' && (
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-stone-400" />
                  <span className="text-sm font-medium text-stone-900">{ticket.table}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-stone-400" />
                  <div>
                    <span className="text-sm font-medium text-stone-900">{ticket.member}</span>
                    <span className="text-xs text-stone-500 ml-2">{ticket.memberNumber}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-3 border-t">
                  <div className="text-sm text-stone-500">
                    {ticket.items} items
                  </div>
                  <div className="text-lg font-semibold text-stone-900">
                    {formatCurrency(ticket.subtotal)}
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-stone-400">
                  <span>Started {ticket.createdAt}</span>
                  <span>Staff: {ticket.staff}</span>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button variant="outline" size="sm" className="flex-1">
                  View Details
                </Button>
                <Button
                  size="sm"
                  className="flex-1 bg-gradient-to-br from-amber-500 to-amber-600 text-white"
                >
                  Close Ticket
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {mockOpenTickets.length === 0 && (
        <Card className="py-12">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
              <Clock className="h-6 w-6 text-emerald-600" />
            </div>
            <h3 className="text-lg font-medium text-stone-900">No open tickets</h3>
            <p className="text-sm text-stone-500 mt-1">
              All transactions have been completed.
            </p>
          </div>
        </Card>
      )}
    </div>
  )
}
