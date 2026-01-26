// Types for Users module

export type UserStatus = 'active' | 'inactive' | 'locked'
export type UserTab = 'users' | 'roles' | 'permissions' | 'security' | 'activity'

export interface User {
  id: string
  name: string
  email: string
  phone?: string
  roles: Role[]
  status: UserStatus
  lastLogin?: Date
  createdAt: Date
  linkedStaffId?: string
}

export interface Role {
  id: string
  name: string
  description: string
  permissionCount: number
  userCount: number
  isSystem: boolean
  permissions: string[]
}

export interface Permission {
  code: string
  name: string
  description: string
  section: string
}

export interface PermissionSection {
  id: string
  name: string
  permissions: Permission[]
}

export interface Session {
  id: string
  device: string
  browser: string
  ip: string
  lastActivity: Date
  current: boolean
}

export interface ActivityEntry {
  id: string
  timestamp: Date
  user: {
    id: string
    name: string
    avatar?: string
  }
  action: 'login' | 'logout' | 'create' | 'update' | 'delete' | 'view' | 'export'
  target?: string
  ip: string
  details?: Record<string, unknown>
}

export interface PasswordPolicy {
  minLength: number
  requireUppercase: boolean
  requireLowercase: boolean
  requireNumber: boolean
  requireSpecialChar: boolean
  expirationDays: number
  historyCount: number
}

export interface SessionPolicy {
  idleTimeoutMinutes: number
  maxConcurrentSessions: number
  allowRememberDevice: boolean
  rememberDeviceDays: number
}

export interface TwoFactorPolicy {
  enabled: boolean
  required: boolean
  allowAuthenticator: boolean
  allowSms: boolean
}

export interface LockoutPolicy {
  failedAttemptsThreshold: number
  lockoutDurationMinutes: number
  autoUnlock: boolean
}
