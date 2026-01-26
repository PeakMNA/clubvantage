'use client';

import * as React from 'react';
import { BarChart3, TrendingUp, Users, Calendar, Download, FileText, DollarSign, Activity } from 'lucide-react';

interface ReportCard {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  category: string;
  lastGenerated?: string;
}

const reports: ReportCard[] = [
  {
    id: 'member-summary',
    name: 'Member Summary',
    description: 'Overview of member demographics, types, and status distribution',
    icon: Users,
    category: 'Members',
    lastGenerated: 'Today',
  },
  {
    id: 'member-activity',
    name: 'Member Activity',
    description: 'Login frequency, engagement metrics, and active users over time',
    icon: Activity,
    category: 'Members',
    lastGenerated: 'Yesterday',
  },
  {
    id: 'revenue-report',
    name: 'Revenue Report',
    description: 'Monthly revenue breakdown by category and payment method',
    icon: DollarSign,
    category: 'Financial',
    lastGenerated: 'Jan 15, 2026',
  },
  {
    id: 'booking-analytics',
    name: 'Booking Analytics',
    description: 'Facility utilization, peak hours, and booking trends',
    icon: Calendar,
    category: 'Operations',
    lastGenerated: 'Jan 18, 2026',
  },
  {
    id: 'growth-metrics',
    name: 'Growth Metrics',
    description: 'New members, churn rate, and retention statistics',
    icon: TrendingUp,
    category: 'Members',
    lastGenerated: 'Jan 10, 2026',
  },
];

const quickStats = [
  { label: 'Total Members', value: '1,247', change: '+23 this month', changeType: 'positive' },
  { label: 'Active Rate', value: '71.5%', change: '+2.3%', changeType: 'positive' },
  { label: 'Avg. Visit Frequency', value: '3.2/week', change: '-0.1', changeType: 'negative' },
  { label: 'Revenue This Month', value: '฿1.2M', change: '+8.1%', changeType: 'positive' },
];

export default function ReportsPage() {
  const [selectedCategory, setSelectedCategory] = React.useState('all');

  const categories = ['all', ...new Set(reports.map(r => r.category))];

  const filteredReports = selectedCategory === 'all'
    ? reports
    : reports.filter(r => r.category === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Reports & Analytics</h1>
        <p className="text-slate-500 mt-1">Access insights and data about your club</p>
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        {quickStats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-sm text-slate-500">{stat.label}</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
            <p className={`text-sm mt-1 ${
              stat.changeType === 'positive' ? 'text-emerald-600' : 'text-red-600'
            }`}>
              {stat.change}
            </p>
          </div>
        ))}
      </div>

      {/* Category Filter */}
      <div className="flex items-center gap-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              selectedCategory === category
                ? 'bg-blue-100 text-blue-700'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {category === 'all' ? 'All Reports' : category}
          </button>
        ))}
      </div>

      {/* Reports Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {filteredReports.map((report) => {
          const Icon = report.icon;
          return (
            <div
              key={report.id}
              className="bg-white rounded-xl border border-slate-200 p-6 hover:border-slate-300 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Icon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{report.name}</h3>
                    <p className="text-sm text-slate-500 mt-1">{report.description}</p>
                    <div className="flex items-center gap-2 mt-3">
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                        {report.category}
                      </span>
                      {report.lastGenerated && (
                        <span className="text-xs text-slate-400">
                          Last run: {report.lastGenerated}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100">
                <button className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                  <BarChart3 className="h-4 w-4" />
                  View Report
                </button>
                <button className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                  <Download className="h-4 w-4" />
                  Export
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Custom Report Request */}
      <div className="bg-slate-50 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="h-10 w-10 rounded-lg bg-slate-200 flex items-center justify-center">
            <FileText className="h-5 w-5 text-slate-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-slate-900">Need a Custom Report?</h3>
            <p className="text-sm text-slate-600 mt-1">
              Contact our support team if you need a specific report that's not available here.
              We can help you extract the data you need.
            </p>
            <button className="mt-3 px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
              Request Custom Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
