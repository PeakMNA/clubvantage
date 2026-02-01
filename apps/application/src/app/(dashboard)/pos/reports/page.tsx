import { Calendar, Download, TrendingUp, DollarSign, ShoppingBag, Users, BarChart3, PieChart, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { Button, Card, CardContent, CardHeader, CardTitle } from '@clubvantage/ui'

// Mock report data
const summaryStats = {
  totalRevenue: 2450000,
  revenueChange: 12.5,
  transactions: 1847,
  transactionsChange: 8.3,
  averageTicket: 1326,
  averageTicketChange: 3.8,
  uniqueCustomers: 423,
  customersChange: -2.1,
}

const topSellingItems = [
  { name: 'Golf Balls (Titleist Pro V1)', quantity: 156, revenue: 312000 },
  { name: 'Club Sandwich', quantity: 234, revenue: 58500 },
  { name: 'Cart Rental (18 holes)', quantity: 189, revenue: 283500 },
  { name: 'Grilled Salmon', quantity: 98, revenue: 88200 },
  { name: 'Golf Gloves', quantity: 87, revenue: 43500 },
]

const outletPerformance = [
  { name: 'Pro Shop', revenue: 980000, transactions: 412, percentage: 40 },
  { name: 'Main Restaurant', revenue: 750000, transactions: 892, percentage: 31 },
  { name: 'Poolside Bar', revenue: 420000, transactions: 398, percentage: 17 },
  { name: 'Fitness Center', revenue: 300000, transactions: 145, percentage: 12 },
]

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
  }).format(amount)
}

function ChangeIndicator({ value }: { value: number }) {
  const isPositive = value >= 0
  return (
    <span className={`inline-flex items-center text-sm font-medium ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
      {isPositive ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
      {Math.abs(value)}%
    </span>
  )
}

export default function POSReportsPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-stone-900">POS Reports</h1>
          <p className="text-sm text-stone-500 mt-1">
            Sales analytics and performance insights
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <Calendar className="h-4 w-4" />
            This Month
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-emerald-600" />
              </div>
              <ChangeIndicator value={summaryStats.revenueChange} />
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold text-stone-900">
                {formatCurrency(summaryStats.totalRevenue)}
              </div>
              <p className="text-sm text-stone-500">Total Revenue</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <ShoppingBag className="h-5 w-5 text-blue-600" />
              </div>
              <ChangeIndicator value={summaryStats.transactionsChange} />
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold text-stone-900">
                {summaryStats.transactions.toLocaleString()}
              </div>
              <p className="text-sm text-stone-500">Transactions</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-amber-600" />
              </div>
              <ChangeIndicator value={summaryStats.averageTicketChange} />
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold text-stone-900">
                {formatCurrency(summaryStats.averageTicket)}
              </div>
              <p className="text-sm text-stone-500">Average Ticket</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <ChangeIndicator value={summaryStats.customersChange} />
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold text-stone-900">
                {summaryStats.uniqueCustomers}
              </div>
              <p className="text-sm text-stone-500">Unique Customers</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue Trend Chart Placeholder */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-stone-400" />
                Revenue Trend
              </CardTitle>
              <Button variant="ghost" size="sm">
                Daily
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-stone-50 rounded-lg border border-dashed border-stone-200">
              <div className="text-center text-stone-500">
                <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Revenue chart coming soon</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Outlet Performance Chart Placeholder */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5 text-stone-400" />
                Revenue by Outlet
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-stone-50 rounded-lg border border-dashed border-stone-200">
              <div className="text-center text-stone-500">
                <PieChart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Outlet breakdown chart coming soon</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tables Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Selling Items */}
        <Card>
          <CardHeader>
            <CardTitle>Top Selling Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topSellingItems.map((item, index) => (
                <div key={item.name} className="flex items-center gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-100 text-sm font-medium text-stone-600">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-stone-900 truncate">{item.name}</p>
                    <p className="text-xs text-stone-500">{item.quantity} sold</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-stone-900">
                      {formatCurrency(item.revenue)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Outlet Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Outlet Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {outletPerformance.map((outlet) => (
                <div key={outlet.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-stone-900">{outlet.name}</span>
                    <span className="text-sm text-stone-500">{outlet.percentage}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-stone-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500"
                      style={{ width: `${outlet.percentage}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-stone-500">
                    <span>{formatCurrency(outlet.revenue)}</span>
                    <span>{outlet.transactions} transactions</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
