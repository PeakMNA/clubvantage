'use client';

import * as React from 'react';
import Link from 'next/link';
import { Plus, Download, Mail, Ban, Search } from 'lucide-react';
import { PageHeader, Section } from '@/components/layout';
import { Button, Input } from '@/components/ui';
import {
  DataTable,
  ColumnDef,
  StatusBadge,
  TierBadge,
  RegionBadge,
  HealthScore,
  FilterChips,
  DropdownFilter,
} from '@/components/data';

// Mock tenant data
interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  tier: 'starter' | 'professional' | 'enterprise';
  status: 'active' | 'pending' | 'suspended' | 'archived';
  region: string;
  members: number;
  mrr: number;
  healthScore: number;
  healthBreakdown: {
    engagement: number;
    adoption: number;
    payment: number;
    support: number;
  };
}

const mockTenants: Tenant[] = [
  {
    id: '1',
    name: 'Green Valley Country Club',
    subdomain: 'greenvalley',
    tier: 'enterprise',
    status: 'active',
    region: 'TH',
    members: 1247,
    mrr: 2500,
    healthScore: 85,
    healthBreakdown: { engagement: 92, adoption: 78, payment: 100, support: 65 },
  },
  {
    id: '2',
    name: 'Sentosa Golf Club',
    subdomain: 'sentosa',
    tier: 'enterprise',
    status: 'active',
    region: 'SG',
    members: 2100,
    mrr: 3200,
    healthScore: 72,
    healthBreakdown: { engagement: 85, adoption: 70, payment: 80, support: 55 },
  },
  {
    id: '3',
    name: 'Bangkok Sports Club',
    subdomain: 'bangkoksports',
    tier: 'professional',
    status: 'active',
    region: 'TH',
    members: 856,
    mrr: 800,
    healthScore: 68,
    healthBreakdown: { engagement: 75, adoption: 65, payment: 90, support: 40 },
  },
  {
    id: '4',
    name: 'Riverside Country Club',
    subdomain: 'riverside',
    tier: 'starter',
    status: 'active',
    region: 'MY',
    members: 642,
    mrr: 450,
    healthScore: 45,
    healthBreakdown: { engagement: 45, adoption: 40, payment: 60, support: 35 },
  },
  {
    id: '5',
    name: 'Laguna Golf Resort',
    subdomain: 'laguna',
    tier: 'professional',
    status: 'pending',
    region: 'TH',
    members: 512,
    mrr: 750,
    healthScore: 38,
    healthBreakdown: { engagement: 30, adoption: 35, payment: 50, support: 40 },
  },
  {
    id: '6',
    name: 'Kuala Lumpur Golf',
    subdomain: 'klgolf',
    tier: 'enterprise',
    status: 'active',
    region: 'MY',
    members: 1850,
    mrr: 2800,
    healthScore: 91,
    healthBreakdown: { engagement: 95, adoption: 88, payment: 100, support: 80 },
  },
  {
    id: '7',
    name: 'Pattaya Beach Club',
    subdomain: 'pattaya',
    tier: 'starter',
    status: 'suspended',
    region: 'TH',
    members: 320,
    mrr: 0,
    healthScore: 25,
    healthBreakdown: { engagement: 20, adoption: 25, payment: 0, support: 55 },
  },
  {
    id: '8',
    name: 'Singapore Island CC',
    subdomain: 'sicc',
    tier: 'enterprise',
    status: 'active',
    region: 'SG',
    members: 3200,
    mrr: 4500,
    healthScore: 88,
    healthBreakdown: { engagement: 90, adoption: 85, payment: 100, support: 75 },
  },
];

// Filter options
const statusFilters = [
  { id: 'active', label: 'Active', count: 5 },
  { id: 'pending', label: 'Pending', count: 1 },
  { id: 'suspended', label: 'Suspended', count: 1 },
  { id: 'archived', label: 'Archived', count: 1 },
];

const tierOptions = [
  { id: 'starter', label: 'Starter' },
  { id: 'professional', label: 'Professional' },
  { id: 'enterprise', label: 'Enterprise' },
];

const regionOptions = [
  { id: 'TH', label: 'Thailand' },
  { id: 'SG', label: 'Singapore' },
  { id: 'MY', label: 'Malaysia' },
];

const healthOptions = [
  { id: 'healthy', label: 'Healthy (80+)' },
  { id: 'warning', label: 'Warning (60-79)' },
  { id: 'critical', label: 'Critical (<60)' },
];

export default function TenantsPage() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedStatuses, setSelectedStatuses] = React.useState<string[]>([]);
  const [selectedTiers, setSelectedTiers] = React.useState<string[]>([]);
  const [selectedRegions, setSelectedRegions] = React.useState<string[]>([]);
  const [selectedHealth, setSelectedHealth] = React.useState<string[]>([]);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [selectedTenants, setSelectedTenants] = React.useState<Tenant[]>([]);

  // Filter tenants
  const filteredTenants = React.useMemo(() => {
    return mockTenants.filter((tenant) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (
          !tenant.name.toLowerCase().includes(query) &&
          !tenant.subdomain.toLowerCase().includes(query)
        ) {
          return false;
        }
      }

      // Status filter
      if (selectedStatuses.length > 0 && !selectedStatuses.includes(tenant.status)) {
        return false;
      }

      // Tier filter
      if (selectedTiers.length > 0 && !selectedTiers.includes(tenant.tier)) {
        return false;
      }

      // Region filter
      if (selectedRegions.length > 0 && !selectedRegions.includes(tenant.region)) {
        return false;
      }

      // Health filter
      if (selectedHealth.length > 0) {
        const healthMatch = selectedHealth.some((h) => {
          if (h === 'healthy') return tenant.healthScore >= 80;
          if (h === 'warning') return tenant.healthScore >= 60 && tenant.healthScore < 80;
          if (h === 'critical') return tenant.healthScore < 60;
          return false;
        });
        if (!healthMatch) return false;
      }

      return true;
    });
  }, [searchQuery, selectedStatuses, selectedTiers, selectedRegions, selectedHealth]);

  // Table columns
  const columns: ColumnDef<Tenant>[] = [
    {
      id: 'health',
      header: '',
      width: '60px',
      cell: (row) => (
        <HealthScore
          score={row.healthScore}
          size="sm"
          showBreakdown
          breakdown={row.healthBreakdown}
        />
      ),
    },
    {
      id: 'name',
      header: 'Tenant',
      sortable: true,
      cell: (row) => (
        <div>
          <Link
            href={`/tenants/${row.id}`}
            className="font-medium text-slate-900 hover:text-blue-600"
          >
            {row.name}
          </Link>
          <p className="text-xs text-slate-500">{row.subdomain}.clubvantage.io</p>
        </div>
      ),
    },
    {
      id: 'tier',
      header: 'Tier',
      sortable: true,
      cell: (row) => <TierBadge tier={row.tier} />,
    },
    {
      id: 'region',
      header: 'Region',
      cell: (row) => <RegionBadge region={row.region} />,
    },
    {
      id: 'status',
      header: 'Status',
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      id: 'members',
      header: 'Members',
      sortable: true,
      align: 'right',
      cell: (row) => row.members.toLocaleString(),
    },
    {
      id: 'mrr',
      header: 'MRR',
      sortable: true,
      align: 'right',
      cell: (row) => `$${row.mrr.toLocaleString()}`,
    },
  ];

  // Row actions
  const getRowActions = (tenant: Tenant) => [
    { label: 'View Details', onClick: () => console.log('View', tenant.id) },
    { label: 'Impersonate User', onClick: () => console.log('Impersonate', tenant.id) },
    {
      label: tenant.status === 'suspended' ? 'Reactivate' : 'Suspend',
      onClick: () => console.log('Toggle suspend', tenant.id),
      destructive: tenant.status !== 'suspended',
    },
    { label: 'Archive', onClick: () => console.log('Archive', tenant.id), destructive: true },
  ];

  return (
    <div>
      <PageHeader
        title="Tenants"
        description="Manage all club tenants on the platform"
        actions={
          <Link href="/tenants/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Tenant
            </Button>
          </Link>
        }
      />

      {/* Search and Filters */}
      <Section className="mb-6">
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            type="search"
            placeholder="Search tenants by name or subdomain..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 max-w-md"
          />
        </div>

        {/* Filter Chips */}
        <div className="flex flex-wrap items-center gap-2">
          <FilterChips
            filters={statusFilters}
            selected={selectedStatuses}
            onChange={setSelectedStatuses}
            allLabel="All Status"
          />

          <div className="w-px h-6 bg-slate-200" />

          <DropdownFilter
            label="Tier"
            options={tierOptions}
            selected={selectedTiers}
            onChange={setSelectedTiers}
          />

          <DropdownFilter
            label="Region"
            options={regionOptions}
            selected={selectedRegions}
            onChange={setSelectedRegions}
          />

          <DropdownFilter
            label="Health"
            options={healthOptions}
            selected={selectedHealth}
            onChange={setSelectedHealth}
          />
        </div>
      </Section>

      {/* Tenant Table */}
      <DataTable
        data={filteredTenants}
        columns={columns}
        selectable
        onSelectionChange={setSelectedTenants}
        onRowClick={(tenant) => console.log('Navigate to', tenant.id)}
        rowActions={getRowActions}
        sortable
        pagination={{
          page: currentPage,
          pageSize: 20,
          total: filteredTenants.length,
        }}
        onPageChange={setCurrentPage}
      />

      {/* Bulk Actions Bar */}
      {selectedTenants.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 px-6 py-3 bg-white rounded-xl shadow-lg border border-slate-200">
          <span className="text-sm font-medium text-slate-700">
            {selectedTenants.length} selected
          </span>
          <div className="w-px h-6 bg-slate-200" />
          <Button variant="secondary" size="sm">
            <Download className="h-4 w-4 mr-1.5" />
            Export
          </Button>
          <Button variant="secondary" size="sm">
            <Mail className="h-4 w-4 mr-1.5" />
            Email
          </Button>
          <Button variant="destructive" size="sm">
            <Ban className="h-4 w-4 mr-1.5" />
            Suspend
          </Button>
        </div>
      )}
    </div>
  );
}
