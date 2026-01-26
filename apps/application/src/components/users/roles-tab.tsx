'use client'

import { useState, useMemo } from 'react'
import { Search, Plus, Lock, Copy, Trash2, Edit } from 'lucide-react'
import { Input } from '@clubvantage/ui'
import { Button } from '@clubvantage/ui'
import { Badge } from '@clubvantage/ui'
import { cn } from '@clubvantage/ui'
import { mockRoles } from './mock-data'
import type { Role } from './types'

interface RolesTabProps {
  onAddRole: () => void
  onEditRole: (role: Role) => void
  onCloneRole: (role: Role) => void
  onDeleteRole: (role: Role) => void
}

export function RolesTab({
  onAddRole,
  onEditRole,
  onCloneRole,
  onDeleteRole,
}: RolesTabProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredRoles = useMemo(() => {
    return mockRoles.filter(
      (role) =>
        role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        role.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [searchQuery])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search roles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 w-72"
          />
        </div>
        <Button
          onClick={onAddRole}
          className="bg-gradient-to-br from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Role
        </Button>
      </div>

      {/* Role Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredRoles.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground">
              {searchQuery ? 'No roles match your search' : 'No roles found'}
            </p>
            {searchQuery && (
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => setSearchQuery('')}
              >
                Clear Search
              </Button>
            )}
          </div>
        ) : (
          filteredRoles.map((role) => (
            <div
              key={role.id}
              className={cn(
                'border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer',
                role.isSystem ? 'bg-muted/30' : 'bg-card'
              )}
              onClick={() => onEditRole(role)}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{role.name}</h3>
                  {role.isSystem && (
                    <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                </div>
                {role.isSystem && (
                  <Badge variant="secondary" className="text-xs">
                    System
                  </Badge>
                )}
              </div>

              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {role.description}
              </p>

              <div className="flex items-center gap-3 mb-4">
                <Badge variant="outline" className="text-xs">
                  {role.permissionCount} permissions
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {role.userCount} users
                </Badge>
              </div>

              <div className="flex items-center gap-2 pt-3 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    onEditRole(role)
                  }}
                  disabled={role.isSystem}
                  className={role.isSystem ? 'opacity-50' : ''}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    onCloneRole(role)
                  }}
                >
                  <Copy className="h-4 w-4 mr-1" />
                  Clone
                </Button>
                {!role.isSystem && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDeleteRole(role)
                    }}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
