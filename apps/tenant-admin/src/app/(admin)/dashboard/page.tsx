'use client';

import { PageHeader, Section } from '@/components/layout';
import {
  Users,
  UserCheck,
  DollarSign,
  Calendar,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';

export default function DashboardPage() {
  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Welcome back, Somchai!"
      />

      {/* KPI Cards */}
      <Section className="mb-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            title="Total Members"
            value="1,247"
            change="+23"
            changeType="positive"
            icon={Users}
          />
          <KpiCard
            title="Active Members"
            value="892"
            change="+5.2%"
            changeType="positive"
            icon={UserCheck}
          />
          <KpiCard
            title="Monthly Revenue"
            value="฿1.2M"
            change="+8.1%"
            changeType="positive"
            icon={DollarSign}
          />
          <KpiCard
            title="Bookings This Week"
            value="156"
            change=""
            changeType="neutral"
            icon={Calendar}
          />
        </div>
      </Section>

      {/* Subscription Summary */}
      <Section title="Your Subscription" className="mb-8">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
                Professional Plan
              </span>
              <span className="text-slate-500">
                Renews: Jan 15, 2026
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button className="text-sm font-medium text-blue-600 hover:text-blue-800">
                View Plan Details
              </button>
              <button className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Request Upgrade
              </button>
            </div>
          </div>

          {/* Usage Meters */}
          <div className="space-y-4">
            <UsageMeter
              label="Members"
              used={1247}
              limit={2000}
            />
            <UsageMeter
              label="Staff Users"
              used={14}
              limit={20}
            />
            <UsageMeter
              label="Storage"
              used={4.2}
              limit={10}
              unit="GB"
            />
          </div>
        </div>
      </Section>

      {/* Recent Activity */}
      <Section title="Recent Activity">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="space-y-4">
            <ActivityItem
              title="New member registered"
              subtitle="John Smith"
              time="Today at 2:30 PM"
            />
            <ActivityItem
              title="Invoice paid"
              subtitle="INV-2024-0042"
              time="Yesterday at 4:15 PM"
            />
            <ActivityItem
              title="Staff added"
              subtitle="Napat Wongsa (Manager)"
              time="Jan 8, 2025"
            />
            <ActivityItem
              title="Branding updated"
              subtitle="Logo and colors changed"
              time="Jan 5, 2025"
            />
          </div>
        </div>
      </Section>
    </div>
  );
}

// KPI Card Component
function KpiCard({
  title,
  value,
  change,
  changeType,
  icon: Icon,
}: {
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
          {change && (
            <div className="mt-1 flex items-center gap-1">
              {changeType === 'positive' && (
                <TrendingUp className="h-4 w-4 text-emerald-600" />
              )}
              {changeType === 'negative' && (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
              <span
                className={
                  changeType === 'positive'
                    ? 'text-sm font-medium text-emerald-600'
                    : changeType === 'negative'
                    ? 'text-sm font-medium text-red-600'
                    : 'text-sm font-medium text-slate-500'
                }
              >
                {change}
              </span>
            </div>
          )}
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
          <Icon className="h-5 w-5 text-blue-600" />
        </div>
      </div>
    </div>
  );
}

// Usage Meter Component
function UsageMeter({
  label,
  used,
  limit,
  unit = '',
}: {
  label: string;
  used: number;
  limit: number;
  unit?: string;
}) {
  const percentage = Math.round((used / limit) * 100);
  const isWarning = percentage >= 80 && percentage < 100;
  const isCritical = percentage >= 100;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-slate-700">{label}</span>
        <span className="text-sm text-slate-500">
          {used.toLocaleString()}{unit} / {limit.toLocaleString()}{unit}
        </span>
      </div>
      <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            isCritical
              ? 'bg-red-500'
              : isWarning
              ? 'bg-amber-500'
              : 'bg-blue-500'
          }`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      <div className="mt-1 flex items-center justify-end">
        <span
          className={`text-xs font-medium ${
            isCritical
              ? 'text-red-600'
              : isWarning
              ? 'text-amber-600'
              : 'text-slate-500'
          }`}
        >
          {percentage}%
        </span>
      </div>
    </div>
  );
}

// Activity Item Component
function ActivityItem({
  title,
  subtitle,
  time,
}: {
  title: string;
  subtitle: string;
  time: string;
}) {
  return (
    <div className="flex items-start justify-between py-3 border-b border-slate-100 last:border-0 last:pb-0 first:pt-0">
      <div>
        <p className="text-sm font-medium text-slate-900">{title}</p>
        <p className="text-sm text-slate-500">{subtitle}</p>
      </div>
      <span className="text-xs text-slate-400 whitespace-nowrap">{time}</span>
    </div>
  );
}
