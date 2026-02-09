'use client';

import { useState, useMemo, useCallback } from 'react';
import { cn, Button, Badge } from '@clubvantage/ui';
import {
  Search,
  X,
  Filter,
  ChevronDown,
  Building2,
  Sparkles,
  Dumbbell,
  Waves,
  DoorOpen,
  LayoutGrid,
  List,
  Calendar,
  Clock,
  Settings,
  Wrench,
  CheckCircle2,
  AlertCircle,
  MoreHorizontal,
  Eye,
  Power,
  MapPin,
  Plus,
  Edit2,
  Wallet,
  Loader2,
} from 'lucide-react';
import { FacilityModal, type FacilityFormData } from './facility-modal';
import { DeleteConfirmDialog } from './delete-confirm-dialog';

// Types
type FacilityType = 'court' | 'spa' | 'studio' | 'pool' | 'room';
type FacilityStatus = 'available' | 'partial' | 'maintenance' | 'closed';

interface FacilitySchedule {
  openTime: string;
  closeTime: string;
  bookingsToday: number;
  capacityToday: number;
}

interface Facility {
  id: string;
  name: string;
  type: FacilityType;
  location: string;
  status: FacilityStatus;
  schedule: FacilitySchedule;
  maintenanceNote?: string;
  amenities?: string[];
  revenueCenterId?: string;
  revenueCenterName?: string;
}

export interface FacilitiesTabProps {
  facilities?: Facility[];
  isLoading?: boolean;
  onViewSchedule?: (facilityId: string) => void;
  onToggleStatus?: (facilityId: string) => void;
  onSetMaintenance?: (facilityId: string) => void;
  onCreateFacility?: (data: FacilityFormData) => Promise<void>;
  onUpdateFacility?: (data: FacilityFormData) => Promise<void>;
  onDeleteFacility?: (facilityId: string) => Promise<void>;
  className?: string;
}

// Mock data
const mockFacilities: Facility[] = [
  {
    id: 'f1',
    name: 'Tennis Court 1',
    type: 'court',
    location: 'Outdoor - Level G',
    status: 'available',
    schedule: { openTime: '6:00 AM', closeTime: '9:00 PM', bookingsToday: 8, capacityToday: 15 },
    amenities: ['Lighting', 'Hard Court'],
    revenueCenterId: 'rc1',
    revenueCenterName: 'Sports & Recreation',
  },
  {
    id: 'f2',
    name: 'Tennis Court 2',
    type: 'court',
    location: 'Outdoor - Level G',
    status: 'available',
    schedule: { openTime: '6:00 AM', closeTime: '9:00 PM', bookingsToday: 12, capacityToday: 15 },
    amenities: ['Lighting', 'Clay Court'],
    revenueCenterId: 'rc1',
    revenueCenterName: 'Sports & Recreation',
  },
  {
    id: 'f3',
    name: 'Tennis Court 3',
    type: 'court',
    location: 'Indoor - Level 1',
    status: 'partial',
    schedule: { openTime: '6:00 AM', closeTime: '9:00 PM', bookingsToday: 6, capacityToday: 15 },
    amenities: ['Air Conditioned', 'Hard Court'],
    revenueCenterId: 'rc1',
    revenueCenterName: 'Sports & Recreation',
  },
  {
    id: 'f4',
    name: 'Badminton Court 1',
    type: 'court',
    location: 'Indoor - Level 1',
    status: 'available',
    schedule: { openTime: '6:00 AM', closeTime: '10:00 PM', bookingsToday: 10, capacityToday: 16 },
    amenities: ['Air Conditioned'],
    revenueCenterId: 'rc1',
    revenueCenterName: 'Sports & Recreation',
  },
  {
    id: 'f5',
    name: 'Spa Room 1',
    type: 'spa',
    location: 'Wellness Center - Level 2',
    status: 'available',
    schedule: { openTime: '9:00 AM', closeTime: '8:00 PM', bookingsToday: 5, capacityToday: 8 },
    amenities: ['Private Shower', 'Steam'],
    revenueCenterId: 'rc2',
    revenueCenterName: 'Wellness & Spa',
  },
  {
    id: 'f6',
    name: 'Spa Room 2',
    type: 'spa',
    location: 'Wellness Center - Level 2',
    status: 'maintenance',
    schedule: { openTime: '9:00 AM', closeTime: '8:00 PM', bookingsToday: 0, capacityToday: 8 },
    maintenanceNote: 'AC unit replacement - Est. completion: Tomorrow',
    revenueCenterId: 'rc2',
    revenueCenterName: 'Wellness & Spa',
  },
  {
    id: 'f7',
    name: 'Yoga Studio',
    type: 'studio',
    location: 'Fitness Center - Level 3',
    status: 'available',
    schedule: { openTime: '6:00 AM', closeTime: '9:00 PM', bookingsToday: 4, capacityToday: 6 },
    amenities: ['Mirrors', 'Sound System', 'Yoga Mats'],
    revenueCenterId: 'rc3',
    revenueCenterName: 'Fitness Center',
  },
  {
    id: 'f8',
    name: 'Swimming Pool',
    type: 'pool',
    location: 'Outdoor - Level G',
    status: 'available',
    schedule: { openTime: '6:00 AM', closeTime: '8:00 PM', bookingsToday: 3, capacityToday: 12 },
    amenities: ['25m Olympic', 'Heated', 'Lane Booking'],
    revenueCenterId: 'rc1',
    revenueCenterName: 'Sports & Recreation',
  },
  {
    id: 'f9',
    name: 'Meeting Room A',
    type: 'room',
    location: 'Clubhouse - Level 1',
    status: 'available',
    schedule: { openTime: '8:00 AM', closeTime: '10:00 PM', bookingsToday: 2, capacityToday: 8 },
    amenities: ['Projector', 'Whiteboard', '10 seats'],
    revenueCenterId: 'rc4',
    revenueCenterName: 'Events & Functions',
  },
  {
    id: 'f10',
    name: 'Meeting Room B',
    type: 'room',
    location: 'Clubhouse - Level 1',
    status: 'closed',
    schedule: { openTime: '8:00 AM', closeTime: '10:00 PM', bookingsToday: 0, capacityToday: 8 },
    revenueCenterId: 'rc4',
    revenueCenterName: 'Events & Functions',
  },
];

const facilityTypeConfig: Record<FacilityType, { label: string; icon: typeof Building2 }> = {
  court: { label: 'Court', icon: Building2 },
  spa: { label: 'Spa', icon: Sparkles },
  studio: { label: 'Studio', icon: Dumbbell },
  pool: { label: 'Pool', icon: Waves },
  room: { label: 'Room', icon: DoorOpen },
};

const statusConfig: Record<FacilityStatus, { label: string; color: string; bg: string; icon: typeof CheckCircle2 }> = {
  available: {
    label: 'Available',
    color: 'text-emerald-700 dark:text-emerald-400',
    bg: 'bg-emerald-100 dark:bg-emerald-500/20',
    icon: CheckCircle2,
  },
  partial: {
    label: 'Partial',
    color: 'text-amber-700 dark:text-amber-400',
    bg: 'bg-amber-100 dark:bg-amber-500/20',
    icon: AlertCircle,
  },
  maintenance: {
    label: 'Maintenance',
    color: 'text-red-700 dark:text-red-400',
    bg: 'bg-red-100 dark:bg-red-500/20',
    icon: Wrench,
  },
  closed: {
    label: 'Closed',
    color: 'text-muted-foreground',
    bg: 'bg-muted',
    icon: Power,
  },
};

type ViewMode = 'grid' | 'list';
type FilterType = 'all' | FacilityType;
type FilterStatus = 'all' | FacilityStatus;
type FilterLocation = string; // 'all' or specific location
type FilterRevenueCenter = string; // 'all' or specific revenue center name

interface FacilityCardProps {
  facility: Facility;
  viewMode: ViewMode;
  onViewSchedule: () => void;
  onToggleStatus: () => void;
  onSetMaintenance: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function FacilityCard({
  facility,
  viewMode,
  onViewSchedule,
  onToggleStatus,
  onSetMaintenance,
  onEdit,
  onDelete,
}: FacilityCardProps) {
  const [showActions, setShowActions] = useState(false);

  const TypeIcon = facilityTypeConfig[facility.type].icon;
  const statusStyle = statusConfig[facility.status];
  const StatusIcon = statusStyle.icon;

  const utilizationPercent = Math.round(
    (facility.schedule.bookingsToday / facility.schedule.capacityToday) * 100
  );

  const isGrid = viewMode === 'grid';

  return (
    <div
      className={cn(
        'group relative rounded-lg border bg-card transition-all',
        facility.status === 'maintenance'
          ? 'border-red-200 dark:border-red-500/30'
          : facility.status === 'closed'
            ? 'border-border opacity-60'
            : 'border-border hover:border-amber-300 hover:shadow-sm dark:hover:border-amber-500/50',
        isGrid ? 'p-4' : 'p-4'
      )}
    >
      <div className={cn(isGrid ? 'flex flex-col gap-3' : 'flex items-start gap-4')}>
        {/* Icon */}
        <div
          className={cn(
            'flex shrink-0 items-center justify-center rounded-lg',
            facility.status === 'maintenance'
              ? 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400'
              : 'bg-muted text-muted-foreground',
            isGrid ? 'h-12 w-12' : 'h-10 w-10'
          )}
        >
          <TypeIcon className={isGrid ? 'h-6 w-6' : 'h-5 w-5'} />
        </div>

        {/* Content */}
        <div className={cn('min-w-0 flex-1', isGrid && 'w-full')}>
          {/* Name & Status */}
          <div className="mb-1 flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate font-medium text-foreground">{facility.name}</h3>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3 shrink-0" />
                <span className="truncate">{facility.location}</span>
              </div>
              {facility.revenueCenterName && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Wallet className="h-3 w-3 shrink-0" />
                  <span className="truncate">{facility.revenueCenterName}</span>
                </div>
              )}
            </div>

            {/* Actions Menu */}
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => setShowActions(!showActions)}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground opacity-0 transition-all hover:bg-muted hover:text-foreground group-hover:opacity-100"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>

              {showActions && (
                <div className="absolute right-0 top-full z-10 mt-1 w-44 rounded-lg border border-border bg-card py-1 shadow-lg">
                  <button
                    type="button"
                    onClick={() => {
                      onEdit();
                      setShowActions(false);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted"
                  >
                    <Edit2 className="h-4 w-4" />
                    Edit Facility
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onViewSchedule();
                      setShowActions(false);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted"
                  >
                    <Eye className="h-4 w-4" />
                    View Schedule
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onToggleStatus();
                      setShowActions(false);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted"
                  >
                    <Power className="h-4 w-4" />
                    {facility.status === 'closed' ? 'Open Facility' : 'Close Facility'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onSetMaintenance();
                      setShowActions(false);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted"
                  >
                    <Wrench className="h-4 w-4" />
                    {facility.status === 'maintenance' ? 'End Maintenance' : 'Set Maintenance'}
                  </button>
                  <div className="my-1 border-t border-border" />
                  <button
                    type="button"
                    onClick={() => {
                      onDelete();
                      setShowActions(false);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                  >
                    <X className="h-4 w-4" />
                    Delete Facility
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Status Badge */}
          <div className="mb-2">
            <Badge className={cn('text-[10px]', statusStyle.bg, statusStyle.color)}>
              <StatusIcon className="mr-1 h-3 w-3" />
              {statusStyle.label}
            </Badge>
          </div>

          {/* Maintenance Note */}
          {facility.status === 'maintenance' && facility.maintenanceNote && (
            <p className="mb-2 text-xs italic text-red-600 dark:text-red-400">
              {facility.maintenanceNote}
            </p>
          )}

          {/* Schedule & Utilization */}
          {facility.status !== 'maintenance' && facility.status !== 'closed' && (
            <div className="space-y-2">
              {/* Hours */}
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>
                  {facility.schedule.openTime} - {facility.schedule.closeTime}
                </span>
              </div>

              {/* Utilization Bar */}
              <div>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Today's bookings</span>
                  <span className="font-medium text-foreground">
                    {facility.schedule.bookingsToday}/{facility.schedule.capacityToday}
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all',
                      utilizationPercent >= 80
                        ? 'bg-amber-500'
                        : utilizationPercent >= 50
                          ? 'bg-emerald-500'
                          : 'bg-blue-500'
                    )}
                    style={{ width: `${Math.min(utilizationPercent, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Amenities (Grid view only) */}
          {isGrid && facility.amenities && facility.amenities.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {facility.amenities.slice(0, 3).map((amenity) => (
                <span
                  key={amenity}
                  className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground"
                >
                  {amenity}
                </span>
              ))}
              {facility.amenities.length > 3 && (
                <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                  +{facility.amenities.length - 3}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Quick Action (List view) */}
        {!isGrid && facility.status !== 'maintenance' && facility.status !== 'closed' && (
          <Button size="sm" variant="outline" onClick={onViewSchedule} className="shrink-0">
            <Calendar className="mr-1.5 h-3 w-3" />
            Schedule
          </Button>
        )}
      </div>
    </div>
  );
}

/**
 * FacilitiesTab
 *
 * Displays and manages all bookable facilities with filtering, status management, and utilization stats.
 */
export function FacilitiesTab({
  facilities = mockFacilities,
  isLoading,
  onViewSchedule,
  onToggleStatus,
  onSetMaintenance,
  onCreateFacility,
  onUpdateFacility,
  onDeleteFacility,
  className,
}: FacilitiesTabProps) {
  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [typeFilter, setTypeFilter] = useState<FilterType>('all');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [locationFilter, setLocationFilter] = useState<FilterLocation>('all');
  const [revenueCenterFilter, setRevenueCenterFilter] = useState<FilterRevenueCenter>('all');
  const [showTypeFilter, setShowTypeFilter] = useState(false);
  const [showStatusFilter, setShowStatusFilter] = useState(false);
  const [showLocationFilter, setShowLocationFilter] = useState(false);
  const [showRevenueCenterFilter, setShowRevenueCenterFilter] = useState(false);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFacility, setEditingFacility] = useState<FacilityFormData | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [facilityToDelete, setFacilityToDelete] = useState<Facility | null>(null);

  // Modal handlers
  const handleAddFacility = useCallback(() => {
    setEditingFacility(null);
    setIsModalOpen(true);
  }, []);

  const handleEditFacility = useCallback((facility: Facility) => {
    setEditingFacility({
      id: facility.id,
      name: facility.name,
      description: '',
      type: facility.type,
      location: facility.location,
      capacity: 1,
      features: facility.amenities || [],
      operatingHours: [],
      isActive: facility.status !== 'closed',
    });
    setIsModalOpen(true);
  }, []);

  const handleSaveFacility = useCallback(async (data: FacilityFormData) => {
    if (data.id) {
      await onUpdateFacility?.(data);
    } else {
      await onCreateFacility?.(data);
    }
  }, [onCreateFacility, onUpdateFacility]);

  const handleDeleteClick = useCallback((facility: Facility) => {
    setFacilityToDelete(facility);
    setDeleteConfirmOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (facilityToDelete) {
      await onDeleteFacility?.(facilityToDelete.id);
      setFacilityToDelete(null);
    }
  }, [facilityToDelete, onDeleteFacility]);

  // Filter facilities
  const filteredFacilities = useMemo(() => {
    let result = facilities;

    // Search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (f) =>
          f.name.toLowerCase().includes(query) ||
          f.location.toLowerCase().includes(query) ||
          f.type.toLowerCase().includes(query)
      );
    }

    // Type filter
    if (typeFilter !== 'all') {
      result = result.filter((f) => f.type === typeFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter((f) => f.status === statusFilter);
    }

    // Location filter
    if (locationFilter !== 'all') {
      result = result.filter((f) => f.location === locationFilter);
    }

    // Revenue Center filter
    if (revenueCenterFilter !== 'all') {
      result = result.filter((f) => f.revenueCenterName === revenueCenterFilter);
    }

    return result;
  }, [facilities, searchQuery, typeFilter, statusFilter, locationFilter, revenueCenterFilter]);

  // Get unique locations for filter
  const uniqueLocations = useMemo(() => {
    const locations = [...new Set(facilities.map((f) => f.location))];
    return locations.sort();
  }, [facilities]);

  // Get unique revenue centers for filter
  const uniqueRevenueCenters = useMemo(() => {
    const centers = [...new Set(facilities.map((f) => f.revenueCenterName).filter(Boolean))] as string[];
    return centers.sort();
  }, [facilities]);

  // Check if any filters are active
  const hasActiveFilters = typeFilter !== 'all' || statusFilter !== 'all' || locationFilter !== 'all' || revenueCenterFilter !== 'all';

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    setTypeFilter('all');
    setStatusFilter('all');
    setLocationFilter('all');
    setRevenueCenterFilter('all');
  }, []);

  // Counts
  const counts = useMemo(() => {
    return {
      total: facilities.length,
      available: facilities.filter((f) => f.status === 'available').length,
      maintenance: facilities.filter((f) => f.status === 'maintenance').length,
    };
  }, [facilities]);

  const typeOptions: { value: FilterType; label: string }[] = [
    { value: 'all', label: 'All Types' },
    { value: 'court', label: 'Courts' },
    { value: 'spa', label: 'Spa Rooms' },
    { value: 'studio', label: 'Studios' },
    { value: 'pool', label: 'Pools' },
    { value: 'room', label: 'Rooms' },
  ];

  const statusOptions: { value: FilterStatus; label: string }[] = [
    { value: 'all', label: 'All Status' },
    { value: 'available', label: 'Available' },
    { value: 'partial', label: 'Partial' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'closed', label: 'Closed' },
  ];

  return (
    <div className={cn('flex h-full flex-col', className)}>
      {/* Header */}
      <div className="shrink-0 border-b border-border bg-card p-4 sm:p-6">
        {/* Title & Stats */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground sm:text-xl">
              Facilities
            </h2>
            <p className="text-sm text-muted-foreground">
              {counts.available} available • {counts.maintenance} in maintenance
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* View Toggle */}
            <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/50 p-1">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-md transition-colors',
                  viewMode === 'grid'
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
                aria-label="Grid view"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-md transition-colors',
                  viewMode === 'list'
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
                aria-label="List view"
              >
                <List className="h-4 w-4" />
              </button>
            </div>

            {/* Add Facility Button */}
            <Button
              onClick={handleAddFacility}
              className="bg-amber-500 text-white hover:bg-amber-600"
            >
              <Plus className="mr-1.5 h-4 w-4" />
              Add Facility
            </Button>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col gap-3 sm:flex-row">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search facilities..."
              className={cn(
                'h-10 w-full rounded-lg border border-border bg-background pl-10 pr-10 text-sm text-foreground placeholder:text-muted-foreground',
                'focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20'
              )}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Type Filter */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowTypeFilter(!showTypeFilter);
                setShowStatusFilter(false);
                setShowLocationFilter(false);
              }}
              className={cn(
                'flex h-10 items-center gap-2 rounded-lg border border-border bg-background px-3 text-sm transition-colors hover:bg-muted',
                typeFilter !== 'all' && 'border-amber-500 bg-amber-50 dark:bg-amber-500/10'
              )}
            >
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span className="text-foreground">
                {typeOptions.find((o) => o.value === typeFilter)?.label}
              </span>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </button>

            {showTypeFilter && (
              <div className="absolute left-0 top-full z-10 mt-1 w-40 rounded-lg border border-border bg-card py-1 shadow-lg sm:left-auto sm:right-0">
                {typeOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      setTypeFilter(option.value);
                      setShowTypeFilter(false);
                    }}
                    className={cn(
                      'flex w-full items-center px-3 py-2 text-sm transition-colors hover:bg-muted',
                      typeFilter === option.value && 'bg-muted'
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Status Filter */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowStatusFilter(!showStatusFilter);
                setShowTypeFilter(false);
                setShowLocationFilter(false);
              }}
              className={cn(
                'flex h-10 items-center gap-2 rounded-lg border border-border bg-background px-3 text-sm transition-colors hover:bg-muted',
                statusFilter !== 'all' && 'border-amber-500 bg-amber-50 dark:bg-amber-500/10'
              )}
            >
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-foreground">
                {statusOptions.find((o) => o.value === statusFilter)?.label}
              </span>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </button>

            {showStatusFilter && (
              <div className="absolute right-0 top-full z-10 mt-1 w-40 rounded-lg border border-border bg-card py-1 shadow-lg">
                {statusOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      setStatusFilter(option.value);
                      setShowStatusFilter(false);
                    }}
                    className={cn(
                      'flex w-full items-center px-3 py-2 text-sm transition-colors hover:bg-muted',
                      statusFilter === option.value && 'bg-muted'
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Location Filter */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowLocationFilter(!showLocationFilter);
                setShowTypeFilter(false);
                setShowStatusFilter(false);
              }}
              className={cn(
                'flex h-10 items-center gap-2 rounded-lg border border-border bg-background px-3 text-sm transition-colors hover:bg-muted',
                locationFilter !== 'all' && 'border-amber-500 bg-amber-50 dark:bg-amber-500/10'
              )}
            >
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="max-w-[120px] truncate text-foreground">
                {locationFilter === 'all' ? 'All Locations' : locationFilter}
              </span>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </button>

            {showLocationFilter && (
              <div className="absolute right-0 top-full z-10 mt-1 max-h-60 w-56 overflow-y-auto rounded-lg border border-border bg-card py-1 shadow-lg">
                <button
                  type="button"
                  onClick={() => {
                    setLocationFilter('all');
                    setShowLocationFilter(false);
                  }}
                  className={cn(
                    'flex w-full items-center px-3 py-2 text-sm transition-colors hover:bg-muted',
                    locationFilter === 'all' && 'bg-muted'
                  )}
                >
                  All Locations
                </button>
                {uniqueLocations.map((location) => (
                  <button
                    key={location}
                    type="button"
                    onClick={() => {
                      setLocationFilter(location);
                      setShowLocationFilter(false);
                    }}
                    className={cn(
                      'flex w-full items-center px-3 py-2 text-sm transition-colors hover:bg-muted',
                      locationFilter === location && 'bg-muted'
                    )}
                  >
                    {location}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Revenue Center Filter */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowRevenueCenterFilter(!showRevenueCenterFilter);
                setShowTypeFilter(false);
                setShowStatusFilter(false);
                setShowLocationFilter(false);
              }}
              className={cn(
                'flex h-10 items-center gap-2 rounded-lg border border-border bg-background px-3 text-sm transition-colors hover:bg-muted',
                revenueCenterFilter !== 'all' && 'border-amber-500 bg-amber-50 dark:bg-amber-500/10'
              )}
            >
              <Wallet className="h-4 w-4 text-muted-foreground" />
              <span className="max-w-[120px] truncate text-foreground">
                {revenueCenterFilter === 'all' ? 'All Revenue Centers' : revenueCenterFilter}
              </span>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </button>

            {showRevenueCenterFilter && (
              <div className="absolute right-0 top-full z-10 mt-1 max-h-60 w-56 overflow-y-auto rounded-lg border border-border bg-card py-1 shadow-lg">
                <button
                  type="button"
                  onClick={() => {
                    setRevenueCenterFilter('all');
                    setShowRevenueCenterFilter(false);
                  }}
                  className={cn(
                    'flex w-full items-center px-3 py-2 text-sm transition-colors hover:bg-muted',
                    revenueCenterFilter === 'all' && 'bg-muted'
                  )}
                >
                  All Revenue Centers
                </button>
                {uniqueRevenueCenters.map((center) => (
                  <button
                    key={center}
                    type="button"
                    onClick={() => {
                      setRevenueCenterFilter(center);
                      setShowRevenueCenterFilter(false);
                    }}
                    className={cn(
                      'flex w-full items-center px-3 py-2 text-sm transition-colors hover:bg-muted',
                      revenueCenterFilter === center && 'bg-muted'
                    )}
                  >
                    {center}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Clear All Filters */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearAllFilters}
              className="flex h-10 items-center gap-1.5 px-2 text-sm text-amber-600 transition-colors hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300"
            >
              <X className="h-4 w-4" />
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        {filteredFacilities.length > 0 ? (
          <div
            className={cn(
              viewMode === 'grid'
                ? 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                : 'space-y-3'
            )}
          >
            {filteredFacilities.map((facility) => (
              <FacilityCard
                key={facility.id}
                facility={facility}
                viewMode={viewMode}
                onViewSchedule={() => onViewSchedule?.(facility.id)}
                onToggleStatus={() => onToggleStatus?.(facility.id)}
                onSetMaintenance={() => onSetMaintenance?.(facility.id)}
                onEdit={() => handleEditFacility(facility)}
                onDelete={() => handleDeleteClick(facility)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Building2 className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">No facilities found</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {searchQuery || hasActiveFilters
                ? 'Try adjusting your filters'
                : 'No facilities have been added yet'}
            </p>
          </div>
        )}
      </div>

      {/* Footer Summary */}
      <div className="shrink-0 border-t border-border bg-muted/30 px-4 py-3 sm:px-6">
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
          <span>
            <span className="font-medium text-foreground">{counts.total}</span> total facilities
          </span>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>{counts.available} available</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-red-500" />
            <span>{counts.maintenance} maintenance</span>
          </div>
        </div>
      </div>

      {/* Facility Modal */}
      <FacilityModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveFacility}
        facility={editingFacility}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setFacilityToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Facility?"
        itemName={facilityToDelete?.name}
        itemType="facility"
        warningMessage="Any existing bookings for this facility will need to be reassigned or cancelled."
      />
    </div>
  );
}
