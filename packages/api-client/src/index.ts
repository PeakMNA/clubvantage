// Client
export {
  initializeClient,
  getClient,
  getWSClient,
  graphqlFetcher,
  request,
  subscribe,
  closeClients,
  GraphQLClient,
  type ApiClientConfig,
} from './client';

// Provider
export { ApiProvider, type ApiProviderProps } from './provider';

// Types - export all types from the types module
export * from './types';

// Hooks - only export hooks (not re-exported types) from hooks/generated
// Types are already exported from ./types above
export {
  // Billing hooks
  useGetBillingStatsQuery,
  useInfiniteGetBillingStatsQuery,
  useGetMyInvoicesQuery,
  useInfiniteGetMyInvoicesQuery,
  useGetInvoicesQuery,
  useInfiniteGetInvoicesQuery,
  useGetInvoiceQuery,
  useInfiniteGetInvoiceQuery,
  useGetMemberTransactionsQuery,
  useInfiniteGetMemberTransactionsQuery,
  useCreateInvoiceMutation,
  useSendInvoiceMutation,
  useVoidInvoiceMutation,
  useRecordPaymentMutation,
  // Booking hooks
  useGetBookingsQuery,
  useInfiniteGetBookingsQuery,
  useGetBookingQuery,
  useInfiniteGetBookingQuery,
  useGetBookingStatsQuery,
  useInfiniteGetBookingStatsQuery,
  useGetCalendarDayQuery,
  useInfiniteGetCalendarDayQuery,
  useCreateBookingMutation,
  useCancelBookingMutation,
  useRescheduleBookingMutation,
  useCheckInBookingMutation,
  // Facility hooks
  useGetFacilitiesQuery,
  useInfiniteGetFacilitiesQuery,
  useCreateFacilityMutation,
  useUpdateFacilityMutation,
  useDeleteFacilityMutation,
  // Service hooks
  useGetServicesQuery,
  useInfiniteGetServicesQuery,
  useCreateServiceMutation,
  useUpdateServiceMutation,
  useDeleteServiceMutation,
  // Staff hooks
  useGetBookingStaffQuery,
  useInfiniteGetBookingStaffQuery,
  useCreateStaffMemberMutation,
  useUpdateStaffMemberMutation,
  useDeleteStaffMemberMutation,
  // Waitlist hooks
  useGetWaitlistQuery,
  useInfiniteGetWaitlistQuery,
  useJoinWaitlistMutation,
  useRemoveFromWaitlistMutation,
  useSendWaitlistOfferMutation,
  useAcceptWaitlistOfferMutation,
  useDeclineWaitlistOfferMutation,
  // Golf hooks
  useGetTeeSheetQuery,
  useInfiniteGetTeeSheetQuery,
  useGetCoursesQuery,
  useInfiniteGetCoursesQuery,
  useGetTeeTimeQuery,
  useInfiniteGetTeeTimeQuery,
  useGetTeeTimesQuery,
  useInfiniteGetTeeTimesQuery,
  useCreateTeeTimeMutation,
  useUpdateTeeTimeMutation,
  useCheckInTeeTimeMutation,
  useCancelTeeTimeMutation,
  useMoveTeeTimeMutation,
  // Member hooks
  useGetMyMemberQuery,
  useInfiniteGetMyMemberQuery,
  useGetMembersQuery,
  useInfiniteGetMembersQuery,
  useGetMemberQuery,
  useInfiniteGetMemberQuery,
  useGetMemberStatsQuery,
  useInfiniteGetMemberStatsQuery,
  useCreateMemberMutation,
  useUpdateMemberMutation,
  useDeleteMemberMutation,
  useChangeMemberStatusMutation,
  // Dependent hooks
  useCreateDependentMutation,
  useUpdateDependentMutation,
  useDeleteDependentMutation,
  // Application hooks
  useGetApplicationsQuery,
  useInfiniteGetApplicationsQuery,
  useGetApplicationQuery,
  useInfiniteGetApplicationQuery,
  useGetApplicationStatsQuery,
  useInfiniteGetApplicationStatsQuery,
  useCreateApplicationMutation,
  useUpdateApplicationMutation,
  useChangeApplicationStatusMutation,
} from './hooks/generated';

// Custom hooks
export { useSubscription } from './hooks/useSubscription';

// Utils
export * from './utils';

// Auth
export * from './auth';
