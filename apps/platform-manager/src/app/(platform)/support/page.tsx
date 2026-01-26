'use client';

import * as React from 'react';
import Link from 'next/link';
import { Users, MessageSquare, FileText, AlertCircle, ArrowRight, Clock, CheckCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const supportTools = [
  {
    title: 'Tenant Impersonation',
    description: 'Access tenant accounts for troubleshooting and support',
    href: '/support/impersonation',
    icon: Users,
    color: 'bg-blue-100 text-blue-600',
  },
  {
    title: 'Support Tickets',
    description: 'View and manage incoming support requests',
    href: '/support/tickets',
    icon: MessageSquare,
    color: 'bg-emerald-100 text-emerald-600',
    badge: '12 open',
  },
  {
    title: 'Knowledge Base',
    description: 'Documentation and troubleshooting guides',
    href: '/support/knowledge-base',
    icon: FileText,
    color: 'bg-amber-100 text-amber-600',
  },
  {
    title: 'System Alerts',
    description: 'Active alerts and incident reports',
    href: '/platform/health',
    icon: AlertCircle,
    color: 'bg-red-100 text-red-600',
    badge: '2 active',
  },
];

const recentTickets = [
  { id: 'TKT-1234', tenant: 'Green Valley CC', subject: 'Cannot generate invoices', priority: 'high', status: 'open', time: '10 min ago' },
  { id: 'TKT-1233', tenant: 'Sentosa Golf', subject: 'Member import failing', priority: 'medium', status: 'in_progress', time: '1 hour ago' },
  { id: 'TKT-1232', tenant: 'Bangkok Sports', subject: 'Report not loading', priority: 'low', status: 'resolved', time: '2 hours ago' },
  { id: 'TKT-1231', tenant: 'Riverside CC', subject: 'Payment gateway error', priority: 'high', status: 'resolved', time: '3 hours ago' },
];

const priorityColors: Record<string, string> = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-amber-100 text-amber-700',
  low: 'bg-slate-100 text-slate-700',
};

const statusConfig: Record<string, { icon: React.ElementType; color: string }> = {
  open: { icon: Clock, color: 'text-amber-500' },
  in_progress: { icon: Clock, color: 'text-blue-500' },
  resolved: { icon: CheckCircle, color: 'text-emerald-500' },
};

export default function SupportPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Support Center</h1>
        <p className="text-slate-500 mt-1">Tools and resources for tenant support</p>
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-500">Open Tickets</p>
            <p className="text-2xl font-bold text-slate-900">12</p>
            <p className="text-xs text-amber-600 mt-1">3 high priority</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-500">Avg Response Time</p>
            <p className="text-2xl font-bold text-slate-900">24m</p>
            <p className="text-xs text-emerald-600 mt-1">-5m from last week</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-500">Resolution Rate</p>
            <p className="text-2xl font-bold text-slate-900">94%</p>
            <p className="text-xs text-emerald-600 mt-1">+2% this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-500">Active Sessions</p>
            <p className="text-2xl font-bold text-slate-900">3</p>
            <p className="text-xs text-blue-600 mt-1">Impersonation active</p>
          </CardContent>
        </Card>
      </div>

      {/* Support Tools */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Support Tools</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {supportTools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link key={tool.title} href={tool.href}>
                <Card className="h-full hover:border-slate-300 transition-colors cursor-pointer">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className={`h-10 w-10 rounded-lg ${tool.color} flex items-center justify-center`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      {tool.badge && (
                        <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600">
                          {tool.badge}
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-slate-900">{tool.title}</h3>
                    <p className="text-sm text-slate-500 mt-1">{tool.description}</p>
                    <div className="flex items-center gap-1 mt-3 text-sm text-blue-600">
                      Open <ArrowRight className="h-4 w-4" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Tickets */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Tickets</CardTitle>
          <Link href="/support/tickets" className="text-sm text-blue-600 hover:underline">
            View all tickets
          </Link>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentTickets.map((ticket) => {
              const StatusIcon = statusConfig[ticket.status]?.icon || Clock;
              const statusColor = statusConfig[ticket.status]?.color || 'text-slate-500';
              return (
                <div
                  key={ticket.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <StatusIcon className={`h-5 w-5 ${statusColor}`} />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-900">{ticket.id}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${priorityColors[ticket.priority]}`}>
                          {ticket.priority}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600">{ticket.subject}</p>
                      <p className="text-xs text-slate-400">{ticket.tenant}</p>
                    </div>
                  </div>
                  <span className="text-sm text-slate-500">{ticket.time}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
