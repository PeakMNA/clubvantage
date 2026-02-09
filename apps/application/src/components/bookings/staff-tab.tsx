'use client';

import { useState, useMemo, useCallback } from 'react';
import { cn, Button, Badge } from '@clubvantage/ui';
import { Avatar, AvatarFallback, AvatarImage } from '@clubvantage/ui';
import {
  Search,
  X,
  Filter,
  ChevronDown,
  LayoutGrid,
  List,
  Clock,
  Calendar,
  MoreHorizontal,
  Eye,
  CalendarClock,
  UserCheck,
  UserX,
  Coffee,
  Palmtree,
  Star,
  Phone,
  Mail,
  Plus,
  Edit2,
  Loader2,
} from 'lucide-react';
import { StaffModal, type StaffFormData } from './staff-modal';
import { DeleteConfirmDialog } from './delete-confirm-dialog';

// Types
type StaffStatus = 'available' | 'busy' | 'off_duty' | 'on_leave';
type StaffRole = 'therapist' | 'trainer' | 'instructor' | 'coach';

interface StaffSchedule {
  startTime: string;
  endTime: string;
  bookingsToday: number;
  hoursBooked: number;
  hoursAvailable: number;
}

interface StaffMember {
  id: string;
  name: string;
  photoUrl?: string;
  role: StaffRole;
  status: StaffStatus;
  specialties: string[];
  services: string[];
  schedule: StaffSchedule;
  rating?: number;
  phone?: string;
  email?: string;
}

export interface StaffTabProps {
  staff?: StaffMember[];
  isLoading?: boolean;
  onViewSchedule?: (staffId: string) => void;
  onSetAvailability?: (staffId: string) => void;
  onCreateStaff?: (data: StaffFormData) => Promise<void>;
  onUpdateStaff?: (data: StaffFormData) => Promise<void>;
  onDeleteStaff?: (staffId: string) => Promise<void>;
  className?: string;
}

// Mock data
const mockStaff: StaffMember[] = [
  {
    id: 'st1',
    name: 'Nattaya Wongchai',
    role: 'therapist',
    status: 'available',
    specialties: ['Swedish', 'Thai', 'Aromatherapy'],
    services: ['Thai Massage', 'Swedish Massage', 'Hot Stone Therapy'],
    schedule: { startTime: '9:00 AM', endTime: '6:00 PM', bookingsToday: 4, hoursBooked: 5, hoursAvailable: 3 },
    rating: 4.9,
    phone: '+66 81 234 5678',
  },
  {
    id: 'st2',
    name: 'Somchai Prasert',
    role: 'therapist',
    status: 'busy',
    specialties: ['Deep Tissue', 'Sports Massage'],
    services: ['Thai Massage', 'Hot Stone Therapy'],
    schedule: { startTime: '10:00 AM', endTime: '7:00 PM', bookingsToday: 6, hoursBooked: 7, hoursAvailable: 1 },
    rating: 4.7,
  },
  {
    id: 'st3',
    name: 'Apinya Srisuk',
    role: 'therapist',
    status: 'off_duty',
    specialties: ['Aromatherapy', 'Facial'],
    services: ['Swedish Massage', 'Facial Treatment'],
    schedule: { startTime: '-', endTime: '-', bookingsToday: 0, hoursBooked: 0, hoursAvailable: 0 },
    rating: 4.8,
  },
  {
    id: 'st4',
    name: 'Wichai Thongkam',
    role: 'trainer',
    status: 'available',
    specialties: ['Strength', 'HIIT', 'Weight Loss'],
    services: ['Personal Training'],
    schedule: { startTime: '6:00 AM', endTime: '3:00 PM', bookingsToday: 5, hoursBooked: 5, hoursAvailable: 2 },
    rating: 4.6,
    email: 'wichai@clubvantage.com',
  },
  {
    id: 'st5',
    name: 'Tanawat Phanit',
    role: 'instructor',
    status: 'busy',
    specialties: ['Yoga', 'Pilates', 'Meditation'],
    services: ['Yoga Class', 'Pilates Class', 'Meditation Session'],
    schedule: { startTime: '7:00 AM', endTime: '4:00 PM', bookingsToday: 3, hoursBooked: 4, hoursAvailable: 4 },
    rating: 4.9,
  },
  {
    id: 'st6',
    name: 'Preecha Kamol',
    role: 'coach',
    status: 'available',
    specialties: ['Tennis', 'Badminton'],
    services: ['Tennis Lesson (Private)', 'Tennis Lesson (Group)'],
    schedule: { startTime: '8:00 AM', endTime: '5:00 PM', bookingsToday: 4, hoursBooked: 4.5, hoursAvailable: 3.5 },
    rating: 4.8,
  },
  {
    id: 'st7',
    name: 'Kulap Intira',
    role: 'instructor',
    status: 'on_leave',
    specialties: ['Swimming', 'Aqua Aerobics'],
    services: ['Swimming Lesson'],
    schedule: { startTime: '-', endTime: '-', bookingsToday: 0, hoursBooked: 0, hoursAvailable: 0 },
    rating: 4.5,
  },
];

const roleConfig: Record<StaffRole, { label: string; color: string }> = {
  therapist: { label: 'Therapist', color: 'bg-pink-100 text-pink-700 dark:bg-pink-500/20 dark:text-pink-400' },
  trainer: { label: 'Trainer', color: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400' },
  instructor: { label: 'Instructor', color: 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400' },
  coach: { label: 'Coach', color: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' },
};

const statusConfig: Record<StaffStatus, { label: string; bg: string; text: string; icon: typeof UserCheck }> = {
  available: {
    label: 'Available',
    bg: 'bg-emerald-100 dark:bg-emerald-500/20',
    text: 'text-emerald-700 dark:text-emerald-400',
    icon: UserCheck,
  },
  busy: {
    label: 'In Session',
    bg: 'bg-amber-100 dark:bg-amber-500/20',
    text: 'text-amber-700 dark:text-amber-400',
    icon: Clock,
  },
  off_duty: {
    label: 'Off Duty',
    bg: 'bg-muted',
    text: 'text-muted-foreground',
    icon: Coffee,
  },
  on_leave: {
    label: 'On Leave',
    bg: 'bg-blue-100 dark:bg-blue-500/20',
    text: 'text-blue-700 dark:text-blue-400',
    icon: Palmtree,
  },
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

type ViewMode = 'grid' | 'list';
type FilterRole = 'all' | StaffRole;
type FilterStatus = 'all' | StaffStatus;

interface StaffCardProps {
  staff: StaffMember;
  viewMode: ViewMode;
  onViewSchedule: () => void;
  onSetAvailability: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function StaffCard({ staff, viewMode, onViewSchedule, onSetAvailability, onEdit, onDelete }: StaffCardProps) {
  const [showActions, setShowActions] = useState(false);

  const roleStyle = roleConfig[staff.role];
  const statusStyle = statusConfig[staff.status];
  const StatusIcon = statusStyle.icon;

  const isGrid = viewMode === 'grid';
  const isWorking = staff.status === 'available' || staff.status === 'busy';

  const utilizationPercent = isWorking && staff.schedule.hoursBooked + staff.schedule.hoursAvailable > 0
    ? Math.round((staff.schedule.hoursBooked / (staff.schedule.hoursBooked + staff.schedule.hoursAvailable)) * 100)
    : 0;

  return (
    <div
      className={cn(
        'group relative rounded-lg border bg-card transition-all',
        !isWorking
          ? 'border-border opacity-60'
          : 'border-border hover:border-amber-300 hover:shadow-sm dark:hover:border-amber-500/50',
        isGrid ? 'p-4' : 'p-4'
      )}
    >
      <div className={cn(isGrid ? 'flex flex-col items-center text-center' : 'flex items-start gap-4')}>
        {/* Avatar */}
        <div className="relative">
          <Avatar className={cn(isGrid ? 'h-16 w-16' : 'h-12 w-12')}>
            <AvatarImage src={staff.photoUrl} alt={staff.name} />
            <AvatarFallback className="bg-muted text-muted-foreground">
              {getInitials(staff.name)}
            </AvatarFallback>
          </Avatar>
          {/* Status Indicator */}
          <span
            className={cn(
              'absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-card',
              staff.status === 'available' && 'bg-emerald-500',
              staff.status === 'busy' && 'bg-amber-500',
              staff.status === 'off_duty' && 'bg-muted-foreground',
              staff.status === 'on_leave' && 'bg-blue-500'
            )}
          />
        </div>

        {/* Content */}
        <div className={cn('min-w-0 flex-1', isGrid && 'mt-3 w-full')}>
          {/* Name & Actions */}
          <div className={cn('flex items-start justify-between gap-2', isGrid && 'flex-col items-center')}>
            <div className={cn('min-w-0', isGrid && 'w-full')}>
              <div className={cn('flex items-center gap-2', isGrid && 'justify-center')}>
                <h3 className="truncate font-medium text-foreground">{staff.name}</h3>
                {staff.rating && (
                  <span className="flex shrink-0 items-center gap-0.5 text-xs text-amber-600 dark:text-amber-400">
                    <Star className="h-3 w-3 fill-current" />
                    {staff.rating}
                  </span>
                )}
              </div>
            </div>

            {/* Actions Menu (List view) */}
            {!isGrid && (
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
                      Edit Staff
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
                        onSetAvailability();
                        setShowActions(false);
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted"
                    >
                      <CalendarClock className="h-4 w-4" />
                      Set Availability
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
                      Delete Staff
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Badges */}
          <div className={cn('mt-1.5 flex flex-wrap gap-1.5', isGrid && 'justify-center')}>
            <Badge className={cn('text-[10px]', roleStyle.color)}>
              {roleStyle.label}
            </Badge>
            <Badge className={cn('text-[10px]', statusStyle.bg, statusStyle.text)}>
              <StatusIcon className="mr-0.5 h-3 w-3" />
              {statusStyle.label}
            </Badge>
          </div>

          {/* Specialties */}
          <div className={cn('mt-2 flex flex-wrap gap-1', isGrid && 'justify-center')}>
            {staff.specialties.slice(0, isGrid ? 3 : 4).map((specialty) => (
              <span
                key={specialty}
                className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground"
              >
                {specialty}
              </span>
            ))}
            {staff.specialties.length > (isGrid ? 3 : 4) && (
              <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                +{staff.specialties.length - (isGrid ? 3 : 4)}
              </span>
            )}
          </div>

          {/* Schedule (Working staff only) */}
          {isWorking && (
            <div className={cn('mt-3 space-y-2', isGrid && 'text-left')}>
              {/* Hours */}
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="h-3 w-3 shrink-0" />
                <span>{staff.schedule.startTime} - {staff.schedule.endTime}</span>
              </div>

              {/* Utilization Bar */}
              <div>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Today</span>
                  <span className="font-medium text-foreground">
                    {staff.schedule.bookingsToday} bookings
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all',
                      utilizationPercent >= 80
                        ? 'bg-red-500'
                        : utilizationPercent >= 50
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                    )}
                    style={{ width: `${Math.min(utilizationPercent, 100)}%` }}
                  />
                </div>
                <p className="mt-0.5 text-[10px] text-muted-foreground">
                  {staff.schedule.hoursAvailable}h available
                </p>
              </div>
            </div>
          )}

          {/* Contact (List view only) */}
          {!isGrid && (staff.phone || staff.email) && (
            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              {staff.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  {staff.phone}
                </span>
              )}
              {staff.email && (
                <span className="flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  {staff.email}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Quick Action (List view) */}
        {!isGrid && isWorking && (
          <Button size="sm" variant="outline" onClick={onViewSchedule} className="shrink-0">
            <Calendar className="mr-1.5 h-3 w-3" />
            Schedule
          </Button>
        )}

        {/* Actions (Grid view) */}
        {isGrid && (
          <div className="mt-4 flex w-full gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={onViewSchedule}
              className="flex-1"
              disabled={!isWorking}
            >
              <Calendar className="mr-1.5 h-3 w-3" />
              Schedule
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * StaffTab
 *
 * Displays and manages staff members who can be assigned to bookings.
 */
export function StaffTab({
  staff = mockStaff,
  isLoading,
  onViewSchedule,
  onSetAvailability,
  onCreateStaff,
  onUpdateStaff,
  onDeleteStaff,
  className,
}: StaffTabProps) {
  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [roleFilter, setRoleFilter] = useState<FilterRole>('all');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [showRoleFilter, setShowRoleFilter] = useState(false);
  const [showStatusFilter, setShowStatusFilter] = useState(false);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffFormData | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState<StaffMember | null>(null);

  // Modal handlers
  const handleAddStaff = useCallback(() => {
    setEditingStaff(null);
    setIsModalOpen(true);
  }, []);

  const handleEditStaffModal = useCallback((member: StaffMember) => {
    const nameParts = member.name.split(' ');
    setEditingStaff({
      id: member.id,
      firstName: nameParts[0] || '',
      lastName: nameParts.slice(1).join(' ') || '',
      email: member.email || '',
      phone: member.phone || '',
      avatarUrl: member.photoUrl,
      capabilities: member.specialties.map((s) => ({ capability: s, level: 'intermediate' as const })),
      certifications: [],
      workingHours: [],
      isActive: member.status !== 'off_duty' && member.status !== 'on_leave',
    });
    setIsModalOpen(true);
  }, []);

  const handleSaveStaff = useCallback(async (data: StaffFormData) => {
    if (data.id) {
      await onUpdateStaff?.(data);
    } else {
      await onCreateStaff?.(data);
    }
  }, [onCreateStaff, onUpdateStaff]);

  const handleDeleteClick = useCallback((member: StaffMember) => {
    setStaffToDelete(member);
    setDeleteConfirmOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (staffToDelete) {
      await onDeleteStaff?.(staffToDelete.id);
      setStaffToDelete(null);
    }
  }, [staffToDelete, onDeleteStaff]);

  // Filter staff
  const filteredStaff = useMemo(() => {
    let result = staff;

    // Search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(query) ||
          s.specialties.some((sp) => sp.toLowerCase().includes(query)) ||
          s.services.some((sv) => sv.toLowerCase().includes(query))
      );
    }

    // Role filter
    if (roleFilter !== 'all') {
      result = result.filter((s) => s.role === roleFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter((s) => s.status === statusFilter);
    }

    return result;
  }, [staff, searchQuery, roleFilter, statusFilter]);

  // Check if any filters are active
  const hasActiveFilters = roleFilter !== 'all' || statusFilter !== 'all';

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    setRoleFilter('all');
    setStatusFilter('all');
  }, []);

  // Counts
  const counts = useMemo(() => {
    return {
      total: staff.length,
      available: staff.filter((s) => s.status === 'available').length,
      busy: staff.filter((s) => s.status === 'busy').length,
    };
  }, [staff]);

  const roleOptions: { value: FilterRole; label: string }[] = [
    { value: 'all', label: 'All Roles' },
    { value: 'therapist', label: 'Therapists' },
    { value: 'trainer', label: 'Trainers' },
    { value: 'instructor', label: 'Instructors' },
    { value: 'coach', label: 'Coaches' },
  ];

  const statusOptions: { value: FilterStatus; label: string }[] = [
    { value: 'all', label: 'All Status' },
    { value: 'available', label: 'Available' },
    { value: 'busy', label: 'In Session' },
    { value: 'off_duty', label: 'Off Duty' },
    { value: 'on_leave', label: 'On Leave' },
  ];

  return (
    <div className={cn('flex h-full flex-col', className)}>
      {/* Header */}
      <div className="shrink-0 border-b border-border bg-card p-4 sm:p-6">
        {/* Title & Stats */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground sm:text-xl">
              Staff
            </h2>
            <p className="text-sm text-muted-foreground">
              {counts.available} available • {counts.busy} in session
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

            {/* Add Staff Button */}
            <Button
              onClick={handleAddStaff}
              className="bg-amber-500 text-white hover:bg-amber-600"
            >
              <Plus className="mr-1.5 h-4 w-4" />
              Add Staff
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
              placeholder="Search staff or specialty..."
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

          {/* Role Filter */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowRoleFilter(!showRoleFilter);
                setShowStatusFilter(false);
              }}
              className={cn(
                'flex h-10 items-center gap-2 rounded-lg border border-border bg-background px-3 text-sm transition-colors hover:bg-muted',
                roleFilter !== 'all' && 'border-amber-500 bg-amber-50 dark:bg-amber-500/10'
              )}
            >
              <UserCheck className="h-4 w-4 text-muted-foreground" />
              <span className="text-foreground">
                {roleOptions.find((o) => o.value === roleFilter)?.label}
              </span>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </button>

            {showRoleFilter && (
              <div className="absolute left-0 top-full z-10 mt-1 w-40 rounded-lg border border-border bg-card py-1 shadow-lg sm:left-auto sm:right-0">
                {roleOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      setRoleFilter(option.value);
                      setShowRoleFilter(false);
                    }}
                    className={cn(
                      'flex w-full items-center px-3 py-2 text-sm transition-colors hover:bg-muted',
                      roleFilter === option.value && 'bg-muted'
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
                setShowRoleFilter(false);
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
        {filteredStaff.length > 0 ? (
          <div
            className={cn(
              viewMode === 'grid'
                ? 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                : 'space-y-3'
            )}
          >
            {filteredStaff.map((member) => (
              <StaffCard
                key={member.id}
                staff={member}
                viewMode={viewMode}
                onViewSchedule={() => onViewSchedule?.(member.id)}
                onSetAvailability={() => onSetAvailability?.(member.id)}
                onEdit={() => handleEditStaffModal(member)}
                onDelete={() => handleDeleteClick(member)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <UserCheck className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">No staff found</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {searchQuery || hasActiveFilters
                ? 'Try adjusting your filters'
                : 'No staff members have been added yet'}
            </p>
          </div>
        )}
      </div>

      {/* Footer Summary */}
      <div className="shrink-0 border-t border-border bg-muted/30 px-4 py-3 sm:px-6">
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
          <span>
            <span className="font-medium text-foreground">{counts.total}</span> total staff
          </span>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>{counts.available} available</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            <span>{counts.busy} in session</span>
          </div>
        </div>
      </div>

      {/* Staff Modal */}
      <StaffModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveStaff}
        staff={editingStaff}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setStaffToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Staff Member?"
        itemName={staffToDelete?.name}
        itemType="staff member"
        warningMessage="Any existing bookings assigned to this staff member will need to be reassigned."
      />
    </div>
  );
}
