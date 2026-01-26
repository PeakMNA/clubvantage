'use client';

import * as React from 'react';
import { Search, Filter, Download, User, Settings, Shield, Database, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Mock data
const auditLogs = [
  {
    id: '1',
    action: 'tenant.created',
    actor: 'admin@clubvantage.com',
    actorType: 'platform_admin',
    target: 'Green Valley CC',
    details: 'Created new tenant with Professional plan',
    timestamp: 'Jan 20, 2026 14:32:15',
    ipAddress: '203.150.25.100',
  },
  {
    id: '2',
    action: 'user.impersonated',
    actor: 'support@clubvantage.com',
    actorType: 'support',
    target: 'somchai@greenvalley.com',
    details: 'Started impersonation session - Ticket #1234',
    timestamp: 'Jan 20, 2026 13:45:00',
    ipAddress: '203.150.25.101',
  },
  {
    id: '3',
    action: 'tenant.suspended',
    actor: 'admin@clubvantage.com',
    actorType: 'platform_admin',
    target: 'Bangkok Sports Club',
    details: 'Suspended due to payment overdue (45 days)',
    timestamp: 'Jan 20, 2026 11:20:33',
    ipAddress: '203.150.25.100',
  },
  {
    id: '4',
    action: 'feature.approved',
    actor: 'product@clubvantage.com',
    actorType: 'platform_admin',
    target: 'WhatsApp Integration',
    details: 'Approved feature request, added to roadmap',
    timestamp: 'Jan 20, 2026 10:15:22',
    ipAddress: '203.150.25.102',
  },
  {
    id: '5',
    action: 'waitlist.converted',
    actor: 'sales@clubvantage.com',
    actorType: 'platform_admin',
    target: 'Laguna Golf Resort',
    details: 'Converted from waitlist to active tenant',
    timestamp: 'Jan 19, 2026 16:45:10',
    ipAddress: '203.150.25.103',
  },
  {
    id: '6',
    action: 'tenant.plan_changed',
    actor: 'admin@clubvantage.com',
    actorType: 'platform_admin',
    target: 'Sentosa Golf Club',
    details: 'Upgraded from Professional to Enterprise',
    timestamp: 'Jan 19, 2026 14:20:00',
    ipAddress: '203.150.25.100',
  },
  {
    id: '7',
    action: 'settings.updated',
    actor: 'admin@clubvantage.com',
    actorType: 'platform_admin',
    target: 'Platform Settings',
    details: 'Updated email template for invoices',
    timestamp: 'Jan 19, 2026 11:30:45',
    ipAddress: '203.150.25.100',
  },
];

const actionIcons: Record<string, React.ElementType> = {
  'tenant.created': Database,
  'tenant.suspended': Shield,
  'tenant.plan_changed': Settings,
  'user.impersonated': User,
  'feature.approved': Settings,
  'waitlist.converted': User,
  'settings.updated': Settings,
};

const actionColors: Record<string, string> = {
  'tenant.created': 'bg-emerald-100 text-emerald-600',
  'tenant.suspended': 'bg-red-100 text-red-600',
  'tenant.plan_changed': 'bg-blue-100 text-blue-600',
  'user.impersonated': 'bg-amber-100 text-amber-600',
  'feature.approved': 'bg-emerald-100 text-emerald-600',
  'waitlist.converted': 'bg-blue-100 text-blue-600',
  'settings.updated': 'bg-slate-100 text-slate-600',
};

export default function AuditLogPage() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [actionFilter, setActionFilter] = React.useState('all');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Audit Logs</h1>
          <p className="text-slate-500 mt-1">Track all platform actions and changes</p>
        </div>
        <Button variant="secondary">
          <Download className="h-4 w-4 mr-2" />
          Export Logs
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by actor, target, or action..."
            className="pl-9"
          />
        </div>
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="h-10 px-3 rounded-md border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Actions</option>
          <option value="tenant">Tenant Actions</option>
          <option value="user">User Actions</option>
          <option value="feature">Feature Actions</option>
          <option value="settings">Settings Changes</option>
        </select>
        <Button variant="secondary">
          <Calendar className="h-4 w-4 mr-2" />
          Date Range
        </Button>
      </div>

      {/* Audit Log Table */}
      <Card>
        <CardContent className="p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Action</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Actor</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Target</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Details</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Timestamp</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">IP Address</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.map((log) => {
                const ActionIcon = actionIcons[log.action] || Settings;
                const iconColor = actionColors[log.action] || 'bg-slate-100 text-slate-600';

                return (
                  <tr key={log.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center ${iconColor}`}>
                          <ActionIcon className="h-4 w-4" />
                        </div>
                        <span className="font-mono text-sm text-slate-700">{log.action}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div>
                        <p className="text-sm text-slate-900">{log.actor}</p>
                        <Badge variant="default" className="mt-1">{log.actorType}</Badge>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-slate-700">{log.target}</td>
                    <td className="px-4 py-4 text-sm text-slate-600 max-w-xs truncate">{log.details}</td>
                    <td className="px-4 py-4 text-sm text-slate-500 whitespace-nowrap">{log.timestamp}</td>
                    <td className="px-4 py-4 font-mono text-sm text-slate-500">{log.ipAddress}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">Showing 1-7 of 156 entries</p>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" disabled>Previous</Button>
          <Button variant="secondary" size="sm">Next</Button>
        </div>
      </div>
    </div>
  );
}
