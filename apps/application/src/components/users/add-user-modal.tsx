'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@clubvantage/ui'
import { Button } from '@clubvantage/ui'
import { Input } from '@clubvantage/ui'
import { Label } from '@clubvantage/ui'
import { Checkbox } from '@clubvantage/ui'
import { mockRoles } from './mock-data'

interface AddUserModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: AddUserFormData) => void
}

export interface AddUserFormData {
  name: string
  email: string
  phone: string
  username: string
  password: string
  autoGeneratePassword: boolean
  requirePasswordChange: boolean
  roles: string[]
  sendWelcomeEmail: boolean
  isActive: boolean
}

export function AddUserModal({ open, onOpenChange, onSubmit }: AddUserModalProps) {
  const [formData, setFormData] = useState<AddUserFormData>({
    name: '',
    email: '',
    phone: '',
    username: '',
    password: '',
    autoGeneratePassword: true,
    requirePasswordChange: true,
    roles: [],
    sendWelcomeEmail: true,
    isActive: true,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleEmailChange = (email: string) => {
    setFormData((prev) => ({
      ...prev,
      email,
      username: prev.username || email.split('@')[0] || '',
    }))
  }

  const toggleRole = (roleId: string) => {
    setFormData((prev) => ({
      ...prev,
      roles: prev.roles.includes(roleId)
        ? prev.roles.filter((id) => id !== roleId)
        : [...prev.roles, roleId],
    }))
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.name.trim()) newErrors.name = 'Name is required'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    if (!formData.email.includes('@')) newErrors.email = 'Invalid email format'
    if (!formData.username.trim()) newErrors.username = 'Username is required'
    if (!formData.autoGeneratePassword && formData.password.length < 12) {
      newErrors.password = 'Password must be at least 12 characters'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setIsSubmitting(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    onSubmit(formData)
    setIsSubmitting(false)
    onOpenChange(false)
    // Reset form
    setFormData({
      name: '',
      email: '',
      phone: '',
      username: '',
      password: '',
      autoGeneratePassword: true,
      requirePasswordChange: true,
      roles: [],
      sendWelcomeEmail: true,
      isActive: true,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Personal Information */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm">Personal Information</h4>
            <div className="space-y-3">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  placeholder="Full name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && (
                  <p className="text-xs text-red-500 mt-1">{errors.name}</p>
                )}
              </div>
              <div>
                <Label htmlFor="new-email">Email *</Label>
                <Input
                  id="new-email"
                  type="email"
                  placeholder="user@example.com"
                  value={formData.email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && (
                  <p className="text-xs text-red-500 mt-1">{errors.email}</p>
                )}
              </div>
              <div>
                <Label htmlFor="new-phone">Phone</Label>
                <Input
                  id="new-phone"
                  type="tel"
                  placeholder="+66 XX XXX XXXX"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Account Settings */}
          <div className="space-y-4 pt-4 border-t">
            <h4 className="font-medium text-sm">Account Settings</h4>
            <div className="space-y-3">
              <div>
                <Label htmlFor="username">Username *</Label>
                <Input
                  id="username"
                  placeholder="username"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  className={errors.username ? 'border-red-500' : ''}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Auto-generated from email
                </p>
                {errors.username && (
                  <p className="text-xs text-red-500 mt-1">{errors.username}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Initial Password</Label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="passwordType"
                      checked={formData.autoGeneratePassword}
                      onChange={() =>
                        setFormData({ ...formData, autoGeneratePassword: true })
                      }
                      className="h-4 w-4"
                    />
                    Auto-generate
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="passwordType"
                      checked={!formData.autoGeneratePassword}
                      onChange={() =>
                        setFormData({ ...formData, autoGeneratePassword: false })
                      }
                      className="h-4 w-4"
                    />
                    Set manually
                  </label>
                </div>
                {!formData.autoGeneratePassword && (
                  <div className="mt-2">
                    <Input
                      type="password"
                      placeholder="Enter password (min 12 characters)"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      className={errors.password ? 'border-red-500' : ''}
                    />
                    {errors.password && (
                      <p className="text-xs text-red-500 mt-1">{errors.password}</p>
                    )}
                  </div>
                )}
              </div>

              <label className="flex items-center gap-2">
                <Checkbox
                  checked={formData.requirePasswordChange}
                  onCheckedChange={(checked) =>
                    setFormData({
                      ...formData,
                      requirePasswordChange: checked as boolean,
                    })
                  }
                />
                <span className="text-sm">Require password change on first login</span>
              </label>
            </div>
          </div>

          {/* Role Assignment */}
          <div className="space-y-4 pt-4 border-t">
            <h4 className="font-medium text-sm">Role Assignment</h4>
            <div className="space-y-2">
              {mockRoles.map((role) => (
                <label
                  key={role.id}
                  className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer"
                >
                  <Checkbox
                    checked={formData.roles.includes(role.id)}
                    onCheckedChange={() => toggleRole(role.id)}
                    className="mt-0.5"
                  />
                  <div>
                    <span className="text-sm font-medium">{role.name}</span>
                    <p className="text-xs text-muted-foreground">{role.description}</p>
                  </div>
                </label>
              ))}
            </div>
            {formData.roles.length === 0 && (
              <p className="text-xs text-amber-600">
                Warning: User will have no permissions without a role
              </p>
            )}
          </div>

          {/* Additional Options */}
          <div className="space-y-3 pt-4 border-t">
            <h4 className="font-medium text-sm">Additional Options</h4>
            <label className="flex items-center gap-2">
              <Checkbox
                checked={formData.sendWelcomeEmail}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, sendWelcomeEmail: checked as boolean })
                }
              />
              <span className="text-sm">Send welcome email with login instructions</span>
            </label>
            <label className="flex items-center gap-2">
              <Checkbox
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isActive: checked as boolean })
                }
              />
              <span className="text-sm">Account Active</span>
            </label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-gradient-to-br from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Create User
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
