'use client'

import { useState, useMemo } from 'react'
import { format, formatDistanceToNow, subDays } from 'date-fns'
import {
  ChevronDown,
  ChevronRight,
  Download,
  RefreshCw,
  LogIn,
  LogOut,
  Plus,
  Edit,
  Trash2,
  Eye,
  FileDown,
} from 'lucide-react'
import { Button } from '@clubvantage/ui'
import { Badge } from '@clubvantage/ui'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@clubvantage/ui'
import { Checkbox, cn } from '@clubvantage/ui'
import { mockActivityEntries, mockUsers } from './mock-data'
import type { ActivityEntry } from './types'

const actionIcons: Record<ActivityEntry['action'], typeof LogIn> = {
  login: LogIn,
  logout: LogOut,
  create: Plus,
  update: Edit,
  delete: Trash2,
  view: Eye,
  export: FileDown,
}

const actionColors: Record<ActivityEntry['action'], string> = {
  login: 'bg-blue-100 text-blue-700',
  logout: 'bg-blue-100 text-blue-700',
  create: 'bg-emerald-100 text-emerald-700',
  update: 'bg-amber-100 text-amber-700',
  delete: 'bg-red-100 text-red-700',
  view: 'bg-stone-100 text-stone-700',
  export: 'bg-purple-100 text-purple-700',
}

interface ActivityTabProps {
  userIdFilter?: string
}

export function ActivityTab({ userIdFilter }: ActivityTabProps) {
  const [timeRange, setTimeRange] = useState('7d')
  const [actionFilter, setActionFilter] = useState<string>('all')
  const [userFilter, setUserFilter] = useState<string>(userIdFilter || 'all')
  const [sectionFilter, setSectionFilter] = useState<string>('all')
  const [isRealtime, setIsRealtime] = useState(false)
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  const filteredEntries = useMemo(() => {
    return mockActivityEntries.filter((entry) => {
      // Time range filter
      const now = new Date()
      let cutoff = subDays(now, 7)
      if (timeRange === 'today') cutoff = new Date(now.setHours(0, 0, 0, 0))
      else if (timeRange === '30d') cutoff = subDays(now, 30)
      if (entry.timestamp < cutoff) return false

      // Action filter
      if (actionFilter !== 'all' && entry.action !== actionFilter) return false

      // User filter
      if (userFilter !== 'all' && entry.user.id !== userFilter) return false

      return true
    })
  }, [timeRange, actionFilter, userFilter])

  const toggleRow = (id: string) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedRows(newExpanded)
  }

  const handleExport = () => {
    // Mock export
    console.log('Exporting activity log...')
  }

  return (
    <div className="space-y-4">
      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
            </SelectContent>
          </Select>

          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="All Actions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              <SelectItem value="login">Login</SelectItem>
              <SelectItem value="logout">Logout</SelectItem>
              <SelectItem value="create">Create</SelectItem>
              <SelectItem value="update">Update</SelectItem>
              <SelectItem value="delete">Delete</SelectItem>
              <SelectItem value="view">View</SelectItem>
              <SelectItem value="export">Export</SelectItem>
            </SelectContent>
          </Select>

          <Select value={userFilter} onValueChange={setUserFilter}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="All Users" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              {mockUsers.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sectionFilter} onValueChange={setSectionFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Sections" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sections</SelectItem>
              <SelectItem value="members">Members</SelectItem>
              <SelectItem value="billing">Billing</SelectItem>
              <SelectItem value="reports">Reports</SelectItem>
              <SelectItem value="settings">Settings</SelectItem>
              <SelectItem value="users">Users</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2">
            <Checkbox checked={isRealtime} onCheckedChange={(checked) => setIsRealtime(checked as boolean)} />
            <span className="text-sm text-muted-foreground">Real-time</span>
            {isRealtime && (
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
            )}
          </label>
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Activity Table */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="w-10 px-2 py-3" />
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                Time
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                User
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                Action
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                Target
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                IP Address
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredEntries.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center">
                  <p className="text-muted-foreground">
                    No activity in selected range
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => setTimeRange('30d')}
                  >
                    Expand to 30 days
                  </Button>
                </td>
              </tr>
            ) : (
              filteredEntries.map((entry) => {
                const isExpanded = expandedRows.has(entry.id)
                const Icon = actionIcons[entry.action]

                return (
                  <>
                    <tr
                      key={entry.id}
                      className="border-t hover:bg-muted/30 cursor-pointer"
                      onClick={() => toggleRow(entry.id)}
                    >
                      <td className="px-2 py-3 text-center">
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 text-muted-foreground inline" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-muted-foreground inline" />
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span title={format(entry.timestamp, 'PPpp')}>
                          {format(entry.timestamp, 'HH:mm')}
                        </span>
                        <span className="text-muted-foreground ml-1">
                          {format(entry.timestamp, 'MMM d')}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white text-xs font-medium">
                            {entry.user.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')}
                          </div>
                          <span className="text-sm font-medium">
                            {entry.user.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            'inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium',
                            actionColors[entry.action]
                          )}
                        >
                          <Icon className="h-3 w-3" />
                          {entry.action.charAt(0).toUpperCase() +
                            entry.action.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {entry.target || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground font-mono">
                        {entry.ip}
                      </td>
                    </tr>
                    {isExpanded && entry.details && (
                      <tr key={`${entry.id}-details`} className="bg-muted/20">
                        <td colSpan={6} className="px-4 py-3">
                          <div className="ml-8 p-3 bg-muted/30 rounded-lg text-sm space-y-1">
                            <p className="font-medium">Details:</p>
                            {Object.entries(entry.details).map(([key, value]) => (
                              <p key={key} className="text-muted-foreground">
                                <span className="capitalize">{key}:</span>{' '}
                                {String(value)}
                              </p>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filteredEntries.length > 0 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Showing 1-{filteredEntries.length} of {filteredEntries.length}</span>
          <Button variant="outline" size="sm">
            Load More
          </Button>
        </div>
      )}
    </div>
  )
}
