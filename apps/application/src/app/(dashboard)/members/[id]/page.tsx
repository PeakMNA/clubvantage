'use client';

import { useState, useMemo, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Sparkles, Loader2, Heart } from 'lucide-react';

import {
  Button,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  cn,
} from '@clubvantage/ui';

import {
  useGetMemberQuery,
  useUpdateMemberMutation,
  useDeleteMemberMutation,
  useChangeMemberStatusMutation,
  useCreateDependentMutation,
  useUpdateDependentMutation,
  useDeleteDependentMutation,
  useCreateMemberAddressMutation,
  useUpdateMemberAddressMutation,
  useDeleteMemberAddressMutation,
  type MemberStatus as ApiMemberStatus,
  type AddressType,
} from '@clubvantage/api-client';
import { useQueryClient } from '@tanstack/react-query';

// Direct imports to optimize bundle size (avoid barrel imports)
import { MemberDetailHeader } from '@/components/members/member-detail-header';
import { ProfileTab } from '@/components/members/profile-tab';
import { ContractTab } from '@/components/members/contract-tab';
import { DependentsTab } from '@/components/members/dependents-tab';
import { ARHistoryTab } from '@/components/members/ar-history-tab';
import { EngagementTab } from '@/components/members/tabs/engagement-tab';
import { DependentModal } from '@/components/members/dependent-modal';
import { ChargeModal } from '@/components/members/charge-modal';
import { AddressModal, type AddressFormData } from '@/components/members/address-modal';
import { StatusChangeDialog, ConfirmationDialog } from '@/components/members/confirmation-dialog';
import type { Dependent, Charge, MemberStatus, Member, Address } from '@/components/members/types';
import { useMemberTransactions } from '@/hooks/use-billing';

export default function MemberDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const memberId = params.id as string;

  // Fetch member from API
  const { data, isLoading, error, refetch } = useGetMemberQuery(
    { id: memberId },
    { enabled: !!memberId, staleTime: 30000 }
  );

  // Mutations for member operations
  const updateMemberMutation = useUpdateMemberMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['GetMember'] });
      queryClient.invalidateQueries({ queryKey: ['GetMembers'] });
      refetch();
    },
  });

  const deleteMemberMutation = useDeleteMemberMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['GetMembers'] });
      router.push('/members');
    },
  });

  const changeMemberStatusMutation = useChangeMemberStatusMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['GetMember'] });
      queryClient.invalidateQueries({ queryKey: ['GetMembers'] });
      queryClient.invalidateQueries({ queryKey: ['GetMemberStats'] });
      refetch();
    },
  });

  // Dependent mutations
  const createDependentMutation = useCreateDependentMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['GetMember'] });
      setIsDependentModalOpen(false);
      setSelectedDependent(undefined);
      refetch();
    },
  });

  const updateDependentMutation = useUpdateDependentMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['GetMember'] });
      setIsDependentModalOpen(false);
      setSelectedDependent(undefined);
      setDependentActionDialog({ open: false, action: null, dependent: null });
      refetch();
    },
  });

  const deleteDependentMutation = useDeleteDependentMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['GetMember'] });
      setDependentActionDialog({ open: false, action: null, dependent: null });
      refetch();
    },
  });

  // Address mutations
  const createAddressMutation = useCreateMemberAddressMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['GetMember'] });
      setIsAddressModalOpen(false);
      setSelectedAddress(undefined);
      refetch();
    },
    onError: (error) => {
      console.error('Failed to create address:', error);
      // TODO: Show toast notification to user
    },
  });

  const updateAddressMutation = useUpdateMemberAddressMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['GetMember'] });
      setIsAddressModalOpen(false);
      setSelectedAddress(undefined);
      refetch();
    },
    onError: (error) => {
      console.error('Failed to update address:', error);
      // TODO: Show toast notification to user
    },
  });

  const deleteAddressMutation = useDeleteMemberAddressMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['GetMember'] });
      setAddressActionDialog({ open: false, action: null, address: null });
      refetch();
    },
    onError: (error) => {
      console.error('Failed to delete address:', error);
      // TODO: Show toast notification to user
    },
  });

  // Transform API member to component Member type
  const member = useMemo((): Member | undefined => {
    const apiMember = data?.member;
    if (!apiMember) return undefined;

    // Helper to format date to ISO string date part
    const formatDate = (date: string | Date | null | undefined): string => {
      if (!date) return '';
      const isoString = new Date(date).toISOString();
      return isoString.substring(0, 10); // YYYY-MM-DD format
    };

    return {
      id: apiMember.id,
      memberNumber: apiMember.memberId,
      firstName: apiMember.firstName,
      lastName: apiMember.lastName,
      email: apiMember.email ?? '',
      phone: apiMember.phone ?? '',
      photoUrl: apiMember.avatarUrl ?? undefined,
      dateOfBirth: formatDate(apiMember.dateOfBirth),
      nationality: apiMember.nationality ?? '',
      membershipTypeId: apiMember.membershipType?.id ?? '',
      membershipTypeName: apiMember.membershipType?.name ?? '',
      status: apiMember.status as MemberStatus,
      joinDate: formatDate(apiMember.joinDate),
      balance: parseFloat(apiMember.outstandingBalance) || 0,
      autoPay: false, // Not in API yet
      addresses: (apiMember.addresses ?? []).map((addr): Address => ({
        id: addr.id,
        type: addr.type as Address['type'],
        isPrimary: addr.isPrimary,
        label: addr.label ?? '',
        addressLine1: addr.addressLine1,
        addressLine2: addr.addressLine2 ?? undefined,
        subDistrict: addr.subDistrict,
        district: addr.district,
        province: addr.province,
        postalCode: addr.postalCode,
        country: addr.country,
      })),
      dependents: (apiMember.dependents ?? []).map((dep): Dependent => ({
        id: dep.id,
        memberNumber: '', // Dependents don't have member numbers in current API
        firstName: dep.firstName,
        lastName: dep.lastName,
        relationship: dep.relationship as Dependent['relationship'],
        dateOfBirth: formatDate(dep.dateOfBirth),
        email: dep.email ?? undefined,
        phone: dep.phone ?? undefined,
        status: dep.isActive ? 'ACTIVE' : 'INACTIVE',
      })),
      contract: undefined, // Not in API yet - would need separate query
    };
  }, [data]);

  // Get membership type details for max dependents
  const membershipType = useMemo(() => {
    const apiMembershipType = data?.member?.membershipType;
    if (!apiMembershipType) return undefined;

    return {
      id: apiMembershipType.id,
      name: apiMembershipType.name,
      description: apiMembershipType.description ?? '',
      billingCycle: 'MONTHLY' as const,
      monthlyFee: 0,
      entryFee: 0,
      maxDependents: undefined, // Not exposed in current query
    };
  }, [data]);

  // Fetch A/R transactions for this member
  const { transactions: arTransactions } = useMemberTransactions(memberId);

  // State for modals
  const [isDependentModalOpen, setIsDependentModalOpen] = useState(false);
  const [selectedDependent, setSelectedDependent] = useState<Dependent | undefined>();
  const [isChargeModalOpen, setIsChargeModalOpen] = useState(false);
  const [selectedCharge, setSelectedCharge] = useState<Charge | undefined>();
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<Address | undefined>();

  // State for confirmation dialogs
  const [statusChangeDialog, setStatusChangeDialog] = useState<{
    open: boolean;
    newStatus: MemberStatus | null;
  }>({ open: false, newStatus: null });

  const [chargeActionDialog, setChargeActionDialog] = useState<{
    open: boolean;
    action: 'suspend' | 'resume' | 'remove' | null;
    charge: Charge | null;
  }>({ open: false, action: null, charge: null });

  const [contractActionDialog, setContractActionDialog] = useState<{
    open: boolean;
    action: 'end' | 'resume' | null;
  }>({ open: false, action: null });

  const [dependentActionDialog, setDependentActionDialog] = useState<{
    open: boolean;
    action: 'toggle' | 'remove' | null;
    dependent: Dependent | null;
  }>({ open: false, action: null, dependent: null });

  const [addressActionDialog, setAddressActionDialog] = useState<{
    open: boolean;
    action: 'remove' | null;
    address: Address | null;
  }>({ open: false, action: null, address: null });

  // Header Handlers
  const handleEditClick = useCallback(() => {
    // TODO: Navigate to edit page or open edit modal
    router.push(`/members/${memberId}/edit`);
  }, [router, memberId]);

  const handleStatusChange = useCallback((status: MemberStatus) => {
    setStatusChangeDialog({ open: true, newStatus: status });
  }, []);

  const handleConfirmStatusChange = useCallback(async (reason?: string) => {
    if (!statusChangeDialog.newStatus) return;

    // Map component status to API status
    // Component uses: PENDING, ACTIVE, SUSPENDED, INACTIVE, CANCELLED
    // API uses: ACTIVE, SUSPENDED, TERMINATED, RESIGNED, LAPSED, etc.
    const statusMap: Record<MemberStatus, ApiMemberStatus> = {
      PENDING: 'APPLICANT',
      ACTIVE: 'ACTIVE',
      SUSPENDED: 'SUSPENDED',
      INACTIVE: 'LAPSED',
      CANCELLED: 'TERMINATED',
    };

    changeMemberStatusMutation.mutate({
      id: memberId,
      input: {
        status: statusMap[statusChangeDialog.newStatus],
        reason: reason,
      },
    });
    setStatusChangeDialog({ open: false, newStatus: null });
  }, [statusChangeDialog.newStatus, memberId, changeMemberStatusMutation]);

  const handlePhotoUpload = useCallback(() => {
    // TODO: Open file picker and upload photo
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        // TODO: Upload file to server
        console.log('Uploading photo:', file.name);
      }
    };
    input.click();
  }, []);

  const handleBalanceClick = useCallback(() => {
    // Navigate to A/R tab by switching tabs programmatically
    const arTab = document.querySelector('[value="ar-history"]') as HTMLElement;
    arTab?.click();
  }, []);

  // Dependent handlers
  const handleAddDependent = useCallback(() => {
    setSelectedDependent(undefined);
    setIsDependentModalOpen(true);
  }, []);

  const handleEditDependent = useCallback((dependent: Dependent) => {
    setSelectedDependent(dependent);
    setIsDependentModalOpen(true);
  }, []);

  const handleDependentSubmit = useCallback((formData: {
    firstName: string;
    lastName: string;
    relationship: string;
    dateOfBirth: string;
    email?: string;
    phone?: string;
  }) => {
    if (selectedDependent) {
      // Editing existing dependent
      updateDependentMutation.mutate({
        id: selectedDependent.id,
        input: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          relationship: formData.relationship,
          dateOfBirth: formData.dateOfBirth || undefined,
          email: formData.email || undefined,
          phone: formData.phone || undefined,
        },
      });
    } else {
      // Creating new dependent
      createDependentMutation.mutate({
        input: {
          memberId,
          firstName: formData.firstName,
          lastName: formData.lastName,
          relationship: formData.relationship,
          dateOfBirth: formData.dateOfBirth || undefined,
          email: formData.email || undefined,
          phone: formData.phone || undefined,
        },
      });
    }
  }, [selectedDependent, memberId, createDependentMutation, updateDependentMutation]);

  const handleToggleDependentStatus = useCallback((dependent: Dependent) => {
    setDependentActionDialog({ open: true, action: 'toggle', dependent });
  }, []);

  const handleRemoveDependent = useCallback((dependent: Dependent) => {
    setDependentActionDialog({ open: true, action: 'remove', dependent });
  }, []);

  const handleConfirmDependentAction = useCallback(async () => {
    if (!dependentActionDialog.dependent) return;
    const { action, dependent } = dependentActionDialog;

    if (action === 'toggle') {
      // Toggle dependent active status
      updateDependentMutation.mutate({
        id: dependent.id,
        input: {
          isActive: dependent.status !== 'ACTIVE',
        },
      });
    } else if (action === 'remove') {
      // Delete the dependent
      deleteDependentMutation.mutate({ id: dependent.id });
    }
  }, [dependentActionDialog, updateDependentMutation, deleteDependentMutation]);

  // Address handlers
  const handleAddAddress = useCallback(() => {
    setSelectedAddress(undefined);
    setIsAddressModalOpen(true);
  }, []);

  const handleEditAddress = useCallback((addressId: string) => {
    const address = member?.addresses.find((a) => a.id === addressId);
    if (address) {
      setSelectedAddress(address);
      setIsAddressModalOpen(true);
    }
  }, [member?.addresses]);

  const handleAddressSubmit = useCallback((formData: AddressFormData) => {
    if (selectedAddress) {
      // Editing existing address
      updateAddressMutation.mutate({
        id: selectedAddress.id,
        input: {
          label: formData.label || undefined,
          type: formData.type as AddressType,
          addressLine1: formData.addressLine1,
          addressLine2: formData.addressLine2 || undefined,
          subDistrict: formData.subDistrict,
          district: formData.district,
          province: formData.province,
          postalCode: formData.postalCode,
          country: formData.country,
          isPrimary: formData.isPrimary,
        },
      });
    } else {
      // Creating new address
      createAddressMutation.mutate({
        input: {
          memberId,
          label: formData.label || undefined,
          type: formData.type as AddressType,
          addressLine1: formData.addressLine1,
          addressLine2: formData.addressLine2 || undefined,
          subDistrict: formData.subDistrict,
          district: formData.district,
          province: formData.province,
          postalCode: formData.postalCode,
          country: formData.country,
          isPrimary: formData.isPrimary,
        },
      });
    }
  }, [selectedAddress, memberId, createAddressMutation, updateAddressMutation]);

  const handleRemoveAddress = useCallback((addressId: string) => {
    const address = member?.addresses.find((a) => a.id === addressId);
    if (address) {
      setAddressActionDialog({ open: true, action: 'remove', address });
    }
  }, [member?.addresses]);

  const handleSetPrimaryAddress = useCallback((addressId: string) => {
    updateAddressMutation.mutate({
      id: addressId,
      input: {
        isPrimary: true,
      },
    });
  }, [updateAddressMutation]);

  const handleConfirmAddressAction = useCallback(async () => {
    if (!addressActionDialog.address) return;
    const { action, address } = addressActionDialog;

    if (action === 'remove') {
      deleteAddressMutation.mutate({ id: address.id });
    }
  }, [addressActionDialog, deleteAddressMutation]);

  // Charge handlers
  const handleAddCharge = useCallback(() => {
    setSelectedCharge(undefined);
    setIsChargeModalOpen(true);
  }, []);

  const handleEditCharge = useCallback((charge: Charge) => {
    setSelectedCharge(charge);
    setIsChargeModalOpen(true);
  }, []);

  const handleChargeSubmit = useCallback(() => {
    setIsChargeModalOpen(false);
    // TODO: Refresh member data
  }, []);

  const handleSuspendCharge = useCallback((charge: Charge) => {
    setChargeActionDialog({ open: true, action: 'suspend', charge });
  }, []);

  const handleResumeCharge = useCallback((charge: Charge) => {
    setChargeActionDialog({ open: true, action: 'resume', charge });
  }, []);

  const handleRemoveCharge = useCallback((charge: Charge) => {
    setChargeActionDialog({ open: true, action: 'remove', charge });
  }, []);

  const handleConfirmChargeAction = useCallback(async () => {
    if (!chargeActionDialog.charge) return;
    const { action, charge } = chargeActionDialog;

    if (action === 'suspend') {
      // TODO: Call API to suspend charge
      console.log('Suspending charge:', charge.id);
    } else if (action === 'resume') {
      // TODO: Call API to resume charge
      console.log('Resuming charge:', charge.id);
    } else if (action === 'remove') {
      // TODO: Call API to remove charge
      console.log('Removing charge:', charge.id);
    }
    // Refresh member data after action
  }, [chargeActionDialog]);

  // Contract handlers
  const handleEndContract = useCallback(() => {
    setContractActionDialog({ open: true, action: 'end' });
  }, []);

  const handleResumeContract = useCallback(() => {
    setContractActionDialog({ open: true, action: 'resume' });
  }, []);

  const handleConfirmContractAction = useCallback(async () => {
    const { action } = contractActionDialog;

    if (action === 'end') {
      // TODO: Call API to end contract
      console.log('Ending contract for member:', memberId);
    } else if (action === 'resume') {
      // TODO: Call API to resume contract
      console.log('Resuming contract for member:', memberId);
    }
    // Refresh member data after action
  }, [contractActionDialog, memberId]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-4xl">
          <div className="relative overflow-hidden rounded-2xl border border-slate-200/60 bg-white/80 p-12 text-center shadow-xl shadow-slate-200/50 backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-50/50 to-transparent" />
            <div className="relative">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-amber-600" />
              <p className="mt-4 text-lg font-medium text-slate-600">Loading member...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-4xl">
          <div className="relative overflow-hidden rounded-2xl border border-red-200/60 bg-white/80 p-12 text-center shadow-xl shadow-red-200/50 backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-red-50/50 to-transparent" />
            <div className="relative">
              <p className="text-lg font-medium text-red-600">Failed to load member</p>
              <p className="mt-2 text-sm text-red-400">There was an error loading this member. Please try again.</p>
              <Button
                variant="outline"
                className="mt-6 border-slate-300 hover:bg-slate-50"
                onClick={() => router.push('/members')}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Members
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Not found state
  if (!member) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-4xl">
          <div className="relative overflow-hidden rounded-2xl border border-slate-200/60 bg-white/80 p-12 text-center shadow-xl shadow-slate-200/50 backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-50/50 to-transparent" />
            <div className="relative">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                <Sparkles className="h-8 w-8 text-slate-400" />
              </div>
              <p className="text-lg font-medium text-slate-600">Member not found</p>
              <p className="mt-2 text-sm text-slate-400">The member you&apos;re looking for doesn&apos;t exist or has been removed.</p>
              <Button
                variant="outline"
                className="mt-6 border-slate-300 hover:bg-slate-50"
                onClick={() => router.push('/members')}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Members
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50/80">
      {/* Subtle texture overlay */}
      <div className="pointer-events-none fixed inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+CjxyZWN0IHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgZmlsbD0ibm9uZSIvPgo8Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIxIiBmaWxsPSJyZ2JhKDAsIDAsIDAsIDAuMDIpIi8+Cjwvc3ZnPg==')] opacity-50" />

      <div className="relative mx-auto max-w-7xl space-y-4 p-4 sm:space-y-6 sm:p-6 lg:space-y-8 lg:p-8">
        {/* Breadcrumb & Back */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <nav className="flex items-center gap-2 text-sm">
            <button
              onClick={() => router.push('/members')}
              className="text-slate-500 transition-colors hover:text-slate-900"
            >
              Members
            </button>
            <span className="text-slate-300">/</span>
            <span className="font-medium text-slate-900">
              {member.firstName} {member.lastName}
            </span>
          </nav>
          <Button
            variant="outline"
            onClick={() => router.push('/members')}
            size="sm"
            className="w-fit border-slate-200 bg-white/80 shadow-sm backdrop-blur-sm transition-all hover:bg-white hover:shadow-md"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Back to List</span>
            <span className="sm:hidden">Back</span>
          </Button>
        </div>

        {/* Member Header */}
        <MemberDetailHeader
          member={member}
          onEdit={handleEditClick}
          onChangeStatus={handleStatusChange}
          onUploadPhoto={handlePhotoUpload}
          onBalanceClick={handleBalanceClick}
        />

        {/* Tabs Section */}
        <div className="relative">
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="relative mb-6 grid w-full grid-cols-2 gap-1 rounded-xl bg-slate-100/80 p-1.5 backdrop-blur-sm sm:grid-cols-5 lg:w-fit lg:gap-2">
              <TabsTrigger
                value="profile"
                className={cn(
                  "relative rounded-lg px-4 py-2.5 text-sm font-medium transition-all",
                  "text-slate-600 hover:text-slate-900",
                  "data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
                )}
              >
                Profile
              </TabsTrigger>
              <TabsTrigger
                value="contract"
                className={cn(
                  "relative rounded-lg px-4 py-2.5 text-sm font-medium transition-all",
                  "text-slate-600 hover:text-slate-900",
                  "data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
                )}
              >
                Contract
              </TabsTrigger>
              <TabsTrigger
                value="dependents"
                className={cn(
                  "relative rounded-lg px-4 py-2.5 text-sm font-medium transition-all",
                  "text-slate-600 hover:text-slate-900",
                  "data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
                )}
              >
                <span className="hidden sm:inline">Dependents</span>
                <span className="sm:hidden">Family</span>
                <span className="ml-1.5 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-slate-200/80 px-1.5 text-xs font-semibold text-slate-600">
                  {member.dependents.length}
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="ar-history"
                className={cn(
                  "relative rounded-lg px-4 py-2.5 text-sm font-medium transition-all",
                  "text-slate-600 hover:text-slate-900",
                  "data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
                )}
              >
                <span className="hidden sm:inline">Billing History</span>
                <span className="sm:hidden">Billing</span>
              </TabsTrigger>
              <TabsTrigger
                value="engagement"
                className={cn(
                  "relative rounded-lg px-4 py-2.5 text-sm font-medium transition-all",
                  "text-slate-600 hover:text-slate-900",
                  "data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
                )}
              >
                <Heart className="mr-1.5 h-4 w-4" />
                <span className="hidden sm:inline">Engagement</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
              <ProfileTab
                member={member}
                onEditPersonalInfo={handleEditClick}
                onAddAddress={handleAddAddress}
                onEditAddress={handleEditAddress}
                onRemoveAddress={handleRemoveAddress}
                onSetPrimaryAddress={handleSetPrimaryAddress}
              />
            </TabsContent>

            <TabsContent value="contract" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
              <ContractTab
                member={member}
                membershipType={membershipType}
                onAddCharge={handleAddCharge}
                onEditCharge={handleEditCharge}
                onSuspendCharge={handleSuspendCharge}
                onResumeCharge={handleResumeCharge}
                onRemoveCharge={handleRemoveCharge}
                onEndContract={handleEndContract}
                onResumeContract={handleResumeContract}
              />
            </TabsContent>

            <TabsContent value="dependents" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
              <DependentsTab
                member={member}
                maxDependents={membershipType?.maxDependents}
                onAddDependent={handleAddDependent}
                onEditDependent={handleEditDependent}
                onToggleDependentStatus={handleToggleDependentStatus}
                onRemoveDependent={handleRemoveDependent}
              />
            </TabsContent>

            <TabsContent value="ar-history" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
              <ARHistoryTab member={member} transactions={arTransactions} />
            </TabsContent>

            <TabsContent value="engagement" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
              <EngagementTab member={member} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Dependent Modal */}
        <DependentModal
          open={isDependentModalOpen}
          onOpenChange={setIsDependentModalOpen}
          dependent={selectedDependent}
          onSubmit={handleDependentSubmit}
          isLoading={createDependentMutation.isPending || updateDependentMutation.isPending}
        />

        {/* Charge Modal */}
        <ChargeModal
          open={isChargeModalOpen}
          onOpenChange={setIsChargeModalOpen}
          charge={selectedCharge}
          onSubmit={handleChargeSubmit}
        />

        {/* Address Modal */}
        <AddressModal
          open={isAddressModalOpen}
          onOpenChange={setIsAddressModalOpen}
          address={selectedAddress}
          onSubmit={handleAddressSubmit}
          isLoading={createAddressMutation.isPending || updateAddressMutation.isPending}
          isFirstAddress={member.addresses.length === 0 && !selectedAddress}
        />

        {/* Status Change Confirmation */}
        {member && statusChangeDialog.newStatus && (
          <StatusChangeDialog
            open={statusChangeDialog.open}
            onOpenChange={(open) => setStatusChangeDialog((prev) => ({ ...prev, open }))}
            memberName={`${member.firstName} ${member.lastName}`}
            currentStatus={member.status}
            newStatus={statusChangeDialog.newStatus}
            onConfirm={handleConfirmStatusChange}
          />
        )}

        {/* Charge Action Confirmation */}
        {chargeActionDialog.charge && (
          <ConfirmationDialog
            open={chargeActionDialog.open}
            onOpenChange={(open) => setChargeActionDialog((prev) => ({ ...prev, open }))}
            title={
              chargeActionDialog.action === 'suspend' ? 'Suspend Charge' :
              chargeActionDialog.action === 'resume' ? 'Resume Charge' :
              'Remove Charge'
            }
            description={
              chargeActionDialog.action === 'suspend'
                ? `Are you sure you want to suspend the charge "${chargeActionDialog.charge.name}"? It will not be billed until resumed.`
                : chargeActionDialog.action === 'resume'
                ? `Are you sure you want to resume the charge "${chargeActionDialog.charge.name}"? Billing will continue from the next cycle.`
                : `Are you sure you want to remove the charge "${chargeActionDialog.charge.name}"? This action cannot be undone.`
            }
            variant={chargeActionDialog.action === 'remove' ? 'danger' : 'warning'}
            confirmLabel={
              chargeActionDialog.action === 'suspend' ? 'Suspend' :
              chargeActionDialog.action === 'resume' ? 'Resume' :
              'Remove'
            }
            onConfirm={handleConfirmChargeAction}
          />
        )}

        {/* Contract Action Confirmation */}
        <ConfirmationDialog
          open={contractActionDialog.open}
          onOpenChange={(open) => setContractActionDialog((prev) => ({ ...prev, open }))}
          title={contractActionDialog.action === 'end' ? 'End Contract' : 'Resume Contract'}
          description={
            contractActionDialog.action === 'end'
              ? `Are you sure you want to end ${member.firstName}'s contract? This will change their status to cancelled and stop all recurring charges.`
              : `Are you sure you want to resume ${member.firstName}'s contract? This will reactivate their membership and restart recurring charges.`
          }
          variant={contractActionDialog.action === 'end' ? 'danger' : 'success'}
          confirmLabel={contractActionDialog.action === 'end' ? 'End Contract' : 'Resume Contract'}
          onConfirm={handleConfirmContractAction}
        />

        {/* Dependent Action Confirmation */}
        {dependentActionDialog.dependent && (
          <ConfirmationDialog
            open={dependentActionDialog.open}
            onOpenChange={(open) => setDependentActionDialog((prev) => ({ ...prev, open }))}
            title={
              dependentActionDialog.action === 'toggle'
                ? (dependentActionDialog.dependent.status === 'ACTIVE' ? 'Deactivate Dependent' : 'Activate Dependent')
                : 'Remove Dependent'
            }
            description={
              dependentActionDialog.action === 'toggle'
                ? dependentActionDialog.dependent.status === 'ACTIVE'
                  ? `Are you sure you want to deactivate ${dependentActionDialog.dependent.firstName}? They will lose access to club facilities.`
                  : `Are you sure you want to activate ${dependentActionDialog.dependent.firstName}? They will gain access to club facilities.`
                : `Are you sure you want to remove ${dependentActionDialog.dependent.firstName} from this membership? This action cannot be undone.`
            }
            variant={
              dependentActionDialog.action === 'remove' ? 'danger' :
              dependentActionDialog.dependent.status === 'ACTIVE' ? 'warning' : 'success'
            }
            confirmLabel={
              dependentActionDialog.action === 'toggle'
                ? (dependentActionDialog.dependent.status === 'ACTIVE' ? 'Deactivate' : 'Activate')
                : 'Remove'
            }
            onConfirm={handleConfirmDependentAction}
          />
        )}

        {/* Address Action Confirmation */}
        {addressActionDialog.address && (
          <ConfirmationDialog
            open={addressActionDialog.open}
            onOpenChange={(open) => setAddressActionDialog((prev) => ({ ...prev, open }))}
            title="Remove Address"
            description={`Are you sure you want to remove this address? This action cannot be undone.`}
            variant="danger"
            confirmLabel="Remove"
            onConfirm={handleConfirmAddressAction}
          />
        )}
      </div>
    </div>
  );
}
