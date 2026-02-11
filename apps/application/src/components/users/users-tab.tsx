'use client'

import { useState, useMemo } from 'react'
import { formatDistanceToNow } from 'date-fns'
import {
  Search,
  Plus,
  MoreHorizontal,
  Edit,
  Shield,
  Key,
  Activity,
  UserX,
  UserCheck,
  Loader2,
} from 'lucide-react'
import { Input } from '@clubvantage/ui'
import { Button } from '@clubvantage/ui'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@clubvantage/ui'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@clubvantage/ui'
import { cn } from '@clubvantage/ui'
import { mockUsers, mockRoles } from './mock-data'
import type { User, UserStatus } from './types'

interface UsersTabProps {
  users?: User[]
  isLoading?: boolean
  onAddUser: () => void
  onEditUser: (user: User) => void
  onViewActivity: (userId: string) => void
}

const statusColors: Record<UserStatus, string> = {
  active: 'bg-emerald-500 text-white',
  inactive: 'bg-stone-500 text-white',
  locked: 'bg-red-500 text-white',
}

const statusLabels: Record<UserStatus, string> = {
  active: 'Active',
  inactive: 'Inactive',
  locked: 'Locked',
}

export function UsersTab({
  users: externalUsers,
  isLoading: externalIsLoading,
  onAddUser,
  onEditUser,
  onViewActivity,
}: UsersTabProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [roleFilter, setRoleFilter] = useState<string>('all')

  const isLoading = externalIsLoading ?? false
  const allUsers = externalUsers ?? mockUsers

  const filteredUsers = useMemo(() => {
    return allUsers.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === 'all' || user.status === statusFilter
      const matchesRole =
        roleFilter === 'all' || user.roles.some((r) => r.id === roleFilter)
      return matchesSearch && matchesStatus && matchesRole
    })
  }, [allUsers, searchQuery, statusFilter, roleFilter])

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-72 bg-muted animate-pulse rounded-md" />
            <div className="h-10 w-36 bg-muted animate-pulse rounded-md" />
            <div className="h-10 w-36 bg-muted animate-pulse rounded-md" />
          </div>
          <div className="h-10 w-28 bg-muted animate-pulse rounded-md" />
        </div>
        <div className="border rounded-lg">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 px-4 py-3 border-b last:border-b-0"
            >
              <div className="h-4 w-40 bg-muted animate-pulse rounded" />
              <div className="h-4 w-48 bg-muted animate-pulse rounded" />
              <div className="h-4 w-24 bg-muted animate-pulse rounded" />
              <div className="h-4 w-16 bg-muted animate-pulse rounded" />
              <div className="h-4 w-24 bg-muted animate-pulse rounded" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filter Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-72"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="locked">Locked</SelectItem>
            </SelectContent>
          </Select>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              {mockRoles.map((role) => (
                <SelectItem key={role.id} value={role.id}>
                  {role.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={onAddUser} className="bg-gradient-to-br from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700">
          <Plus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Users Table */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                Name
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                Email
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                Role(s)
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                Status
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                Last Login
              </th>
              <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-muted-foreground">
                      {searchQuery || statusFilter !== 'all' || roleFilter !== 'all'
                        ? 'No users match your filters'
                        : 'No users yet'}
                    </p>
                    {(searchQuery || statusFilter !== 'all' || roleFilter !== 'all') && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSearchQuery('')
                          setStatusFilter('all')
                          setRoleFilter('all')
                        }}
                      >
                        Clear Filters
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className="border-t hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => onEditUser(user)}
                >
                  <td className="px-4 py-3">
                    <span className="font-medium">{user.name}</span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                  <td className="px-4 py-3">
                    {user.roles.length > 0 ? (
                      <span className="text-sm">
                        {user.roles.map((r) => r.name).join(', ')}
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground">No roles</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                        statusColors[user.status]
                      )}
                    >
                      {statusLabels[user.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-sm">
                    {user.lastLogin
                      ? formatDistanceToNow(user.lastLogin, { addSuffix: true })
                      : 'Never'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEditUser(user); }}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit User
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                          <Shield className="h-4 w-4 mr-2" />
                          Assign Roles
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                          <Key className="h-4 w-4 mr-2" />
                          Reset Password
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onViewActivity(user.id); }}>
                          <Activity className="h-4 w-4 mr-2" />
                          View Activity
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {user.status === 'active' ? (
                          <DropdownMenuItem
                            onClick={(e) => e.stopPropagation()}
                            className="text-red-600"
                          >
                            <UserX className="h-4 w-4 mr-2" />
                            Deactivate
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                            <UserCheck className="h-4 w-4 mr-2" />
                            Activate
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filteredUsers.length > 0 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Showing 1-{filteredUsers.length} of {filteredUsers.length}</span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled>
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
