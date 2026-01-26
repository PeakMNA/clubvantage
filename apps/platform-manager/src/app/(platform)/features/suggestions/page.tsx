'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowLeft, ThumbsUp, ThumbsDown, Check, X, MessageSquare, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Mock data for pending suggestions
const pendingSuggestions = [
  {
    id: '1',
    title: 'WhatsApp Integration for Notifications',
    description: 'Allow clubs to send booking confirmations and reminders via WhatsApp instead of just SMS and email.',
    submittedBy: 'Green Valley CC',
    submitterName: 'Somchai Prasert',
    submittedAt: '2 hours ago',
    votes: 12,
    category: 'Integrations',
  },
  {
    id: '2',
    title: 'Bulk Member Import from Excel',
    description: 'Need ability to import members from Excel spreadsheet with all their data including dependents and membership types.',
    submittedBy: 'Sentosa Golf Club',
    submitterName: 'Marcus Tan',
    submittedAt: '5 hours ago',
    votes: 8,
    category: 'Members',
  },
  {
    id: '3',
    title: 'Custom Report Builder',
    description: 'Allow admins to create their own reports by selecting fields, filters, and groupings. Export to PDF and Excel.',
    submittedBy: 'Bangkok Sports Club',
    submitterName: 'Napat Wongsa',
    submittedAt: '1 day ago',
    votes: 23,
    category: 'Reports',
  },
  {
    id: '4',
    title: 'Guest Pass Management',
    description: 'Track and manage guest passes including limits, pricing tiers, and expiration dates.',
    submittedBy: 'Riverside CC',
    submitterName: 'Siriporn Chai',
    submittedAt: '2 days ago',
    votes: 15,
    category: 'Members',
  },
  {
    id: '5',
    title: 'Tournament Management Module',
    description: 'Full tournament management with handicaps, scoring, leaderboards, and prize distribution.',
    submittedBy: 'Laguna Golf',
    submitterName: 'Ahmad Ibrahim',
    submittedAt: '3 days ago',
    votes: 31,
    category: 'Golf',
  },
];

export default function FeatureSuggestionsPage() {
  const [selectedSuggestion, setSelectedSuggestion] = React.useState<string | null>(null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/features/roadmap">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Roadmap
            </Button>
          </Link>
        </div>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-slate-900">Suggestion Queue</h1>
        <p className="text-slate-500 mt-1">Review and moderate feature suggestions from tenants</p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-500">Pending Review</p>
            <p className="text-2xl font-bold text-slate-900">{pendingSuggestions.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-500">Approved Today</p>
            <p className="text-2xl font-bold text-emerald-600">3</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-500">Rejected Today</p>
            <p className="text-2xl font-bold text-red-600">1</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-500">Avg Review Time</p>
            <p className="text-2xl font-bold text-slate-900">4.2h</p>
          </CardContent>
        </Card>
      </div>

      {/* Suggestions List */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Suggestions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pendingSuggestions.map((suggestion) => (
              <div
                key={suggestion.id}
                className={`p-4 rounded-lg border transition-colors ${
                  selectedSuggestion === suggestion.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
                onClick={() => setSelectedSuggestion(suggestion.id)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-slate-900">{suggestion.title}</h3>
                      <Badge variant="default">{suggestion.category}</Badge>
                    </div>
                    <p className="text-sm text-slate-600 mb-3">{suggestion.description}</p>
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {suggestion.submitterName}
                      </span>
                      <span>{suggestion.submittedBy}</span>
                      <span>{suggestion.submittedAt}</span>
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="h-4 w-4" />
                        {suggestion.votes} votes
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50">
                      <X className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                      <Check className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {pendingSuggestions.length === 0 && (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-1">All caught up!</h3>
              <p className="text-slate-500">No pending suggestions to review</p>
              <Link href="/features/roadmap">
                <Button variant="secondary" className="mt-4">
                  Back to Features
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
