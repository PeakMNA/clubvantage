import { Search, Filter, Download, Eye, Receipt, MoreHorizontal, Calendar } from 'lucide-react'
import { Button, Card, CardContent, CardHeader, CardTitle } from '@clubvantage/ui'

// Mock transaction data
const mockTransactions = [
  {
    id: 'TXN-2024-0001',
    date: '2024-01-28 14:32',
    outlet: 'Pro Shop',
    member: 'John Smith',
    memberNumber: 'M001',
    items: 3,
    total: 4500,
    paymentMethod: 'Member Account',
    status: 'completed',
    staff: 'Sarah L.',
  },
  {
    id: 'TXN-2024-0002',
    date: '2024-01-28 14:15',
    outlet: 'Main Restaurant',
    member: 'Emily Chen',
    memberNumber: 'M042',
    items: 5,
    total: 2850,
    paymentMethod: 'Credit Card',
    status: 'completed',
    staff: 'Mike T.',
  },
  {
    id: 'TXN-2024-0003',
    date: '2024-01-28 13:45',
    outlet: 'Poolside Bar',
    member: 'Guest',
    memberNumber: null,
    items: 2,
    total: 680,
    paymentMethod: 'Cash',
    status: 'completed',
    staff: 'Anna K.',
  },
  {
    id: 'TXN-2024-0004',
    date: '2024-01-28 13:20',
    outlet: 'Pro Shop',
    member: 'Robert Wilson',
    memberNumber: 'M108',
    items: 1,
    total: 12500,
    paymentMethod: 'Member Account',
    status: 'voided',
    staff: 'Sarah L.',
  },
  {
    id: 'TXN-2024-0005',
    date: '2024-01-28 12:55',
    outlet: 'Main Restaurant',
    member: 'David Lee',
    memberNumber: 'M023',
    items: 8,
    total: 5680,
    paymentMethod: 'Member Account',
    status: 'completed',
    staff: 'Mike T.',
  },
]

function StatusBadge({ status }: { status: 'completed' | 'voided' | 'refunded' }) {
  const styles = {
    completed: 'bg-emerald-100 text-emerald-700',
    voided: 'bg-red-100 text-red-700',
    refunded: 'bg-amber-100 text-amber-700',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
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

export default function POSTransactionsPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-stone-900">Transaction History</h1>
          <p className="text-sm text-stone-500 mt-1">
            View and manage all POS transactions
          </p>
        </div>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
              <input
                type="text"
                placeholder="Search by transaction ID, member, or staff..."
                className="w-full pl-9 pr-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
            <Button variant="outline" className="gap-2">
              <Calendar className="h-4 w-4" />
              Today
            </Button>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              All Outlets
            </Button>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              All Status
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-stone-900">108</div>
            <p className="text-sm text-stone-500">Today's Transactions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-emerald-600">{formatCurrency(205500)}</div>
            <p className="text-sm text-stone-500">Today's Revenue</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-stone-900">{formatCurrency(1903)}</div>
            <p className="text-sm text-stone-500">Avg. Transaction</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">3</div>
            <p className="text-sm text-stone-500">Voided Today</p>
          </CardContent>
        </Card>
      </div>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Transactions</CardTitle>
            <span className="text-sm text-stone-500">Showing 1-5 of 108</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-sm text-stone-500">
                  <th className="pb-3 font-medium">Transaction ID</th>
                  <th className="pb-3 font-medium">Date & Time</th>
                  <th className="pb-3 font-medium">Outlet</th>
                  <th className="pb-3 font-medium">Member</th>
                  <th className="pb-3 font-medium">Items</th>
                  <th className="pb-3 font-medium">Payment</th>
                  <th className="pb-3 font-medium text-right">Total</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Staff</th>
                  <th className="pb-3 font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {mockTransactions.map((txn) => (
                  <tr key={txn.id} className="hover:bg-stone-50">
                    <td className="py-4">
                      <span className="font-mono text-sm text-stone-900">{txn.id}</span>
                    </td>
                    <td className="py-4 text-sm text-stone-600">{txn.date}</td>
                    <td className="py-4 text-sm text-stone-600">{txn.outlet}</td>
                    <td className="py-4">
                      <div>
                        <div className="text-sm font-medium text-stone-900">{txn.member}</div>
                        {txn.memberNumber && (
                          <div className="text-xs text-stone-500">{txn.memberNumber}</div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 text-sm text-stone-600">{txn.items}</td>
                    <td className="py-4 text-sm text-stone-600">{txn.paymentMethod}</td>
                    <td className="py-4 text-right font-medium text-stone-900">
                      {formatCurrency(txn.total)}
                    </td>
                    <td className="py-4">
                      <StatusBadge status={txn.status as 'completed' | 'voided' | 'refunded'} />
                    </td>
                    <td className="py-4 text-sm text-stone-600">{txn.staff}</td>
                    <td className="py-4">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Receipt className="h-4 w-4" />
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

          {/* Pagination Placeholder */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <p className="text-sm text-stone-500">Page 1 of 22</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm">
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
