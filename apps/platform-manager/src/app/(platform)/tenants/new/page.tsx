'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowLeft, Building2, Globe, Users, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function NewTenantPage() {
  const [formData, setFormData] = React.useState({
    name: '',
    subdomain: '',
    contactName: '',
    contactEmail: '',
    country: 'TH',
    tier: 'professional',
    memberLimit: '2000',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Creating tenant:', formData);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/tenants">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tenants
          </Button>
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-slate-900">Create New Tenant</h1>
        <p className="text-slate-500 mt-1">Set up a new club on the ClubVantage platform</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-slate-400" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Club Name *
              </label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Green Valley Country Club"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Subdomain *
              </label>
              <div className="flex">
                <Input
                  value={formData.subdomain}
                  onChange={(e) => setFormData({ ...formData, subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                  placeholder="greenvalley"
                  className="rounded-r-none"
                  required
                />
                <span className="inline-flex items-center px-3 bg-slate-100 border border-l-0 border-slate-300 rounded-r-md text-sm text-slate-500">
                  .clubvantage.io
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-slate-400" />
              Primary Contact
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Contact Name *
              </label>
              <Input
                value={formData.contactName}
                onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                placeholder="e.g., Somchai Prasert"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Contact Email *
              </label>
              <Input
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                placeholder="e.g., admin@greenvalley.com"
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Region & Tier */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-slate-400" />
              Region & Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Country *
              </label>
              <select
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="w-full h-10 px-3 rounded-md border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="TH">Thailand</option>
                <option value="SG">Singapore</option>
                <option value="MY">Malaysia</option>
                <option value="ID">Indonesia</option>
                <option value="VN">Vietnam</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Subscription Tier *
              </label>
              <select
                value={formData.tier}
                onChange={(e) => setFormData({ ...formData, tier: e.target.value })}
                className="w-full h-10 px-3 rounded-md border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="starter">Starter - Up to 500 members</option>
                <option value="professional">Professional - Up to 2,000 members</option>
                <option value="enterprise">Enterprise - Unlimited members</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Subscription */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-slate-400" />
              Subscription Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Member Limit
              </label>
              <Input
                type="number"
                value={formData.memberLimit}
                onChange={(e) => setFormData({ ...formData, memberLimit: e.target.value })}
                placeholder="2000"
              />
              <p className="text-xs text-slate-500 mt-1">Leave empty to use tier default</p>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Link href="/tenants">
            <Button variant="secondary">Cancel</Button>
          </Link>
          <Button type="submit">Create Tenant</Button>
        </div>
      </form>
    </div>
  );
}
