'use client';

import * as React from 'react';
import { Activity, Server, Database, Globe, CheckCircle, AlertTriangle, XCircle, Clock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Mock data
const systemStatus = {
  overall: 'healthy',
  uptime: '99.98%',
  responseTime: '142ms',
  activeUsers: 1247,
};

const services = [
  { name: 'API Gateway', status: 'healthy', latency: '45ms', uptime: '99.99%' },
  { name: 'Database (Primary)', status: 'healthy', latency: '12ms', uptime: '99.99%' },
  { name: 'Database (Replica)', status: 'healthy', latency: '15ms', uptime: '99.98%' },
  { name: 'Redis Cache', status: 'healthy', latency: '3ms', uptime: '99.99%' },
  { name: 'File Storage', status: 'healthy', latency: '89ms', uptime: '99.97%' },
  { name: 'Email Service', status: 'degraded', latency: '320ms', uptime: '99.45%' },
  { name: 'SMS Gateway', status: 'healthy', latency: '156ms', uptime: '99.92%' },
  { name: 'Payment Processor', status: 'healthy', latency: '234ms', uptime: '99.99%' },
];

const recentIncidents = [
  { id: '1', title: 'Email delivery delays', status: 'investigating', startTime: '2 hours ago', severity: 'minor' },
  { id: '2', title: 'Increased API latency', status: 'resolved', startTime: 'Yesterday', resolvedTime: 'Yesterday', severity: 'minor' },
  { id: '3', title: 'Database failover test', status: 'resolved', startTime: 'Jan 18', resolvedTime: 'Jan 18', severity: 'maintenance' },
];

const statusConfig: Record<string, { icon: React.ElementType; color: string; bgColor: string; label: string }> = {
  healthy: { icon: CheckCircle, color: 'text-emerald-600', bgColor: 'bg-emerald-100', label: 'Healthy' },
  degraded: { icon: AlertTriangle, color: 'text-amber-600', bgColor: 'bg-amber-100', label: 'Degraded' },
  down: { icon: XCircle, color: 'text-red-600', bgColor: 'bg-red-100', label: 'Down' },
};

export default function PlatformHealthPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Platform Health</h1>
        <p className="text-slate-500 mt-1">Monitor system status and performance</p>
      </div>

      {/* Overall Status Banner */}
      <Card className={systemStatus.overall === 'healthy' ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`h-16 w-16 rounded-full flex items-center justify-center ${
                systemStatus.overall === 'healthy' ? 'bg-emerald-100' : 'bg-amber-100'
              }`}>
                {systemStatus.overall === 'healthy' ? (
                  <CheckCircle className="h-8 w-8 text-emerald-600" />
                ) : (
                  <AlertTriangle className="h-8 w-8 text-amber-600" />
                )}
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {systemStatus.overall === 'healthy' ? 'All Systems Operational' : 'Partial Service Disruption'}
                </h2>
                <p className="text-slate-600">Last updated: Just now</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-sm text-slate-500">Uptime</p>
                <p className="text-2xl font-bold text-slate-900">{systemStatus.uptime}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-slate-500">Avg Response</p>
                <p className="text-2xl font-bold text-slate-900">{systemStatus.responseTime}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-slate-500">Active Users</p>
                <p className="text-2xl font-bold text-slate-900">{systemStatus.activeUsers.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Service Status */}
        <Card>
          <CardHeader>
            <CardTitle>Service Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {services.map((service) => {
                const status = statusConfig[service.status as keyof typeof statusConfig]!;
                const StatusIcon = status.icon;
                return (
                  <div
                    key={service.name}
                    className="flex items-center justify-between p-3 rounded-lg border border-slate-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center ${status.bgColor}`}>
                        <StatusIcon className={`h-4 w-4 ${status.color}`} />
                      </div>
                      <span className="font-medium text-slate-900">{service.name}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-slate-500">{service.latency}</span>
                      <span className="text-slate-500">{service.uptime}</span>
                      <Badge variant={service.status === 'healthy' ? 'success' : 'warning'}>
                        {status.label}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recent Incidents */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Incidents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentIncidents.map((incident) => (
                <div key={incident.id} className="p-4 rounded-lg border border-slate-200">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-900">{incident.title}</h3>
                      <div className="flex items-center gap-2 mt-1 text-sm text-slate-500">
                        <Clock className="h-4 w-4" />
                        Started {incident.startTime}
                        {incident.resolvedTime && ` • Resolved ${incident.resolvedTime}`}
                      </div>
                    </div>
                    <Badge variant={
                      incident.status === 'resolved' ? 'success' :
                      incident.status === 'investigating' ? 'warning' : 'default'
                    }>
                      {incident.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics (24h)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center bg-slate-50 rounded-lg">
            <div className="text-center">
              <Activity className="h-12 w-12 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-500">Performance charts would go here</p>
              <p className="text-sm text-slate-400">Response times, throughput, error rates</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
