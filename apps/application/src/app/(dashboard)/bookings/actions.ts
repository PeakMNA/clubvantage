'use server';

import { cache } from 'react';
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
// CACHED DATA FETCHERS (Replace with actual database queries)
// React.cache() deduplicates calls within a single request lifecycle
// ============================================================================

/**
 * Get member context for booking validation
 * Cached to avoid duplicate database queries within the same request
 */
const getMemberContext = cache(async (memberId: string): Promise<MemberContext> => {
  // TODO: Replace with actual database query
  return {
    id: memberId,
    status: 'ACTIVE',
    membershipType: 'Gold',
    balance: 0,
    credits: 5000,
    noShowCount: 0,
  };
});

/**
 * Get service context for booking validation and pricing
 * Cached to avoid duplicate database queries within the same request
 */
const getServiceContext = cache(async (serviceId: string): Promise<ServiceContext | undefined> => {
  // TODO: Replace with actual database query
  const services: Record<string, ServiceContext> = {
    s1: { id: 's1', name: 'Thai Massage', basePrice: 2000, durationMinutes: 90, bufferMinutes: 15 },
    s2: { id: 's2', name: 'Swedish Massage', basePrice: 1500, durationMinutes: 60, bufferMinutes: 15 },
    s3: { id: 's3', name: 'Hot Stone Therapy', basePrice: 2500, durationMinutes: 75, bufferMinutes: 15 },
    s5: { id: 's5', name: 'Tennis Lesson (Private)', basePrice: 1800, durationMinutes: 60, bufferMinutes: 0 },
    s7: { id: 's7', name: 'Yoga Class', basePrice: 500, durationMinutes: 60, bufferMinutes: 0 },
    s8: { id: 's8', name: 'Personal Training', basePrice: 1500, durationMinutes: 60, bufferMinutes: 0 },
  };
  return services[serviceId];
});

/**
 * Get staff context for availability and capability checks
 * Cached to avoid duplicate database queries within the same request
 */
const getStaffContext = cache(async (staffId: string): Promise<StaffContext | undefined> => {
  // TODO: Replace with actual database query
  const staff: Record<string, StaffContext> = {
    st1: {
      id: 'st1',
      firstName: 'Nattaya',
      lastName: 'Wongchai',
      capabilities: ['Thai Massage', 'Swedish Massage', 'Hot Stone Therapy'],
      workingSchedule: {
        monday: { start: '09:00', end: '18:00' },
        tuesday: { start: '09:00', end: '18:00' },
        wednesday: { start: '09:00', end: '18:00' },
        thursday: { start: '09:00', end: '18:00' },
        friday: { start: '09:00', end: '18:00' },
        saturday: { start: '10:00', end: '16:00' },
      },
      defaultFacilityId: 'f5',
    },
    st4: {
      id: 'st4',
      firstName: 'Wichai',
      lastName: 'Thongkam',
      capabilities: ['Personal Training', 'Strength Training', 'HIIT'],
      workingSchedule: {
        monday: { start: '06:00', end: '14:00' },
        tuesday: { start: '06:00', end: '14:00' },
        wednesday: { start: '06:00', end: '14:00' },
        thursday: { start: '06:00', end: '14:00' },
        friday: { start: '06:00', end: '14:00' },
      },
    },
    st6: {
      id: 'st6',
      firstName: 'Preecha',
      lastName: 'Kamol',
      capabilities: ['Tennis Lesson (Private)', 'Tennis Lesson (Group)'],
      workingSchedule: {
        monday: { start: '08:00', end: '18:00' },
        tuesday: { start: '08:00', end: '18:00' },
        wednesday: { start: '08:00', end: '18:00' },
        thursday: { start: '08:00', end: '18:00' },
        friday: { start: '08:00', end: '18:00' },
        saturday: { start: '08:00', end: '16:00' },
        sunday: { start: '08:00', end: '14:00' },
      },
      defaultFacilityId: 'f1',
    },
  };
  return staff[staffId];
});

/**
 * Get facility context for availability checks
 * Cached to avoid duplicate database queries within the same request
 */
const getFacilityContext = cache(async (facilityId: string): Promise<FacilityContext | undefined> => {
  // TODO: Replace with actual database query
  const facilities: Record<string, FacilityContext> = {
    f1: { id: 'f1', name: 'Tennis Court 1', operatingHours: { start: '06:00', end: '22:00' }, capacity: 4 },
    f2: { id: 'f2', name: 'Tennis Court 2', operatingHours: { start: '06:00', end: '22:00' }, capacity: 4 },
    f5: { id: 'f5', name: 'Spa Room 1', operatingHours: { start: '09:00', end: '21:00' }, capacity: 1 },
    f6: { id: 'f6', name: 'Spa Room 2', operatingHours: { start: '09:00', end: '21:00' }, capacity: 1 },
    f7: { id: 'f7', name: 'Yoga Studio', operatingHours: { start: '06:00', end: '22:00' }, capacity: 20 },
  };
  return facilities[facilityId];
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
 * TODO: Replace with actual database query
 */
async function fetchExistingBookings(
  dateStr: string,
  staffId?: string,
  facilityId?: string
): Promise<ExistingBooking[]> {
  // Simulate some existing bookings
  if (staffId === 'st1') {
    return [
      {
        startTime: new Date(`${dateStr}T10:00:00`),
        endTime: new Date(`${dateStr}T11:30:00`),
        staffId: 'st1',
        facilityId: 'f5',
      },
      {
        startTime: new Date(`${dateStr}T14:00:00`),
        endTime: new Date(`${dateStr}T15:30:00`),
        staffId: 'st1',
        facilityId: 'f5',
      },
    ];
  }

  return [];
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
    console.error('Validation error:', error);
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
    console.error('Price calculation error:', error);
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
    console.error('Availability check error:', error);
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
    console.error('Quick booking preparation error:', error);
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
    console.error('Payment eligibility check error:', error);
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
  // TODO: Replace with actual database query
  const mockMembers = [
    { id: 'm1', name: 'John Smith', memberNumber: 'M-001', membershipType: 'Gold', status: 'active' as const },
    { id: 'm2', name: 'Sarah Johnson', memberNumber: 'M-002', membershipType: 'Platinum', status: 'active' as const },
    { id: 'm3', name: 'Michael Chen', memberNumber: 'M-003', membershipType: 'Silver', status: 'active' as const },
    { id: 'm4', name: 'Emily Davis', memberNumber: 'M-004', membershipType: 'Gold', status: 'suspended' as const },
    { id: 'm5', name: 'Robert Wilson', memberNumber: 'M-005', membershipType: 'Diamond', status: 'active' as const },
    { id: 'm6', name: 'Lisa Anderson', memberNumber: 'M-006', membershipType: 'Gold', status: 'active' as const },
    { id: 'm7', name: 'David Brown', memberNumber: 'M-007', membershipType: 'Silver', status: 'lapsed' as const },
    { id: 'm8', name: 'Jennifer Taylor', memberNumber: 'M-008', membershipType: 'Platinum', status: 'active' as const },
  ];

  if (!query.trim()) {
    return [];
  }

  const lowerQuery = query.toLowerCase();
  return mockMembers.filter(
    (m) =>
      m.name.toLowerCase().includes(lowerQuery) ||
      m.memberNumber.toLowerCase().includes(lowerQuery)
  );
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
  const staff = await getStaffContext(staffId);
  if (!staff) {
    return [];
  }

  // TODO: Replace with actual database query
  const allServices = [
    { id: 's1', name: 'Thai Massage', duration: 90, price: 2000, category: 'Spa', capability: 'Thai Massage' },
    { id: 's2', name: 'Swedish Massage', duration: 60, price: 1500, category: 'Spa', capability: 'Swedish Massage' },
    { id: 's3', name: 'Hot Stone Therapy', duration: 75, price: 2500, category: 'Spa', capability: 'Hot Stone Therapy' },
    { id: 's5', name: 'Tennis Lesson (Private)', duration: 60, price: 1800, category: 'Sports', capability: 'Tennis Lesson (Private)' },
    { id: 's6', name: 'Tennis Lesson (Group)', duration: 90, price: 800, category: 'Sports', capability: 'Tennis Lesson (Group)' },
    { id: 's7', name: 'Yoga Class', duration: 60, price: 500, category: 'Fitness', capability: 'Yoga Class' },
    { id: 's8', name: 'Personal Training', duration: 60, price: 1500, category: 'Fitness', capability: 'Personal Training' },
  ];

  // Filter services based on staff capabilities
  return allServices
    .filter((s) => staff.capabilities?.includes(s.capability))
    .map(({ capability, ...service }) => service);
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
    console.error('Create facility error:', error);
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
    console.error('Update facility error:', error);
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
    console.error('Delete facility error:', error);
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
    console.error('Create service error:', error);
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
    console.error('Update service error:', error);
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
    console.error('Delete service error:', error);
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
    console.error('Create staff member error:', error);
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
    console.error('Update staff member error:', error);
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
    console.error('Delete staff member error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An error occurred while deleting the staff member',
    };
  }
}
