# Bookings / Facilities / Facility Management

## Overview

The Facilities tab provides management of bookable physical spaces at the club, including tennis courts, spa rooms, swimming pools, fitness studios, and multi-purpose rooms. Staff can view all facilities in a grid or list layout, create new facilities with operating hours and features, edit existing facility configurations, toggle facility active status, and set facilities into maintenance mode. Each facility is backed by a `Facility` model containing `Resource` records that appear as columns on the booking calendar. The system supports nested/divisible resources (e.g., a Grand Ballroom that splits into meeting rooms) through a `parentResourceId` hierarchy, though the tree-view UI for nested resources is not yet implemented. Facility CRUD operations are performed via GraphQL mutations through server actions with permission checks.

## Status

| Aspect | State | Notes |
|--------|-------|-------|
| Facility list (grid/list views) | Implemented | Card-based grid and list display with type icons |
| Facility search | Implemented | Text search on name, location |
| Facility type filter | Implemented | Filter by court, spa, studio, pool, room |
| Facility status filter | Implemented | Filter by available, partial, maintenance, closed |
| Create facility modal | Implemented | `facility-modal.tsx` with full form |
| Update facility modal | Implemented | Reuses create modal in edit mode |
| Delete facility | Implemented | Confirmation dialog before deletion |
| Operating hours editor | Implemented | `operating-hours-editor.tsx` per-day schedule |
| Facility features/amenities | Implemented | Tag-based feature list on facility cards |
| Revenue center assignment | Partially Implemented | UI field exists; backend linkage incomplete |
| Facility type icons | Implemented | Court, Spa, Studio, Pool, Room icons |
| Booking count display | Implemented | Shows bookings today / capacity today |
| Maintenance mode toggle | Implemented | UI handler exists; server action logs to console |
| GraphQL CRUD | Implemented | `createFacility`, `updateFacility`, `deleteFacility` mutations |
| Server actions with auth | Implemented | `requirePermission('facility:create/update/delete')` |
| Nested/divisible resources | Schema Designed | `parentResourceId`, `isBookable`, `configuration` fields planned in schema |
| Resource tree view | Not Implemented | Planned in design doc but no component exists |
| Capacity management | Partially Implemented | Capacity field exists but no enforcement on booking creation |
| Facility scheduling rules | Not Implemented | No per-facility booking rules (min duration, advance booking) |
| Facility images/photos | Not Implemented | No image upload for facilities |

## Capabilities

- Display all facilities in responsive grid or list layout with type-specific icons
- Search facilities by name or location
- Filter facilities by type (court, spa, studio, pool, room) and status
- Create new facilities with name, type, location, capacity, description, features, and operating hours
- Edit existing facility details including operating hours per day of week
- Delete facilities with confirmation dialog (prevents deletion if active bookings exist)
- Toggle facility active/inactive status
- Set facility into maintenance mode (blocks new bookings)
- Display daily booking count and capacity utilization per facility
- Assign revenue centers for billing integration
- Configure per-day operating hours (open/close time, open/closed toggle)

## Dependencies

### Interface Dependencies

| Module | Dependency | Usage |
|--------|-----------|-------|
| Calendar | Resource display | Facilities appear as resource columns on the calendar grid |
| Services | Facility requirements | Services can specify required facility features; facilities are matched |
| Staff | Default facility | Staff members can have a default facility assignment |
| Billing | Revenue center | Facilities link to revenue centers for charge categorization |
| Equipment | Facility equipment options | Equipment categories can be associated with facilities as add-ons |
| Members | Booking access | Member tier may restrict access to certain facility types |
| Settings | Operating hours | Default operating hours template for new facilities |

### Settings Dependencies

| Setting | Usage |
|---------|-------|
| Default operating hours | Pre-populates operating hours when creating new facilities |
| Facility types | List of available facility types (currently hardcoded) |
| Booking slot duration | Minimum booking duration per facility type |
| Maintenance mode notifications | Whether to notify members with affected bookings |

### Data Dependencies

| Data Source | Query/Mutation | Description |
|-------------|---------------|-------------|
| `facilities` | GraphQL Query | Fetches all facilities with resources and operating hours |
| `createFacility` | GraphQL Mutation | Creates a new facility with resources and operating hours |
| `updateFacility` | GraphQL Mutation | Updates facility details and operating hours |
| `deleteFacility` | GraphQL Mutation | Soft-deletes a facility (prevents deletion if bookings exist) |

## Settings Requirements

| Setting | Type | Default | Configured By | Description |
|---------|------|---------|---------------|-------------|
| `facility.types` | `string[]` | `["COURT","SPA","STUDIO","POOL","ROOM"]` | Platform Admin | Available facility types |
| `facility.defaultCapacity` | `Record<FacilityType, number>` | `{ COURT: 4, SPA: 1, STUDIO: 20, POOL: 6, ROOM: 50 }` | Club Admin | Default capacity per facility type |
| `facility.defaultOperatingHours` | `OperatingHoursTemplate` | `{ start: "06:00", end: "22:00", closedDays: [] }` | Club Admin | Default operating hours for new facilities |
| `facility.allowOverlappingBookings` | `boolean` | `false` | Club Admin | Whether a facility resource can have multiple simultaneous bookings (for group classes) |
| `facility.minBookingDurationMinutes` | `number` | `30` | Club Admin | Minimum booking duration for any facility |
| `facility.maxBookingDurationMinutes` | `number` | `480` | Club Admin | Maximum booking duration (8 hours) |
| `facility.maintenanceModeNotify` | `boolean` | `true` | Club Admin | Whether to send notifications when facility enters maintenance |
| `facility.requireRevenueCentre` | `boolean` | `false` | Club Admin | Whether revenue center assignment is required for facilities |
| `facility.enableNestedResources` | `boolean` | `false` | Club Admin | Whether divisible space configuration is enabled |
| `facility.imageUploadEnabled` | `boolean` | `false` | Platform Admin | Whether facility image uploads are supported |

## Data Model

```typescript
interface Facility {
  id: string;
  clubId: string;
  name: string;
  type: FacilityType;
  location: string;
  description?: string;
  capacity: number;
  features: string[];
  isActive: boolean;
  revenueCenterId?: string;
  operatingHours: OperatingHoursEntry[];
  resources: Resource[];
  createdAt: Date;
  updatedAt: Date;
}

type FacilityType = 'COURT' | 'SPA' | 'STUDIO' | 'POOL' | 'ROOM';

interface OperatingHoursEntry {
  dayOfWeek: number;          // 0 = Sunday, 6 = Saturday
  isOpen: boolean;
  openTime?: string;          // HH:mm
  closeTime?: string;         // HH:mm
}

interface Resource {
  id: string;
  facilityId: string;
  name: string;
  code: string;
  sortOrder: number;
  isActive: boolean;
  parentResourceId?: string;  // For nested/divisible spaces
  isBookable: boolean;        // false for container-only resources
  configuration?: ResourceConfiguration;
  parent?: Resource;
  children?: Resource[];
}

interface ResourceConfiguration {
  layout?: string;            // e.g., "theater", "classroom", "boardroom"
  setupTimeMinutes?: number;
  teardownTimeMinutes?: number;
  maxCapacity?: number;
  amenities?: string[];
}

interface FacilityFormData {
  id?: string;
  name: string;
  type: string;
  location: string;
  capacity: number;
  description?: string;
  features: string[];
  isActive: boolean;
  operatingHours: Array<{
    dayOfWeek: number;
    isOpen: boolean;
    openTime?: string;
    closeTime?: string;
  }>;
}

// GraphQL input types
interface CreateFacilityInput {
  name: string;
  type: ResourceTypeEnum;
  location?: string;
  capacity?: number;
  description?: string;
  features?: string[];
  operatingHours: OperatingHoursInput[];
  isActive?: boolean;
}

interface UpdateFacilityInput {
  id: string;
  name?: string;
  type?: ResourceTypeEnum;
  location?: string;
  capacity?: number;
  description?: string;
  features?: string[];
  operatingHours?: OperatingHoursInput[];
  isActive?: boolean;
}

// Nested resource availability (planned)
interface ResourceAvailabilityResult {
  available: boolean;
  conflicts: Array<{
    bookingId: string;
    bookingNumber: string;
    resourceId: string;
    resourceName: string;
    startTime: Date;
    endTime: Date;
    conflictType: 'self' | 'ancestor' | 'descendant';
  }>;
}

// Equipment options per facility (planned)
interface FacilityEquipmentOption {
  id: string;
  facilityId: string;
  equipmentCategoryId: string;
  isIncluded: boolean;        // true = included in booking price
  rentalRate?: number;        // override rate if not included
  maxQuantity: number;
}
```

## Business Rules

1. **Unique Names**: Facility names must be unique within a club. The API rejects duplicates.

2. **Active Status**: Only active facilities appear as bookable resources on the calendar. Deactivating a facility does not cancel existing bookings but prevents new ones.

3. **Maintenance Mode**: When a facility is set to maintenance, all time slots for that facility display as `MAINTENANCE` on the calendar. Existing bookings are not auto-cancelled; staff must handle them manually.

4. **Operating Hours**: Facilities have per-day operating hours. Bookings cannot be created outside these hours. If a day is marked as closed, no bookings are allowed for that day.

5. **Capacity**: The capacity field represents the maximum number of concurrent occupants. For single-occupant facilities (spa rooms), capacity is 1. For group spaces (studios), capacity determines the maximum participants per class. Capacity enforcement is not yet implemented on the booking creation side.

6. **Deletion Protection**: A facility cannot be deleted if it has any active (non-cancelled, non-completed) future bookings. Staff must cancel or reschedule those bookings first.

7. **Nested Resources (Planned)**: When a parent resource is booked, all descendant resources are blocked for that time period. When any child resource is booked, the parent resource is also blocked. This prevents conflicts when a ballroom is split into meeting rooms.

8. **Feature Matching**: Services can specify `requiredFacilityFeatures`. When booking a service, only facilities with all required features are shown as available options.

9. **Revenue Center**: If `requireRevenueCentre` is enabled, facilities must have a revenue center assigned before bookings can be created. Revenue center determines how booking charges are categorized in billing.

10. **Permission Model**: Facility CRUD operations require specific permissions: `facility:create`, `facility:update`, `facility:delete`. These are enforced via `requirePermission()` in server actions.

## Edge Cases

| Scenario | Handling |
|----------|----------|
| Delete facility with future bookings | Deletion blocked with error message showing count of active bookings. Staff must cancel or reassign them first. |
| Change facility type while bookings exist | Allowed. Existing bookings retain their resource references. Calendar icon updates to new type. |
| Set capacity to 0 | Not allowed. Minimum capacity is 1. Form validation prevents submission. |
| Operating hours close time before open time | Form validation rejects this. Close time must be after open time. |
| Two facilities with identical names | GraphQL mutation returns error. UI shows toast with "Facility name already exists." |
| Facility with no operating hours configured | All days default to closed. No bookings can be created until hours are set. |
| Change operating hours when bookings exist outside new hours | Allowed. Existing bookings outside new hours are not cancelled but a warning is shown to staff. |
| Nested resource: book parent when child has booking | Booking rejected with conflict details showing the child booking that blocks the parent. |
| Nested resource: delete parent with children | Deletion rejected. Staff must delete or reassign children first. |
| Facility created without features | Allowed. Features array is optional. Service matching skips feature check for featureless facilities. |
| API timeout during facility creation | Error toast displayed. No partial record created due to transactional mutation. |
| Maintenance mode set during active booking | Booking proceeds normally. Maintenance blocks future bookings only. Active check-ins are not affected. |
| Multiple resources per facility | Supported. Each resource appears as a separate column on the calendar. Resources sorted by `sortOrder`. |
| Facility with special characters in name | Allowed. Name is stored as-is. Special characters are HTML-escaped in display. |
