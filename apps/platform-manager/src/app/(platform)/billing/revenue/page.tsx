'use client';

import * as React from 'react';
import { DollarSign, TrendingUp, TrendingDown, Users, ArrowUpRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Mock data
const revenueData = {
  mrr: 52400,
  mrrGrowth: 8.2,
  arr: 628800,
  arrGrowth: 12.5,
  arpu: 1115,
  churnRate: 1.2,
};

const revenueByTier = [
  { tier: 'Enterprise', count: 12, mrr: 24000, percentage: 45.8 },
  { tier: 'Professional', count: 28, mrr: 22400, percentage: 42.7 },
  { tier: 'Starter', count: 7, mrr: 6000, percentage: 11.5 },
];

const recentTransactions = [
  { id: '1', tenant: 'Green Valley CC', type: 'subscription', amount: 2500, date: 'Today', status: 'completed' },
  { id: '2', tenant: 'Sentosa Golf', type: 'subscription', amount: 3200, date: 'Today', status: 'completed' },
  { id: '3', tenant: 'Bangkok Sports', type: 'upgrade', amount: 400, date: 'Yesterday', status: 'completed' },
  { id: '4', tenant: 'Riverside CC', type: 'subscription', amount: 450, date: 'Yesterday', status: 'failed' },
  { id: '5', tenant: 'Laguna Golf', type: 'subscription', amount: 750, date: '2 days ago', status: 'completed' },
];

function KPICard({ label, value, trend, trendUp = true }: { label: string; value: string; trend?: string; trendUp?: boolean }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <p className="text-sm text-slate-500 uppercase tracking-wide">{label}</p>
        <p className="text-3xl font-bold text-slate-900 mt-1">{value}</p>
        {trend && (
          <div className={`flex items-center gap-1 mt-2 text-sm ${trendUp ? 'text-emerald-600' : 'text-red-600'}`}>
            {trendUp ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            {trend}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function RevenuePage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Revenue Overview</h1>
        <p className="text-slate-500 mt-1">Platform-wide revenue metrics and trends</p>
      </div>

      {/* KPI Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <KPICard
          label="Monthly Recurring Revenue"
          value={`$${revenueData.mrr.toLocaleString()}`}
          trend={`+${revenueData.mrrGrowth}% from last month`}
          trendUp={true}
        />
        <KPICard
          label="Annual Recurring Revenue"
          value={`$${revenueData.arr.toLocaleString()}`}
          trend={`+${revenueData.arrGrowth}% YoY`}
          trendUp={true}
        />
        <KPICard
          label="Avg Revenue Per User"
          value={`$${revenueData.arpu.toLocaleString()}`}
          trend="+$45 from last month"
          trendUp={true}
        />
        <KPICard
          label="Monthly Churn Rate"
          value={`${revenueData.churnRate}%`}
          trend="-0.3% from last month"
          trendUp={true}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Revenue by Tier */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Revenue by Tier</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {revenueByTier.map((tier) => (
                <div key={tier.tier}>
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <span className="font-medium text-slate-900">{tier.tier}</span>
                      <span className="text-sm text-slate-500 ml-2">({tier.count} tenants)</span>
                    </div>
                    <span className="font-semibold text-slate-900">${tier.mrr.toLocaleString()}</span>
                  </div>
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        tier.tier === 'Enterprise' ? 'bg-blue-600' :
                        tier.tier === 'Professional' ? 'bg-blue-400' : 'bg-blue-200'
                      }`}
                      style={{ width: `${tier.percentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{tier.percentage}% of MRR</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                      tx.status === 'completed' ? 'bg-emerald-100' : 'bg-red-100'
                    }`}>
                      <DollarSign className={`h-5 w-5 ${
                        tx.status === 'completed' ? 'text-emerald-600' : 'text-red-600'
                      }`} />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{tx.tenant}</p>
                      <p className="text-sm text-slate-500 capitalize">{tx.type} • {tx.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${tx.status === 'completed' ? 'text-slate-900' : 'text-red-600'}`}>
                      ${tx.amount.toLocaleString()}
                    </p>
                    <Badge variant={tx.status === 'completed' ? 'success' : 'destructive'}>
                      {tx.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center bg-slate-50 rounded-lg">
            <div className="text-center">
              <TrendingUp className="h-12 w-12 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-500">Revenue chart would go here</p>
              <p className="text-sm text-slate-400">Using Recharts library</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
