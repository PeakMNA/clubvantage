/**
 * Query keys factory for React Query cache management
 * Provides structured keys for invalidation and cache manipulation
 */
export const queryKeys = {
  // Billing module
  invoices: {
    all: ['invoices'] as const,
    lists: () => [...queryKeys.invoices.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.invoices.lists(), filters] as const,
    details: () => [...queryKeys.invoices.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.invoices.details(), id] as const,
  },
  billingStats: {
    all: ['billingStats'] as const,
  },
  payments: {
    all: ['payments'] as const,
    lists: () => [...queryKeys.payments.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.payments.lists(), filters] as const,
  },
  creditNotes: {
    all: ['creditNotes'] as const,
    lists: () => [...queryKeys.creditNotes.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.creditNotes.lists(), filters] as const,
    details: () => [...queryKeys.creditNotes.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.creditNotes.details(), id] as const,
  },
  discounts: {
    all: ['discounts'] as const,
    lists: () => [...queryKeys.discounts.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.discounts.lists(), filters] as const,
    details: () => [...queryKeys.discounts.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.discounts.details(), id] as const,
  },
  paymentArrangements: {
    all: ['paymentArrangements'] as const,
    lists: () => [...queryKeys.paymentArrangements.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.paymentArrangements.lists(), filters] as const,
    details: () => [...queryKeys.paymentArrangements.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.paymentArrangements.details(), id] as const,
  },
  shareableLinks: {
    all: ['shareableLinks'] as const,
    lists: () => [...queryKeys.shareableLinks.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.shareableLinks.lists(), filters] as const,
  },

  // Members module
  members: {
    all: ['members'] as const,
    lists: () => [...queryKeys.members.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.members.lists(), filters] as const,
    details: () => [...queryKeys.members.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.members.details(), id] as const,
    stats: ['memberStats'] as const,
  },
  memberStats: {
    all: ['memberStats'] as const,
  },

  // Bookings module
  bookings: {
    all: ['bookings'] as const,
    lists: () => [...queryKeys.bookings.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.bookings.lists(), filters] as const,
    details: () => [...queryKeys.bookings.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.bookings.details(), id] as const,
    calendar: (date: string, facilityId?: string) => [...queryKeys.bookings.all, 'calendar', date, facilityId] as const,
    calendarDay: (params: { date: string; facilityId?: string }) => [...queryKeys.bookings.all, 'calendar', params.date, params.facilityId] as const,
  },
  bookingStats: {
    all: ['bookingStats'] as const,
  },

  // Golf module
  teeSheet: {
    all: ['teeSheet'] as const,
    byDate: (courseId: string, date: string) => [...queryKeys.teeSheet.all, courseId, date] as const,
  },
  teeTimes: {
    all: ['teeTimes'] as const,
    lists: () => [...queryKeys.teeTimes.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.teeTimes.lists(), filters] as const,
    details: () => [...queryKeys.teeTimes.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.teeTimes.details(), id] as const,
  },
  courses: {
    all: ['courses'] as const,
  },

  // Facilities module
  facilities: {
    all: ['facilities'] as const,
    lists: () => [...queryKeys.facilities.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.facilities.lists(), filters] as const,
  },

  // Services module
  services: {
    all: ['services'] as const,
    lists: () => [...queryKeys.services.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.services.lists(), filters] as const,
  },

  // Staff module
  staff: {
    all: ['staff'] as const,
    lists: () => [...queryKeys.staff.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.staff.lists(), filters] as const,
  },

  // Waitlist module
  waitlist: {
    all: ['waitlist'] as const,
    lists: () => [...queryKeys.waitlist.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.waitlist.lists(), filters] as const,
  },

  // Applications module
  applications: {
    all: ['applications'] as const,
    lists: () => [...queryKeys.applications.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.applications.lists(), filters] as const,
    details: () => [...queryKeys.applications.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.applications.details(), id] as const,
    stats: ['applicationStats'] as const,
  },
} as const;
