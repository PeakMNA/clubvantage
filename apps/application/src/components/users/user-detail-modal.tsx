'use client'

import { useState } from 'react'
import { formatDistanceToNow, format } from 'date-fns'
import { X, Loader2, ChevronDown, ChevronUp, MonitorSmartphone, LogOut } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@clubvantage/ui'
import { Button } from '@clubvantage/ui'
import { Input } from '@clubvantage/ui'
import { Label } from '@clubvantage/ui'
import { Badge } from '@clubvantage/ui'
import { cn } from '@clubvantage/ui'
import { mockRoles, mockSessions } from './mock-data'
import type { User, UserStatus } from './types'

interface UserDetailModalProps {
  user: User | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (user: User) => void | Promise<void>
}

const statusColors: Record<UserStatus, string> = {
  active: 'bg-emerald-500 text-white',
  inactive: 'bg-stone-500 text-white',
  locked: 'bg-red-500 text-white',
}

export function UserDetailModal({
  user,
  open,
  onOpenChange,
  onSave,
}: UserDetailModalProps) {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  })
  const [assignedRoles, setAssignedRoles] = useState(user?.roles || [])
  const [sessionsExpanded, setSessionsExpanded] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Reset form when user changes
  useState(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        phone: user.phone || '',
      })
      setAssignedRoles(user.roles)
    }
  })

  const handleSave = async () => {
    if (!user) return
    setIsSaving(true)
    try {
      await onSave({
        ...user,
        ...formData,
        roles: assignedRoles,
      })
      onOpenChange(false)
    } catch {
      // Error is handled by the parent
    } finally {
      setIsSaving(false)
    }
  }

  const removeRole = (roleId: string) => {
    setAssignedRoles(assignedRoles.filter((r) => r.id !== roleId))
  }

  const addRole = (roleId: string) => {
    const role = mockRoles.find((r) => r.id === roleId)
    if (role && !assignedRoles.some((r) => r.id === roleId)) {
      setAssignedRoles([...assignedRoles, role])
    }
  }

  const availableRoles = mockRoles.filter(
    (r) => !assignedRoles.some((ar) => ar.id === r.id)
  )

  if (!user) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
        </DialogHeader>

        {/* User Header */}
        <div className="flex items-center gap-4 pb-4 border-b">
          <div className="h-16 w-16 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white text-xl font-semibold">
            {user.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()}
          </div>
          <div>
            <h3 className="font-semibold text-lg">{user.name}</h3>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={cn(
                  'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                  statusColors[user.status]
                )}
              >
                {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
              </span>
              <span className="text-xs text-muted-foreground">
                since {format(user.createdAt, 'MMM d, yyyy')}
              </span>
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="space-y-4 pt-4">
          <h4 className="font-medium text-sm">Personal Information</h4>
          <div className="space-y-3">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+66 XX XXX XXXX"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Assigned Roles */}
        <div className="space-y-3 pt-4 border-t">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm">Assigned Roles</h4>
            <Badge variant="secondary">{assignedRoles.length}</Badge>
          </div>
          <div className="flex flex-wrap gap-2">
            {assignedRoles.length === 0 ? (
              <p className="text-sm text-muted-foreground">No roles assigned</p>
            ) : (
              assignedRoles.map((role) => (
                <Badge
                  key={role.id}
                  variant="outline"
                  className="flex items-center gap-1 pr-1"
                >
                  {role.name}
                  <button
                    type="button"
                    onClick={() => removeRole(role.id)}
                    className="ml-1 h-4 w-4 rounded-full hover:bg-muted flex items-center justify-center"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))
            )}
          </div>
          {availableRoles.length > 0 && (
            <select
              className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm"
              value=""
              onChange={(e) => {
                if (e.target.value) {
                  addRole(e.target.value)
                }
              }}
            >
              <option value="">+ Add Role</option>
              {availableRoles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Active Sessions */}
        <div className="space-y-3 pt-4 border-t">
          <button
            type="button"
            onClick={() => setSessionsExpanded(!sessionsExpanded)}
            className="flex items-center justify-between w-full"
          >
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-sm">Active Sessions</h4>
              <Badge variant="secondary">{mockSessions.length}</Badge>
            </div>
            {sessionsExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>

          {sessionsExpanded && (
            <div className="space-y-2">
              {mockSessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-muted/30"
                >
                  <div className="flex items-center gap-3">
                    <MonitorSmartphone className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">
                        {session.browser} on {session.device}
                        {session.current && (
                          <span className="ml-2 text-xs text-emerald-600">(Current)</span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {session.ip} &middot;{' '}
                        {formatDistanceToNow(session.lastActivity, { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  {!session.current && (
                    <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                      <LogOut className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button variant="outline" size="sm" className="w-full text-red-600 hover:text-red-700">
                Terminate All Sessions
              </Button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-gradient-to-br from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700"
          >
            {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
