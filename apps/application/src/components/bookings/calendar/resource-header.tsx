'use client';

import { cn } from '@clubvantage/ui';
import {
  Building2,
  Sparkles,
  Dumbbell,
  Waves,
  DoorOpen,
  User,
  MoreHorizontal,
  Settings,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@clubvantage/ui/primitives/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@clubvantage/ui/primitives/dropdown-menu';

// ============================================================================
// Types
// ============================================================================

export type ResourceType = 'court' | 'spa' | 'studio' | 'pool' | 'room' | 'staff';

export interface ResourceHeaderProps {
  /** Unique identifier */
  id: string;
  /** Display name */
  name: string;
  /** Type of resource */
  type: ResourceType;
  /** Optional subtitle (e.g., "Tennis" for a court) */
  subtitle?: string;
  /** Whether the resource is currently selected/active */
  isActive?: boolean;
  /** Whether to show the menu button */
  showMenu?: boolean;
  /** Callback when header is clicked */
  onClick?: () => void;
  /** Callback when "View Details" is clicked */
  onViewDetails?: () => void;
  /** Callback when "Settings" is clicked */
  onSettings?: () => void;
  /** Width of the header */
  width?: number;
  /** Additional class names */
  className?: string;
}

export interface ResourceHeaderGroupProps {
  /** Resources to display */
  resources: Array<{
    id: string;
    name: string;
    type: ResourceType;
    subtitle?: string;
  }>;
  /** Currently selected resource ID */
  selectedResourceId?: string;
  /** Callback when a resource is selected */
  onResourceSelect?: (resourceId: string) => void;
  /** Width of each header */
  headerWidth?: number;
  /** Additional class names */
  className?: string;
}

// ============================================================================
// Constants
// ============================================================================

const resourceIcons: Record<ResourceType, typeof Building2> = {
  court: Building2,
  spa: Sparkles,
  studio: Dumbbell,
  pool: Waves,
  room: DoorOpen,
  staff: User,
};

const resourceColors: Record<ResourceType, string> = {
  court: 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400',
  spa: 'bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400',
  studio: 'bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400',
  pool: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-400',
  room: 'bg-stone-100 text-stone-600 dark:bg-stone-500/20 dark:text-stone-400',
  staff: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400',
};

// ============================================================================
// ResourceHeader
// ============================================================================

/**
 * ResourceHeader
 *
 * Column header for a resource in the calendar grid.
 * Shows resource name, type icon, and optional menu.
 */
export function ResourceHeader({
  id,
  name,
  type,
  subtitle,
  isActive = false,
  showMenu = true,
  onClick,
  onViewDetails,
  onSettings,
  width = 150,
  className,
}: ResourceHeaderProps) {
  const Icon = resourceIcons[type];

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-1 border-r border-border px-2 py-3 transition-colors',
        'last:border-r-0',
        isActive && 'bg-amber-50/50 dark:bg-amber-500/5',
        onClick && 'cursor-pointer hover:bg-muted/50',
        className
      )}
      style={{ width, minWidth: width }}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
    >
      {/* Icon */}
      <div
        className={cn(
          'flex h-8 w-8 items-center justify-center rounded-lg',
          resourceColors[type]
        )}
      >
        <Icon className="h-4 w-4" />
      </div>

      {/* Name */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="max-w-full truncate text-xs font-medium text-foreground">
              {name}
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p>{name}</p>
            {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Subtitle */}
      {subtitle && (
        <span className="max-w-full truncate text-[10px] text-muted-foreground">
          {subtitle}
        </span>
      )}

      {/* Menu */}
      {showMenu && (onViewDetails || onSettings) && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className={cn(
                'absolute right-1 top-1 rounded p-0.5 opacity-0 transition-opacity',
                'hover:bg-muted group-hover:opacity-100',
                'focus:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500'
              )}
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            {onViewDetails && (
              <DropdownMenuItem onClick={onViewDetails}>
                <Building2 className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
            )}
            {onSettings && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onSettings}>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}

// ============================================================================
// ResourceHeaderGroup
// ============================================================================

/**
 * ResourceHeaderGroup
 *
 * A row of resource headers for the calendar.
 */
export function ResourceHeaderGroup({
  resources,
  selectedResourceId,
  onResourceSelect,
  headerWidth = 150,
  className,
}: ResourceHeaderGroupProps) {
  return (
    <div
      className={cn(
        'flex border-b border-border bg-card',
        className
      )}
    >
      {resources.map((resource) => (
        <ResourceHeader
          key={resource.id}
          id={resource.id}
          name={resource.name}
          type={resource.type}
          subtitle={resource.subtitle}
          isActive={resource.id === selectedResourceId}
          onClick={onResourceSelect ? () => onResourceSelect(resource.id) : undefined}
          width={headerWidth}
        />
      ))}
    </div>
  );
}

// ============================================================================
// ResourceHeaderSkeleton
// ============================================================================

/**
 * ResourceHeaderSkeleton
 *
 * Loading skeleton for resource headers.
 */
export function ResourceHeaderSkeleton({
  count = 4,
  width = 150,
  className,
}: {
  count?: number;
  width?: number;
  className?: string;
}) {
  return (
    <div className={cn('flex border-b border-border bg-card', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col items-center justify-center gap-1 border-r border-border px-2 py-3 last:border-r-0"
          style={{ width, minWidth: width }}
        >
          <div className="h-8 w-8 animate-pulse rounded-lg bg-muted" />
          <div className="h-3 w-16 animate-pulse rounded bg-muted" />
          <div className="h-2 w-12 animate-pulse rounded bg-muted" />
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// StaffHeader
// ============================================================================

export interface StaffHeaderProps {
  /** Staff member ID */
  id: string;
  /** Staff member name */
  name: string;
  /** Staff avatar URL */
  avatarUrl?: string;
  /** Staff role/title */
  role?: string;
  /** Whether currently selected */
  isActive?: boolean;
  /** Callback when clicked */
  onClick?: () => void;
  /** Width of the header */
  width?: number;
  /** Additional class names */
  className?: string;
}

/**
 * StaffHeader
 *
 * Specialized header for staff member columns.
 */
export function StaffHeader({
  id,
  name,
  avatarUrl,
  role,
  isActive = false,
  onClick,
  width = 150,
  className,
}: StaffHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-1 border-r border-border px-2 py-3 transition-colors',
        'last:border-r-0',
        isActive && 'bg-amber-50/50 dark:bg-amber-500/5',
        onClick && 'cursor-pointer hover:bg-muted/50',
        className
      )}
      style={{ width, minWidth: width }}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
    >
      {/* Avatar */}
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt=""
          className="h-8 w-8 rounded-full object-cover ring-2 ring-white dark:ring-stone-800"
        />
      ) : (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-500/20">
          <User className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
        </div>
      )}

      {/* Name */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="max-w-full truncate text-xs font-medium text-foreground">
              {name}
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p>{name}</p>
            {role && <p className="text-muted-foreground">{role}</p>}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Role */}
      {role && (
        <span className="max-w-full truncate text-[10px] text-muted-foreground">
          {role}
        </span>
      )}
    </div>
  );
}
