'use client';

import * as React from 'react';
import Link from 'next/link';
import { Plus, ThumbsUp, MessageSquare, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Mock data for features
const features = [
  {
    id: '1',
    title: 'Mobile App for Members',
    description: 'Native iOS and Android app for members to book, pay, and engage',
    category: 'Portal',
    votes: 247,
    comments: 34,
    status: 'planned',
    eta: 'Q2 2026',
  },
  {
    id: '2',
    title: 'Golf Tee Sheet Management',
    description: 'Complete tee time booking system with caddy and cart assignments',
    category: 'Golf',
    votes: 203,
    comments: 41,
    status: 'in_progress',
    eta: 'Q1 2026',
  },
  {
    id: '3',
    title: 'Payment Reminders',
    description: 'Automated payment reminders via email and SMS',
    category: 'Billing',
    votes: 189,
    comments: 22,
    status: 'in_progress',
    eta: 'Jan 2026',
  },
  {
    id: '4',
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
    title: 'Multi-Language Support',
    description: 'Support for Thai, English, Chinese, Japanese interfaces',
    category: 'Platform',
    votes: 98,
    comments: 15,
    status: 'considering',
    eta: null,
  },
];

const statusConfig: Record<string, { label: string; variant: 'default' | 'success' | 'warning' | 'destructive' }> = {
  considering: { label: 'Considering', variant: 'default' },
  planned: { label: 'Planned', variant: 'warning' },
  in_progress: { label: 'In Progress', variant: 'success' },
  completed: { label: 'Completed', variant: 'success' },
};

const categoryVotes = [
  { name: 'Portal', votes: 389 },
  { name: 'Billing', votes: 367 },
  { name: 'Integrations', votes: 246 },
  { name: 'Golf', votes: 203 },
  { name: 'Platform', votes: 98 },
];

export default function FeatureRoadmapPage() {
  const [statusFilter, setStatusFilter] = React.useState<string>('all');

  const filteredFeatures = statusFilter === 'all'
    ? features
    : features.filter(f => f.status === statusFilter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Feature Roadmap</h1>
          <p className="text-slate-500 mt-1">Manage feature requests and roadmap items</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/features/suggestions">
            <Button variant="secondary">
              Review Queue
              <Badge className="ml-2 bg-amber-500">5</Badge>
            </Button>
          </Link>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Feature
          </Button>
        </div>
      </div>

      {/* Status Filters */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-4">
        {['all', 'considering', 'planned', 'in_progress', 'completed'].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              statusFilter === status
                ? 'bg-blue-100 text-blue-700'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {status === 'all' ? 'All Features' : statusConfig[status]?.label || status}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Feature List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Features by Rank</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredFeatures.map((feature, index) => (
                  <div
                    key={feature.id}
                    className="flex items-start gap-4 p-4 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors cursor-pointer"
                  >
                    {/* Rank */}
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-sm font-semibold text-slate-600">
                      {index + 1}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-slate-900">{feature.title}</h3>
                        <Badge variant={statusConfig[feature.status]?.variant || 'default'}>
                          {statusConfig[feature.status]?.label || feature.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600 line-clamp-1">{feature.description}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                          {feature.category}
                        </span>
                        {feature.eta && (
                          <span className="flex items-center gap-1 text-xs text-slate-500">
                            <Calendar className="h-3 w-3" />
                            {feature.eta}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="h-4 w-4" />
                        {feature.votes}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-4 w-4" />
                        {feature.comments}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Category Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Votes by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {categoryVotes.map((category) => (
                  <div key={category.name}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-600">{category.name}</span>
                      <span className="font-semibold text-slate-900">{category.votes}</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${(category.votes / 400) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 rounded-lg bg-slate-50">
                  <p className="text-2xl font-bold text-slate-900">12</p>
                  <p className="text-xs text-slate-500">Total Features</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-slate-50">
                  <p className="text-2xl font-bold text-slate-900">871</p>
                  <p className="text-xs text-slate-500">Total Votes</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-amber-50">
                  <p className="text-2xl font-bold text-amber-600">3</p>
                  <p className="text-xs text-slate-500">In Progress</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-emerald-50">
                  <p className="text-2xl font-bold text-emerald-600">5</p>
                  <p className="text-xs text-slate-500">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
