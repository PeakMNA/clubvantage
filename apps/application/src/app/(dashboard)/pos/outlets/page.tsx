import { Plus, Settings, MoreHorizontal, MapPin, Monitor } from 'lucide-react'
import { Button, Card, CardContent, CardHeader, CardTitle } from '@clubvantage/ui'

// Mock outlet data
const mockOutlets = [
  {
    id: '1',
    name: 'Pro Shop',
    location: 'Clubhouse - Ground Floor',
    template: 'Golf Pro Shop',
    status: 'active',
    terminals: 2,
    todaySales: 45000,
    transactions: 23,
  },
  {
    id: '2',
    name: 'Main Restaurant',
    location: 'Clubhouse - First Floor',
    template: 'Restaurant & Bar',
    status: 'active',
    terminals: 3,
    todaySales: 128500,
    transactions: 67,
  },
  {
    id: '3',
    name: 'Poolside Bar',
    location: 'Pool Area',
    template: 'Restaurant & Bar',
    status: 'active',
    terminals: 1,
    todaySales: 32000,
    transactions: 18,
  },
  {
    id: '4',
    name: 'Fitness Center',
    location: 'Sports Complex',
    template: 'Fitness Center',
    status: 'inactive',
    terminals: 1,
    todaySales: 0,
    transactions: 0,
  },
]

function StatusBadge({ status }: { status: 'active' | 'inactive' }) {
  if (status === 'active') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5" />
        Active
      </span>
    )
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-stone-100 text-stone-600">
      <span className="w-1.5 h-1.5 rounded-full bg-stone-400 mr-1.5" />
      Inactive
    </span>
  )
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
  }).format(amount)
}

export default function POSOutletsPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-stone-900">POS Outlets</h1>
          <p className="text-sm text-stone-500 mt-1">
            Manage outlet locations and their assigned templates
          </p>
        </div>
        <Button className="bg-gradient-to-br from-amber-500 to-amber-600 text-white">
          <Plus className="mr-2 h-4 w-4" />
          Add Outlet
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-stone-900">{mockOutlets.length}</div>
            <p className="text-sm text-stone-500">Total Outlets</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-emerald-600">
              {mockOutlets.filter((o) => o.status === 'active').length}
            </div>
            <p className="text-sm text-stone-500">Active Outlets</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-stone-900">
              {mockOutlets.reduce((sum, o) => sum + o.terminals, 0)}
            </div>
            <p className="text-sm text-stone-500">Total Terminals</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-amber-600">
              {formatCurrency(mockOutlets.reduce((sum, o) => sum + o.todaySales, 0))}
            </div>
            <p className="text-sm text-stone-500">Today's Sales</p>
          </CardContent>
        </Card>
      </div>

      {/* Outlets Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Outlets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-sm text-stone-500">
                  <th className="pb-3 font-medium">Outlet</th>
                  <th className="pb-3 font-medium">Location</th>
                  <th className="pb-3 font-medium">Template</th>
                  <th className="pb-3 font-medium">Terminals</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium text-right">Today's Sales</th>
                  <th className="pb-3 font-medium text-right">Transactions</th>
                  <th className="pb-3 font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {mockOutlets.map((outlet) => (
                  <tr key={outlet.id} className="hover:bg-stone-50">
                    <td className="py-4">
                      <div className="font-medium text-stone-900">{outlet.name}</div>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-1.5 text-sm text-stone-600">
                        <MapPin className="h-3.5 w-3.5" />
                        {outlet.location}
                      </div>
                    </td>
                    <td className="py-4">
                      <span className="text-sm text-stone-600">{outlet.template}</span>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-1.5 text-sm text-stone-600">
                        <Monitor className="h-3.5 w-3.5" />
                        {outlet.terminals}
                      </div>
                    </td>
                    <td className="py-4">
                      <StatusBadge status={outlet.status as 'active' | 'inactive'} />
                    </td>
                    <td className="py-4 text-right font-medium text-stone-900">
                      {formatCurrency(outlet.todaySales)}
                    </td>
                    <td className="py-4 text-right text-stone-600">
                      {outlet.transactions}
                    </td>
                    <td className="py-4">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
