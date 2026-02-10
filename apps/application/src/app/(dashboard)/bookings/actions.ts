'use server';

import { cache } from 'react';
import { after } from 'next/server';
import { requireAuth, requirePermission } from '@/lib/auth/server-auth';
import {
  bookingService,
  pricingService,
  availabilityService,
  type CreateBookingInput,
  type BookingValidationResult,
  type PriceBreakdown,
  type MemberContext,
  type ServiceContext,
  type StaffContext,
  type FacilityContext,
  type WeeklySchedule,
  type WorkingHours,
  type DayAvailability,
} from '@/lib/services';
import { GraphQLClient } from '@clubvantage/api-client/client';
import type {
  // Facility types
  CreateFacilityMutation,
  CreateFacilityMutationVariables,
  UpdateFacilityMutation,
  UpdateFacilityMutationVariables,
  DeleteFacilityMutation,
  DeleteFacilityMutationVariables,
  CreateFacilityInput,
  UpdateFacilityInput,
  // Service types
  CreateServiceMutation,
  CreateServiceMutationVariables,
  UpdateServiceMutation,
  UpdateServiceMutationVariables,
  DeleteServiceMutation,
  DeleteServiceMutationVariables,
  CreateServiceInput,
  UpdateServiceInput,
  // Staff types
  CreateStaffMemberMutation,
  CreateStaffMemberMutationVariables,
  UpdateStaffMemberMutation,
  UpdateStaffMemberMutationVariables,
  DeleteStaffMemberMutation,
  DeleteStaffMemberMutationVariables,
  CreateStaffMemberInput,
  UpdateStaffMemberInput,
} from '@clubvantage/api-client/types';

// ============================================================================
// GRAPHQL DOCUMENTS (defined locally to avoid 'use client' import issues)
// ============================================================================

const CreateFacilityDocument = /* GraphQL */ `
  mutation CreateFacility($input: CreateFacilityInput!) {
    createFacility(input: $input) {
      success
      facility {
        id
        name
        type
        location
        capacity
        isActive
      }
      error
    }
  }
`;

const UpdateFacilityDocument = /* GraphQL */ `
  mutation UpdateFacility($input: UpdateFacilityInput!) {
    updateFacility(input: $input) {
      success
      facility {
        id
        name
        type
        location
        capacity
        isActive
      }
      error
    }
  }
`;

const DeleteFacilityDocument = /* GraphQL */ `
  mutation DeleteFacility($id: ID!) {
    deleteFacility(id: $id) {
      success
      message
      error
    }
  }
`;

const CreateServiceDocument = /* GraphQL */ `
  mutation CreateService($input: CreateServiceInput!) {
    createService(input: $input) {
      success
      service {
        id
        name
        category
        description
        durationMinutes
        bufferMinutes
        basePrice
        isActive
      }
      error
    }
  }
`;

const UpdateServiceDocument = /* GraphQL */ `
  mutation UpdateService($input: UpdateServiceInput!) {
    updateService(input: $input) {
      success
      service {
        id
        name
        category
        description
        durationMinutes
        bufferMinutes
        basePrice
        isActive
      }
      error
    }
  }
`;

const DeleteServiceDocument = /* GraphQL */ `
  mutation DeleteService($id: ID!) {
    deleteService(id: $id) {
      success
      message
      error
    }
  }
`;

const CreateStaffMemberDocument = /* GraphQL */ `
  mutation CreateStaffMember($input: CreateStaffMemberInput!) {
    createStaffMember(input: $input) {
      success
      staff {
        id
        firstName
        lastName
        photoUrl
        email
        phone
        isActive
      }
      error
    }
  }
`;

const UpdateStaffMemberDocument = /* GraphQL */ `
  mutation UpdateStaffMember($input: UpdateStaffMemberInput!) {
    updateStaffMember(input: $input) {
      success
      staff {
        id
        firstName
        lastName
        photoUrl
        email
        phone
        isActive
      }
      error
    }
  }
`;

const DeleteStaffMemberDocument = /* GraphQL */ `
  mutation DeleteStaffMember($id: ID!) {
    deleteStaffMember(id: $id) {
      success
      message
      error
    }
  }
`;

const GetMemberDocument = /* GraphQL */ `
  query GetMember($id: ID!) {
    member(id: $id) {
      id
      memberId
      firstName
      lastName
      status
      membershipType {
        id
        name
      }
    }
  }
`;

const SearchMembersDocument = /* GraphQL */ `
  query SearchMembers($search: String, $first: Int) {
    members(search: $search, first: $first) {
      edges {
        node {
          id
          memberId
          firstName
          lastName
          status
          photoUrl
          membershipType {
            id
            name
          }
        }
      }
    }
  }
`;

const GetServiceByIdDocument = /* GraphQL */ `
  query GetServices {
    services {
      id
      name
      category
      durationMinutes
      bufferMinutes
      basePrice
      isActive
    }
  }
`;

const GetStaffByIdDocument = /* GraphQL */ `
  query GetBookingStaff {
    bookingStaff {
      id
      firstName
      lastName
      capabilities
      isActive
      workingHours {
        dayOfWeek
        isOpen
        openTime
        closeTime
      }
    }
  }
`;

const GetFacilitiesByIdDocument = /* GraphQL */ `
  query GetFacilities {
    facilities {
      id
      name
      type
      location
      capacity
      isActive
      operatingHours {
        dayOfWeek
        isOpen
        openTime
        closeTime
      }
    }
  }
`;

const GetBookingsForDateDocument = /* GraphQL */ `
  query GetBookings($staffId: ID, $facilityId: ID, $startDate: DateTime, $endDate: DateTime, $first: Int) {
    bookings(staffId: $staffId, facilityId: $facilityId, startDate: $startDate, endDate: $endDate, first: $first) {
      edges {
        node {
          id
          startTime
          endTime
          status
          staffId
          facilityId
        }
      }
    }
  }
`;

// ============================================================================
// SERVER-SIDE GRAPHQL CLIENT
// ============================================================================

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

function getServerClient(): GraphQLClient {
  return new GraphQLClient(`${API_URL}/graphql`, {
    // Server-side doesn't need credentials: 'include'
    // In production, you'd add proper auth headers here
  });
}

// ============================================================================
// TYPES
// ============================================================================

export interface QuickBookingInput {
  clubId: string;
  memberId: string;
  serviceId: string;
  staffId?: string;
  facilityId?: string;
  startTime: Date;
  durationMinutes: number;
  paymentMethod?: 'ON_ACCOUNT' | 'CREDITS' | 'PREPAID' | 'PAY_AT_SERVICE';
  notes?: string;
}

export interface QuickBookingResult {
  success: boolean;
  bookingId?: string;
  bookingNumber?: string;
  error?: string;
  validationErrors?: string[];
}

export interface ValidateBookingInput {
  clubId: string;
  memberId: string;
  serviceId?: string;
  staffId?: string;
  facilityId?: string;
  startTime: Date;
  durationMinutes: number;
}

export interface CalculatePriceInput {
  serviceId: string;
  memberId: string;
  selectedVariationIds?: string[];
}

export interface GetAvailabilityInput {
  clubId: string;
  date: Date;
  serviceId?: string;
  staffId?: string;
  facilityId?: string;
  durationMinutes: number;
}

// ============================================================================
// CACHED DATA FETCHERS
// React.cache() deduplicates calls within a single request lifecycle
// ============================================================================

/**
 * Get member context for booking validation
 * Cached to avoid duplicate database queries within the same request
 */
const getMemberContext = cache(async (memberId: string): Promise<MemberContext> => {
  try {
    const client = getServerClient();
    const data = await client.request<any>(GetMemberDocument, { id: memberId });
    const m = data?.member;
    if (!m) {
      return { id: memberId, status: 'ACTIVE', membershipType: 'Standard', balance: 0, credits: 0, noShowCount: 0 };
    }
    return {
      id: m.id,
      status: m.status || 'ACTIVE',
      membershipType: m.membershipType?.name || 'Standard',
      balance: 0,
      credits: 0,
      noShowCount: 0,
    };
  } catch (error) {
    after(() => console.error('Failed to fetch member context:', error));
    return { id: memberId, status: 'ACTIVE', membershipType: 'Standard', balance: 0, credits: 0, noShowCount: 0 };
  }
});

/**
 * Get service context for booking validation and pricing
 * Cached to avoid duplicate database queries within the same request
 */
const getServiceContext = cache(async (serviceId: string): Promise<ServiceContext | undefined> => {
  try {
    const client = getServerClient();
    const data = await client.request<any>(GetServiceByIdDocument);
    const service = data?.services?.find((s: any) => s.id === serviceId);
    if (!service) return undefined;
    return {
      id: service.id,
      name: service.name,
      basePrice: service.basePrice,
      durationMinutes: service.durationMinutes,
      bufferMinutes: service.bufferMinutes || 0,
    };
  } catch (error) {
    after(() => console.error('Failed to fetch service context:', error));
    return undefined;
  }
});

/**
 * Get staff context for availability and capability checks
 * Cached to avoid duplicate database queries within the same request
 */
const getStaffContext = cache(async (staffId: string): Promise<StaffContext | undefined> => {
  try {
    const client = getServerClient();
    const data = await client.request<any>(GetStaffByIdDocument);
    const staff = data?.bookingStaff?.find((s: any) => s.id === staffId);
    if (!staff) return undefined;

    // Convert workingHours array to weekly schedule
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;
    const workingSchedule: Record<string, { start: string; end: string }> = {};
    for (const wh of (staff.workingHours || [])) {
      if (wh.isOpen && wh.openTime && wh.closeTime) {
        const dayIndex = wh.dayOfWeek;
        const dayName = dayNames[dayIndex];
        if (dayName) {
          workingSchedule[dayName] = { start: wh.openTime, end: wh.closeTime };
        }
      }
    }

    return {
      id: staff.id,
      firstName: staff.firstName,
      lastName: staff.lastName,
      capabilities: staff.capabilities || [],
      workingSchedule,
    };
  } catch (error) {
    after(() => console.error('Failed to fetch staff context:', error));
    return undefined;
  }
});

/**
 * Get facility context for availability checks
 * Cached to avoid duplicate database queries within the same request
 */
const getFacilityContext = cache(async (facilityId: string): Promise<FacilityContext | undefined> => {
  try {
    const client = getServerClient();
    const data = await client.request<any>(GetFacilitiesByIdDocument);
    const facility = data?.facilities?.find((f: any) => f.id === facilityId);
    if (!facility) return undefined;

    // Find first open day's hours as default operating hours
    const openDay = (facility.operatingHours || []).find((h: any) => h.isOpen);
    return {
      id: facility.id,
      name: facility.name,
      operatingHours: openDay
        ? { start: openDay.openTime || '06:00', end: openDay.closeTime || '22:00' }
        : { start: '06:00', end: '22:00' },
      capacity: facility.capacity || 1,
    };
  } catch (error) {
    after(() => console.error('Failed to fetch facility context:', error));
    return undefined;
  }
});

type ExistingBooking = { startTime: Date; endTime: Date; staffId?: string; facilityId?: string };

/**
 * Cache for existing bookings queries within a request
 * Uses a Map with composite key for multi-parameter caching
 */
const bookingsCache = new Map<string, Promise<ExistingBooking[]>>();

/**
 * Get existing bookings for conflict detection
 * Uses in-memory cache for deduplication within the same request
 */
async function getExistingBookingsForDate(
  date: Date,
  staffId?: string,
  facilityId?: string
): Promise<ExistingBooking[]> {
  // Extract date string (toISOString always returns "YYYY-MM-DDTHH:mm:ss.sssZ" format)
  const dateStr = date.toISOString().split('T')[0]!;
  const cacheKey = `${dateStr}:${staffId ?? ''}:${facilityId ?? ''}`;

  // Return cached promise if available
  const cached = bookingsCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  // Create and cache the query promise
  const queryPromise = fetchExistingBookings(dateStr, staffId, facilityId);
  bookingsCache.set(cacheKey, queryPromise);

  return queryPromise;
}

/**
 * Actual database fetch for existing bookings
 */
async function fetchExistingBookings(
  dateStr: string,
  staffId?: string,
  facilityId?: string
): Promise<ExistingBooking[]> {
  try {
    const client = getServerClient();
    const startDate = `${dateStr}T00:00:00.000Z`;
    const endDate = `${dateStr}T23:59:59.999Z`;
    const data = await client.request<any>(GetBookingsForDateDocument, {
      staffId: staffId || undefined,
      facilityId: facilityId || undefined,
      startDate,
      endDate,
      first: 100,
    });

    return (data?.bookings?.edges || []).map((e: any) => ({
      startTime: new Date(e.node.startTime),
      endTime: new Date(e.node.endTime),
      staffId: e.node.staffId,
      facilityId: e.node.facilityId,
    }));
  } catch (error) {
    after(() => console.error('Failed to fetch existing bookings:', error));
    return [];
  }
}

// ============================================================================
// SERVER ACTIONS
// ============================================================================

/**
 * Validate a booking before creation
 */
export async function validateBooking(
  input: ValidateBookingInput
): Promise<BookingValidationResult> {
  try {
    // Parallelize independent queries to eliminate waterfall
    const [member, service, staff, facility, existingBookings] = await Promise.all([
      getMemberContext(input.memberId),
      input.serviceId ? getServiceContext(input.serviceId) : Promise.resolve(undefined),
      input.staffId ? getStaffContext(input.staffId) : Promise.resolve(undefined),
      input.facilityId ? getFacilityContext(input.facilityId) : Promise.resolve(undefined),
      getExistingBookingsForDate(input.startTime, input.staffId, input.facilityId),
    ]);

    const bookingInput: CreateBookingInput = {
      clubId: input.clubId,
      memberId: input.memberId,
      bookingType: input.serviceId ? 'SERVICE' : 'FACILITY',
      serviceId: input.serviceId,
      staffId: input.staffId,
      facilityId: input.facilityId,
      startTime: input.startTime,
      durationMinutes: input.durationMinutes,
    };

    return await bookingService.validateBooking(
      bookingInput,
      member,
      service,
      staff,
      facility,
      existingBookings
    );
  } catch (error) {
    after(() => console.error('Validation error:', error));
    return {
      valid: false,
      errors: ['An error occurred while validating the booking'],
      warnings: [],
    };
  }
}

/**
 * Calculate price for a booking
 */
export async function calculateBookingPrice(
  input: CalculatePriceInput
): Promise<PriceBreakdown | null> {
  try {
    // Parallelize service and member queries
    const [service, member] = await Promise.all([
      getServiceContext(input.serviceId),
      getMemberContext(input.memberId),
    ]);

    if (!service) {
      return null;
    }

    return bookingService.calculateBookingPrice(
      service,
      member,
      input.selectedVariationIds || []
    );
  } catch (error) {
    after(() => console.error('Price calculation error:', error));
    return null;
  }
}

/**
 * Get available time slots for a date
 */
export async function getAvailableSlots(
  input: GetAvailabilityInput
): Promise<DayAvailability | null> {
  try {
    // Parallelize staff, facility, and bookings queries
    const [staff, facility, existingBookings] = await Promise.all([
      input.staffId ? getStaffContext(input.staffId) : Promise.resolve(undefined),
      input.facilityId ? getFacilityContext(input.facilityId) : Promise.resolve(undefined),
      getExistingBookingsForDate(input.date, input.staffId, input.facilityId),
    ]);

    return await availabilityService.getAvailability(
      {
        clubId: input.clubId,
        date: input.date,
        serviceId: input.serviceId,
        staffId: input.staffId,
        facilityId: input.facilityId,
        durationMinutes: input.durationMinutes,
      },
      existingBookings,
      staff?.workingSchedule,
      facility?.operatingHours
    );
  } catch (error) {
    after(() => console.error('Availability check error:', error));
    return null;
  }
}

/**
 * Create a quick booking
 * This server action validates and prepares the booking data,
 * then the client calls the GraphQL mutation to create it.
 */
export async function prepareQuickBooking(
  input: QuickBookingInput
): Promise<{
  valid: boolean;
  bookingNumber?: string;
  endTime?: Date;
  price?: PriceBreakdown;
  errors?: string[];
  warnings?: string[];
}> {
  try {
    // Validate the booking
    const validation = await validateBooking({
      clubId: input.clubId,
      memberId: input.memberId,
      serviceId: input.serviceId,
      staffId: input.staffId,
      facilityId: input.facilityId,
      startTime: input.startTime,
      durationMinutes: input.durationMinutes,
    });

    if (!validation.valid) {
      return {
        valid: false,
        errors: validation.errors,
        warnings: validation.warnings,
      };
    }

    // Parallelize price calculation and service fetch (both independent)
    const [price, service] = await Promise.all([
      calculateBookingPrice({
        serviceId: input.serviceId,
        memberId: input.memberId,
      }),
      getServiceContext(input.serviceId),
    ]);
    const bufferMinutes = service?.bufferMinutes || 0;

    // Generate booking number
    const bookingNumber = bookingService.generateBookingNumber('BK');

    // Calculate end time
    const endTime = bookingService.calculateEndTime(
      input.startTime,
      input.durationMinutes,
      bufferMinutes
    );

    return {
      valid: true,
      bookingNumber,
      endTime,
      price: price || undefined,
      warnings: validation.warnings,
    };
  } catch (error) {
    after(() => console.error('Quick booking preparation error:', error));
    return {
      valid: false,
      errors: ['An error occurred while preparing the booking'],
    };
  }
}

/**
 * Check if a member can use a specific payment method
 */
export async function checkPaymentEligibility(
  memberId: string,
  amount: number,
  method: 'ON_ACCOUNT' | 'CREDITS'
): Promise<{ allowed: boolean; reason?: string }> {
  try {
    const member = await getMemberContext(memberId);

    if (method === 'CREDITS') {
      const allowed = bookingService.canPayWithCredits(member, amount);
      return {
        allowed,
        reason: allowed ? undefined : 'Insufficient credits',
      };
    }

    if (method === 'ON_ACCOUNT') {
      return bookingService.canPayOnAccount(member, amount);
    }

    return { allowed: true };
  } catch (error) {
    after(() => console.error('Payment eligibility check error:', error));
    return { allowed: false, reason: 'Unable to verify payment eligibility' };
  }
}

/**
 * Get cancellation refund information
 */
export async function getCancellationRefund(
  originalAmount: number,
  startTime: Date,
  waiveFee: boolean = false
): Promise<{ refundAmount: number; refundPercent: number; policyApplied: string }> {
  return bookingService.calculateCancellationRefund(originalAmount, startTime, waiveFee);
}

/**
 * Check if a booking can be modified
 */
export async function checkBookingModifiable(
  currentStatus: 'PENDING' | 'CONFIRMED' | 'CHECKED_IN' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW',
  startTime: Date
): Promise<{ allowed: boolean; reason?: string }> {
  // Map status to booking service status type
  const statusMap: Record<string, 'PENDING' | 'CONFIRMED' | 'CHECKED_IN' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'> = {
    PENDING: 'PENDING',
    CONFIRMED: 'CONFIRMED',
    CHECKED_IN: 'CHECKED_IN',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED',
    NO_SHOW: 'NO_SHOW',
  };

  return bookingService.canModifyBooking(statusMap[currentStatus] || 'PENDING', startTime);
}

/**
 * Search members for quick booking
 */
export async function searchMembers(
  query: string
): Promise<Array<{
  id: string;
  name: string;
  memberNumber: string;
  membershipType?: string;
  status: 'active' | 'suspended' | 'lapsed';
}>> {
  if (!query.trim() || query.length < 2) {
    return [];
  }

  try {
    const client = getServerClient();
    const data = await client.request<any>(SearchMembersDocument, { search: query, first: 10 });

    const statusMap: Record<string, 'active' | 'suspended' | 'lapsed'> = {
      ACTIVE: 'active',
      SUSPENDED: 'suspended',
      LAPSED: 'lapsed',
    };

    return (data?.members?.edges || []).map((e: any) => ({
      id: e.node.id,
      name: `${e.node.firstName} ${e.node.lastName}`,
      memberNumber: e.node.memberId || '',
      membershipType: e.node.membershipType?.name,
      status: statusMap[e.node.status] || 'active',
    }));
  } catch (error) {
    after(() => console.error('Failed to search members:', error));
    return [];
  }
}

/**
 * Get services available for a staff member
 */
export async function getServicesForStaff(
  staffId: string
): Promise<Array<{
  id: string;
  name: string;
  duration: number;
  price: number;
  category?: string;
}>> {
  try {
    const staff = await getStaffContext(staffId);
    if (!staff) {
      return [];
    }

    const client = getServerClient();
    const data = await client.request<any>(GetServiceByIdDocument);

    // Filter services by staff capabilities
    return (data?.services || [])
      .filter((s: any) => s.isActive && staff.capabilities?.some((cap: string) => s.name.includes(cap) || cap.includes(s.name)))
      .map((s: any) => ({
        id: s.id,
        name: s.name,
        duration: s.durationMinutes,
        price: s.basePrice,
        category: s.category,
      }));
  } catch (error) {
    after(() => console.error('Failed to fetch services for staff:', error));
    return [];
  }
}

// ============================================================================
// FACILITY CRUD ACTIONS
// ============================================================================

export interface FacilityCrudResult {
  success: boolean;
  facility?: {
    id: string;
    name: string;
    type: string;
    location?: string | null;
    capacity?: number | null;
    isActive: boolean;
  };
  message?: string;
  error?: string;
}

/**
 * Create a new facility
 * Requires authentication and 'facility:create' permission
 */
export async function createFacility(
  input: CreateFacilityInput
): Promise<FacilityCrudResult> {
  try {
    // Verify authentication and permissions
    await requirePermission('facility:create');

    const client = getServerClient();
    const variables: CreateFacilityMutationVariables = { input };
    const result = await client.request<CreateFacilityMutation>(
      CreateFacilityDocument,
      variables
    );

    if (result.createFacility.success && result.createFacility.facility) {
      return {
        success: true,
        facility: {
          id: result.createFacility.facility.id,
          name: result.createFacility.facility.name,
          type: result.createFacility.facility.type,
          location: result.createFacility.facility.location,
          capacity: result.createFacility.facility.capacity,
          isActive: result.createFacility.facility.isActive,
        },
      };
    }

    return {
      success: false,
      error: result.createFacility.error || 'Failed to create facility',
    };
  } catch (error) {
    after(() => console.error('Create facility error:', error));
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An error occurred while creating the facility',
    };
  }
}

/**
 * Update an existing facility
 * Requires authentication and 'facility:update' permission
 */
export async function updateFacility(
  input: UpdateFacilityInput
): Promise<FacilityCrudResult> {
  try {
    // Verify authentication and permissions
    await requirePermission('facility:update');

    const client = getServerClient();
    const variables: UpdateFacilityMutationVariables = { input };
    const result = await client.request<UpdateFacilityMutation>(
      UpdateFacilityDocument,
      variables
    );

    if (result.updateFacility.success && result.updateFacility.facility) {
      return {
        success: true,
        facility: {
          id: result.updateFacility.facility.id,
          name: result.updateFacility.facility.name,
          type: result.updateFacility.facility.type,
          location: result.updateFacility.facility.location,
          capacity: result.updateFacility.facility.capacity,
          isActive: result.updateFacility.facility.isActive,
        },
      };
    }

    return {
      success: false,
      error: result.updateFacility.error || 'Failed to update facility',
    };
  } catch (error) {
    after(() => console.error('Update facility error:', error));
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An error occurred while updating the facility',
    };
  }
}

/**
 * Delete a facility
 * Requires authentication and 'facility:delete' permission
 */
export async function deleteFacility(id: string): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    // Verify authentication and permissions
    await requirePermission('facility:delete');

    const client = getServerClient();
    const variables: DeleteFacilityMutationVariables = { id };
    const result = await client.request<DeleteFacilityMutation>(
      DeleteFacilityDocument,
      variables
    );

    if (result.deleteFacility.success) {
      return {
        success: true,
        message: result.deleteFacility.message || 'Facility deleted successfully',
      };
    }

    return {
      success: false,
      error: result.deleteFacility.error || 'Failed to delete facility',
    };
  } catch (error) {
    after(() => console.error('Delete facility error:', error));
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An error occurred while deleting the facility',
    };
  }
}

// ============================================================================
// SERVICE CRUD ACTIONS
// ============================================================================

export interface ServiceCrudResult {
  success: boolean;
  service?: {
    id: string;
    name: string;
    category: string;
    description?: string | null;
    durationMinutes: number;
    bufferMinutes?: number | null;
    basePrice: number;
    isActive: boolean;
  };
  message?: string;
  error?: string;
}

/**
 * Create a new service
 * Requires authentication and 'service:create' permission
 */
export async function createService(
  input: CreateServiceInput
): Promise<ServiceCrudResult> {
  try {
    // Verify authentication and permissions
    await requirePermission('service:create');

    const client = getServerClient();
    const variables: CreateServiceMutationVariables = { input };
    const result = await client.request<CreateServiceMutation>(
      CreateServiceDocument,
      variables
    );

    if (result.createService.success && result.createService.service) {
      const s = result.createService.service;
      return {
        success: true,
        service: {
          id: s.id,
          name: s.name,
          category: s.category,
          description: s.description,
          durationMinutes: s.durationMinutes,
          bufferMinutes: s.bufferMinutes,
          basePrice: s.basePrice,
          isActive: s.isActive,
        },
      };
    }

    return {
      success: false,
      error: result.createService.error || 'Failed to create service',
    };
  } catch (error) {
    after(() => console.error('Create service error:', error));
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An error occurred while creating the service',
    };
  }
}

/**
 * Update an existing service
 * Requires authentication and 'service:update' permission
 */
export async function updateService(
  input: UpdateServiceInput
): Promise<ServiceCrudResult> {
  try {
    // Verify authentication and permissions
    await requirePermission('service:update');

    const client = getServerClient();
    const variables: UpdateServiceMutationVariables = { input };
    const result = await client.request<UpdateServiceMutation>(
      UpdateServiceDocument,
      variables
    );

    if (result.updateService.success && result.updateService.service) {
      const s = result.updateService.service;
      return {
        success: true,
        service: {
          id: s.id,
          name: s.name,
          category: s.category,
          description: s.description,
          durationMinutes: s.durationMinutes,
          bufferMinutes: s.bufferMinutes,
          basePrice: s.basePrice,
          isActive: s.isActive,
        },
      };
    }

    return {
      success: false,
      error: result.updateService.error || 'Failed to update service',
    };
  } catch (error) {
    after(() => console.error('Update service error:', error));
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An error occurred while updating the service',
    };
  }
}

/**
 * Delete a service
 * Requires authentication and 'service:delete' permission
 */
export async function deleteService(id: string): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    // Verify authentication and permissions
    await requirePermission('service:delete');

    const client = getServerClient();
    const variables: DeleteServiceMutationVariables = { id };
    const result = await client.request<DeleteServiceMutation>(
      DeleteServiceDocument,
      variables
    );

    if (result.deleteService.success) {
      return {
        success: true,
        message: result.deleteService.message || 'Service deleted successfully',
      };
    }

    return {
      success: false,
      error: result.deleteService.error || 'Failed to delete service',
    };
  } catch (error) {
    after(() => console.error('Delete service error:', error));
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An error occurred while deleting the service',
    };
  }
}

// ============================================================================
// STAFF CRUD ACTIONS
// ============================================================================

export interface StaffCrudResult {
  success: boolean;
  staff?: {
    id: string;
    firstName: string;
    lastName: string;
    email?: string | null;
    phone?: string | null;
    photoUrl?: string | null;
    isActive: boolean;
  };
  message?: string;
  error?: string;
}

/**
 * Create a new staff member
 * Requires authentication and 'staff:create' permission
 */
export async function createStaffMember(
  input: CreateStaffMemberInput
): Promise<StaffCrudResult> {
  try {
    // Verify authentication and permissions
    await requirePermission('staff:create');

    const client = getServerClient();
    const variables: CreateStaffMemberMutationVariables = { input };
    const result = await client.request<CreateStaffMemberMutation>(
      CreateStaffMemberDocument,
      variables
    );

    if (result.createStaffMember.success && result.createStaffMember.staff) {
      const s = result.createStaffMember.staff;
      return {
        success: true,
        staff: {
          id: s.id,
          firstName: s.firstName,
          lastName: s.lastName,
          email: s.email,
          phone: s.phone,
          photoUrl: s.photoUrl,
          isActive: s.isActive,
        },
      };
    }

    return {
      success: false,
      error: result.createStaffMember.error || 'Failed to create staff member',
    };
  } catch (error) {
    after(() => console.error('Create staff member error:', error));
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An error occurred while creating the staff member',
    };
  }
}

/**
 * Update an existing staff member
 * Requires authentication and 'staff:update' permission
 */
export async function updateStaffMember(
  input: UpdateStaffMemberInput
): Promise<StaffCrudResult> {
  try {
    // Verify authentication and permissions
    await requirePermission('staff:update');

    const client = getServerClient();
    const variables: UpdateStaffMemberMutationVariables = { input };
    const result = await client.request<UpdateStaffMemberMutation>(
      UpdateStaffMemberDocument,
      variables
    );

    if (result.updateStaffMember.success && result.updateStaffMember.staff) {
      const s = result.updateStaffMember.staff;
      return {
        success: true,
        staff: {
          id: s.id,
          firstName: s.firstName,
          lastName: s.lastName,
          email: s.email,
          phone: s.phone,
          photoUrl: s.photoUrl,
          isActive: s.isActive,
        },
      };
    }

    return {
      success: false,
      error: result.updateStaffMember.error || 'Failed to update staff member',
    };
  } catch (error) {
    after(() => console.error('Update staff member error:', error));
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An error occurred while updating the staff member',
    };
  }
}

/**
 * Delete a staff member
 * Requires authentication and 'staff:delete' permission
 */
export async function deleteStaffMember(id: string): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    // Verify authentication and permissions
    await requirePermission('staff:delete');

    const client = getServerClient();
    const variables: DeleteStaffMemberMutationVariables = { id };
    const result = await client.request<DeleteStaffMemberMutation>(
      DeleteStaffMemberDocument,
      variables
    );

    if (result.deleteStaffMember.success) {
      return {
        success: true,
        message: result.deleteStaffMember.message || 'Staff member deleted successfully',
      };
    }

    return {
      success: false,
      error: result.deleteStaffMember.error || 'Failed to delete staff member',
    };
  } catch (error) {
    after(() => console.error('Delete staff member error:', error));
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An error occurred while deleting the staff member',
    };
  }
}
