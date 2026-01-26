'use client';

import * as React from 'react';
import { Plus, MessageSquare, ThumbsUp, Clock, CheckCircle2 } from 'lucide-react';
import { PageHeader, Section } from '@/components/layout';
import { Button, Badge, Card, CardContent } from '@/components/ui';
import {
  DataTable,
  ColumnDef,
  StatusBadge,
  KPICard,
  KPIGrid,
} from '@/components/data';
import { cn } from '@/lib/utils';

// Mock feature data
interface Feature {
  id: string;
  rank: number;
  title: string;
  description: string;
  category: string;
  votes: number;
  comments: number;
  status: 'considering' | 'planned' | 'in_progress' | 'completed';
  eta?: string;
}

const mockFeatures: Feature[] = [
  {
    id: '1',
    rank: 1,
    title: 'Mobile App for Members',
    description: 'Native iOS and Android app for members to manage bookings and view statements',
    category: 'Portal',
    votes: 247,
    comments: 34,
    status: 'planned',
    eta: 'Q2 2026',
  },
  {
    id: '2',
    rank: 2,
    title: 'Golf Tee Sheet Management',
    description: 'Visual tee sheet with drag-drop booking and caddie assignment',
    category: 'Golf',
    votes: 203,
    comments: 41,
    status: 'in_progress',
    eta: 'Q1 2026',
  },
  {
    id: '3',
    rank: 3,
    title: 'Payment Reminders',
    description: 'Automated payment reminder emails before due date',
    category: 'Billing',
    votes: 189,
    comments: 22,
    status: 'in_progress',
  },
  {
    id: '4',
    rank: 4,
    title: 'Xero Integration',
    description: 'Two-way sync with Xero accounting software',
    category: 'Integrations',
    votes: 134,
    comments: 27,
    status: 'planned',
    eta: 'Q2 2026',
  },
  {
    id: '5',
    rank: 5,
    title: 'Multi-Language Support',
    description: 'Full localization for Thai, Chinese, and Malay',
    category: 'Platform',
    votes: 98,
    comments: 15,
    status: 'considering',
  },
  {
    id: '6',
    rank: 6,
    title: 'Member Portal Dark Mode',
    description: 'Dark theme option for member portal',
    category: 'Portal',
    votes: 76,
    comments: 8,
    status: 'completed',
  },
  {
    id: '7',
    rank: 7,
    title: 'Bulk Invoice Generation',
    description: 'Generate invoices for multiple members at once',
    category: 'Billing',
    votes: 65,
    comments: 12,
    status: 'completed',
  },
];

// Category colors
const categoryColors: Record<string, string> = {
  Portal: 'bg-blue-100 text-blue-800',
  Golf: 'bg-emerald-100 text-emerald-800',
  Billing: 'bg-amber-100 text-amber-800',
  Integrations: 'bg-purple-100 text-purple-800',
  Platform: 'bg-slate-100 text-slate-800',
};

// Status tabs
const statusTabs = [
  { id: 'all', label: 'All Features' },
  { id: 'considering', label: 'Considering' },
  { id: 'planned', label: 'Planned' },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'completed', label: 'Completed' },
];

export default function FeaturesPage() {
  const [activeTab, setActiveTab] = React.useState('all');

  // Filter features
  const filteredFeatures = React.useMemo(() => {
    if (activeTab === 'all') return mockFeatures;
    return mockFeatures.filter((f) => f.status === activeTab);
  }, [activeTab]);

  // Calculate category stats
  const categoryStats = React.useMemo(() => {
    const stats: Record<string, number> = {};
    mockFeatures.forEach((f) => {
      stats[f.category] = (stats[f.category] || 0) + f.votes;
    });
    return Object.entries(stats)
      .sort((a, b) => b[1] - a[1])
      .map(([category, votes]) => ({ category, votes }));
  }, []);

  // Pending suggestions count (mock)
  const pendingSuggestions = 5;

  // Table columns
  const columns: ColumnDef<Feature>[] = [
    {
      id: 'rank',
      header: '#',
      width: '50px',
      cell: (row) => (
        <span className="font-medium text-slate-500">{row.rank}</span>
      ),
    },
    {
      id: 'feature',
      header: 'Feature',
      cell: (row) => (
        <div className="max-w-md">
          <p className="font-medium text-slate-900">{row.title}</p>
          <p className="text-sm text-slate-500 truncate">{row.description}</p>
        </div>
      ),
    },
    {
      id: 'category',
      header: 'Category',
      cell: (row) => (
        <span
          className={cn(
            'inline-flex px-2 py-0.5 rounded text-xs font-medium',
            categoryColors[row.category]
          )}
        >
          {row.category}
        </span>
      ),
    },
    {
      id: 'votes',
      header: 'Votes',
      align: 'center',
      sortable: true,
      cell: (row) => (
        <div className="flex items-center justify-center gap-1 text-slate-600">
          <ThumbsUp className="h-4 w-4" />
          <span className="font-medium">{row.votes}</span>
        </div>
      ),
    },
    {
      id: 'comments',
      header: 'Comments',
      align: 'center',
      cell: (row) => (
        <div className="flex items-center justify-center gap-1 text-slate-500">
          <MessageSquare className="h-4 w-4" />
          <span>{row.comments}</span>
        </div>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      cell: (row) => <StatusBadge status={row.status} />,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Feature Voting"
        description="Manage roadmap features and review suggestions"
        actions={
          <div className="flex items-center gap-3">
            <Button variant="secondary">
              Review Queue
              {pendingSuggestions > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {pendingSuggestions}
                </Badge>
              )}
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Feature
            </Button>
          </div>
        }
      />

      {/* Status Tabs */}
      <div className="flex items-center gap-1 mb-6 border-b border-slate-200">
        {statusTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'px-4 py-3 text-sm font-medium border-b-2 transition-colors -mb-px',
              activeTab === tab.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Feature Table */}
      <Section className="mb-8">
        <DataTable
          data={filteredFeatures}
          columns={columns}
          sortable
          onRowClick={(feature) => console.log('Open feature', feature.id)}
          rowActions={(feature) => [
            { label: 'Edit', onClick: () => console.log('Edit', feature.id) },
            { label: 'View Votes', onClick: () => console.log('Votes', feature.id) },
            { label: 'Archive', onClick: () => console.log('Archive', feature.id), destructive: true },
          ]}
        />
      </Section>

      {/* Analytics */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Votes by Category */}
        <Section title="Votes by Category">
          <Card>
            <CardContent className="pt-6 space-y-4">
              {categoryStats.map(({ category, votes }) => (
                <div key={category}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-slate-700">{category}</span>
                    <span className="text-sm text-slate-500">{votes}</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full',
                        categoryColors[category]?.includes('blue') ? 'bg-blue-500' :
                        categoryColors[category]?.includes('emerald') ? 'bg-emerald-500' :
                        categoryColors[category]?.includes('amber') ? 'bg-amber-500' :
                        categoryColors[category]?.includes('purple') ? 'bg-purple-500' :
                        'bg-slate-500'
                      )}
                      style={{ width: `${(votes / 400) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </Section>

        {/* Status Summary */}
        <Section title="Status Summary">
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-stone-100">
                    <Clock className="h-5 w-5 text-stone-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">
                      {mockFeatures.filter((f) => f.status === 'considering').length}
                    </p>
                    <p className="text-xs text-slate-500">Considering</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                    <Clock className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">
                      {mockFeatures.filter((f) => f.status === 'planned').length}
                    </p>
                    <p className="text-xs text-slate-500">Planned</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
                    <Clock className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">
                      {mockFeatures.filter((f) => f.status === 'in_progress').length}
                    </p>
                    <p className="text-xs text-slate-500">In Progress</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">
                      {mockFeatures.filter((f) => f.status === 'completed').length}
                    </p>
                    <p className="text-xs text-slate-500">Completed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </Section>
      </div>
    </div>
  );
}
