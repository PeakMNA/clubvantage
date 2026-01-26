'use client'

import { useState, useMemo } from 'react'
import {
  Car,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Search,
  Plus,
  Battery,
  Gauge,
  Calendar
} from 'lucide-react'
import { PageHeader, Button, Input } from '@clubvantage/ui'
import type { Cart } from '@/components/golf/types'

// Extended cart type with maintenance info
interface ExtendedCart extends Cart {
  batteryLevel?: number
  mileage?: number
  nextServiceDue?: string
  lastServiceDate?: string
  maintenanceHistory?: {
    date: string
    type: string
    description: string
    technician: string
  }[]
}

const mockCarts: ExtendedCart[] = [
  {
    id: 'cart-1',
    number: '01',
    type: '2-seater',
    status: 'in-use',
    currentAssignment: '7:00 AM',
    batteryLevel: 85,
    mileage: 1250,
    nextServiceDue: '2024-02-15',
    lastServiceDate: '2024-01-15',
    maintenanceHistory: [
      { date: '2024-01-15', type: 'Routine', description: 'Battery check, tire rotation', technician: 'John' },
      { date: '2023-12-01', type: 'Repair', description: 'Brake pad replacement', technician: 'Mike' },
    ],
  },
  {
    id: 'cart-2',
    number: '02',
    type: '2-seater',
    status: 'in-use',
    currentAssignment: '7:08 AM',
    batteryLevel: 72,
    mileage: 1580,
    nextServiceDue: '2024-02-10',
    lastServiceDate: '2024-01-10',
  },
  {
    id: 'cart-3',
    number: '03',
    type: '4-seater',
    status: 'available',
    batteryLevel: 95,
    mileage: 890,
    nextServiceDue: '2024-02-28',
    lastServiceDate: '2024-01-28',
  },
  {
    id: 'cart-4',
    number: '04',
    type: '4-seater',
    status: 'maintenance',
    conditionNotes: 'Battery replacement needed',
    batteryLevel: 15,
    mileage: 2100,
    lastServiceDate: '2024-01-05',
    maintenanceHistory: [
      { date: '2024-01-30', type: 'Inspection', description: 'Battery failing, replacement ordered', technician: 'Mike' },
    ],
  },
  {
    id: 'cart-5',
    number: '05',
    type: '2-seater',
    status: 'available',
    batteryLevel: 88,
    mileage: 1420,
    nextServiceDue: '2024-02-20',
    lastServiceDate: '2024-01-20',
  },
  {
    id: 'cart-6',
    number: '06',
    type: '2-seater',
    status: 'in-use',
    currentAssignment: '7:16 AM',
    batteryLevel: 68,
    mileage: 1680,
    nextServiceDue: '2024-02-08',
    lastServiceDate: '2024-01-08',
  },
  {
    id: 'cart-7',
    number: '07',
    type: '4-seater',
    status: 'out-of-service',
    conditionNotes: 'Motor repair in progress',
    mileage: 3200,
    lastServiceDate: '2024-01-25',
  },
  {
    id: 'cart-8',
    number: '08',
    type: '2-seater',
    status: 'available',
    batteryLevel: 100,
    mileage: 450,
    nextServiceDue: '2024-03-15',
    lastServiceDate: '2024-01-30',
  },
]

type FilterStatus = 'all' | 'available' | 'in-use' | 'maintenance' | 'out-of-service'

export default function MaintenancePage() {
  const [carts, setCarts] = useState<ExtendedCart[]>(mockCarts)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')
  const [selectedCart, setSelectedCart] = useState<ExtendedCart | null>(null)

  const filteredCarts = useMemo(() => {
    return carts.filter(cart => {
      const matchesSearch = cart.number.includes(searchQuery) ||
        cart.conditionNotes?.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesFilter = filterStatus === 'all' || cart.status === filterStatus
      return matchesSearch && matchesFilter
    })
  }, [carts, searchQuery, filterStatus])

  const availableCount = useMemo(() => carts.filter(c => c.status === 'available').length, [carts])
  const inUseCount = useMemo(() => carts.filter(c => c.status === 'in-use').length, [carts])
  const maintenanceCount = useMemo(() => carts.filter(c => c.status === 'maintenance').length, [carts])
  const outOfServiceCount = useMemo(() => carts.filter(c => c.status === 'out-of-service').length, [carts])

  const needsServiceSoon = useMemo(() => {
    const today = new Date()
    const oneWeekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
    return carts.filter(c => {
      if (!c.nextServiceDue) return false
      const serviceDate = new Date(c.nextServiceDue)
      return serviceDate <= oneWeekFromNow && c.status !== 'maintenance' && c.status !== 'out-of-service'
    })
  }, [carts])

  const statusColors: Record<ExtendedCart['status'], string> = {
    available: 'bg-emerald-500',
    'in-use': 'bg-blue-500',
    maintenance: 'bg-amber-500',
    'out-of-service': 'bg-red-500',
  }

  const statusIcons: Record<ExtendedCart['status'], React.ReactNode> = {
    available: <CheckCircle2 className="h-4 w-4" />,
    'in-use': <Car className="h-4 w-4" />,
    maintenance: <Wrench className="h-4 w-4" />,
    'out-of-service': <XCircle className="h-4 w-4" />,
  }

  const getBatteryColor = (level?: number) => {
    if (!level) return 'text-stone-400'
    if (level >= 70) return 'text-emerald-500'
    if (level >= 30) return 'text-amber-500'
    return 'text-red-500'
  }

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Cart Maintenance"
        description="Manage cart inventory, status, and maintenance schedules"
        breadcrumbs={[
          { label: 'Golf', href: '/golf' },
          { label: 'Maintenance' },
        ]}
        actions={
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Schedule Maintenance
          </Button>
        }
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-card border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Car className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <div className="text-2xl font-bold">{carts.length}</div>
              <div className="text-sm text-muted-foreground">Total Carts</div>
            </div>
          </div>
        </div>
        <div className="bg-card border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <div className="text-2xl font-bold">{availableCount}</div>
              <div className="text-sm text-muted-foreground">Available</div>
            </div>
          </div>
        </div>
        <div className="bg-card border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Car className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <div className="text-2xl font-bold">{inUseCount}</div>
              <div className="text-sm text-muted-foreground">In Use</div>
            </div>
          </div>
        </div>
        <div className="bg-card border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <Wrench className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <div className="text-2xl font-bold">{maintenanceCount}</div>
              <div className="text-sm text-muted-foreground">In Maintenance</div>
            </div>
          </div>
        </div>
        <div className="bg-card border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/10 rounded-lg">
              <XCircle className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <div className="text-2xl font-bold">{outOfServiceCount}</div>
              <div className="text-sm text-muted-foreground">Out of Service</div>
            </div>
          </div>
        </div>
      </div>

      {/* Service Due Alert */}
      {needsServiceSoon.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-center gap-2 text-amber-800 mb-2">
            <AlertTriangle className="h-5 w-5" />
            <span className="font-medium">Service Due Soon</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {needsServiceSoon.map(cart => (
              <span key={cart.id} className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm">
                Cart #{cart.number} - Due {cart.nextServiceDue}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart List */}
        <div className="lg:col-span-2 bg-card border rounded-xl">
          <div className="p-4 border-b">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by cart number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex border border-border rounded-md overflow-hidden">
                {(['all', 'available', 'in-use', 'maintenance'] as FilterStatus[]).map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-3 py-1.5 text-sm capitalize ${
                      filterStatus === status
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted'
                    }`}
                  >
                    {status === 'in-use' ? 'In Use' : status}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
            {filteredCarts.map(cart => (
              <div
                key={cart.id}
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  selectedCart?.id === cart.id ? 'ring-2 ring-primary' : 'hover:border-primary/50'
                }`}
                onClick={() => setSelectedCart(cart)}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Car className="h-5 w-5 text-muted-foreground" />
                    <span className="font-semibold text-lg">#{cart.number}</span>
                    <span className="text-sm text-muted-foreground">{cart.type}</span>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs text-white flex items-center gap-1 ${statusColors[cart.status]}`}>
                    {statusIcons[cart.status]}
                    <span className="capitalize">{cart.status.replace('-', ' ')}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  {cart.batteryLevel !== undefined && (
                    <div className="flex items-center gap-1">
                      <Battery className={`h-4 w-4 ${getBatteryColor(cart.batteryLevel)}`} />
                      <span>{cart.batteryLevel}%</span>
                    </div>
                  )}
                  {cart.mileage !== undefined && (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Gauge className="h-4 w-4" />
                      <span>{cart.mileage.toLocaleString()} mi</span>
                    </div>
                  )}
                </div>

                {cart.currentAssignment && (
                  <div className="mt-2 text-sm text-blue-600">
                    Assigned to {cart.currentAssignment}
                  </div>
                )}

                {cart.conditionNotes && (
                  <div className="mt-2 text-sm text-amber-600 bg-amber-50 px-2 py-1 rounded">
                    {cart.conditionNotes}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Cart Details Panel */}
        <div className="bg-card border rounded-xl">
          {selectedCart ? (
            <div>
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-lg">Cart #{selectedCart.number}</h2>
                  <div className={`px-2 py-1 rounded-full text-xs text-white ${statusColors[selectedCart.status]}`}>
                    {selectedCart.status.replace('-', ' ')}
                  </div>
                </div>
              </div>
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Type</div>
                    <div className="font-medium">{selectedCart.type}</div>
                  </div>
                  {selectedCart.batteryLevel !== undefined && (
                    <div>
                      <div className="text-sm text-muted-foreground">Battery</div>
                      <div className={`font-medium flex items-center gap-1 ${getBatteryColor(selectedCart.batteryLevel)}`}>
                        <Battery className="h-4 w-4" />
                        {selectedCart.batteryLevel}%
                      </div>
                    </div>
                  )}
                  {selectedCart.mileage !== undefined && (
                    <div>
                      <div className="text-sm text-muted-foreground">Mileage</div>
                      <div className="font-medium">{selectedCart.mileage.toLocaleString()} mi</div>
                    </div>
                  )}
                  {selectedCart.lastServiceDate && (
                    <div>
                      <div className="text-sm text-muted-foreground">Last Service</div>
                      <div className="font-medium">{selectedCart.lastServiceDate}</div>
                    </div>
                  )}
                </div>

                {selectedCart.nextServiceDue && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2 text-blue-800">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm font-medium">Next Service Due: {selectedCart.nextServiceDue}</span>
                    </div>
                  </div>
                )}

                {selectedCart.conditionNotes && (
                  <div className="p-3 bg-amber-50 rounded-lg">
                    <div className="text-sm font-medium text-amber-800 mb-1">Notes</div>
                    <div className="text-sm text-amber-700">{selectedCart.conditionNotes}</div>
                  </div>
                )}

                {selectedCart.maintenanceHistory && selectedCart.maintenanceHistory.length > 0 && (
                  <div>
                    <h3 className="font-medium mb-2">Maintenance History</h3>
                    <div className="space-y-2">
                      {selectedCart.maintenanceHistory.map((record, idx) => (
                        <div key={idx} className="text-sm p-2 bg-muted rounded">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{record.type}</span>
                            <span className="text-muted-foreground">{record.date}</span>
                          </div>
                          <div className="text-muted-foreground">{record.description}</div>
                          <div className="text-xs text-muted-foreground">By: {record.technician}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1">
                    <Wrench className="mr-2 h-4 w-4" />
                    Schedule Service
                  </Button>
                  {selectedCart.status === 'maintenance' && (
                    <Button className="flex-1">
                      Mark Ready
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              <Car className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>Select a cart to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
