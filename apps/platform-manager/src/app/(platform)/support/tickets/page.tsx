'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowLeft, Search, Filter, MessageSquare, Clock, CheckCircle, AlertCircle, User, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Ticket {
  id: string;
  subject: string;
  description: string;
  tenant: string;
  tenantId: string;
  submittedBy: string;
  priority: 'high' | 'medium' | 'low';
  status: 'open' | 'in_progress' | 'waiting' | 'resolved' | 'closed';
  category: string;
  createdAt: string;
  updatedAt: string;
  assignee?: string;
}

const tickets: Ticket[] = [
  {
    id: 'TKT-1234',
    subject: 'Cannot generate invoices for January',
    description: 'When trying to generate batch invoices, the system shows an error after processing about 50 members.',
    tenant: 'Green Valley CC',
    tenantId: 'gvcc-001',
    submittedBy: 'Somchai Prasert',
    priority: 'high',
    status: 'open',
    category: 'Billing',
    createdAt: '10 minutes ago',
    updatedAt: '10 minutes ago',
  },
  {
    id: 'TKT-1233',
    subject: 'Member import failing with CSV file',
    description: 'Uploaded a CSV with 200 members but only 150 were imported. No error message shown.',
    tenant: 'Sentosa Golf Club',
    tenantId: 'sgc-002',
    submittedBy: 'Marcus Tan',
    priority: 'medium',
    status: 'in_progress',
    category: 'Members',
    createdAt: '1 hour ago',
    updatedAt: '30 minutes ago',
    assignee: 'Support Team',
  },
  {
    id: 'TKT-1232',
    subject: 'Monthly revenue report not loading',
    description: 'The revenue report page shows a loading spinner indefinitely.',
    tenant: 'Bangkok Sports Club',
    tenantId: 'bsc-003',
    submittedBy: 'Napat Wongsa',
    priority: 'low',
    status: 'resolved',
    category: 'Reports',
    createdAt: '2 hours ago',
    updatedAt: '1 hour ago',
    assignee: 'Tech Team',
  },
  {
    id: 'TKT-1231',
    subject: 'Payment gateway returning timeout errors',
    description: 'Members are unable to complete online payments. Gateway times out after 30 seconds.',
    tenant: 'Riverside Country Club',
    tenantId: 'rcc-004',
    submittedBy: 'Siriporn Chai',
    priority: 'high',
    status: 'resolved',
    category: 'Payments',
    createdAt: '3 hours ago',
    updatedAt: '2 hours ago',
    assignee: 'Tech Team',
  },
  {
    id: 'TKT-1230',
    subject: 'Need help setting up email templates',
    description: 'We want to customize the invoice email template but cannot find the settings.',
    tenant: 'Laguna Golf Resort',
    tenantId: 'lgr-005',
    submittedBy: 'Ahmad Ibrahim',
    priority: 'low',
    status: 'waiting',
    category: 'Settings',
    createdAt: '5 hours ago',
    updatedAt: '4 hours ago',
    assignee: 'Support Team',
  },
  {
    id: 'TKT-1229',
    subject: 'Booking calendar showing wrong timezone',
    description: 'All bookings appear 1 hour ahead of the actual time.',
    tenant: 'KL Royal Golf Club',
    tenantId: 'klrg-006',
    submittedBy: 'Lee Wei Ming',
    priority: 'medium',
    status: 'open',
    category: 'Bookings',
    createdAt: '6 hours ago',
    updatedAt: '6 hours ago',
  },
  {
    id: 'TKT-1228',
    subject: 'Feature request: SMS notifications',
    description: 'Would like to send booking confirmations via SMS in addition to email.',
    tenant: 'Thai Wellness Spa',
    tenantId: 'tws-007',
    submittedBy: 'Apinya Suk',
    priority: 'low',
    status: 'closed',
    category: 'Feature Request',
    createdAt: '1 day ago',
    updatedAt: '12 hours ago',
    assignee: 'Product Team',
  },
];

const priorityConfig: Record<string, { label: string; color: string }> = {
  high: { label: 'High', color: 'bg-red-100 text-red-700' },
  medium: { label: 'Medium', color: 'bg-amber-100 text-amber-700' },
  low: { label: 'Low', color: 'bg-slate-100 text-slate-600' },
};

const statusConfig: Record<string, { label: string; icon: React.ElementType; color: string; badgeVariant: 'default' | 'warning' | 'success' | 'destructive' }> = {
  open: { label: 'Open', icon: AlertCircle, color: 'text-amber-500', badgeVariant: 'warning' },
  in_progress: { label: 'In Progress', icon: Clock, color: 'text-blue-500', badgeVariant: 'default' },
  waiting: { label: 'Waiting', icon: Clock, color: 'text-slate-500', badgeVariant: 'default' },
  resolved: { label: 'Resolved', icon: CheckCircle, color: 'text-emerald-500', badgeVariant: 'success' },
  closed: { label: 'Closed', icon: CheckCircle, color: 'text-slate-400', badgeVariant: 'default' },
};

export default function SupportTicketsPage() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [priorityFilter, setPriorityFilter] = React.useState('all');

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch = ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ticket.tenant.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ticket.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const stats = {
    open: tickets.filter(t => t.status === 'open').length,
    inProgress: tickets.filter(t => t.status === 'in_progress').length,
    waiting: tickets.filter(t => t.status === 'waiting').length,
    resolved: tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/support">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Support
            </Button>
          </Link>
        </div>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-slate-900">Support Tickets</h1>
        <p className="text-slate-500 mt-1">Manage and respond to tenant support requests</p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-500">Open</p>
            <p className="text-2xl font-bold text-amber-600">{stats.open}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-500">In Progress</p>
            <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-500">Waiting</p>
            <p className="text-2xl font-bold text-slate-600">{stats.waiting}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-500">Resolved</p>
            <p className="text-2xl font-bold text-emerald-600">{stats.resolved}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tickets..."
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">Status:</span>
          {['all', 'open', 'in_progress', 'waiting', 'resolved'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                statusFilter === status
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {status === 'all' ? 'All' : statusConfig[status]?.label || status}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">Priority:</span>
          {['all', 'high', 'medium', 'low'].map((priority) => (
            <button
              key={priority}
              onClick={() => setPriorityFilter(priority)}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                priorityFilter === priority
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {priority === 'all' ? 'All' : priorityConfig[priority]?.label || priority}
            </button>
          ))}
        </div>
      </div>

      {/* Tickets List */}
      <Card>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100">
            {filteredTickets.map((ticket) => {
              const status = statusConfig[ticket.status];
              const StatusIcon = status.icon;
              return (
                <div
                  key={ticket.id}
                  className="p-4 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className={`mt-1 ${status.color}`}>
                        <StatusIcon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-sm text-slate-500">{ticket.id}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${priorityConfig[ticket.priority].color}`}>
                            {priorityConfig[ticket.priority].label}
                          </span>
                          <Badge variant={status.badgeVariant}>{status.label}</Badge>
                        </div>
                        <h3 className="font-semibold text-slate-900 mb-1">{ticket.subject}</h3>
                        <p className="text-sm text-slate-600 line-clamp-1 mb-2">{ticket.description}</p>
                        <div className="flex items-center gap-4 text-sm text-slate-500">
                          <span className="flex items-center gap-1">
                            <Building2 className="h-4 w-4" />
                            {ticket.tenant}
                          </span>
                          <span className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            {ticket.submittedBy}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded bg-slate-100">
                            {ticket.category}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right text-sm">
                      <p className="text-slate-500">{ticket.createdAt}</p>
                      {ticket.assignee && (
                        <p className="text-xs text-slate-400 mt-1">Assigned: {ticket.assignee}</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredTickets.length === 0 && (
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-1">No tickets found</h3>
                <p className="text-slate-500">
                  {searchQuery ? 'Try adjusting your search or filters' : 'No support tickets yet'}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
