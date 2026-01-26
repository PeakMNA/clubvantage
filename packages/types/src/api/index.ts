/**
 * API request/response types for ClubVantage
 */

import type {
  Member,
  MemberStatus,
  MembershipCategory,
  Invoice,
  InvoiceStatus,
  Booking,
  BookingStatus,
  TeeTime,
  Lead,
  LeadStage,
  PaginationParams,
} from '../entities';

// Member API Types
export interface CreateMemberRequest {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  membershipTypeId: string;
  membershipTierId?: string;
  joinDate?: string;
  householdId?: string;
  isPrimaryMember?: boolean;
  referredById?: string;
  referralSource?: string;
}

export interface UpdateMemberRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  status?: MemberStatus;
  membershipTypeId?: string;
  membershipTierId?: string;
}

export interface ListMembersParams extends PaginationParams {
  status?: MemberStatus;
  membershipTypeId?: string;
  category?: MembershipCategory;
  search?: string;
  householdId?: string;
}

// Invoice API Types
export interface CreateInvoiceRequest {
  memberId: string;
  invoiceDate: string;
  dueDate: string;
  lineItems: CreateInvoiceLineItem[];
  notes?: string;
}

export interface CreateInvoiceLineItem {
  description: string;
  chargeTypeId?: string;
  quantity: number;
  unitPrice: number;
  taxType?: string;
  taxRate?: number;
}

export interface ListInvoicesParams extends PaginationParams {
  status?: InvoiceStatus;
  memberId?: string;
  fromDate?: string;
  toDate?: string;
  search?: string;
}

export interface RecordPaymentRequest {
  memberId: string;
  amount: number;
  method: string;
  referenceNumber?: string;
  paymentDate?: string;
  invoiceIds?: string[];
  notes?: string;
}

// Booking API Types
export interface CreateBookingRequest {
  memberId: string;
  facilityId?: string;
  resourceId?: string;
  serviceId?: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  guests?: CreateBookingGuest[];
  notes?: string;
}

export interface CreateBookingGuest {
  name: string;
  email?: string;
  phone?: string;
  createAsLead?: boolean;
}

export interface ListBookingsParams extends PaginationParams {
  status?: BookingStatus;
  memberId?: string;
  facilityId?: string;
  date?: string;
  fromDate?: string;
  toDate?: string;
}

// Golf API Types
export interface CreateTeeTimeRequest {
  courseId: string;
  date: string;
  time: string;
  players: CreateTeeTimePlayer[];
  notes?: string;
}

export interface CreateTeeTimePlayer {
  position: number;
  playerType: 'MEMBER' | 'GUEST';
  memberId?: string;
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  createAsLead?: boolean;
  caddyId?: string;
  cartType?: string;
  sharedWithPosition?: number;
}

export interface ListTeeTimesParams extends PaginationParams {
  courseId?: string;
  date?: string;
  fromDate?: string;
  toDate?: string;
  status?: string;
}

// Lead API Types
export interface CreateLeadRequest {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  source: string;
  notes?: string;
}

export interface UpdateLeadRequest {
  stage?: LeadStage;
  score?: number;
  assignedToId?: string;
  notes?: string;
}

export interface ListLeadsParams extends PaginationParams {
  stage?: LeadStage;
  source?: string;
  assignedToId?: string;
  search?: string;
}

export interface ConvertLeadRequest {
  membershipTypeId: string;
  joinDate?: string;
}

// Auth API Types
export interface LoginRequest {
  email: string;
  password: string;
  tenantSlug?: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    tenantId?: string;
    clubId?: string;
  };
}

export interface RefreshTokenRequest {
  refreshToken: string;
}
