'use client';

import * as React from 'react';
import { Download, Search, Mail, CheckCircle, XCircle } from 'lucide-react';
import { PageHeader, Section } from '@/components/layout';
import { Button, Input, Card, CardContent } from '@/components/ui';
import {
  DataTable,
  ColumnDef,
  StatusBadge,
  KPICard,
  KPIGrid,
  FilterChips,
  DropdownFilter,
  DetailPanel,
  DetailSection,
  DetailRow,
  DetailActions,
} from '@/components/data';

// Mock waitlist data
interface WaitlistEntry {
  id: string;
  position: number;
  contactName: string;
  contactEmail: string;
  clubName: string;
  clubType: 'golf' | 'country_club' | 'spa' | 'fitness';
  memberCount: number;
  region: string;
  status: 'pending' | 'approved' | 'rejected' | 'converted';
  submittedAt: string;
  notes?: string;
}

const mockWaitlist: WaitlistEntry[] = [
  {
    id: '1',
    position: 1,
    contactName: 'Pornthip Rattanakul',
    contactEmail: 'pornthip@bangkokgolf.com',
    clubName: 'Bangkok Golf & Country Club',
    clubType: 'golf',
    memberCount: 850,
    region: 'TH',
    status: 'pending',
    submittedAt: '2025-01-15',
    notes: 'Referred by Green Valley CC',
  },
  {
    id: '2',
    position: 2,
    contactName: 'Marcus Tan',
    contactEmail: 'marcus.tan@sentosasports.sg',
    clubName: 'Sentosa Sports Club',
    clubType: 'country_club',
    memberCount: 2400,
    region: 'SG',
    status: 'pending',
    submittedAt: '2025-01-14',
  },
  {
    id: '3',
    position: 3,
    contactName: 'Siriporn Chaiyaporn',
    contactEmail: 'siriporn@thaiwellness.co.th',
    clubName: 'Thai Wellness & Spa',
    clubType: 'spa',
    memberCount: 320,
    region: 'TH',
    status: 'approved',
    submittedAt: '2025-01-10',
  },
  {
    id: '4',
    position: 4,
    contactName: 'Ahmad Ibrahim',
    contactEmail: 'ahmad@klroyalgolf.my',
    clubName: 'KL Royal Golf Club',
    clubType: 'golf',
    memberCount: 1200,
    region: 'MY',
    status: 'converted',
    submittedAt: '2025-01-05',
  },
  {
    id: '5',
    position: 5,
    contactName: 'Lisa Wong',
    contactEmail: 'lisa@fitnessfirst.sg',
    clubName: 'Fitness First Premium',
    clubType: 'fitness',
    memberCount: 450,
    region: 'SG',
    status: 'rejected',
    submittedAt: '2025-01-03',
  },
];

const statusFilters = [
  { id: 'pending', label: 'Pending', count: 2 },
  { id: 'approved', label: 'Approved', count: 1 },
  { id: 'rejected', label: 'Rejected', count: 1 },
  { id: 'converted', label: 'Converted', count: 1 },
];

const typeOptions = [
  { id: 'golf', label: 'Golf Club' },
  { id: 'country_club', label: 'Country Club' },
  { id: 'spa', label: 'Spa & Wellness' },
  { id: 'fitness', label: 'Fitness Center' },
];

const regionOptions = [
  { id: 'TH', label: 'Thailand' },
  { id: 'SG', label: 'Singapore' },
  { id: 'MY', label: 'Malaysia' },
];

const clubTypeLabels: Record<string, string> = {
  golf: 'Golf',
  country_club: 'CC',
  spa: 'Spa',
  fitness: 'Fitness',
};

export default function WaitlistPage() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedStatuses, setSelectedStatuses] = React.useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = React.useState<string[]>([]);
  const [selectedRegions, setSelectedRegions] = React.useState<string[]>([]);
  const [selectedEntry, setSelectedEntry] = React.useState<WaitlistEntry | null>(null);
  const [selectedEntries, setSelectedEntries] = React.useState<WaitlistEntry[]>([]);

  // Filter entries
  const filteredEntries = React.useMemo(() => {
    return mockWaitlist.filter((entry) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (
          !entry.contactName.toLowerCase().includes(query) &&
          !entry.clubName.toLowerCase().includes(query) &&
          !entry.contactEmail.toLowerCase().includes(query)
        ) {
          return false;
        }
      }
      if (selectedStatuses.length > 0 && !selectedStatuses.includes(entry.status)) {
        return false;
      }
      if (selectedTypes.length > 0 && !selectedTypes.includes(entry.clubType)) {
        return false;
      }
      if (selectedRegions.length > 0 && !selectedRegions.includes(entry.region)) {
        return false;
      }
      return true;
    });
  }, [searchQuery, selectedStatuses, selectedTypes, selectedRegions]);

  // Calculate KPIs
  const kpis = React.useMemo(() => {
    const total = mockWaitlist.length;
    const pending = mockWaitlist.filter((e) => e.status === 'pending').length;
    const converted = mockWaitlist.filter((e) => e.status === 'converted').length;
    const approved = mockWaitlist.filter((e) => e.status === 'approved').length;
    const conversionRate = approved + converted > 0
      ? Math.round((converted / (approved + converted)) * 100 * 10) / 10
      : 0;

    return { total, pending, conversionRate, avgWaitDays: 12 };
  }, []);

  // Table columns
  const columns: ColumnDef<WaitlistEntry>[] = [
    {
      id: 'position',
      header: '#',
      width: '60px',
      cell: (row) => (
        <span className="text-sm font-medium text-slate-500">{row.position}</span>
      ),
    },
    {
      id: 'contact',
      header: 'Contact',
      cell: (row) => (
        <div>
          <p className="font-medium text-slate-900">{row.contactName}</p>
          <p className="text-xs text-slate-500">{row.contactEmail}</p>
        </div>
      ),
    },
    {
      id: 'club',
      header: 'Club',
      cell: (row) => (
        <div>
          <p className="font-medium text-slate-900">{row.clubName}</p>
          <p className="text-xs text-slate-500">{clubTypeLabels[row.clubType]}</p>
        </div>
      ),
    },
    {
      id: 'members',
      header: 'Members',
      align: 'right',
      cell: (row) => row.memberCount.toLocaleString(),
    },
    {
      id: 'region',
      header: 'Region',
      cell: (row) => (
        <span className="inline-flex items-center justify-center h-5 w-8 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-600">
          {row.region}
        </span>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      id: 'submitted',
      header: 'Submitted',
      cell: (row) => (
        <span className="text-sm text-slate-500">{row.submittedAt}</span>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Waitlist Management"
        description="Review and process waitlist applications"
        actions={
          <Button variant="secondary">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        }
      />

      {/* KPI Cards */}
      <KPIGrid columns={4} className="mb-8">
        <KPICard label="Total Applications" value={kpis.total} />
        <KPICard
          label="Pending Review"
          value={kpis.pending}
          trend={{ value: 2, direction: 'up' }}
        />
        <KPICard
          label="Conversion Rate"
          value={kpis.conversionRate}
          format="percentage"
        />
        <KPICard label="Avg Wait Time" value={`${kpis.avgWaitDays} days`} />
      </KPIGrid>

      {/* Search and Filters */}
      <Section className="mb-6">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            type="search"
            placeholder="Search by name, club, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 max-w-md"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <FilterChips
            filters={statusFilters}
            selected={selectedStatuses}
            onChange={setSelectedStatuses}
            allLabel="All Status"
          />

          <div className="w-px h-6 bg-slate-200" />

          <DropdownFilter
            label="Type"
            options={typeOptions}
            selected={selectedTypes}
            onChange={setSelectedTypes}
          />

          <DropdownFilter
            label="Region"
            options={regionOptions}
            selected={selectedRegions}
            onChange={setSelectedRegions}
          />
        </div>
      </Section>

      {/* Waitlist Table */}
      <DataTable
        data={filteredEntries}
        columns={columns}
        selectable
        onSelectionChange={setSelectedEntries}
        onRowClick={setSelectedEntry}
        rowActions={(entry) => [
          { label: 'View Details', onClick: () => setSelectedEntry(entry) },
          { label: 'Send Email', onClick: () => console.log('Email', entry.id) },
          ...(entry.status === 'pending'
            ? [
                { label: 'Approve', onClick: () => console.log('Approve', entry.id) },
                {
                  label: 'Reject',
                  onClick: () => console.log('Reject', entry.id),
                  destructive: true,
                },
              ]
            : []),
        ]}
      />

      {/* Bulk Actions */}
      {selectedEntries.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 px-6 py-3 bg-white rounded-xl shadow-lg border border-slate-200">
          <span className="text-sm font-medium text-slate-700">
            {selectedEntries.length} selected
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
          <Button size="sm">
            <CheckCircle className="h-4 w-4 mr-1.5" />
            Approve Selected
          </Button>
        </div>
      )}

      {/* Detail Panel */}
      <DetailPanel
        isOpen={!!selectedEntry}
        onClose={() => setSelectedEntry(null)}
        title={selectedEntry?.clubName || ''}
        subtitle={`Application #${selectedEntry?.position}`}
        footer={
          selectedEntry?.status === 'pending' && (
            <DetailActions>
              <Button
                variant="destructive"
                onClick={() => {
                  console.log('Reject', selectedEntry.id);
                  setSelectedEntry(null);
                }}
              >
                <XCircle className="h-4 w-4 mr-1.5" />
                Reject
              </Button>
              <Button
                onClick={() => {
                  console.log('Approve', selectedEntry.id);
                  setSelectedEntry(null);
                }}
              >
                <CheckCircle className="h-4 w-4 mr-1.5" />
                Approve
              </Button>
            </DetailActions>
          )
        }
      >
        {selectedEntry && (
          <div className="space-y-6">
            <DetailSection title="Contact Information">
              <DetailRow label="Name" value={selectedEntry.contactName} />
              <DetailRow label="Email" value={selectedEntry.contactEmail} />
            </DetailSection>

            <DetailSection title="Club Details">
              <DetailRow label="Club Name" value={selectedEntry.clubName} />
              <DetailRow label="Type" value={clubTypeLabels[selectedEntry.clubType]} />
              <DetailRow label="Members" value={selectedEntry.memberCount.toLocaleString()} />
              <DetailRow label="Region" value={selectedEntry.region} />
            </DetailSection>

            <DetailSection title="Application">
              <DetailRow label="Submitted" value={selectedEntry.submittedAt} />
              <DetailRow label="Status" value={<StatusBadge status={selectedEntry.status} />} />
              <DetailRow label="Position" value={`#${selectedEntry.position}`} />
            </DetailSection>

            {selectedEntry.notes && (
              <DetailSection title="Notes">
                <p className="text-sm text-slate-600">{selectedEntry.notes}</p>
              </DetailSection>
            )}
          </div>
        )}
      </DetailPanel>
    </div>
  );
}
