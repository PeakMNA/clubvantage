'use client';

import * as React from 'react';
import Link from 'next/link';
import { AlertTriangle, TrendingDown, Clock, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Mock data for at-risk tenants
const atRiskTenants = [
  {
    id: '1',
    name: 'Bangkok Sports Club',
    subdomain: 'bangkoksports',
    healthScore: 42,
    riskFactors: ['Low engagement', 'Payment overdue', 'Support tickets'],
    lastActivity: '5 days ago',
    memberCount: 856,
    mrr: 800,
    status: 'critical',
  },
  {
    id: '2',
    name: 'Riverside Country Club',
    subdomain: 'riverside',
    healthScore: 58,
    riskFactors: ['Declining logins', 'Feature adoption low'],
    lastActivity: '2 days ago',
    memberCount: 642,
    mrr: 450,
    status: 'warning',
  },
  {
    id: '3',
    name: 'Phuket Golf Resort',
    subdomain: 'phuketgolf',
    healthScore: 65,
    riskFactors: ['Staff turnover', 'Support tickets'],
    lastActivity: '1 day ago',
    memberCount: 1200,
    mrr: 1500,
    status: 'warning',
  },
];

function HealthScoreRing({ score, size = 'md' }: { score: number; size?: 'sm' | 'md' }) {
  const getColor = (score: number) => {
    if (score >= 80) return 'text-emerald-500';
    if (score >= 60) return 'text-amber-500';
    return 'text-red-500';
  };

  const dimensions = size === 'sm' ? 'h-10 w-10' : 'h-16 w-16';
  const textSize = size === 'sm' ? 'text-xs' : 'text-lg';

  return (
    <div className={`relative ${dimensions} flex items-center justify-center`}>
      <svg className="absolute inset-0 -rotate-90" viewBox="0 0 36 36">
        <path
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="3"
        />
        <path
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none"
          className={getColor(score)}
          stroke="currentColor"
          strokeWidth="3"
          strokeDasharray={`${score}, 100`}
        />
      </svg>
      <span className={`${textSize} font-bold ${getColor(score)}`}>{score}</span>
    </div>
  );
}

export default function AtRiskTenantsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">At-Risk Tenants</h1>
          <p className="text-slate-500 mt-1">Tenants with health scores below 70% that need attention</p>
        </div>
        <Button variant="secondary">
          Export Report
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Critical</p>
                <p className="text-2xl font-bold text-slate-900">1</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
                <TrendingDown className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Warning</p>
                <p className="text-2xl font-bold text-slate-900">2</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center">
                <Clock className="h-6 w-6 text-slate-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Avg Response Time</p>
                <p className="text-2xl font-bold text-slate-900">2.3 days</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* At Risk Tenant List */}
      <Card>
        <CardHeader>
          <CardTitle>Tenants Requiring Attention</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {atRiskTenants.map((tenant) => (
              <div
                key={tenant.id}
                className="flex items-center gap-4 p-4 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors"
              >
                {/* Health Score */}
                <HealthScoreRing score={tenant.healthScore} />

                {/* Tenant Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Link href={`/tenants/${tenant.id}`} className="font-semibold text-slate-900 hover:text-blue-600">
                      {tenant.name}
                    </Link>
                    <Badge variant={tenant.status === 'critical' ? 'destructive' : 'warning'}>
                      {tenant.status === 'critical' ? 'Critical' : 'Warning'}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-500">{tenant.subdomain}.clubvantage.io</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {tenant.riskFactors.map((factor, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700"
                      >
                        {factor}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Stats */}
                <div className="hidden md:flex items-center gap-6 text-sm">
                  <div>
                    <p className="text-slate-500">Members</p>
                    <p className="font-semibold text-slate-900">{tenant.memberCount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">MRR</p>
                    <p className="font-semibold text-slate-900">${tenant.mrr.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Last Activity</p>
                    <p className="font-semibold text-slate-900">{tenant.lastActivity}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Link href={`/tenants/${tenant.id}`}>
                    <Button variant="secondary" size="sm">
                      View Details
                      <ExternalLink className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
