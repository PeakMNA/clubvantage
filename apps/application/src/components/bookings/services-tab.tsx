'use client';

import { useState, useMemo, useCallback } from 'react';
import { cn, Button, Badge } from '@clubvantage/ui';
import {
  Search,
  X,
  Filter,
  ChevronDown,
  Sparkles,
  Dumbbell,
  Heart,
  Trophy,
  LayoutGrid,
  List,
  Clock,
  DollarSign,
  MoreHorizontal,
  Eye,
  Power,
  Edit,
  Tag,
  Users,
  TrendingUp,
  Plus,
  Wallet,
  Loader2,
} from 'lucide-react';
import { ServiceModal, type ServiceFormData } from './service-modal';
import { DeleteConfirmDialog } from './delete-confirm-dialog';

// Types
type ServiceCategory = 'spa' | 'fitness' | 'sports' | 'wellness';
type ServiceStatus = 'active' | 'inactive' | 'seasonal';

interface ServicePricing {
  basePrice: number;
  memberPrice?: number;
  guestSurcharge?: number;
}

interface Service {
  id: string;
  name: string;
  category: ServiceCategory;
  description: string;
  duration: number;
  pricing: ServicePricing;
  status: ServiceStatus;
  bookingsThisWeek: number;
  requiresStaff: boolean;
  maxParticipants?: number;
  popularityRank?: number;
  revenueCenterId?: string;
  revenueCenterName?: string;
}

export interface ServicesTabProps {
  services?: Service[];
  isLoading?: boolean;
  onViewDetails?: (serviceId: string) => void;
  onToggleStatus?: (serviceId: string) => void;
  onEditService?: (serviceId: string) => void;
  onCreateService?: (data: ServiceFormData) => Promise<void>;
  onUpdateService?: (data: ServiceFormData) => Promise<void>;
  onDeleteService?: (serviceId: string) => Promise<void>;
  className?: string;
}

// Mock data
const mockServices: Service[] = [
  {
    id: 's1',
    name: 'Thai Massage',
    category: 'spa',
    description: 'Traditional Thai massage with stretching and acupressure',
    duration: 90,
    pricing: { basePrice: 2000, memberPrice: 1800, guestSurcharge: 500 },
    status: 'active',
    bookingsThisWeek: 24,
    requiresStaff: true,
    popularityRank: 1,
    revenueCenterId: 'rc2',
    revenueCenterName: 'Wellness & Spa',
  },
  {
    id: 's2',
    name: 'Swedish Massage',
    category: 'spa',
    description: 'Classic relaxation massage with long flowing strokes',
    duration: 60,
    pricing: { basePrice: 1500, memberPrice: 1350 },
    status: 'active',
    bookingsThisWeek: 18,
    requiresStaff: true,
    popularityRank: 2,
    revenueCenterId: 'rc2',
    revenueCenterName: 'Wellness & Spa',
  },
  {
    id: 's3',
    name: 'Hot Stone Therapy',
    category: 'spa',
    description: 'Heated basalt stones for deep muscle relaxation',
    duration: 75,
    pricing: { basePrice: 2500, memberPrice: 2250 },
    status: 'active',
    bookingsThisWeek: 12,
    requiresStaff: true,
    revenueCenterId: 'rc2',
    revenueCenterName: 'Wellness & Spa',
  },
  {
    id: 's4',
    name: 'Facial Treatment',
    category: 'spa',
    description: 'Deep cleansing facial with premium skincare products',
    duration: 45,
    pricing: { basePrice: 1200, memberPrice: 1080 },
    status: 'inactive',
    bookingsThisWeek: 0,
    requiresStaff: true,
    revenueCenterId: 'rc2',
    revenueCenterName: 'Wellness & Spa',
  },
  {
    id: 's5',
    name: 'Yoga Class',
    category: 'fitness',
    description: 'Vinyasa flow yoga for all levels',
    duration: 60,
    pricing: { basePrice: 500, memberPrice: 400 },
    status: 'active',
    bookingsThisWeek: 35,
    requiresStaff: true,
    maxParticipants: 15,
    popularityRank: 3,
    revenueCenterId: 'rc3',
    revenueCenterName: 'Fitness Center',
  },
  {
    id: 's6',
    name: 'Pilates Class',
    category: 'fitness',
    description: 'Core strengthening and flexibility training',
    duration: 60,
    pricing: { basePrice: 600, memberPrice: 500 },
    status: 'active',
    bookingsThisWeek: 22,
    requiresStaff: true,
    maxParticipants: 12,
    revenueCenterId: 'rc3',
    revenueCenterName: 'Fitness Center',
  },
  {
    id: 's7',
    name: 'Personal Training',
    category: 'fitness',
    description: 'One-on-one fitness session with certified trainer',
    duration: 60,
    pricing: { basePrice: 1500, memberPrice: 1350 },
    status: 'active',
    bookingsThisWeek: 28,
    requiresStaff: true,
    revenueCenterId: 'rc3',
    revenueCenterName: 'Fitness Center',
  },
  {
    id: 's8',
    name: 'Tennis Lesson (Private)',
    category: 'sports',
    description: 'Private tennis instruction with club pro',
    duration: 60,
    pricing: { basePrice: 1800, memberPrice: 1600 },
    status: 'active',
    bookingsThisWeek: 15,
    requiresStaff: true,
    revenueCenterId: 'rc1',
    revenueCenterName: 'Sports & Recreation',
  },
  {
    id: 's9',
    name: 'Tennis Lesson (Group)',
    category: 'sports',
    description: 'Group tennis clinic for intermediate players',
    duration: 90,
    pricing: { basePrice: 800, memberPrice: 700 },
    status: 'active',
    bookingsThisWeek: 20,
    requiresStaff: true,
    maxParticipants: 6,
    revenueCenterId: 'rc1',
    revenueCenterName: 'Sports & Recreation',
  },
  {
    id: 's10',
    name: 'Swimming Lesson',
    category: 'sports',
    description: 'Swimming instruction for all skill levels',
    duration: 45,
    pricing: { basePrice: 1000, memberPrice: 900 },
    status: 'seasonal',
    bookingsThisWeek: 8,
    requiresStaff: true,
    revenueCenterId: 'rc1',
    revenueCenterName: 'Sports & Recreation',
  },
  {
    id: 's11',
    name: 'Meditation Session',
    category: 'wellness',
    description: 'Guided meditation for stress relief and mindfulness',
    duration: 30,
    pricing: { basePrice: 300, memberPrice: 250 },
    status: 'active',
    bookingsThisWeek: 14,
    requiresStaff: true,
    maxParticipants: 20,
    revenueCenterId: 'rc2',
    revenueCenterName: 'Wellness & Spa',
  },
];

const categoryConfig: Record<ServiceCategory, { label: string; icon: typeof Sparkles; color: string }> = {
  spa: { label: 'Spa', icon: Sparkles, color: 'text-pink-600 dark:text-pink-400' },
  fitness: { label: 'Fitness', icon: Dumbbell, color: 'text-blue-600 dark:text-blue-400' },
  sports: { label: 'Sports', icon: Trophy, color: 'text-amber-600 dark:text-amber-400' },
  wellness: { label: 'Wellness', icon: Heart, color: 'text-emerald-600 dark:text-emerald-400' },
};

const statusConfig: Record<ServiceStatus, { label: string; bg: string; text: string }> = {
  active: {
    label: 'Active',
    bg: 'bg-emerald-100 dark:bg-emerald-500/20',
    text: 'text-emerald-700 dark:text-emerald-400',
  },
  inactive: {
    label: 'Inactive',
    bg: 'bg-muted',
    text: 'text-muted-foreground',
  },
  seasonal: {
    label: 'Seasonal',
    bg: 'bg-blue-100 dark:bg-blue-500/20',
    text: 'text-blue-700 dark:text-blue-400',
  },
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
  }).format(amount);
}

type ViewMode = 'grid' | 'list';
type FilterCategory = 'all' | ServiceCategory;
type FilterStatus = 'all' | ServiceStatus;
type FilterDuration = 'all' | '30' | '45' | '60' | '90' | '90+';
type FilterRevenueCenter = string; // 'all' or specific revenue center name

const durationRanges: { value: FilterDuration; label: string; min: number; max: number }[] = [
  { value: 'all', label: 'All Durations', min: 0, max: Infinity },
  { value: '30', label: '30 min or less', min: 0, max: 30 },
  { value: '45', label: '31-45 min', min: 31, max: 45 },
  { value: '60', label: '46-60 min', min: 46, max: 60 },
  { value: '90', label: '61-90 min', min: 61, max: 90 },
  { value: '90+', label: '90+ min', min: 91, max: Infinity },
];

interface ServiceCardProps {
  service: Service;
  viewMode: ViewMode;
  onViewDetails: () => void;
  onToggleStatus: () => void;
  onEditService: () => void;
  onDelete: () => void;
}

function ServiceCard({
  service,
  viewMode,
  onViewDetails,
  onToggleStatus,
  onEditService,
  onDelete,
}: ServiceCardProps) {
  const [showActions, setShowActions] = useState(false);

  const categoryStyle = categoryConfig[service.category];
  const CategoryIcon = categoryStyle.icon;
  const statusStyle = statusConfig[service.status];

  const isGrid = viewMode === 'grid';
  const discount = service.pricing.memberPrice
    ? Math.round(((service.pricing.basePrice - service.pricing.memberPrice) / service.pricing.basePrice) * 100)
    : 0;

  return (
    <div
      className={cn(
        'group relative rounded-lg border bg-card transition-all',
        service.status === 'inactive'
          ? 'border-border opacity-60'
          : 'border-border hover:border-amber-300 hover:shadow-sm dark:hover:border-amber-500/50',
        isGrid ? 'p-4' : 'p-4'
      )}
    >
      <div className={cn(isGrid ? 'flex flex-col gap-3' : 'flex items-start gap-4')}>
        {/* Icon */}
        <div
          className={cn(
            'flex shrink-0 items-center justify-center rounded-lg bg-muted',
            isGrid ? 'h-12 w-12' : 'h-10 w-10'
          )}
        >
          <CategoryIcon className={cn(isGrid ? 'h-6 w-6' : 'h-5 w-5', categoryStyle.color)} />
        </div>

        {/* Content */}
        <div className={cn('min-w-0 flex-1', isGrid && 'w-full')}>
          {/* Name & Actions */}
          <div className="mb-1 flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="truncate font-medium text-foreground">{service.name}</h3>
                {service.popularityRank && service.popularityRank <= 3 && (
                  <Badge className="shrink-0 bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 text-[10px]">
                    <TrendingUp className="mr-0.5 h-2.5 w-2.5" />
                    #{service.popularityRank}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground line-clamp-1">
                {service.description}
              </p>
              {service.revenueCenterName && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Wallet className="h-3 w-3 shrink-0" />
                  <span className="truncate">{service.revenueCenterName}</span>
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
                <div className="absolute right-0 top-full z-10 mt-1 w-40 rounded-lg border border-border bg-card py-1 shadow-lg">
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
                  <button
                    type="button"
                    onClick={() => {
                      onEditService();
                      setShowActions(false);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted"
                  >
                    <Edit className="h-4 w-4" />
                    Edit Service
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
                    {service.status === 'inactive' ? 'Activate' : 'Deactivate'}
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
                    Delete Service
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Status & Category */}
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Badge className={cn('text-[10px]', statusStyle.bg, statusStyle.text)}>
              {statusStyle.label}
            </Badge>
            <Badge variant="secondary" className="text-[10px]">
              {categoryStyle.label}
            </Badge>
          </div>

          {/* Details */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {service.duration} min
            </span>
            {service.maxParticipants && (
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                Max {service.maxParticipants}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Tag className="h-3 w-3" />
              {service.bookingsThisWeek} this week
            </span>
          </div>

          {/* Pricing */}
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-lg font-bold text-foreground">
              {formatCurrency(service.pricing.memberPrice || service.pricing.basePrice)}
            </span>
            {service.pricing.memberPrice && (
              <>
                <span className="text-sm text-muted-foreground line-through">
                  {formatCurrency(service.pricing.basePrice)}
                </span>
                <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 text-[10px]">
                  {discount}% off
                </Badge>
              </>
            )}
          </div>
          {service.pricing.memberPrice && (
            <p className="mt-0.5 text-[10px] text-muted-foreground">Member price</p>
          )}
        </div>

        {/* Quick Action (List view) */}
        {!isGrid && service.status === 'active' && (
          <Button size="sm" variant="outline" onClick={onViewDetails} className="shrink-0">
            <Eye className="mr-1.5 h-3 w-3" />
            Details
          </Button>
        )}
      </div>
    </div>
  );
}

/**
 * ServicesTab
 *
 * Displays and manages all bookable services with filtering, pricing info, and utilization stats.
 */
export function ServicesTab({
  services = mockServices,
  isLoading,
  onViewDetails,
  onToggleStatus,
  onEditService,
  onCreateService,
  onUpdateService,
  onDeleteService,
  className,
}: ServicesTabProps) {
  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [categoryFilter, setCategoryFilter] = useState<FilterCategory>('all');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [durationFilter, setDurationFilter] = useState<FilterDuration>('all');
  const [revenueCenterFilter, setRevenueCenterFilter] = useState<FilterRevenueCenter>('all');
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);
  const [showStatusFilter, setShowStatusFilter] = useState(false);
  const [showDurationFilter, setShowDurationFilter] = useState(false);
  const [showRevenueCenterFilter, setShowRevenueCenterFilter] = useState(false);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceFormData | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);

  // Modal handlers
  const handleAddService = useCallback(() => {
    setEditingService(null);
    setIsModalOpen(true);
  }, []);

  const handleEditServiceModal = useCallback((service: Service) => {
    setEditingService({
      id: service.id,
      name: service.name,
      description: service.description,
      category: service.category,
      durationMinutes: service.duration,
      bufferMinutes: 0,
      basePrice: service.pricing.basePrice,
      maxParticipants: service.maxParticipants,
      variations: [],
      tierDiscounts: [],
      requiredCapabilities: [],
      requiredFacilityFeatures: [],
      isActive: service.status === 'active',
    });
    setIsModalOpen(true);
  }, []);

  const handleSaveService = useCallback(async (data: ServiceFormData) => {
    if (data.id) {
      await onUpdateService?.(data);
    } else {
      await onCreateService?.(data);
    }
  }, [onCreateService, onUpdateService]);

  const handleDeleteClick = useCallback((service: Service) => {
    setServiceToDelete(service);
    setDeleteConfirmOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (serviceToDelete) {
      await onDeleteService?.(serviceToDelete.id);
      setServiceToDelete(null);
    }
  }, [serviceToDelete, onDeleteService]);

  // Filter services
  const filteredServices = useMemo(() => {
    let result = services;

    // Search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(query) ||
          s.description.toLowerCase().includes(query) ||
          s.category.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (categoryFilter !== 'all') {
      result = result.filter((s) => s.category === categoryFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter((s) => s.status === statusFilter);
    }

    // Duration filter
    if (durationFilter !== 'all') {
      const range = durationRanges.find((r) => r.value === durationFilter);
      if (range) {
        result = result.filter((s) => s.duration >= range.min && s.duration <= range.max);
      }
    }

    // Revenue Center filter
    if (revenueCenterFilter !== 'all') {
      result = result.filter((s) => s.revenueCenterName === revenueCenterFilter);
    }

    return result;
  }, [services, searchQuery, categoryFilter, statusFilter, durationFilter, revenueCenterFilter]);

  // Get unique revenue centers for filter
  const uniqueRevenueCenters = useMemo(() => {
    const centers = [...new Set(services.map((s) => s.revenueCenterName).filter(Boolean))] as string[];
    return centers.sort();
  }, [services]);

  // Check if any filters are active
  const hasActiveFilters = categoryFilter !== 'all' || statusFilter !== 'all' || durationFilter !== 'all' || revenueCenterFilter !== 'all';

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    setCategoryFilter('all');
    setStatusFilter('all');
    setDurationFilter('all');
    setRevenueCenterFilter('all');
  }, []);

  // Counts
  const counts = useMemo(() => {
    return {
      total: services.length,
      active: services.filter((s) => s.status === 'active').length,
      totalBookings: services.reduce((sum, s) => sum + s.bookingsThisWeek, 0),
    };
  }, [services]);

  const categoryOptions: { value: FilterCategory; label: string }[] = [
    { value: 'all', label: 'All Categories' },
    { value: 'spa', label: 'Spa' },
    { value: 'fitness', label: 'Fitness' },
    { value: 'sports', label: 'Sports' },
    { value: 'wellness', label: 'Wellness' },
  ];

  const statusOptions: { value: FilterStatus; label: string }[] = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'seasonal', label: 'Seasonal' },
  ];

  return (
    <div className={cn('flex h-full flex-col', className)}>
      {/* Header */}
      <div className="shrink-0 border-b border-border bg-card p-4 sm:p-6">
        {/* Title & Stats */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground sm:text-xl">
              Services
            </h2>
            <p className="text-sm text-muted-foreground">
              {counts.active} active • {counts.totalBookings} bookings this week
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

            {/* Add Service Button */}
            <Button
              onClick={handleAddService}
              className="bg-amber-500 text-white hover:bg-amber-600"
            >
              <Plus className="mr-1.5 h-4 w-4" />
              Add Service
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
              placeholder="Search services..."
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
                setShowDurationFilter(false);
              }}
              className={cn(
                'flex h-10 items-center gap-2 rounded-lg border border-border bg-background px-3 text-sm transition-colors hover:bg-muted',
                categoryFilter !== 'all' && 'border-amber-500 bg-amber-50 dark:bg-amber-500/10'
              )}
            >
              <Sparkles className="h-4 w-4 text-muted-foreground" />
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
                setShowDurationFilter(false);
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

          {/* Duration Filter */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowDurationFilter(!showDurationFilter);
                setShowCategoryFilter(false);
                setShowStatusFilter(false);
              }}
              className={cn(
                'flex h-10 items-center gap-2 rounded-lg border border-border bg-background px-3 text-sm transition-colors hover:bg-muted',
                durationFilter !== 'all' && 'border-amber-500 bg-amber-50 dark:bg-amber-500/10'
              )}
            >
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-foreground">
                {durationRanges.find((r) => r.value === durationFilter)?.label}
              </span>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </button>

            {showDurationFilter && (
              <div className="absolute right-0 top-full z-10 mt-1 w-40 rounded-lg border border-border bg-card py-1 shadow-lg">
                {durationRanges.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      setDurationFilter(option.value);
                      setShowDurationFilter(false);
                    }}
                    className={cn(
                      'flex w-full items-center px-3 py-2 text-sm transition-colors hover:bg-muted',
                      durationFilter === option.value && 'bg-muted'
                    )}
                  >
                    {option.label}
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
                setShowCategoryFilter(false);
                setShowStatusFilter(false);
                setShowDurationFilter(false);
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
        {filteredServices.length > 0 ? (
          <div
            className={cn(
              viewMode === 'grid'
                ? 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                : 'space-y-3'
            )}
          >
            {filteredServices.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                viewMode={viewMode}
                onViewDetails={() => onViewDetails?.(service.id)}
                onToggleStatus={() => onToggleStatus?.(service.id)}
                onEditService={() => handleEditServiceModal(service)}
                onDelete={() => handleDeleteClick(service)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Sparkles className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">No services found</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {searchQuery || hasActiveFilters
                ? 'Try adjusting your filters'
                : 'No services have been added yet'}
            </p>
          </div>
        )}
      </div>

      {/* Footer Summary */}
      <div className="shrink-0 border-t border-border bg-muted/30 px-4 py-3 sm:px-6">
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
          <span>
            <span className="font-medium text-foreground">{counts.total}</span> total services
          </span>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>{counts.active} active</span>
          </div>
          <div className="flex items-center gap-1.5">
            <TrendingUp className="h-3 w-3" />
            <span>{counts.totalBookings} bookings this week</span>
          </div>
        </div>
      </div>

      {/* Service Modal */}
      <ServiceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveService}
        service={editingService}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setServiceToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Service?"
        itemName={serviceToDelete?.name}
        itemType="service"
        warningMessage="Any existing bookings for this service will need to be reassigned or cancelled."
      />
    </div>
  );
}
