'use client';

import * as React from 'react';
import { FolderOpen, Search, AlertTriangle, Plus } from 'lucide-react';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';

type IllustrationType = 'no-data' | 'no-results' | 'error';

interface EmptyStateProps {
  title: string;
  description: string;
  illustration?: IllustrationType;
  action?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
  className?: string;
}

const illustrations: Record<IllustrationType, React.ReactNode> = {
  'no-data': (
    <div className="relative">
      <div className="h-24 w-24 mx-auto rounded-full bg-slate-100 flex items-center justify-center">
        <FolderOpen className="h-12 w-12 text-slate-400" strokeWidth={1.5} />
      </div>
      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-16 h-2 bg-slate-200 rounded-full blur-sm" />
    </div>
  ),
  'no-results': (
    <div className="relative">
      <div className="h-24 w-24 mx-auto rounded-full bg-slate-100 flex items-center justify-center">
        <Search className="h-12 w-12 text-slate-400" strokeWidth={1.5} />
      </div>
      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-16 h-2 bg-slate-200 rounded-full blur-sm" />
    </div>
  ),
  'error': (
    <div className="relative">
      <div className="h-24 w-24 mx-auto rounded-full bg-red-100 flex items-center justify-center">
        <AlertTriangle className="h-12 w-12 text-red-400" strokeWidth={1.5} />
      </div>
      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-16 h-2 bg-red-200 rounded-full blur-sm" />
    </div>
  ),
};

export function EmptyState({
  title,
  description,
  illustration = 'no-data',
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn('py-12 px-6 text-center', className)}>
      {illustrations[illustration]}
      <h3 className="mt-6 text-lg font-medium text-slate-900">{title}</h3>
      <p className="mt-2 text-sm text-slate-500 max-w-sm mx-auto">{description}</p>
      {action && (
        <Button onClick={action.onClick} className="mt-6">
          {action.icon || <Plus className="h-4 w-4 mr-2" />}
          {action.label}
        </Button>
      )}
    </div>
  );
}

// Pre-defined empty states
export const emptyStates = {
  tenants: {
    title: 'No tenants yet',
    description: 'Get started by creating your first tenant.',
    action: { label: 'Create Tenant' },
    illustration: 'no-data' as IllustrationType,
  },
  tenantsFiltered: {
    title: 'No tenants match filters',
    description: 'Try adjusting your filters or search term.',
    action: { label: 'Clear Filters' },
    illustration: 'no-results' as IllustrationType,
  },
  waitlist: {
    title: 'No waitlist entries',
    description: 'Check back when prospects sign up.',
    illustration: 'no-data' as IllustrationType,
  },
  features: {
    title: 'No features yet',
    description: 'Create your first roadmap feature to get started.',
    action: { label: 'Create Feature' },
    illustration: 'no-data' as IllustrationType,
  },
  suggestions: {
    title: 'All caught up!',
    description: 'No pending suggestions to review.',
    action: { label: 'Back to Features' },
    illustration: 'no-data' as IllustrationType,
  },
  users: {
    title: 'Just you for now',
    description: 'Invite your team members to get started.',
    action: { label: 'Invite User' },
    illustration: 'no-data' as IllustrationType,
  },
  invoices: {
    title: 'No invoices yet',
    description: 'Your first invoice will appear here.',
    illustration: 'no-data' as IllustrationType,
  },
  activity: {
    title: 'No recent activity',
    description: 'Activity will appear here as events occur.',
    illustration: 'no-data' as IllustrationType,
  },
};
