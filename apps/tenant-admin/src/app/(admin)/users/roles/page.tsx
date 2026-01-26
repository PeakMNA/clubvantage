'use client';

import * as React from 'react';
import { Shield, Check, X, Info } from 'lucide-react';

interface Permission {
  id: string;
  name: string;
  description: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  userCount: number;
  permissions: string[];
  isSystem: boolean;
}

const allPermissions: Permission[] = [
  { id: 'members.view', name: 'View Members', description: 'View member directory and profiles' },
  { id: 'members.edit', name: 'Edit Members', description: 'Create and edit member information' },
  { id: 'members.delete', name: 'Delete Members', description: 'Remove members from the system' },
  { id: 'billing.view', name: 'View Billing', description: 'View invoices and payment history' },
  { id: 'billing.manage', name: 'Manage Billing', description: 'Create invoices and process payments' },
  { id: 'bookings.view', name: 'View Bookings', description: 'View facility and tee time bookings' },
  { id: 'bookings.manage', name: 'Manage Bookings', description: 'Create, modify, and cancel bookings' },
  { id: 'reports.view', name: 'View Reports', description: 'Access analytics and reports' },
  { id: 'settings.view', name: 'View Settings', description: 'View system settings' },
  { id: 'settings.manage', name: 'Manage Settings', description: 'Modify system settings' },
  { id: 'users.view', name: 'View Staff', description: 'View staff users' },
  { id: 'users.manage', name: 'Manage Staff', description: 'Add, edit, and remove staff users' },
];

const roles: Role[] = [
  {
    id: 'owner',
    name: 'Owner',
    description: 'Full access to all features and settings',
    userCount: 1,
    permissions: allPermissions.map(p => p.id),
    isSystem: true,
  },
  {
    id: 'admin',
    name: 'Admin',
    description: 'Full access to all features except owner-level settings',
    userCount: 2,
    permissions: allPermissions.filter(p => !p.id.includes('owner')).map(p => p.id),
    isSystem: true,
  },
  {
    id: 'manager',
    name: 'Manager',
    description: 'Manage members and operations, no billing or user access',
    userCount: 5,
    permissions: ['members.view', 'members.edit', 'bookings.view', 'bookings.manage', 'reports.view'],
    isSystem: true,
  },
  {
    id: 'staff',
    name: 'Staff',
    description: 'Day-to-day operations only',
    userCount: 8,
    permissions: ['members.view', 'bookings.view', 'bookings.manage'],
    isSystem: true,
  },
];

export default function RolesPage() {
  const [selectedRole, setSelectedRole] = React.useState<string>('admin');

  const currentRole = roles.find(r => r.id === selectedRole);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Roles & Permissions</h1>
        <p className="text-slate-500 mt-1">Manage access levels for staff users</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Role List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200 bg-slate-50">
              <h2 className="font-semibold text-slate-900">Roles</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {roles.map((role) => (
                <button
                  key={role.id}
                  onClick={() => setSelectedRole(role.id)}
                  className={`w-full px-4 py-3 text-left transition-colors ${
                    selectedRole === role.id ? 'bg-blue-50' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`font-medium ${selectedRole === role.id ? 'text-blue-700' : 'text-slate-900'}`}>
                        {role.name}
                      </p>
                      <p className="text-sm text-slate-500">{role.userCount} users</p>
                    </div>
                    {role.isSystem && (
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-500">
                        System
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Info Note */}
          <div className="mt-4 p-4 rounded-lg bg-blue-50 border border-blue-200">
            <div className="flex gap-3">
              <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-blue-800">
                  System roles cannot be modified. Contact support if you need custom roles.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Permissions Detail */}
        <div className="lg:col-span-2">
          {currentRole && (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <Shield className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">{currentRole.name}</h2>
                    <p className="text-sm text-slate-500">{currentRole.description}</p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <h3 className="font-medium text-slate-900 mb-4">Permissions</h3>
                <div className="space-y-3">
                  {allPermissions.map((permission) => {
                    const hasPermission = currentRole.permissions.includes(permission.id);
                    return (
                      <div
                        key={permission.id}
                        className="flex items-center justify-between py-2 px-3 rounded-lg bg-slate-50"
                      >
                        <div>
                          <p className="font-medium text-slate-900">{permission.name}</p>
                          <p className="text-sm text-slate-500">{permission.description}</p>
                        </div>
                        <div className={`h-6 w-6 rounded-full flex items-center justify-center ${
                          hasPermission ? 'bg-emerald-100' : 'bg-slate-200'
                        }`}>
                          {hasPermission ? (
                            <Check className="h-4 w-4 text-emerald-600" />
                          ) : (
                            <X className="h-4 w-4 text-slate-400" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
