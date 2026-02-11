// Transform API response shapes → component-expected shapes

// Transform API UserType → component User shape
export function transformApiUser(apiUser: {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string | null
  role: string
  permissions: string[]
  isActive: boolean
  lastLoginAt?: string | null
  createdAt: string
}): {
  id: string
  name: string
  email: string
  phone?: string
  roles: {
    id: string
    name: string
    description: string
    permissionCount: number
    userCount: number
    isSystem: boolean
    permissions: string[]
  }[]
  status: 'active' | 'inactive' | 'locked'
  lastLogin?: Date
  createdAt: Date
} {
  return {
    id: apiUser.id,
    name: `${apiUser.firstName} ${apiUser.lastName}`,
    email: apiUser.email,
    phone: apiUser.phone ?? undefined,
    roles: [
      {
        id: apiUser.role,
        name: getRoleLabel(apiUser.role),
        description: '',
        permissionCount: apiUser.permissions.length,
        userCount: 0,
        isSystem: true,
        permissions: apiUser.permissions,
      },
    ],
    status: apiUser.isActive ? 'active' : 'inactive',
    lastLogin: apiUser.lastLoginAt
      ? new Date(apiUser.lastLoginAt)
      : undefined,
    createdAt: new Date(apiUser.createdAt),
  }
}

export function getRoleLabel(role: string): string {
  const labels: Record<string, string> = {
    SUPER_ADMIN: 'Super Admin',
    ADMIN: 'Admin',
    MANAGER: 'Manager',
    STAFF: 'Staff',
    RECEPTIONIST: 'Receptionist',
    ACCOUNTANT: 'Accountant',
    PRO_SHOP: 'Pro Shop',
    GOLF_MARSHAL: 'Golf Marshal',
    F_AND_B: 'F&B',
  }
  return labels[role] || role
}

type ActivityAction = 'login' | 'logout' | 'create' | 'update' | 'delete' | 'view' | 'export'

const VALID_ACTIONS = new Set<string>(['login', 'logout', 'create', 'update', 'delete', 'view', 'export'])

function toActivityAction(type: string): ActivityAction {
  const lower = type.toLowerCase()
  return VALID_ACTIONS.has(lower) ? (lower as ActivityAction) : 'view'
}

// Transform API ActivityEntryType → component ActivityEntry shape
export function transformActivityEntry(apiEntry: {
  id: string
  type: string
  aggregateType: string
  aggregateId: string
  data: string
  userId: string
  userEmail: string
  createdAt: string
}): {
  id: string
  timestamp: Date
  user: { id: string; name: string }
  action: ActivityAction
  target?: string
  ip: string
  details?: Record<string, unknown>
} {
  let details: Record<string, unknown> = {}
  try {
    details = JSON.parse(apiEntry.data)
  } catch {
    /* ignore parse errors */
  }
  return {
    id: apiEntry.id,
    timestamp: new Date(apiEntry.createdAt),
    user: { id: apiEntry.userId, name: apiEntry.userEmail },
    action: toActivityAction(apiEntry.type),
    target: `${apiEntry.aggregateType}/${apiEntry.aggregateId}`,
    ip: (details.ipAddress as string) || (details.ip as string) || '',
    details,
  }
}

// Format currency for reports (Thai Baht)
export function formatThbCurrency(amount: number): string {
  return `฿${amount.toLocaleString('en-US', { minimumFractionDigits: 0 })}`
}
