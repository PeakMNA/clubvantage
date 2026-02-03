'use client';

import { useState, useMemo } from 'react';
import { cn, Button, Badge } from '@clubvantage/ui';
import { Avatar, AvatarFallback, AvatarImage } from '@clubvantage/ui';
import {
  Search,
  X,
  Filter,
  ChevronDown,
  LayoutGrid,
  List,
  MoreHorizontal,
  Eye,
  Wrench,
  CheckCircle2,
  Clock,
  Package,
  Bike,
  Car,
  Dumbbell,
  Gamepad2,
  Shirt,
  CircleDot,
  UserCircle,
  CalendarClock,
  RotateCcw,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import {
  useEquipment,
  useEquipmentMutations,
  type Equipment,
  type EquipmentCategoryType,
  type EquipmentStatusType,
} from '@/hooks/use-equipment';
import type { OperationType } from '@clubvantage/api-client';
import { EquipmentAssignModal, type EquipmentForAssignment } from './equipment-assign-modal';
import { EquipmentReturnModal, type EquipmentAssignmentForReturn } from './equipment-return-modal';

// Re-export types for backward compatibility
type EquipmentCategory = EquipmentCategoryType;
type EquipmentStatus = EquipmentStatusType;

export interface EquipmentTabProps {
  /** Optional operation type to filter equipment (GOLF, FACILITY, SPA, EVENT) */
  operationType?: OperationType;
  /** Optional pre-loaded equipment data (for testing or SSR) */
  initialEquipment?: Equipment[];
  onViewDetails?: (equipmentId: string) => void;
  onCheckOut?: (equipmentId: string) => void;
  onCheckIn?: (equipmentId: string) => void;
  onSetMaintenance?: (equipmentId: string) => void;
  className?: string;
}

// Mock data is no longer used - equipment is fetched from the API via useEquipment hook

const categoryConfig: Record<EquipmentCategory, { label: string; icon: typeof Package }> = {
  cart: { label: 'Cart', icon: Car },
  bike: { label: 'Bike', icon: Bike },
  sports: { label: 'Sports', icon: Gamepad2 },
  fitness: { label: 'Fitness', icon: Dumbbell },
  apparel: { label: 'Apparel', icon: Shirt },
  other: { label: 'Other', icon: Package },
};

const statusConfig: Record<EquipmentStatus, { label: string; bg: string; text: string; icon: typeof CheckCircle2 }> = {
  available: {
    label: 'Available',
    bg: 'bg-emerald-100 dark:bg-emerald-500/20',
    text: 'text-emerald-700 dark:text-emerald-400',
    icon: CheckCircle2,
  },
  in_use: {
    label: 'In Use',
    bg: 'bg-blue-100 dark:bg-blue-500/20',
    text: 'text-blue-700 dark:text-blue-400',
    icon: UserCircle,
  },
  reserved: {
    label: 'Reserved',
    bg: 'bg-amber-100 dark:bg-amber-500/20',
    text: 'text-amber-700 dark:text-amber-400',
    icon: CalendarClock,
  },
  maintenance: {
    label: 'Maintenance',
    bg: 'bg-red-100 dark:bg-red-500/20',
    text: 'text-red-700 dark:text-red-400',
    icon: Wrench,
  },
};

const conditionConfig: Record<Equipment['condition'], { label: string; color: string }> = {
  excellent: { label: 'Excellent', color: 'text-emerald-600 dark:text-emerald-400' },
  good: { label: 'Good', color: 'text-blue-600 dark:text-blue-400' },
  fair: { label: 'Fair', color: 'text-amber-600 dark:text-amber-400' },
  needs_repair: { label: 'Needs Repair', color: 'text-red-600 dark:text-red-400' },
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
  }).format(amount);
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

type ViewMode = 'grid' | 'list';
type FilterCategory = 'all' | EquipmentCategoryType;
type FilterStatus = 'all' | EquipmentStatusType;

interface EquipmentCardProps {
  equipment: Equipment;
  viewMode: ViewMode;
  onViewDetails: () => void;
  onCheckOut: () => void;
  onCheckIn: () => void;
  onSetMaintenance: () => void;
}

function EquipmentCard({
  equipment,
  viewMode,
  onViewDetails,
  onCheckOut,
  onCheckIn,
  onSetMaintenance,
}: EquipmentCardProps) {
  const [showActions, setShowActions] = useState(false);

  const categoryStyle = categoryConfig[equipment.category];
  const CategoryIcon = categoryStyle.icon;
  const statusStyle = statusConfig[equipment.status];
  const StatusIcon = statusStyle.icon;
  const conditionStyle = conditionConfig[equipment.condition];

  const isGrid = viewMode === 'grid';
  const isAvailable = equipment.status === 'available';
  const isInUse = equipment.status === 'in_use' || equipment.status === 'reserved';

  return (
    <div
      className={cn(
        'group relative rounded-lg border bg-card transition-all',
        equipment.status === 'maintenance'
          ? 'border-red-200 dark:border-red-500/30'
          : 'border-border hover:border-amber-300 hover:shadow-sm dark:hover:border-amber-500/50',
        isGrid ? 'p-4' : 'p-4'
      )}
    >
      <div className={cn(isGrid ? 'flex flex-col gap-3' : 'flex items-start gap-4')}>
        {/* Icon */}
        <div
          className={cn(
            'flex shrink-0 items-center justify-center rounded-lg',
            equipment.status === 'maintenance'
              ? 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400'
              : isInUse
                ? 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400'
                : 'bg-muted text-muted-foreground',
            isGrid ? 'h-12 w-12' : 'h-10 w-10'
          )}
        >
          <CategoryIcon className={isGrid ? 'h-6 w-6' : 'h-5 w-5'} />
        </div>

        {/* Content */}
        <div className={cn('min-w-0 flex-1', isGrid && 'w-full')}>
          {/* Name & Code */}
          <div className="mb-1 flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate font-medium text-foreground">{equipment.name}</h3>
              <p className="text-xs text-muted-foreground">{equipment.code}</p>
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
                      onViewDetails();
                      setShowActions(false);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted"
                  >
                    <Eye className="h-4 w-4" />
                    View Details
                  </button>
                  {isAvailable && (
                    <button
                      type="button"
                      onClick={() => {
                        onCheckOut();
                        setShowActions(false);
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted"
                    >
                      <UserCircle className="h-4 w-4" />
                      Check Out
                    </button>
                  )}
                  {isInUse && (
                    <button
                      type="button"
                      onClick={() => {
                        onCheckIn();
                        setShowActions(false);
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted"
                    >
                      <RotateCcw className="h-4 w-4" />
                      Check In
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      onSetMaintenance();
                      setShowActions(false);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted"
                  >
                    <Wrench className="h-4 w-4" />
                    {equipment.status === 'maintenance' ? 'End Maintenance' : 'Set Maintenance'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Status & Condition */}
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Badge className={cn('text-[10px]', statusStyle.bg, statusStyle.text)}>
              <StatusIcon className="mr-0.5 h-3 w-3" />
              {statusStyle.label}
            </Badge>
            <span className={cn('flex items-center gap-1 text-[10px]', conditionStyle.color)}>
              <CircleDot className="h-3 w-3" />
              {conditionStyle.label}
            </span>
          </div>

          {/* Maintenance Note */}
          {equipment.status === 'maintenance' && equipment.maintenanceNote && (
            <p className="mb-2 text-xs italic text-red-600 dark:text-red-400">
              {equipment.maintenanceNote}
            </p>
          )}

          {/* Assignment Info */}
          {equipment.assignment && (
            <div className="mb-2 flex items-center gap-2 rounded-lg bg-muted/50 p-2">
              <Avatar className="h-7 w-7">
                <AvatarImage src={equipment.assignment.memberPhoto} alt={equipment.assignment.memberName} />
                <AvatarFallback className="bg-muted text-muted-foreground text-[10px]">
                  {getInitials(equipment.assignment.memberName)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-foreground">
                  {equipment.assignment.memberName}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  Since {equipment.assignment.assignedAt}
                  {equipment.assignment.expectedReturn && ` • Return ${equipment.assignment.expectedReturn}`}
                </p>
              </div>
            </div>
          )}

          {/* Location & Rate */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            {equipment.location && (
              <span className="flex items-center gap-1">
                <Package className="h-3 w-3" />
                {equipment.location}
              </span>
            )}
            {equipment.dailyRate && (
              <span className="font-medium text-foreground">
                {formatCurrency(equipment.dailyRate)}/day
              </span>
            )}
          </div>
        </div>

        {/* Quick Action (List view) */}
        {!isGrid && (
          <div className="shrink-0">
            {isAvailable && (
              <Button size="sm" onClick={onCheckOut}>
                Check Out
              </Button>
            )}
            {isInUse && (
              <Button size="sm" variant="outline" onClick={onCheckIn}>
                <RotateCcw className="mr-1.5 h-3 w-3" />
                Return
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Quick Action (Grid view) */}
      {isGrid && (isAvailable || isInUse) && (
        <div className="mt-3">
          {isAvailable ? (
            <Button size="sm" className="w-full" onClick={onCheckOut}>
              Check Out
            </Button>
          ) : (
            <Button size="sm" variant="outline" className="w-full" onClick={onCheckIn}>
              <RotateCcw className="mr-1.5 h-3 w-3" />
              Return
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * EquipmentTab
 *
 * Displays and manages rentable/reservable equipment.
 * Fetches data from the GraphQL API using the useEquipment hook.
 */
export function EquipmentTab({
  operationType,
  initialEquipment,
  onViewDetails,
  onCheckOut,
  onCheckIn,
  onSetMaintenance,
  className,
}: EquipmentTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [categoryFilter, setCategoryFilter] = useState<FilterCategory>('all');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);
  const [showStatusFilter, setShowStatusFilter] = useState(false);

  // Modal state
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [selectedEquipmentForAssign, setSelectedEquipmentForAssign] = useState<EquipmentForAssignment | null>(null);
  const [selectedAssignmentForReturn, setSelectedAssignmentForReturn] = useState<EquipmentAssignmentForReturn | null>(null);

  // Fetch equipment from API (filtered by operationType if provided)
  const { equipment: fetchedEquipment, counts, isLoading, error, refetch } = useEquipment(operationType);
  const { setMaintenance, isUpdating } = useEquipmentMutations();

  // Use initial equipment if provided (for testing), otherwise use fetched data
  const equipment = initialEquipment || fetchedEquipment;

  // Filter equipment
  const filteredEquipment = useMemo(() => {
    let result = equipment;

    // Search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (e) =>
          e.name.toLowerCase().includes(query) ||
          e.code.toLowerCase().includes(query) ||
          e.location?.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (categoryFilter !== 'all') {
      result = result.filter((e) => e.category === categoryFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter((e) => e.status === statusFilter);
    }

    return result;
  }, [equipment, searchQuery, categoryFilter, statusFilter]);

  // Handle maintenance toggle
  const handleSetMaintenance = async (equipmentId: string) => {
    const item = equipment.find(e => e.id === equipmentId);
    if (!item) return;

    const isMaintenance = item.status === 'maintenance';
    await setMaintenance(equipmentId, !isMaintenance);
    refetch();
    onSetMaintenance?.(equipmentId);
  };

  // Handle check out (assign) modal
  const handleOpenAssignModal = (equipmentId: string) => {
    const item = equipment.find(e => e.id === equipmentId);
    if (!item) return;

    // Transform to EquipmentForAssignment format
    const equipmentForAssign: EquipmentForAssignment = {
      id: item.id,
      assetNumber: item.code,
      name: item.name,
      condition: item.condition.toUpperCase(),
      category: {
        id: item.categoryId || item.category,
        name: categoryConfig[item.category]?.label || item.category,
        icon: item.categoryIcon,
        color: item.categoryColor,
        defaultRentalRate: item.dailyRate,
      },
    };

    setSelectedEquipmentForAssign(equipmentForAssign);
    setAssignModalOpen(true);
    onCheckOut?.(equipmentId);
  };

  // Handle check in (return) modal
  const handleOpenReturnModal = (equipmentId: string) => {
    const item = equipment.find(e => e.id === equipmentId);
    if (!item || !item.assignment) return;

    // Transform to EquipmentAssignmentForReturn format
    const assignmentForReturn: EquipmentAssignmentForReturn = {
      id: item.assignment.assignmentId,
      equipmentId: item.id,
      equipment: {
        id: item.id,
        assetNumber: item.code,
        name: item.name,
        category: {
          id: item.categoryId || item.category,
          name: categoryConfig[item.category]?.label || item.category,
          color: item.categoryColor,
          icon: item.categoryIcon,
        },
      },
      member: {
        id: item.assignment.memberId,
        firstName: item.assignment.memberName.split(' ')[0] || '',
        lastName: item.assignment.memberName.split(' ').slice(1).join(' ') || '',
        memberId: item.assignment.memberNumber,
      },
      assignedAt: item.assignment.assignedAtRaw, // Use raw date for duration calculations
      conditionAtCheckout: item.condition.toUpperCase(),
      rentalFee: item.dailyRate,
    };

    setSelectedAssignmentForReturn(assignmentForReturn);
    setReturnModalOpen(true);
    onCheckIn?.(equipmentId);
  };

  // Handle modal success callbacks
  const handleAssignSuccess = () => {
    refetch();
    setAssignModalOpen(false);
    setSelectedEquipmentForAssign(null);
  };

  const handleReturnSuccess = () => {
    refetch();
    setReturnModalOpen(false);
    setSelectedAssignmentForReturn(null);
  };

  const categoryOptions: { value: FilterCategory; label: string }[] = [
    { value: 'all', label: 'All Categories' },
    { value: 'cart', label: 'Carts' },
    { value: 'bike', label: 'Bikes' },
    { value: 'sports', label: 'Sports' },
    { value: 'fitness', label: 'Fitness' },
    { value: 'apparel', label: 'Apparel' },
    { value: 'other', label: 'Other' },
  ];

  const statusOptions: { value: FilterStatus; label: string }[] = [
    { value: 'all', label: 'All Status' },
    { value: 'available', label: 'Available' },
    { value: 'in_use', label: 'In Use' },
    { value: 'reserved', label: 'Reserved' },
    { value: 'maintenance', label: 'Maintenance' },
  ];

  // Loading state
  if (isLoading && !initialEquipment) {
    return (
      <div className={cn('flex h-full flex-col items-center justify-center', className)}>
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
        <p className="mt-3 text-sm text-muted-foreground">Loading equipment...</p>
      </div>
    );
  }

  // Error state
  if (error && !initialEquipment) {
    return (
      <div className={cn('flex h-full flex-col items-center justify-center', className)}>
        <AlertCircle className="h-8 w-8 text-red-500" />
        <p className="mt-3 text-sm font-medium text-foreground">Failed to load equipment</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {error instanceof Error ? error.message : 'Unknown error occurred'}
        </p>
        <Button onClick={() => refetch()} variant="outline" size="sm" className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className={cn('flex h-full flex-col', className)}>
      {/* Header */}
      <div className="shrink-0 border-b border-border bg-card p-4 sm:p-6">
        {/* Title & Stats */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground sm:text-xl">
              Equipment
              {isUpdating && <Loader2 className="ml-2 inline h-4 w-4 animate-spin" />}
            </h2>
            <p className="text-sm text-muted-foreground">
              {counts.available} available • {counts.inUse} in use
            </p>
          </div>

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
              placeholder="Search equipment..."
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

          {/* Category Filter */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowCategoryFilter(!showCategoryFilter);
                setShowStatusFilter(false);
              }}
              className={cn(
                'flex h-10 items-center gap-2 rounded-lg border border-border bg-background px-3 text-sm transition-colors hover:bg-muted',
                categoryFilter !== 'all' && 'border-amber-500 bg-amber-50 dark:bg-amber-500/10'
              )}
            >
              <Package className="h-4 w-4 text-muted-foreground" />
              <span className="text-foreground">
                {categoryOptions.find((o) => o.value === categoryFilter)?.label}
              </span>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </button>

            {showCategoryFilter && (
              <div className="absolute left-0 top-full z-10 mt-1 w-44 rounded-lg border border-border bg-card py-1 shadow-lg sm:left-auto sm:right-0">
                {categoryOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      setCategoryFilter(option.value);
                      setShowCategoryFilter(false);
                    }}
                    className={cn(
                      'flex w-full items-center px-3 py-2 text-sm transition-colors hover:bg-muted',
                      categoryFilter === option.value && 'bg-muted'
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
                setShowCategoryFilter(false);
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
              <div className="absolute right-0 top-full z-10 mt-1 w-36 rounded-lg border border-border bg-card py-1 shadow-lg">
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
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        {filteredEquipment.length > 0 ? (
          <div
            className={cn(
              viewMode === 'grid'
                ? 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                : 'space-y-3'
            )}
          >
            {filteredEquipment.map((item) => (
              <EquipmentCard
                key={item.id}
                equipment={item}
                viewMode={viewMode}
                onViewDetails={() => onViewDetails?.(item.id)}
                onCheckOut={() => handleOpenAssignModal(item.id)}
                onCheckIn={() => handleOpenReturnModal(item.id)}
                onSetMaintenance={() => handleSetMaintenance(item.id)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Package className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">No equipment found</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {searchQuery || categoryFilter !== 'all' || statusFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'No equipment has been added yet'}
            </p>
          </div>
        )}
      </div>

      {/* Footer Summary */}
      <div className="shrink-0 border-t border-border bg-muted/30 px-4 py-3 sm:px-6">
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
          <span>
            <span className="font-medium text-foreground">{counts.total}</span> total items
          </span>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>{counts.available} available</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-blue-500" />
            <span>{counts.inUse} in use</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-red-500" />
            <span>{counts.maintenance} maintenance</span>
          </div>
        </div>
      </div>

      {/* Equipment Assign Modal */}
      <EquipmentAssignModal
        isOpen={assignModalOpen}
        onClose={() => {
          setAssignModalOpen(false);
          setSelectedEquipmentForAssign(null);
        }}
        equipment={selectedEquipmentForAssign}
        onSuccess={handleAssignSuccess}
      />

      {/* Equipment Return Modal */}
      <EquipmentReturnModal
        isOpen={returnModalOpen}
        onClose={() => {
          setReturnModalOpen(false);
          setSelectedAssignmentForReturn(null);
        }}
        assignment={selectedAssignmentForReturn}
        onSuccess={handleReturnSuccess}
      />
    </div>
  );
}
