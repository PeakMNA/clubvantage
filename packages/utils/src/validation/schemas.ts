/**
 * Zod validation schemas for ClubVantage
 */

import { z } from 'zod';

// Common schemas
export const emailSchema = z.string().email('Invalid email address');

export const phoneSchema = z.string().regex(
  /^[\d\s\-+()]+$/,
  'Invalid phone number'
);

export const dateSchema = z.string().datetime().or(z.date());

export const uuidSchema = z.string().uuid();

// Member schemas
export const memberStatusSchema = z.enum([
  'PROSPECT',
  'LEAD',
  'APPLICANT',
  'ACTIVE',
  'SUSPENDED',
  'LAPSED',
  'RESIGNED',
  'TERMINATED',
  'REACTIVATED',
]);

export const createMemberSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  email: emailSchema.optional(),
  phone: phoneSchema.optional(),
  dateOfBirth: dateSchema.optional(),
  membershipTypeId: uuidSchema,
  membershipTierId: uuidSchema.optional(),
  joinDate: dateSchema.optional(),
  householdId: uuidSchema.optional(),
  isPrimaryMember: z.boolean().default(false),
  referredById: uuidSchema.optional(),
  referralSource: z.string().optional(),
});

export const updateMemberSchema = createMemberSchema.partial().extend({
  status: memberStatusSchema.optional(),
});

// Invoice schemas
export const invoiceStatusSchema = z.enum([
  'DRAFT',
  'SENT',
  'PAID',
  'PARTIALLY_PAID',
  'OVERDUE',
  'VOID',
  'CANCELLED',
]);

export const invoiceLineItemSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  chargeTypeId: uuidSchema.optional(),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  unitPrice: z.number().min(0, 'Unit price must be positive'),
  taxType: z.string().optional(),
  taxRate: z.number().min(0).max(100).optional(),
});

export const createInvoiceSchema = z.object({
  memberId: uuidSchema,
  invoiceDate: dateSchema,
  dueDate: dateSchema,
  lineItems: z.array(invoiceLineItemSchema).min(1, 'At least one line item is required'),
  notes: z.string().optional(),
});

// Payment schemas
export const paymentMethodSchema = z.enum([
  'CASH',
  'BANK_TRANSFER',
  'CREDIT_CARD',
  'QR_PROMPTPAY',
  'QR_PAYNOW',
  'QR_DUITNOW',
  'CHECK',
  'DIRECT_DEBIT',
  'CREDIT',
]);

export const recordPaymentSchema = z.object({
  memberId: uuidSchema,
  amount: z.number().positive('Amount must be positive'),
  method: paymentMethodSchema,
  referenceNumber: z.string().optional(),
  paymentDate: dateSchema.optional(),
  invoiceIds: z.array(uuidSchema).optional(),
  notes: z.string().optional(),
});

// Booking schemas
export const bookingStatusSchema = z.enum([
  'PENDING',
  'CONFIRMED',
  'CHECKED_IN',
  'COMPLETED',
  'CANCELLED',
  'NO_SHOW',
]);

export const createBookingGuestSchema = z.object({
  name: z.string().min(1, 'Guest name is required'),
  email: emailSchema.optional(),
  phone: phoneSchema.optional(),
  createAsLead: z.boolean().default(true),
});

export const createBookingSchema = z.object({
  memberId: uuidSchema,
  facilityId: uuidSchema.optional(),
  resourceId: uuidSchema.optional(),
  serviceId: uuidSchema.optional(),
  startTime: dateSchema,
  endTime: dateSchema.optional(),
  duration: z.number().positive().optional(),
  guests: z.array(createBookingGuestSchema).optional(),
  notes: z.string().optional(),
}).refine(
  (data) => data.facilityId || data.resourceId || data.serviceId,
  { message: 'Either facilityId, resourceId, or serviceId is required' }
);

// Golf schemas
export const playerTypeSchema = z.enum(['MEMBER', 'GUEST']);
export const cartTypeSchema = z.enum(['SINGLE', 'SHARED', 'WALKING']);

export const createTeeTimePlayerSchema = z.object({
  position: z.number().min(1).max(4),
  playerType: playerTypeSchema,
  memberId: uuidSchema.optional(),
  guestName: z.string().optional(),
  guestEmail: emailSchema.optional(),
  guestPhone: phoneSchema.optional(),
  createAsLead: z.boolean().default(true),
  caddyId: uuidSchema.optional(),
  cartType: cartTypeSchema.default('WALKING'),
  sharedWithPosition: z.number().min(1).max(4).optional(),
}).refine(
  (data) => {
    if (data.playerType === 'MEMBER') return !!data.memberId;
    if (data.playerType === 'GUEST') return !!data.guestName;
    return false;
  },
  { message: 'Member ID required for members, guest name required for guests' }
);

export const createTeeTimeSchema = z.object({
  courseId: uuidSchema,
  date: dateSchema,
  time: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be in HH:mm format'),
  players: z.array(createTeeTimePlayerSchema).min(1).max(4),
  notes: z.string().optional(),
});

// Lead schemas
export const leadStageSchema = z.enum([
  'NEW',
  'CONTACTED',
  'QUALIFIED',
  'CONVERTED',
  'LOST',
]);

export const createLeadSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: emailSchema.optional(),
  phone: phoneSchema.optional(),
  source: z.string().min(1, 'Source is required'),
  notes: z.string().optional(),
});

// Auth schemas
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(8, 'Password must be at least 8 characters'),
  tenantSlug: z.string().optional(),
});

// Export types
export type CreateMemberInput = z.infer<typeof createMemberSchema>;
export type UpdateMemberInput = z.infer<typeof updateMemberSchema>;
export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;
export type RecordPaymentInput = z.infer<typeof recordPaymentSchema>;
export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type CreateTeeTimeInput = z.infer<typeof createTeeTimeSchema>;
export type CreateLeadInput = z.infer<typeof createLeadSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
